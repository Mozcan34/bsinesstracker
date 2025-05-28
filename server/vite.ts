import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM için __dirname ve __filename oluştur
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "public");
  console.log(`Statik dosyalar şu dizinden sunuluyor: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    console.error(`Derleme dizini bulunamadı: ${distPath}`);
    console.log("Mevcut dizin yapısı:");
    console.log(fs.readdirSync(path.resolve(__dirname, "..")));
    throw new Error(
      `Derleme dizini bulunamadı: ${distPath}, önce istemci kodunu derleyin`
    );
  }

  app.use(express.static(distPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}