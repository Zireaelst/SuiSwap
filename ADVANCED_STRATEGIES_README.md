# Advanced Limit Order Strategies for 1inch Protocol

## Overview

The Advanced Limit Order Strategy contract extends the 1inch Limit Order Protocol with sophisticated trading strategies including TWAP (Time-Weighted Average Price), Options, DCA (Dollar Cost Averaging), Grid Trading, and Concentrated Liquidity positions.

## Features

### 🎯 **TWAP Orders**
- Split large orders across multiple time intervals
- Customizable price ranges and execution frequency
- Reduces market impact and improves execution price
- Cross-chain compatibility with Sui blockchain

### 🔮 **Options Trading**
- Create call and put options with custom parameters
- Automated collateral management
- Premium collection and payout mechanisms
- Time-based expiry with profitable execution checks

### 💰 **Dollar Cost Averaging (DCA)**
- Automated recurring purchases
- Customizable frequency and amounts
- Slippage protection
- Portfolio building over time

### 🎯 **Grid Trading**
- Multiple buy/sell orders at different price levels
- Profit from sideways market movements
- Configurable grid spacing and levels
- Automated execution at target prices

### 💧 **Concentrated Liquidity**
- Custom liquidity provision ranges
- Fee collection and management
- Position management and removal
- Integration with AMM protocols

## Smart Contract Architecture

```
AdvancedLimitOrderStrategy.sol
├── TWAP Orders
│   ├── createTWAPOrder()
│   ├── executeTWAPInterval()
│   └── Cross-chain integration
├── Options Trading
│   ├── createOptionOrder()
│   ├── exerciseOption()
│   └── Collateral management
├── DCA Orders
│   ├── createDCAOrder()
│   ├── executeDCAOrder()
│   └── Frequency management
├── Grid Trading
│   ├── createGridTradingOrder()
│   ├── executeGridOrder()
│   └── Multi-level execution
├── Concentrated Liquidity
│   ├── createConcentratedLiquidityPosition()
│   ├── removeLiquidityPosition()
│   └── Fee collection
└── Utility Functions
    ├── Order management
    ├── Status tracking
    └── Emergency controls
```

## Installation & Setup

### Prerequisites
- Node.js 16+
- Hardhat
- Ethers.js v6
- 1inch SDK (optional)

### Installation
```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat node
npx hardhat run scripts/deploy-advanced-strategies.ts --network localhost
```

## Contract Deployment

### Local Deployment
```bash
npx hardhat run scripts/deploy-advanced-strategies.ts --network localhost
```

### Testnet Deployment
```bash
# Sepolia
npx hardhat run scripts/deploy-advanced-strategies.ts --network sepolia

# Polygon Mumbai
npx hardhat run scripts/deploy-advanced-strategies.ts --network mumbai
```

### Mainnet Deployment
```bash
# Ethereum Mainnet
npx hardhat run scripts/deploy-advanced-strategies.ts --network mainnet

# Polygon Mainnet
npx hardhat run scripts/deploy-advanced-strategies.ts --network polygon
```

## Usage Examples

### Frontend Integration

```typescript
import { useAdvancedLimitOrderStrategies } from './hooks/useAdvancedStrategies';

const MyComponent = () => {
  const {
    initializeContract,
    createTWAPOrder,
    createDCAOrder,
    userOrders,
    loading,
    error
  } = useAdvancedLimitOrderStrategies();

  // Initialize contract
  useEffect(() => {
    if (signer && contractAddress) {
      initializeContract(contractAddress, signer);
    }
  }, [signer, contractAddress]);

  // Create TWAP order
  const handleCreateTWAP = async () => {
    await createTWAPOrder({
      tokenIn: "0x...",
      tokenOut: "0x...",
      totalAmount: "1000",
      intervals: 10,
      intervalDuration: 3600,
      minPricePerToken: "0.95",
      maxPricePerToken: "1.05"
    });
  };

  return (
    <AdvancedStrategyDashboard 
      contractAddress={contractAddress}
      signer={signer}
    />
  );
};
```

### Direct Contract Interaction

