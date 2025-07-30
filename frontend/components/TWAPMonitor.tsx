import { useState, useEffect } from 'react';
import { CrossChainTWAPService } from '../services/CrossChainTWAPService';
import { useWallet } from '../hooks/useWallet';

interface TWAPMonitorProps {
    orderId: string;
}

export const TWAPMonitor: React.FC<TWAPMonitorProps> = ({ orderId }) => {
    const { ethProvider } = useWallet();
    const [progress, setProgress] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (ethProvider && orderId) {
            monitorProgress();
            const interval = setInterval(monitorProgress, 30000); // Update every 30 seconds
            return () => clearInterval(interval);
        }
    }, [ethProvider, orderId]);

    const monitorProgress = async () => {
        try {
            setIsLoading(true);

            const twapService = new CrossChainTWAPService(
                ethProvider!,
                null as any, // Sui client would be initialized here
                process.env.NEXT_PUBLIC_TWAP_CONTRACT_ADDRESS!,
                [] // ABI would be imported
            );

            const progressData = await twapService.monitorTWAPProgress(orderId);
            setProgress(progressData);

        } catch (error) {
            console.error('Failed to monitor TWAP progress:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !progress) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-2 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (!progress) return null;

    const progressPercentage = (progress.executedIntervals / progress.totalIntervals) * 100;
    const isActive = progress.status === 'active';
    const timeUntilNext = progress.nextExecutionTime.getTime() - Date.now();
    const minutesUntilNext = Math.max(0, Math.floor(timeUntilNext / (1000 * 60)));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">TWAP Order Progress</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {progress.status.toUpperCase()}
                </span>
            </div>
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{progress.executedIntervals}/{progress.totalIntervals} intervals</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <div className="text-center text-sm text-gray-600 mt-1">
                    {progressPercentage.toFixed(1)}% Complete
                </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Remaining Amount</div>
                    <div className="text-lg font-semibold">
                        {(parseFloat(progress.remainingAmount) / 1e18).toFixed(4)} ETH
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Next Execution</div>
                    <div className="text-lg font-semibold">
                        {isActive ? `${minutesUntilNext}m` : 'N/A'}
                    </div>
                </div>
            </div>
            {/* Timeline */}
            <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Execution Timeline</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Array.from({ length: progress.totalIntervals }, (_, i) => {
                        const isExecuted = i < progress.executedIntervals;
                        const isCurrent = i === progress.executedIntervals && isActive;
                        return (
                            <div key={i} className={`flex items-center space-x-3 p-2 rounded ${
                                isExecuted 
                                    ? 'bg-green-50 dark:bg-green-900/20' 
                                    : isCurrent 
                                        ? 'bg-blue-50 dark:bg-blue-900/20'
                                        : 'bg-gray-50 dark:bg-gray-700'
                            }`}>
                                <div className={`w-3 h-3 rounded-full ${
                                    isExecuted 
                                        ? 'bg-green-500' 
                                        : isCurrent 
                                            ? 'bg-blue-500 animate-pulse'
                                            : 'bg-gray-300'
                                }`}></div>
                                <span className="text-sm">
                                    Interval {i + 1}
                                    {isExecuted && <span className="text-green-600 ml-2">✓ Executed</span>}
                                    {isCurrent && <span className="text-blue-600 ml-2">⏳ Next</span>}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Cross-Chain Status */}
            <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cross-Chain Coordination</span>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs">Ethereum</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-xs">Sui</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
