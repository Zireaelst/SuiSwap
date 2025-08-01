import { useState } from 'react';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
}

const POPULAR_TOKENS: Token[] = [
  {
    address: '0xA0b86a33E6441e8e18e4e0b576F3A1B1b6e33b8e',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logoURI: '/tokens/eth.png',
    chainId: 1,
  },
  {
    address: '0xA0b86a33E6441e8e18e4e0b576F3A1B1b6e33b8e',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: '/tokens/usdc.png',
    chainId: 1,
  },
  {
    address: '0xA0b86a33E6441e8e18e4e0b576F3A1B1b6e33b8e',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoURI: '/tokens/usdt.png',
    chainId: 1,
  },
];

export function useTokenList() {
  const [tokens] = useState<Token[]>(POPULAR_TOKENS);
  const [isLoading, setIsLoading] = useState(false);

  const searchTokens = async (query: string): Promise<Token[]> => {
    if (!query) return POPULAR_TOKENS;
    
    setIsLoading(true);
    try {
      // TODO: Implement actual token search API
      const filtered = POPULAR_TOKENS.filter(token =>
        token.symbol.toLowerCase().includes(query.toLowerCase()) ||
        token.name.toLowerCase().includes(query.toLowerCase())
      );
      return filtered;
    } catch (error) {
      console.error('Error searching tokens:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tokens,
    isLoading,
    searchTokens,
  };
}
