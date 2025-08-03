"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { NavigationHeader } from "@/components/NavigationHeader";
import { ArbitrageDashboard } from "@/components/ArbitrageDashboard";
import { ModernSwapInterface } from "@/components/ModernSwapInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-white">MEV Protection Service</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${enabled ? 'text-green-400' : 'text-gray-400'}`}>
                {enabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={() => onToggle(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Protection Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30">
              <div className="text-sm text-gray-400 mb-1">Protected Txs</div>
              <div className="text-xl font-bold text-white">{protectionStats.transactionsProtected}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30">
              <div className="text-sm text-gray-400 mb-1">MEV Blocked</div>
              <div className="text-xl font-bold text-white">{protectionStats.mevBlocked}</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-lg border border-blue-500/30">
              <div className="text-sm text-gray-400 mb-1">Success Rate</div>
              <div className="text-xl font-bold text-white">{protectionStats.successRate}</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 p-4 rounded-lg border border-orange-500/30">
              <div className="text-sm text-gray-400 mb-1">Gas Saved</div>
              <div className="text-xl font-bold text-white">{protectionStats.gasOptimized}</div>
            </div>
          </div>

          {/* Protection Level */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Protection Level</label>
            <div className="flex space-x-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => onRiskLevelChange(level)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    riskLevel === level
                      ? 'bg-blue-600 text-white border border-blue-500'
                      : 'bg-slate-700 text-gray-300 border border-slate-600 hover:bg-slate-600'
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
              <h3 className="font-medium text-white">Real-time MEV Analysis</h3>
              <Button
                onClick={simulateAnalysis}
                disabled={isAnalyzing}
                size="sm"
                variant="outline"
                className="bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600"
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
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="font-medium text-green-300">Protection Active</span>
                </div>
                <ul className="text-sm text-green-400 space-y-1">
                  <li>• Flashbots private mempool</li>
                  <li>• Front-running detection</li>
                  <li>• Sandwich attack prevention</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="font-medium text-blue-300 mb-2">Current Status</div>
                <div className="text-sm text-blue-400 space-y-1">
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
