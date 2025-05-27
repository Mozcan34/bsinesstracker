` tags.

```text
Updated port configuration in server/index.ts to use port 5000 and listen on all interfaces.
```

```
<replit_final_file>
import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

const app = express();

// CORS ve JSON middleware'lerini ekle
app.use(cors());
app.use(express.json());

// Route'ları kaydet
registerRoutes(app);

// Development ortamı için
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

// Vercel için export
export default app;