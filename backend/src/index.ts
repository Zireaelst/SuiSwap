import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import oneInchRoutes from './routes/1inch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/1inch', oneInchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 KATA Protocol Backend running on port ${PORT}`);
  console.log(`📊 1inch API proxy available at http://localhost:${PORT}/api/1inch`);
});

export default app;
