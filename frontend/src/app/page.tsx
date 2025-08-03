"use client";
import React from "react";
import { motion } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { EnhancedSwapInterface } from "@/components/EnhancedSwapInterface";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTokenPrices } from "@/hooks/useOneInchData";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Shield,
  Zap,
  ArrowUpDown,
  DollarSign,
  Activity,
  Target,
  ChevronRight,
  CheckCircle,
  Globe,
  Lock,
  Layers,
  Sparkles
} from "lucide-react";

// Live market data component
const LiveMarketData = () => {
  const popularTokens = [
    '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
    '0xA0b86a33E6441b9c0Ec4AD851c1e4Ec3C02Db0b2', // USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  ];

  const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY || '';
  const { prices, loading } = useTokenPrices(1, popularTokens, apiKey);

  const tokenNames = {
    '0x111111111117dc0aa78b770fa6a738034120c302': '1INCH',
    '0xA0b86a33E6441b9c0Ec4AD851c1e4Ec3C02Db0b2': 'USDC',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
  };

  if (!apiKey || loading) {
    return (
      <div className="flex items-center space-x-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-6 text-sm">
      {Object.entries(prices).slice(0, 3).map(([address, price]) => (
        <motion.div
          key={address}
          className="flex items-center space-x-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-muted-foreground">{tokenNames[address as keyof typeof tokenNames]}:</span>
          <span className="font-medium text-green-500">
            ${typeof price === 'number' ? price.toFixed(4) : 'N/A'}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const statsCards = [
  {
    title: "Total Volume",
    value: "$2.4B",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-green-500"
  },
  {
    title: "Active Users", 
    value: "12,847",
    change: "+25.2%",
    icon: Activity,
    color: "text-blue-500"
  },
  {
    title: "Cross-Chain Bridges",
    value: "127",
    change: "+8.3%",
    icon: Globe,
    color: "text-purple-500"
  },
  {
    title: "Gas Optimized",
    value: "94.2%",
    change: "+3.1%",
    icon: Zap,
    color: "text-orange-500"
  }
];

const dockItems = [
  { title: "Trading", icon: <ArrowUpDown className="h-6 w-6" />, href: "/trading" },
  { title: "Portfolio", icon: <BarChart3 className="h-6 w-6" />, href: "/portfolio" },
  { title: "Analytics", icon: <TrendingUp className="h-6 w-6" />, href: "/analytics" },
  { title: "Arbitrage", icon: <Target className="h-6 w-6" />, href: "/arbitrage" },
  { title: "Docs", icon: <Shield className="h-6 w-6" />, href: "/docs" },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      {/* Background Effects */}
      <BackgroundBeams />
      <Spotlight className="hidden md:block" />
      
      {/* Navigation */}
      <NavigationHeader />

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge variant="secondary" className="mb-4 glassmorphism">
                    <Zap className="h-3 w-3 mr-1" />
                    Cross-Chain DeFi Protocol
                  </Badge>
                </motion.div>
                
                <motion.h1
                  className="text-4xl md:text-6xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Advanced Trading
                  <span className="block gradient-text">
                    Made Simple
                  </span>
                </motion.h1>
                
                <motion.p
                  className="text-xl text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Experience the future of DeFi with programmable trading strategies, 
                  cross-chain swaps, and advanced order types powered by KATA Protocol.
                </motion.p>

                {/* Live Market Data Integration */}
                <motion.div
                  className="p-4 glassmorphism rounded-xl border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">Live Market Data</span>
                  </div>
                  <LiveMarketData />
                </motion.div>
              </div>

              {/* Feature Highlights */}
              <motion.div
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  { icon: Clock, title: "TWAP Orders", desc: "Time-weighted execution" },
                  { icon: TrendingUp, title: "Limit Orders", desc: "Set your target price" },
                  { icon: Shield, title: "Fusion+", desc: "Cross-chain atomic swaps" },
                  { icon: Zap, title: "Dutch Auctions", desc: "MEV protection built-in" },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="p-4 glassmorphism rounded-xl hover-lift"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <feature.icon className="h-8 w-8 text-blue-500 mb-2" />
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Swap Interface */}
            <motion.div
              className="lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <EnhancedSwapInterface />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Advanced <span className="gradient-text">DeFi Features</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Professional trading tools for sophisticated strategies
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Advanced Trading Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="glassmorphism border-0 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    <span>Arbitrage Detection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Real-time cross-chain arbitrage opportunities with intelligent profit calculations and automated execution.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Cross-DEX price monitoring</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Gas-optimized execution</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Risk-adjusted profits</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/trading">Start Trading <ChevronRight className="h-4 w-4 ml-1" /></a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* MEV Protection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glassmorphism border-0 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>MEV Protection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Advanced protection against Maximum Extractable Value attacks using Flashbots and commit-reveal schemes.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Flashbots integration</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Front-running protection</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Risk analysis</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/trading">Enable Protection <ChevronRight className="h-4 w-4 ml-1" /></a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Cross-Chain Infrastructure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="glassmorphism border-0 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Layers className="h-5 w-5 text-green-500" />
                    <span>Cross-Chain Trading</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Seamless trading between Ethereum and Sui networks with HTLC security and atomic swaps.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Ethereum & Sui support</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-green-500" />
                        <span className="text-sm">HTLC security</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Atomic execution</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/trading">Bridge Assets <ChevronRight className="h-4 w-4 ml-1" /></a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Protocol <span className="gradient-text">Analytics</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Real-time insights into the KATA ecosystem
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
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
                    <p className="text-xs text-muted-foreground">
                      <span className={stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                        {stat.change}
                      </span>
                      {' '}from last month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Dock */}
      <FloatingDock items={dockItems} />
    </main>
  );
}
