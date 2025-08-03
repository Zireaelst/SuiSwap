// components/CrossChainSwapInterface.tsx
// Main interface for Ethereum-Sui cross-chain swaps with Fusion+ integration

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpDown, 
  Zap, 
  Shield, 
  Clock, 
  ArrowRightLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import useCrossChainSwap, { CrossChainSwapParams, SwapOrder } from '@/hooks/useCrossChainSwap';
import { ethers } from 'ethers';

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
  balance?: string;
  chain: 'ethereum' | 'sui';
}

interface CrossChainSwapInterfaceProps {
  walletAddress?: string;
  ethSigner?: ethers.Signer;
  suiSigner?: any;
  className?: string;
}

const SUPPORTED_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: ethers.ZeroAddress,
    decimals: 18,
    logoURI: '⟠',
    chain: 'ethereum'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86a33E6441b9c0Ec4AD851c1e4Ec3C02Db0b2',
    decimals: 6,
    logoURI: '💵',
    chain: 'ethereum'
  },
  {
    symbol: 'SUI',
    name: 'Sui',
    address: '0x2::sui::SUI',
    decimals: 9,
    logoURI: '🌊',
    chain: 'sui'
  }
];

export const CrossChainSwapInterface: React.FC<CrossChainSwapInterfaceProps> = ({
  walletAddress,
  ethSigner,
  suiSigner,
  className = ''
}) => {
  const [fromToken, setFromToken] = useState<Token>(SUPPORTED_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(SUPPORTED_TOKENS[2]);
  const [fromAmount, setFromAmount] = useState('');
  const [recipient, setRecipient] = useState(walletAddress || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customTimelock, setCustomTimelock] = useState('');

  const {
    quote,
    quoteLoading,
    quoteError,
    getQuote,
    swapLoading,
    swapError,
    initiateSwap,
    executeSwap,
    refundOrder,
    activeOrders,
    validateParams,
    getSupportedTokenPairs
  } = useCrossChainSwap();

  const [activeTab, setActiveTab] = useState<'swap' | 'orders'>('swap');

  // Update recipient when wallet changes
  useEffect(() => {
    if (walletAddress && !recipient) {
      setRecipient(walletAddress);
    }
  }, [walletAddress, recipient]);

  // Auto-quote when parameters change
  useEffect(() => {
    if (fromAmount && fromToken && toToken && recipient) {
      const params: CrossChainSwapParams = {
        fromChain: fromToken.chain,
        toChain: toToken.chain,
        fromToken: fromToken.address,
        toToken: toToken.address,
        amount: fromAmount,
        recipient,
        userAddress: walletAddress || '',
        timelock: customTimelock ? parseInt(customTimelock) : undefined
      };
      
      const validation = validateParams(params);
      if (validation.valid) {
        getQuote(params);
      }
    }
  }, [fromAmount, fromToken, toToken, recipient, customTimelock, walletAddress, getQuote, validateParams]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
  };

  const handleInitiateSwap = async () => {
    if (!ethSigner || !fromAmount || !fromToken || !toToken || !recipient) return;

    const params: CrossChainSwapParams = {
      fromChain: fromToken.chain,
      toChain: toToken.chain,
      fromToken: fromToken.address,
      toToken: toToken.address,
      amount: fromAmount,
      recipient,
      userAddress: walletAddress || '',
      timelock: customTimelock ? parseInt(customTimelock) : undefined
    };

    try {
      const order = await initiateSwap(params, ethSigner);
      setActiveTab('orders');
      console.log('Swap initiated:', order);
    } catch (error) {
      console.error('Failed to initiate swap:', error);
    }
  };

  const handleExecuteSwap = async (order: SwapOrder) => {
    if (!ethSigner) return;
    
    try {
      await executeSwap(order, ethSigner);
    } catch (error) {
      console.error('Failed to execute swap:', error);
    }
  };

  const handleRefund = async (order: SwapOrder) => {
    if (!ethSigner) return;
    
    try {
      await refundOrder(order, ethSigner);
    } catch (error) {
      console.error('Failed to refund order:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status: SwapOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'locked': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'withdrawn': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'refunded': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: SwapOrder['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'locked': return <Shield className="h-3 w-3" />;
      case 'withdrawn': return <CheckCircle className="h-3 w-3" />;
      case 'refunded': return <RefreshCw className="h-3 w-3" />;
      case 'expired': return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const formatTimeRemaining = (timelock: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = timelock - now;
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-2">
          <Badge variant="secondary" className="glassmorphism border-white/20 bg-white/10">
            <Zap className="h-4 w-4 mr-2" />
            Cross-Chain Fusion+
          </Badge>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
          Ethereum ⟷ Sui Bridge
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Secure atomic swaps between Ethereum and Sui using Hash Time Lock Contracts (HTLC) 
          with 1inch Fusion+ integration for optimal routing and partial fills.
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'swap' | 'orders')} className="w-full">
        <TabsList className="grid grid-cols-2 w-full glassmorphism border-white/20">
          <TabsTrigger value="swap" className="data-[state=active]:bg-white/20">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Swap
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-white/20">
            <Shield className="h-4 w-4 mr-2" />
            Orders ({activeOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="swap" className="space-y-6">
          <Card className="glassmorphism border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-400" />
                Cross-Chain Swap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Token */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">From</label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{fromToken.logoURI}</span>
                        <div>
                          <div className="font-semibold text-white">{fromToken.symbol}</div>
                          <div className="text-xs text-white/60">{fromToken.name}</div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          placeholder="0.0"
                          className="bg-transparent border-none text-right text-xl font-semibold text-white placeholder-white/40 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center">
                <motion.button
                  onClick={handleSwapTokens}
                  className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowUpDown className="h-5 w-5 text-white" />
                </motion.button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">To</label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{toToken.logoURI}</span>
                        <div>
                          <div className="font-semibold text-white">{toToken.symbol}</div>
                          <div className="text-xs text-white/60">{toToken.name}</div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Input
                          value={quote?.toAmount || ''}
                          readOnly
                          placeholder="0.0"
                          className="bg-transparent border-none text-right text-xl font-semibold text-white placeholder-white/40 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipient Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Recipient Address</label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x... or Sui address"
                  className="bg-black/20 border-white/10 text-white placeholder-white/40"
                />
              </div>

              {/* Quote Information */}
              <AnimatePresence>
                {quote && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Exchange Rate</span>
                      <span className="text-white">
                        1 {fromToken.symbol} = {quote.rate.toFixed(6)} {toToken.symbol}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Price Impact</span>
                      <span className={quote.priceImpact > 5 ? 'text-red-400' : 'text-green-400'}>
                        {quote.priceImpact.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Estimated Time</span>
                      <span className="text-white">{quote.estimatedTime} minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Bridge Fee</span>
                      <span className="text-white">{quote.fees.total} {fromToken.symbol}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Advanced Options */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <Info className="h-4 w-4" />
                  Advanced Options
                </button>
                
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Custom Timelock (seconds)</label>
                        <Input
                          value={customTimelock}
                          onChange={(e) => setCustomTimelock(e.target.value)}
                          placeholder="7200 (2 hours)"
                          className="bg-black/20 border-white/10 text-white placeholder-white/40"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error Display */}
              {(quoteError || swapError) && (
                <Alert className="border-red-500/20 bg-red-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">
                    {quoteError || swapError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Swap Button */}
              <Button
                onClick={handleInitiateSwap}
                disabled={!quote || swapLoading || quoteLoading || !walletAddress}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl transition-all"
              >
                {swapLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Initiating Swap...
                  </div>
                ) : quoteLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Getting Quote...
                  </div>
                ) : !walletAddress ? (
                  'Connect Wallet'
                ) : !quote ? (
                  'Enter Amount'
                ) : (
                  `Swap ${fromToken.symbol} for ${toToken.symbol}`
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card className="glassmorphism border-white/20">
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Active Orders</h3>
                <p className="text-white/60">Your cross-chain swap orders will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeOrders.map((order) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <Card className="glassmorphism border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">
                            {order.fromChain === 'ethereum' ? '⟠' : '🌊'}
                          </span>
                          <ArrowRightLeft className="h-4 w-4 text-white/60" />
                          <span className="text-xl">
                            {order.toChain === 'ethereum' ? '⟠' : '🌊'}
                          </span>
                          <div>
                            <h3 className="font-semibold text-white">
                              {order.fromChain.toUpperCase()} → {order.toChain.toUpperCase()}
                            </h3>
                            <p className="text-sm text-white/60">Cross-chain Swap</p>
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize ml-1">{order.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-white/60">Amount</p>
                          <p className="font-mono text-white">{order.amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Time Remaining</p>
                          <p className="font-mono text-white">{formatTimeRemaining(order.timelock)}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Order ID</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-white">
                              {order.orderId.slice(0, 10)}...
                            </span>
                            <button 
                              onClick={() => copyToClipboard(order.orderId)}
                              className="text-white/60 hover:text-white"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        
                        {order.ethOrderId && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">ETH Order</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-white">
                                {order.ethOrderId.slice(0, 10)}...
                              </span>
                              <button className="text-white/60 hover:text-white">
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {order.suiOrderId && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">SUI Order</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-white">
                                {order.suiOrderId.slice(0, 10)}...
                              </span>
                              <button className="text-white/60 hover:text-white">
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        {order.status === 'locked' && (
                          <Button
                            onClick={() => handleExecuteSwap(order)}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            disabled={swapLoading}
                          >
                            {swapLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Execute Swap'
                            )}
                          </Button>
                        )}
                        
                        {(order.status === 'locked' || order.status === 'expired') && (
                          <Button
                            onClick={() => handleRefund(order)}
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            disabled={swapLoading}
                          >
                            {swapLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Refund'
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrossChainSwapInterface;
