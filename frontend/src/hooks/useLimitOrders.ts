import { useState, useEffect, useCallback } from 'react';

export interface LimitOrder {
  id: string;
  orderHash?: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  targetPrice: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending' | 'filled' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
  // Additional fields used in components
  amountIn?: string;
  amountOut?: string;
  price?: string;
  tokenInSymbol?: string;
  tokenOutSymbol?: string;
  orderType?: string;
  filledAmount?: string;
  // New fields for enhanced functionality
  maker?: string;
  makerAsset?: string;
  takerAsset?: string;
  makingAmount?: string;
  takingAmount?: string;
  remainingMakerAmount?: string;
  filledTakerAmount?: string;
  signature?: string;
}

export interface TWAPOrder {
  id: string;
  parentOrderHash: string;
  status: 'active' | 'completed' | 'cancelled';
  intervals: number;
  intervalDuration: number;
  startTime?: number;
  endTime?: number;
  childOrders: LimitOrder[];
  totalExecuted: string;
  totalRemaining: string;
  nextExecutionTime?: number;
}

export interface LimitOrderParams {
  maker: string;
  makerAsset: string;
  takerAsset: string;
  makingAmount: string;
  takingAmount: string;
  receiver?: string;
  allowedSender?: string;
  predicate?: string;
  permit?: string;
  interactions?: string;
  salt?: string;
}

export function useLimitOrders(userAddress?: string) {
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!userAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/limit-orders?address=${userAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  const createOrder = async (orderData: Omit<LimitOrder, 'id' | 'createdAt' | 'status'>) => {
    try {
      const response = await fetch('/api/limit-orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          userAddress,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      const newOrder = await response.json();
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/limit-orders/${orderId}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }
      
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' as const }
            : order
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userAddress, fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    createOrder,
    cancelOrder,
    refetch: fetchOrders,
  };
}

// Enhanced Hook for TWAP Orders
export function useTWAPOrders(userAddress?: string) {
  const [twapOrders, setTwapOrders] = useState<TWAPOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTWAPOrder = async (
    totalAmount: string,
    intervals: number,
    intervalDuration: number,
    orderParams: LimitOrderParams
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/twap-orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalAmount,
          intervals,
          intervalDuration,
          orderParams,
          userAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create TWAP order');
      }

      const newTWAPOrder = await response.json();
      setTwapOrders(prev => [newTWAPOrder, ...prev]);
      return newTWAPOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create TWAP order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelTWAPOrder = async (twapOrderId: string) => {
    try {
      const response = await fetch(`/api/twap-orders/${twapOrderId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel TWAP order');
      }

      setTwapOrders(prev => prev.map(order => 
        order.id === twapOrderId ? { ...order, status: 'cancelled' } : order
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel TWAP order');
      throw err;
    }
  };

  return {
    twapOrders,
    isLoading,
    error,
    createTWAPOrder,
    cancelTWAPOrder,
  };
}

// Hook for Dutch Auction Orders
export function useDutchAuctionOrders(userAddress?: string) {
  const [dutchOrders, setDutchOrders] = useState<LimitOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDutchAuctionOrder = async (
    startPrice: string,
    endPrice: string,
    duration: number,
    orderParams: LimitOrderParams
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dutch-auction-orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startPrice,
          endPrice,
          duration,
          orderParams,
          userAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Dutch Auction order');
      }

      const newOrder = await response.json();
      setDutchOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create Dutch Auction order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dutchOrders,
    isLoading,
    error,
    createDutchAuctionOrder,
  };
}

// Hook for Stop-Loss Orders
export function useStopLossOrders(userAddress?: string) {
  const [stopLossOrders, setStopLossOrders] = useState<LimitOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStopLossOrder = async (
    triggerPrice: string,
    slippageTolerance: number,
    orderParams: LimitOrderParams
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stop-loss-orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          triggerPrice,
          slippageTolerance,
          orderParams,
          userAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Stop-Loss order');
      }

      const newOrder = await response.json();
      setStopLossOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create Stop-Loss order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stopLossOrders,
    isLoading,
    error,
    createStopLossOrder,
  };
}
