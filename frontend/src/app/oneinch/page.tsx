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
import { Spotlight } from '@/components/ui/spotlight';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Wallet, 
  TrendingUp, 
  Globe, 
  Shield, 
  Zap,
  Eye,
  EyeOff,
  Settings,
  Sparkles,
  ChevronRight
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
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <BackgroundBeams />
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            
            <NavigationHeader />
            
            <div className="relative z-10 container mx-auto px-4 py-8">
                {!isValidApiKey ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-7xl mx-auto"
                    >
                        {/* Hero Section */}
                        <motion.div
                            className="text-center space-y-8 mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Badge variant="secondary" className="glassmorphism border-white/20 bg-white/10 text-white/90 px-4 py-2">
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        1inch API Integration Hub
                                    </Badge>
                                </motion.div>
                                
                                <motion.h1
                                    className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    1inch API
                                    <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                        Integration
                                    </span>
                                </motion.h1>
                                
                                <motion.p
                                    className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Comprehensive DeFi analytics and trading platform powered by the complete suite of 1inch APIs.
                                    Experience real-time data, advanced analytics, and seamless trading.
                                </motion.p>
                            </div>
                        </motion.div>

                        {/* Features Grid */}
                        <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                >
                                    <Card className="h-full glassmorphism border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                                                    {feature.icon}
                                                </div>
                                                <CardTitle className="text-xl text-white group-hover:text-blue-200 transition-colors">
                                                    {feature.title}
                                                </CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-white/70 leading-relaxed">{feature.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* API Key Setup */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                        >
                            <Card className="max-w-3xl mx-auto glassmorphism border-white/20 bg-white/5 backdrop-blur-xl">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-white text-2xl">
                                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                            <Settings className="h-6 w-6 text-white" />
                                        </div>
                                        API Configuration
                                        <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 border-blue-400/30">
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            Secure Setup
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Alert className="border-blue-500/30 bg-blue-500/10">
                                        <AlertDescription className="text-white/80">
                                            Enter your 1inch API key to access all features. You can get a free API key from the{' '}
                                            <a 
                                                href="https://portal.1inch.dev/" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="underline text-blue-400 hover:text-blue-300"
                                            >
                                                1inch Developer Portal
                                            </a>
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-4">
                                        <label className="text-sm font-medium text-white/90">API Key</label>
                                        <div className="relative">
                                            <Input
                                                type={showApiKey ? "text" : "password"}
                                                placeholder="Enter your 1inch API key..."
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                className="pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400/50 focus:ring-blue-400/20"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10"
                                                onClick={() => setShowApiKey(!showApiKey)}
                                            >
                                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button 
                                            onClick={handleApiKeySubmit}
                                            disabled={apiKey.length < 10}
                                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                                            size="lg"
                                        >
                                            Start Using APIs
                                        </Button>
                                        {demoApiKey && (
                                            <Button 
                                                variant="outline"
                                                onClick={useDemoKey}
                                                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                                                size="lg"
                                            >
                                                Use Demo Key
                                            </Button>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                        <p className="font-medium mb-3 text-white/90">Integrated APIs:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/70">
                                            <div className="flex items-center gap-2">
                                                <ChevronRight className="h-3 w-3 text-blue-400" />
                                                Price API - Real-time token prices
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ChevronRight className="h-3 w-3 text-blue-400" />
                                                Balance API - Wallet token balances
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ChevronRight className="h-3 w-3 text-blue-400" />
                                                History API - Transaction history
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ChevronRight className="h-3 w-3 text-blue-400" />
                                                Portfolio API - Portfolio analytics
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ChevronRight className="h-3 w-3 text-blue-400" />
                                                Token API - Token information
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ChevronRight className="h-3 w-3 text-blue-400" />
                                                Charts API - Price charts
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ChevronRight className="h-3 w-3 text-blue-400" />
                                                Web3 RPC API - Blockchain data
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ChevronRight className="h-3 w-3 text-blue-400" />
                                                Swap API - Token exchange quotes
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        <motion.div 
                            className="flex items-center justify-between p-6 glassmorphism border-white/20 rounded-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-white">1inch API Dashboard</h1>
                                <p className="text-white/70 text-lg">
                                    API Connected: <span className="font-mono text-green-400">Active</span>
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setIsValidApiKey(false);
                                    setApiKey('');
                                }}
                                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Reset API Key
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Tabs defaultValue="dashboard" className="space-y-6">
                                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto glassmorphism border-white/20 bg-white/10">
                                    <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                                        Analytics Dashboard
                                    </TabsTrigger>
                                    <TabsTrigger value="trading" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                                        Trading Interface
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="dashboard">
                                    <OneInchDashboard />
                                </TabsContent>

                                <TabsContent value="trading">
                                    <AdvancedTradingInterface apiKey={apiKey} />
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
