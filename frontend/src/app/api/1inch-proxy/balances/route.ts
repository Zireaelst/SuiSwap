import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId') || '1';
    const walletAddress = searchParams.get('wallet');
    
    const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;
    
    if (!apiKey) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://api.1inch.dev/balance/v1.2/${chainId}/balances/${walletAddress}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'accept': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ 
                error: 'API request failed', 
                status: response.status,
                message: errorText 
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({
            error: 'Network error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
