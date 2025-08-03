"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { ArbitrageDashboard } from "@/components/ArbitrageDashboard";
import { ModernSwapInterface } from "@/components/ModernSwapInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackgroundBeams } from "@/components/ui/background-beams";
import {
  ArrowUpDown,
  Target,
  Shield,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

// MEV Protection Interface Component
interface MEVProtectionInterfaceProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  riskLevel: 'low' | 'medium' | 'high';
  onRiskLevelChange: (level: 'low' | 'medium' | 'high') => void;
}

const MEVProtectionInterface: React.FC<MEVProtectionInterfaceProps> = ({
  enabled,
  onToggle,
  riskLevel,
  onRiskLevelChange
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const protectionStats = {
    transactionsProtected: 1247,
    mevBlocked: '$127K',
    successRate: '94.2%',
    gasOptimized: '15%'
  };

  const simulateAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span>MEV Protection Service</span>
            </div>
            <Button
              variant={enabled ? "default" : "outline"}
              size="sm"
              onClick={() => onToggle(!enabled)}
            >
              {enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Protection Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Protected Txs</div>
              <div className="text-xl font-bold">{protectionStats.transactionsProtected}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">MEV Blocked</div>
              <div className="text-xl font-bold">{protectionStats.mevBlocked}</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              <div className="text-xl font-bold">{protectionStats.successRate}</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Gas Saved</div>
              <div className="text-xl font-bold">{protectionStats.gasOptimized}</div>
            </div>
          </div>

          {/* Risk Level Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Protection Level</label>
            <div className="flex space-x-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => onRiskLevelChange(level)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    riskLevel === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Analysis */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Real-time MEV Analysis</h3>
              <Button
                onClick={simulateAnalysis}
                disabled={isAnalyzing}
                size="sm"
                variant="outline"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Run Analysis'
                )}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-800 dark:text-green-300">Protection Active</span>
                </div>
                <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                  <li>• Flashbots private mempool</li>
                  <li>• Front-running detection</li>
                  <li>• Sandwich attack prevention</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="font-medium text-blue-800 dark:text-blue-300 mb-2">Current Status</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  <div>• Network congestion: Low</div>
                  <div>• MEV activity: Normal</div>
                  <div>• Gas price: Optimal</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function TradingPage() {
  const [activeTab, setActiveTab] = useState<'swap' | 'arbitrage' | 'mev'>('swap');
  const [mevProtectionEnabled, setMevProtectionEnabled] = useState(true);
  const [mevRiskLevel, setMevRiskLevel] = useState<'low' | 'medium' | 'high'>('low');

  const tradingTabs = [
    { id: 'swap' as const, label: 'Instant Swap', icon: ArrowUpDown },
    { id: 'arbitrage' as const, label: 'Arbitrage', icon: Target },
    { id: 'mev' as const, label: 'MEV Protection', icon: Shield }
  ];

  return (
    <main className="relative min-h-screen">
      <BackgroundBeams />
      <NavigationHeader />

      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Advanced <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Trading Hub</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Swap, arbitrage, and MEV protection in one powerful interface
            </p>
          </motion.div>

          {/* Trading Tabs */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex space-x-2 p-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
              {tradingTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Dynamic Content Based on Active Tab */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'swap' && (
              <div className="max-w-4xl mx-auto">
                <ModernSwapInterface />
              </div>
            )}
            
            {activeTab === 'arbitrage' && (
              <div className="max-w-6xl mx-auto">
                <ArbitrageDashboard />
              </div>
            )}
            
            {activeTab === 'mev' && (
              <MEVProtectionInterface 
                enabled={mevProtectionEnabled}
                onToggle={setMevProtectionEnabled}
                riskLevel={mevRiskLevel}
                onRiskLevelChange={setMevRiskLevel}
              />
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
