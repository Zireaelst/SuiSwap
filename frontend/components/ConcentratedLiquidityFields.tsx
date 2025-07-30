// components/ConcentratedLiquidityFields.tsx
interface ConcentratedLiquidityFieldsProps {
    priceRangeMin: string;
    priceRangeMax: string;
    onPriceRangeMinChange: (price: string) => void;
    onPriceRangeMaxChange: (price: string) => void;
    currentPrice: string;
}

export const ConcentratedLiquidityFields: React.FC<ConcentratedLiquidityFieldsProps> = ({
    priceRangeMin,
    priceRangeMax,
    onPriceRangeMinChange,
    onPriceRangeMaxChange,
    currentPrice
}) => {
    const setPresetRange = (percentage: number) => {
        if (!currentPrice) return;

        const current = parseFloat(currentPrice);
        const min = current * (1 - percentage / 100);
        const max = current * (1 + percentage / 100);

        onPriceRangeMinChange(min.toFixed(6));
        onPriceRangeMaxChange(max.toFixed(6));
    };

    return (
        <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium text-purple-800 dark:text-purple-200">Concentrated Liquidity Range</h4>

            <div className="space-y-3">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setPresetRange(5)}
                        className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        ±5%
                    </button>
                    <button
                        onClick={() => setPresetRange(10)}
                        className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        ±10%
                    </button>
                    <button
                        onClick={() => setPresetRange(20)}
                        className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        ±20%
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Min Price</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={priceRangeMin}
                            onChange={(e) => onPriceRangeMinChange(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="0.000000"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Max Price</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={priceRangeMax}
                            onChange={(e) => onPriceRangeMaxChange(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="0.000000"
                        />
                    </div>
                </div>

                {currentPrice && priceRangeMin && priceRangeMax && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex justify-between text-sm">
                            <span>Current Price:</span>
                            <span>{parseFloat(currentPrice).toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Range:</span>
                            <span>
                                {(((parseFloat(priceRangeMax) - parseFloat(priceRangeMin)) / parseFloat(currentPrice)) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Capital Efficiency:</span>
                            <span className="text-green-500">
                                {(100 / (((parseFloat(priceRangeMax) - parseFloat(priceRangeMin)) / parseFloat(currentPrice)) * 100)).toFixed(1)}x
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
