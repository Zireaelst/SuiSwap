import { useEffect, useState } from 'react';

interface PriceData {
  [tokenAddress: string]: string;
}

interface BalanceData {
  [tokenAddress: string]: string;
}

interface SwapQuoteData {
  toTokenAmount: string;
  estimatedGas: string;
  protocols: unknown[];
}

export const useOneInchAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fiyat verilerini çek
  const getTokenPrice = async (tokenAddress: string): Promise<number | null> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/test-1inch?type=price&token=${tokenAddress}`);
      const data = await response.json();
      
      if (data.success && data.results.price) {
        const priceData = data.results.price as PriceData;
        const price = priceData[tokenAddress.toLowerCase()];
        return price ? parseFloat(price) / 1e18 : null;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Wallet bakiyelerini çek
  const getWalletBalances = async (walletAddress: string): Promise<BalanceData | null> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/test-1inch?type=balance&wallet=${walletAddress}`);
      const data = await response.json();
      
      if (data.success && data.results.balances) {
        return data.results.balances.data as BalanceData;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Swap quote al
  const getSwapQuote = async (params: {
    fromToken: string;
    toToken: string;
    amount: string;
    walletAddress: string;
  }): Promise<SwapQuoteData | null> => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        type: 'quote',
        src: params.fromToken,
        dst: params.toToken,
        amount: params.amount,
        from: params.walletAddress
      });
      
      const response = await fetch(`/api/test-1inch?${queryParams}`);
      const data = await response.json();
      
      if (data.success && data.results.swapQuote) {
        return data.results.swapQuote.data as SwapQuoteData;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Gerçek zamanlı fiyat güncellemeleri
  const useLivePrice = (tokenAddress: string) => {
    const [price, setPrice] = useState<number | null>(null);

    useEffect(() => {
      const fetchPrice = async () => {
        const priceData = await getTokenPrice(tokenAddress);
        setPrice(priceData);
      };

      fetchPrice();
      
      // Her 30 saniyede bir güncelle
      const interval = setInterval(fetchPrice, 30000);
      
      return () => clearInterval(interval);
    }, [tokenAddress]);

    return price;
  };

  return {
    getTokenPrice,
    getWalletBalances,
    getSwapQuote,
    useLivePrice,
    loading,
    error
  };
};
