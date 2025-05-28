import express, { type Express } from "express";
import fs from "fs";
import path from "path";

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
  // Projenin kök dizinindeki 'public' klasörünü kullan
  const distPath = path.resolve(process.cwd(), 'public');
  console.log(`Statik dosyalar şu dizinden sunuluyor: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    console.error(`Derleme dizini bulunamadı: ${distPath}`);
    console.log("Mevcut dizin yapısı:");
    console.log(fs.readdirSync(path.resolve(process.cwd())));
    throw new Error(
      `Derleme dizini bulunamadı: ${distPath}, önce istemci kodunu derleyin`
    );
  }

  app.use(express.static(distPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}