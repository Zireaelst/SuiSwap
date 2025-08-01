// components/LimitOrderInterface.tsx
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../src/hooks/useWallet';
import { useLimitOrders } from '../src/hooks/useLimitOrders';
import { TokenSelector } from './TokenSelector';
import PriceInput from './PriceInput';
import OrderBookChart from './OrderBookChart';
import { TWAPOrderFields } from './TWAPOrderFields';
import { ConcentratedLiquidityFields } from './ConcentratedLiquidityFields';
import { ActiveOrdersList } from './ActiveOrdersList';
import type { Token } from '../src/types/token';

export const LimitOrderInterface = () => {
    const { isConnected } = useWallet();
    const { createOrder, isLoading } = useLimitOrders();

    const [orderType, setOrderType] = useState<'limit' | 'twap' | 'concentrated'>('limit');
    const [fromToken, setFromToken] = useState<Token | null>(null);
    const [toToken, setToToken] = useState<Token | null>(null);
    const [fromAmount, setFromAmount] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');
    const [priceImpact, setPriceImpact] = useState(0);
    const [expiresAt, setExpiresAt] = useState('');

    // TWAP specific states
    const [twapIntervals, setTwapIntervals] = useState(10);
    const [twapDuration, setTwapDuration] = useState(3600); // 1 hour

    // Concentrated liquidity states
    const [priceRangeMin, setPriceRangeMin] = useState('');
    const [priceRangeMax, setPriceRangeMax] = useState('');

    const fetchCurrentPrice = useCallback(async () => {
        if (!fromToken || !toToken) return;

        try {
            const response = await fetch(`/api/price/current?${new URLSearchParams({
                tokenIn: fromToken.address,
                tokenOut: toToken.address,
                chainId: '1'
            })}`);

            const data = await response.json();
            setCurrentPrice(data.price);

            if (targetPrice) {
                const impact = ((parseFloat(targetPrice) - parseFloat(data.price)) / parseFloat(data.price)) * 100;
                setPriceImpact(impact);
            }
        } catch (error) {
            console.error('Failed to fetch current price:', error);
        }
    }, [fromToken, toToken, targetPrice]);

    useEffect(() => {
        if (fromToken && toToken) {
            fetchCurrentPrice();
        }
    }, [fromToken, toToken, fetchCurrentPrice]);

    const handleCreateOrder = async () => {
        if (!fromToken || !toToken || !fromAmount || !targetPrice) return;

        try {
            const orderData = {
                fromToken: fromToken.address,
                toToken: toToken.address,
                fromAmount: (parseFloat(fromAmount) * 10 ** fromToken.decimals).toString(),
                targetPrice: targetPrice,
                orderType,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,

                // TWAP specific data
                ...(orderType === 'twap' && {
                    twapIntervals,
                    twapDuration
                }),

                // Concentrated liquidity specific data
                ...(orderType === 'concentrated' && {
                    priceRangeMin,
                    priceRangeMax
                })
            };

            await createOrder(orderData);

            // Reset form
            setFromAmount('');
            setTargetPrice('');
            setExpiresAt('');

        } catch (error) {
            console.error('Failed to create limit order:', error);
        }
    };

    // Mock order book data for demonstration
    const mockBids = [
        { price: parseFloat(currentPrice || '0') * 0.99, size: 100, total: 100 },
        { price: parseFloat(currentPrice || '0') * 0.98, size: 200, total: 300 },
        { price: parseFloat(currentPrice || '0') * 0.97, size: 150, total: 450 },
    ];

    const mockAsks = [
        { price: parseFloat(currentPrice || '0') * 1.01, size: 120, total: 120 },
        { price: parseFloat(currentPrice || '0') * 1.02, size: 180, total: 300 },
        { price: parseFloat(currentPrice || '0') * 1.03, size: 90, total: 390 },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Order Type Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Create Limit Order</h2>

                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setOrderType('limit')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            orderType === 'limit'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Limit Order
                    </button>
                    <button
                        onClick={() => setOrderType('twap')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            orderType === 'twap'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        TWAP Order
                    </button>
                    <button
                        onClick={() => setOrderType('concentrated')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            orderType === 'concentrated'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Concentrated Liquidity
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Order Form */}
                    <div className="space-y-4">
                        {/* Token Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">From Token</label>
                            <TokenSelector
                                selectedToken={fromToken}
                                onTokenSelect={setFromToken}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">To Token</label>
                            <TokenSelector
                                selectedToken={toToken}
                                onTokenSelect={setToToken}
                            />
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount</label>
                            <input
                                type="number"
                                value={fromAmount}
                                onChange={(e) => setFromAmount(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.0"
                            />
                        </div>

                        {/* Price Input */}
                        <PriceInput
                            value={targetPrice}
                            onChange={setTargetPrice}
                            placeholder={`Target price (${toToken?.symbol}/${fromToken?.symbol})`}
                        />

                        {/* Price Impact Display */}
                        {currentPrice && targetPrice && (
                            <div className="text-sm">
                                <span>Price Impact: </span>
                                <span className={priceImpact > 0 ? 'text-green-500' : 'text-red-500'}>
                                    {priceImpact.toFixed(2)}%
                                </span>
                            </div>
                        )}

                        {/* Order Type Specific Fields */}
                        {orderType === 'twap' && (
                            <TWAPOrderFields
                                intervals={twapIntervals}
                                duration={twapDuration}
                                onIntervalsChange={setTwapIntervals}
                                onDurationChange={setTwapDuration}
                            />
                        )}

                        {orderType === 'concentrated' && (
                            <ConcentratedLiquidityFields
                                priceRangeMin={priceRangeMin}
                                priceRangeMax={priceRangeMax}
                                onPriceRangeMinChange={setPriceRangeMin}
                                onPriceRangeMaxChange={setPriceRangeMax}
                                currentPrice={currentPrice}
                            />
                        )}

                        {/* Expiration */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Expires At (Optional)</label>
                            <input
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Create Order Button */}
                        <button
                            onClick={handleCreateOrder}
                            disabled={!isConnected || isLoading || !fromToken || !toToken || !fromAmount || !targetPrice}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Order...' : `Create ${orderType.toUpperCase()} Order`}
                        </button>
                    </div>

                    {/* Right Column - Order Book & Chart */}
                    <div className="space-y-4">
                        <OrderBookChart
                            bids={mockBids}
                            asks={mockAsks}
                        />

                        {/* Order Summary */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-medium mb-3">Order Summary</h3>
                           <div className="space-y-2 text-sm">
                               <div className="flex justify-between">
                                   <span>Order Type:</span>
                                   <span className="font-medium capitalize">{orderType}</span>
                               </div>
                               <div className="flex justify-between">
                                   <span>Current Price:</span>
                                   <span>{currentPrice} {toToken?.symbol}/{fromToken?.symbol}</span>
                               </div>
                               <div className="flex justify-between">
                                   <span>Target Price:</span>
                                   <span>{targetPrice} {toToken?.symbol}/{fromToken?.symbol}</span>
                               </div>
                               <div className="flex justify-between">
                                   <span>Price Impact:</span>
                                   <span className={priceImpact > 0 ? 'text-green-500' : 'text-red-500'}>
                                       {priceImpact.toFixed(2)}%
                                   </span>
                               </div>
                               {orderType === 'twap' && (
                                   <>
                                       <div className="flex justify-between">
                                           <span>Intervals:</span>
                                           <span>{twapIntervals}</span>
                                       </div>
                                       <div className="flex justify-between">
                                           <span>Duration:</span>
                                           <span>{Math.floor(twapDuration / 3600)}h {Math.floor((twapDuration % 3600) / 60)}m</span>
                                       </div>
                                       <div className="flex justify-between">
                                           <span>Amount per Interval:</span>
                                           <span>{fromAmount ? (parseFloat(fromAmount) / twapIntervals).toFixed(4) : '0'} {fromToken?.symbol}</span>
                                       </div>
                                   </>
                               )}
                           </div>
                       </div>
                   </div>
               </div>
           </div>
           
           {/* Active Orders */}
           <ActiveOrdersList />
       </div>
   );
};