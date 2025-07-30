const ONEINCH_API_BASE = 'https://api.1inch.dev';

export class OneInchAPI {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async request(endpoint: string, params?: Record<string, any>) {
        const url = new URL(`${ONEINCH_API_BASE}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value.toString());
            });
        }

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        return response.json();
    }

    // Price API
    async getTokenPrice(chainId: number, tokenAddress: string) {
        return this.request(`/price/v1.1/${chainId}/${tokenAddress}`);
    }

    // Balance API
    async getWalletBalances(chainId: number, walletAddress: string) {
        return this.request(`/balance/v1.2/${chainId}/balances/${walletAddress}`);
    }

    // Swap API
    async getSwapQuote(chainId: number, params: {
        src: string;
        dst: string;
        amount: string;
        from: string;
        slippage: number;
    }) {
        return this.request(`/swap/v5.2/${chainId}/quote`, params);
    }

    // Token Info API
    async getTokenInfo(chainId: number, tokenAddress: string) {
        return this.request(`/token/v1.2/${chainId}/${tokenAddress}`);
    }

    // Portfolio API
    async getPortfolioOverview(addresses: string[]) {
        return this.request('/portfolio/portfolio/v4/overview/erc20', {
            addresses: addresses.join(',')
        });
    }
}
