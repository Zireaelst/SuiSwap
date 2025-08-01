// components/SwapInterface.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSwapStore } from '../src/store/useSwapStore';
import { useWallet } from '../src/hooks/useWallet';
import { TokenSelector } from './TokenSelector';
import { SwapButton } from './SwapButton';

export const SwapInterface = () => {
    const {
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        slippage,
        isLoading,
        quote,
        setFromToken,
        setToToken,
        setFromAmount,
        setToAmount,
        setQuote,
        setIsLoading,
        swapTokens
    } = useSwapStore();

    const { isConnected, ethAddress } = useWallet();

    const [priceImpact, setPriceImpact] = useState<number>(0);

    const fetchQuote = useCallback(async () => {
        if (!fromToken || !toToken || !fromAmount) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/swap/quote?${new URLSearchParams({
                chainId: '1',
                src: fromToken.address,
                dst: toToken.address,
                amount: (parseFloat(fromAmount) * 10 ** fromToken.decimals).toString(),
                from: ethAddress || '',
                slippage: slippage.toString()
            })}`);

            const quoteData = await response.json();
            setQuote(quoteData);
            setToAmount((parseFloat(quoteData.toAmount) / 10 ** toToken.decimals).toString());
            setPriceImpact(quoteData.priceImpact || 0);
        } catch (error) {
            console.error('Failed to fetch quote:', error);
        } finally {
            setIsLoading(false);
        }
    }, [fromToken, toToken, fromAmount, slippage, ethAddress, setQuote, setToAmount, setIsLoading]);

    useEffect(() => {
        if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
            fetchQuote();
        }
    }, [fromToken, toToken, fromAmount, slippage, fetchQuote]);

    const handleSwap = async () => {
        if (!quote || !fromToken || !toToken) return;

        try {
            setIsLoading(true);
            // TODO: Implement actual swap logic
            console.log('Swap executed:', { fromToken, toToken, quote });
        } catch (error) {
            console.error('Swap failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-md mx-auto">
            <div className="space-y-4">
                {/* From Token */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        From
                    </label>
                    <div className="flex space-x-2">
                        <TokenSelector
                            selectedToken={fromToken}
                            onTokenSelect={setFromToken}
                            chainType="ethereum"
                        />
                        <input
                            type="number"
                            value={fromAmount}
                            onChange={(e) => setFromAmount(e.target.value)}
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.0"
                        />
                    </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                    <button
                        onClick={swapTokens}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                    </button>
                </div>

                {/* To Token */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        To
                    </label>
                    <div className="flex space-x-2">
                        <TokenSelector
                            selectedToken={toToken}
                            onTokenSelect={setToToken}
                            chainType="sui"
                        />
                        <input
                            type="number"
                            value={toAmount}
                            readOnly
                            className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                            placeholder="0.0"
                        />
                    </div>
                </div>

                {/* Quote Info */}
                {quote && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Rate</span>
                            <span>1 {fromToken?.symbol} = {quote.rate} {toToken?.symbol}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Price Impact</span>
                            <span className={priceImpact > 5 ? 'text-red-500' : 'text-green-500'}>
                                {priceImpact.toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Network Fee</span>
                            <span>{quote.estimatedGas} ETH</span>
                        </div>
                    </div>
                )}

                {/* Swap Button */}
                <SwapButton
                    isLoading={isLoading}
                    isConnected={isConnected}
                    quote={quote}
                    fromToken={fromToken}
                    toToken={toToken}
                    fromAmount={fromAmount}
                    onSwap={handleSwap}
                />

                {/* Cross-Chain Bridge Notice */}
                {fromToken && toToken && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                Cross-chain swap will use atomic swap protocol with 1-hour timeout
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};
