import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import { handleWebhook } from './controllers/paymentController.js';
import { streamStoredFile } from './middleware/uploadMiddleware.js';

const app = express();

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Cashfree & Razorpay Webhook routes (capture raw body for signature verification)
app.post(
  '/api/webhooks/cashfree',
  express.raw({ type: 'application/json' }),
  handleWebhook
);
app.post(
  '/api/webhooks/razorpay',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Standard JSON and URL-encoded body parser with UTF-8 character support
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded public media (photos, audio clips) from Cloud Storage.
// Filenames are unique, so Firebase Hosting's CDN may cache them indefinitely.
// KYC documents live under kyc/ and are only reachable via /api/admin/documents.
app.get('/uploads/media/:filename', async (req, res, next) => {
  try {
    const found = await streamStoredFile('media', req.params.filename, res, {
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    });
    if (!found) res.status(404).json({ success: false, message: 'File not found.' });
  } catch (err) {
    next(err);
  }
});

// Chrome DevTools probe handler to prevent 404 and CSP console warnings
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

// Root welcome & API info endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Tamil Muslim Nikkah API Backend',
    status: 'online',
    message: 'Welcome to Tamil Muslim Nikkah API.',
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
  // Multer errors (file too large, too many files) are client errors
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
