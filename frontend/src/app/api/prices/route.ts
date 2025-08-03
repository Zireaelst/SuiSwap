import { NextRequest, NextResponse } from 'next/server';
import { getOneInchAPI } from '@/utils/1inch-api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const chainId = parseInt(searchParams.get('chainId') || '1');
        const tokenAddresses = searchParams.get('tokens')?.split(',') || [];
        
        if (tokenAddresses.length === 0) {
            return NextResponse.json(
                { error: 'Token addresses are required' },
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
        const prices = await api.getTokenPrices(chainId, tokenAddresses);

        return NextResponse.json(prices);
    } catch (error) {
        console.error('Prices API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch token prices' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { chainId = 1, tokens } = body;
        
        if (!tokens || !Array.isArray(tokens)) {
            return NextResponse.json(
                { error: 'Token array is required' },
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
        const prices = await api.getRequestedTokenPrices(chainId, tokens);

        return NextResponse.json(prices);
    } catch (error) {
        console.error('Prices API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch token prices' },
            { status: 500 }
        );
    }
}
