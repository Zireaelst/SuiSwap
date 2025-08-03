// services/LimitOrderService.ts
// Simple Limit Order Protocol service based on workshop documentation

export interface LimitOrderConfig {
  apiUrl: string;
  authKey: string;
  chainId: number;
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

export interface LimitOrder {
  orderHash: string;
  signature: string;
  data: LimitOrderParams;
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  createdAt: number;
  expiresAt?: number;
  remainingMakerAmount: string;
  filledTakerAmount: string;
}

export interface TWAPOrderParams extends LimitOrderParams {
  intervals: number;
  intervalDuration: number; // in seconds
  startTime?: number;
  endTime?: number;
}

export interface TWAPOrder {
  id: string;
  parentOrderHash: string;
  status: 'active' | 'completed' | 'cancelled';
  params: TWAPOrderParams;
  childOrders: LimitOrder[];
  totalExecuted: string;
  totalRemaining: string;
  nextExecutionTime?: number;
}

export interface OrderBookEntry {
  price: string;
  amount: string;
  total: string;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

/**
 * Limit Order Protocol Service
 * Based on 1inch Limit Order Protocol workshop
 */
export class LimitOrderService {
  private config: LimitOrderConfig;
  private baseUrl: string;

  constructor(config: LimitOrderConfig) {
    this.config = config;
    this.baseUrl = config.apiUrl || 'https://api.1inch.dev/orderbook/v4.0';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.authKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Limit Order API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Limit Order API request failed:', error);
      throw error;
    }
  }

