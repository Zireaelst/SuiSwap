import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { OneInchAPI } from '../../../utils/1inch-api';

const prisma = new PrismaClient();
const oneInchAPI = new OneInchAPI(process.env.ONEINCH_API_KEY!);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { address } = req.query;

    if (req.method === 'GET') {
        try {
            // Get portfolio from database
            let portfolio = await prisma.portfolio.findUnique({
                where: { userAddress: address as string }
            });

            if (!portfolio) {
                // Create new portfolio
                portfolio = await prisma.portfolio.create({
                    data: {
                        userAddress: address as string,
                        positions: {}
                    }
                });
            }

            // Get live balances from 1inch API
            const [ethBalances, suiBalances] = await Promise.all([
                oneInchAPI.getWalletBalances(1, address as string),
                // Add Sui balance fetching logic here
            ]);

            // Calculate portfolio value
            const portfolioValue = await calculatePortfolioValue(ethBalances);

            // Update portfolio
            await prisma.portfolio.update({
                where: { userAddress: address as string },
                data: {
                    totalValueUSD: portfolioValue.totalUSD,
                    totalPnL: portfolioValue.totalPnL,
                    positions: portfolioValue.positions,
                    lastUpdated: new Date()
                }
            });

            res.status(200).json({
                portfolio: {
                    ...portfolio,
                    totalValueUSD: portfolioValue.totalUSD,
                    totalPnL: portfolioValue.totalPnL,
                    positions: portfolioValue.positions
                }
            });

        } catch (error) {
            console.error('Portfolio API error:', error);
            res.status(500).json({ error: 'Failed to fetch portfolio' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

async function calculatePortfolioValue(balances: any) {
    // Implementation for portfolio value calculation
    // This would integrate with price APIs and calculate total value
    return {
        totalUSD: 0,
        totalPnL: 0,
        positions: {}
    };
}
