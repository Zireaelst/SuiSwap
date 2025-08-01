export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  balanceFormatted: string;
}

export interface TokenPair {
  token0: Token;
  token1: Token;
}
