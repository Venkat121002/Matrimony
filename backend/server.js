import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import { handleWebhook } from './controllers/paymentController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Special Webhook route (captures raw body for crypto HMAC signature verification)
app.post(
  '/api/webhooks/razorpay',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Standard JSON and URL-encoded body parser with UTF-8 character support
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded public media (photos, audio clips) with inline content disposition
app.use(
  '/uploads',
  express.static(path.resolve(__dirname, 'uploads'), {
    setHeaders: (res) => {
      res.setHeader('Content-Disposition', 'inline');
    },
  })
);

// Chrome DevTools probe handler to prevent 404 and CSP console warnings
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

// Root welcome & API info endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Tamil Muslim Nikkah API Backend',
    status: 'online',
    frontend: 'http://localhost:5173',
    message: 'Welcome to Tamil Muslim Nikkah API. For the website, open http://localhost:5173 in your browser.',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      profiles: '/api/profiles',
      payment: '/api/payment',
      admin: '/api/admin',
      support: '/api/support',
    },
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Tamil Muslim Nikkah API',
    utf8Test: 'தமிழ் வாழ்க (Tamil UTF-8 Supported)',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Connect to Database and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Tamil Muslim Nikkah Server] Running on http://localhost:${PORT}`);
      console.log(`[API Endpoints] /api/auth, /api/profiles, /api/payment, /api/admin, /api/support`);
    });
  })
  .catch((err) => {
    console.error('[Database Fatal Error]: Failed to start server:', err);
  });

export default app;
