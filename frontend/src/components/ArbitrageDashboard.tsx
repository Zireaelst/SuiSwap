'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Spotlight } from '@/components/ui/spotlight';
import { ArbitrageOpportunity } from '@/types';
import { TrendingUp, DollarSign, RefreshCw, Activity, Clock, Zap, AlertTriangle, ArrowRightLeft } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

// Mock data for demonstration
const mockOpportunities: ArbitrageOpportunity[] = [
  {
    tokenPair: 'ETH/USDC',
    sourceChain: 'ethereum',
    targetChain: 'ethereum',
    sourceExchange: 'Uniswap V3',
    targetExchange: 'SushiSwap',
    priceSpread: 2.5,
    estimatedProfit: 125.50,
    minimumAmount: '0.1',
    maximumAmount: '10.0',
    confidence: 0.85,
    validUntil: new Date(Date.now() + 300000), // 5 minutes from now
  },
  {
    tokenPair: 'WBTC/USDT',
    sourceChain: 'ethereum',
    targetChain: 'ethereum',
    sourceExchange: 'Curve',
    targetExchange: '1inch',
    priceSpread: 1.8,
    estimatedProfit: 89.75,
    minimumAmount: '0.01',
    maximumAmount: '1.0',
    confidence: 0.92,
    validUntil: new Date(Date.now() + 240000), // 4 minutes from now
  },
  {
    tokenPair: 'LINK/ETH',
    sourceChain: 'ethereum',
    targetChain: 'ethereum',
    sourceExchange: 'Balancer',
    targetExchange: 'Uniswap V2',
    priceSpread: 3.2,
    estimatedProfit: 67.20,
    minimumAmount: '10',
    maximumAmount: '1000',
    confidence: 0.78,
    validUntil: new Date(Date.now() + 180000), // 3 minutes from now
  },
];

export const ArbitrageDashboard = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [totalProfit, setTotalProfit] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [executingTx, setExecutingTx] = useState<string | null>(null);

  const detectOpportunities = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use mock data for demonstration
      const filteredOpportunities = mockOpportunities.filter(
        op => op.validUntil > new Date() && op.estimatedProfit > 50
      );
      
      setOpportunities(filteredOpportunities);
      setTotalProfit(filteredOpportunities.reduce((sum, op) => sum + op.estimatedProfit, 0));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Arbitrage detection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeArbitrage = async (opportunity: ArbitrageOpportunity) => {
    try {
      setExecutingTx(opportunity.tokenPair);
      
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove executed opportunity
      setOpportunities(prev => prev.filter(op => op.tokenPair !== opportunity.tokenPair));
      
      // Refresh to find new opportunities
      await detectOpportunities();
    } catch (error) {
      console.error('Arbitrage execution failed:', error);
    } finally {
      setExecutingTx(null);
    }
  };

  useEffect(() => {
    detectOpportunities();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      detectOpportunities();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProfitColor = (profit: number) => {
    if (profit >= 100) return 'text-green-400';
    if (profit >= 50) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getTimeRemaining = (validUntil: Date) => {
    const now = new Date();
    const diff = validUntil.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      <div className="h-full w-full bg-black bg-grid-white/[0.02] relative">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-20 container mx-auto p-6 space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent mb-4">
              Arbitrage Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Real-time MEV opportunities across DeFi protocols
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Opportunities */}
            <Card className="bg-black/50 border-white/10 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Opportunities</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{opportunities.length}</div>
                <p className="text-xs text-gray-400">Active arbitrage</p>
              </CardContent>
            </Card>

            {/* Total Profit */}
            <Card className="bg-black/50 border-white/10 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Potential Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  ${totalProfit.toFixed(2)}
                </div>
                <p className="text-xs text-gray-400">Total estimated</p>
              </CardContent>
            </Card>

            {/* Auto Refresh Status */}
            <Card className="bg-black/50 border-white/10 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Auto Refresh</CardTitle>
                <Activity className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  <span className="text-white font-medium">
                    {autoRefresh ? 'Active' : 'Paused'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">30s intervals</p>
              </CardContent>
            </Card>

            {/* Last Update */}
            <Card className="bg-black/50 border-white/10 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Last Update</CardTitle>
                <Clock className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-white">
                  {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
                </div>
                <p className="text-xs text-gray-400">
                  {lastUpdate ? 'Updated' : 'Waiting...'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Controls */}
          <motion.div variants={itemVariants}>
            <Card className="bg-black/50 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Dashboard Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={detectOpportunities}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                  
                  <Button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {autoRefresh ? 'Pause Auto' : 'Start Auto'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Opportunities List */}
          <motion.div variants={itemVariants}>
            <Card className="bg-black/50 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Arbitrage Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-600/20 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : opportunities.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                    <p className="text-gray-400 text-lg">No arbitrage opportunities found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Market conditions may not be favorable for arbitrage
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {opportunities.map((opportunity) => (
                        <motion.div
                          key={opportunity.tokenPair}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -300 }}
                          layout
                          className="p-6 rounded-lg bg-black/30 border border-white/5 hover:border-white/20 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-medium text-lg">
                                    {opportunity.tokenPair}
                                  </span>
                                  <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                                </div>
                                <Badge className={`${getConfidenceColor(opportunity.confidence)} text-white`}>
                                  {Math.round(opportunity.confidence * 100)}% confidence
                                </Badge>
                                <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                                  {getTimeRemaining(opportunity.validUntil)}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-400">
                                  Source: <span className="text-blue-400">{opportunity.sourceExchange}</span>
                                </span>
                                <span className="text-gray-400">
                                  Target: <span className="text-purple-400">{opportunity.targetExchange}</span>
                                </span>
                                <span className="text-gray-400">
                                  Spread: <span className="text-green-400">{opportunity.priceSpread}%</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Min: {opportunity.minimumAmount} {opportunity.tokenPair.split('/')[0]}</span>
                                <span>Max: {opportunity.maximumAmount} {opportunity.tokenPair.split('/')[0]}</span>
                                <span>Chain: {opportunity.sourceChain}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className={`text-xl font-bold ${getProfitColor(opportunity.estimatedProfit)}`}>
                                  +${opportunity.estimatedProfit.toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-400">
                                  Estimated profit
                                </div>
                              </div>
                              
                              <Button
                                onClick={() => executeArbitrage(opportunity)}
                                disabled={executingTx === opportunity.tokenPair}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                              >
                                {executingTx === opportunity.tokenPair ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Execute'
                                )}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        <BackgroundBeams />
      </div>
    </div>
  );
};
