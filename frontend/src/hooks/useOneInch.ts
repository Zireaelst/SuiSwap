import { useState, useEffect, useCallback } from 'react';

// Environment configuration
const API_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_1INCH_API_KEY || '',
  baseUrl: process.env.NEXT_PUBLIC_ONEINCH_API_BASE || 'https://api.1inch.dev',
  defaultChainId: Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID) || 1,
};

// API Types
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

export interface PriceData {
  [tokenAddress: string]: string;
}

export interface BalanceData {
  [tokenAddress: string]: string;
}

export interface SwapQuote {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromTokenAmount: string;
  toTokenAmount: string;
  protocols: Array<{
    name: string;
    part: number;
    fromTokenAddress: string;
    toTokenAddress: string;
  }>;
  estimatedGas: number;
}

export interface PortfolioToken {
  token_address: string;
  balance: string;
  value_usd: number;
  price_usd: number;
}

export interface PortfolioData {
  total_value_usd: number;
  abs_profit_usd: number;
  roi: number;
  tokens: PortfolioToken[];
}

// Main 1inch API service
class OneInchService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`1inch API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('1inch API request failed:', error);
      throw error;
    }
  }

  // Token API
  async getTokens(chainId: number): Promise<Record<string, TokenInfo>> {
    return this.makeRequest(`/token/v1.2/${chainId}`);
  }

  // Price API
  async getTokenPrices(chainId: number, tokens: string[]): Promise<PriceData> {
    const tokenList = tokens.join(',');
    return this.makeRequest(`/price/v1.1/${chainId}/${tokenList}`);
  }

  // Balance API
  async getWalletBalances(chainId: number, walletAddress: string): Promise<BalanceData> {
    return this.makeRequest(`/balance/v1.2/${chainId}/balances/${walletAddress}`);
  }

  // Portfolio API
  async getPortfolio(walletAddress: string, chainId: number): Promise<PortfolioData> {
    return this.makeRequest(`/portfolio/v4/overview/erc20?addresses=${walletAddress}&chain_id=${chainId}`);
  }

  // History API
  async getWalletHistory(walletAddress: string, chainId: number, limit: number = 50) {
    return this.makeRequest(`/history/v2.0/history/${walletAddress}/events?chain_id=${chainId}&limit=${limit}`);
  }

  // Swap API
  async getSwapQuote(
    chainId: number, 
    fromTokenAddress: string, 
    toTokenAddress: string, 
    amount: string,
    fromAddress?: string
  ): Promise<SwapQuote> {
    const params = new URLSearchParams({
      src: fromTokenAddress,
      dst: toTokenAddress,
      amount: amount,
      ...(fromAddress && { from: fromAddress }),
    });
    
    return this.makeRequest(`/swap/v6.0/${chainId}/quote?${params.toString()}`);
  }

  async buildSwapTransaction(
    chainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fromAddress: string,
    slippage: number = 1
  ) {
    const params = new URLSearchParams({
      src: fromTokenAddress,
      dst: toTokenAddress,
      amount: amount,
      from: fromAddress,
      slippage: slippage.toString(),
    });

    return this.makeRequest(`/swap/v6.0/${chainId}/swap?${params.toString()}`);
  }
}

// Singleton instance
let oneInchServiceInstance: OneInchService | null = null;

export const getOneInchService = (): OneInchService => {
  if (!oneInchServiceInstance) {
    oneInchServiceInstance = new OneInchService(API_CONFIG.apiKey, API_CONFIG.baseUrl);
  }
  return oneInchServiceInstance;
};

// React Hooks
export const useOneInchTokens = (chainId: number = API_CONFIG.defaultChainId) => {
  const [tokens, setTokens] = useState<Record<string, TokenInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        setError(null);
        const service = getOneInchService();
        const data = await service.getTokens(chainId);
        setTokens(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
      } finally {
        setLoading(false);
      }
    };

    if (API_CONFIG.apiKey) {
      fetchTokens();
    }
  }, [chainId]);

  return { tokens, loading, error };
};

export const useOneInchPrices = (
  chainId: number = API_CONFIG.defaultChainId,
  tokenAddresses: string[] = []
) => {
  const [prices, setPrices] = useState<PriceData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!tokenAddresses.length || !API_CONFIG.apiKey) return;

    try {
      setLoading(true);
      setError(null);
      const service = getOneInchService();
      const data = await service.getTokenPrices(chainId, tokenAddresses);
      setPrices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  }, [chainId, tokenAddresses]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { prices, loading, error, refetch: fetchPrices };
};

export const useOneInchBalances = (
  chainId: number = API_CONFIG.defaultChainId,
  walletAddress: string = ''
) => {
  const [balances, setBalances] = useState<BalanceData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!walletAddress || !API_CONFIG.apiKey) return;

    try {
      setLoading(true);
      setError(null);
      const service = getOneInchService();
      const data = await service.getWalletBalances(chainId, walletAddress);
      setBalances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  }, [chainId, walletAddress]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { balances, loading, error, refetch: fetchBalances };
};

export const useOneInchPortfolio = (
  walletAddress: string = '',
  chainId: number = API_CONFIG.defaultChainId
) => {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!walletAddress || !API_CONFIG.apiKey) return;

    try {
      setLoading(true);
      setError(null);
      const service = getOneInchService();
      const data = await service.getPortfolio(walletAddress, chainId);
      setPortfolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  }, [walletAddress, chainId]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { portfolio, loading, error, refetch: fetchPortfolio };
};

export interface HistoryEvent {
  id: string;
  txHash: string;
  timestamp: number;
  type: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: string;
}

export const useOneInchHistory = (
  walletAddress: string = '',
  chainId: number = API_CONFIG.defaultChainId,
  limit: number = 50
) => {
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!walletAddress || !API_CONFIG.apiKey) return;

    try {
      setLoading(true);
      setError(null);
      const service = getOneInchService();
      const data = await service.getWalletHistory(walletAddress, chainId, limit);
      setHistory(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [walletAddress, chainId, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refetch: fetchHistory };
};

export const useOneInchSwap = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQuote = useCallback(async (
    chainId: number,
    fromToken: string,
    toToken: string,
    amount: string,
    fromAddress?: string
  ): Promise<SwapQuote | null> => {
    if (!API_CONFIG.apiKey) {
      setError('API key not configured');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const service = getOneInchService();
      const quote = await service.getSwapQuote(chainId, fromToken, toToken, amount, fromAddress);
      return quote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get quote');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const buildTransaction = useCallback(async (
    chainId: number,
    fromToken: string,
    toToken: string,
    amount: string,
    fromAddress: string,
    slippage: number = 1
  ) => {
    if (!API_CONFIG.apiKey) {
      setError('API key not configured');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const service = getOneInchService();
      const transaction = await service.buildSwapTransaction(
        chainId,
        fromToken,
        toToken,
        amount,
        fromAddress,
        slippage
      );
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to build transaction');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getQuote, buildTransaction, loading, error };
};

// Utility functions
export const isAPIConfigured = () => {
  return Boolean(API_CONFIG.apiKey);
};

export const getAPIConfig = () => {
  return API_CONFIG;
};
