// services/CrossChainSwapService.ts
// Cross-chain swap orchestration between Ethereum and Sui with Fusion+ integration

import { ethers } from 'ethers';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromHEX } from '@mysten/sui.js/utils';

export interface CrossChainSwapParams {
  fromChain: 'ethereum' | 'sui';
  toChain: 'ethereum' | 'sui';
  fromToken: string;
  toToken: string;
  amount: string;
  recipient: string;
  userAddress: string;
  timelock?: number; // Optional, defaults to 2 hours
}

export interface SwapOrder {
  orderId: string;
  fromChain: 'ethereum' | 'sui';
  toChain: 'ethereum' | 'sui';
  fromToken: string;
  toToken: string;
  amount: string;
  recipient: string;
  hashlock: string;
  secret: string;
  timelock: number;
  status: 'pending' | 'locked' | 'withdrawn' | 'refunded' | 'expired';
  ethOrderId?: string;
  suiOrderId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SwapQuote {
  fromAmount: string;
  toAmount: string;
  rate: number;
  priceImpact: number;
  estimatedTime: number; // in minutes
  fees: {
    networkFee: string;
    bridgeFee: string;
    fusionPlusFee: string;
    total: string;
  };
  route: string[];
}

export class CrossChainSwapService {
  private ethProvider: ethers.JsonRpcProvider;
  private suiClient: SuiClient;
  private htlcContractAddress: string;
  private htlcContractABI: ethers.InterfaceAbi;
  private suiPackageId: string;
  private fusionPlusService: any;

  constructor(config: {
    ethRpcUrl: string;
    suiRpcUrl: string;
    htlcContractAddress: string;
    htlcContractABI: ethers.InterfaceAbi;
    suiPackageId: string;
    fusionPlusService: any;
  }) {
    this.ethProvider = new ethers.JsonRpcProvider(config.ethRpcUrl);
    this.suiClient = new SuiClient({ url: config.suiRpcUrl });
    this.htlcContractAddress = config.htlcContractAddress;
    this.htlcContractABI = config.htlcContractABI;
    this.suiPackageId = config.suiPackageId;
    this.fusionPlusService = config.fusionPlusService;
  }

  /**
   * Get quote for cross-chain swap
   */
  async getSwapQuote(params: CrossChainSwapParams): Promise<SwapQuote> {
    try {
      // Get quotes from both chains and 1inch
      const [ethQuote, suiQuote] = await Promise.all([
        this.getEthereumQuote(params),
        this.getSuiQuote(params)
      ]);

      // Calculate optimal route and pricing
      const quote = this.calculateOptimalRoute(ethQuote, suiQuote, params);
      return quote;
    } catch (error) {
      console.error('Failed to get swap quote:', error);
      throw new Error('Failed to get swap quote');
    }
  }

  /**
   * Initiate cross-chain swap
   */
  async initiateSwap(
    params: CrossChainSwapParams,
    signer: ethers.Signer | any
  ): Promise<SwapOrder> {
    const secret = this.generateSecret();
    const hashlock = ethers.keccak256(ethers.toUtf8Bytes(secret));
    const timelock = params.timelock || Math.floor(Date.now() / 1000) + (2 * 3600); // 2 hours

    const orderId = this.generateOrderId(params, hashlock, timelock);

    const order: SwapOrder = {
      orderId,
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: params.fromToken,
      toToken: params.toToken,
      amount: params.amount,
      recipient: params.recipient,
      hashlock,
      secret,
      timelock,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      if (params.fromChain === 'ethereum') {
        order.ethOrderId = await this.createEthereumHTLC(order, signer);
        order.suiOrderId = await this.createSuiHTLC(order, signer);
      } else {
        order.suiOrderId = await this.createSuiHTLC(order, signer);
        order.ethOrderId = await this.createEthereumHTLC(order, signer);
      }

      order.status = 'locked';
      order.updatedAt = Date.now();

      // Start monitoring
      this.monitorSwap(order);

      return order;
    } catch (error) {
      console.error('Failed to initiate swap:', error);
      throw new Error('Failed to initiate cross-chain swap');
    }
  }

