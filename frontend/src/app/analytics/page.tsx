"use client";
import React from "react";
import { motion } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BackgroundBeams } from "@/components/ui/background-beams";
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
} from "lucide-react";

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
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Protocol Analytics
            </h1>
            <p className="text-gray-400 text-lg">
              Real-time insights powered by 1inch API integration
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {tradingStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="backdrop-blur-sm bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
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
                      <span className="text-xs text-gray-500">from yesterday</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Volume Chart */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
                            <Card className="backdrop-blur-sm bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
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
              <Card className="backdrop-blur-sm bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
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
              <Card className="backdrop-blur-sm bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
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
              <Card className="backdrop-blur-sm bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
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
      </section>
    </main>
  );
}
