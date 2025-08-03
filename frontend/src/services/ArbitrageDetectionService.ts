import { OneInchAPI } from '@/utils/1inch-api';
import { ArbitrageOpportunity } from '@/types';

export interface ArbitrageResult {
  opportunities: ArbitrageOpportunity[];
  totalOpportunities: number;
  estimatedProfit: number;
}

export interface ArbitrageExecution {
  success: boolean;
  transactions: string[];
  actualProfit: number;
  executionTime: number;
}

interface PriceData {
  price: number;
  volume24h?: number;
  timestamp: number;
}

export class ArbitrageDetectionService {
  private oneInchAPI: OneInchAPI;
  private priceCache: Map<string, PriceData>;
  private cacheTTL: number = 30000; // 30 seconds

  constructor(oneInchAPI: OneInchAPI) {
    this.oneInchAPI = oneInchAPI;
    this.priceCache = new Map();
  }

  async detectArbitrageOpportunities(tokens: string[]): Promise<ArbitrageResult> {
    const opportunities: ArbitrageOpportunity[] = [];

    for (const token of tokens) {
      try {
        // Get prices from both chains
        const [ethPrice, suiPrice] = await Promise.all([
          this.getEthereumPrice(token),
          this.getSuiPrice(token)
        ]);

        if (ethPrice && suiPrice) {
          const priceDiff = Math.abs(ethPrice.price - suiPrice.price);
          const lowerPrice = Math.min(ethPrice.price, suiPrice.price);
          const priceDiffPercent = (priceDiff / lowerPrice) * 100;

          // Only consider opportunities with >1% spread to account for fees
          if (priceDiffPercent > 1) {
            const estimatedProfit = this.calculatePotentialProfit(
              priceDiff,
              lowerPrice,
              token
            );

            // Only include profitable opportunities
            if (estimatedProfit > 0) {
              opportunities.push({
                tokenPair: `${token}/USD`,
                sourceChain: ethPrice.price > suiPrice.price ? 'sui' : 'ethereum',
                targetChain: ethPrice.price > suiPrice.price ? 'ethereum' : 'sui',
                sourceExchange: ethPrice.price > suiPrice.price ? 'SuiDEX' : '1inch',
                targetExchange: ethPrice.price > suiPrice.price ? '1inch' : 'SuiDEX',
                priceSpread: priceDiffPercent,
                estimatedProfit,
                minimumAmount: '100', // $100 minimum
                maximumAmount: '10000', // $10k maximum
                confidence: this.calculateConfidence(priceDiffPercent, ethPrice.volume24h, suiPrice.volume24h),
                validUntil: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to check arbitrage for token ${token}:`, error);
        // Continue with other tokens
      }
    }

    return {
      opportunities: opportunities
        .sort((a, b) => b.estimatedProfit - a.estimatedProfit)
        .slice(0, 20), // Limit to top 20 opportunities
      totalOpportunities: opportunities.length,
      estimatedProfit: opportunities.reduce((sum, opp) => sum + opp.estimatedProfit, 0)
    };
  }

  private async getEthereumPrice(token: string): Promise<PriceData | null> {
    const cacheKey = `eth_${token}`;
    const cached = this.priceCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached;
    }

    try {
      // Use your existing 1inch API integration
      const priceData = await this.oneInchAPI.getTokenPrice(1, token); // Ethereum mainnet
      
      const result: PriceData = {
        price: priceData.price || 0,
        volume24h: priceData.volume24h,
        timestamp: Date.now()
      };

      this.priceCache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error(`Failed to get Ethereum price for ${token}:`, error);
      return null;
    }
  }

  private async getSuiPrice(token: string): Promise<PriceData | null> {
    const cacheKey = `sui_${token}`;
    const cached = this.priceCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached;
    }

    try {
      // For demo purposes, simulate Sui price data
      // In production, integrate with Sui DEX APIs (Cetus, Turbos, etc.)
      const ethPrice = await this.getEthereumPrice(token);
      if (!ethPrice) return null;

      // Simulate price variation (±5% from ETH price)
      const variation = (Math.random() - 0.5) * 0.1; // -5% to +5%
      const suiPrice = ethPrice.price * (1 + variation);

      const result: PriceData = {
        price: suiPrice,
        volume24h: (ethPrice.volume24h || 0) * (0.1 + Math.random() * 0.3), // 10-40% of ETH volume
        timestamp: Date.now()
      };

      this.priceCache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error(`Failed to get Sui price for ${token}:`, error);
      return null;
    }
  }

  private calculatePotentialProfit(
    priceDiff: number,
    basePrice: number,
    token: string
  ): number {
    // Standard trading amount for calculation
    const tradingAmountUSD = 1000;
    
    // Fee structure
    const crossChainBridgeFee = 0.003; // 0.3%
    const dexTradingFee = 0.003; // 0.3% per trade (2 trades total)
    const slippageAllowance = 0.005; // 0.5%
    const gasFees = this.estimateGasFees(token); // Dynamic gas estimation

    // Calculate gross profit
    const profitPercent = priceDiff / basePrice;
    const grossProfitUSD = profitPercent * tradingAmountUSD;

    // Calculate total fees
    const totalFeePercent = crossChainBridgeFee + (dexTradingFee * 2) + slippageAllowance;
    const totalFeesUSD = totalFeePercent * tradingAmountUSD + gasFees;

    // Net profit
    const netProfitUSD = grossProfitUSD - totalFeesUSD;

    return Math.max(0, netProfitUSD);
  }

  private estimateGasFees(_token: string): number {
    // Estimate gas fees based on current network conditions
    // For demo, use static estimates
    const ethGasEstimate = 50; // $50 for ETH operations
    const suiGasEstimate = 5;  // $5 for Sui operations
    const bridgeGasEstimate = 25; // $25 for bridge operations

    return ethGasEstimate + suiGasEstimate + bridgeGasEstimate;
  }

  private calculateConfidence(
    priceDiffPercent: number,
    ethVolume?: number,
    suiVolume?: number
  ): number {
    let confidence = 0;

    // Price spread confidence (higher spread = higher confidence up to a point)
    if (priceDiffPercent > 10) confidence += 0.3; // Too high might be data error
    else if (priceDiffPercent > 5) confidence += 0.5;
    else if (priceDiffPercent > 3) confidence += 0.4;
    else if (priceDiffPercent > 1) confidence += 0.3;

    // Volume confidence
    const totalVolume = (ethVolume || 0) + (suiVolume || 0);
    if (totalVolume > 1000000) confidence += 0.3; // High volume
    else if (totalVolume > 100000) confidence += 0.2; // Medium volume
    else if (totalVolume > 10000) confidence += 0.1; // Low volume

    // Market timing confidence (simplified)
    const hour = new Date().getUTCHours();
    if (hour >= 8 && hour <= 16) confidence += 0.2; // Business hours

    return Math.min(1, Math.max(0, confidence));
  }

  async executeArbitrageStrategy(opportunity: ArbitrageOpportunity): Promise<ArbitrageExecution> {
    const startTime = Date.now();

    try {
      console.log(`Executing arbitrage: ${opportunity.tokenPair}`);
      console.log(`Route: ${opportunity.sourceChain} → ${opportunity.targetChain}`);
      console.log(`Expected profit: $${opportunity.estimatedProfit.toFixed(2)}`);

      const transactions: string[] = [];

      if (opportunity.sourceChain === 'ethereum' && opportunity.targetChain === 'sui') {
        // Buy on Ethereum, bridge and sell on Sui
        const ethBuyTx = await this.buyOnEthereum(opportunity.tokenPair, 1000);
        transactions.push(ethBuyTx);

        const bridgeTx = await this.bridgeToSui(opportunity.tokenPair, 1000);
        transactions.push(bridgeTx);

        const suiSellTx = await this.sellOnSui(opportunity.tokenPair, 1000);
        transactions.push(suiSellTx);

      } else {
        // Buy on Sui, bridge and sell on Ethereum
        const suiBuyTx = await this.buyOnSui(opportunity.tokenPair, 1000);
        transactions.push(suiBuyTx);

        const bridgeTx = await this.bridgeToEthereum(opportunity.tokenPair, 1000);
        transactions.push(bridgeTx);

        const ethSellTx = await this.sellOnEthereum(opportunity.tokenPair, 1000);
        transactions.push(ethSellTx);
      }

      // Simulate execution variance (reality vs expectation)
      const executionEfficiency = 0.85 + Math.random() * 0.1; // 85-95% efficiency
      const actualProfit = opportunity.estimatedProfit * executionEfficiency;

      return {
        success: true,
        transactions,
        actualProfit,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Arbitrage execution failed:', error);
      return {
        success: false,
        transactions: [],
        actualProfit: 0,
        executionTime: Date.now() - startTime
      };
    }
  }

  // Trading execution methods (mock implementations)
  private async buyOnEthereum(tokenPair: string, amountUSD: number): Promise<string> {
    // In production, this would use your existing swap service
    console.log(`Buying ${tokenPair} on Ethereum for $${amountUSD}`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    return `0xeth_buy_${Date.now()}`;
  }

  private async sellOnEthereum(tokenPair: string, amountUSD: number): Promise<string> {
    console.log(`Selling ${tokenPair} on Ethereum for $${amountUSD}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `0xeth_sell_${Date.now()}`;
  }

  private async buyOnSui(tokenPair: string, amountUSD: number): Promise<string> {
    console.log(`Buying ${tokenPair} on Sui for $${amountUSD}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `sui_buy_${Date.now()}`;
  }

  private async sellOnSui(tokenPair: string, amountUSD: number): Promise<string> {
    console.log(`Selling ${tokenPair} on Sui for $${amountUSD}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `sui_sell_${Date.now()}`;
  }

  private async bridgeToSui(tokenPair: string, amountUSD: number): Promise<string> {
    console.log(`Bridging ${tokenPair} to Sui (amount: $${amountUSD})`);
    await new Promise(resolve => setTimeout(resolve, 30000)); // Simulate bridge delay
    return `bridge_to_sui_${Date.now()}`;
  }

  private async bridgeToEthereum(tokenPair: string, amountUSD: number): Promise<string> {
    console.log(`Bridging ${tokenPair} to Ethereum (amount: $${amountUSD})`);
    await new Promise(resolve => setTimeout(resolve, 30000));
    return `bridge_to_eth_${Date.now()}`;
  }

  // Utility methods
  clearPriceCache(): void {
    this.priceCache.clear();
  }

  getCacheStats(): { size: number; oldest: number; newest: number } {
    const timestamps = Array.from(this.priceCache.values()).map(p => p.timestamp);
    return {
      size: this.priceCache.size,
      oldest: timestamps.length ? Math.min(...timestamps) : 0,
      newest: timestamps.length ? Math.max(...timestamps) : 0
    };
  }
}
