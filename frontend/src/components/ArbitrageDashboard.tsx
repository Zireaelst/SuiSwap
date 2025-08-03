'use client';

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
    if (confidence > 0.7) return 'text-green-400';
    if (confidence > 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Arbitrage Opportunities</h2>
          <p className="text-gray-400">Real-time cross-chain price differences</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : '11:24:44 AM'}
          </div>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600"
            />
            <span className="text-gray-300">Auto Refresh</span>
          </label>
          <button
            onClick={detectOpportunities}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Scanning...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <span className="text-yellow-400 text-lg">⚡</span>
            </div>
            <span className="text-gray-400 text-sm">Active Opportunities</span>
          </div>
          <div className="text-2xl font-bold text-white">{opportunities.length}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-lg">💰</span>
            </div>
            <span className="text-gray-400 text-sm">Total Est. Profit</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(totalProfit)}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-lg">📊</span>
            </div>
            <span className="text-gray-400 text-sm">Best Spread</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {opportunities.length > 0 ? formatPercentage(Math.max(...opportunities.map(o => o.priceSpread))) : '0%'}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-400 text-lg">🎯</span>
            </div>
            <span className="text-gray-400 text-sm">Avg. Confidence</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {opportunities.length > 0 
              ? formatPercentage(opportunities.reduce((acc, o) => acc + (o.confidence * 100), 0) / opportunities.length)
              : '0%'
            }
          </div>
        </div>
      </div>

      {/* Live Opportunities */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Live Opportunities</h3>
          <p className="text-gray-400 text-sm">Cross-chain arbitrage opportunities updated in real-time</p>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400">Scanning for opportunities...</span>
              </div>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-500 text-2xl">🔍</span>
              </div>
              <h4 className="text-white font-medium mb-2">No arbitrage opportunities found</h4>
              <p className="text-gray-400 text-sm">Markets are currently efficient. Check back in a few minutes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {opportunities.map((opportunity, index) => (
                  <motion.div
                    key={`${opportunity.tokenPair}-${opportunity.sourceChain}-${opportunity.targetChain}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <span className="text-blue-400 text-sm font-bold">{opportunity.tokenPair.split('/')[0]}</span>
                          </div>
                          <div>
                            <div className="text-white font-medium">{opportunity.tokenPair}</div>
                            <div className="text-gray-400 text-sm">
                              {opportunity.sourceChain} → {opportunity.targetChain}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-green-400 font-bold">
                            +{formatPercentage(opportunity.priceSpread)}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {formatCurrency(opportunity.estimatedProfit)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-medium ${getConfidenceColor(opportunity.confidence)}`}>
                            {formatPercentage(opportunity.confidence * 100)}
                          </div>
                          <div className="text-gray-400 text-sm">Confidence</div>
                        </div>
                        
                        <button
                          onClick={() => executeArbitrage(opportunity)}
                          disabled={executingTx === opportunity.tokenPair}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                          {executingTx === opportunity.tokenPair ? 'Executing...' : 'Execute'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