  /**
   * Execute swap withdrawal
   */
  async executeSwap(order: SwapOrder, signer: ethers.Signer | any): Promise<void> {
    try {
      if (order.toChain === 'ethereum') {
        await this.withdrawFromEthereum(order, signer);
      } else {
        await this.withdrawFromSui(order, signer);
      }

      order.status = 'withdrawn';
      order.updatedAt = Date.now();
    } catch (error) {
      console.error('Failed to execute swap:', error);
      throw new Error('Failed to execute swap withdrawal');
    }
  }

  /**
   * Refund expired order
   */
  async refundOrder(order: SwapOrder, signer: ethers.Signer | any): Promise<void> {
    try {
      if (order.fromChain === 'ethereum') {
        await this.refundFromEthereum(order, signer);
      } else {
        await this.refundFromSui(order, signer);
      }

      order.status = 'refunded';
      order.updatedAt = Date.now();
    } catch (error) {
      console.error('Failed to refund order:', error);
      throw new Error('Failed to refund order');
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<SwapOrder | null> {
    // Implementation would fetch from database or contract state
    // This is a placeholder that would be connected to your data layer
    return null;
  }

  /**
   * Monitor swap progress
   */
  private async monitorSwap(order: SwapOrder): Promise<void> {
    const checkInterval = 30000; // 30 seconds
    const maxChecks = 240; // 2 hours
    let checks = 0;

    const monitor = setInterval(async () => {
      checks++;
      
      try {
        const ethStatus = await this.checkEthereumHTLCStatus(order.ethOrderId!);
        const suiStatus = await this.checkSuiHTLCStatus(order.suiOrderId!);

        // Check if both HTLCs are created and ready
        if (ethStatus.created && suiStatus.created && order.status === 'pending') {
          order.status = 'locked';
          order.updatedAt = Date.now();
        }

        // Check if timelock expired
        if (Date.now() / 1000 > order.timelock) {
          order.status = 'expired';
          order.updatedAt = Date.now();
          clearInterval(monitor);
          return;
        }

        // Check if swap completed
        if (ethStatus.withdrawn || suiStatus.withdrawn) {
          order.status = 'withdrawn';
          order.updatedAt = Date.now();
          clearInterval(monitor);
          return;
        }

        // Stop monitoring after max checks
        if (checks >= maxChecks) {
          clearInterval(monitor);
        }
      } catch (error) {
        console.error('Error monitoring swap:', error);
      }
    }, checkInterval);
  }

  /**
   * Create Ethereum HTLC
   */
  private async createEthereumHTLC(order: SwapOrder, signer: ethers.Signer): Promise<string> {
    const contract = new ethers.Contract(this.htlcContractAddress, this.htlcContractABI, signer);
    
    const isETH = order.fromToken === ethers.ZeroAddress;
    const amount = ethers.parseEther(order.amount);

    const tx = await contract.createHTLC(
      order.recipient,
      order.fromToken,
      amount,
      order.hashlock,
      order.timelock,
      ethers.keccak256(ethers.toUtf8Bytes(order.suiOrderId || '')),
      {
        value: isETH ? amount : 0
      }
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.eventName === 'HTLCCreated');
    return event?.args?.orderId || tx.hash;
  }

  /**
   * Create Sui HTLC
   */
  private async createSuiHTLC(order: SwapOrder, signer: any): Promise<string> {
    const tx = new TransactionBlock();
    
    // Get coin to lock
    const [coin] = tx.splitCoins(tx.gas, [parseInt(order.amount)]);
    
    tx.moveCall({
      target: `${this.suiPackageId}::htlc::create_htlc_order`,
      arguments: [
        coin,
        tx.pure(order.recipient),
        tx.pure(Array.from(fromHEX(order.hashlock.slice(2)))),
        tx.pure(order.timelock * 1000), // Convert to milliseconds
        tx.pure(Array.from(ethers.toUtf8Bytes(order.ethOrderId || ''))),
        tx.object('0x6') // Clock object
      ],
      typeArguments: ['0x2::sui::SUI']
    });

    const result = await this.suiClient.signAndExecuteTransactionBlock({
      signer,
      transactionBlock: tx
    });

    return result.digest;
  }

  /**
   * Withdraw from Ethereum HTLC
   */
  private async withdrawFromEthereum(order: SwapOrder, signer: ethers.Signer): Promise<void> {
    const contract = new ethers.Contract(this.htlcContractAddress, this.htlcContractABI, signer);
    
    const tx = await contract.withdraw(
      order.ethOrderId,
      ethers.toUtf8Bytes(order.secret),
      0 // Full withdrawal
    );

    await tx.wait();
  }

  /**
   * Withdraw from Sui HTLC
   */
  private async withdrawFromSui(order: SwapOrder, signer: any): Promise<void> {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${this.suiPackageId}::htlc::withdraw`,
      arguments: [
        tx.object(order.suiOrderId!),
        tx.pure(Array.from(ethers.toUtf8Bytes(order.secret))),
        tx.object('0x6') // Clock object
      ],
      typeArguments: ['0x2::sui::SUI']
    });

    await this.suiClient.signAndExecuteTransactionBlock({
      signer,
      transactionBlock: tx
    });
  }

  /**
   * Refund from Ethereum HTLC
   */
  private async refundFromEthereum(order: SwapOrder, signer: ethers.Signer): Promise<void> {
    const contract = new ethers.Contract(this.htlcContractAddress, this.htlcContractABI, signer);
    
    const tx = await contract.refund(order.ethOrderId);
    await tx.wait();
  }

  /**
   * Refund from Sui HTLC
   */
  private async refundFromSui(order: SwapOrder, signer: any): Promise<void> {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${this.suiPackageId}::htlc::refund`,
      arguments: [
        tx.object(order.suiOrderId!),
        tx.object('0x6') // Clock object
      ],
      typeArguments: ['0x2::sui::SUI']
    });

    await this.suiClient.signAndExecuteTransactionBlock({
      signer,
      transactionBlock: tx
    });
  }

