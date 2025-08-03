// services/FusionPlusService.ts
// Basit Fusion+ entegrasyonu - workshop'tan öğrendiklerimize göre

export interface FusionPlusConfig {
  apiUrl: string;
  authKey: string;
}

export interface CrossChainQuoteParams {
  srcChainId: number;
  dstChainId: number;
  srcTokenAddress: string;
  dstTokenAddress: string;
  amount: string;
  walletAddress: string;
}

export interface CrossChainOrder {
  orderHash: string;
  srcChainId: number;
  dstChainId: number;
  srcToken: string;
  dstToken: string;
  srcAmount: string;
  dstAmount: string;
  maker: string;
  status: 'pending' | 'filled' | 'cancelled' | 'expired';
  createdAt: number;
  expiresAt: number;
  secretHash?: string;
}

export interface FusionPlusOrderParams {
  walletAddress: string;
  secretsCount?: number;
  fee?: {
    takingFeeBps: number; // 100 == 1%
    takingFeeReceiver: string;
  };
}

/**
 * Fusion+ Service - Cross-chain swap management
 * Based on 1inch Fusion+ workshop documentation
 */
export class FusionPlusService {
  private config: FusionPlusConfig;
  private baseUrl: string;

  constructor(config: FusionPlusConfig) {
    this.config = config;
    this.baseUrl = config.apiUrl || 'https://api.1inch.dev/fusion-plus';
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
        throw new Error(`Fusion+ API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fusion+ API request failed:', error);
      throw error;
    }
  }

  /**
   * Get active cross-chain orders
   */
  async getActiveOrders(page: number = 1, limit: number = 10): Promise<{ items: CrossChainOrder[]; total: number }> {
    try {
      return await this.makeRequest(`/orders/active?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Failed to get active orders:', error);
      throw error;
    }
  }

  /**
   * Get orders by maker address
   */
  async getOrdersByMaker(address: string, page: number = 1, limit: number = 10): Promise<{ items: CrossChainOrder[]; total: number }> {
    try {
      return await this.makeRequest(`/orders/maker/${address}?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Failed to get orders by maker:', error);
      throw error;
    }
  }

  /**
   * Get quote for cross-chain swap
   */
  async getQuote(params: CrossChainQuoteParams) {
    try {
      return await this.makeRequest('/quote', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (error) {
      console.error('Failed to get quote:', error);
      throw error;
    }
  }

  /**
   * Check if order is ready to accept secret fills
   */
  async getReadyToAcceptSecretFills(orderHash: string) {
    try {
      return await this.makeRequest(`/orders/${orderHash}/ready-to-accept-secret-fills`);
    } catch (error) {
      console.error('Failed to check secret fills readiness:', error);
      throw error;
    }
  }

  /**
   * Check if ready to execute public actions
   */
  async getReadyToExecutePublicActions() {
    try {
      return await this.makeRequest('/ready-to-execute-public-actions');
    } catch (error) {
      console.error('Failed to check public actions readiness:', error);
      throw error;
    }
  }

  /**
   * Get published secrets for an order
   */
  async getPublishedSecrets(orderHash: string) {
    try {
      return await this.makeRequest(`/orders/${orderHash}/published-secrets`);
    } catch (error) {
      console.error('Failed to get published secrets:', error);
      throw error;
    }
  }

  /**
   * Submit secret for order completion
   */
  async submitSecret(orderHash: string, secret: string) {
    try {
      return await this.makeRequest(`/orders/${orderHash}/submit-secret`, {
        method: 'POST',
        body: JSON.stringify({ secret }),
      });
    } catch (error) {
      console.error('Failed to submit secret:', error);
      throw error;
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderHash: string): Promise<CrossChainOrder> {
    try {
      return await this.makeRequest(`/orders/${orderHash}/status`);
    } catch (error) {
      console.error('Failed to get order status:', error);
      throw error;
    }
  }

  /**
   * Utility: Generate supported chain pairs for Fusion+
   */
  getSupportedChainPairs() {
    return [
      { src: 1, dst: 100, srcName: 'Ethereum', dstName: 'Gnosis', name: 'Ethereum → Gnosis' },
      { src: 1, dst: 137, srcName: 'Ethereum', dstName: 'Polygon', name: 'Ethereum → Polygon' },
      { src: 137, dst: 1, srcName: 'Polygon', dstName: 'Ethereum', name: 'Polygon → Ethereum' },
      { src: 100, dst: 1, srcName: 'Gnosis', dstName: 'Ethereum', name: 'Gnosis → Ethereum' },
      { src: 1, dst: 56, srcName: 'Ethereum', dstName: 'BNB Chain', name: 'Ethereum → BNB Chain' },
      { src: 56, dst: 1, srcName: 'BNB Chain', dstName: 'Ethereum', name: 'BNB Chain → Ethereum' },
    ];
  }

  /**
   * Utility: Get network information
   */
  getNetworkInfo(chainId: number) {
    const networks: Record<number, { name: string; symbol: string; color: string; icon: string }> = {
      1: { name: 'Ethereum', symbol: 'ETH', color: 'blue', icon: '⟠' },
      137: { name: 'Polygon', symbol: 'MATIC', color: 'purple', icon: '⬟' },
      100: { name: 'Gnosis', symbol: 'xDAI', color: 'green', icon: '◆' },
      56: { name: 'BNB Chain', symbol: 'BNB', color: 'yellow', icon: '⬢' },
      42161: { name: 'Arbitrum', symbol: 'ARB', color: 'cyan', icon: '▲' },
      10: { name: 'Optimism', symbol: 'OP', color: 'red', icon: '⊙' },
    };

    return networks[chainId] || { name: 'Unknown', symbol: '?', color: 'gray', icon: '?' };
  }

  /**
   * Utility: Generate random secret for HTLC
   */
  generateSecret(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for Node.js environment
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return '0x' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Utility: Hash a secret (simplified version)
   */
  hashSecret(secret: string): string {
    // In real implementation, use proper hashing library
    // This is a simplified version for demonstration
    const encoder = new TextEncoder();
    const data = encoder.encode(secret);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
  }

  /**
   * Utility: Format time remaining
   */
  formatTimeRemaining(expiresAt: number): string {
    const now = Date.now() / 1000;
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}

// Factory function for easy service creation
export function createFusionPlusService(config: FusionPlusConfig): FusionPlusService {
  return new FusionPlusService(config);
}

// Default configuration
export const defaultFusionPlusConfig: Partial<FusionPlusConfig> = {
  apiUrl: "https://api.1inch.dev/fusion-plus",
  // authKey should come from environment variables
};

// Chain IDs for common networks
export const CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  GNOSIS: 100,
  BNB: 56,
  ARBITRUM: 42161,
  OPTIMISM: 10,
} as const;

// Export types
export type SupportedChainId = typeof CHAIN_IDS[keyof typeof CHAIN_IDS];
