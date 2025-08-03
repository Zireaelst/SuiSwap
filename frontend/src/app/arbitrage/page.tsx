'use client';

import { motion } from 'framer-motion';
import { ArbitrageDashboard } from '@/components/ArbitrageDashboard';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, DollarSign, Clock } from 'lucide-react';

export default function ArbitragePage() {
  const stats = [
    {
      title: "Active Opportunities",
      value: "14",
      change: "+3 from last hour",
      icon: Target,
      color: "text-purple-500"
    },
    {
      title: "24h Profit",
      value: "$8,247",
      change: "+12.4% from yesterday",
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      title: "Success Rate",
      value: "94.2%",
      change: "+2.1% this week",
      icon: TrendingUp,
      color: "text-blue-500"
    },
    {
      title: "Avg Execution",
      value: "2.3s",
      change: "-0.4s improvement",
      icon: Clock,
      color: "text-orange-500"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Arbitrage Trading Hub
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Real-time cross-chain arbitrage opportunities with intelligent execution and profit optimization
          </p>
          <div className="flex justify-center mt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Live Monitoring Active
            </Badge>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Arbitrage Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ArbitrageDashboard />
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid lg:grid-cols-2 gap-8"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-500" />
                <span>How Arbitrage Works</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400">1</div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Price Detection</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Monitor prices across multiple DEXs in real-time</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">2</div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Profit Calculation</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Calculate potential profits after gas and fees</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400">3</div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Automated Execution</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Execute trades simultaneously for guaranteed profit</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Risk Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="font-medium text-green-800 dark:text-green-300">MEV Protection</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Protected against front-running attacks</div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="font-medium text-blue-800 dark:text-blue-300">Slippage Control</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Automatic slippage adjustment based on market conditions</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="font-medium text-purple-800 dark:text-purple-300">Gas Optimization</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Smart gas pricing for maximum profitability</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
