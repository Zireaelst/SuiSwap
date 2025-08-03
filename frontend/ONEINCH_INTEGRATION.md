# 1inch API Integration

This comprehensive implementation integrates all major 1inch APIs into the KATA Protocol project, providing a complete DeFi analytics and trading platform.

## 🚀 Features

### Integrated APIs
- **Price API** - Real-time token prices and market data
- **Balance API** - Wallet token balances across multiple chains
- **History API** - Transaction history and wallet activity
- **Portfolio API** - Portfolio analytics with P&L tracking
- **Token API** - Token information, search, and metadata
- **Charts API** - Price charts and historical data
- **Web3 RPC API** - Direct blockchain interactions
- **Swap API** - Token exchange quotes and transactions

### Components
- **OneInchDashboard** - Complete wallet analytics dashboard
- **AdvancedTradingInterface** - Professional trading interface with charts
- **Real-time Price Charts** - Interactive charts with multiple timeframes
- **Token Search & Discovery** - Advanced token search and filtering
- **Portfolio Tracking** - Comprehensive portfolio management

## 🛠️ Setup

### 1. Get 1inch API Key
Visit the [1inch Developer Portal](https://portal.1inch.dev/) to get your free API key.

### 2. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env.local

# Add your API key to .env.local
NEXT_PUBLIC_ONEINCH_API_KEY=your_api_key_here
ONEINCH_API_KEY=your_api_key_here
```

### 3. Install Dependencies
```bash
npm install
# or
yarn install
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

### 5. Access the Integration
Navigate to `/oneinch` in your browser to access the 1inch API integration hub.

## 📖 Usage Examples

### Basic API Usage
```typescript
import { getOneInchAPI } from '@/utils/1inch-api';

// Initialize API
const api = getOneInchAPI('your-api-key');

// Get token prices
const prices = await api.getTokenPrices(1, ['0x111111111117dc0aa78b770fa6a738034120c302']);

// Get wallet balances
const balances = await api.getWalletBalances(1, '0x...');

// Get transaction history
const history = await api.getWalletHistory('0x...', 1, 10);
```

### Using React Hooks
```typescript
import { useTokenPrices, useWalletBalances } from '@/hooks/useOneInchData';

function MyComponent() {
    const { prices, loading, error } = useTokenPrices(1, tokenAddresses, apiKey);
    const { balances } = useWalletBalances(1, walletAddress, apiKey);
    
    // Component logic here
}
```

### API Routes
The implementation includes ready-to-use API routes:

- `GET /api/prices` - Token prices
- `GET /api/balances` - Wallet balances  
- `GET /api/history` - Transaction history
- `GET /api/portfolio` - Portfolio data
- `GET /api/tokens/search` - Token search
- `GET /api/charts` - Chart data

## 🔧 Available Scripts

### Price API
```typescript
// Get whitelisted token prices
await api.getWhitelistedTokenPrices(1);

// Get specific token prices
await api.getTokenPrices(1, ['0x...', '0x...']);

// Get requested token prices (POST)
await api.getRequestedTokenPrices(1, ['0x...']);
```

### Balance API
```typescript
// Get wallet token balances
await api.getWalletBalances(1, '0x...');
```

### History API
```typescript
// Get wallet transaction history
await api.getWalletHistory('0x...', 1, 10);
```

### Portfolio API
```typescript
// Get current portfolio value
await api.getCurrentValue('0x...', 1);

// Get profit and loss data
await api.getProfitAndLoss('0x...', 1, fromDate, toDate);

// Get detailed token information
await api.getTokenDetails('0x...', 1);
```

### Token API
```typescript
// Search tokens
await api.searchTokens('ethereum', 1, 10);

// Get token information
await api.getTokensInfo(1, ['0x...']);

// Get all supported tokens
await api.getAllTokensInfo(1);

// Get 1inch token list
await api.get1inchTokenList(1);
```

### Charts API
```typescript
// Get chart data
await api.getChartData('0x...', 1, '1d', 100);
```

### Web3 RPC API
```typescript
// Get ETH balance
await api.getBalance('0x...', 1);

// Make custom Web3 RPC calls
await api.web3Request('eth_getBalance', ['0x...', 'latest'], 1);
```

## 🎨 Components

### OneInchDashboard
A comprehensive dashboard showing:
- ETH balance
- Token count
- Transaction history
- Portfolio value
- Detailed balance breakdown
- Transaction list
- Portfolio analytics

```typescript
<OneInchDashboard apiKey="your-api-key" />
```

### AdvancedTradingInterface  
A professional trading interface featuring:
- Token search and discovery
- Real-time price charts
- Multiple timeframes (1h, 4h, 1d, 1w)
- Popular token prices
- Swap interface
- Price change indicators

```typescript
<AdvancedTradingInterface apiKey="your-api-key" />
```

## 🌐 Supported Networks

- Ethereum Mainnet (1)
- Polygon (137)
- BNB Chain (56)
- Arbitrum (42161)
- Optimism (10)
- Avalanche (43114)
- And many more...

## 📊 Rate Limiting

The implementation includes built-in rate limiting to comply with 1inch API limits:
- Free tier: 1 request per second
- Automatic delays between requests
- Error handling for rate limit violations

## 🔒 Security

- API keys are handled securely
- Environment variables for sensitive data
- Client-side and server-side API key protection
- CORS configuration for API routes

## 🚀 Deployment

### Environment Variables
Set these environment variables in your deployment:

```bash
NEXT_PUBLIC_ONEINCH_API_KEY=your_public_api_key
ONEINCH_API_KEY=your_server_api_key
```

### Build & Deploy
```bash
npm run build
npm start
```

## 📝 Examples

### Complete Wallet Analysis
```typescript
const walletData = await api.getCompleteWalletData('0x...', 1);
// Returns: balances, history, currentValue, tokenDetails
```

### Multi-Token Price Fetching
```typescript
const prices = await api.getMultipleTokenPrices(1, tokenAddresses);
```

### Real-time Portfolio Tracking
```typescript
const { portfolioData, loading, error, refetch } = usePortfolio('0x...', 1, apiKey);
```

## 🛠️ Customization

### Adding New API Endpoints
1. Add method to `OneInchAPI` class in `utils/1inch-api.ts`
2. Create corresponding hook in `hooks/useOneInchData.ts`
3. Add API route in `app/api/[endpoint]/route.ts`
4. Update components to use new functionality

### Styling & Theming
The components use Tailwind CSS and shadcn/ui components for consistent styling that matches your project theme.

## 📚 API Documentation

For detailed API documentation, visit:
- [1inch Developer Portal](https://portal.1inch.dev/)
- [1inch API Documentation](https://docs.1inch.io/)

## 🐛 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify API key is correct
   - Check environment variables
   - Ensure API key has proper permissions

2. **Rate Limiting**
   - Reduce request frequency
   - Implement request queuing
   - Consider upgrading API plan

3. **CORS Issues**
   - Use server-side API routes for sensitive calls
   - Check CORS configuration

4. **Network Issues**
   - Verify network/chain ID is supported
   - Check wallet address format
   - Ensure token addresses are valid

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This integration is part of the KATA Protocol project and follows the same licensing terms.
