import { useState, useEffect, useCallback } from 'react';

export interface LimitOrder {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  targetPrice: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
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