```solidity
// Create TWAP Order
bytes32 orderHash = strategy.createTWAPOrder(
    tokenIn,
    tokenOut,
    1000 * 10**18,  // 1000 tokens
    10,             // 10 intervals
    3600,           // 1 hour per interval
    95 * 10**16,    // Min price: 0.95
    105 * 10**16,   // Max price: 1.05
    bytes32(0)      // No cross-chain
);

// Execute TWAP interval
strategy.executeTWAPInterval(orderHash, expectedAmountOut);

// Create DCA Order
bytes32 dcaHash = strategy.createDCAOrder(
    tokenIn,
    tokenOut,
    5000 * 10**18,  // 5000 tokens total
    86400,          // Daily frequency
    100 * 10**18,   // 100 tokens per execution
    100             // 1% max slippage
);

// Create Option Order
bytes32 optionHash = strategy.createOptionOrder(
    underlying,
    2000 * 10**18,  // $2000 strike
    0.1 ether,      // 0.1 ETH premium
    block.timestamp + 7 days,
    true,           // Call option
    10 * 10**18     // 10 tokens collateral
);
```

## Strategy Explanations

### TWAP (Time-Weighted Average Price)
TWAP orders split large trades into smaller chunks executed over time, reducing market impact:

```
Total Amount: 1000 USDC → ETH
Intervals: 10
Duration: 1 hour each
Result: 100 USDC swapped every hour for 10 hours
Benefit: Better average price, reduced slippage
```

### Dollar Cost Averaging (DCA)
DCA spreads purchases over time to reduce volatility impact:

```
Total: $5000 → BTC
Frequency: Weekly
Amount: $100 per week
Duration: 50 weeks
Benefit: Reduced timing risk, smoother entry
```

### Grid Trading
Grid trading profits from price oscillations:

```
Base Price: $2000 ETH
Grid Levels: 10
Price Step: $50
Orders:
- Buy at $1950, $1900, $1850...
- Sell at $2050, $2100, $2150...
Benefit: Profit from sideways movement
```

### Options
Create synthetic options with customizable parameters:

```
Call Option:
- Underlying: ETH
- Strike: $2500
- Premium: 0.1 ETH
- Expiry: 7 days
- Collateral: 10 ETH
Benefit: Leverage, hedging, yield generation
```

## Risk Management

### Built-in Protections
- **Price validation**: Min/max price checks for TWAP
- **Slippage protection**: Maximum slippage limits for DCA
- **Time locks**: Option expiry enforcement
- **Collateral requirements**: Automatic collateral management
- **Access controls**: Only order creators can cancel

### Best Practices
1. **Start small**: Test with small amounts first
2. **Set reasonable parameters**: Avoid extreme price ranges
3. **Monitor execution**: Check order progress regularly
4. **Manage risk**: Don't over-leverage or over-concentrate
5. **Understand costs**: Factor in gas fees and protocol fees

## Integration with 1inch

### Price Feeds
```typescript
// Integrate with 1inch API for real-time quotes
const getExpectedAmountOut = async (tokenIn, tokenOut, amountIn) => {
  const response = await fetch(`https://api.1inch.io/v5.0/1/quote?fromTokenAddress=${tokenIn}&toTokenAddress=${tokenOut}&amount=${amountIn}`);
  const data = await response.json();
  return data.toTokenAmount;
};
```

### Swap Execution
```typescript
// Use 1inch for actual swaps in execution functions
const executeSwap = async (tokenIn, tokenOut, amountIn, minAmountOut) => {
  const swapParams = {
    fromTokenAddress: tokenIn,
    toTokenAddress: tokenOut,
    amount: amountIn,
    fromAddress: contractAddress,
    slippage: 1,
    disableEstimate: false,
    allowPartialFill: false
  };
  
  const response = await fetch('https://api.1inch.io/v5.0/1/swap', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(swapParams)
  });
  
  const swapData = await response.json();
  return swapData.tx;
};
```

## Gas Optimization

### Batch Operations
```solidity
// Execute multiple orders in a single transaction
function batchExecuteOrders(
    bytes32[] calldata orderHashes,
    uint8[] calldata orderTypes,
    bytes[] calldata executionData
) external;
```

### Efficient Storage
- Packed structs to minimize storage slots
- Mapping-based storage for O(1) lookups
- Event-based order tracking

## Security Considerations

### Auditing
- [ ] External security audit recommended
- [ ] Formal verification for critical functions
- [ ] Bug bounty program for additional security

### Access Controls
- Owner-only functions for protocol parameters
- User-only access for order management
- Emergency pause functionality

### Reentrancy Protection
- ReentrancyGuard on all external functions
- Checks-Effects-Interactions pattern
- Safe token transfer patterns

## Testing

### Unit Tests
```bash
npx hardhat test test/AdvancedLimitOrderStrategy.test.js
```

### Integration Tests
```bash
npx hardhat test test/integration/
```

### Gas Analysis
```bash
npx hardhat test --gas-report
```

## Frontend Components

### Dashboard Component
```typescript
<AdvancedStrategyDashboard 
  contractAddress="0x..."
  signer={signer}
