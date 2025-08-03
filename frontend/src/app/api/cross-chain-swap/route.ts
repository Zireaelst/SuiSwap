// Cross-chain swap API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

interface SwapRequest {
  fromChain: 'ethereum' | 'sui';
  toChain: 'ethereum' | 'sui';
  fromToken: string;
  toToken: string;
  amount: string;
  recipient: string;
  userAddress: string;
  timelock?: number;
}

interface SwapOrder {
  orderId: string;
  fromChain: 'ethereum' | 'sui';
  toChain: 'ethereum' | 'sui';
  fromToken: string;
  toToken: string;
  amount: string;
  recipient: string;
  hashlock: string;
  secret: string;
  timelock: number;
  status: 'pending' | 'locked' | 'withdrawn' | 'refunded' | 'expired';
  ethOrderId?: string;
  suiOrderId?: string;
  createdAt: number;
  updatedAt: number;
}

// In-memory storage for demo (use database in production)
const orders: Map<string, SwapOrder> = new Map();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as SwapRequest;
    
    // Validate request
    const validation = validateSwapRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400 }
      );
    }

    // Generate order details
    const secret = generateSecret();
    const hashlock = ethers.keccak256(ethers.toUtf8Bytes(secret));
    const timelock = body.timelock || Math.floor(Date.now() / 1000) + (2 * 3600); // 2 hours default
    const orderId = generateOrderId(body, hashlock, timelock);

    const order: SwapOrder = {
      orderId,
      fromChain: body.fromChain,
      toChain: body.toChain,
      fromToken: body.fromToken,
      toToken: body.toToken,
      amount: body.amount,
      recipient: body.recipient,
      hashlock,
      secret,
      timelock,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Store order
    orders.set(orderId, order);

    // Simulate HTLC creation on both chains
    setTimeout(() => {
      const storedOrder = orders.get(orderId);
      if (storedOrder) {
        storedOrder.status = 'locked';
        storedOrder.ethOrderId = 'eth_' + Date.now();
        storedOrder.suiOrderId = 'sui_' + Date.now();
        storedOrder.updatedAt = Date.now();
        orders.set(orderId, storedOrder);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        secret: undefined // Don't expose secret in response
      }
    });

  } catch (error) {
    console.error('Cross-chain swap API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const userAddress = searchParams.get('userAddress');

    if (orderId) {
      // Get specific order
      const order = orders.get(orderId);
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        order: {
          ...order,
          secret: undefined // Don't expose secret
        }
      });
    }

    if (userAddress) {
      // Get orders by user address
      const userOrders = Array.from(orders.values())
        .filter(order => 
          order.recipient === userAddress || 
          order.hashlock === ethers.keccak256(ethers.toUtf8Bytes(userAddress))
        )
        .map(order => ({
          ...order,
          secret: undefined // Don't expose secret
        }));

      return NextResponse.json({
        success: true,
        orders: userOrders
      });
    }

    // Get all orders (for demo purposes)
    const allOrders = Array.from(orders.values()).map(order => ({
      ...order,
      secret: undefined // Don't expose secret
    }));

    return NextResponse.json({
      success: true,
      orders: allOrders
    });

  } catch (error) {
    console.error('Cross-chain swap API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status, txHash } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing orderId or status' },
        { status: 400 }
      );
    }

    const order = orders.get(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    order.status = status;
    order.updatedAt = Date.now();
    
    if (txHash) {
      if (order.fromChain === 'ethereum') {
        order.ethOrderId = txHash;
      } else {
        order.suiOrderId = txHash;
      }
    }

    orders.set(orderId, order);

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        secret: undefined // Don't expose secret
      }
    });

  } catch (error) {
    console.error('Cross-chain swap API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Utility functions
function validateSwapRequest(request: SwapRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!['ethereum', 'sui'].includes(request.fromChain)) {
    errors.push('Invalid source chain');
  }

  if (!['ethereum', 'sui'].includes(request.toChain)) {
    errors.push('Invalid destination chain');
  }

  if (request.fromChain === request.toChain) {
    errors.push('Source and destination chains must be different');
  }

  if (!request.amount || parseFloat(request.amount) <= 0) {
    errors.push('Invalid amount');
  }

  if (!request.recipient) {
    errors.push('Recipient address required');
  }

  if (!request.userAddress) {
    errors.push('User address required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function generateSecret(): string {
  const array = new Uint8Array(32);
  // Use crypto API if available, otherwise fallback to Math.random
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return '0x' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function generateOrderId(request: SwapRequest, hashlock: string, timelock: number): string {
  return ethers.keccak256(ethers.toUtf8Bytes(
    `${request.fromChain}-${request.toChain}-${request.amount}-${hashlock}-${timelock}-${Date.now()}`
  ));
}
