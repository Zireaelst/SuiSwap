import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const ONEINCH_API_BASE = 'https://api.1inch.dev';
const API_KEY = process.env.ONEINCH_API_KEY;

// Middleware to check API key
const checkApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  next();
};

// Helper function to make requests to 1inch API
const makeOneInchRequest = async (endpoint: string, params?: Record<string, string>) => {
  const url = new URL(`${ONEINCH_API_BASE}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'accept': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`1inch API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
};

// TOKEN PRICES
router.get('/prices/:chainId/:tokens', checkApiKey, async (req, res) => {
  try {
    const { chainId, tokens } = req.params;
    const data = await makeOneInchRequest(`/price/v1.1/${chainId}/${tokens}`);
    res.json(data);
  } catch (error) {
    console.error('Price API error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// WALLET BALANCES
router.get('/balances/:chainId/:address', checkApiKey, async (req, res) => {
  try {
    const { chainId, address } = req.params;
    const data = await makeOneInchRequest(`/balance/v1.2/${chainId}/balances/${address}`);
    res.json(data);
  } catch (error) {
    console.error('Balance API error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PORTFOLIO - Current Value
router.get('/portfolio/current_value', checkApiKey, async (req, res) => {
  try {
    const { addresses, chain_id } = req.query;
    const data = await makeOneInchRequest('/portfolio/portfolio/v4/overview/erc20/current_value', {
      addresses: addresses as string,
      chain_id: chain_id as string
    });
    res.json(data);
  } catch (error) {
    console.error('Portfolio current value API error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PORTFOLIO - Profit & Loss
router.get('/portfolio/profit_loss', checkApiKey, async (req, res) => {
  try {
    const { addresses, chain_id, timeframe } = req.query;
    const data = await makeOneInchRequest('/portfolio/portfolio/v4/overview/erc20/profit_and_loss', {
      addresses: addresses as string,
      chain_id: chain_id as string,
      timeframe: timeframe as string || '1d'
    });
    res.json(data);
  } catch (error) {
    console.error('Portfolio P&L API error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PORTFOLIO - Details
router.get('/portfolio/details', checkApiKey, async (req, res) => {
  try {
    const { addresses, chain_id } = req.query;
    const data = await makeOneInchRequest('/portfolio/portfolio/v4/overview/erc20/details', {
      addresses: addresses as string,
      chain_id: chain_id as string
    });
    res.json(data);
  } catch (error) {
    console.error('Portfolio details API error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// TRANSACTION HISTORY
router.get('/history/:address', checkApiKey, async (req, res) => {
  try {
    const { address } = req.params;
    const { chain_id, limit } = req.query;
    const data = await makeOneInchRequest(`/history/v2.0/history/${address}/events`, {
      chainId: chain_id as string || '1',
      limit: limit as string || '10'
    });
    res.json(data);
  } catch (error) {
    console.error('History API error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// TOKEN INFO
router.get('/tokens/:chainId/:addresses', checkApiKey, async (req, res) => {
  try {
    const { chainId, addresses } = req.params;
    const data = await makeOneInchRequest(`/token/v1.2/${chainId}/custom/${addresses}`);
    res.json(data);
  } catch (error) {
    console.error('Token info API error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// HEALTH CHECK for 1inch API
router.get('/health', checkApiKey, async (req, res) => {
  try {
    const data = await makeOneInchRequest('/price/v1.1/1');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!API_KEY,
      oneinchApiReachable: true
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!API_KEY,
      oneinchApiReachable: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
