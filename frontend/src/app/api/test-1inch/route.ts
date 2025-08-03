import { NextRequest, NextResponse } from 'next/server';
import { OneInchAPI } from '../../../utils/1inch-api';

const oneInchAPI = new OneInchAPI(process.env.NEXT_PUBLIC_1INCH_API_KEY!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'all';
    const tokenAddress = searchParams.get('token');
    const walletAddress = searchParams.get('wallet');
    const srcToken = searchParams.get('src');
    const dstToken = searchParams.get('dst');
    const amount = searchParams.get('amount');
    const fromWallet = searchParams.get('from');

    const results: Record<string, unknown> = {};

    // Ethereum chain ID
    const ETHEREUM_CHAIN_ID = 1;
    
    // Test wallet address (Vitalik's address for example)
    const TEST_WALLET = walletAddress || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    
    // Popular token addresses
    const TOKENS = {
      ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      USDC: '0xA0b86a33E6441b8C0b8C0b8C0b8C0b8C0b8C0b8C',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    };

    const targetToken = tokenAddress || TOKENS.ETH;

    try {
      if (testType === 'price' || testType === 'all') {
        console.log('🔍 Testing Price API...');
        const priceToken = tokenAddress || TOKENS.ETH;
        const ethPrice = await oneInchAPI.getTokenPrices(ETHEREUM_CHAIN_ID, [priceToken]);
        results.price = {
          [priceToken]: ethPrice,
          description: `Current ${priceToken === TOKENS.ETH ? 'ETH' : 'Token'} price in USD`
        };
        console.log('✅ Price data:', ethPrice);
      }
    } catch (error) {
      console.log('❌ Price API error:', error);
      results.priceError = error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      if (testType === 'balance' || testType === 'all') {
        console.log('🔍 Testing Balance API...');
        const balances = await oneInchAPI.getWalletBalances(ETHEREUM_CHAIN_ID, TEST_WALLET);
        results.balances = {
          data: balances,
          description: 'Wallet token balances'
        };
        console.log('✅ Balance data:', Object.keys(balances || {}).length, 'tokens found');
      }
    } catch (error) {
      console.log('❌ Balance API error:', error);
      results.balanceError = error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      if (testType === 'token' || testType === 'all') {
        console.log('🔍 Testing Token Info API...');
        const tokenInfo = await oneInchAPI.getTokenInfo(ETHEREUM_CHAIN_ID, TOKENS.WETH);
        results.tokenInfo = {
          data: tokenInfo,
          description: 'WETH token information'
        };
        console.log('✅ Token info:', tokenInfo);
      }
    } catch (error) {
      console.log('❌ Token Info API error:', error);
      results.tokenError = error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      if (testType === 'quote' || testType === 'all') {
        console.log('🔍 Testing Swap Quote API...');
        const quote = await oneInchAPI.getSwapQuote(ETHEREUM_CHAIN_ID, {
          src: TOKENS.ETH,
          dst: TOKENS.USDC,
          amount: '1000000000000000000', // 1 ETH in wei
          from: TEST_WALLET,
          slippage: 1
        });
        results.swapQuote = {
          data: quote,
          description: 'Quote for swapping 1 ETH to USDC'
        };
        console.log('✅ Swap quote:', quote);
      }
    } catch (error) {
      console.log('❌ Swap Quote API error:', error);
      results.quoteError = error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      if (testType === 'portfolio' || testType === 'all') {
        console.log('🔍 Testing Portfolio API...');
        const portfolio = await oneInchAPI.getPortfolioOverview([TEST_WALLET]);
        results.portfolio = {
          data: portfolio,
          description: 'Portfolio overview'
        };
        console.log('✅ Portfolio data:', portfolio);
      }
    } catch (error) {
      console.log('❌ Portfolio API error:', error);
      results.portfolioError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
      success: true,
      message: '1inch API Test Results',
      apiKey: process.env.NEXT_PUBLIC_1INCH_API_KEY ? 'API Key found' : 'API Key missing',
      testType,
      results,
      availableEndpoints: {
        price: '/api/test-1inch?type=price',
        balance: '/api/test-1inch?type=balance',
        token: '/api/test-1inch?type=token',
        quote: '/api/test-1inch?type=quote',
        portfolio: '/api/test-1inch?type=portfolio',
        all: '/api/test-1inch?type=all'
      }
    });

  } catch (error) {
    console.error('❌ 1inch API test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      apiKey: process.env.NEXT_PUBLIC_1INCH_API_KEY ? 'API Key found' : 'API Key missing'
    }, { status: 500 });
  }
}
