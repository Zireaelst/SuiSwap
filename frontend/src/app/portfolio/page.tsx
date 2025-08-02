"use client";
import React from "react";
import { motion } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpDown,
  Eye,
  EyeOff
} from "lucide-react";

const portfolioData = {
  totalValue: "$12,450.32",
  totalChange: "+$1,234.56",
  totalChangePercent: "+11.0%",
  isPositive: true
};

const tokens = [
  {
    symbol: "ETH",
    name: "Ethereum",
    logo: "🔷",
    balance: "2.5",
    value: "$6,125.00",
    change: "+$312.50",
    changePercent: "+5.4%",
    isPositive: true
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    logo: "💵",
    balance: "3,250.00",
    value: "$3,250.00",
    change: "$0.00",
    changePercent: "0.0%",
    isPositive: true
  },
  {
    symbol: "SUI",
    name: "Sui",
    logo: "🌊",
    balance: "1,500.0",
    value: "$2,175.00",
    change: "+$175.00",
    changePercent: "+8.8%",
    isPositive: true
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    logo: "₿",
    balance: "0.015",
    value: "$900.32",
    change: "-$45.68",
    changePercent: "-4.8%",
    isPositive: false
  }
];

const transactions = [
  {
    type: "swap",
    from: "ETH",
    to: "USDC",
    amount: "0.5 ETH",
    value: "$1,225.00",
    time: "2 hours ago",
    status: "completed"
  },
  {
    type: "limit",
    from: "SUI",
    to: "ETH",
    amount: "500 SUI",
    value: "$725.00",
    time: "1 day ago",
    status: "pending"
  },
  {
    type: "twap",
    from: "USDC",
    to: "WBTC",
    amount: "1000 USDC",
    value: "$1,000.00",
    time: "3 days ago",
    status: "completed"
  }
];

export default function PortfolioPage() {
  const [hideBalances, setHideBalances] = React.useState(false);

  return (
    <main className="relative min-h-screen">
      <BackgroundBeams />
      <NavigationHeader />

      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Portfolio <span className="gradient-text">Overview</span>
                </h1>
                <p className="text-muted-foreground">
                  Track your cross-chain assets and trading performance
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHideBalances(!hideBalances)}
                className="glassmorphism border-0"
              >
                {hideBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>

            {/* Total Portfolio Value */}
            <Card className="glassmorphism border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Portfolio Value</p>
                    <h2 className="text-4xl font-bold mb-2">
                      {hideBalances ? "••••••" : portfolioData.totalValue}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className={`flex items-center text-sm ${
                        portfolioData.isPositive ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {portfolioData.isPositive ? 
                          <TrendingUp className="h-4 w-4 mr-1" /> : 
                          <TrendingDown className="h-4 w-4 mr-1" />
                        }
                        {hideBalances ? "••••" : portfolioData.totalChange}
                      </span>
                      <Badge variant={portfolioData.isPositive ? "default" : "destructive"}>
                        {hideBalances ? "••••" : portfolioData.totalChangePercent}
                      </Badge>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center space-x-4">
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-2">
                        <Wallet className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">Connected</p>
                    </div>
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-2">
                        <BarChart3 className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Assets Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Token Holdings */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-xl font-semibold mb-4">Token Holdings</h3>
                <div className="space-y-4">
                  {tokens.map((token, index) => (
                    <motion.div
                      key={token.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                    >
                      <Card className="glassmorphism border-0 hover-lift">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-2xl">
                                {token.logo}
                              </div>
                              <div>
                                <h4 className="font-semibold">{token.symbol}</h4>
                                <p className="text-sm text-muted-foreground">{token.name}</p>
                                <p className="text-sm">
                                  {hideBalances ? "••••" : `${token.balance} ${token.symbol}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {hideBalances ? "••••••" : token.value}
                              </p>
                              <div className="flex items-center space-x-1">
                                {token.isPositive ? 
                                  <ArrowUpRight className="h-3 w-3 text-green-500" /> :
                                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                                }
                                <span className={`text-xs ${
                                  token.isPositive ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  {hideBalances ? "••••" : token.changePercent}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <Card className="glassmorphism border-0">
                  <CardContent className="p-6 space-y-4">
                    {transactions.map((tx, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 + 0.5 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            {tx.type === 'swap' && <ArrowUpDown className="h-4 w-4 text-blue-500" />}
                            {tx.type === 'limit' && <TrendingUp className="h-4 w-4 text-green-500" />}
                            {tx.type === 'twap' && <Clock className="h-4 w-4 text-purple-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {tx.from} → {tx.to}
                            </p>
                            <p className="text-xs text-muted-foreground">{tx.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {hideBalances ? "••••" : tx.amount}
                          </p>
                          <Badge 
                            variant={tx.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start glassmorphism border-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Buy More Assets
                  </Button>
                  <Button className="w-full justify-start glassmorphism border-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Create Limit Order
                  </Button>
                  <Button className="w-full justify-start glassmorphism border-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30">
                    <Clock className="h-4 w-4 mr-2" />
                    Setup TWAP
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
