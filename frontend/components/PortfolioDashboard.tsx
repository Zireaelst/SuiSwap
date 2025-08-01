import { useState, useEffect } from 'react';
import React from 'react';
import Image from 'next/image';
import { useWallet } from '../src/hooks/useWallet';
import { usePortfolio } from '../src/hooks/usePortfolio';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Define proper types for portfolio data
interface PortfolioPosition {
    token: string;
    amount: string;
    value: string;
    pnl: string;
    symbol?: string;
    name?: string;
    logoURI?: string;
    chain?: string;
    valueUSD?: number;
    color?: string;
}

interface PortfolioData {
    [symbol: string]: PortfolioPosition;
}

interface ChartDataPoint {
    name: string;
    value: number;
    color: string;
}

export const PortfolioDashboard = () => {
    const { ethAddress } = useWallet();
    const { totalValue, pnl, pnlPercentage, positions, performanceData, loading } = usePortfolio(ethAddress);
    const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('7d');

    useEffect(() => {
        if (ethAddress) {
            // Note: The hook doesn't have a refresh function, so we'll handle updates differently
        }
    }, [ethAddress]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-80 bg-gray-300 rounded-lg"></div>
                </div>
            </div>
        );
    }

    // Convert positions array to object format for easier rendering
    const portfolioData: PortfolioData = positions.reduce((acc, position) => {
        acc[position.token] = {
            ...position,
            symbol: position.token,
            name: position.token,
            valueUSD: parseFloat(position.value),
            color: '#8884d8'
        };
        return acc;
    }, {} as PortfolioData);

    const totalValueNum = parseFloat(totalValue);
    const totalPnL = parseFloat(pnl);
    const pnlPercentageNum = parseFloat(pnlPercentage);

    // Prepare chart data
    const pieData: ChartDataPoint[] = Object.entries(portfolioData).map(([symbol, data]) => ({
        name: symbol,
        value: data.valueUSD || 0,
        color: data.color || '#8884d8'
    }));

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Portfolio Overview</h1>
                <button
                    onClick={() => {
                        // TODO: Implement refresh functionality
                        console.log('Refresh portfolio');
                    }}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${totalValueNum.toLocaleString()}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total P&L</div>
                    <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
                    </div>
                    <div className={`text-sm ${pnlPercentageNum >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {pnlPercentageNum >= 0 ? '+' : ''}{pnlPercentageNum.toFixed(2)}%
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Orders</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        0
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Cross-Chain Swaps</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        0
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Portfolio Value Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Portfolio Value</h3>
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value as '1d' | '7d' | '30d' | '90d')}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="1d">1D</option>
                            <option value="7d">7D</option>
                            <option value="30d">30D</option>
                            <option value="90d">90D</option>
                        </select>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                                labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Asset Allocation */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Positions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Your Positions</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Asset
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Chain
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Balance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Value
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    P&L
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {Object.entries(portfolioData).map(([symbol, data]) => (
                                <tr key={symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Image
                                                src={data.logoURI || '/default-token.svg'}
                                                alt={symbol}
                                                width={32}
                                                height={32}
                                                className="rounded-full mr-3"
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {symbol}
                                                </div>
                                                <div className="text-sm text-gray-500">{data.name || symbol}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            data.chain === 'ethereum'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-purple-100 text-purple-800'
                                        }`}>
                                            {data.chain || 'ethereum'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {parseFloat(data.amount).toFixed(4)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        ${parseFloat(data.value).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm ${parseFloat(data.pnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {parseFloat(data.pnl) >= 0 ? '+' : ''}${parseFloat(data.pnl).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                                            Swap
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900">
                                            Bridge
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
