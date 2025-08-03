"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import { 
  useOneInchTokens, 
  useOneInchPrices, 
  useOneInchSwap,
  TokenInfo 
} from "@/hooks/useOneInch";
import { 
  ArrowUpDown, 
  Settings, 
  Clock, 
  Zap,
  RefreshCw,
  ChevronDown,
  Search,
  Sparkles,
  Activity,
  Target
} from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  address: string;
  logo?: string;
  price?: number;
  change24h?: number;
}

const popularTokens: Token[] = [
  { 
    symbol: "ETH", 
    name: "Ethereum", 
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    logo: "🔷" 
  },
  { 
    symbol: "USDC", 
    name: "USD Coin", 
    address: "0xA0b86a33E6441b9c0Ec4AD851c1e4Ec3C02Db0b2",
    logo: "💵" 
  },
  { 
    symbol: "1INCH", 
    name: "1inch", 
    address: "0x111111111117dc0aa78b770fa6a738034120c302",
    logo: "🦄" 
  },
  { 
    symbol: "WBTC", 
    name: "Wrapped Bitcoin", 
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    logo: "₿" 
  }
];

export const EnhancedSwapInterface = () => {
  const [fromToken, setFromToken] = useState<Token>(popularTokens[0]);
  const [toToken, setToToken] = useState<Token>(popularTokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [activeTab, setActiveTab] = useState("swap");
  const [showTokenSearch, setShowTokenSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectingFrom, setIsSelectingFrom] = useState(true);
  const [slippage, setSlippage] = useState(1);

  // 1inch API hooks
  const { tokens: oneInchTokens, loading: tokensLoading } = useOneInchTokens(1);
  const { prices, loading: pricesLoading } = useOneInchPrices(
    1, 
    [fromToken.address, toToken.address]
  );
  const { getQuote, buildTransaction, loading: swapLoading } = useOneInchSwap();

  // Convert 1inch tokens to our Token interface
  const availableTokens: Token[] = React.useMemo(() => {
    if (!oneInchTokens) return popularTokens;
    
    return Object.values(oneInchTokens).map((token: TokenInfo) => ({
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      logo: token.logoURI || "🪙"
    }));
  }, [oneInchTokens]);

  // Get quote when amounts change
  useEffect(() => {
    const getSwapQuote = async () => {
      if (!fromAmount || !fromToken || !toToken || parseFloat(fromAmount) <= 0) return;
      
      try {
        const quote = await getQuote(
          1,
          fromToken.address,
          toToken.address,
          fromAmount
        );
        
        if (quote) {
          setToAmount(quote.toTokenAmount);
        }
      } catch (error) {
        console.error('Failed to get quote:', error);
      }
    };

    const debounceTimer = setTimeout(getSwapQuote, 500);
    return () => clearTimeout(debounceTimer);
  }, [fromAmount, fromToken, toToken, getQuote]);

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0.00';
    if (numPrice < 0.01) return numPrice.toFixed(6);
    if (numPrice < 1) return numPrice.toFixed(4);
    return numPrice.toFixed(2);
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleTokenSelect = (token: Token) => {
    if (isSelectingFrom) {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setShowTokenSearch(false);
  };

  const openTokenSelector = (isFrom: boolean) => {
    setIsSelectingFrom(isFrom);
    setShowTokenSearch(true);
  };

  const TokenDisplay = ({ 
    token, 
    label, 
    amount, 
    onAmountChange, 
    onTokenSelect, 
    isReadonly = false 
  }: {
    token: Token;
    label: string;
    amount: string;
    onAmountChange: (value: string) => void;
    onTokenSelect: () => void;
    isReadonly?: boolean;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        {prices[token.address] && !pricesLoading && (
          <motion.div
            className="flex items-center gap-1 text-xs text-green-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Activity className="h-3 w-3" />
            <span>${formatPrice(prices[token.address])}</span>
          </motion.div>
        )}
      </div>
      
      <div className="relative">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
          <motion.button
            onClick={onTokenSelect}
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">{token.logo}</span>
            <div className="text-left">
              <div className="font-semibold">{token.symbol}</div>
              <div className="text-xs text-gray-400">{token.name}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.button>
          
          <div className="flex-1">
            <Input
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0.0"
              className="text-right text-xl font-bold bg-transparent border-none p-0 h-auto text-white placeholder:text-gray-500"
              readOnly={isReadonly}
            />
          </div>
        </div>
        
        {amount && !pricesLoading && prices[token.address] && (
          <motion.div
            className="mt-2 text-sm text-gray-400 text-right"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ≈ ${(parseFloat(amount) * parseFloat(prices[token.address])).toFixed(2)}
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <BackgroundBeams />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glassmorphism border-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <motion.div
                  className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </motion.div>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Enhanced Swap
                </span>
                <Badge variant="secondary" className="glassmorphism text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Powered by 1inch
                </Badge>
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 glassmorphism">
                    <Settings className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 glassmorphism">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
            
            {/* Enhanced Tab Navigation */}
            <div className="flex gap-1 bg-black/20 rounded-xl p-1 backdrop-blur-sm">
              {[
                { id: "swap", label: "Swap", icon: ArrowUpDown },
                { id: "limit", label: "Limit", icon: Target },
                { id: "twap", label: "TWAP", icon: Clock }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id 
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === "swap" && (
                <motion.div
                  key="swap"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <TokenDisplay
                    token={fromToken}
                    label="From"
                    amount={fromAmount}
                    onAmountChange={setFromAmount}
                    onTokenSelect={() => openTokenSelector(true)}
                  />

                  {/* Enhanced Swap Button */}
                  <div className="flex justify-center">
                    <motion.button
                      onClick={handleSwapTokens}
                      className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <ArrowUpDown className="h-5 w-5 text-white" />
                    </motion.button>
                  </div>

                  <TokenDisplay
                    token={toToken}
                    label="To"
                    amount={toAmount}
                    onAmountChange={setToAmount}
                    onTokenSelect={() => openTokenSelector(false)}
                    isReadonly={true}
                  />

                  {/* Enhanced Swap Details */}
                  {fromAmount && toAmount && (
                    <motion.div
                      className="space-y-3 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Exchange Rate</span>
                        <span className="text-white">1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(4)} {toToken.symbol}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Network Fee</span>
                        <span className="text-green-400">~$0.50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Price Impact</span>
                        <span className="text-green-400">&lt; 0.01%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Slippage</span>
                        <span className="text-blue-400">{slippage}%</span>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg"
                      disabled={!fromAmount || !toAmount || swapLoading}
                    >
                      {swapLoading ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Getting Best Price...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Swap Tokens
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Token Search Modal */}
      <AnimatePresence>
        {showTokenSearch && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTokenSearch(false)}
          >
            <motion.div
              className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md m-4 border border-white/10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Select Token</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowTokenSearch(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tokens..."
                  className="pl-10 bg-black/20 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {/* Popular Tokens */}
                <div className="text-sm font-medium text-gray-400 mb-2">Popular</div>
                {popularTokens.map((token) => (
                  <motion.button
                    key={token.address}
                    onClick={() => handleTokenSelect(token)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xl">{token.logo}</span>
                    <div className="flex-1">
                      <div className="font-medium text-white">{token.symbol}</div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                    </div>
                    {prices[token.address] && !pricesLoading && (
                      <div className="text-right">
                        <div className="font-medium text-white">${formatPrice(prices[token.address])}</div>
                      </div>
                    )}
                  </motion.button>
                ))}

                {/* Filtered Search Results */}
                {searchQuery.length > 2 && availableTokens
                  .filter(token => 
                    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    token.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 10)
                  .map((token: Token) => (
                    <motion.button
                      key={token.address}
                      onClick={() => handleTokenSelect(token)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-xl">{token.logo}</span>
                      <div className="flex-1">
                        <div className="font-medium text-white">{token.symbol}</div>
                        <div className="text-sm text-gray-400">{token.name}</div>
                      </div>
                    </motion.button>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
