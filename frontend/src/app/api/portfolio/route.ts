import { NextRequest, NextResponse } from 'next/server';
import { getOneInchAPI } from '@/utils/1inch-api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const chainId = parseInt(searchParams.get('chainId') || '1');
        const walletAddress = searchParams.get('address');
        
        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.ONEINCH_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        const api = getOneInchAPI(apiKey);
        
        // Get comprehensive portfolio data
        const [currentValue, tokenDetails] = await Promise.all([
            api.getCurrentValue(walletAddress, chainId),
            api.getTokenDetails(walletAddress, chainId)
        ]);

        return NextResponse.json({
            currentValue,
            tokenDetails
        });
    } catch (error) {
        console.error('Portfolio API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch portfolio data' },
            { status: 500 }
        );
    }
}
