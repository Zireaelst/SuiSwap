'use client';

import { motion } from 'framer-motion';
import { ArrowRightLeft, Shield, Zap, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CrossChainSwapInterface from '@/components/CrossChainSwapInterface';

export default function CrossChainSwapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Badge 
              variant="secondary" 
              className="glassmorphism border-white/20 bg-white/10 text-white/90 px-6 py-3 text-lg"
            >
              <ArrowRightLeft className="h-5 w-5 mr-2" />
              Cross-Chain Bridge
            </Badge>
          </motion.div>
          
          <motion.h1
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Ethereum
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              ⟷ Sui
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Secure atomic swaps between Ethereum and Sui using Hash Time Lock Contracts (HTLC) 
            with 1inch Fusion+ integration for optimal liquidity and partial fills.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {[
            {
              icon: <Shield className="h-8 w-8" />,
              title: "HTLC Security",
              description: "Hash Time Lock Contracts ensure atomic execution",
              color: "blue"
            },
            {
              icon: <ArrowRightLeft className="h-8 w-8" />,
              title: "Bidirectional",
              description: "Swap from Ethereum to Sui and vice versa",
              color: "purple"
            },
            {
              icon: <Zap className="h-8 w-8" />,
              title: "Fusion+ Integration",
              description: "Powered by 1inch for optimal routing",
              color: "yellow"
            },
            {
              icon: <Clock className="h-8 w-8" />,
              title: "Time Guarantees",
              description: "Automatic refunds if swap fails",
              color: "green"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glassmorphism rounded-xl p-6 border border-white/20 bg-white/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className={`inline-flex p-3 rounded-lg mb-4 bg-${feature.color}-500/20 text-${feature.color}-400`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Swap Interface */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <CrossChainSwapInterface />
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          className="mt-16 space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">How Cross-Chain Swaps Work</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Our atomic swap protocol ensures secure cross-chain transfers without trusted intermediaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="glassmorphism rounded-xl p-6 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Lock Funds</h3>
                    <p className="text-white/70">
                      Create HTLC contracts on both Ethereum and Sui chains, locking your funds 
                      with the same secret hash and timelock parameters.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glassmorphism rounded-xl p-6 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Secret Revelation</h3>
                    <p className="text-white/70">
                      The counterparty reveals the secret to claim funds on one chain, 
                      automatically enabling you to claim funds on the other chain.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glassmorphism rounded-xl p-6 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Atomic Execution</h3>
                    <p className="text-white/70">
                      Both transfers complete atomically - either both succeed or both fail. 
                      No possibility of one-sided loss.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glassmorphism rounded-xl p-6 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Safety Guarantee</h3>
                    <p className="text-white/70">
                      If the swap doesn&apos;t complete within the timelock period, 
                      funds are automatically refunded to original owners.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Features */}
        <motion.div
          className="mt-16 glassmorphism rounded-xl p-8 border border-white/20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Security Features</h2>
            <p className="text-white/70">
              Multi-layered security ensures your funds are always protected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Cryptographic Security",
                description: "SHA-256 hash locks prevent unauthorized access"
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: "Time-bounded",
                description: "Automatic refunds after expiration prevent fund loss"
              },
              {
                icon: <CheckCircle className="h-6 w-6" />,
                title: "Atomic Guarantees",
                description: "Either both transfers succeed or both fail safely"
              }
            ].map((feature, index) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex p-3 rounded-lg mb-4 bg-white/10 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Warning Notice */}
        <motion.div
          className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Important Notice</h3>
              <p className="text-yellow-200/80">
                This is a demo implementation for ETHGlobal Bangkok hackathon. 
                Use only with testnet funds. Always verify contract addresses and 
                understand the risks before using with mainnet assets.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
