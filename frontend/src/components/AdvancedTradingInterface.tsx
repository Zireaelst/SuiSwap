"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTokenSearch, useTokenPrices, useChartData } from '@/hooks/useOneInchData';
import { ChartData, TokenInfo } from '@/utils/1inch-api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, TrendingDown, BarChart3, ArrowUpDown } from 'lucide-react';

interface AdvancedTradingInterfaceProps {
    apiKey: string;
}

export const AdvancedTradingInterface: React.FC<AdvancedTradingInterfaceProps> = ({ apiKey }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedToken, setSelectedToken] = useState<string>('');
    const [chainId] = useState(1);
    const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1d');
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');

    // Hooks
    const { searchResults, loading: searchLoading, searchTokens } = useTokenSearch(apiKey);
    const { chartData, loading: chartLoading } = useChartData(selectedToken, chainId, timeframe, apiKey);

    // Popular tokens for quick access
    const popularTokens = [
        { address: '0x111111111117dc0aa78b770fa6a738034120c302', symbol: '1INCH', name: '1inch' },
        { address: '0xA0b86a33E6441b9c0Ec4AD851c1e4Ec3C02Db0b2', symbol: 'USDC', name: 'USD Coin' },
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether' },
        { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin' },
        { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink' },
    ];

    const { prices } = useTokenPrices(chainId, popularTokens.map(t => t.address), apiKey);

    useEffect(() => {
        if (searchQuery.length > 2) {
            searchTokens(searchQuery, chainId, 10);
        }
    }, [searchQuery, chainId, searchTokens]);

    const handleTokenSelect = (tokenAddress: string) => {
        setSelectedToken(tokenAddress);
    };

    const formatChartData = (data: ChartData | null) => {
        if (!data || !data.timestamps || !data.prices) return [];
        
        return data.timestamps.map((timestamp: number, index: number) => ({
            time: new Date(timestamp * 1000).toLocaleDateString(),
            price: data.prices[index] || 0,
            volume: data.volumes?.[index] || 0
        }));
    };

    const getPriceChange = (data: ChartData | null) => {
        if (!data || !data.prices || data.prices.length < 2) return { change: 0, percentage: 0 };
        
        const current = data.prices[data.prices.length - 1];
        const previous = data.prices[0];
        const change = current - previous;
        const percentage = (change / previous) * 100;
        
        return { change, percentage };
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Advanced Trading Interface
                </h1>
                <p className="text-muted-foreground">
                    Powered by 1inch APIs for comprehensive token analysis and trading
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Token Search & Selection */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Token Search
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Search tokens by name or symbol..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            
                            {searchLoading && (
                                <div className="text-center py-2 text-muted-foreground">
                                    Searching...
                                </div>
                            )}

                            {searchResults.length > 0 && (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {searchResults.map((token: { address: string; symbol: string; name: string }) => (
                                        <div 
                                            key={token.address}
                                            className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleTokenSelect(token.address)}
                                        >
                                            <div className="font-medium">{token.symbol}</div>
                                            <div className="text-sm text-muted-foreground">{token.name}</div>
                                            <div className="text-xs text-muted-foreground">{token.address.slice(0, 10)}...</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Popular Tokens</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {popularTokens.map((token) => (
                                    <div 
                                        key={token.address}
                                        className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleTokenSelect(token.address)}
                                    >
                                        <div>
                                            <div className="font-medium">{token.symbol}</div>
                                            <div className="text-sm text-muted-foreground">{token.name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">
                                                ${prices[token.address] ? (typeof prices[token.address] === 'number' ? prices[token.address].toFixed(4) : 'N/A') : 'Loading...'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Center Column - Price Chart */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Price Chart
                                {selectedToken && (
                                    <Badge variant="outline">
                                        {selectedToken.slice(0, 10)}...
                                    </Badge>
                                )}
                            </CardTitle>
                            <Select value={timeframe} onValueChange={(value: '1h' | '4h' | '1d' | '1w') => setTimeframe(value)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1h">1 Hour</SelectItem>
                                    <SelectItem value="4h">4 Hours</SelectItem>
                                    <SelectItem value="1d">1 Day</SelectItem>
                                    <SelectItem value="1w">1 Week</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            {!selectedToken ? (
                                <div className="h-80 flex items-center justify-center text-muted-foreground">
                                    Select a token to view price chart
                                </div>
                            ) : chartLoading ? (
                                <div className="h-80 flex items-center justify-center">
                                    <div className="animate-pulse text-muted-foreground">
                                        Loading chart data...
                                    </div>
                                </div>
                            ) : chartData ? (
                                <div className="space-y-4">
                                    {(() => {
                                        const priceChange = getPriceChange(chartData);
                                        return (
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl font-bold">
                                                    ${chartData.prices?.[chartData.prices.length - 1]?.toFixed(4) || 'N/A'}
                                                </div>
                                                <div className={`flex items-center gap-1 ${priceChange.percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {priceChange.percentage >= 0 ? (
                                                        <TrendingUp className="h-4 w-4" />
                                                    ) : (
                                                        <TrendingDown className="h-4 w-4" />
                                                    )}
                                                    <span>{priceChange.percentage.toFixed(2)}%</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={formatChartData(chartData)}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="time" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center text-muted-foreground">
                                    No chart data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Trading Interface */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowUpDown className="h-5 w-5" />
                        Swap Interface
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">From</label>
                                <div className="mt-1 space-y-2">
                                    <Input
                                        placeholder="0.0"
                                        value={fromAmount}
                                        onChange={(e) => setFromAmount(e.target.value)}
                                        type="number"
                                    />
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select token" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {popularTokens.map((token) => (
                                                <SelectItem key={token.address} value={token.address}>
                                                    {token.symbol} - {token.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">To</label>
                                <div className="mt-1 space-y-2">
                                    <Input
                                        placeholder="0.0"
                                        value={toAmount}
                                        onChange={(e) => setToAmount(e.target.value)}
                                        type="number"
                                    />
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select token" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {popularTokens.map((token) => (
                                                <SelectItem key={token.address} value={token.address}>
                                                    {token.symbol} - {token.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Button size="lg" className="w-full md:w-auto">
                            Get Quote
                        </Button>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                            This is a demo interface. Connect your wallet and implement actual swap functionality using the 1inch Swap API.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