  /**
   * Create a standard limit order
   */
  async createLimitOrder(params: LimitOrderParams): Promise<LimitOrder> {
    try {
      const salt = params.salt || this.generateSalt();
      const orderData = {
        ...params,
        salt,
      };

      const response = await this.makeRequest(`/${this.config.chainId}/order`, {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      return {
        orderHash: response.orderHash,
        signature: response.signature,
        data: orderData,
        status: 'active',
        createdAt: Date.now() / 1000,
        remainingMakerAmount: params.makingAmount,
        filledTakerAmount: '0',
      };
    } catch (error) {
      console.error('Failed to create limit order:', error);
      throw error;
    }
  }

  /**
   * Create a TWAP (Time-Weighted Average Price) order
   */
  async createTWAPOrder(params: TWAPOrderParams): Promise<TWAPOrder> {
    try {
      const intervalAmount = Math.floor(Number(params.makingAmount) / params.intervals);
      const childOrders: LimitOrder[] = [];
      
      for (let i = 0; i < params.intervals; i++) {
        const executionTime = (params.startTime || Date.now() / 1000) + (i * params.intervalDuration);
        
        // Create predicate for time-based execution
        const predicate = this.createTimePredicate(executionTime);
        
        const childOrder = await this.createLimitOrder({
          ...params,
          makingAmount: intervalAmount.toString(),
          takingAmount: Math.floor(Number(params.takingAmount) / params.intervals).toString(),
          predicate,
          salt: this.generateSalt(),
        });
        
        childOrders.push(childOrder);
      }

      const twapOrder: TWAPOrder = {
        id: this.generateTWAPId(),
        parentOrderHash: childOrders[0].orderHash, // Use first order as parent
        status: 'active',
        params,
        childOrders,
        totalExecuted: '0',
        totalRemaining: params.makingAmount,
        nextExecutionTime: params.startTime || Date.now() / 1000,
      };

      return twapOrder;
    } catch (error) {
      console.error('Failed to create TWAP order:', error);
      throw error;
    }
  }

  /**
   * Get active orders for a maker
   */
  async getActiveOrders(maker: string, page: number = 1, limit: number = 100): Promise<LimitOrder[]> {
    try {
      const response = await this.makeRequest(
        `/${this.config.chainId}/orders?maker=${maker}&page=${page}&limit=${limit}`
      );
      return response.orders || [];
    } catch (error) {
      console.error('Failed to get active orders:', error);
      throw error;
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderHash: string): Promise<LimitOrder> {
    try {
      const response = await this.makeRequest(`/${this.config.chainId}/order/${orderHash}`);
      return response;
    } catch (error) {
      console.error('Failed to get order status:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderHash: string): Promise<boolean> {
    try {
      await this.makeRequest(`/${this.config.chainId}/order/${orderHash}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  }

  /**
   * Cancel multiple orders
   */
  async cancelOrders(orderHashes: string[]): Promise<boolean> {
    try {
      await this.makeRequest(`/${this.config.chainId}/orders/cancel`, {
        method: 'POST',
        body: JSON.stringify({ orderHashes }),
      });
      return true;
    } catch (error) {
      console.error('Failed to cancel orders:', error);
      throw error;
    }
  }

  /**
   * Get order book for a trading pair
   */
  async getOrderBook(baseToken: string, quoteToken: string, limit: number = 100): Promise<OrderBook> {
    try {
      const response = await this.makeRequest(
        `/${this.config.chainId}/orderbook?base=${baseToken}&quote=${quoteToken}&limit=${limit}`
      );
      return {
        bids: response.bids || [],
        asks: response.asks || [],
      };
    } catch (error) {
      console.error('Failed to get order book:', error);
      throw error;
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(maker: string, page: number = 1, limit: number = 100) {
    try {
      return await this.makeRequest(
        `/${this.config.chainId}/orders/history?maker=${maker}&page=${page}&limit=${limit}`
      );
    } catch (error) {
      console.error('Failed to get order history:', error);
      throw error;
    }
  }

  /**
   * Calculate auction rate (simplified version)
   */
  calculateAuctionRate(orderData: Record<string, unknown>, timestamp: number): number {
    try {
      // Simplified rate calculation - in real implementation use proper SDK
      const startTime = Number(orderData.auctionStartTime) || timestamp;
      const duration = Number(orderData.auctionDuration) || 3600;
      const initialRate = Number(orderData.initialRateBump) || 1000000;
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      return Math.floor(initialRate * (1 - progress));
    } catch (error) {
      console.error('Failed to calculate auction rate:', error);
      return 0;
    }
  }

  /**
   * Calculate auction taking amount
   */
  calculateAuctionTakingAmount(takingAmount: string, rate: number): string {
    try {
      const amount = Number(takingAmount);
      const adjustedAmount = amount * (1 + rate / 10000000); // rate is in basis points
      return adjustedAmount.toString();
    } catch (error) {
      console.error('Failed to calculate auction taking amount:', error);
      return takingAmount;
    }
  }

  /**
   * Create Dutch auction order
   */
  async createDutchAuctionOrder(params: LimitOrderParams & {
    auctionStartTime: number;
    auctionDuration: number;
    initialRateBump: number;
  }): Promise<LimitOrder> {
    try {
      // Create auction data
      const auctionData = {
        auctionStartTime: params.auctionStartTime,
        auctionDuration: params.auctionDuration,
        initialRateBump: params.initialRateBump,
      };

      // Encode auction data as interactions (simplified)
      const interactions = this.encodeAuctionData(auctionData);

      const orderParams = {
        ...params,
        salt: this.generateSalt(),
        interactions,
      };

      return await this.createLimitOrder(orderParams);
    } catch (error) {
      console.error('Failed to create Dutch auction order:', error);
      throw error;
    }
  }

  /**
   * Create stop-loss order
   */
  async createStopLossOrder(params: LimitOrderParams & {
    triggerPrice: string;
    oracle?: string;
  }): Promise<LimitOrder> {
    try {
      const predicate = this.createPricePredicate(params.triggerPrice, params.oracle);
      
      const orderParams = {
        ...params,
        predicate,
        salt: this.generateSalt(),
      };

      return await this.createLimitOrder(orderParams);
    } catch (error) {
      console.error('Failed to create stop-loss order:', error);
      throw error;
    }
  }

  /**
   * Utility: Generate random salt
   */
  private generateSalt(): string {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
  }

  /**
   * Utility: Generate TWAP order ID
   */
  private generateTWAPId(): string {
    return 'twap_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Utility: Create time-based predicate
   */
  private createTimePredicate(executionTime: number): string {
    // This is a simplified predicate - in real implementation, use proper encoding
    return `0x${executionTime.toString(16).padStart(16, '0')}`;
  }

  /**
   * Utility: Create price-based predicate
   */
  private createPricePredicate(triggerPrice: string, oracle?: string): string {
    // This is a simplified predicate - in real implementation, use proper encoding
    const priceHex = Number(triggerPrice).toString(16).padStart(16, '0');
    const oracleHex = oracle ? oracle.slice(2) : '0'.repeat(40);
    return `0x${priceHex}${oracleHex}`;
  }

  /**
   * Utility: Encode auction data
   */
  private encodeAuctionData(data: Record<string, number>): string {
    // This is a simplified encoding - in real implementation, use proper ABI encoding
    const values = Object.values(data);
    return '0x' + values.map(v => v.toString(16).padStart(16, '0')).join('');
  }

  /**
   * Utility: Get supported order types
   */
  getSupportedOrderTypes() {
    return [
      {
        type: 'limit',
        name: 'Limit Order',
        description: 'Standard limit order with fixed price',
        features: ['Fixed price', 'Partial fills', 'Cancellable'],
      },
      {
        type: 'twap',
        name: 'TWAP Order',
        description: 'Time-Weighted Average Price order',
        features: ['Multiple executions', 'Time-based', 'Price averaging'],
      },
      {
        type: 'dutch-auction',
        name: 'Dutch Auction',
        description: 'Price decreases over time until filled',
        features: ['Dynamic pricing', 'Time-based', 'MEV protection'],
      },
      {
        type: 'stop-loss',
        name: 'Stop Loss',
        description: 'Conditional order triggered by price',
        features: ['Price triggers', 'Risk management', 'Automatic execution'],
      },
    ];
  }

  /**
   * Utility: Format order for display
   */
  formatOrder(order: LimitOrder) {
    const filledPercentage = (
      (Number(order.filledTakerAmount) / Number(order.data.takingAmount)) * 100
    ).toFixed(2);

    return {
      ...order,
      filledPercentage: `${filledPercentage}%`,
      remainingPercentage: `${(100 - Number(filledPercentage)).toFixed(2)}%`,
      price: (Number(order.data.takingAmount) / Number(order.data.makingAmount)).toFixed(6),
    };
  }

  /**
   * Utility: Estimate gas for order creation
   */
  estimateGas(orderType: string): number {
    const gasEstimates = {
      limit: 150000,
      twap: 200000,
      'dutch-auction': 180000,
      'stop-loss': 170000,
    };
    
    return gasEstimates[orderType as keyof typeof gasEstimates] || 150000;
  }

  /**
   * Utility: Validate order parameters
   */
  validateOrderParams(params: LimitOrderParams): string[] {
    const errors: string[] = [];
    
    if (!params.maker || !params.maker.match(/^0x[a-fA-F0-9]{40}$/)) {
      errors.push('Invalid maker address');
    }
    
    if (!params.makerAsset || !params.makerAsset.match(/^0x[a-fA-F0-9]{40}$/)) {
      errors.push('Invalid maker asset address');
    }
    
    if (!params.takerAsset || !params.takerAsset.match(/^0x[a-fA-F0-9]{40}$/)) {
      errors.push('Invalid taker asset address');
    }
    
    if (!params.makingAmount || Number(params.makingAmount) <= 0) {
      errors.push('Making amount must be positive');
    }
    
    if (!params.takingAmount || Number(params.takingAmount) <= 0) {
      errors.push('Taking amount must be positive');
    }
    
    return errors;
  }
}

// Factory function
export function createLimitOrderService(config: LimitOrderConfig): LimitOrderService {
  return new LimitOrderService(config);
}

// Default configuration
export const defaultLimitOrderConfig: Partial<LimitOrderConfig> = {
  apiUrl: 'https://api.1inch.dev/orderbook/v4.0',
  // authKey and chainId should come from environment variables
};

// Common chain IDs for limit orders
export const LIMIT_ORDER_CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  BNB: 56,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  AVALANCHE: 43114,
} as const;

export type LimitOrderChainId = typeof LIMIT_ORDER_CHAIN_IDS[keyof typeof LIMIT_ORDER_CHAIN_IDS];
