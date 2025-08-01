// components/SwapButton.tsx
import { useState } from 'react';
import { useWallet } from '../src/hooks/useWallet';
import type { Token } from '../src/types/token';

interface SwapQuote {
    toAmount: string;
    estimatedGas: string;
    protocols: unknown[];
    rate?: string;
}

interface SwapButtonProps {
    isLoading: boolean;
    isConnected: boolean;
    quote: SwapQuote | null;
    fromToken: Token | null;
    toToken: Token | null;
    fromAmount: string;
    onSwap: () => Promise<void>;
}

export const SwapButton: React.FC<SwapButtonProps> = ({
    isLoading,
    isConnected,
    fromToken,
    toToken,
    fromAmount,
    onSwap
}) => {
    const { connectEthereumWallet, connectSuiWallet } = useWallet();
    const [isSwapping, setIsSwapping] = useState(false);

    const handleSwap = async () => {
        setIsSwapping(true);
        try {
            await onSwap();
        } finally {
            setIsSwapping(false);
        }
    };

    const getButtonContent = () => {
        if (!isConnected) {
            return (
                <div className="space-y-2">
                    <button
                        onClick={connectEthereumWallet}
                        className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Connect Ethereum Wallet
                    </button>
                    <button
                        onClick={connectSuiWallet}
                        className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Connect Sui Wallet
                    </button>
                </div>
            );
        }

        if (!fromToken || !toToken) {
            return (
                <button
                    disabled
                    className="w-full px-4 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                >
                    Select Tokens
                </button>
            );
        }

        if (!fromAmount || parseFloat(fromAmount) <= 0) {
            return (
                <button
                    disabled
                    className="w-full px-4 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                >
                    Enter Amount
                </button>
            );
        }

        if (isLoading) {
            return (
                <button
                    disabled
                    className="w-full px-4 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center justify-center"
                >
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting Quote...
                </button>
            );
        }

        if (isSwapping) {
            return (
                <button
                    disabled
                    className="w-full px-4 py-3 bg-blue-400 text-white rounded-lg font-medium cursor-not-allowed flex items-center justify-center"
                >
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Swapping...
                </button>
            );
        }

        return (
            <button
                onClick={handleSwap}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
                Swap {fromToken.symbol} for {toToken.symbol}
            </button>
        );
    };

    return <div>{getButtonContent()}</div>;
};
