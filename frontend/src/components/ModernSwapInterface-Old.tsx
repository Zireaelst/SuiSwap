"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowUpDown, 
  Settings, 
  Clock, 
  TrendingUp, 
  Zap,
  RefreshCw,
  ChevronDown,
  Info
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

export const ModernSwapInterface = () => {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage] = useState("0.5");
  const [activeTab, setActiveTab] = useState("swap");

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const TokenSelector = ({ 
    token, 
    label 
  }: { 
    token: Token; 
    onSelect?: (token: Token) => void; 
    label: string; 
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <Button
        variant="outline"
        className="w-full justify-between h-12 glassmorphism border-0"
        onClick={() => {/* Token selection modal */}}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">{token.logo}</span>
          <div className="text-left">
            <div className="font-semibold">{token.symbol}</div>
            <div className="text-xs text-muted-foreground">{token.name}</div>
          </div>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>
      {token.balance && (
        <div className="text-right text-xs text-muted-foreground">
          Balance: {token.balance} {token.symbol}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glassmorphism border-0 shadow-2xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold gradient-text">Trade</CardTitle>
              <motion.button
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Settings className="h-5 w-5" />
              </motion.button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full glassmorphism">
                <TabsTrigger value="swap" className="flex items-center space-x-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Swap</span>
                </TabsTrigger>
                <TabsTrigger value="limit" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Limit</span>
                </TabsTrigger>
                <TabsTrigger value="twap" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>TWAP</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="space-y-6">
            <TabsContent value="swap" className="space-y-6 mt-0">
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
                    className="h-16 text-2xl font-semibold glassmorphism border-0 pr-20"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setFromAmount(fromToken.balance || "")}
                  >
                    MAX
                  </Button>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <motion.button
                  onClick={handleSwapTokens}
                  className="p-3 rounded-xl glassmorphism hover:bg-accent transition-colors"
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowUpDown className="h-5 w-5" />
                </motion.button>
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
                    onChange={(e) => setToAmount(e.target.value)}
                    className="h-16 text-2xl font-semibold glassmorphism border-0"
                    readOnly
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Trading Info */}
              <div className="space-y-3 p-4 glassmorphism rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span>1 ETH = 2,450 USDC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center space-x-1">
                    <span>Slippage</span>
                    <Info className="h-3 w-3" />
                  </span>
                  <Badge variant="secondary">{slippage}%</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span>~$12.50</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="limit" className="space-y-6 mt-0">
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Limit Orders</h3>
                <p className="text-muted-foreground text-sm">
                  Set a specific price for your trade to execute automatically
                </p>
              </div>
            </TabsContent>

            <TabsContent value="twap" className="space-y-6 mt-0">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">TWAP Orders</h3>
                <p className="text-muted-foreground text-sm">
                  Execute large orders over time to minimize price impact
                </p>
              </div>
            </TabsContent>

            {/* Action Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={!fromAmount || !toAmount}
              >
                <Zap className="h-5 w-5 mr-2" />
                {activeTab === "swap" ? "Swap Tokens" : 
                 activeTab === "limit" ? "Place Limit Order" : 
                 "Create TWAP Order"}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
