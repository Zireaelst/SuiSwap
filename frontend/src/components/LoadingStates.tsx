import { motion } from 'framer-motion';

// Loading Components
export const SwapLoading = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full mb-6"
    />
    <motion.h3
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-xl font-semibold text-gray-900 dark:text-white mb-3"
    >
      Processing Cross-Chain Swap
    </motion.h3>
    <motion.p
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed"
    >
      Your transaction is being processed across Ethereum and Sui networks. 
      This may take a few moments as we coordinate the cross-chain swap.
    </motion.p>
    
    {/* Progress indicators */}
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="mt-6 flex items-center space-x-4"
    >
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-600 dark:text-gray-400">Ethereum</span>
      </div>
      <div className="text-gray-400">→</div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-600 dark:text-gray-400">Sui</span>
      </div>
    </motion.div>
  </motion.div>
);

export const TWAPLoading = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
  >
    <div className="flex space-x-2 mb-6">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -20, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1
          }}
          className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
        />
      ))}
    </div>
    <motion.h3
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-xl font-semibold text-gray-900 dark:text-white mb-3"
    >
      Creating TWAP Order
    </motion.h3>
    <motion.p
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed"
    >
      Setting up your Time Weighted Average Price order with cross-chain coordination.
      This ensures optimal price execution over time.
    </motion.p>
  </motion.div>
);

export const LimitOrderLoading = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
  >
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6"
    >
      <span className="text-white text-2xl">📋</span>
    </motion.div>
    <motion.h3
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-xl font-semibold text-gray-900 dark:text-white mb-3"
    >
      Creating Limit Order
    </motion.h3>
    <motion.p
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed"
    >
      Setting up your limit order with advanced execution strategies.
      Your order will execute automatically when your target price is reached.
    </motion.p>
  </motion.div>
);

export const ArbitrageLoading = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
  >
    <motion.div
      animate={{ rotate: [0, 180, 360] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="text-4xl mb-6"
    >
      ⚡
    </motion.div>
    <motion.h3
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-xl font-semibold text-gray-900 dark:text-white mb-3"
    >
      Executing Arbitrage
    </motion.h3>
    <motion.p
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed"
    >
      Executing cross-chain arbitrage strategy. This involves coordinated trades
      across multiple networks to capture price differences.
    </motion.p>
  </motion.div>
);

// Error States
interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title, 
  message, 
  onRetry, 
  type = 'error' 
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900';
      default:
        return 'bg-red-100 dark:bg-red-900';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={`w-20 h-20 ${getBackgroundColor()} rounded-full flex items-center justify-center mb-6`}
      >
        {getErrorIcon()}
      </motion.div>
      
      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center"
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed mb-6"
      >
        {message}
      </motion.p>
      
      {onRetry && (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
};

// Network Error specifically for blockchain issues
export const NetworkError: React.FC<{ 
  network: 'ethereum' | 'sui' | 'both';
  onRetry?: () => void;
}> = ({ network, onRetry }) => {
  const getNetworkName = () => {
    switch (network) {
      case 'ethereum':
        return 'Ethereum';
      case 'sui':
        return 'Sui';
      case 'both':
        return 'Ethereum and Sui';
      default:
        return 'Network';
    }
  };

  return (
    <ErrorState
      type="warning"
      title={`${getNetworkName()} Network Issue`}
      message={`We're having trouble connecting to the ${getNetworkName()} network. This might be due to network congestion or temporary outages. Please try again in a moment.`}
      onRetry={onRetry}
    />
  );
};

// Transaction Error with specific details
export const TransactionError: React.FC<{
  txHash?: string;
  reason?: string;
  onRetry?: () => void;
}> = ({ txHash, reason, onRetry }) => (
  <ErrorState
    title="Transaction Failed"
    message={
      reason 
        ? `Transaction failed: ${reason}${txHash ? ` (${txHash.slice(0, 10)}...)` : ''}`
        : 'Your transaction could not be completed. This might be due to insufficient gas, slippage, or network issues.'
    }
    onRetry={onRetry}
  />
);

// Empty States
export const EmptyOrdersState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center p-12 text-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6"
    >
      <span className="text-3xl">📋</span>
    </motion.div>
    <motion.h3
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-lg font-medium text-gray-900 dark:text-white mb-2"
    >
      No Active Orders
    </motion.h3>
    <motion.p
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-sm text-gray-500 dark:text-gray-400 max-w-md"
    >
      You don&apos;t have any active limit orders or TWAP strategies. Create your first order to start automated trading.
    </motion.p>
  </motion.div>
);

export const EmptyPortfolioState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center p-12 text-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6"
    >
      <span className="text-3xl">💼</span>
    </motion.div>
    <motion.h3
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-lg font-medium text-gray-900 dark:text-white mb-2"
    >
      Portfolio Empty
    </motion.h3>
    <motion.p
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-sm text-gray-500 dark:text-gray-400 max-w-md"
    >
      Connect your wallets and start trading to see your portfolio analytics and performance metrics.
    </motion.p>
  </motion.div>
);

// Generic Loading Spinner
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} border-2 border-blue-200 border-t-blue-500 rounded-full`}
    />
  );
};
