import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Token } from '../types/token';

interface SwapQuote {
    toAmount: string;
    estimatedGas: string;
    protocols: unknown[];
    rate?: string;
}

interface SwapState {
    fromToken: Token | null;
    toToken: Token | null;
    fromAmount: string;
    toAmount: string;
    slippage: number;
    isLoading: boolean;
    quote: SwapQuote | null;

    // Actions
    setFromToken: (token: Token | null) => void;
    setToToken: (token: Token | null) => void;
    setFromAmount: (amount: string) => void;
    setToAmount: (amount: string) => void;
    setSlippage: (slippage: number) => void;
    setQuote: (quote: SwapQuote | null) => void;
    setIsLoading: (loading: boolean) => void;
    swapTokens: () => void;
}

export const useSwapStore = create<SwapState>()(
    persist(
        (set, get) => ({
            fromToken: null,
            toToken: null,
            fromAmount: '',
            toAmount: '',
            slippage: 1,
            isLoading: false,
            quote: null,

            setFromToken: (token) => set({ fromToken: token }),
            setToToken: (token) => set({ toToken: token }),
            setFromAmount: (amount) => set({ fromAmount: amount }),
            setToAmount: (amount) => set({ toAmount: amount }),
            setSlippage: (slippage) => set({ slippage }),
            setQuote: (quote) => set({ quote }),
            setIsLoading: (loading) => set({ isLoading: loading }),

            swapTokens: () => {
                const { fromToken, toToken, fromAmount, toAmount } = get();
                set({
                    fromToken: toToken,
                    toToken: fromToken,
                    fromAmount: toAmount,
                    toAmount: fromAmount
                });
            }
        }),
        {
            name: 'swap-store',
            partialize: (state) => ({
                fromToken: state.fromToken,
                toToken: state.toToken,
                slippage: state.slippage
            })
        }
    )
);
