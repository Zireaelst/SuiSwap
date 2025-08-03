"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { EnhancedSwapInterface } from "@/components/EnhancedSwapInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackgroundBeams } from "@/components/ui/background-beams";
import {
  ArrowUpDown,
  Target,
  Shield,
  CheckCircle,
  TrendingUp,
  Clock,
  Activity
} from "lucide-react";

// Trading Strategy Components
const LimitOrderInterface = () => {
  const [targetPrice, setTargetPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");

  return (
    <Card className="backdrop-blur-sm bg-white/5 border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5" />
          Limit Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={orderType === "buy" ? "default" : "outline"}
            onClick={() => setOrderType("buy")}
            className="flex-1"
          >
            Buy
          </Button>
          <Button
            variant={orderType === "sell" ? "default" : "outline"}
            onClick={() => setOrderType("sell")}
            className="flex-1"
          >
            Sell
          </Button>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Target Price</label>
          <Input
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="Enter target price..."
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Amount</label>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        
        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          Create Limit Order
        </Button>
      </CardContent>
    </Card>
  );
};

const TWAPInterface = () => {
  const [duration, setDuration] = useState("");
  const [intervals, setIntervals] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  return (
    <Card className="backdrop-blur-sm bg-white/5 border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          TWAP Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Total Amount</label>
          <Input
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="Enter total amount..."
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Duration (hours)</label>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="24"
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Intervals</label>
            <Input
              value={intervals}
              onChange={(e) => setIntervals(e.target.value)}
              placeholder="12"
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
        </div>
        
        <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          Start TWAP Order
        </Button>
      </CardContent>
    </Card>
  );
};

const ArbitrageMonitor = () => {
  const arbitrageOpportunities = [
    {
      token: "ETH/USDC",
      buyExchange: "Uniswap V3",
      sellExchange: "SushiSwap",
      profit: "0.23%",
      amount: "$12,450",
      status: "active"
    },
    {
      token: "WBTC/ETH",
      buyExchange: "Curve",
      sellExchange: "Balancer",
      profit: "0.18%",
      amount: "$8,920",
      status: "pending"
    }
  ];

  return (
    <Card className="backdrop-blur-sm bg-white/5 border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Arbitrage Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {arbitrageOpportunities.map((opp, index) => (
          <div key={index} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">{opp.token}</span>
              <Badge 
                variant={opp.status === "active" ? "default" : "secondary"}
                className="text-xs"
              >
                {opp.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
              <div>Buy: {opp.buyExchange}</div>
              <div>Sell: {opp.sellExchange}</div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-green-400 font-medium">+{opp.profit}</span>
              <span className="text-gray-400">{opp.amount}</span>
            </div>
          </div>
        ))}
        
        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          Monitor All Opportunities
        </Button>
      </CardContent>
    </Card>
  );
};

