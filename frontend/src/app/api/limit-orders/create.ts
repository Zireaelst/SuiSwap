import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            userAddress,
            chainId,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            price,
            orderType,
            signature,
            orderData,
            expiresAt
        } = req.body;

        // Validate signature
        const isValidSignature = await validateOrderSignature(
            orderData,
            signature,
            userAddress
        );

        if (!isValidSignature) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        // Create order hash
        const orderHash = ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(
                ['address', 'address', 'address', 'uint256', 'uint256', 'uint256'],
                [userAddress, tokenIn, tokenOut, amountIn, amountOut, Date.now()]
            )
        );

        // Save to database
        const limitOrder = await prisma.limitOrder.create({
            data: {
                userId: userAddress, // Simplified - in production, use proper user ID
                chainId,
                tokenIn,
                tokenOut,
                amountIn,
                amountOut,
                price,
                orderType,
                orderHash,
                signature,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        // Submit to 1inch Limit Order Protocol
        const result = await submitLimitOrderTo1inch(limitOrder);

        res.status(200).json({
            success: true,
            order: limitOrder,
            orderHash,
            result
        });

    } catch (error) {
        console.error('Limit order creation error:', error);
        res.status(500).json({ error: 'Failed to create limit order' });
    }
}

interface OrderData {
    fromToken: string;
    toToken: string;
    fromAmount: string;
    targetPrice: string;
    userAddress: string;
    chainId: number;
    orderType?: string;
    expiresAt?: string | null;
}

async function validateOrderSignature(
    orderData: OrderData,
    signature: string,
    userAddress: string
): Promise<boolean> {
    try {
        const recoveredAddress = ethers.verifyMessage(
            JSON.stringify(orderData),
            signature
        );
        return recoveredAddress.toLowerCase() === userAddress.toLowerCase();
    } catch {
        return false;
    }
}

async function submitLimitOrderTo1inch(order: OrderData) {
    // Implementation for submitting to 1inch Limit Order Protocol
    // This would use the 1inch API to submit the order
    console.log('Submitting order to 1inch:', order);
    return { success: true };
}
