import { useState, useCallback } from 'react';
import { ethers, Contract, Signer } from 'ethers';
import type { 
  AdvancedOrderType, 
  TWAPOrderParams, 
  DCAOrderParams, 
  OptionOrderParams, 
  GridTradingOrderParams,
  ConcentratedLiquidityParams,
  OrderStatus
} from '../types/advanced-strategies';

// Contract ABI (simplified for key functions)
const ADVANCED_STRATEGY_ABI = [
  "function createTWAPOrder(address tokenIn, address tokenOut, uint256 totalAmount, uint256 intervals, uint256 intervalDuration, uint256 minPricePerToken, uint256 maxPricePerToken, bytes32 suiOrderHash) external returns (bytes32)",
  "function executeTWAPInterval(bytes32 orderHash, uint256 amountOut) external",
  "function createDCAOrder(address tokenIn, address tokenOut, uint256 totalAmount, uint256 frequency, uint256 amountPerExecution, uint256 maxSlippage) external returns (bytes32)",
  "function executeDCAOrder(bytes32 orderHash, uint256 amountOut) external",
  "function createOptionOrder(address underlying, uint256 strikePrice, uint256 premium, uint256 expiry, bool isCall, uint256 collateralAmount) external returns (bytes32)",
  "function exerciseOption(bytes32 orderHash, uint256 currentPrice) external payable",
  "function createGridTradingOrder(address tokenIn, address tokenOut, uint256 totalAmount, uint256 gridLevels, uint256 priceStep, uint256 basePrice) external returns (bytes32)",
  "function executeGridOrder(bytes32 orderHash, uint256 gridLevel, uint256 amountOut) external",
  "function createConcentratedLiquidityPosition(address token0, address token1, uint256 amount0, uint256 amount1, uint256 minPrice, uint256 maxPrice, uint256 fee) external returns (bytes32)",
  "function removeLiquidityPosition(bytes32 positionHash, uint256 liquidity) external",
  "function getOrderStatus(bytes32 orderHash, uint8 orderType) external view returns (bool isActive, uint256 executedAmount, uint256 totalAmount)",
  "function getUserTWAPOrders(address user) external view returns (bytes32[])",
  "function getUserDCAOrders(address user) external view returns (bytes32[])",
  "function getUserOptionOrders(address user) external view returns (bytes32[])",
  "function getUserGridOrders(address user) external view returns (bytes32[])",
  "function getUserLiquidityPositions(address user) external view returns (bytes32[])",
  "event TWAPOrderCreated(bytes32 indexed orderHash, address indexed maker, uint256 totalAmount)",
  "event DCAOrderCreated(bytes32 indexed orderHash, address indexed maker)",
  "event OptionOrderCreated(bytes32 indexed orderHash, address indexed maker, uint256 strikePrice)"
];

export interface UseAdvancedLimitOrderStrategiesReturn {
  // Contract management
  contract: Contract | null;
  initializeContract: (contractAddress: string, signer: Signer) => void;
  
  // Order creation functions
  createTWAPOrder: (params: TWAPOrderParams) => Promise<string>;
  createDCAOrder: (params: DCAOrderParams) => Promise<string>;
  createOptionOrder: (params: OptionOrderParams) => Promise<string>;
  createGridTradingOrder: (params: GridTradingOrderParams) => Promise<string>;
  createConcentratedLiquidityPosition: (params: ConcentratedLiquidityParams) => Promise<string>;
  
  // Order execution functions
  executeTWAPInterval: (orderHash: string, amountOut: string) => Promise<void>;
  executeDCAOrder: (orderHash: string, amountOut: string) => Promise<void>;
  exerciseOption: (orderHash: string, currentPrice: string) => Promise<void>;
  executeGridOrder: (orderHash: string, gridLevel: number, amountOut: string) => Promise<void>;
  removeLiquidityPosition: (positionHash: string, liquidity: string) => Promise<void>;
  
  // Order management
  getUserOrders: (orderType: AdvancedOrderType) => Promise<string[]>;
  getOrderStatus: (orderHash: string, orderType: AdvancedOrderType) => Promise<OrderStatus>;
  
  // State
  userOrders: Record<AdvancedOrderType, string[]>;
  loading: boolean;
  error: string | null;
  
