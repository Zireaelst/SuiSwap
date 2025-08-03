// app/fusion-plus/page.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Zap, Shield, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FusionPlusDashboard from '@/components/FusionPlusDashboard';

export default function FusionPlusPage() {
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
              <Zap className="h-5 w-5 mr-2" />
              1inch Fusion+ Integration
            </Badge>
          </motion.div>
          
          <motion.h1
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Cross-Chain
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Fusion+
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Experience seamless cross-chain swaps with advanced security through Hash Time Lock Contracts (HTLC). 
            Connect Ethereum and non-EVM chains with atomic swap guarantees.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {[
            {
              icon: <ArrowRightLeft className="h-8 w-8" />,
              title: "Cross-Chain Swaps",
              description: "Atomic swaps between Ethereum and non-EVM chains with HTLC security",
              color: "blue"
            },
            {
              icon: <Shield className="h-8 w-8" />,
              title: "HTLC Security",
              description: "Hash Time Lock Contracts ensure your funds are always secure",
              color: "green"
            },
            {
              icon: <Clock className="h-8 w-8" />,
              title: "Time Locks",
              description: "Built-in finality locks and timeout protection for all swaps",
              color: "purple"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="glassmorphism border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300"
            >
              <div className={`text-${feature.color}-400 mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <FusionPlusDashboard />
        </motion.div>

        {/* Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-16 glassmorphism border-white/20 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">How Fusion+ Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">1. Order Creation</h3>
              <p className="text-white/70 mb-4">
                Create cross-chain swap orders with escrow contracts on both source and destination chains.
                Solvers compete to fulfill your order through Dutch auction mechanism.
              </p>
              
              <h3 className="text-lg font-semibold text-white mb-3">2. HTLC Security</h3>
              <p className="text-white/70">
                Hash Time Lock Contracts ensure atomic execution. Funds are locked with secrets that 
                must be revealed within the time limit, or automatically refunded.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">3. Secret Submission</h3>
              <p className="text-white/70 mb-4">
                After finality lock expires, secrets are submitted to complete the swap. 
                Multiple resolvers ensure redundancy and execution guarantee.
              </p>
              
              <h3 className="text-lg font-semibold text-white mb-3">4. Completion</h3>
              <p className="text-white/70">
                Once secrets are revealed, both escrows unlock simultaneously, completing the 
                cross-chain swap atomically without trust assumptions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
