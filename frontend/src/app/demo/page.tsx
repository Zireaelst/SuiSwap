'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArbitrageDashboard, 
  SwapLoading, 
  TWAPLoading, 
  ArbitrageLoading,
  ErrorState,
  NetworkError,
  EmptyOrdersState
} from '@/components';

type DemoSection = 'arbitrage' | 'mev' | 'loading' | 'errors';

export default function DemoPage() {
  const [activeSection, setActiveSection] = useState<DemoSection>('arbitrage');

  const sections = [
    { id: 'arbitrage' as const, name: 'Arbitrage Detection', icon: '⚡' },
    { id: 'mev' as const, name: 'MEV Protection', icon: '🛡️' },
    { id: 'loading' as const, name: 'Loading States', icon: '⏳' },
    { id: 'errors' as const, name: 'Error States', icon: '⚠️' },
  ];

  const renderDemo = () => {
    switch (activeSection) {
      case 'arbitrage':
        return <ArbitrageDashboard />;
      
      case 'mev':
        return <MEVProtectionDemo />;
      
      case 'loading':
        return <LoadingStatesDemo />;
      
      case 'errors':
        return <ErrorStatesDemo />;
      
      default:
        return <ArbitrageDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            KATA Protocol Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Showcasing advanced cross-chain trading features: Arbitrage Detection, MEV Protection, 
            and Professional UI/UX components for the next generation of DeFi trading.
          </p>
        </motion.div>

        {/* Section Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              <span>{section.name}</span>
            </button>
          ))}
        </motion.div>

        {/* Demo Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderDemo()}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <FeatureHighlights />
        </motion.div>
      </div>
    </div>
  );
}

// MEV Protection Demo Component
interface MEVRiskAnalysis {
  isHighRisk: boolean;
  riskScore: number;
  reasons: string[];
  suggestedProtections: string[];
}

const MEVProtectionDemo = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState<MEVRiskAnalysis | null>(null);

  const simulateMEVAnalysis = async () => {
    setIsAnalyzing(true);
    setRiskAnalysis(null);

    // Simulate MEV risk analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockAnalysis = {
      isHighRisk: Math.random() > 0.5,
      riskScore: Math.floor(Math.random() * 100),
      reasons: [
        'Large transaction amount (>10 ETH)',
        'High mempool congestion (150 pending txs)',
        'Similar transactions detected',
        'High MEV activity hours (US trading time)'
      ].slice(0, Math.floor(Math.random() * 4) + 1),
      suggestedProtections: [
        'Use Flashbots private mempool',
        'Add commit-reveal scheme',
        'Increase slippage tolerance',
        'Monitor for front-running'
      ]
    };

    setRiskAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          MEV Protection Service Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze and protect your transactions from Maximum Extractable Value (MEV) attacks
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            MEV Risk Analysis
          </h3>
          <button
            onClick={simulateMEVAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all duration-200"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Transaction'}
          </button>
        </div>

        {isAnalyzing && (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Analyzing MEV risk factors...</p>
          </div>
        )}

        {riskAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Risk Score</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {riskAnalysis.isHighRisk ? 'High Risk' : 'Low Risk'}
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                riskAnalysis.isHighRisk ? 'text-red-500' : 'text-green-500'
              }`}>
                {riskAnalysis.riskScore}%
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Risk Factors</h4>
              <div className="space-y-2">
                {riskAnalysis.reasons.map((reason: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Protections</h4>
              <div className="space-y-2">
                {riskAnalysis.suggestedProtections.map((protection: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">{protection}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Loading States Demo
const LoadingStatesDemo = () => {
  const [activeLoading, setActiveLoading] = useState<'swap' | 'twap' | 'arbitrage'>('swap');

  const loadingStates = [
    { id: 'swap' as const, name: 'Cross-Chain Swap', component: <SwapLoading /> },
    { id: 'twap' as const, name: 'TWAP Order', component: <TWAPLoading /> },
    { id: 'arbitrage' as const, name: 'Arbitrage Execution', component: <ArbitrageLoading /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Loading States Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Professional loading animations for different transaction types
        </p>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        {loadingStates.map((state) => (
          <button
            key={state.id}
            onClick={() => setActiveLoading(state.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeLoading === state.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {state.name}
          </button>
        ))}
      </div>

      <motion.div
        key={activeLoading}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {loadingStates.find(state => state.id === activeLoading)?.component}
      </motion.div>
    </div>
  );
};

// Error States Demo
const ErrorStatesDemo = () => {
  const [activeError, setActiveError] = useState<'general' | 'network' | 'empty'>('general');

  const errorStates = [
    { 
      id: 'general' as const, 
      name: 'General Error', 
      component: (
        <ErrorState
          title="Transaction Failed"
          message="Your transaction could not be completed due to insufficient gas or network congestion."
          onRetry={() => alert('Retry clicked!')}
        />
      )
    },
    { 
      id: 'network' as const, 
      name: 'Network Error', 
      component: <NetworkError network="ethereum" onRetry={() => alert('Network retry!')} />
    },
    { 
      id: 'empty' as const, 
      name: 'Empty State', 
      component: <EmptyOrdersState />
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Error States Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive error handling and empty state components
        </p>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        {errorStates.map((state) => (
          <button
            key={state.id}
            onClick={() => setActiveError(state.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeError === state.id
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {state.name}
          </button>
        ))}
      </div>

      <motion.div
        key={activeError}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {errorStates.find(state => state.id === activeError)?.component}
      </motion.div>
    </div>
  );
};

// Feature Highlights
const FeatureHighlights = () => {
  const features = [
    {
      title: 'Advanced Arbitrage Detection',
      description: 'Real-time cross-chain price monitoring with intelligent profit calculations',
      icon: '⚡',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      title: 'MEV Protection',
      description: 'Sophisticated protection against front-running and sandwich attacks',
      icon: '🛡️',
      color: 'from-green-400 to-blue-500'
    },
    {
      title: 'Professional UI/UX',
      description: 'Sleek interface with smooth animations and responsive design',
      icon: '✨',
      color: 'from-purple-400 to-pink-500'
    },
    {
      title: 'Cross-Chain Trading',
      description: 'Seamless trading between Ethereum and Sui with HTLC security',
      icon: '🔗',
      color: 'from-blue-400 to-indigo-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
            <span className="text-2xl">{feature.icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {feature.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
};
