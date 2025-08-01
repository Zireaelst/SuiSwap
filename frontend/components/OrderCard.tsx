// components/OrderCard.tsx
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { LimitOrder } from '../src/hooks/useLimitOrders';

interface OrderCardProps {
    order: LimitOrder;
    onCancel: (orderId: string) => Promise<void>;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onCancel }) => {
    const [isCancelling, setIsCancelling] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'filled':
                return 'bg-green-100 text-green-800';
            case 'partially_filled':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'expired':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getOrderTypeIcon = (orderType?: string) => {
        switch (orderType) {
            case 'twap':
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                );
            case 'concentrated':
                return (
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                );
        }
    };

    const handleCancel = async () => {
        if (order.status !== 'pending') return;

        setIsCancelling(true);
        try {
            await onCancel(order.id);
        } catch (error) {
            console.error('Failed to cancel order:', error);
        } finally {
            setIsCancelling(false);
        }
    };

    // Get values with fallbacks for optional properties
    const amountIn = order.amountIn || order.fromAmount || '0';
    const amountOut = order.amountOut || '0';
    const price = order.price || order.targetPrice || '0';
    const tokenInSymbol = order.tokenInSymbol || 'TOKEN';
    const tokenOutSymbol = order.tokenOutSymbol || 'TOKEN';
    const orderType = order.orderType || 'limit';

    const filledPercentage = order.filledAmount && amountIn
        ? (parseFloat(order.filledAmount) / parseFloat(amountIn)) * 100
        : 0;

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    {getOrderTypeIcon(orderType)}

                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">
                                {parseFloat(amountIn).toFixed(4)} {tokenInSymbol}
                            </span>
                            <span className="text-gray-500">→</span>
                            <span className="font-medium">
                                {parseFloat(amountOut).toFixed(4)} {tokenOutSymbol}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                                <span>Price:</span>
                                <span>{parseFloat(price).toFixed(6)} {tokenOutSymbol}/{tokenInSymbol}</span>
                            </div>

                            {orderType === 'twap' && (
                                <>
                                    <div className="flex justify-between">
                                        <span>Progress:</span>
                                        <span>{filledPercentage.toFixed(1)}% completed</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${filledPercentage}%` }}
                                        ></div>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-between">
                                <span>Created:</span>
                                <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                            </div>

                            {order.expiresAt && (
                                <div className="flex justify-between">
                                    <span>Expires:</span>
                                    <span className={new Date(order.expiresAt) < new Date() ? 'text-red-500' : ''}>
                                        {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col space-y-2">
                    {order.status === 'pending' && (
                        <button
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-md transition-colors"
                        >
                            {isCancelling ? 'Cancelling...' : 'Cancel'}
                        </button>
                    )}

                    <button className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};