  /**
   * Check Ethereum HTLC status
   */
  private async checkEthereumHTLCStatus(orderId: string): Promise<any> {
    const contract = new ethers.Contract(this.htlcContractAddress, this.htlcContractABI, this.ethProvider);
    
    try {
      const orderInfo = await contract.getOrderInfo(orderId);
      return {
        created: orderInfo.initiator !== ethers.ZeroAddress,
        withdrawn: orderInfo.withdrawn,
        refunded: orderInfo.refunded,
        timelock: orderInfo.timelock
      };
    } catch (error) {
      return { created: false, withdrawn: false, refunded: false, timelock: 0 };
    }
  }

  /**
   * Check Sui HTLC status
   */
  private async checkSuiHTLCStatus(orderId: string): Promise<any> {
    try {
      const object = await this.suiClient.getObject({
        id: orderId,
        options: { showContent: true }
      });

      if (object.data?.content && 'fields' in object.data.content) {
        const fields = object.data.content.fields as any;
        return {
          created: true,
          withdrawn: fields.withdrawn,
          refunded: fields.refunded,
          timelock: fields.timelock
        };
      }

      return { created: false, withdrawn: false, refunded: false, timelock: 0 };
    } catch (error) {
      return { created: false, withdrawn: false, refunded: false, timelock: 0 };
    }
  }

  /**
   * Get Ethereum quote via 1inch
   */
  private async getEthereumQuote(params: CrossChainSwapParams): Promise<any> {
    // Integration with 1inch API for Ethereum quotes
    return {
      amount: params.amount,
      estimatedGas: '0.01',
      priceImpact: 0.1
    };
  }

