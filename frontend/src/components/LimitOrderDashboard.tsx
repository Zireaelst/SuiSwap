'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useLimitOrders, 
  useTWAPOrders, 
  useDutchAuctionOrders, 
  useStopLossOrders,
  LimitOrder,
  TWAPOrder
} from '../hooks/useLimitOrders';

interface LimitOrderDashboardProps {
  userAddress?: string;
}

export function LimitOrderDashboard({ userAddress }: LimitOrderDashboardProps) {
  const [activeTab, setActiveTab] = useState<'limit' | 'twap' | 'dutch' | 'stop-loss'>('limit');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const limitOrders = useLimitOrders(userAddress);
  const twapOrders = useTWAPOrders(userAddress);
  const dutchOrders = useDutchAuctionOrders(userAddress);
  const stopLossOrders = useStopLossOrders(userAddress);

  const tabs = [
    { id: 'limit', label: 'Limit Orders', count: limitOrders.orders.length },
    { id: 'twap', label: 'TWAP Orders', count: twapOrders.twapOrders.length },
    { id: 'dutch', label: 'Dutch Auctions', count: dutchOrders.dutchOrders.length },
    { id: 'stop-loss', label: 'Stop-Loss Orders', count: stopLossOrders.stopLossOrders.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Advanced Order Management
          </h1>
          <p className="text-gray-400 text-lg">
            Create and manage sophisticated trading strategies with 1inch Limit Order Protocol
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'limit' | 'twap' | 'dutch' | 'stop-loss')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Create Order Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Create New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Order
          </button>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'limit' && <LimitOrdersTab {...limitOrders} />}
            {activeTab === 'twap' && <TWAPOrdersTab {...twapOrders} />}
            {activeTab === 'dutch' && <DutchAuctionTab {...dutchOrders} />}
            {activeTab === 'stop-loss' && <StopLossTab {...stopLossOrders} />}
          </motion.div>
        </AnimatePresence>

        {/* Create Order Modal */}
        {showCreateForm && (
          <CreateOrderModal
            orderType={activeTab}
            onClose={() => setShowCreateForm(false)}
          />
        )}
      </div>
    </div>
  );
}

// Limit Orders Tab Component
function LimitOrdersTab({ orders, isLoading, error, cancelOrder }: ReturnType<typeof useLimitOrders>) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (orders.length === 0) {
    return <EmptyState message="No limit orders found" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <LimitOrderCard key={order.id} order={order} onCancel={cancelOrder} />
      ))}
    </div>
  );
}

// TWAP Orders Tab Component
function TWAPOrdersTab({ twapOrders, isLoading, error }: ReturnType<typeof useTWAPOrders>) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (twapOrders.length === 0) {
    return <EmptyState message="No TWAP orders found" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {twapOrders.map((order) => (
        <TWAPOrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

// Dutch Auction Tab Component
function DutchAuctionTab({ dutchOrders, isLoading, error }: ReturnType<typeof useDutchAuctionOrders>) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (dutchOrders.length === 0) {
    return <EmptyState message="No Dutch auction orders found" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dutchOrders.map((order) => (
        <LimitOrderCard key={order.id} order={order} onCancel={() => {}} />
      ))}
    </div>
  );
}

// Stop-Loss Tab Component
function StopLossTab({ stopLossOrders, isLoading, error }: ReturnType<typeof useStopLossOrders>) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (stopLossOrders.length === 0) {
    return <EmptyState message="No stop-loss orders found" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stopLossOrders.map((order) => (
        <LimitOrderCard key={order.id} order={order} onCancel={() => {}} />
      ))}
    </div>
  );
}

