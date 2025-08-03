const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

const ONEINCH_API_BASE = 'https://api.1inch.dev';
const API_KEY = process.env.ONEINCH_API_KEY;

console.log('API Key configured:', !!API_KEY);
console.log('API Key length:', API_KEY ? API_KEY.length : 0);

// Helper function to make requests to 1inch API
const makeOneInchRequest = async (endpoint, params) => {
  const url = new URL(`${ONEINCH_API_BASE}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  console.log('Making 1inch API request to:', url.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'accept': 'application/json',
    }
  });

  console.log('1inch API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('1inch API error:', errorText);
    throw new Error(`1inch API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
};

// TOKEN PRICES
app.get('/api/1inch/prices/:chainId/:tokens', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    const { chainId, tokens } = req.params;
    console.log('Fetching prices for chainId:', chainId, 'tokens:', tokens);
    
    const data = await makeOneInchRequest(`/price/v1.1/${chainId}/${tokens}`);
    res.json(data);
  } catch (error) {
    console.error('Price API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch prices' });
  }
});

// WALLET BALANCES
app.get('/api/1inch/balances/:chainId/:address', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    const { chainId, address } = req.params;
    console.log('Fetching balances for chainId:', chainId, 'address:', address);
    
    const data = await makeOneInchRequest(`/balance/v1.2/${chainId}/balances/${address}`);
    res.json(data);
  } catch (error) {
    console.error('Balance API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch balances' });
  }
});

// PORTFOLIO - Current Value
app.get('/api/1inch/portfolio/current_value', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    const { addresses, chain_id } = req.query;
    console.log('Fetching portfolio for addresses:', addresses, 'chain_id:', chain_id);
    
    const data = await makeOneInchRequest('/portfolio/portfolio/v4/overview/erc20/current_value', {
      addresses,
      chain_id
    });
    res.json(data);
  } catch (error) {
    console.error('Portfolio current value API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch portfolio data' });
  }
});

// HEALTH CHECK for 1inch API
app.get('/api/1inch/health', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        status: 'ERROR',
        error: 'API key not configured',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: false
      });
    }
    
    const data = await makeOneInchRequest('/price/v1.1/1');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      apiKeyConfigured: true,
      oneinchApiReachable: true,
      sampleDataKeys: Object.keys(data).slice(0, 3)
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!API_KEY,
      oneinchApiReachable: false,
      error: error.message
    });
  }
});

// General health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'KATA Protocol Backend',
    apiKeyConfigured: !!API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`🚀 KATA Protocol Backend running on port ${PORT}`);
  console.log(`📊 1inch API proxy available at http://localhost:${PORT}/api/1inch`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 API Key status: ${API_KEY ? 'Configured' : 'Not configured'}`);
});