  /**
   * Get Sui quote
   */
  private async getSuiQuote(params: CrossChainSwapParams): Promise<any> {
    // Integration with Sui DEX for quotes
    return {
      amount: params.amount,
      estimatedGas: '0.001',
      priceImpact: 0.05
    };
  }

  /**
   * Calculate optimal route
   */
  private calculateOptimalRoute(ethQuote: any, suiQuote: any, params: CrossChainSwapParams): SwapQuote {
    const rate = parseFloat(params.amount) / parseFloat(params.amount); // Simplified
    
    return {
      fromAmount: params.amount,
      toAmount: params.amount, // Simplified 1:1 for demo
      rate,
      priceImpact: 0.1,
      estimatedTime: 15, // 15 minutes
      fees: {
        networkFee: '0.01',
        bridgeFee: '0.005',
        fusionPlusFee: '0.003',
        total: '0.018'
      },
      route: [params.fromChain, params.toChain]
    };
  }

  /**
   * Generate secure random secret
   */
  private generateSecret(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Node.js fallback
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return '0x' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate unique order ID
   */
  private generateOrderId(params: CrossChainSwapParams, hashlock: string, timelock: number): string {
    return ethers.keccak256(ethers.toUtf8Bytes(
      `${params.fromChain}-${params.toChain}-${params.amount}-${hashlock}-${timelock}-${Date.now()}`
    ));
  }

  /**
   * Validate swap parameters
   */
  validateSwapParams(params: CrossChainSwapParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!['ethereum', 'sui'].includes(params.fromChain)) {
      errors.push('Invalid source chain');
    }

    if (!['ethereum', 'sui'].includes(params.toChain)) {
      errors.push('Invalid destination chain');
    }

    if (params.fromChain === params.toChain) {
      errors.push('Source and destination chains must be different');
    }

    if (!params.amount || parseFloat(params.amount) <= 0) {
      errors.push('Invalid amount');
    }

    if (!ethers.isAddress(params.recipient)) {
      errors.push('Invalid recipient address');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get supported token pairs
   */
  getSupportedTokenPairs(): Array<{
    fromChain: string;
    toChain: string;
    fromToken: string;
    toToken: string;
    symbol: string;
  }> {
    return [
      {
        fromChain: 'ethereum',
        toChain: 'sui',
        fromToken: ethers.ZeroAddress,
        toToken: '0x2::sui::SUI',
        symbol: 'ETH → SUI'
      },
      {
        fromChain: 'sui',
        toChain: 'ethereum',
        fromToken: '0x2::sui::SUI',
        toToken: ethers.ZeroAddress,
        symbol: 'SUI → ETH'
      },
      {
        fromChain: 'ethereum',
        toChain: 'sui',
        fromToken: '0xA0b86a33E6441b9c0Ec4AD851c1e4Ec3C02Db0b2', // USDC
        toToken: '0x2::sui::SUI',
        symbol: 'USDC → SUI'
      }
    ];
  }
}

// Factory function for easy service creation
export function createCrossChainSwapService(config: {
  ethRpcUrl?: string;
  suiRpcUrl?: string;
  htlcContractAddress?: string;
  htlcContractABI?: ethers.InterfaceAbi;
  suiPackageId?: string;
  fusionPlusService?: any;
}): CrossChainSwapService {
  const defaultConfig = {
    ethRpcUrl: config.ethRpcUrl || 'https://eth-sepolia.g.alchemy.com/v2/your-api-key',
    suiRpcUrl: config.suiRpcUrl || getFullnodeUrl('testnet'),
    htlcContractAddress: config.htlcContractAddress || '0x0000000000000000000000000000000000000000',
    htlcContractABI: config.htlcContractABI || [],
    suiPackageId: config.suiPackageId || '0x0000000000000000000000000000000000000000000000000000000000000000',
    fusionPlusService: config.fusionPlusService
  };

  return new CrossChainSwapService(defaultConfig);
}
