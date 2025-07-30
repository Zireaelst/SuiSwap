import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useLimitOrders } from '../hooks/useLimitOrders';
import { OrderCard } from './OrderCard';

export const ActiveOrdersList = () => {
    const { ethAddress } = useWallet();
    const { orders, cancelOrder, isLoading } = useLimitOrders();
    const [filter, setFilter] = useState<'all' | 'pending' | 'filled' | 'cancelled'>('all');
    const [sortBy, setSortBy] = useState<'created' | 'price' | 'amount'>('created');

    const filteredOrders = orders
        .filter(order => filter === 'all' || order.status.toLowerCase() === filter)
        .sort((a, b) => {
            switch (sortBy) {
                case 'price':
                    return parseFloat(b.price) - parseFloat(a.price);
                case 'amount':
                    return parseFloat(b.amountIn) - parseFloat(a.amountIn);
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your Orders</h2>

                <div className="flex space-x-4">
                    {/* Filter */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="filled">Filled</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="created">Date Created</option>
                        <option value="price">Price</option>
                        <option value="amount">Amount</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No {filter === 'all' ? '' : filter} orders found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onCancel={cancelOrder}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
