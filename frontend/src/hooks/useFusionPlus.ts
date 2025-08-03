// hooks/useFusionPlus.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  FusionPlusService, 
  CrossChainQuoteParams, 
  CrossChainOrder, 
  FusionPlusConfig,
  createFusionPlusService,
  CHAIN_IDS,
  SupportedChainId
} from '@/services/FusionPlusService';

interface UseFusionPlusReturn {
  service: FusionPlusService | null;
  isConnected: boolean;
  error: string | null;
  isLoading: boolean;
}

/**
 * Main hook for Fusion+ cross-chain functionality
 */
export function useFusionPlus(config?: FusionPlusConfig): UseFusionPlusReturn {
  const [service, setService] = useState<FusionPlusService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (config?.authKey) {
      try {
        const fusionService = createFusionPlusService(config);
        setService(fusionService);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Fusion+ service');
        setIsConnected(false);
      }
    }
  }, [config]);

  return {
    service,
    isConnected,
    error,
    isLoading,
  };
}

interface UseActiveOrdersReturn {
  orders: CrossChainOrder[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

/**
 * Hook for managing active Fusion+ orders
 */
export function useActiveOrders(
  service: FusionPlusService | null,
  initialPage: number = 1,
  pageSize: number = 10
): UseActiveOrdersReturn {
  const [orders, setOrders] = useState<CrossChainOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const fetchOrders = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!service) return;

    setLoading(true);
    setError(null);

    try {
      const result = await service.getActiveOrders(page, pageSize);
      const newOrders = result.items || [];
      
      if (append) {
        setOrders(prev => [...prev, ...newOrders]);
      } else {
        setOrders(newOrders);
      }
      
      setHasMore(newOrders.length === pageSize);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [service, pageSize]);

  const refresh = useCallback(async () => {
    await fetchOrders(1, false);
  }, [fetchOrders]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchOrders(currentPage + 1, true);
    }
  }, [fetchOrders, currentPage, hasMore, loading]);

  useEffect(() => {
    if (service) {
      fetchOrders(1, false);
    }
  }, [service, fetchOrders]);

  return {
    orders,
    loading,
    error,
    refresh,
    hasMore,
    loadMore,
  };
}

interface UseOrdersByMakerReturn {
  orders: CrossChainOrder[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching orders by maker address
 */
export function useOrdersByMaker(
  service: FusionPlusService | null,
  makerAddress: string,
  page: number = 1,
  limit: number = 10
): UseOrdersByMakerReturn {
  const [orders, setOrders] = useState<CrossChainOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!service || !makerAddress) return;

    setLoading(true);
    setError(null);

    try {
      const result = await service.getOrdersByMaker(makerAddress, page, limit);
      setOrders(result.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch maker orders');
    } finally {
      setLoading(false);
    }
  }, [service, makerAddress, page, limit]);

  const refresh = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refresh,
  };
}

interface UseCrossChainQuoteReturn {
  quote: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
  getQuote: (params: CrossChainQuoteParams) => Promise<void>;
  clearQuote: () => void;
}

/**
 * Hook for getting cross-chain swap quotes
 */
export function useCrossChainQuote(
  service: FusionPlusService | null
): UseCrossChainQuoteReturn {
  const [quote, setQuote] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQuote = useCallback(async (params: CrossChainQuoteParams) => {
    if (!service) {
      setError('Fusion+ service not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await service.getQuote(params);
      setQuote(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get quote');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const clearQuote = useCallback(() => {
    setQuote(null);
    setError(null);
  }, []);

  return {
    quote,
    loading,
    error,
    getQuote,
    clearQuote,
  };
}

interface UseOrderStatusReturn {
  order: CrossChainOrder | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for tracking order status
 */
export function useOrderStatus(
  service: FusionPlusService | null,
  orderHash: string | null
): UseOrderStatusReturn {
  const [order, setOrder] = useState<CrossChainOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!service || !orderHash) return;

    setLoading(true);
    setError(null);

    try {
      const result = await service.getOrderStatus(orderHash);
      setOrder(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order status');
    } finally {
      setLoading(false);
    }
  }, [service, orderHash]);

  const refresh = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    order,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook for submitting secrets
 */
export function useSecretSubmission(service: FusionPlusService | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitSecret = useCallback(async (orderHash: string, secret: string) => {
    if (!service) {
      throw new Error('Fusion+ service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      await service.submitSecret(orderHash, secret);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit secret';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    submitSecret,
    loading,
    error,
    clearError,
  };
}

/**
 * Utility hook for chain information
 */
export function useChainInfo() {
  const getChainInfo = useCallback((chainId: SupportedChainId) => {
    const service = new FusionPlusService({ apiUrl: '', authKey: '' });
    return service.getNetworkInfo(chainId);
  }, []);

  const getSupportedChains = useCallback(() => {
    return Object.entries(CHAIN_IDS).map(([chainName, id]) => ({
      id,
      displayName: chainName.charAt(0) + chainName.slice(1).toLowerCase(),
      ...getChainInfo(id),
    }));
  }, [getChainInfo]);

  const getSupportedChainPairs = useCallback(() => {
    const service = new FusionPlusService({ apiUrl: '', authKey: '' });
    return service.getSupportedChainPairs();
  }, []);

  return {
    getChainInfo,
    getSupportedChains,
    getSupportedChainPairs,
    CHAIN_IDS,
  };
}

/**
 * Configuration hook for environment variables
 */
export function useFusionPlusConfig() {
  const [config, setConfig] = useState<FusionPlusConfig | null>(null);

  useEffect(() => {
    const authKey = process.env.NEXT_PUBLIC_1INCH_API_KEY || 
                   process.env.NEXT_PUBLIC_FUSION_PLUS_API_KEY;
    
    if (authKey) {
      setConfig({
        apiUrl: 'https://api.1inch.dev/fusion-plus',
        authKey,
      });
    }
  }, []);

  return config;
}

// Export all hooks
export {
  CHAIN_IDS,
  type SupportedChainId,
  type CrossChainOrder,
  type CrossChainQuoteParams,
  type FusionPlusConfig,
};
