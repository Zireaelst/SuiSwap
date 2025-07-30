// components/TWAPOrderFields.tsx
interface TWAPOrderFieldsProps {
    intervals: number;
    duration: number;
    onIntervalsChange: (intervals: number) => void;
    onDurationChange: (duration: number) => void;
}

export const TWAPOrderFields: React.FC<TWAPOrderFieldsProps> = ({
    intervals,
    duration,
    onIntervalsChange,
    onDurationChange
}) => {
    const durationOptions = [
        { label: '1 Hour', value: 3600 },
        { label: '6 Hours', value: 21600 },
        { label: '12 Hours', value: 43200 },
        { label: '24 Hours', value: 86400 },
        { label: '7 Days', value: 604800 }
    ];

    return (
        <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">TWAP Configuration</h4>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Number of Intervals</label>
                    <input
                        type="number"
                        min="2"
                        max="100"
                        value={intervals}
                        onChange={(e) => onIntervalsChange(parseInt(e.target.value) || 2)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-600">Split order into multiple executions</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Total Duration</label>
                    <select
                        value={duration}
                        onChange={(e) => onDurationChange(parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {durationOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-600">
                        Execution every {Math.floor(duration / intervals / 60)} minutes
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">TWAP Benefits</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Reduces market impact on large orders</li>
                    <li>• Better average execution price</li>
                    <li>• Cross-chain coordination with Sui</li>
                </ul>
            </div>
        </div>
    );
};
