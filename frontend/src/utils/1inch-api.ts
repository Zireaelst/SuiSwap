const ONEINCH_API_BASE = 'https://api.1inch.dev';

export interface TokenInfo {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI?: string;
    tags?: string[];
}

export interface WalletTransaction {
    id: string;
    details: {
        txHash: string;
        type: string;
        timestamp: string;
        value: string;
        gasUsed: string;
        gasPrice: string;
    };
}

export interface TokenBalance {
    [tokenAddress: string]: string;
}

export interface PortfolioData {
    current_value: {
        [address: string]: {
            total_value_usd: number;
            abs_profit_usd: number;
            roi: number;
            tokens: Array<{
                token_address: string;
                balance: string;
                value_usd: number;
                price_usd: number;
            }>;
        };
    };
}

export interface ChartData {
    timestamps: number[];
    prices: number[];
    volumes: number[];
}

export class OneInchAPI {
    private apiKey: string;
    private rateLimitDelay: number = 1000; // 1 second delay for rate limiting

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async request(endpoint: string, params?: Record<string, unknown>, method: 'GET' | 'POST' = 'GET') {
        const url = new URL(`${ONEINCH_API_BASE}${endpoint}`);
        
        const options: RequestInit = {
            method,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        if (method === 'GET' && params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, value.toString());
                }
            });
        } else if (method === 'POST' && params) {
            options.body = JSON.stringify(params);
        }

        const response = await fetch(url.toString(), options);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // Add rate limiting delay
        await this.delay(this.rateLimitDelay);

        return response.json();
    }

    // ==================== PRICE API ====================
    
    async getWhitelistedTokenPrices(chainId: number = 1) {
        return this.request(`/price/v1.1/${chainId}`);
    }

    async getTokenPrices(chainId: number, tokenAddresses: string[]) {
        if (tokenAddresses.length === 1) {
            return this.request(`/price/v1.1/${chainId}/${tokenAddresses[0]}`);
        }
        return this.request(`/price/v1.1/${chainId}/${tokenAddresses.join(',')}`);
    }

    async getRequestedTokenPrices(chainId: number, tokens: string[]) {
        return this.request(`/price/v1.1/${chainId}`, { tokens }, 'POST');
    }

    // ==================== TOKEN API ====================
    
    async searchTokens(query: string, chainId: number, limit: number = 10, ignoreListedStatus: boolean = false) {
        return this.request(`/token/v1.2/${chainId}/search`, {
            query,
            limit,
            ignore_listed: ignoreListedStatus.toString()
        });
    }

    async getTokensInfo(chainId: number, addresses: string[]): Promise<{ [address: string]: TokenInfo }> {
        return this.request(`/token/v1.2/${chainId}/custom/${addresses.join(',')}`);
    }

    async getAllTokensInfo(chainId: number, provider: string = '1inch') {
        return this.request(`/token/v1.2/${chainId}`, { provider });
    }

    async get1inchTokenList(chainId: number, provider: string = '1inch') {
        return this.request(`/token/v1.2/${chainId}/token-list`, { provider });
    }

    // ==================== BALANCE API ====================
    
    async getWalletBalances(chainId: number, walletAddress: string): Promise<TokenBalance> {
        return this.request(`/balance/v1.2/${chainId}/balances/${walletAddress}`);
    }

    // ==================== HISTORY API ====================
    
    async getWalletHistory(address: string, chainId: number = 1, limit: number = 10): Promise<WalletTransaction[]> {
        const response = await this.request(`/history/v2.0/history/${address}/events`, {
            chainId,
            limit
        });
        return response.items || [];
    }

    // ==================== PORTFOLIO API ====================
    
    async getCurrentValue(walletAddress: string, chainId: number = 1) {
        return this.request(`/portfolio/portfolio/v4/overview/erc20/current_value`, {
            addresses: walletAddress,
            chain_id: chainId
        });
    }

    async getProfitAndLoss(
        walletAddress: string, 
        chainId: number = 1, 
        fromTimestamp: string = '2023-01-01T00:00:00Z',
        toTimestamp: string = new Date().toISOString()
    ) {
        return this.request(`/portfolio/portfolio/v4/overview/erc20/profit_and_loss`, {
            addresses: walletAddress,
            chain_id: chainId,
            from_timestamp: fromTimestamp,
            to_timestamp: toTimestamp
        });
    }

    async getTokenDetails(walletAddress: string, chainId: number = 1) {
        return this.request(`/portfolio/portfolio/v4/overview/erc20/details`, {
            addresses: walletAddress,
            chain_id: chainId
        });
    }

    // ==================== CHARTS API ====================
    
    async getChartData(
        tokenAddress: string, 
        chainId: number = 1, 
        timeframe: '1h' | '4h' | '1d' | '1w' = '1d',
        limit: number = 100
    ): Promise<ChartData> {
        return this.request(`/charts/v1/${chainId}/chart/${tokenAddress}`, {
            timeframe,
            limit
        });
    }

    // ==================== WEB3 RPC API ====================
    
    async web3Request(method: string, params: unknown[] = [], chainId: number = 1) {
        return this.request(`/web3/${chainId}`, {
            jsonrpc: '2.0',
            method,
            params,
            id: 1
        }, 'POST');
    }

    async getBalance(address: string, chainId: number = 1) {
        return this.web3Request('eth_getBalance', [address, 'latest'], chainId);
    }

    // ==================== SWAP API ====================
    
    async getSwapQuote(chainId: number, params: {
        src: string;
        dst: string;
        amount: string;
        from: string;
        slippage: number;
    }) {
        return this.request(`/swap/v5.2/${chainId}/quote`, params);
    }

    async getSwapTransaction(chainId: number, params: {
        src: string;
        dst: string;
        amount: string;
        from: string;
        slippage: number;
        referrer?: string;
        fee?: number;
    }) {
        return this.request(`/swap/v5.2/${chainId}/swap`, params);
    }

    // ==================== UTILITY METHODS ====================
    
    async getMultipleTokenPrices(chainId: number, tokenAddresses: string[]) {
        const batchSize = 10; // API limit for batch requests
        const results: Record<string, number> = {};
        
        for (let i = 0; i < tokenAddresses.length; i += batchSize) {
            const batch = tokenAddresses.slice(i, i + batchSize);
            const prices = await this.getTokenPrices(chainId, batch);
            Object.assign(results, prices);
        }
        
        return results;
    }

    async getCompleteWalletData(walletAddress: string, chainId: number = 1) {
        const [balances, history, currentValue, tokenDetails] = await Promise.all([
            this.getWalletBalances(chainId, walletAddress),
            this.getWalletHistory(walletAddress, chainId),
            this.getCurrentValue(walletAddress, chainId),
            this.getTokenDetails(walletAddress, chainId)
        ]);

        return {
            balances,
            history,
            currentValue,
            tokenDetails
        };
    }
}

// Export a singleton instance for ease of use
let oneInchAPIInstance: OneInchAPI | null = null;

export const getOneInchAPI = (apiKey?: string): OneInchAPI => {
    if (!oneInchAPIInstance && apiKey) {
        oneInchAPIInstance = new OneInchAPI(apiKey);
    }
    
    if (!oneInchAPIInstance) {
        throw new Error('OneInch API not initialized. Please provide an API key.');
    }
    
    return oneInchAPIInstance;
};

export default OneInchAPI;
