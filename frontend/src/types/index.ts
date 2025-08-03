// Chain Types
export type Chain = 'ethereum' | 'sui';
export type Network = 'mainnet' | 'testnet';

// Wallet Types
export interface WalletState {
  ethereum: {
    address: string | null;
    isConnected: boolean;
    chain: string | null;
    balance: string | null;
  };
  sui: {
    address: string | null;
    isConnected: boolean;
    network: string | null;
    balance: string | null;
  };
  isConnecting: boolean;
}

// Token Types
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  chain: Chain;
  balance?: string;
  priceUSD?: number;
}

export interface TokenPair {
  tokenA: Token;
  tokenB: Token;
}

// Quote Types
export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  priceImpact: number;
  slippage: number;
  route: RouteStep[];
  protocols: string[];
  estimatedGasFee: string;
  validUntil: number;
}

export interface RouteStep {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
}

export interface CrossChainQuote extends SwapQuote {
  bridgeFee: string;
  estimatedTime: number;
  intermediateSteps: SwapStep[];
}

export interface SwapStep {
  chain: Chain;
  protocol: string;
  fromToken: Token;
  toToken: Token;
  amount: string;
  estimatedGas: string;
}

// Order Types
export interface LimitOrderParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  targetPrice: string;
  expiration: Date;
  sourceChain: Chain;
  targetChain?: Chain;
  slippage?: number;
}

export interface TWAPOrderParams {
  tokenIn: Token;
  tokenOut: Token;
  totalAmount: string;
  intervalMinutes: number;
  totalIntervals: number;
  targetPrice?: string;
  sourceChain: Chain;
  targetChain?: Chain;
}

export interface ConcentratedLiquidityParams {
  tokenA: Token;
  tokenB: Token;
  liquidity: string;
  priceLower: string;
  priceUpper: string;
  chain: Chain;
}

// Transaction Types
export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  confirmations?: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
}

export interface CrossChainTransactionStatus {
  sourceChain: {
    hash: string;
    status: TransactionStatus['status'];
    confirmations: number;
  };
  targetChain?: {
    hash: string;
    status: TransactionStatus['status'];
    confirmations: number;
  };
  overallStatus: 'pending' | 'bridging' | 'completed' | 'failed';
  estimatedCompletionTime?: number;
}

// HTLC Types
export interface HTLCParams {
  hashlock: string;
  timelock: number;
  recipient: string;
  amount: string;
  token: string;
}

export interface HTLCStatus {
  id: string;
  hashlock: string;
  preimage?: string;
  timelock: number;
  amount: string;
  recipient: string;
  sender: string;
  isLocked: boolean;
  isUnlocked: boolean;
  isRefunded: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Portfolio Types
export interface PortfolioPosition {
  token: Token;
  balance: string;
  valueUSD: number;
  chain: Chain;
  type: 'wallet' | 'liquidity' | 'staking';
}

export interface PortfolioSummary {
  totalValueUSD: number;
  totalPnL: number;
  pnlPercentage: number;
  positions: PortfolioPosition[];
  activeOrders: {
    limitOrders: number;
    twapOrders: number;
    liquidityPositions: number;
  };
}

// Analytics Types
export interface TradingMetrics {
  totalVolume: number;
  totalTrades: number;
  successRate: number;
  averageSlippage: number;
  totalFees: number;
  profitLoss: number;
  bestTrade: {
    pair: string;
    profit: number;
    date: Date;
  };
}

export interface ArbitrageOpportunity {
  tokenPair: string;
  sourceChain: Chain;
  targetChain: Chain;
  sourceExchange: string;
  targetExchange: string;
  priceSpread: number;
  estimatedProfit: number;
  minimumAmount: string;
  maximumAmount: string;
  confidence: number;
  validUntil: Date;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export interface TransactionError extends AppError {
  txHash?: string;
  gasUsed?: string;
  revertReason?: string;
}

// Configuration Types
export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contracts: {
    htlc?: string;
    limitOrders?: string;
    multicall?: string;
  };
}

export interface AppConfig {
  chains: Record<Chain, ChainConfig>;
  api: {
    oneInch: {
      baseUrl: string;
      apiKey: string;
    };
    coinGecko: {
      baseUrl: string;
      apiKey?: string;
    };
  };
  features: {
    enableTWAP: boolean;
    enableConcentratedLiquidity: boolean;
    enableArbitrage: boolean;
    enableMEVProtection: boolean;
  };
}

// Hook Return Types
export interface SwapParams {
  fromToken: Token;
  toToken: Token;
  amount: string;
  slippage: number;
  recipient?: string;
}

export interface UseSwapReturn {
  quote: SwapQuote | null;
  isLoading: boolean;
  error: string | null;
  getQuote: (params: SwapParams) => Promise<void>;
  executeSwap: (params: SwapParams) => Promise<string>;
}

export interface LimitOrderData {
  id: string;
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  targetPrice: string;
  status: string;
  createdAt: Date;
  expirationDate: Date;
}

export interface UseLimitOrdersReturn {
  orders: LimitOrderData[];
  isLoading: boolean;
  error: string | null;
  createOrder: (params: LimitOrderParams) => Promise<string>;
  cancelOrder: (orderId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface TWAPOrderData {
  id: string;
  tokenIn: Token;
  tokenOut: Token;
  totalAmount: string;
  completedAmount: string;
  intervalMinutes: number;
  totalIntervals: number;
  completedIntervals: number;
  status: string;
  createdAt: Date;
}

export interface UseTWAPReturn {
  orders: TWAPOrderData[];
  isLoading: boolean;
  error: string | null;
  createOrder: (params: TWAPOrderParams) => Promise<string>;
  pauseOrder: (orderId: string) => Promise<void>;
  resumeOrder: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
}
