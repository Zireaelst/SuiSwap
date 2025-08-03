import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';

// Type definitions
interface TWAPOrder {
  orderHash: string;
  maker?: string;
  tokenIn?: string;
  tokenOut?: string;
  totalAmount?: string;
  executedAmount?: string;
  intervals?: number;
  intervalDuration?: number;
  isActive?: boolean;
}

interface OptionOrder {
  orderHash: string;
  maker?: string;
  underlying?: string;
  strikePrice?: string;
  premium?: string;
  expiry?: number;
  isCall?: boolean;
  isExecuted?: boolean;
  collateralAmount?: string;
}

interface DCAOrder {
  orderHash: string;
  maker?: string;
  tokenIn?: string;
  tokenOut?: string;
  totalAmount?: string;
  executedAmount?: string;
  frequency?: number;
  amountPerExecution?: string;
  isActive?: boolean;
}

interface GridOrder {
  orderHash: string;
  maker?: string;
  baseToken?: string;
  quoteToken?: string;
  gridLevels?: number;
  priceStep?: string;
  basePrice?: string;
  amountPerGrid?: string;
  executedGrids?: number;
  isActive?: boolean;
}

interface ConcentratedLiquidityPosition {
  positionHash: string;
  provider?: string;
  token0?: string;
  token1?: string;
  amount0?: string;
  amount1?: string;
  lowerTick?: number;
  upperTick?: number;
  isActive?: boolean;
}

interface UserOrders {
  twap: TWAPOrder[];
  options: OptionOrder[];
  dca: DCAOrder[];
  grid: GridOrder[];
  liquidity: ConcentratedLiquidityPosition[];
}

interface OrderStatus {
  isActive: boolean;
  executedAmount: string;
  totalAmount: string;
  progress: number;
}

// Contract ABI
const ADVANCED_STRATEGY_ABI = [
  "function createTWAPOrder(address tokenIn, address tokenOut, uint256 totalAmount, uint256 intervals, uint256 intervalDuration, uint256 minPricePerToken, uint256 maxPricePerToken, bytes32 suiOrderHash) external returns (bytes32)",
  "function executeTWAPInterval(bytes32 orderHash, uint256 amountOut) external",
  "function createOptionOrder(address underlying, uint256 strikePrice, uint256 premium, uint256 expiry, bool isCall, uint256 collateralAmount) external returns (bytes32)",
  "function exerciseOption(bytes32 orderHash, uint256 currentPrice) external payable",
  "function createDCAOrder(address tokenIn, address tokenOut, uint256 totalAmount, uint256 frequency, uint256 amountPerExecution, uint256 maxSlippage) external returns (bytes32)",
  "function executeDCAOrder(bytes32 orderHash, uint256 amountOut) external",
  "function createGridTradingOrder(address baseToken, address quoteToken, uint256 gridLevels, uint256 priceStep, uint256 basePrice, uint256 amountPerGrid) external returns (bytes32)",
  "function executeGridOrder(bytes32 orderHash, uint256 gridLevel, uint256 amountOut) external",
  "function createConcentratedLiquidityPosition(address token0, address token1, uint256 amount0, uint256 amount1, uint256 lowerTick, uint256 upperTick) external returns (bytes32)",
  "function cancelOrder(bytes32 orderHash, uint8 orderType) external",
  "function getOrderStatus(bytes32 orderHash, uint8 orderType) external view returns (bool, uint256, uint256)",
  "function getExpectedAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256)",
  "function getUserTWAPOrders(address user) external view returns (bytes32[])",
  "function getUserOptionOrders(address user) external view returns (bytes32[])",
  "function getUserDCAOrders(address user) external view returns (bytes32[])",
  "function getUserGridOrders(address user) external view returns (bytes32[])",
  "function getUserLiquidityPositions(address user) external view returns (bytes32[])",
  "event TWAPOrderCreated(bytes32 indexed orderHash, address indexed maker, uint256 totalAmount)",
  "event OptionOrderCreated(bytes32 indexed orderHash, address indexed maker, uint256 strikePrice)",
  "event DCAOrderCreated(bytes32 indexed orderHash, address indexed maker)",
  "event GridOrderCreated(bytes32 indexed orderHash, address indexed maker, uint256 gridLevels)"
];

