import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';

dotenv.config();

export const prisma = new PrismaClient();

const app = express();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import vendorRoutes from './routes/vendor';
import reviewRoutes from './routes/reviews';
import couponRoutes from './routes/coupons';
import searchRoutes from './routes/search';
import chatRoutes from './routes/chat';
import notificationRoutes from './routes/notifications';
import seedRoutes from './routes/seed';
import settingsRoutes from './routes/settings';
import { initFirebaseAdmin } from './utils/firebase-admin';
import { createCollection, syncAllProducts } from './utils/typesense';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: `Route not found: ${_req.method} ${_req.originalUrl}` });
});

import { setupSocket } from './sockets';
setupSocket(io);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function start() {
  try {
    await prisma.$connect();
    console.log('[DB] ✅ PostgreSQL connected');
  } catch (error: any) {
    console.warn('[DB] ⚠️ PostgreSQL not available:', error.message);
    console.warn('[DB] Auth & order features will be limited');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[DB] ✅ MongoDB connected');
  } catch (error: any) {
    console.warn('[DB] ⚠️ MongoDB not available:', error.message);
    console.warn('[DB] Product features will be limited');
  }

  initFirebaseAdmin();

  if (process.env.TYPESENSE_API_KEY) {
    try {
      await createCollection();
      await syncAllProducts();
      console.log('[TS] ✅ Typesense ready');
    } catch (err: any) {
      console.warn('[TS] Typesense not available:', err.message);
    }
  } else {
    console.log('[TS] Typesense not configured — using MongoDB search');
  }

  httpServer.listen(PORT, () => {
    console.log(`\n  🚀 ShopHub API Server`);
    console.log(`  ─────────────────────`);
    console.log(`  Port:     ${PORT}`);
    console.log(`  Env:      ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Frontend: http://localhost:3000`);
    console.log(`  API:      http://localhost:${PORT}/api/health\n`);
  });
}

start();

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await mongoose.disconnect();
  process.exit(0);
});
