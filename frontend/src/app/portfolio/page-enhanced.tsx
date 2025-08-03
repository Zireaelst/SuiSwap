"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { OneInchDashboard } from "@/components/OneInchDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { 
  Wallet,
  BarChart3,
  Clock,
  ArrowUpDown,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  Activity,
  Target,
  Globe,
  Zap
} from "lucide-react";

export default function EnhancedPortfolioPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const demoApiKey = process.env.NEXT_PUBLIC_ONEINCH_API_KEY || '';

  const handleAnalyze = async () => {
    if (!walletAddress || !apiKey) return;
    
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    setIsAnalyzing(false);
    setShowAnalysis(true);
  };

  const useDemoKey = () => {
    if (demoApiKey) {
      setApiKey(demoApiKey);
    }
  };

  const quickAccessWallets = [
    {
      name: "Vitalik.eth",
      address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      description: "Ethereum founder"
    },
    {
      name: "1inch Treasury",
      address: "0x111111111117dc0aa78b770fa6a738034120c302",
      description: "1inch protocol treasury"
    },
    {
      name: "DeFi Whale",
      address: "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503",
      description: "High-value DeFi portfolio"
    }
  ];

  const features = [
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Real-time Balances",
      description: "Live token balances across all supported networks"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Portfolio Analytics",
      description: "Comprehensive P&L tracking and performance metrics"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Transaction History",
      description: "Complete transaction timeline with details"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Price Tracking",
      description: "Real-time token prices and market data"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Multi-chain Support",
      description: "Support for Ethereum, Polygon, BSC and more"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Deep insights powered by 1inch APIs"
    }
  ];

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <BackgroundBeams />
      <NavigationHeader />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {!showAnalysis ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {/* Hero Section */}
            <div className="text-center space-y-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Badge variant="secondary" className="mb-4 glassmorphism">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Advanced Portfolio Analytics
                </Badge>
              </motion.div>
              
              <motion.h1
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Portfolio Intelligence
              </motion.h1>
              
              <motion.p
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Comprehensive wallet analysis with real-time data, powered by 1inch APIs. 
                Track balances, monitor performance, and analyze trading patterns.
              </motion.p>
            </div>

            {/* API Key Setup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <Card className="max-w-2xl mx-auto glassmorphism border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    API Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">1inch API Key</label>
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
                  
                  {demoApiKey && (
                    <Button variant="outline" onClick={useDemoKey} className="w-full">
                      Use Demo API Key
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Wallet Analysis Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <Card className="glassmorphism border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Wallet Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter wallet address (0x...) or ENS name"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAnalyze}
                      disabled={!walletAddress || !apiKey || isAnalyzing}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      {isAnalyzing ? (
                        <>
                          <ArrowUpDown className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analyze Portfolio
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Quick Access Wallets */}
                  <div>
                    <div className="text-sm font-medium mb-3">Quick Access</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {quickAccessWallets.map((wallet, index) => (
                        <motion.button
                          key={wallet.address}
                          onClick={() => setWalletAddress(wallet.address)}
                          className="p-3 text-left border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <div className="font-medium text-sm">{wallet.name}</div>
                          <div className="text-xs text-muted-foreground">{wallet.description}</div>
                          <div className="text-xs text-blue-400 mt-1">
                            {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Powerful Analytics Features</h2>
                <p className="text-muted-foreground">Everything you need for comprehensive portfolio analysis</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <Card className="h-full glassmorphism border-white/10 hover:border-white/20 transition-colors">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                            {feature.icon}
                          </div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Portfolio Analysis</h1>
                <p className="text-muted-foreground">
                  Analyzing: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAnalysis(false);
                  setWalletAddress("");
                }}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            </div>

            <OneInchDashboard apiKey={apiKey} />
          </motion.div>
        )}
      </div>
    </main>
  );
}