  // Utilities
  refreshUserOrders: () => Promise<void>;
  clearError: () => void;
}

export const useAdvancedLimitOrderStrategies = (): UseAdvancedLimitOrderStrategiesReturn => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [userOrders, setUserOrders] = useState<Record<AdvancedOrderType, string[]>>({
    TWAP: [],
    DCA: [],
    OPTION: [],
    GRID: [],
    LIQUIDITY: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeContract = useCallback((contractAddress: string, signer: Signer) => {
    try {
      const contractInstance = new ethers.Contract(contractAddress, ADVANCED_STRATEGY_ABI, signer);
      setContract(contractInstance);
      setError(null);
    } catch (err) {
      setError(`Failed to initialize contract: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const createTWAPOrder = useCallback(async (params: TWAPOrderParams): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.createTWAPOrder(
        params.tokenIn,
        params.tokenOut,
        ethers.parseUnits(params.totalAmount, 18),
        params.intervals,
        params.intervalDuration,
        ethers.parseUnits(params.minPricePerToken, 18),
        ethers.parseUnits(params.maxPricePerToken, 18),
        params.suiOrderHash || ethers.ZeroHash
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find((log: ethers.Log) => 
        log.topics[0] === contract.interface.getEventTopic('TWAPOrderCreated')
      );
      
      if (event) {
        const decoded = contract.interface.decodeEventLog('TWAPOrderCreated', event.data, event.topics);
        return decoded.orderHash;
      }
      
      throw new Error('Order creation event not found');
    } catch (err) {
      setError(`Failed to create TWAP order: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const createDCAOrder = useCallback(async (params: DCAOrderParams): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.createDCAOrder(
        params.tokenIn,
        params.tokenOut,
        ethers.parseUnits(params.totalAmount, 18),
        params.frequency,
        ethers.parseUnits(params.amountPerExecution, 18),
        params.maxSlippage
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find((log: ethers.Log) => 
        log.topics[0] === contract.interface.getEventTopic('DCAOrderCreated')
      );
      
      if (event) {
        const decoded = contract.interface.decodeEventLog('DCAOrderCreated', event.data, event.topics);
        return decoded.orderHash;
      }
      
      throw new Error('Order creation event not found');
    } catch (err) {
      setError(`Failed to create DCA order: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const createOptionOrder = useCallback(async (params: OptionOrderParams): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.createOptionOrder(
        params.underlying,
        ethers.parseUnits(params.strikePrice, 18),
        ethers.parseEther(params.premium),
        params.expiry,
        params.isCall,
        ethers.parseUnits(params.collateralAmount, 18)
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find((log: ethers.Log) => 
        log.topics[0] === contract.interface.getEventTopic('OptionOrderCreated')
      );
      
      if (event) {
        const decoded = contract.interface.decodeEventLog('OptionOrderCreated', event.data, event.topics);
        return decoded.orderHash;
      }
      
      throw new Error('Order creation event not found');
    } catch (err) {
      setError(`Failed to create option order: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const createGridTradingOrder = useCallback(async (params: GridTradingOrderParams): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.createGridTradingOrder(
        params.tokenIn,
        params.tokenOut,
        ethers.parseUnits(params.totalAmount, 18),
        params.gridLevels,
        ethers.parseUnits(params.priceStep, 18),
        ethers.parseUnits(params.basePrice, 18)
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find((log: ethers.Log) => 
        log.topics[0] === contract.interface.getEventTopic('GridOrderCreated')
      );
      
      if (event) {
        const decoded = contract.interface.decodeEventLog('GridOrderCreated', event.data, event.topics);
        return decoded.orderHash;
      }
      
      throw new Error('Order creation event not found');
    } catch (err) {
      setError(`Failed to create grid trading order: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const createConcentratedLiquidityPosition = useCallback(async (params: ConcentratedLiquidityParams): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.createConcentratedLiquidityPosition(
        params.token0,
        params.token1,
        ethers.parseUnits(params.amount0, 18),
        ethers.parseUnits(params.amount1, 18),
        ethers.parseUnits(params.minPrice, 18),
        ethers.parseUnits(params.maxPrice, 18),
        params.fee
      );
      
      const receipt = await tx.wait();
      // Note: Need to add LiquidityPositionCreated event to ABI
      return receipt.hash;
    } catch (err) {
      setError(`Failed to create liquidity position: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const executeTWAPInterval = useCallback(async (orderHash: string, amountOut: string): Promise<void> => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.executeTWAPInterval(orderHash, ethers.parseUnits(amountOut, 18));
      await tx.wait();
    } catch (err) {
      setError(`Failed to execute TWAP interval: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const executeDCAOrder = useCallback(async (orderHash: string, amountOut: string): Promise<void> => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.executeDCAOrder(orderHash, ethers.parseUnits(amountOut, 18));
      await tx.wait();
    } catch (err) {
      setError(`Failed to execute DCA order: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const exerciseOption = useCallback(async (orderHash: string, currentPrice: string): Promise<void> => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.exerciseOption(orderHash, ethers.parseUnits(currentPrice, 18));
      await tx.wait();
    } catch (err) {
      setError(`Failed to exercise option: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const executeGridOrder = useCallback(async (orderHash: string, gridLevel: number, amountOut: string): Promise<void> => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.executeGridOrder(orderHash, gridLevel, ethers.parseUnits(amountOut, 18));
      await tx.wait();
    } catch (err) {
      setError(`Failed to execute grid order: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const removeLiquidityPosition = useCallback(async (positionHash: string, liquidity: string): Promise<void> => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.removeLiquidityPosition(positionHash, ethers.parseUnits(liquidity, 18));
      await tx.wait();
    } catch (err) {
      setError(`Failed to remove liquidity position: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const getUserOrders = useCallback(async (orderType: AdvancedOrderType): Promise<string[]> => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const signer = contract.runner as Signer;
      const address = await signer.getAddress();
      
      switch (orderType) {
        case 'TWAP':
          return await contract.getUserTWAPOrders(address);
        case 'DCA':
          return await contract.getUserDCAOrders(address);
        case 'OPTION':
          return await contract.getUserOptionOrders(address);
        case 'GRID':
          return await contract.getUserGridOrders(address);
        case 'LIQUIDITY':
          return await contract.getUserLiquidityPositions(address);
        default:
          return [];
      }
    } catch (err) {
      setError(`Failed to get user orders: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return [];
    }
  }, [contract]);

  const getOrderStatus = useCallback(async (orderHash: string, orderType: AdvancedOrderType): Promise<OrderStatus> => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const orderTypeMap = {
        TWAP: 0,
        DCA: 1,
        OPTION: 2,
        GRID: 3,
        LIQUIDITY: 4
      };
      
      const [isActive, executedAmount, totalAmount] = await contract.getOrderStatus(
        orderHash, 
        orderTypeMap[orderType]
      );
      
      return {
        isActive,
        executedAmount: ethers.formatUnits(executedAmount, 18),
        totalAmount: ethers.formatUnits(totalAmount, 18),
        progress: totalAmount > 0 ? Number(executedAmount) / Number(totalAmount) : 0
      };
    } catch (err) {
      setError(`Failed to get order status: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }, [contract]);

  const refreshUserOrders = useCallback(async (): Promise<void> => {
    if (!contract) return;
    
    setLoading(true);
    try {
      const newUserOrders: Record<AdvancedOrderType, string[]> = {
        TWAP: [],
        DCA: [],
        OPTION: [],
        GRID: [],
        LIQUIDITY: []
      };
      
      for (const orderType of Object.keys(newUserOrders) as AdvancedOrderType[]) {
        newUserOrders[orderType] = await getUserOrders(orderType);
      }
      
      setUserOrders(newUserOrders);
    } catch (err) {
      setError(`Failed to refresh user orders: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [contract, getUserOrders]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    contract,
    initializeContract,
    createTWAPOrder,
    createDCAOrder,
    createOptionOrder,
    createGridTradingOrder,
    createConcentratedLiquidityPosition,
    executeTWAPInterval,
    executeDCAOrder,
    exerciseOption,
    executeGridOrder,
    removeLiquidityPosition,
    getUserOrders,
    getOrderStatus,
    userOrders,
    loading,
    error,
    refreshUserOrders,
    clearError
  };
};
