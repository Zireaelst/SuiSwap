import { NextApiRequest, NextApiResponse } from 'next';
import { OneInchAPI } from '../../../../backend/utils/1inch-api'; // Adjust the import path as necessary

const oneInchAPI = new OneInchAPI(process.env.ONEINCH_API_KEY!);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { chainId, src, dst, amount, from, slippage } = req.query;

        const quote = await oneInchAPI.getSwapQuote(Number(chainId), {
            src: src as string,
            dst: dst as string,
            amount: amount as string,
            from: from as string,
            slippage: Number(slippage) || 1
        });

        res.status(200).json(quote);
    } catch (error) {
        console.error('Swap quote error:', error);
        res.status(500).json({ error: 'Failed to get swap quote' });
    }
}
