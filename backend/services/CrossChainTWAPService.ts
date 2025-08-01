import { ethers } from 'ethers';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

export class CrossChainTWAPService {
    private ethProvider: ethers.Provider;
    private suiClient: SuiClient;
    private twapContract: ethers.Contract;

    constructor(
        ethProvider: ethers.Provider,
        suiClient: SuiClient,
        twapContractAddress: string,
        twapContractABI: ethers.InterfaceAbi
    ) {
        this.ethProvider = ethProvider;
        this.suiClient = suiClient;
        this.twapContract = new ethers.Contract(twapContractAddress, twapContractABI, ethProvider);
    }

    async createCrossChainTWAPOrder(params: {
        signer: ethers.Signer;
        tokenIn: string;
        tokenOut: string;
        totalAmount: string;
        intervals: number;
        intervalDuration: number;
        targetChain: 'sui';
        suiRecipient: string;
    }) {
        try {
            // Step 1: Create Ethereum TWAP order
            const ethOrderTx = await (this.twapContract.connect(params.signer) as any).createTWAPOrder(
                params.tokenIn,
                params.totalAmount,
                params.intervals,
                params.intervalDuration,
                ethers.keccak256(ethers.toUtf8Bytes(params.suiRecipient))
            );

            const ethReceipt = await ethOrderTx.wait();
            const ethOrderId = ethReceipt.logs[0].data; // Simplified extraction

            // Step 2: Create corresponding Sui order
            const suiOrderId = await this.createSuiTWAPOrder({
                tokenType: this.mapEthTokenToSui(params.tokenIn),
                totalAmount: params.totalAmount,
                intervals: params.intervals,
                intervalDuration: params.intervalDuration,
                ethOrderId,
                recipient: params.suiRecipient
            });

            // Step 3: Link orders
            await this.linkCrossChainOrders(ethOrderId, suiOrderId);

            return {
                ethOrderId,
                suiOrderId,
                status: 'created'
            };

        } catch (error) {
            console.error('Failed to create cross-chain TWAP order:', error);
            throw error;
        }
    }

    private async createSuiTWAPOrder(params: {
        tokenType: string;
        totalAmount: string;
        intervals: number;
        intervalDuration: number;
        ethOrderId: string;
        recipient: string;
    }) {
        const tx = new Transaction();

        // Note: In the new Sui SDK, parameters need proper BCS serialization
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_SUI_PACKAGE_ID}::twap_strategy::create_cross_chain_twap`,
            arguments: [
                bcs.string().serialize(params.tokenType),
                bcs.u64().serialize(BigInt(params.totalAmount)),
                bcs.u32().serialize(params.intervals),
                bcs.u64().serialize(BigInt(params.intervalDuration)),
                bcs.vector(bcs.u8()).serialize(new Uint8Array(ethers.toUtf8Bytes(params.ethOrderId))),
                bcs.string().serialize(params.recipient)
            ]
        });

        // Note: This would need proper signer/keypair integration in production
        // For now, this is a placeholder implementation
        try {
            const result = await this.suiClient.signAndExecuteTransaction({
                transaction: tx,
                // signer would be passed from the calling context
            } as any);

            return result.digest;
        } catch (error) {
            console.error('Sui transaction failed:', error);
            throw error;
        }
    }

    async executeTWAPInterval(orderId: string, intervalIndex: number) {
        try {
            // Execute on Ethereum
            const ethTx = await this.twapContract.executeTWAPInterval(orderId);
            await ethTx.wait();

            // Coordinate with Sui
            await this.coordinateSuiExecution(orderId, intervalIndex);

            return { success: true, intervalIndex };

        } catch (error) {
            console.error('Failed to execute TWAP interval:', error);
            throw error;
        }
    }

    private async coordinateSuiExecution(ethOrderId: string, intervalIndex: number) {
        const tx = new Transaction();

        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_SUI_PACKAGE_ID}::twap_strategy::execute_interval`,
            arguments: [
                bcs.vector(bcs.u8()).serialize(new Uint8Array(ethers.toUtf8Bytes(ethOrderId))),
                bcs.u32().serialize(intervalIndex)
            ]
        });

        // Execute transaction
        // This would need proper signer integration in production
        try {
            const result = await this.suiClient.signAndExecuteTransaction({
                transaction: tx,
                // signer would be passed from the calling context
            } as any);
            
            return result.digest;
        } catch (error) {
            console.error('Sui coordination failed:', error);
            throw error;
        }
    }

    private mapEthTokenToSui(ethToken: string): string {
        // Token mapping logic
        const mapping: Record<string, string> = {
            '0xA0b86a33E6Dd83F4c9eF50B84Ad4A8a3D4F28Eb': 'sui::coin::Coin<SUI>',
            // Add more mappings
        };

        return mapping[ethToken] || 'sui::coin::Coin<SUI>';
    }

    private async linkCrossChainOrders(ethOrderId: string, suiOrderId: string) {
        // Store the relationship in database
        await fetch('/api/cross-chain/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ethOrderId,
                suiOrderId,
                linkType: 'twap'
            })
        });
    }

    async monitorTWAPProgress(orderId: string): Promise<{
        totalIntervals: number;
        executedIntervals: number;
        remainingAmount: string;
        nextExecutionTime: Date;
        status: 'active' | 'completed' | 'paused' | 'cancelled';
    }> {
        // Get order details from contract
        const orderDetails = await this.twapContract.twapOrders(orderId);

        return {
            totalIntervals: orderDetails.intervals,
            executedIntervals: await this.getExecutedIntervals(orderId),
            remainingAmount: (BigInt(orderDetails.totalAmount) - BigInt(orderDetails.executedAmount)).toString(),
            nextExecutionTime: new Date(orderDetails.lastExecutionTime + orderDetails.intervalDuration * 1000),
            status: orderDetails.active ? 'active' : 'completed'
        };
    }

    private async getExecutedIntervals(orderId: string): Promise<number> {
        // Query executed intervals from events or contract state
        const filter = this.twapContract.filters.TWAPOrderExecuted(orderId);
        const events = await this.twapContract.queryFilter(filter);
        return events.length;
    }
}
