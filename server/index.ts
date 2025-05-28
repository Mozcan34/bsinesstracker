import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";
import { serveStatic } from "./vite";

const __dirname = process.cwd();

const app = express();

// CORS ve JSON middleware'lerini ekle
app.use(cors());
app.use(express.json());

// Route'ları kaydet
const server = await registerRoutes(app);

// Production modunda statik dosyaları sun
if (process.env.NODE_ENV === 'production') {
  console.log("Production modunda statik dosyalar sunuluyor...");
  serveStatic(app);
}

// Port yapılandırması
const port = parseInt(process.env.PORT || '3000', 10);

// Development ortamı için
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

// Production için
if (process.env.NODE_ENV === 'production') {
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port} in production mode`);
  });
}

export default app;