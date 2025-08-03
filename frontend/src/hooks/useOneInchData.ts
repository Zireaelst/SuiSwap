import { useState, useEffect, useCallback } from 'react';
import { getOneInchAPI, TokenInfo, WalletTransaction, TokenBalance, PortfolioData } from '@/utils/1inch-api';

// Hook for token prices
export const useTokenPrices = (chainId: number, tokenAddresses: string[]) => {
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPrices = useCallback(async () => {
        if (!tokenAddresses.length) {
            console.log('Missing data:', { tokenAddressesLength: tokenAddresses.length });
            return;
        }

        console.log('Fetching prices for:', { chainId, tokenAddresses });
        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI();
            const priceData = await api.getMultipleTokenPrices(chainId, tokenAddresses);
            console.log('Price data received:', priceData);
            setPrices(priceData);
        } catch (err) {
            console.error('Price fetch error:', err);
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

// Hook for wallet balances
export const useWalletBalances = (chainId: number, walletAddress: string) => {
    const [balances, setBalances] = useState<TokenBalance>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalances = useCallback(async () => {
        if (!walletAddress) return;

        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI();
            const balanceData = await api.getWalletBalances(chainId, walletAddress);
            setBalances(balanceData);
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

// Hook for wallet transaction history
export const useWalletHistory = (walletAddress: string, chainId: number, limit: number) => {
    const [history, setHistory] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!walletAddress) return;

        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI();
            const historyData = await api.getWalletHistory(walletAddress, chainId, limit);
            setHistory(historyData);
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

// Hook for portfolio data
export const usePortfolio = (walletAddress: string, chainId: number) => {
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPortfolio = useCallback(async () => {
        if (!walletAddress) return;

        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI();
            const data = await api.getPortfolioValue([walletAddress], chainId);
            setPortfolioData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
        } finally {
            setLoading(false);
        }
    }, [walletAddress, chainId]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    return { portfolioData, loading, error, refetch: fetchPortfolio };
};

// Hook for token search
export const useTokenSearch = () => {
    const [searchResults, setSearchResults] = useState<TokenInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchTokens = useCallback(async (query: string, chainId: number, limit: number = 10) => {
        if (!query) return;

        setLoading(true);
        setError(null);

        try {
            const api = getOneInchAPI();
            const results = await api.searchTokens(query, chainId, limit);
            setSearchResults(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search tokens');
        } finally {
            setLoading(false);
        }
    }, []);

    return { searchResults, loading, error, searchTokens };
};
