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
        const balances = await api.getWalletBalances(chainId, walletAddress);

        return NextResponse.json(balances);
    } catch (error) {
        console.error('Balance API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch balances' },
            { status: 500 }
        );
    }
}
