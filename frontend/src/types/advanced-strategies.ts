// Advanced Strategies Type Definitions for 1inch Limit Order Protocol Extensions

export interface TWAPOrder {
  orderHash: string;
  maker?: string;
  tokenIn?: string;
  tokenOut?: string;
  totalAmount?: string;
  executedAmount?: string;
  intervals?: number;
  intervalDuration?: number;
  lastExecutionTime?: number;
  minPricePerToken?: string;
  maxPricePerToken?: string;
  isActive?: boolean;
  suiOrderHash?: string;
}

export interface OptionOrder {
  orderHash: string;
  maker?: string;
  underlying?: string;
  strikePrice?: string;
  premium?: string;
  expiry?: number;
  isCall?: boolean;
  isExecuted?: boolean;
  isPremiumPaid?: boolean;
  collateralAmount?: string;
}

export interface DCAOrder {
  orderHash: string;
  maker?: string;
  tokenIn?: string;
  tokenOut?: string;
  totalAmount?: string;
  executedAmount?: string;
  frequency?: number;
  amountPerExecution?: string;
  lastExecutionTime?: number;
  maxSlippage?: number;
  isActive?: boolean;
}

export interface GridOrder {
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

export interface ConcentratedLiquidityPosition {
  positionHash: string;
  provider?: string;
  token0?: string;
  token1?: string;
  amount0?: string;
  amount1?: string;
  lowerTick?: number;
  upperTick?: number;
  liquidity?: string;
  feesEarned0?: string;
  feesEarned1?: string;
  isActive?: boolean;
}

export interface OrderStatus {
  isActive: boolean;
  executedAmount: string;
  totalAmount: string;
  progress: number;
}

export interface UserOrders {
  twap: TWAPOrder[];
  options: OptionOrder[];
  dca: DCAOrder[];
  grid: GridOrder[];
  liquidity: ConcentratedLiquidityPosition[];
}

// Hook parameters for creating orders
export interface CreateTWAPOrderParams {
  tokenIn: string;
  tokenOut: string;
  totalAmount: string;
  intervals: number;
  intervalDuration: number;
  minPricePerToken: string;
  maxPricePerToken: string;
  suiOrderHash?: string;
}

export interface CreateOptionOrderParams {
  underlying: string;
  strikePrice: string;
  premium: string;
  expiry: number;
  isCall: boolean;
  collateralAmount: string;
}

export interface CreateDCAOrderParams {
  tokenIn: string;
  tokenOut: string;
  totalAmount: string;
  frequency: number;
  amountPerExecution: string;
  maxSlippage: number;
}

export interface CreateGridOrderParams {
  baseToken: string;
  quoteToken: string;
  gridLevels: number;
  priceStep: string;
  basePrice: string;
  amountPerGrid: string;
}

export interface CreateLiquidityPositionParams {
  token0: string;
  token1: string;
  amount0: string;
  amount1: string;
  lowerTick: number;
  upperTick: number;
}

// Main hook interface
export interface AdvancedStrategyHook {
  // State
  loading: boolean;
  error: string | null;
  userOrders: UserOrders;
  
  // Contract management
  initializeContract: (contractAddress: string, signer: any) => Promise<any>;
  
  // TWAP functions
  createTWAPOrder: (params: CreateTWAPOrderParams) => Promise<string>;
  executeTWAPInterval: (orderHash: string, expectedAmountOut: string) => Promise<string>;
  
  // Option functions
  createOptionOrder: (params: CreateOptionOrderParams) => Promise<string>;
  exerciseOption: (orderHash: string, currentPrice: string, premium: string) => Promise<string>;
  
  // DCA functions
  createDCAOrder: (params: CreateDCAOrderParams) => Promise<string>;
  executeDCAOrder: (orderHash: string, expectedAmountOut: string) => Promise<string>;
  
  // Grid trading functions
  createGridOrder: (params: CreateGridOrderParams) => Promise<string>;
  executeGridOrder: (orderHash: string, gridLevel: number, expectedAmountOut: string) => Promise<string>;
  
  // Liquidity functions
  createLiquidityPosition: (params: CreateLiquidityPositionParams) => Promise<string>;
  
