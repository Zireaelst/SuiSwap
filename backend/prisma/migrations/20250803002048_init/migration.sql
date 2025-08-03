-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ethereumAddress" TEXT NOT NULL,
    "suiAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "limit_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenIn" TEXT NOT NULL,
    "tokenOut" TEXT NOT NULL,
    "amountIn" TEXT NOT NULL,
    "targetPrice" TEXT NOT NULL,
    "minAmountOut" TEXT NOT NULL,
    "sourceChain" TEXT NOT NULL,
    "targetChain" TEXT,
    "oneInchOrderId" TEXT,
    "oneInchOrderHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expirationDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFilled" BOOLEAN NOT NULL DEFAULT false,
    "filledAmount" TEXT NOT NULL DEFAULT '0',
    "txHash" TEXT,
    "gasUsed" TEXT,
    "executedPrice" TEXT,
    "slippage" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "limit_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "twap_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenIn" TEXT NOT NULL,
    "tokenOut" TEXT NOT NULL,
    "totalAmount" TEXT NOT NULL,
    "targetPrice" TEXT,
    "intervalMinutes" INTEGER NOT NULL,
    "totalIntervals" INTEGER NOT NULL,
    "completedIntervals" INTEGER NOT NULL DEFAULT 0,
    "amountPerInterval" TEXT NOT NULL,
    "sourceChain" TEXT NOT NULL,
    "targetChain" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalExecuted" TEXT NOT NULL DEFAULT '0',
    "averagePrice" TEXT,
    "priceDeviation" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "nextExecution" DATETIME,
    CONSTRAINT "twap_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "twap_executions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "twapOrderId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "slippage" REAL,
    "gasUsed" TEXT,
    "txHash" TEXT,
    "blockNumber" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledAt" DATETIME NOT NULL,
    "executedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "twap_executions_twapOrderId_fkey" FOREIGN KEY ("twapOrderId") REFERENCES "twap_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "swap_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fromChain" TEXT NOT NULL,
    "toChain" TEXT NOT NULL,
    "tokenIn" TEXT NOT NULL,
    "tokenOut" TEXT NOT NULL,
    "amountIn" TEXT NOT NULL,
    "amountOut" TEXT,
    "hashlock" TEXT,
    "preimage" TEXT,
    "timelock" DATETIME,
    "txHashFrom" TEXT,
    "txHashTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priceImpact" REAL,
    "slippage" REAL,
    "gasUsed" TEXT,
    "networkFee" TEXT,
    "quote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "swap_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "liquidity_positions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenA" TEXT NOT NULL,
    "tokenB" TEXT NOT NULL,
    "liquidity" TEXT NOT NULL,
    "priceLower" TEXT NOT NULL,
    "priceUpper" TEXT NOT NULL,
    "currentPrice" TEXT,
    "chain" TEXT NOT NULL,
    "poolAddress" TEXT NOT NULL,
    "positionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "feesCollected" TEXT NOT NULL DEFAULT '0',
    "totalYield" TEXT NOT NULL DEFAULT '0',
    "apy" REAL,
    "lastRebalance" DATETIME,
    "rebalanceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "liquidity_positions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "arbitrage_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenPair" TEXT NOT NULL,
    "sourceChain" TEXT NOT NULL,
    "targetChain" TEXT NOT NULL,
    "sourceExchange" TEXT NOT NULL,
    "targetExchange" TEXT NOT NULL,
    "sourcePriceUSD" TEXT NOT NULL,
    "targetPriceUSD" TEXT NOT NULL,
    "priceSpread" REAL NOT NULL,
    "minProfitUSD" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "estimatedProfit" TEXT NOT NULL,
    "actualProfit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DETECTED',
    "sourceTxHash" TEXT,
    "targetTxHash" TEXT,
    "gasUsed" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "executedAt" DATETIME,
    CONSTRAINT "arbitrage_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenPair" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "volume24h" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_ethereumAddress_key" ON "users"("ethereumAddress");

-- CreateIndex
CREATE INDEX "price_history_tokenPair_chain_timestamp_idx" ON "price_history"("tokenPair", "chain", "timestamp");
