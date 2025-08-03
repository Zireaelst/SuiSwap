"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Spotlight } from '@/components/ui/spotlight';
import { 
  useOneInchTokens,
  useOneInchPrices,
  useOneInchBalances,
  useOneInchPortfolio,
  useOneInchHistory,
  isAPIConfigured
} from '@/hooks/useOneInch';
import { Wallet, History, Search, BarChart3, RefreshCw, AlertCircle, CheckCircle, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface OneInchDashboardProps {
    walletAddress?: string;
    chainId?: number;
}

interface PortfolioToken {
    address: string;
    symbol: string;
    name: string;
    balance: string;
    value_usd: number;
    price_usd: number;
}

interface HistoryTransaction {
    id: string;
    type: string;
    value: string;
    timestamp: number;
    txHash: string;
}

interface BalanceItem {
    symbol?: string;
    name?: string;
    balance: string;
}

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

export const OneInchDashboard: React.FC<OneInchDashboardProps> = ({ 
    walletAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    chainId = 1 
}) => {
    const [activeAddress, setActiveAddress] = useState(walletAddress);
    const [inputAddress, setInputAddress] = useState(walletAddress);

    // 1inch API Hooks
    const { tokens, loading: tokensLoading } = useOneInchTokens(chainId);
    const { prices, loading: pricesLoading, refetch: refetchPrices } = useOneInchPrices(chainId, [
        '0xa0b86a33e6c2aaa284b7b6bb636c8b69c5be4ba6', // USDC
        '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
        '0xa0b86a33e6c2aaa284b7b6bb636c8b69c5be4ba6'  // WETH
    ]);
    const { balances, loading: balancesLoading, refetch: refetchBalances } = useOneInchBalances(chainId, activeAddress);
    const { portfolio, loading: portfolioLoading, refetch: refetchPortfolio } = useOneInchPortfolio(activeAddress, chainId);
    const { history, loading: historyLoading, refetch: refetchHistory } = useOneInchHistory(activeAddress, chainId);

    const handleAddressChange = () => {
        setActiveAddress(inputAddress);
    };

    const isConfigured = isAPIConfigured();

    if (!isConfigured) {
        return (
            <div className="min-h-screen bg-black relative overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
                <div className="h-screen w-full bg-black bg-grid-white/[0.02] relative flex items-center justify-center">
                    <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-20"
                    >
                        <Card className="w-96 bg-black/50 border-white/10 backdrop-blur-md">
                            <CardHeader className="text-center">
                                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
                                <CardTitle className="text-white">1inch API Not Configured</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-gray-400 mb-4">
                                    Please configure your 1inch API keys in environment variables to use this dashboard.
                                </p>
                                <div className="text-sm text-gray-500">
                                    Required: NEXT_PUBLIC_1INCH_API_KEY
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <BackgroundBeams />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
            <div className="h-full w-full bg-black bg-grid-white/[0.02] relative">
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="relative z-20 container mx-auto p-6 space-y-6"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent mb-4">
                            1inch Protocol Dashboard
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Comprehensive DeFi analytics and portfolio management
                        </p>
                    </motion.div>

                    {/* Address Input */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-blue-400" />
                                    Wallet Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3">
                                    <Input
                                        value={inputAddress}
                                        onChange={(e) => setInputAddress(e.target.value)}
                                        placeholder="Enter wallet address..."
                                        className="bg-black/30 border-white/20 text-white placeholder-gray-500 focus:border-blue-400"
                                    />
                                    <Button 
                                        onClick={handleAddressChange}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">
                                    Current: {activeAddress}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Main Dashboard */}
                    <motion.div variants={itemVariants}>
                        <Tabs defaultValue="portfolio" className="space-y-6">
                            <TabsList className="bg-black/50 border-white/10 backdrop-blur-md p-1">
                                <TabsTrigger 
                                    value="portfolio" 
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400"
                                >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Portfolio
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="balances"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400"
                                >
                                    <Wallet className="h-4 w-4 mr-2" />
                                    Balances
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="prices"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400"
                                >
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Prices
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="history"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400"
                                >
                                    <History className="h-4 w-4 mr-2" />
                                    History
                                </TabsTrigger>
                            </TabsList>

                            {/* Portfolio Tab */}
                            <TabsContent value="portfolio" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Portfolio Overview */}
                                    <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-300">Total Value</CardTitle>
                                            <DollarSign className="h-4 w-4 text-green-400" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-white">
                                                {portfolioLoading ? (
                                                    <div className="animate-pulse bg-gray-600 h-6 w-24 rounded"></div>
                                                ) : (
                                                    `$${portfolio?.total_value_usd?.toLocaleString() || '0'}`
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {portfolio?.tokens?.length || 0} tokens
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* PnL Card */}
                                    <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-300">ROI</CardTitle>
                                            <Activity className="h-4 w-4 text-blue-400" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-green-400">
                                                {portfolioLoading ? (
                                                    <div className="animate-pulse bg-gray-600 h-6 w-20 rounded"></div>
                                                ) : (
                                                    `${portfolio?.roi?.toFixed(2) || '0'}%`
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                Portfolio performance
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Refresh Button */}
                                    <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-300">Actions</CardTitle>
                                            <RefreshCw className="h-4 w-4 text-purple-400" />
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                onClick={refetchPortfolio}
                                                disabled={portfolioLoading}
                                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                            >
                                                {portfolioLoading ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    'Refresh Data'
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Portfolio Details */}
                                {portfolio?.tokens && (
                                    <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                                        <CardHeader>
                                            <CardTitle className="text-white">Token Holdings</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {portfolio.tokens.map((token: PortfolioToken, index: number) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                                <span className="text-white text-sm font-bold">
                                                                    {token.symbol?.charAt(0) || '?'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium">{token.symbol}</p>
                                                                <p className="text-gray-400 text-sm">{token.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-white font-medium">{token.balance}</p>
                                                            <p className="text-gray-400 text-sm">${token.value}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* Balances Tab */}
                            <TabsContent value="balances" className="space-y-4">
                                <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-white">Token Balances</CardTitle>
                                        <Button
                                            onClick={refetchBalances}
                                            disabled={balancesLoading}
                                            variant="outline"
                                            size="sm"
                                            className="border-white/20 text-white hover:bg-white/10"
                                        >
                                            {balancesLoading ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {balancesLoading ? (
                                            <div className="space-y-3">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="animate-pulse flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                                                        <div className="flex-1">
                                                            <div className="h-4 bg-gray-600 rounded w-20 mb-2"></div>
                                                            <div className="h-3 bg-gray-600 rounded w-32"></div>
                                                        </div>
                                                        <div className="h-4 bg-gray-600 rounded w-24"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : balances && Object.keys(balances).length > 0 ? (
                                            <div className="space-y-3">
                                                {Object.entries(balances).map(([address, balance]: [string, BalanceItem]) => (
                                                    <motion.div
                                                        key={address}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                                                                <span className="text-white text-sm font-bold">
                                                                    {balance.symbol?.charAt(0) || '?'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium">{balance.symbol}</p>
                                                                <p className="text-gray-400 text-sm">{balance.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-white font-medium">{balance.balance}</p>
                                                            <p className="text-gray-400 text-sm">{address.slice(0, 6)}...{address.slice(-4)}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Wallet className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                                                <p className="text-gray-400">No token balances found</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Prices Tab */}
                            <TabsContent value="prices" className="space-y-4">
                                <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-white">Token Prices</CardTitle>
                                        <Button
                                            onClick={refetchPrices}
                                            disabled={pricesLoading}
                                            variant="outline"
                                            size="sm"
                                            className="border-white/20 text-white hover:bg-white/10"
                                        >
                                            {pricesLoading ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {pricesLoading ? (
                                            <div className="space-y-3">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="animate-pulse flex items-center justify-between p-3">
                                                        <div className="h-4 bg-gray-600 rounded w-20"></div>
                                                        <div className="h-4 bg-gray-600 rounded w-24"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : prices && Object.keys(prices).length > 0 ? (
                                            <div className="space-y-3">
                                                {Object.entries(prices).map(([address, price]: [string, number]) => (
                                                    <motion.div
                                                        key={address}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                                                                <DollarSign className="h-4 w-4 text-white" />
                                                            </div>
                                                            <span className="text-white font-medium">
                                                                {address.slice(0, 6)}...{address.slice(-4)}
                                                            </span>
                                                        </div>
                                                        <span className="text-green-400 font-medium">
                                                            ${typeof price === 'number' ? price.toFixed(4) : price}
                                                        </span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <TrendingUp className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                                                <p className="text-gray-400">No price data available</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* History Tab */}
                            <TabsContent value="history" className="space-y-4">
                                <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-white">Transaction History</CardTitle>
                                        <Button
                                            onClick={refetchHistory}
                                            disabled={historyLoading}
                                            variant="outline"
                                            size="sm"
                                            className="border-white/20 text-white hover:bg-white/10"
                                        >
                                            {historyLoading ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {historyLoading ? (
                                            <div className="space-y-3">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                                                        <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                                                        <div className="flex-1">
                                                            <div className="h-4 bg-gray-600 rounded w-32 mb-2"></div>
                                                            <div className="h-3 bg-gray-600 rounded w-48"></div>
                                                        </div>
                                                        <div className="h-4 bg-gray-600 rounded w-20"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : history && history.length > 0 ? (
                                            <div className="space-y-3">
                                                {history.map((tx: HistoryTransaction, index: number) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/5"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                                            <History className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white font-medium">
                                                                {tx.type || 'Transaction'}
                                                            </p>
                                                            <p className="text-gray-400 text-sm">
                                                                {tx.txHash ? `${tx.txHash.slice(0, 10)}...${tx.txHash.slice(-8)}` : 'Unknown hash'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-white font-medium">
                                                                {tx.value || 'N/A'}
                                                            </p>
                                                            <p className="text-gray-400 text-sm">
                                                                {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'Unknown date'}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <History className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                                                <p className="text-gray-400">No transaction history found</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </motion.div>
                
                <BackgroundBeams />
            </div>
        </div>
    );
};
