"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackgroundBeams } from "@/components/ui/background-beams";
import {
  ArrowUpDown,
  Settings,
  ChevronDown,
  Clock,
  TrendingUp,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Wallet,
  Shield,
  Timer,
} from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  logo: string;
  balance: string;
  price: number;
  chain: "ethereum" | "sui";
}

const tokens: Token[] = [
  { symbol: "ETH", name: "Ethereum", logo: "🔷", balance: "2.5", price: 2450, chain: "ethereum" },
  { symbol: "USDC", name: "USD Coin", logo: "💵", balance: "1,250.00", price: 1, chain: "ethereum" },
  { symbol: "SUI", name: "Sui", logo: "🌊", balance: "500.0", price: 1.45, chain: "sui" },
  { symbol: "WBTC", name: "Wrapped Bitcoin", logo: "₿", balance: "0.05", price: 60000, chain: "ethereum" },
];

const orderTypes = [
  {
    id: "swap",
    label: "Instant Swap",
    icon: ArrowUpDown,
    description: "Execute immediately at market price",
    time: "~30 seconds",
    gas: "Medium",
  },
  {
    id: "limit",
    label: "Limit Order",
    icon: TrendingUp,
    description: "Set your target price and wait",
    time: "When price reached",
    gas: "Low",
  },
  {
    id: "twap",
    label: "TWAP Order",
    icon: Clock,
    description: "Split large orders over time",
    time: "Custom duration",
    gas: "Optimized",
  },
];

export default function TradingPage() {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [orderType, setOrderType] = useState("swap");
  const [showTokenSelector, setShowTokenSelector] = useState<"from" | "to" | null>(null);
  const [slippage, setSlippage] = useState("0.5");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleTrade = async () => {
    setIsProcessing(true);
    // Simulate trade processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsProcessing(false);
  };

  const calculateRoute = () => {
    if (!fromAmount || !fromToken || !toToken) return null;
    const amount = parseFloat(fromAmount);
    const estimatedOutput = (amount * fromToken.price) / toToken.price;
    setToAmount(estimatedOutput.toFixed(6));
  };

  React.useEffect(() => {
    calculateRoute();
  }, [fromAmount, fromToken, toToken]);

  const TokenSelector = ({ 
    isOpen, 
    onClose, 
    onSelect, 
    currentToken,
    type 
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (token: Token) => void;
    currentToken: Token;
    type: "from" | "to";
  }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-lg border border-border rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tokens
            .filter(token => token.symbol !== currentToken.symbol)
            .map((token) => (
              <motion.button
                key={token.symbol}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{token.logo}</span>
                  <div className="text-left">
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-xs text-muted-foreground">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{token.balance}</div>
                  <div className="text-xs text-muted-foreground">
                    ${token.price.toLocaleString()}
                  </div>
                </div>
              </motion.button>
            ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <main className="relative min-h-screen">
      <BackgroundBeams />
      <NavigationHeader />

      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Smart <span className="gradient-text">Trading</span>
            </h1>
            <p className="text-muted-foreground">
              Choose your strategy and trade with confidence
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Type Selection */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glassmorphism border-0">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Trading Strategy</h3>
                  <div className="space-y-3">
                    {orderTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          orderType === type.id
                            ? "bg-primary/20 border border-primary/30"
                            : "bg-accent/30 hover:bg-accent/50"
                        }`}
                        onClick={() => setOrderType(type.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <type.icon className="h-5 w-5" />
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {type.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1">
                            <Timer className="h-3 w-3" />
                            <span>{type.time}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {type.gas} Gas
                          </Badge>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trading Interface */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="glassmorphism border-0">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* From Token */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">From</label>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {fromToken.chain === "ethereum" ? "Ethereum" : "Sui"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Balance: {fromToken.balance}
                          </span>
                        </div>
                      </div>

                      <div className="relative">
                        <Button
                          variant="outline"
                          className="w-full justify-between h-16 glassmorphism border-border/50"
                          onClick={() => setShowTokenSelector("from")}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{fromToken.logo}</span>
                            <div className="text-left">
                              <div className="font-semibold">{fromToken.symbol}</div>
                              <div className="text-xs text-muted-foreground">{fromToken.name}</div>
                            </div>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        
                        <TokenSelector
                          isOpen={showTokenSelector === "from"}
                          onClose={() => setShowTokenSelector(null)}
                          onSelect={setFromToken}
                          currentToken={fromToken}
                          type="from"
                        />
                      </div>

                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.0"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          className="h-16 text-2xl font-semibold glassmorphism border-border/50 pr-20"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setFromAmount(fromToken.balance)}
                        >
                          MAX
                        </Button>
                      </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                      <motion.button
                        onClick={handleSwapTokens}
                        className="p-4 rounded-full glassmorphism hover:bg-accent transition-colors"
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ArrowUpDown className="h-6 w-6" />
                      </motion.button>
                    </div>

                    {/* To Token */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">To</label>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {toToken.chain === "ethereum" ? "Ethereum" : "Sui"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Balance: {toToken.balance}
                          </span>
                        </div>
                      </div>

                      <div className="relative">
                        <Button
                          variant="outline"
                          className="w-full justify-between h-16 glassmorphism border-border/50"
                          onClick={() => setShowTokenSelector("to")}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{toToken.logo}</span>
                            <div className="text-left">
                              <div className="font-semibold">{toToken.symbol}</div>
                              <div className="text-xs text-muted-foreground">{toToken.name}</div>
                            </div>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        
                        <TokenSelector
                          isOpen={showTokenSelector === "to"}
                          onClose={() => setShowTokenSelector(null)}
                          onSelect={setToToken}
                          currentToken={toToken}
                          type="to"
                        />
                      </div>

                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.0"
                          value={toAmount}
                          className="h-16 text-2xl font-semibold glassmorphism border-border/50"
                          readOnly
                        />
                        {isProcessing && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            </motion.div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Trade Summary */}
                    {fromAmount && toAmount && (
                      <motion.div
                        className="p-4 glassmorphism rounded-xl space-y-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Exchange Rate</span>
                          <span>1 {fromToken.symbol} = {(toToken.price / fromToken.price).toFixed(6)} {toToken.symbol}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Slippage Tolerance</span>
                          <Badge variant="secondary">{slippage}%</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Estimated Gas</span>
                          <span>~$12.50</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Route</span>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>Best Route Found</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                        disabled={!fromAmount || !toAmount || isProcessing}
                        onClick={handleTrade}
                      >
                        {isProcessing ? (
                          <div className="flex items-center space-x-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <RefreshCw className="h-5 w-5" />
                            </motion.div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            {orderType === "swap" && <Zap className="h-5 w-5" />}
                            {orderType === "limit" && <TrendingUp className="h-5 w-5" />}
                            {orderType === "twap" && <Clock className="h-5 w-5" />}
                            <span>
                              {orderType === "swap" && "Execute Swap"}
                              {orderType === "limit" && "Place Limit Order"}
                              {orderType === "twap" && "Create TWAP Order"}
                            </span>
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        )}
                      </Button>
                    </motion.div>

                    {/* Security Notice */}
                    <div className="flex items-center space-x-2 p-3 bg-blue-500/10 rounded-lg">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">
                        Your funds are secured by audited smart contracts
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