export const useAdvancedLimitOrderStrategies = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userOrders, setUserOrders] = useState<UserOrders>({
    twap: [],
    options: [],
    dca: [],
    grid: [],
    liquidity: []
  });

  // Initialize contract
  const initializeContract = useCallback(async (contractAddress: string, signer: ethers.Signer) => {
    try {
      const strategyContract = new ethers.Contract(contractAddress, ADVANCED_STRATEGY_ABI, signer);
      setContract(strategyContract);
      return strategyContract;
    } catch (err) {
      setError(`Failed to initialize contract: ${err}`);
      throw err;
    }
  }, []);

  // Load user orders
  const loadUserOrders = useCallback(async () => {
    if (!contract) return;
    
    try {
      const signer = contract.runner;
      if (!signer || typeof signer.getAddress !== 'function') return;
      
      const userAddress = await signer.getAddress();
      
      const [twapHashes, optionHashes, dcaHashes, gridHashes, liquidityHashes] = await Promise.all([
        contract.getUserTWAPOrders(userAddress),
        contract.getUserOptionOrders(userAddress),
        contract.getUserDCAOrders(userAddress),
        contract.getUserGridOrders(userAddress),
        contract.getUserLiquidityPositions(userAddress)
      ]);
      
      setUserOrders({
        twap: twapHashes.map((hash: string) => ({ orderHash: hash })),
        options: optionHashes.map((hash: string) => ({ orderHash: hash })),
        dca: dcaHashes.map((hash: string) => ({ orderHash: hash })),
        grid: gridHashes.map((hash: string) => ({ orderHash: hash })),
        liquidity: liquidityHashes.map((hash: string) => ({ positionHash: hash }))
      });
    } catch (err) {
      console.error('Failed to load user orders:', err);
    }
  }, [contract]);

  // TWAP Order Functions
  const createTWAPOrder = useCallback(async (params: {
    tokenIn: string;
    tokenOut: string;
    totalAmount: string;
    intervals: number;
    intervalDuration: number;
    minPricePerToken: string;
    maxPricePerToken: string;
    suiOrderHash?: string;
  }) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    
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
      const event = receipt?.logs.find((log: ethers.Log) => 
        log.topics[0] === ethers.id('TWAPOrderCreated(bytes32,address,uint256)')
      );
      
      if (event) {
        const orderHash = event.topics[1];
        await loadUserOrders();
        return orderHash;
      }
      
      throw new Error('Order creation failed');
    } catch (err) {
      setError(`Failed to create TWAP order: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, loadUserOrders]);

  const executeTWAPInterval = useCallback(async (orderHash: string, expectedAmountOut: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await contract.executeTWAPInterval(
        orderHash,
        ethers.parseUnits(expectedAmountOut, 18)
      );
      
      await tx.wait();
      await loadUserOrders();
      return tx.hash;
    } catch (err) {
      setError(`Failed to execute TWAP interval: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, loadUserOrders]);

  // Option Order Functions
  const createOptionOrder = useCallback(async (params: {
    underlying: string;
    strikePrice: string;
    premium: string;
    expiry: number;
    isCall: boolean;
    collateralAmount: string;
  }) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    
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
      const event = receipt?.logs.find((log: ethers.Log) => 
        log.topics[0] === ethers.id('OptionOrderCreated(bytes32,address,uint256)')
      );
      
      if (event) {
        const orderHash = event.topics[1];
        await loadUserOrders();
        return orderHash;
      }
      
      throw new Error('Option creation failed');
    } catch (err) {
      setError(`Failed to create option order: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, loadUserOrders]);

  const exerciseOption = useCallback(async (orderHash: string, currentPrice: string, premium: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await contract.exerciseOption(
        orderHash,
        ethers.parseUnits(currentPrice, 18),
        {
          value: ethers.parseEther(premium)
        }
      );
      
      await tx.wait();
      await loadUserOrders();
      return tx.hash;
    } catch (err) {
      setError(`Failed to exercise option: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, loadUserOrders]);

  // DCA Order Functions
  const createDCAOrder = useCallback(async (params: {
    tokenIn: string;
    tokenOut: string;
    totalAmount: string;
    frequency: number;
    amountPerExecution: string;
    maxSlippage: number;
  }) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    
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
      const event = receipt?.logs.find((log: ethers.Log) => 
        log.topics[0] === ethers.id('DCAOrderCreated(bytes32,address)')
      );
      
      if (event) {
        const orderHash = event.topics[1];
        await loadUserOrders();
        return orderHash;
      }
      
      throw new Error('DCA order creation failed');
    } catch (err) {
      setError(`Failed to create DCA order: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, loadUserOrders]);

  const executeDCAOrder = useCallback(async (orderHash: string, expectedAmountOut: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await contract.executeDCAOrder(
        orderHash,
        ethers.parseUnits(expectedAmountOut, 18)
      );
      
      await tx.wait();
      await loadUserOrders();
      return tx.hash;
    } catch (err) {
      setError(`Failed to execute DCA order: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, loadUserOrders]);

  // Grid Trading Functions
  const createGridOrder = useCallback(async (params: {
    baseToken: string;
    quoteToken: string;
    gridLevels: number;
    priceStep: string;
    basePrice: string;
    amountPerGrid: string;
  }) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await contract.createGridTradingOrder(
        params.baseToken,
        params.quoteToken,
        params.gridLevels,
        ethers.parseUnits(params.priceStep, 18),
        ethers.parseUnits(params.basePrice, 18),
        ethers.parseUnits(params.amountPerGrid, 18)
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: ethers.Log) => 
        log.topics[0] === ethers.id('GridOrderCreated(bytes32,address,uint256)')
      );
      
      if (event) {
        const orderHash = event.topics[1];
        await loadUserOrders();
        return orderHash;
      }
      
      throw new Error('Grid order creation failed');
    } catch (err) {
      setError(`Failed to create grid order: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, loadUserOrders]);

  const executeGridOrder = useCallback(async (orderHash: string, gridLevel: number, expectedAmountOut: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await contract.executeGridOrder(
        orderHash,
        gridLevel,
        ethers.parseUnits(expectedAmountOut, 18)
      );
      
      await tx.wait();
      await loadUserOrders();
      return tx.hash;
    } catch (err) {
      setError(`Failed to execute grid order: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, loadUserOrders]);

  // Liquidity Functions
  const createLiquidityPosition = useCallback(async (params: {
    token0: string;
    token1: string;
    amount0: string;
    amount1: string;
    lowerTick: number;
    upperTick: number;
  }) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await contract.createConcentratedLiquidityPosition(
        params.token0,
        params.token1,
        ethers.parseUnits(params.amount0, 18),
        ethers.parseUnits(params.amount1, 18),
        params.lowerTick,
        params.upperTick
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: ethers.Log) => 
        log.topics[0] === ethers.id('LiquidityPositionCreated(bytes32,address)')
      );
      
      if (event) {
        const positionHash = event.topics[1];
        await loadUserOrders();
        return positionHash;
      }
      
      throw new Error('Liquidity position creation failed');
    } catch (err) {
      setError(`Failed to create liquidity position: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, loadUserOrders]);

  // Utility Functions
  const cancelOrder = useCallback(async (orderHash: string, orderType: number) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await contract.cancelOrder(orderHash, orderType);
      await tx.wait();
      await loadUserOrders();
      return tx.hash;
    } catch (err) {
      setError(`Failed to cancel order: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, loadUserOrders]);

  const getOrderStatus = useCallback(async (orderHash: string, orderType: number): Promise<OrderStatus> => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const [isActive, executedAmount, totalAmount] = await contract.getOrderStatus(orderHash, orderType);
      return {
        isActive,
        executedAmount: ethers.formatUnits(executedAmount, 18),
        totalAmount: ethers.formatUnits(totalAmount, 18),
        progress: totalAmount > 0 ? (Number(executedAmount) / Number(totalAmount)) * 100 : 0
      };
    } catch (err) {
      setError(`Failed to get order status: ${err}`);
      throw err;
    }
  }, [contract]);

  const getExpectedAmountOut = useCallback(async (tokenIn: string, tokenOut: string, amountIn: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const result = await contract.getExpectedAmountOut(
        tokenIn,
        tokenOut,
        ethers.parseUnits(amountIn, 18)
      );
      return ethers.formatUnits(result, 18);
    } catch (err) {
      setError(`Failed to get expected amount out: ${err}`);
      throw err;
    }
  }, [contract]);

  // Listen to events
  useEffect(() => {
    if (!contract) return;
    
    const handleEvent = () => {
      loadUserOrders();
    };
    
    const eventFilters = [
      'TWAPOrderCreated',
      'OptionOrderCreated', 
      'DCAOrderCreated',
      'GridOrderCreated'
    ];
    
    eventFilters.forEach(eventName => {
      contract.on(eventName, handleEvent);
    });
    
    return () => {
      eventFilters.forEach(eventName => {
        contract.off(eventName, handleEvent);
      });
    };
  }, [contract, loadUserOrders]);

  return {
    // State
    loading,
    error,
    userOrders,
    
    // Contract management
    initializeContract,
    
    // TWAP functions
    createTWAPOrder,
    executeTWAPInterval,
    
    // Option functions
    createOptionOrder,
    exerciseOption,
    
    // DCA functions
    createDCAOrder,
    executeDCAOrder,
    
    // Grid trading functions
    createGridOrder,
    executeGridOrder,
    
    // Liquidity functions
    createLiquidityPosition,
    
    // Utility functions
    cancelOrder,
    getOrderStatus,
    getExpectedAmountOut,
    loadUserOrders
  };
};