/>
```

### Individual Strategy Components
```typescript
<TWAPOrderForm onSubmit={createTWAPOrder} />
<DCAOrderForm onSubmit={createDCAOrder} />
<GridTradingForm onSubmit={createGridOrder} />
<OptionsForm onSubmit={createOptionOrder} />
<LiquidityForm onSubmit={createLiquidityPosition} />
```

## API Reference

### Core Functions

#### TWAP Orders
```solidity
function createTWAPOrder(
    IERC20 tokenIn,
    IERC20 tokenOut,
    uint256 totalAmount,
    uint256 intervals,
    uint256 intervalDuration,
    uint256 minPricePerToken,
    uint256 maxPricePerToken,
    bytes32 suiOrderHash
) external returns (bytes32 orderHash);

function executeTWAPInterval(
    bytes32 orderHash,
    uint256 amountOut
) external;
```

#### DCA Orders
```solidity
function createDCAOrder(
    IERC20 tokenIn,
    IERC20 tokenOut,
    uint256 totalAmount,
    uint256 frequency,
    uint256 amountPerExecution,
    uint256 maxSlippage
) external returns (bytes32 orderHash);

function executeDCAOrder(
    bytes32 orderHash,
    uint256 amountOut
) external;
```

#### Options
```solidity
function createOptionOrder(
    IERC20 underlying,
    uint256 strikePrice,
    uint256 premium,
    uint256 expiry,
    bool isCall,
    uint256 collateralAmount
) external returns (bytes32 orderHash);

function exerciseOption(
    bytes32 orderHash,
    uint256 currentPrice
) external payable;
```

### View Functions
```solidity
function getOrderStatus(bytes32 orderHash, uint8 orderType) 
    external view returns (bool isActive, uint256 executedAmount, uint256 totalAmount);

function getUserTWAPOrders(address user) external view returns (bytes32[] memory);
function getUserDCAOrders(address user) external view returns (bytes32[] memory);
function getUserOptionOrders(address user) external view returns (bytes32[] memory);
```

## Events

```solidity
event TWAPOrderCreated(bytes32 indexed orderHash, address indexed maker, uint256 totalAmount);
event TWAPOrderExecuted(bytes32 indexed orderHash, uint256 amountIn, uint256 amountOut);
event DCAOrderCreated(bytes32 indexed orderHash, address indexed maker);
event DCAOrderExecuted(bytes32 indexed orderHash, uint256 amountIn, uint256 amountOut);
event OptionOrderCreated(bytes32 indexed orderHash, address indexed maker, uint256 strikePrice);
event OptionExecuted(bytes32 indexed orderHash, address indexed executor);
```

## Cross-Chain Integration

### Sui Blockchain Support
The contract includes integration hooks for cross-chain orders with Sui:

```solidity
function createCrossChainOrder(
    bytes32 orderHash,
    bytes32 suiOrderHash,
    uint256 amount,
    bytes32 hashlock,
    uint256 timelock
) external;
```

### HTLC Integration
Uses Hash Time Lock Contracts for secure cross-chain swaps:
- Atomic execution across chains
- Hashlock/timelock security
- Partial fill support
- Refund mechanisms

## Roadmap

### Phase 1: Core Strategies ✅
- [x] TWAP Orders
- [x] DCA Orders
- [x] Options Trading
- [x] Grid Trading
- [x] Concentrated Liquidity

### Phase 2: Advanced Features 🚧
- [ ] Yield farming strategies
- [ ] Arbitrage detection
- [ ] MEV protection
- [ ] Advanced order types

### Phase 3: Ecosystem Integration 🔄
- [ ] 1inch Fusion+ integration
- [ ] Uniswap V4 hooks
- [ ] Cross-chain bridge optimization
- [ ] DAO governance

## Support & Documentation

### Resources
- [Contract Documentation](./docs/contracts.md)
- [Frontend Integration Guide](./docs/frontend.md)
- [API Reference](./docs/api.md)
- [Security Guide](./docs/security.md)

### Community
- Discord: [KATA Protocol](https://discord.gg/kata-protocol)
- Telegram: [@kata_protocol](https://t.me/kata_protocol)
- Twitter: [@kata_protocol](https://twitter.com/kata_protocol)

### Contributing
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

**⚠️ Disclaimer**: This software is in development and has not been audited. Use at your own risk. Always test thoroughly on testnets before mainnet deployment.
