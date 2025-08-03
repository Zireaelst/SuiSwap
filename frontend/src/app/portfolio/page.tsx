"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { OneInchDashboard } from "@/components/OneInchDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import { usePortfolio } from "@/hooks/useOneInchData";
import { 
  BarChart3,
  Clock,
  ArrowUpDown,
  Search,
  Sparkles,
  Activity,
  Target,
  Globe,
  Zap,
  TrendingUp,
  DollarSign,
  PieChart,
  ChevronRight
} from "lucide-react";

export default function EnhancedPortfolioPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // 1inch API hook'ları - backend API'mizi kullanıyor
  const { portfolioData, loading: portfolioLoading, error: portfolioError } = usePortfolio(walletAddress, 1);
  // const { balances, loading: balancesLoading, error: balancesError } = useWalletBalances(1, walletAddress);

  const handleAnalyze = async () => {
    if (!walletAddress) return;
    
    setIsAnalyzing(true);
    // Backend API'miz otomatik olarak veri çekecek
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAnalyzing(false);
    setShowAnalysis(true);
  };

  // API durumu kontrolü
  const hasApiError = portfolioError;
  const isLoading = portfolioLoading || isAnalyzing;
  
  // Portfolio istatistikleri
  const portfolioStats = portfolioData?.current_value?.[walletAddress] ? {
    totalValue: portfolioData.current_value[walletAddress].total_value_usd || 0,
    profitLoss: portfolioData.current_value[walletAddress].abs_profit_usd || 0,
    roi: portfolioData.current_value[walletAddress].roi || 0,
    tokenCount: portfolioData.current_value[walletAddress].tokens?.length || 0
  } : null;

  const quickAccessWallets = [
    {
      name: "Vitalik.eth",
      address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      description: "Ethereum founder"
    },
    {
      name: "1inch Treasury",
      address: "0x111111111117dc0aa78b770fa6a738034120c302",
      description: "1inch protocol treasury"
    },
    {
      name: "DeFi Whale",
      address: "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503",
      description: "High-value DeFi portfolio"
    }
  ];

  const features = [
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Real-time Balances",
      description: "Live token balances across all supported networks"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Portfolio Analytics",
      description: "Comprehensive P&L tracking and performance metrics"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Transaction History",
      description: "Complete transaction timeline with details"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Price Tracking",
      description: "Real-time token prices and market data"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Multi-chain Support",
      description: "Support for Ethereum, Polygon, BSC and more"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Deep insights powered by 1inch APIs"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BackgroundBeams />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      
      <NavigationHeader />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {!showAnalysis ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Hero Section */}
            <motion.div
              className="text-center space-y-8 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge variant="secondary" className="glassmorphism border-white/20 bg-white/10 text-white/90 px-4 py-2">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Advanced Portfolio Intelligence
                  </Badge>
                </motion.div>
                
                <motion.h1
                  className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Portfolio
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Analytics
                  </span>
                </motion.h1>
                
                <motion.p
                  className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Comprehensive wallet analysis with real-time data, powered by 1inch APIs. 
                  Track balances, monitor performance, and analyze trading patterns with advanced intelligence.
                </motion.p>
              </div>

              {/* Stats Cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {[
                  { icon: <Activity className="h-8 w-8" />, title: "Real-time Data", value: "Live Tracking", color: "from-blue-500 to-cyan-500" },
                  { icon: <BarChart3 className="h-8 w-8" />, title: "Portfolio Analytics", value: "Advanced Metrics", color: "from-purple-500 to-pink-500" },
                  { icon: <Target className="h-8 w-8" />, title: "Multi-chain", value: "Full Coverage", color: "from-green-500 to-emerald-500" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="glassmorphism border-white/20 p-6 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white mb-4`}>
                      {stat.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white/90 mb-1">{stat.title}</h3>
                    <p className="text-white/60">{stat.value}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Wallet Analysis Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-16"
            >
              <Card className="glassmorphism border-white/20 bg-white/5 backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-white text-2xl">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Search className="h-6 w-6 text-white" />
                    </div>
                    Portfolio Analysis Engine
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 border-blue-400/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Powered by 1inch API
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter wallet address (0x...) or ENS name"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400/50 focus:ring-blue-400/20"
                      />
                      <Button 
                        onClick={handleAnalyze}
                        disabled={!walletAddress || isAnalyzing}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-8"
                        size="lg"
                      >
                        {isAnalyzing ? (
                          <>
                            <ArrowUpDown className="h-5 w-5 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <BarChart3 className="h-5 w-5 mr-2" />
                            Analyze Portfolio
                          </>
                        )}
                      </Button>
                    </div>

                    {/* API Status Indicator */}
                    {walletAddress && (
                      <motion.div 
                        className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className={`w-3 h-3 rounded-full ${hasApiError ? 'bg-red-500' : isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                        {hasApiError ? (
                          <span className="text-red-400">API Error: {portfolioError}</span>
                        ) : isLoading ? (
                          <span className="text-yellow-400">Loading portfolio data...</span>
                        ) : portfolioStats ? (
                          <span className="text-green-400">
                            Portfolio loaded: ${portfolioStats.totalValue.toLocaleString()} total value
                          </span>
                        ) : (
                          <span className="text-blue-400">Ready to analyze</span>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Quick Access Wallets */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">Quick Access</h3>
                      <Badge variant="outline" className="border-white/30 text-white/70">
                        Popular Wallets
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {quickAccessWallets.map((wallet, index) => (
                        <motion.button
                          key={wallet.address}
                          onClick={() => setWalletAddress(wallet.address)}
                          className="group p-6 text-left border border-white/20 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 glassmorphism"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-white">{wallet.name}</div>
                              <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white/80 transition-colors" />
                            </div>
                            <div className="text-sm text-white/60">{wallet.description}</div>
                            <div className="text-xs text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded">
                              {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Powerful Analytics
                  <span className="block text-2xl md:text-3xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Features
                  </span>
                </h2>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  Everything you need for comprehensive portfolio analysis and real-time insights
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Card className="h-full glassmorphism border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                            {feature.icon}
                          </div>
                          <CardTitle className="text-xl text-white group-hover:text-blue-200 transition-colors">
                            {feature.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/70 leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <motion.div 
              className="flex items-center justify-between p-6 glassmorphism border-white/20 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">Portfolio Analysis</h1>
                <p className="text-white/70 text-lg">
                  Analyzing: <span className="font-mono text-blue-400">{walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}</span>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAnalysis(false);
                  setWalletAddress("");
                }}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                size="lg"
              >
                <ArrowUpDown className="h-5 w-5 mr-2" />
                New Analysis
              </Button>
            </motion.div>

            {/* Portfolio Stats Dashboard */}
            {portfolioStats && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {[
                  {
                    icon: <DollarSign className="h-10 w-10" />,
                    title: "Total Value",
                    value: `$${portfolioStats.totalValue.toLocaleString()}`,
                    color: "from-green-500 to-emerald-500",
                    bgColor: "bg-green-500/10"
                  },
                  {
                    icon: <TrendingUp className="h-10 w-10" />,
                    title: "P&L",
                    value: `${portfolioStats.profitLoss >= 0 ? '+' : ''}$${portfolioStats.profitLoss.toLocaleString()}`,
                    color: portfolioStats.profitLoss >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-rose-500",
                    bgColor: portfolioStats.profitLoss >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                  },
                  {
                    icon: <BarChart3 className="h-10 w-10" />,
                    title: "ROI",
                    value: `${portfolioStats.roi >= 0 ? '+' : ''}${portfolioStats.roi.toFixed(2)}%`,
                    color: portfolioStats.roi >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-rose-500",
                    bgColor: portfolioStats.roi >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                  },
                  {
                    icon: <PieChart className="h-10 w-10" />,
                    title: "Tokens",
                    value: portfolioStats.tokenCount.toString(),
                    color: "from-blue-500 to-cyan-500",
                    bgColor: "bg-blue-500/10"
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card className="glassmorphism border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className={`p-4 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                            {stat.icon}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-white/70">{stat.title}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* OneInch Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <OneInchDashboard walletAddress={walletAddress} />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
