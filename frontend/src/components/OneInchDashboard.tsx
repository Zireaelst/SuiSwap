"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWalletBalances, useWalletHistory, usePortfolio, useTokenPrices, useETHBalance } from '@/hooks/useOneInchData';
import { Wallet, History, TrendingUp, Search, BarChart3, RefreshCw } from 'lucide-react';

interface OneInchDashboardProps {
    apiKey: string;
}

export const OneInchDashboard: React.FC<OneInchDashboardProps> = ({ apiKey }) => {
    const [walletAddress, setWalletAddress] = useState('0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
    const [chainId] = useState(1); // Ethereum mainnet
    const [activeAddress, setActiveAddress] = useState(walletAddress);

    // Hooks for different API calls
    const { balances, loading: balancesLoading, error: balancesError, refetch: refetchBalances } = useWalletBalances(chainId, activeAddress, apiKey);
    const { history, loading: historyLoading, error: historyError, refetch: refetchHistory } = useWalletHistory(activeAddress, chainId, 10, apiKey);
    const { portfolioData, loading: portfolioLoading, error: portfolioError, refetch: refetchPortfolio } = usePortfolio(activeAddress, chainId, apiKey);
    const { balance: ethBalance, loading: ethLoading, error: ethError, refetch: refetchETH } = useETHBalance(activeAddress, chainId, apiKey);

    // Popular token addresses for price display
    const popularTokens = [
        '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
        '0xA0b86a33E6441b9c0Ec4AD851c1e4Ec3C02Db0b2', // USDC
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    ];

    const { prices, loading: pricesLoading, refetch: refetchPrices } = useTokenPrices(chainId, popularTokens, apiKey);

    const handleAddressSubmit = () => {
        setActiveAddress(walletAddress);
    };

    const formatBalance = (balance: string, decimals: number = 18) => {
        const value = parseInt(balance) / Math.pow(10, decimals);
        return value.toFixed(4);
    };

    const formatETHBalance = (balance: string) => {
        const value = parseInt(balance, 16) / Math.pow(10, 18);
        return value.toFixed(4);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    1inch API Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Comprehensive wallet analytics powered by 1inch APIs
                </p>
            </motion.div>

            {/* Wallet Address Input */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Wallet Address
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter wallet address (0x...)"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            className="flex-1"
                        />
                        <Button onClick={handleAddressSubmit}>
                            Analyze Wallet
                        </Button>
                    </div>
                    {activeAddress && (
                        <div className="mt-2 text-sm text-muted-foreground">
                            Analyzing: {activeAddress}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="balances">Balances</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                    <TabsTrigger value="prices">Prices</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">ETH Balance</CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {ethLoading ? (
                                        <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                                    ) : ethError ? (
                                        <span className="text-red-500 text-sm">Error</span>
                                    ) : ethBalance ? (
                                        `${formatETHBalance(ethBalance)} ETH`
                                    ) : (
                                        'N/A'
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={refetchETH}
                                    className="mt-2 h-6"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Token Count</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {balancesLoading ? (
                                        <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
                                    ) : balancesError ? (
                                        <span className="text-red-500 text-sm">Error</span>
                                    ) : (
                                        Object.keys(balances).length
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    ERC-20 tokens
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                                <History className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {historyLoading ? (
                                        <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
                                    ) : historyError ? (
                                        <span className="text-red-500 text-sm">Error</span>
                                    ) : (
                                        history.length
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Recent activity
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {portfolioLoading ? (
                                        <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                                    ) : portfolioError ? (
                                        <span className="text-red-500 text-sm">Error</span>
                                    ) : portfolioData?.current_value ? (
                                        '$N/A'
                                    ) : (
                                        'N/A'
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total USD value
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Balances Tab */}
                <TabsContent value="balances" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Token Balances</CardTitle>
                            <Button variant="outline" size="sm" onClick={refetchBalances}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {balancesLoading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex items-center space-x-4">
                                            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : balancesError ? (
                                <div className="text-red-500 text-center py-4">
                                    Error loading balances: {balancesError}
                                </div>
                            ) : Object.keys(balances).length === 0 ? (
                                <div className="text-center text-muted-foreground py-4">
                                    No token balances found
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {Object.entries(balances).map(([token, balance]) => (
                                        <div key={token} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{token.slice(0, 10)}...</div>
                                                <div className="text-sm text-muted-foreground">Token Address</div>
                                            </div>
                                            <Badge variant="secondary">
                                                {formatBalance(balance)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Transaction History</CardTitle>
                            <Button variant="outline" size="sm" onClick={refetchHistory}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {historyLoading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex items-center space-x-4 p-2">
                                            <div className="rounded bg-gray-200 h-4 w-4"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : historyError ? (
                                <div className="text-red-500 text-center py-4">
                                    Error loading history: {historyError}
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center text-muted-foreground py-4">
                                    No transaction history found
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {history.map((tx) => (
                                        <div key={tx.id} className="border rounded p-3 hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Badge variant="outline">{tx.details.type}</Badge>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {tx.details.txHash.slice(0, 10)}...
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{tx.details.value}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(tx.details.timestamp).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Portfolio Tab */}
                <TabsContent value="portfolio" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Portfolio Overview</CardTitle>
                            <Button variant="outline" size="sm" onClick={refetchPortfolio}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {portfolioLoading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ) : portfolioError ? (
                                <div className="text-red-500 text-center py-4">
                                    Error loading portfolio: {portfolioError}
                                </div>
                            ) : portfolioData ? (
                                <div className="space-y-4">
                                    <div className="text-lg font-semibold">
                                        Portfolio data loaded successfully
                                    </div>
                                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-60">
                                        {JSON.stringify(portfolioData, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-4">
                                    No portfolio data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Prices Tab */}
                <TabsContent value="prices" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Token Prices</CardTitle>
                            <Button variant="outline" size="sm" onClick={refetchPrices}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {pricesLoading ? (
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex items-center justify-between p-2">
                                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {Object.entries(prices).map(([token, price]) => (
                                        <div key={token} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{token.slice(0, 10)}...</div>
                                                <div className="text-sm text-muted-foreground">Token Address</div>
                                            </div>
                                            <Badge variant="secondary">
                                                ${typeof price === 'number' ? price.toFixed(4) : 'N/A'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
