import { useState, useEffect, useCallback } from 'react';
import { getOneInchAPI, TokenInfo, WalletTransaction, TokenBalance, PortfolioData, ChartData } from '@/utils/1inch-api';

// Hook for token prices
export const useTokenPrices = (chainId: number, tokenAddresses: string[], apiKey: string) => {
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPrices = useCallback(async () => {
        if (!tokenAddresses.length || !apiKey) return;

        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI(apiKey);
            const priceData = await api.getMultipleTokenPrices(chainId, tokenAddresses);
            setPrices(priceData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch prices');
        } finally {
            setLoading(false);
        }
    }, [chainId, tokenAddresses, apiKey]);

    useEffect(() => {
        fetchPrices();
    }, [fetchPrices]);

    return { prices, loading, error, refetch: fetchPrices };
};

// Hook for wallet balances
export const useWalletBalances = (chainId: number, walletAddress: string, apiKey: string) => {
    const [balances, setBalances] = useState<TokenBalance>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalances = useCallback(async () => {
        if (!walletAddress || !apiKey) return;

        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI(apiKey);
            const balanceData = await api.getWalletBalances(chainId, walletAddress);
            setBalances(balanceData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch balances');
        } finally {
            setLoading(false);
        }
    }, [chainId, walletAddress, apiKey]);

    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    return { balances, loading, error, refetch: fetchBalances };
};

// Hook for wallet transaction history
export const useWalletHistory = (walletAddress: string, chainId: number, limit: number, apiKey: string) => {
    const [history, setHistory] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!walletAddress || !apiKey) return;

        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI(apiKey);
            const historyData = await api.getWalletHistory(walletAddress, chainId, limit);
            setHistory(historyData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch history');
        } finally {
            setLoading(false);
        }
    }, [walletAddress, chainId, limit, apiKey]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, loading, error, refetch: fetchHistory };
};

// Hook for portfolio data
export const usePortfolio = (walletAddress: string, chainId: number, apiKey: string) => {
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPortfolio = useCallback(async () => {
        if (!walletAddress || !apiKey) return;

        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI(apiKey);
            const currentValue = await api.getCurrentValue(walletAddress, chainId);

            setPortfolioData({
                current_value: currentValue
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
        } finally {
            setLoading(false);
        }
    }, [walletAddress, chainId, apiKey]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    return { portfolioData, loading, error, refetch: fetchPortfolio };
};

// Hook for token search
export const useTokenSearch = (apiKey: string) => {
    const [searchResults, setSearchResults] = useState<TokenInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchTokens = useCallback(async (query: string, chainId: number, limit: number = 10) => {
        if (!query || !apiKey) return;

        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI(apiKey);
            const results = await api.searchTokens(query, chainId, limit);
            setSearchResults(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search tokens');
        } finally {
            setLoading(false);
        }
    }, [apiKey]);

    return { searchResults, loading, error, searchTokens };
};

// Hook for chart data
export const useChartData = (tokenAddress: string, chainId: number, timeframe: '1h' | '4h' | '1d' | '1w', apiKey: string) => {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchChartData = useCallback(async () => {
        if (!tokenAddress || !apiKey) return;

        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI(apiKey);
            const data = await api.getChartData(tokenAddress, chainId, timeframe);
            setChartData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
        } finally {
            setLoading(false);
        }
    }, [tokenAddress, chainId, timeframe, apiKey]);

    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);

    return { chartData, loading, error, refetch: fetchChartData };
};

// Hook for complete wallet data (combines multiple APIs)
export const useCompleteWalletData = (walletAddress: string, chainId: number, apiKey: string) => {
    const [walletData, setWalletData] = useState<{
        balances: TokenBalance;
        history: WalletTransaction[];
        currentValue: Record<string, unknown>;
        tokenDetails: Record<string, unknown>;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCompleteData = useCallback(async () => {
        if (!walletAddress || !apiKey) return;

        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI(apiKey);
            const data = await api.getCompleteWalletData(walletAddress, chainId);
            setWalletData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch wallet data');
        } finally {
            setLoading(false);
        }
    }, [walletAddress, chainId, apiKey]);

    useEffect(() => {
        fetchCompleteData();
    }, [fetchCompleteData]);

    return { walletData, loading, error, refetch: fetchCompleteData };
};

// Hook for ETH balance using Web3 RPC
export const useETHBalance = (address: string, chainId: number, apiKey: string) => {
    const [balance, setBalance] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        if (!address || !apiKey) return;

        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI(apiKey);
            const balanceData = await api.getBalance(address, chainId);
            setBalance(balanceData.result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch ETH balance');
        } finally {
            setLoading(false);
        }
    }, [address, chainId, apiKey]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return { balance, loading, error, refetch: fetchBalance };
};