  // Utility functions
  cancelOrder: (orderHash: string, orderType: number) => Promise<string>;
  getOrderStatus: (orderHash: string, orderType: number) => Promise<OrderStatus>;
  getExpectedAmountOut: (tokenIn: string, tokenOut: string, amountIn: string) => Promise<string>;
  loadUserOrders: () => Promise<void>;
}

// Order types enumeration
export enum OrderType {
  TWAP = 0,
  OPTION = 1,
  DCA = 2,
  GRID = 3,
  LIQUIDITY = 4
}

// Event interfaces
export interface TWAPOrderCreatedEvent {
  orderHash: string;
  maker: string;
  totalAmount: string;
}

export interface TWAPOrderExecutedEvent {
  orderHash: string;
  amountIn: string;
  amountOut: string;
}

export interface OptionOrderCreatedEvent {
  orderHash: string;
  maker: string;
  strikePrice: string;
}

export interface OptionExecutedEvent {
  orderHash: string;
  executor: string;
}

export interface DCAOrderCreatedEvent {
  orderHash: string;
  maker: string;
}

export interface DCAOrderExecutedEvent {
  orderHash: string;
  amountIn: string;
  amountOut: string;
}

export interface GridOrderCreatedEvent {
  orderHash: string;
  maker: string;
  gridLevels: number;
}

export interface GridOrderExecutedEvent {
  orderHash: string;
  gridLevel: number;
  amountIn: string;
  amountOut: string;
}

export interface LiquidityPositionCreatedEvent {
  positionHash: string;
  provider: string;
}

// Strategy configuration interfaces
export interface TWAPConfig {
  minIntervalDuration: number;
  maxIntervals: number;
  defaultSlippage: number;
}

export interface OptionConfig {
  minTimeToExpiry: number;
  maxTimeToExpiry: number;
  supportedUnderlyings: string[];
}

export interface DCAConfig {
  minFrequency: number;
  maxSlippage: number;
  defaultFrequency: number;
}

export interface GridConfig {
  minGridLevels: number;
  maxGridLevels: number;
  minPriceStep: string;
}

export interface LiquidityConfig {
  supportedPairs: Array<{
    token0: string;
    token1: string;
    fee: number;
  }>;
  tickSpacing: number;
}

export interface AdvancedStrategyConfig {
  twap: TWAPConfig;
  option: OptionConfig;
  dca: DCAConfig;
  grid: GridConfig;
  liquidity: LiquidityConfig;
  protocolFee: number;
  feeRecipient: string;
}

// Analytics interfaces
export interface OrderAnalytics {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalVolume: string;
  averageExecutionTime: number;
  successRate: number;
}

export interface StrategyPerformance {
  twap: OrderAnalytics;
  option: OrderAnalytics;
  dca: OrderAnalytics;
  grid: OrderAnalytics;
  liquidity: OrderAnalytics;
}

// 1inch Integration interfaces
export interface OneInchQuote {
  fromToken: string;
  toToken: string;
  fromTokenAmount: string;
  toTokenAmount: string;
  protocols: string[];
  estimatedGas: number;
}

export interface OneInchSwapParams {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fromAddress: string;
  slippage: number;
  protocols?: string;
  fee?: number;
  gasPrice?: string;
  complexityLevel?: number;
  connectorTokens?: string;
  allowPartialFill?: boolean;
  disableEstimate?: boolean;
  gasLimit?: number;
  mainRouteParts?: number;
  parts?: number;
}

export interface OneInchResponse {
  fromToken: any;
  toToken: any;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any[];
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
}

// Error types
export interface StrategyError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError extends StrategyError {
  field: string;
  value: any;
}

// Utility types
export type StrategyType = 'twap' | 'option' | 'dca' | 'grid' | 'liquidity';

export type ExecutionStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';

export type PriceDirection = 'up' | 'down' | 'sideways';

export interface PriceData {
  price: string;
  timestamp: number;
  source: string;
}

export interface MarketData {
  symbol: string;
  price: string;
  change24h: string;
  volume24h: string;
  marketCap: string;
  priceHistory: PriceData[];
}

// Cross-chain related types (for Sui integration)
export interface CrossChainOrder {
  ethereumOrderHash: string;
  suiOrderHash: string;
  hashlock: string;
  timelock: number;
  status: 'pending' | 'locked' | 'executed' | 'refunded';
}

export interface SuiIntegration {
  packageId: string;
  moduleId: string;
  functionName: string;
  arguments: any[];
}
