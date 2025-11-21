
import express from 'express';
import cors from 'cors'; 
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './utils/database';
import statsRoutes from './routes/stats';

import authRoutes from './routes/auth';
import leadRoutes from './routes/leads';
import leadListRoutes from './routes/leadLists';
import campaignRoutes from './routes/campaigns';
import emailRoutes from './routes/email';
import trackingRoutes from './routes/tracking';
import settingsRoutes from './routes/settings';

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/lead-lists', leadListRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/track', trackingRoutes); 
app.use('/api/settings', settingsRoutes);
app.use('/api/stats', statsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server only if not in serverless environment
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Backend server running on http://localhost:${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
    });
  }).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default app;