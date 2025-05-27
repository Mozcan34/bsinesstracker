import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

const app = express();

// CORS ve JSON middleware'lerini ekle
app.use(cors());
app.use(express.json());

// Route'ları kaydet
registerRoutes(app);

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
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port} in production mode`);
  });
}

export default app; 