import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { commoditiesRouter } from './routes/commodities.js';
import { ordersRouter } from './routes/orders.js';
import { trackingRouter } from './routes/tracking.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { farmerRouter } from './routes/farmer.js';
import { whatsappRouter } from './routes/whatsapp.js';
import { cronService } from './services/cron.service.js';
import { db } from './data/db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// Robust CORS with credential support for web app (5173), mobile preview (5174), and railway
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow all localhost / 127.0.0.1 origins or any Railway origin
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());

// Railway Required Health Check Route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'anvi-mercantile-backend',
    database: db.getDatabaseStatus(),
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// API Root Information
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'Anvi Mercantile B2B Export API',
    version: '1.0.0',
    documentation: 'https://anvimercantile.com',
    endpoints: {
      health: '/health',
      commodities: '/api/commodities',
      orders: '/api/orders',
      tracking: '/api/tracking',
      auth: '/api/auth'
    }
  });
});

// Mount Routes (supporting both /api and /api/v1)
app.use('/api/commodities', commoditiesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/farmer', farmerRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api', whatsappRouter); // For /api/v1/tenants/...

app.use('/api/v1/commodities', commoditiesRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/tracking', trackingRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/farmer', farmerRouter);
app.use('/api/v1/whatsapp', whatsappRouter);

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ANVI-BACKEND] Server listening on port ${PORT}`);
  console.log(`[ANVI-BACKEND] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[ANVI-BACKEND] Health check available at: http://localhost:${PORT}/health`);
  
  // Initialize automated shift report cron
  cronService.init();
});
