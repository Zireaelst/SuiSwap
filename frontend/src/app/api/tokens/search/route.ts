import { NextRequest, NextResponse } from 'next/server';
import { getOneInchAPI } from '@/utils/1inch-api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const chainId = parseInt(searchParams.get('chainId') || '1');
        const query = searchParams.get('query');
        const limit = parseInt(searchParams.get('limit') || '10');
        
        if (!query) {
            return NextResponse.json(
                { error: 'Search query is required' },
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
        const results = await api.searchTokens(query, chainId, limit);

        return NextResponse.json(results);
    } catch (error) {
        console.error('Token search API error:', error);
        return NextResponse.json(
            { error: 'Failed to search tokens' },
            { status: 500 }
        );
    }
}