const ActiveOrdersList = () => {
  const [orders] = useState([
    {
      id: 1,
      type: "Limit",
      pair: "ETH/USDC",
      side: "Buy",
      amount: "1.5 ETH",
      price: "$3,200",
      status: "Active",
      filled: "0%"
    },
    {
      id: 2,
      type: "TWAP",
      pair: "WBTC/ETH",
      side: "Sell",
      amount: "0.1 WBTC",
      price: "Market",
      status: "Running",
      filled: "35%"
    }
  ]);

  return (
    <Card className="backdrop-blur-sm bg-white/5 border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Active Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {order.type}
                </Badge>
                <span className="text-white font-medium">{order.pair}</span>
              </div>
              <Badge 
                variant={order.status === "Active" ? "default" : "secondary"}
                className="text-xs"
              >
                {order.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm text-gray-300">
              <div>{order.side} {order.amount}</div>
              <div>@ {order.price}</div>
              <div className="text-right">{order.filled} filled</div>
            </div>
            
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" className="flex-1">
                Modify
              </Button>
              <Button size="sm" variant="destructive" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const MEVProtectionInterface = () => {
  const [enabled, setEnabled] = useState(true);
  const [slippageTolerance, setSlippageTolerance] = useState("0.5");
  const [protectionLevel, setProtectionLevel] = useState<"low" | "medium" | "high">("medium");

  const protectionStats = {
    transactionsProtected: 1247,
    mevBlocked: '$127K',
    successRate: '94.2%',
    gasOptimized: '15%'
  };

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              MEV Protection Service
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${enabled ? 'text-green-400' : 'text-gray-400'}`}>
                {enabled ? 'Enabled' : 'Disabled'}
              </span>
              <Button
                variant={enabled ? "default" : "outline"}
                size="sm"
                onClick={() => setEnabled(!enabled)}
              >
                {enabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Protection Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <div className="text-sm text-gray-400 mb-1">Protected Txs</div>
              <div className="text-xl font-bold text-white">{protectionStats.transactionsProtected}</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <div className="text-sm text-gray-400 mb-1">MEV Blocked</div>
              <div className="text-xl font-bold text-white">{protectionStats.mevBlocked}</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <div className="text-sm text-gray-400 mb-1">Success Rate</div>
              <div className="text-xl font-bold text-white">{protectionStats.successRate}</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30">
              <div className="text-sm text-gray-400 mb-1">Gas Saved</div>
              <div className="text-xl font-bold text-white">{protectionStats.gasOptimized}</div>
            </div>
          </div>

          {/* Protection Level */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Protection Level</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <Button
                  key={level}
                  variant={protectionLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setProtectionLevel(level)}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Slippage Tolerance */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Slippage Tolerance (%)</label>
            <Input
              value={slippageTolerance}
              onChange={(e) => setSlippageTolerance(e.target.value)}
              placeholder="0.5"
              className="bg-white/5 border-white/20 text-white"
            />
          </div>

          {/* Protection Features */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="font-medium text-green-300">Protection Active</span>
              </div>
              <ul className="text-sm text-green-400 space-y-1">
                <li>• Flashbots private mempool</li>
                <li>• Front-running detection</li>
                <li>• Sandwich attack prevention</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="font-medium text-blue-300 mb-2">Current Status</div>
              <div className="text-sm text-blue-400 space-y-1">
                <div>• Network congestion: Low</div>
                <div>• MEV activity: Normal</div>
                <div>• Gas price: Optimal</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function TradingPage() {
  const [activeTab, setActiveTab] = useState<'swap' | 'limit' | 'twap' | 'arbitrage' | 'mev'>('swap');

  const tradingTabs = [
    { id: 'swap' as const, label: 'Swap', icon: ArrowUpDown },
    { id: 'limit' as const, label: 'Limit Orders', icon: Target },
    { id: 'twap' as const, label: 'TWAP', icon: Clock },
    { id: 'arbitrage' as const, label: 'Arbitrage', icon: TrendingUp },
    { id: 'mev' as const, label: 'MEV Protection', icon: Shield }
  ];

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <BackgroundBeams />
      <NavigationHeader />

      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Advanced Trading Hub
            </h1>
            <p className="text-gray-400 text-lg">
              Professional trading tools with 1inch API integration and MEV protection
            </p>
          </motion.div>

          {/* Trading Tabs */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex flex-wrap justify-center gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              {tradingTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Dynamic Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6"
          >
            {activeTab === 'swap' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <EnhancedSwapInterface />
                </div>
                <div className="space-y-6">
                  <ActiveOrdersList />
                </div>
              </div>
            )}
            
            {activeTab === 'limit' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LimitOrderInterface />
                </div>
                <div className="space-y-6">
                  <ActiveOrdersList />
                </div>
              </div>
            )}
            
            {activeTab === 'twap' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TWAPInterface />
                </div>
                <div className="space-y-6">
                  <ActiveOrdersList />
                </div>
              </div>
            )}
            
            {activeTab === 'arbitrage' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <ArbitrageMonitor />
                <ActiveOrdersList />
              </div>
            )}
            
            {activeTab === 'mev' && (
              <div className="max-w-4xl mx-auto">
                <MEVProtectionInterface />
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
