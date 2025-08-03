// components/FusionPlusDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Copy,
  ExternalLink,
  Zap,
  Shield,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useFusionPlus, 
  useActiveOrders, 
  useOrdersByMaker, 
  useFusionPlusConfig, 
  useChainInfo,
  CrossChainOrder,
  SupportedChainId
} from '@/hooks/useFusionPlus';

interface FusionPlusDashboardProps {
  walletAddress?: string;
  className?: string;
}

export const FusionPlusDashboard: React.FC<FusionPlusDashboardProps> = ({
  walletAddress,
  className = ''
}) => {
  const config = useFusionPlusConfig();
  const { service, isConnected, error: serviceError } = useFusionPlus(config || undefined);
  const { orders: activeOrders, loading: activeLoading, refresh: refreshActive } = useActiveOrders(service);
  const { orders: myOrders, loading: myOrdersLoading, refresh: refreshMy } = useOrdersByMaker(
    service, 
    walletAddress || ''
  );
  const { getChainInfo, getSupportedChainPairs } = useChainInfo();

  const [selectedOrder, setSelectedOrder] = useState<CrossChainOrder | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalVolume: '$0',
  });

  // Calculate statistics
  useEffect(() => {
    const total = activeOrders.length;
    const completed = activeOrders.filter(order => order.status === 'filled').length;
    const pending = activeOrders.filter(order => order.status === 'pending').length;
    
    setStats({
      totalOrders: total,
      completedOrders: completed,
      pendingOrders: pending,
      totalVolume: '$' + (total * 1234).toLocaleString(), // Mock calculation
    });
  }, [activeOrders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filled':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'expired':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatAmount = (amount: string, decimals: number = 18) => {
    const num = Number(amount) / Math.pow(10, decimals);
    return num.toFixed(4);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const OrderCard: React.FC<{ order: CrossChainOrder; onClick?: () => void }> = ({ order, onClick }) => {
    const srcChain = getChainInfo(order.srcChainId as SupportedChainId);
    const dstChain = getChainInfo(order.dstChainId as SupportedChainId);
    
    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={onClick}
      >
        <Card className="glassmorphism border-white/20 hover:border-white/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{srcChain.icon}</span>
                  <ArrowRightLeft className="h-4 w-4 text-white/60" />
                  <span className="text-lg">{dstChain.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{srcChain.name} → {dstChain.name}</h3>
                  <p className="text-sm text-white/60">Cross-chain Swap</p>
                </div>
              </div>
              
              <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status}</span>
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-white/60">From Amount</p>
                <p className="font-mono text-white">{formatAmount(order.srcAmount)} {srcChain.symbol}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">To Amount</p>
                <p className="font-mono text-white">{formatAmount(order.dstAmount)} {dstChain.symbol}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Hash: {order.orderHash.slice(0, 10)}...</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(order.orderHash);
                }}
                className="h-6 w-6 p-0 hover:bg-white/10"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (serviceError) {
    return (
      <Card className="glassmorphism border-red-500/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Service Error</h3>
          <p className="text-white/70">{serviceError}</p>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="glassmorphism border-yellow-500/20">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-12 w-12 text-yellow-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-white mb-2">Connecting to Fusion+</h3>
          <p className="text-white/70">Initializing cross-chain services...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: ArrowRightLeft, color: 'blue' },
          { label: 'Completed', value: stats.completedOrders, icon: CheckCircle, color: 'green' },
          { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'yellow' },
          { label: 'Volume', value: stats.totalVolume, icon: TrendingUp, color: 'purple' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glassmorphism border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-3 w-full glassmorphism border-white/20">
          <TabsTrigger value="active" className="data-[state=active]:bg-white/20">
            <Zap className="h-4 w-4 mr-2" />
            Active Orders
          </TabsTrigger>
          <TabsTrigger value="my-orders" className="data-[state=active]:bg-white/20">
            <Shield className="h-4 w-4 mr-2" />
            My Orders
          </TabsTrigger>
          <TabsTrigger value="chains" className="data-[state=active]:bg-white/20">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Supported Chains
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Active Cross-Chain Orders</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshActive}
              disabled={activeLoading}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              {activeLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {activeOrders.map((order, index) => (
                <motion.div
                  key={order.orderHash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <OrderCard
                    order={order}
                    onClick={() => setSelectedOrder(order)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {activeOrders.length === 0 && !activeLoading && (
            <Card className="glassmorphism border-white/20">
              <CardContent className="p-12 text-center">
                <ArrowRightLeft className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Active Orders</h3>
                <p className="text-white/60">There are currently no active cross-chain orders.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">My Orders</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshMy}
              disabled={myOrdersLoading}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              {myOrdersLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>

          {!walletAddress ? (
            <Card className="glassmorphism border-yellow-500/20">
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Wallet Not Connected</h3>
                <p className="text-white/60">Connect your wallet to view your orders.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {myOrders.map((order, index) => (
                  <motion.div
                    key={order.orderHash}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <OrderCard
                      order={order}
                      onClick={() => setSelectedOrder(order)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {myOrders.length === 0 && !myOrdersLoading && walletAddress && (
            <Card className="glassmorphism border-white/20">
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Orders Found</h3>
                <p className="text-white/60">You haven&apos;t created any cross-chain orders yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chains" className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Supported Chain Pairs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getSupportedChainPairs().map((pair, index) => (
              <motion.div
                key={`${pair.src}-${pair.dst}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glassmorphism border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getChainInfo(pair.src as SupportedChainId).icon}</span>
                          <ArrowRightLeft className="h-4 w-4 text-white/60" />
                          <span className="text-lg">{getChainInfo(pair.dst as SupportedChainId).icon}</span>
                        </div>
                        <span className="text-white font-medium">{pair.name}</span>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur border border-white/20 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Order Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                  className="hover:bg-white/10"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/60">Order Hash</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-sm text-white break-all">{selectedOrder.orderHash}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedOrder.orderHash)}
                      className="h-6 w-6 p-0 hover:bg-white/10"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60">Status</p>
                    <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center space-x-1 w-fit`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="capitalize">{selectedOrder.status}</span>
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Created</p>
                    <p className="text-white">{new Date(selectedOrder.createdAt * 1000).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      window.open(`https://etherscan.io/tx/${selectedOrder.orderHash}`, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Explorer
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FusionPlusDashboard;