// Order Card Components
function LimitOrderCard({ order, onCancel }: { order: LimitOrder; onCancel: (id: string) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': case 'filled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'expired': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {order.tokenInSymbol || order.fromToken} → {order.tokenOutSymbol || order.toToken}
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>
        {order.status === 'active' && (
          <button
            onClick={() => onCancel(order.id)}
            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Amount:</span>
          <span className="text-white">{order.amountIn || order.fromAmount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Target Price:</span>
          <span className="text-white">{order.price || order.targetPrice}</span>
        </div>
        {order.filledAmount && (
          <div className="flex justify-between">
            <span className="text-gray-400">Filled:</span>
            <span className="text-green-400">{order.filledAmount}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-400">Created:</span>
          <span className="text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

function TWAPOrderCard({ order }: { order: TWAPOrder }) {
  const progress = order.childOrders.length > 0 
    ? (order.childOrders.filter(o => o.status === 'completed').length / order.childOrders.length) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white">TWAP Order</h3>
        <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress:</span>
          <span className="text-white">{progress.toFixed(1)}%</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Intervals:</span>
            <div className="text-white">{order.intervals}</div>
          </div>
          <div>
            <span className="text-gray-400">Duration:</span>
            <div className="text-white">{order.intervalDuration}s</div>
          </div>
          <div>
            <span className="text-gray-400">Executed:</span>
            <div className="text-green-400">{order.totalExecuted}</div>
          </div>
          <div>
            <span className="text-gray-400">Remaining:</span>
            <div className="text-yellow-400">{order.totalRemaining}</div>
          </div>
        </div>

        {order.nextExecutionTime && (
          <div className="text-sm">
            <span className="text-gray-400">Next Execution:</span>
            <div className="text-white">{new Date(order.nextExecutionTime).toLocaleString()}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Utility Components
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
      <p className="text-red-400">{message}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
      <p className="text-gray-400 text-lg">{message}</p>
      <p className="text-gray-500 text-sm mt-2">Create your first order to get started</p>
    </div>
  );
}

// Create Order Modal Component
function CreateOrderModal({ 
  orderType, 
  onClose
}: { 
  orderType: string; 
  onClose: () => void; 
}) {
  const [formData, setFormData] = useState({
    fromToken: '',
    toToken: '',
    fromAmount: '',
    targetPrice: '',
    // TWAP specific
    intervals: 10,
    intervalDuration: 3600,
    // Dutch Auction specific
    startPrice: '',
    endPrice: '',
    duration: 86400,
    // Stop-Loss specific
    triggerPrice: '',
    slippageTolerance: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would depend on the specific order type
    console.log('Creating order:', orderType, formData);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          Create {orderType.charAt(0).toUpperCase() + orderType.slice(1)} Order
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common fields */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">From Token</label>
            <input
              type="text"
              value={formData.fromToken}
              onChange={(e) => setFormData({ ...formData, fromToken: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              placeholder="ETH"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">To Token</label>
            <input
              type="text"
              value={formData.toToken}
              onChange={(e) => setFormData({ ...formData, toToken: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              placeholder="USDC"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
            <input
              type="number"
              value={formData.fromAmount}
              onChange={(e) => setFormData({ ...formData, fromAmount: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              placeholder="1.0"
              step="0.000001"
              required
            />
          </div>

          {/* Order type specific fields */}
          {orderType === 'limit' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Price</label>
              <input
                type="number"
                value={formData.targetPrice}
                onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="3000"
                step="0.01"
                required
              />
            </div>
          )}

          {orderType === 'twap' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Intervals</label>
                <input
                  type="number"
                  value={formData.intervals}
                  onChange={(e) => setFormData({ ...formData, intervals: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  min="2"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Interval Duration (seconds)</label>
                <input
                  type="number"
                  value={formData.intervalDuration}
                  onChange={(e) => setFormData({ ...formData, intervalDuration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  min="60"
                  required
                />
              </div>
            </>
          )}

          {orderType === 'dutch' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Price</label>
                <input
                  type="number"
                  value={formData.startPrice}
                  onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  placeholder="3200"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Price</label>
                <input
                  type="number"
                  value={formData.endPrice}
                  onChange={(e) => setFormData({ ...formData, endPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  placeholder="2800"
                  step="0.01"
                  required
                />
              </div>
            </>
          )}

          {orderType === 'stop-loss' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Trigger Price</label>
                <input
                  type="number"
                  value={formData.triggerPrice}
                  onChange={(e) => setFormData({ ...formData, triggerPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  placeholder="2900"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slippage Tolerance (%)</label>
                <input
                  type="number"
                  value={formData.slippageTolerance}
                  onChange={(e) => setFormData({ ...formData, slippageTolerance: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  min="0.1"
                  max="10"
                  step="0.1"
                  required
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Create Order
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
