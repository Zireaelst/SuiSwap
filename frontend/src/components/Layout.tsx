'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  current: boolean;
  badge?: number;
}

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { isConnected, ethAddress, suiAddress } = useWallet();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation: NavigationItem[] = [
    { 
      name: 'Swap', 
      href: '/', 
      icon: '🔄', 
      current: pathname === '/' 
    },
    { 
      name: 'Limit Orders', 
      href: '/trading', 
      icon: '📋', 
      current: pathname === '/trading',
      badge: 3 // Example: 3 active orders
    },
    { 
      name: 'Portfolio', 
      href: '/portfolio', 
      icon: '💼', 
      current: pathname === '/portfolio' 
    },
    { 
      name: 'Arbitrage', 
      href: '/arbitrage', 
      icon: '⚡', 
      current: pathname === '/arbitrage',
      badge: 5 // Example: 5 opportunities
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: '📊', 
      current: pathname === '/analytics' 
    },
  ];

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div 
              className="fixed inset-0 bg-black bg-opacity-25" 
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-80 h-full bg-white dark:bg-gray-800 shadow-2xl"
            >
              <Sidebar navigation={navigation} onNavigate={() => setSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar navigation={navigation} />
      </div>

      {/* Main content */}
      <div className="lg:pl-80 flex flex-col flex-1">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          isConnected={isConnected}
          ethAddress={ethAddress}
          suiAddress={suiAddress}
        />

        <main className="flex-1 p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

interface SidebarProps {
  navigation: NavigationItem[];
  onNavigate?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navigation, onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              KATA Protocol
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Cross-chain DeFi
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
              item.current
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
            }`}
          >
            <div className="flex items-center">
              <span className="text-lg mr-3 transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              {item.name}
            </div>
            {item.badge && item.badge > 0 && (
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                item.current 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Network Status
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 dark:text-gray-400">Ethereum</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 dark:text-gray-400">Sui</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <div className="font-medium">KATA Protocol v1.0</div>
          <div className="mt-1">Advanced Cross-chain Trading</div>
        </div>
      </div>
    </div>
  );
};

interface HeaderProps {
  onMenuClick: () => void;
  isConnected: boolean;
  ethAddress: string | null;
  suiAddress: string | null;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isConnected, ethAddress, suiAddress }) => {
  const [showNetworks, setShowNetworks] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const truncateAddress = (address: string | null): string => {
    if (!address) return 'Not connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title - hidden on mobile */}
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cross-Chain Trading Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Network Status */}
          <div className="relative">
            <button
              onClick={() => setShowNetworks(!showNetworks)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Multi-Chain</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {showNetworks && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50"
                  onMouseLeave={() => setShowNetworks(false)}
                >
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Network Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ethereum</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">Online</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sui</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wallet Status */}
          {isConnected ? (
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {truncateAddress(ethAddress)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    SUI: {truncateAddress(suiAddress)}
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-medium text-sm">
                    {ethAddress ? ethAddress[2].toUpperCase() : '?'}
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50"
                    onMouseLeave={() => setShowProfile(false)}
                  >
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Wallet Details</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ethereum Address</div>
                          <div className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                            {ethAddress || 'Not connected'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sui Address</div>
                          <div className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                            {suiAddress || 'Not connected'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
