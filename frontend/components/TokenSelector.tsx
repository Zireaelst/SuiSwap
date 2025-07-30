// components/TokenSelector.tsx
import { useState } from 'react';
import { Token } from '../types/token';
import { useTokenList } from '../hooks/useTokenList';

interface TokenSelectorProps {
    selectedToken: Token | null;
    onTokenSelect: (token: Token) => void;
    chainType: 'ethereum' | 'sui';
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
    selectedToken,
    onTokenSelect,
    chainType
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { tokens, isLoading, searchTokens } = useTokenList(chainType);

    const filteredTokens = tokens.filter(token =>
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
                {selectedToken ? (
                    <>
                        <img
                            src={selectedToken.logoURI || '/default-token.svg'}
                            alt={selectedToken.symbol}
                            className="w-6 h-6 rounded-full"
                        />
                        <span className="font-medium">{selectedToken.symbol}</span>
                    </>
                ) : (
                    <span className="text-gray-500">Select Token</span>
                )}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
                    <div className="p-3 border-b border-gray-200">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search tokens..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500">Loading tokens...</div>
                        ) : (
                            filteredTokens.map((token) => (
                                <button
                                    key={token.address}
                                    onClick={() => {
                                        onTokenSelect(token);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <img
                                        src={token.logoURI || '/default-token.svg'}
                                        alt={token.symbol}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div className="flex-1 text-left">
                                        <div className="font-medium">{token.symbol}</div>
                                        <div className="text-sm text-gray-500">{token.name}</div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
