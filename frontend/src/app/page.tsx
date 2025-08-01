import React from "react";
import { SwapInterface } from "../../components/SwapInterface";
import { LimitOrderInterface } from "../../components/LimitOrderInterface";
import { TWAPMonitor } from "../../components/TWAPMonitor";
import { ActiveOrdersList } from "../../components/ActiveOrdersList";
import { PortfolioDashboard } from "../../components/PortfolioDashboard";

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<'swap' | 'limit' | 'twap' | 'portfolio'>('swap');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">KATA Protocol</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cross-Chain DeFi Trading</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab('swap')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'swap'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Swap
              </button>
              <button
                onClick={() => setActiveTab('limit')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'limit'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Limit Orders
              </button>
              <button
                onClick={() => setActiveTab('twap')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'twap'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                TWAP
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'portfolio'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Portfolio
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Ethereum ↔ Sui
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            {activeTab === 'swap' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Cross-Chain Swaps
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Execute atomic swaps between Ethereum and Sui networks with advanced order strategies.
                  </p>
                </div>
                <SwapInterface />
              </div>
            )}

            {activeTab === 'limit' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Limit Orders
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Set limit orders with custom price targets and expiration times.
                  </p>
                </div>
                <LimitOrderInterface />
              </div>
            )}

            {activeTab === 'twap' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    TWAP Orders
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Time-Weighted Average Price orders for reduced slippage on large trades.
                  </p>
                </div>
                <TWAPMonitor orderId="demo-twap-order-123" />
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <PortfolioDashboard />
              </div>
            )}
          </div>

          {/* Right Column - Active Orders */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Active Orders
              </h3>
              <ActiveOrdersList />
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Protocol Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Volume</span>
                  <span className="font-semibold text-gray-900 dark:text-white">$12.5M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active Orders</span>
                  <span className="font-semibold text-gray-900 dark:text-white">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Supported Networks</span>
                  <span className="font-semibold text-gray-900 dark:text-white">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg. Execution Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">3.2s</span>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Key Features
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Cross-Chain Atomic Swaps</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Trustless swaps between Ethereum and Sui</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Advanced Order Types</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Limit orders, TWAP, and more</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">MEV Protection</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Built-in protection against MEV attacks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">KATA Protocol</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Advanced cross-chain DeFi trading platform enabling efficient and secure swaps between Ethereum and Sui networks.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">API Reference</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Smart Contracts</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Security Audit</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Discord</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Twitter</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">GitHub</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2025 KATA Protocol. All rights reserved. Built for ETHGlobal.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
