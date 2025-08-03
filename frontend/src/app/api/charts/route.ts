import { NextRequest, NextResponse } from 'next/server';
import { getOneInchAPI } from '@/utils/1inch-api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const chainId = parseInt(searchParams.get('chainId') || '1');
        const tokenAddress = searchParams.get('token');
        const timeframe = (searchParams.get('timeframe') || '1d') as '1h' | '4h' | '1d' | '1w';
        const limit = parseInt(searchParams.get('limit') || '100');
        
        if (!tokenAddress) {
            return NextResponse.json(
                { error: 'Token address is required' },
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
        const chartData = await api.getChartData(tokenAddress, chainId, timeframe, limit);

        return NextResponse.json(chartData);
    } catch (error) {
        console.error('Charts API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chart data' },
            { status: 500 }
        );
    }
}
