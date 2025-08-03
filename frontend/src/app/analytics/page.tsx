"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useTokenPrices, useWalletBalances, usePortfolio, useWalletHistory } from "@/hooks/useOneInchData";
import { useWallet } from "@/hooks/useWallet";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Users,
  Zap,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Globe,
  Target,
  Shield,
  Sparkles,
  CheckCircle,
} from "lucide-react";

// Wallet Analysis Component
interface WalletAnalysisProps {
  walletAddress: string;
}

const WalletAnalysis: React.FC<WalletAnalysisProps> = ({ walletAddress }) => {
  const { balances, loading: balancesLoading, error: balancesError } = useWalletBalances(1, walletAddress);
  const { portfolioData, loading: portfolioLoading, error: portfolioError } = usePortfolio(walletAddress, 1);
  const { history, loading: historyLoading, error: historyError } = useWalletHistory(walletAddress, 1, 10);

  const walletStats = {
    totalValue: portfolioData?.current_value?.[walletAddress]?.total_value_usd || 0,
    profitLoss: portfolioData?.current_value?.[walletAddress]?.abs_profit_usd || 0,
    roi: portfolioData?.current_value?.[walletAddress]?.roi || 0,
    tokenCount: Object.keys(balances).length
  };

  const topHoldings = portfolioData?.current_value?.[walletAddress]?.tokens?.slice(0, 5) || [];

  // Show error state if any API calls fail
  if (balancesError || portfolioError || historyError) {
    return (
      <div className="text-center py-12">
        <Card className="glassmorphism border-0 max-w-md mx-auto">
          <CardContent className="p-6">
            <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-400">API Error</h3>
            <p className="text-sm text-muted-foreground">
              Failed to fetch wallet data. Please check your API key and try again.
            </p>
            <div className="mt-4 text-xs text-red-300">
              {balancesError || portfolioError || historyError}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <Card className="glassmorphism border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-blue-500" />
            <span>Wallet Analysis</span>
            <Badge variant="secondary" className="ml-2">Real-time Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div 
              className="p-4 glassmorphism rounded-xl hover-lift"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xs text-muted-foreground mb-1">Total Value</div>
              <div className="text-xl font-bold gradient-text">
                {portfolioLoading ? (
                  <div className="h-6 bg-muted rounded animate-pulse"></div>
                ) : (
                  `$${walletStats.totalValue.toLocaleString()}`
                )}
              </div>
            </motion.div>
            <motion.div 
              className="p-4 glassmorphism rounded-xl hover-lift"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xs text-muted-foreground mb-1">P&L</div>
              <div className={`text-xl font-bold ${walletStats.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {portfolioLoading ? (
                  <div className="h-6 bg-muted rounded animate-pulse"></div>
                ) : (
                  `${walletStats.profitLoss >= 0 ? '+' : ''}$${walletStats.profitLoss.toLocaleString()}`
                )}
              </div>
            </motion.div>
            <motion.div 
              className="p-4 glassmorphism rounded-xl hover-lift"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xs text-muted-foreground mb-1">ROI</div>
              <div className={`text-xl font-bold ${walletStats.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {portfolioLoading ? (
                  <div className="h-6 bg-muted rounded animate-pulse"></div>
                ) : (
                  `${walletStats.roi >= 0 ? '+' : ''}${(walletStats.roi * 100).toFixed(2)}%`
                )}
              </div>
            </motion.div>
            <motion.div 
              className="p-4 glassmorphism rounded-xl hover-lift"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xs text-muted-foreground mb-1">Tokens</div>
              <div className="text-xl font-bold text-blue-500">
                {balancesLoading ? (
                  <div className="h-6 bg-muted rounded animate-pulse"></div>
                ) : (
                  walletStats.tokenCount
                )}
              </div>
            </motion.div>
          </div>

          {/* Top Holdings */}
          <div>
            <h3 className="text-sm font-medium mb-3">Top Holdings</h3>
            <div className="space-y-3">
              {portfolioLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                ))
              ) : (
                topHoldings.map((token, index) => (
                  <div key={index} className="flex items-center justify-between p-3 glassmorphism rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {token.token_address.slice(2, 4).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{token.token_address.slice(0, 6)}...{token.token_address.slice(-4)}</div>
                        <div className="text-xs text-muted-foreground">{token.balance}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${token.value_usd.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">${token.price_usd.toFixed(4)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="glassmorphism border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historyLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))
            ) : history.length > 0 ? (
              history.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 glassmorphism rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{tx.details.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.details.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{tx.details.value} ETH</div>
                    <div className="text-xs text-muted-foreground">Gas: {tx.details.gasUsed}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No recent transactions found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Market Analysis Component
interface MarketAnalysisProps {}

const MarketAnalysis: React.FC<MarketAnalysisProps> = () => {
  const popularTokens = [
    '0xA0b86a33E6441b9c0Ec4AD851c1e4Ec3C02Db0b2', // USDC
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  ];

  const { prices, loading: pricesLoading, error: pricesError } = useTokenPrices(1, popularTokens);

  // Show error state if API call fails
  if (pricesError) {
    return (
      <div className="text-center py-12">
        <Card className="glassmorphism border-0 max-w-md mx-auto">
          <CardContent className="p-6">
            <BarChart3 className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-400">Market Data Error</h3>
            <p className="text-sm text-muted-foreground">
              Failed to fetch market data. Please check your API key and try again.
            </p>
            <div className="mt-4 text-xs text-red-300">
              {pricesError}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const marketData = Object.entries(prices).map(([address, price]) => {
    const tokenNames = {
      '0xA0b86a33E6441b9c0Ec4AD851c1e4Ec3C02Db0b2': 'USDC',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
      '0x111111111117dc0aa78b770fa6a738034120c302': '1INCH',
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 'WBTC',
    };
    
    return {
      symbol: tokenNames[address as keyof typeof tokenNames] || 'UNKNOWN',
      price: price,
      change: (Math.random() - 0.5) * 10, // Mock change data
      volume: Math.random() * 1000000,
      address: address
    };
  });

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card className="glassmorphism border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-green-500" />
            <span>Market Analysis</span>
            <Badge variant="secondary" className="ml-2">Live Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Real-time Token Prices */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium mb-3">Real-time Token Prices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pricesLoading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
                ))
              ) : (
                marketData.map((token) => (
                  <div key={token.address} className="p-4 glassmorphism rounded-xl hover-lift">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{token.symbol}</div>
                      <div className={`flex items-center space-x-1 ${
                        token.change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {token.change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span className="text-xs">{token.change.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold">${token.price.toFixed(4)}</div>
                    <div className="text-xs text-muted-foreground">
                      Vol: ${token.volume.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card className="glassmorphism border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-500" />
            <span>Market Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 glassmorphism rounded-xl hover-lift">
              <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
              <div className="text-xl font-bold gradient-text">$2.4T</div>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+5.2%</span>
              </div>
            </div>
            <div className="p-4 glassmorphism rounded-xl hover-lift">
              <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
              <div className="text-xl font-bold text-blue-500">$127B</div>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+12.8%</span>
              </div>
            </div>
            <div className="p-4 glassmorphism rounded-xl hover-lift">
              <div className="text-xs text-muted-foreground mb-1">Active Traders</div>
              <div className="text-xl font-bold text-purple-500">847K</div>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+8.4%</span>
              </div>
            </div>
            <div className="p-4 glassmorphism rounded-xl hover-lift">
              <div className="text-xs text-muted-foreground mb-1">Fear & Greed</div>
              <div className="text-xl font-bold text-green-500">72</div>
              <div className="text-xs text-muted-foreground">Greed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const volumeData = [
  { name: "Jan", volume: 2400, trades: 240 },
  { name: "Feb", volume: 1398, trades: 139 },
  { name: "Mar", volume: 9800, trades: 980 },
  { name: "Apr", volume: 3908, trades: 390 },
  { name: "May", volume: 4800, trades: 480 },
  { name: "Jun", volume: 3800, trades: 380 },
  { name: "Jul", volume: 4300, trades: 430 },
];

const priceData = [
  { time: "00:00", eth: 2400, sui: 1.2, usdc: 1.0 },
  { time: "04:00", eth: 2450, sui: 1.25, usdc: 1.0 },
  { time: "08:00", eth: 2420, sui: 1.22, usdc: 1.0 },
  { time: "12:00", eth: 2480, sui: 1.28, usdc: 1.0 },
  { time: "16:00", eth: 2460, sui: 1.26, usdc: 1.0 },
  { time: "20:00", eth: 2500, sui: 1.3, usdc: 1.0 },
  { time: "24:00", eth: 2520, sui: 1.32, usdc: 1.0 },
];

const tokenDistribution = [
  { name: "ETH", value: 40, color: "#3B82F6" },
  { name: "USDC", value: 30, color: "#10B981" },
  { name: "SUI", value: 20, color: "#8B5CF6" },
  { name: "WBTC", value: 10, color: "#F59E0B" },
];

const tradingStats = [
  {
    title: "Total Volume (24h)",
    value: "$2.4M",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-green-500",
    isPositive: true,
  },
  {
    title: "Active Traders",
    value: "1,247",
    change: "+8.3%",
    icon: Users,
    color: "text-blue-500",
    isPositive: true,
  },
  {
    title: "Total Trades",
    value: "15,432",
    change: "+15.2%",
    icon: Activity,
    color: "text-purple-500",
    isPositive: true,
  },
  {
    title: "Avg. Gas Saved",
    value: "25%",
    change: "-2.1%",
    icon: Zap,
    color: "text-orange-500",
    isPositive: false,
  },
];

const topTokens = [
  { symbol: "ETH", volume: "$1.2M", change: "+5.4%", progress: 85, positive: true },
  { symbol: "USDC", volume: "$800K", change: "+2.1%", progress: 65, positive: true },
  { symbol: "SUI", volume: "$350K", change: "+12.8%", progress: 45, positive: true },
  { symbol: "WBTC", volume: "$150K", change: "-3.2%", progress: 25, positive: false },
];

export default function AnalyticsPage() {
  const [activeView, setActiveView] = useState<'overview' | 'wallet' | 'market'>('overview');
  
  // API configuration
  const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY || '';
  const demoWallet = '0x742d35Cc8b8c98532C0cCAC744FfDd8739F87234'; // Demo wallet
  
  const { connectEthereumWallet, disconnect, isConnected, ethAddress } = useWallet();
  const currentWallet = ethAddress || demoWallet;

  // Debug: Log API key status (remove in production)
  React.useEffect(() => {
    console.log('1inch API Key configured:', !!apiKey);
    if (apiKey) {
      console.log('API Key length:', apiKey.length);
    }
  }, [apiKey]);

  const analyticsViews = [
    { id: 'overview' as const, label: 'Protocol Overview', icon: BarChart3 },
    { id: 'wallet' as const, label: 'Wallet Analysis', icon: Wallet },
    { id: 'market' as const, label: 'Market Analysis', icon: Globe }
  ];

  return (
    <main className="relative min-h-screen">
      <BackgroundBeams />
      <NavigationHeader />

      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Badge variant="secondary" className="mb-4 glassmorphism">
                <Sparkles className="h-3 w-3 mr-1" />
                Real-time Analytics
              </Badge>
            </motion.div>
            
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Advanced 
              <span className="block gradient-text">
                DeFi Analytics
              </span>
            </motion.h1>
            
            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Comprehensive analytics powered by 1inch API with real-time portfolio tracking, 
              market insights, and personalized wallet analysis.
            </motion.p>
          </motion.div>

          {/* Analytics Navigation */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex space-x-2 p-1 glassmorphism rounded-lg border border-white/10">
              {analyticsViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                    activeView === view.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                  }`}
                >
                  <view.icon className="h-4 w-4" />
                  <span>{view.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Wallet Connection */}
          {activeView === 'wallet' && (
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glassmorphism border-0 max-w-md mx-auto">
                <CardContent className="p-6">
                  {!isConnected ? (
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Connect your wallet for personalized analytics
                      </div>
                      <Button 
                        onClick={connectEthereumWallet}
                        className="glassmorphism w-full"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Wallet
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        Or viewing demo wallet: {demoWallet.slice(0, 6)}...{demoWallet.slice(-4)}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm font-medium">
                        Connected: {ethAddress?.slice(0, 6)}...{ethAddress?.slice(-4)}
                      </div>
                      <Button 
                        onClick={disconnect}
                        variant="outline"
                        className="glassmorphism w-full"
                      >
                        Disconnect
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Dynamic Content */}
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activeView === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {tradingStats.map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="glassmorphism border-0 hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </CardTitle>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="flex items-center space-x-1 mt-1">
                            {stat.isPositive ? (
                              <ArrowUpRight className="h-3 w-3 text-green-500" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-500" />
                            )}
                            <span className={`text-xs ${
                              stat.isPositive ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {stat.change}
                            </span>
                            <span className="text-xs text-muted-foreground">from yesterday</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Volume Chart */}
                  <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Card className="glassmorphism border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          <span>Trading Volume</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={volumeData}>
                            <defs>
                              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: 'white'
                              }} 
                            />
                            <Area
                              type="monotone"
                              dataKey="volume"
                              stroke="#3B82F6"
                              fillOpacity={1}
                              fill="url(#colorVolume)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Token Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Card className="glassmorphism border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChartIcon className="h-5 w-5" />
                          <span>Token Distribution</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={tokenDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {tokenDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(0,0,0,0.8)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                          {tokenDistribution.map((token) => (
                            <div key={token.name} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: token.color }}
                                />
                                <span className="text-sm">{token.name}</span>
                              </div>
                              <span className="text-sm font-medium">{token.value}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Price Chart and Top Tokens */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Price Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Card className="glassmorphism border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          <span>Price Trends (24h)</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={priceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(0,0,0,0.8)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="eth"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              name="ETH"
                            />
                            <Line
                              type="monotone"
                              dataKey="sui"
                              stroke="#8B5CF6"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              name="SUI"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Top Tokens */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    <Card className="glassmorphism border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          <span>Top Tokens (24h Volume)</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {topTokens.map((token) => (
                          <div key={token.symbol} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="font-semibold">{token.symbol}</div>
                                <Badge variant="secondary" className="text-xs">
                                  {token.volume}
                                </Badge>
                              </div>
                              <div className={`flex items-center space-x-1 ${
                                token.positive ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {token.positive ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                <span className="text-xs">{token.change}</span>
                              </div>
                            </div>
                            <Progress value={token.progress} className="h-2" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            )}

            {activeView === 'wallet' && (
              <WalletAnalysis 
                walletAddress={currentWallet}
              />
            )}

            {activeView === 'market' && (
              <MarketAnalysis />
            )}

            {!apiKey && (activeView === 'wallet' || activeView === 'market') && (
              <div className="text-center py-12">
                <Card className="glassmorphism border-0 max-w-md mx-auto">
                  <CardContent className="p-6">
                    <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-red-400">API Key Missing</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The 1inch API key is not configured. Please add your API key to the environment variables.
                    </p>
                    <div className="p-3 glassmorphism rounded-lg bg-red-950/20 border border-red-500/20">
                      <p className="text-xs text-red-300 font-mono">
                        NEXT_PUBLIC_1INCH_API_KEY=your_api_key_here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* API Key Available - Show Success */}
            {apiKey && (activeView === 'wallet' || activeView === 'market') && (
              <div className="mb-6">
                <div className="text-center">
                  <Badge variant="secondary" className="glassmorphism border border-green-500/30 bg-green-500/10 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    1inch API Connected
                  </Badge>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
