# 1inch API Integration Guide

## Overview
Bu proje, 1inch API'sinin tüm özelliklerini React frontend'e entegre eder. Swap, portfolio analizi, token bilgileri ve işlem geçmişi gibi tüm 1inch özelliklerini destekler.

## Kurulum

### 1. Environment Variables
`.env.local` dosyasında aşağıdaki değişkenlerin ayarlandığından emin olun:

```bash
# 1inch API Configuration
NEXT_PUBLIC_1INCH_API_KEY=your_api_key_here
NEXT_PUBLIC_ONEINCH_DEV_PORTAL_API_KEY=your_api_key_here

# Default Chain IDs
NEXT_PUBLIC_DEFAULT_CHAIN_ID=1
NEXT_PUBLIC_SUI_CHAIN_ID=101

# API Endpoints (pre-configured)
NEXT_PUBLIC_ONEINCH_API_BASE=https://api.1inch.dev
NEXT_PUBLIC_ONEINCH_SPOT_PRICE_API=https://api.1inch.dev/price/v1.1
NEXT_PUBLIC_ONEINCH_PORTFOLIO_API=https://api.1inch.dev/portfolio/v4
NEXT_PUBLIC_ONEINCH_BALANCE_API=https://api.1inch.dev/balance/v1.2
NEXT_PUBLIC_ONEINCH_HISTORY_API=https://api.1inch.dev/history/v2.0
NEXT_PUBLIC_ONEINCH_SWAP_API=https://api.1inch.dev/swap/v6.0
NEXT_PUBLIC_ONEINCH_TOKEN_API=https://api.1inch.dev/token/v1.2
```

### 2. API Key
1inch Developer Portal'dan API key alın: https://portal.1inch.dev/
API key'i `.env.local` dosyasında `NEXT_PUBLIC_1INCH_API_KEY` olarak ekleyin.

## Kullanılabilir Components

### 1. OneInchDashboard
Comprehensive 1inch dashboard with:
- Token balances
- Portfolio analytics
- Transaction history
- Available tokens

```tsx
import { OneInchDashboard } from '@/components/OneInchDashboard';

<OneInchDashboard 
  walletAddress="0x..." 
  chainId={1}
/>
```

### 2. ModernSwapInterface
Advanced swap interface with 1inch integration:
- Real-time quotes
- Token search
- Price monitoring
- Swap execution

```tsx
import ModernSwapInterface from '@/components/ModernSwapInterface-Fixed';

<ModernSwapInterface />
```

## Hooks

### useOneInch Hook System
Unified hook system providing all 1inch API functionality:

```tsx
import {
  useOneInchTokens,
  useOneInchPrices,
  useOneInchBalances,
  useOneInchPortfolio,
  useOneInchHistory,
  useOneInchSwap,
  isAPIConfigured
} from '@/hooks/useOneInch';

// Example usage
const { tokens, loading: tokensLoading, error: tokensError } = useOneInchTokens(1);
const { prices } = useOneInchPrices(1, ['0xA0b86a33E6441E3'], { enabled: true });
const { balances } = useOneInchBalances(1, '0x...', { enabled: true });
```

## API Features

### 1. Token Management
- Get all available tokens for a chain
- Token metadata (name, symbol, decimals)
- Token logos and descriptions

### 2. Price Data
- Real-time token prices
- Multi-token price fetching
- USD and ETH denominated prices

### 3. Wallet Balances
- Token balances for any wallet
- Automatic balance formatting
- Zero balance filtering

### 4. Portfolio Analytics
- Portfolio value tracking
- Profit/Loss calculations
- ROI analysis
- Historical performance

### 5. Transaction History
- Complete transaction history
- Transaction details and metadata
- Transaction categorization

### 6. Swap Functionality
- Get swap quotes
- Execute swaps
- Slippage protection
- MEV protection

## Error Handling
Tüm hooks otomatik error handling ve retry logic içerir:

```tsx
const { data, loading, error, refetch } = useOneInchTokens(chainId);

if (error) {
  console.error('1inch API Error:', error);
}
```

## Rate Limiting
API calls otomatik olarak rate limit'e uyar. Excessive istekler önlenir.

## Development
```bash
npm run dev
```

Frontend http://localhost:3000 adresinde çalışacaktır.

## Production
API key'lerinizi production environment'da güvenli şekilde saklayın.

## Support
1inch API documentation: https://docs.1inch.io/
