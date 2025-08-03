"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import { 
  ArrowUpDown, 
  Settings, 
  Clock, 
  TrendingUp, 
  Zap,
  RefreshCw,
  ChevronDown,
  Info,
  Wallet,
  DollarSign
} from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  logo: string;
  balance?: string;
}

const tokens: Token[] = [
  { symbol: "ETH", name: "Ethereum", logo: "🔷", balance: "2.5" },
  { symbol: "USDC", name: "USD Coin", logo: "💵", balance: "1,250.00" },
  { symbol: "SUI", name: "Sui", logo: "🌊", balance: "500.0" },
  { symbol: "WBTC", name: "Wrapped Bitcoin", logo: "₿", balance: "0.05" },
];

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

export const ModernSwapInterface = () => {
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [slippage, setSlippage] = useState("0.5");

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleQuote = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setToAmount((parseFloat(fromAmount || "0") * 0.998).toString());
      setIsLoading(false);
    }, 1000);
  };

  const TokenSelector = ({ 
    token, 
    onSelect, 
    label 
  }: { 
    token: Token; 
    onSelect: (token: Token) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">{label}</label>
      <Button
        variant="outline"
        className="w-full justify-between bg-black/30 border-white/20 text-white hover:bg-white/10"
        onClick={() => {
          // Token selection logic would go here
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{token.logo}</span>
          <div className="text-left">
            <div className="font-medium">{token.symbol}</div>
            <div className="text-xs text-gray-400">{token.name}</div>
          </div>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      <div className="h-full w-full bg-black bg-grid-white/[0.02] relative">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-20 container mx-auto p-6 max-w-4xl"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent mb-4">
              Advanced Swap Interface
            </h1>
            <p className="text-gray-400 text-lg">
              Cross-chain swaps with MEV protection and optimal routing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Swap Interface */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Swap Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* From Token */}
                  <div className="space-y-4">
                    <TokenSelector 
                      token={fromToken} 
                      onSelect={setFromToken} 
                      label="From" 
                    />
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="text-2xl h-14 bg-black/30 border-white/20 text-white placeholder-gray-500 focus:border-blue-400"
                      />
                      {fromToken.balance && (
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-gray-400">
                            Balance: {fromToken.balance} {fromToken.symbol}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-blue-400 hover:text-blue-300"
                            onClick={() => setFromAmount(fromToken.balance || "")}
                          >
                            MAX
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleSwapTokens}
                      variant="outline"
                      size="icon"
                      className="border-white/20 text-white hover:bg-white/10 rounded-full w-12 h-12"
                    >
                      <ArrowUpDown className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* To Token */}
                  <div className="space-y-4">
                    <TokenSelector 
                      token={toToken} 
                      onSelect={setToToken} 
                      label="To" 
                    />
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={toAmount}
                        readOnly
                        className="text-2xl h-14 bg-black/30 border-white/20 text-white placeholder-gray-500"
                      />
                      {toToken.balance && (
                        <div className="mt-2 text-sm text-gray-400">
                          Balance: {toToken.balance} {toToken.symbol}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Swap Information */}
                  {fromAmount && toAmount && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-black/30 border border-white/10 space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Rate</span>
                        <span className="text-white">
                          1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Slippage</span>
                        <span className="text-white">{slippage}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Estimated Gas</span>
                        <span className="text-white">~$12.50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Route</span>
                        <span className="text-white">1inch → Uniswap V3</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleQuote}
                      disabled={!fromAmount || isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isLoading ? 'Getting Quote...' : 'Get Quote'}
                    </Button>
                    
                    {toAmount && (
                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Swap Tokens
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Settings */}
              <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-400" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Slippage Tolerance
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["0.1", "0.5", "1.0"].map((value) => (
                        <Button
                          key={value}
                          variant={slippage === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSlippage(value)}
                          className={slippage === value ? 
                            "bg-blue-600 text-white" : 
                            "border-white/20 text-white hover:bg-white/10"
                          }
                        >
                          {value}%
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Transaction Deadline
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue="20"
                        className="bg-black/30 border-white/20 text-white"
                      />
                      <span className="text-gray-400 text-sm">minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Info */}
              <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    Market Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">ETH Price</span>
                    <span className="text-green-400 font-medium">$2,456.78</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">24h Change</span>
                    <span className="text-green-400 font-medium">+2.34%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">SUI Price</span>
                    <span className="text-blue-400 font-medium">$1.89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">24h Volume</span>
                    <span className="text-white font-medium">$2.4B</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { action: "Swap", tokens: "ETH → USDC", amount: "1.5 ETH", time: "2m ago" },
                    { action: "Bridge", tokens: "SUI → ETH", amount: "100 SUI", time: "15m ago" },
                    { action: "Swap", tokens: "WBTC → ETH", amount: "0.05 WBTC", time: "1h ago" },
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-2 rounded bg-black/30 border border-white/5"
                    >
                      <div>
                        <div className="text-white text-sm font-medium">
                          {activity.action}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {activity.tokens}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">
                          {activity.amount}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {activity.time}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
        
        <BackgroundBeams />
      </div>
    </div>
  );
};
