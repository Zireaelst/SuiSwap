import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArbitrageDetectionService, ArbitrageResult } from '@/services/ArbitrageDetectionService';
import { OneInchAPI } from '@/utils/1inch-api';
import { ArbitrageOpportunity } from '@/types';

export const ArbitrageDashboard = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [totalProfit, setTotalProfit] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [executingTx, setExecutingTx] = useState<string | null>(null);

  const arbitrageService = new ArbitrageDetectionService(
    new OneInchAPI(process.env.NEXT_PUBLIC_1INCH_API_KEY || '')
  );

  const detectOpportunities = async () => {
    try {
      setIsLoading(true);

      // Common trading tokens for arbitrage detection
      const commonTokens = [
        '0xA0b86a33E6Dd83F4c9eF50B84Ad4A8a3D4F28Eb', // USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
        '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // MATIC
        '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
      ];

      const result: ArbitrageResult = await arbitrageService.detectArbitrageOpportunities(commonTokens);
      setOpportunities(result.opportunities);
      setTotalProfit(result.estimatedProfit);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Failed to detect arbitrage opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    detectOpportunities();

    if (autoRefresh) {
      const interval = setInterval(detectOpportunities, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const executeArbitrage = async (opportunity: ArbitrageOpportunity) => {
    try {
      setExecutingTx(opportunity.tokenPair);

      const result = await arbitrageService.executeArbitrageStrategy(opportunity);

      if (result.success) {
        // Show success notification
        const successMessage = `Arbitrage executed successfully!\nProfit: $${result.actualProfit.toFixed(2)}\nExecution time: ${(result.executionTime / 1000).toFixed(1)}s`;
        alert(successMessage);
        
        // Refresh opportunities
        detectOpportunities();
      } else {
        alert('Arbitrage execution failed. Please try again.');
      }
    } catch (error) {
      console.error('Arbitrage execution error:', error);
      alert('Failed to execute arbitrage strategy.');
    } finally {
      setExecutingTx(null);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percent: number): string => {
    return `${percent.toFixed(2)}%`;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.7) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (confidence > 0.5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getDirectionIcon = (sourceChain: string, targetChain: string): string => {
    if (sourceChain === 'ethereum' && targetChain === 'sui') return '🔷→🟣';
    if (sourceChain === 'sui' && targetChain === 'ethereum') return '🟣→🔷';
    return '↔️';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Arbitrage Opportunities
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time cross-chain price differences
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Auto Refresh</span>
          </label>
          <button
            onClick={detectOpportunities}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 font-medium shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning...</span>
              </div>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Opportunities</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {opportunities.length}
              </div>
            </div>
            <div className="text-2xl">⚡</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Est. Profit</div>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(totalProfit)}
              </div>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Best Spread</div>
              <div className="text-2xl font-bold text-blue-500">
                {opportunities.length > 0 ? formatPercentage(opportunities[0].priceSpread) : '0%'}
              </div>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Confidence</div>
              <div className="text-2xl font-bold text-purple-500">
                {opportunities.length > 0 
                  ? formatPercentage(opportunities.reduce((sum, opp) => sum + opp.confidence, 0) / opportunities.length * 100)
                  : '0%'
                }
              </div>
            </div>
            <div className="text-2xl">🎯</div>
          </div>
        </div>
      </motion.div>

      {/* Opportunities List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Opportunities</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Cross-chain arbitrage opportunities updated in real-time
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Scanning markets for opportunities...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-lg font-medium mb-2">No arbitrage opportunities found</p>
            <p className="text-sm">Markets are currently efficient. Check back in a few minutes.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {opportunities.map((opportunity, index) => (
                <motion.div
                  key={`${opportunity.tokenPair}-${opportunity.sourceChain}-${opportunity.targetChain}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {opportunity.tokenPair.split('/')[0].slice(0, 3)}
                        </span>
                      </div>

                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {opportunity.tokenPair}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                          <span>{getDirectionIcon(opportunity.sourceChain, opportunity.targetChain)}</span>
                          <span>
                            {opportunity.sourceExchange} → {opportunity.targetExchange}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xl font-bold text-green-500 mb-1">
                        +{formatPercentage(opportunity.priceSpread)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(opportunity.estimatedProfit)} profit
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Min: {formatCurrency(parseFloat(opportunity.minimumAmount))}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Max: {formatCurrency(parseFloat(opportunity.maximumAmount))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(opportunity.confidence)}`}>
                        {Math.round(opportunity.confidence * 100)}% confidence
                      </div>

                      <button
                        onClick={() => executeArbitrage(opportunity)}
                        disabled={executingTx === opportunity.tokenPair}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg min-w-[100px]"
                      >
                        {executingTx === opportunity.tokenPair ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Executing</span>
                          </div>
                        ) : (
                          'Execute'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expiry countdown */}
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Valid until: {opportunity.validUntil.toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};
