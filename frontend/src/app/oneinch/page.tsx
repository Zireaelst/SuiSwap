"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NavigationHeader } from '@/components/NavigationHeader';
import { OneInchDashboard } from '@/components/OneInchDashboard';
import { AdvancedTradingInterface } from '@/components/AdvancedTradingInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { 
  BarChart3, 
  Wallet, 
  TrendingUp, 
  Globe, 
  Shield, 
  Zap,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';

export default function OneInchIntegrationPage() {
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [isValidApiKey, setIsValidApiKey] = useState(false);

    // Demo API key for testing (replace with actual key)
    const demoApiKey = process.env.NEXT_PUBLIC_ONEINCH_API_KEY || '';

    const handleApiKeySubmit = () => {
        if (apiKey.length > 10) { // Basic validation
            setIsValidApiKey(true);
        }
    };

    const useDemoKey = () => {
        if (demoApiKey) {
            setApiKey(demoApiKey);
            setIsValidApiKey(true);
        }
    };

    const features = [
        {
            icon: <Wallet className="h-8 w-8" />,
            title: "Wallet Analytics",
            description: "Complete wallet analysis with balance tracking, transaction history, and portfolio overview"
        },
        {
            icon: <BarChart3 className="h-8 w-8" />,
            title: "Price Charts",
            description: "Real-time token price charts with multiple timeframes and technical indicators"
        },
        {
            icon: <TrendingUp className="h-8 w-8" />,
            title: "Portfolio Tracking",
            description: "Track your portfolio performance with profit/loss calculations and ROI metrics"
        },
        {
            icon: <Globe className="h-8 w-8" />,
            title: "Multi-Chain Support",
            description: "Support for Ethereum, Polygon, BSC, Arbitrum, and many other networks"
        },
        {
            icon: <Shield className="h-8 w-8" />,
            title: "Secure Trading",
            description: "Secure token swaps with MEV protection and optimal routing"
        },
        {
            icon: <Zap className="h-8 w-8" />,
            title: "Real-time Data",
            description: "Live market data, prices, and trading information from 1inch APIs"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <BackgroundBeams />
            <NavigationHeader />
            
            <div className="relative z-10 container mx-auto px-4 py-8">
                {!isValidApiKey ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Hero Section */}
                        <div className="text-center space-y-6 mb-12">
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                                1inch API Integration Hub
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Comprehensive DeFi analytics and trading platform powered by the complete suite of 1inch APIs
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                        <CardHeader>
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                                                    {feature.icon}
                                                </div>
                                                <CardTitle>{feature.title}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">{feature.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* API Key Setup */}
                        <Card className="max-w-2xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    API Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <AlertDescription>
                                        Enter your 1inch API key to access all features. You can get a free API key from the{' '}
                                        <a 
                                            href="https://portal.1inch.dev/" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="underline text-blue-600"
                                        >
                                            1inch Developer Portal
                                        </a>
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">API Key</label>
                                    <div className="relative">
                                        <Input
                                            type={showApiKey ? "text" : "password"}
                                            placeholder="Enter your 1inch API key..."
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="pr-10"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                        >
                                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button 
                                        onClick={handleApiKeySubmit}
                                        disabled={apiKey.length < 10}
                                        className="flex-1"
                                    >
                                        Start Using APIs
                                    </Button>
                                    {demoApiKey && (
                                        <Button 
                                            variant="outline"
                                            onClick={useDemoKey}
                                        >
                                            Use Demo Key
                                        </Button>
                                    )}
                                </div>

                                <div className="text-sm text-muted-foreground">
                                    <p className="font-medium mb-2">Integrated APIs:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• Price API - Real-time token prices</li>
                                        <li>• Balance API - Wallet token balances</li>
                                        <li>• History API - Transaction history</li>
                                        <li>• Portfolio API - Portfolio analytics</li>
                                        <li>• Token API - Token information and search</li>
                                        <li>• Charts API - Price charts and market data</li>
                                        <li>• Web3 RPC API - Blockchain interactions</li>
                                        <li>• Swap API - Token exchange quotes</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Tabs defaultValue="dashboard" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                                <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
                                <TabsTrigger value="trading">Trading Interface</TabsTrigger>
                            </TabsList>

                            <TabsContent value="dashboard">
                                <OneInchDashboard apiKey={apiKey} />
                            </TabsContent>

                            <TabsContent value="trading">
                                <AdvancedTradingInterface apiKey={apiKey} />
                            </TabsContent>
                        </Tabs>

                        {/* Reset API Key */}
                        <div className="fixed bottom-4 right-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setIsValidApiKey(false);
                                    setApiKey('');
                                }}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Reset API Key
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
