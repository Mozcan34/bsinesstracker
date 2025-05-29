import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";
import { serveStatic } from "./vite";

const __dirname = process.cwd();

const app = express();

// CORS yapılandırması
const allowedOrigins = [
  'https://turkish-job-connect2-git-main-muhammetozcan34s-projects.vercel.app',
  'https://turkish-job-connect2-o5xzcbpba-muhammetozcan34s-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://turkish-job-connect2.vercel.app'  // Ana domain'i de ekleyelim
];

// Pre-flight istekleri için OPTIONS metodunu ele al
app.options('*', cors());

// CORS middleware yapılandırması
app.use(cors({
  origin: function(origin, callback) {
    // origin undefined ise localhost'tan gelen istek demektir
    // veya allowedOrigins listesinde varsa izin ver
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // Pre-flight sonuçlarını 24 saat önbelleğe al
}));

// Body parser middleware'leri
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Güvenlik başlıkları
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'same-origin');
  next();
});

// Route'ları kaydet
const server = await registerRoutes(app);

// Production modunda statik dosyaları sun
if (process.env.NODE_ENV === 'production') {
  console.log("Production modunda statik dosyalar sunuluyor...");
  serveStatic(app);
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Port yapılandırması
const port = parseInt(process.env.PORT || '3000', 10);

// Development ortamı için
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port} in development mode`);
  });
}

// Production için
if (process.env.NODE_ENV === 'production') {
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port} in production mode`);
  });
}

export default app;