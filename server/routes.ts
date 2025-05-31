import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage.js";
import {
  insertCariHesapSchema,
  insertYetkiliKisiSchema,
  insertCariHareketSchema,
  insertTeklifSchema,
  insertTeklifKalemiSchema,
  insertProjeSchema,
  insertGorevSchema,
  cariHesapFormSchema,
  teklifFormSchema,
  projeFormSchema,
  gorevFormSchema,
  type InsertCariHesap,
  type InsertTeklif,
  type InsertProje,
  type InsertGorev,
  type InsertYetkiliKisi,
  type InsertCariHareket,
  type Proje
} from "../shared/schema.js";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard istatistikleri
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const { period = 'thisMonth' } = req.query;
      const stats = await storage.getDashboardStats(period as string);
      res.json(stats);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // === CARİ HESAPLAR ===
  
  // Tüm cari hesapları getir
  app.get("/api/cari-hesaplar", async (req: Request, res: Response) => {
    try {
      const { search } = req.query;
      let cariHesaplar;
      
      if (search && typeof search === "string") {
        cariHesaplar = await storage.searchCariHesaplar(search);
      } else {
        cariHesaplar = await storage.getAllCariHesaplar();
      }
      
      res.json(cariHesaplar);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Cari hesap detayı
  app.get("/api/cari-hesaplar/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const cariHesap = await storage.getCariHesapById(id);
      if (!cariHesap) {
        return res.status(404).json({ message: "Cari hesap bulunamadı" });
      }

      res.json(cariHesap);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Yeni cari hesap oluştur
  app.post("/api/cari-hesaplar", async (req: Request, res: Response) => {
    try {
      const validatedData = cariHesapFormSchema.parse(req.body);
      const cariHesap = await storage.createCariHesap(validatedData as InsertCariHesap);
      res.status(201).json(cariHesap);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Cari hesap güncelle
  app.put("/api/cari-hesaplar/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const validatedData = cariHesapFormSchema.partial().parse(req.body);
      const cariHesap = await storage.updateCariHesap(id, validatedData as Partial<InsertCariHesap>);
      
      if (!cariHesap) {
        return res.status(404).json({ message: "Cari hesap bulunamadı" });
      }

      res.json(cariHesap);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Cari hesap sil
  app.delete("/api/cari-hesaplar/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const deleted = await storage.deleteCariHesap(id);
      if (!deleted) {
        return res.status(404).json({ message: "Cari hesap bulunamadı" });
      }

      res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // === YETKİLİ KİŞİLER ===
  
  // Cari hesaba ait yetkili kişiler
  app.get("/api/cari-hesaplar/:cariId/yetkili-kisiler", async (req: Request, res: Response) => {
    try {
      const cariId = parseInt(req.params.cariId);
      if (isNaN(cariId)) {
        return res.status(400).json({ message: "Geçersiz cari hesap ID" });
      }

      const yetkiliKisiler = await storage.getYetkiliKisilerByCariId(cariId);
      res.json(yetkiliKisiler);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Yeni yetkili kişi ekle
  app.post("/api/yetkili-kisiler", async (req: Request, res: Response) => {
    try {
      const { ad, unvan, ...rest } = req.body;
      const validatedData = insertYetkiliKisiSchema.parse({
        ...rest,
        adSoyad: ad,
        gorevi: unvan,
        departman: null
      });
      const yetkiliKisi = await storage.createYetkiliKisi(validatedData);
      res.status(201).json(yetkiliKisi);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // === CARİ HAREKETLER ===
  
  // Cari hesaba ait hareketler
  app.get("/api/cari-hesaplar/:id/hareketler", async (req, res) => {
    try {
      const cariId = parseInt(req.params.id);
      const hareketler = await storage.getCariHareketlerByCariId(cariId);
      res.json(hareketler);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Bilinmeyen bir hata oluştu" });
      }
    }
  });

  // Yeni cari hareket ekle
  app.post("/api/cari-hareketler", async (req: Request, res: Response) => {
    try {
      const { tip, tutar, ...rest } = req.body;
      const validatedData = insertCariHareketSchema.parse({
        ...rest,
        tur: tip,
        tutar: tutar,
        bakiye: tutar, // Initial bakiye is same as tutar
        projeId: null
      });
      const hareket = await storage.createCariHareket(validatedData);
      res.status(201).json(hareket);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // === TEKLİFLER ===
  
  // Tüm teklifleri getir
  app.get("/api/teklifler", async (req: Request, res: Response) => {
    try {
      const { tur, search } = req.query;
      let teklifler;
      
      if (search && typeof search === "string") {
        teklifler = await storage.searchTeklifler(search);
      } else if (tur && typeof tur === "string") {
        teklifler = await storage.getTekliflerByTur(tur);
      } else {
        teklifler = await storage.getAllTeklifler();
      }
      
      res.json(teklifler);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Teklif detayı
  app.get("/api/teklifler/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const teklif = await storage.getTeklifById(id);
      if (!teklif) {
        return res.status(404).json({ message: "Teklif bulunamadı" });
      }

      // Teklif kalemlerini de getir
      const kalemler = await storage.getTeklifKalemleriByTeklifId(id);
      
      res.json({ ...teklif, kalemler });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Yeni teklif oluştur
  app.post("/api/teklifler", async (req: Request, res: Response) => {
    try {
      const { kalemler, ...teklifData } = req.body;
      
      // Teklif numarası otomatik oluştur
      const teklifTuru = teklifData.teklifTuru;
      const prefix = teklifTuru === "Verilen" ? "FT" : "ST";
      
      // En son teklif numarasını bul ve artır
      const existingTeklifler = await storage.getTekliflerByTur(teklifTuru);
      const lastNumber = existingTeklifler
        .map(t => parseInt(t.teklifNo.replace(prefix, "")))
        .filter(n => !isNaN(n))
        .sort((a, b) => b - a)[0] || 0;
      
      const teklifNo = `${prefix}${String(lastNumber + 1).padStart(4, "0")}`;
      
      const validatedTeklifData = teklifFormSchema.parse({
        ...teklifData,
        teklifNo
      });
      
      const teklif = await storage.createTeklif(validatedTeklifData as InsertTeklif);
      
      // Teklif kalemlerini ekle
      if (kalemler && Array.isArray(kalemler)) {
        for (const kalem of kalemler) {
          await storage.createTeklifKalemi({
            ...kalem,
            teklifId: teklif.id
          });
        }
      }
      
      res.status(201).json(teklif);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Teklif güncelle
  app.put("/api/teklifler/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const { kalemler, ...teklifData } = req.body;
      const validatedData = teklifFormSchema.partial().parse(teklifData);
      
      const teklif = await storage.updateTeklif(id, validatedData as Partial<InsertTeklif>);
      if (!teklif) {
        return res.status(404).json({ message: "Teklif bulunamadı" });
      }

      // Eski kalemleri sil ve yenilerini ekle
      if (kalemler && Array.isArray(kalemler)) {
        await storage.deleteTeklifKalemleriByTeklifId(id);
        for (const kalem of kalemler) {
          await storage.createTeklifKalemi({
            ...kalem,
            teklifId: id
          });
        }
      }

      res.json(teklif);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Teklif sil
  app.delete("/api/teklifler/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Önce teklif kalemlerini sil
      const kalemler = await storage.getTeklifKalemleriByTeklifId(id);
      for (const kalem of kalemler) {
        await storage.deleteTeklifKalemi(kalem.id);
      }
      
      const deleted = await storage.deleteTeklif(id);
      if (!deleted) {
        res.status(404).json({ error: "Teklif bulunamadı" });
        return;
      }
      res.json({ success: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Bilinmeyen bir hata oluştu" });
      }
    }
  });

  // === PROJELER ===
  
  // Tüm projeleri getir
  app.get("/api/projeler", async (req: Request, res: Response) => {
    try {
      const { durum, search } = req.query;
      let projeler: Proje[];
      
      if (search && typeof search === "string") {
        projeler = await storage.searchProjeler(search);
      } else if (durum && typeof durum === "string") {
        projeler = await storage.getProjelerByDurum(durum);
      } else {
        projeler = await storage.getAllProjeler();
      }
      
      res.json(projeler);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Proje detayı
  app.get("/api/projeler/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const proje = await storage.getProjeById(id);
      if (!proje) {
        return res.status(404).json({ message: "Proje bulunamadı" });
      }

      res.json(proje);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Yeni proje oluştur
  app.post("/api/projeler", async (req: Request, res: Response) => {
    try {
      // Proje numarası otomatik oluştur
      const existingProjeler = await storage.getAllProjeler();
      const lastNumber = existingProjeler
        .map(p => parseInt(p.projeNo.replace("P", "")))
        .filter(n => !isNaN(n))
        .sort((a, b) => b - a)[0] || 0;
      
      const projeNo = `P${String(lastNumber + 1).padStart(4, "0")}`;
      
      const validatedData = projeFormSchema.parse({
        ...req.body,
        projeNo
      });
      
      const proje = await storage.createProje(validatedData);
      res.status(201).json(proje);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Proje güncelle
  app.put("/api/projeler/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const validatedData = projeFormSchema.parse(req.body);
      
      const updatedProje = await storage.updateProje(id, validatedData);
      if (!updatedProje) {
        return res.status(404).json({ message: "Proje bulunamadı" });
      }

      res.json(updatedProje);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Proje sil
  app.delete("/api/projeler/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const deleted = await storage.deleteProje(id);
      if (!deleted) {
        return res.status(404).json({ message: "Proje bulunamadı" });
      }

      res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // === GÖREVLER ===
  
  // Tüm görevleri getir
  app.get("/api/gorevler", async (req: Request, res: Response) => {
    try {
      const { durum, cariId, projeId, search } = req.query;
      let gorevler;
      
      if (search && typeof search === "string") {
        gorevler = await storage.searchGorevler(search);
      } else if (cariId && typeof cariId === "string") {
        gorevler = await storage.getGorevlerByCariId(parseInt(cariId));
      } else if (projeId && typeof projeId === "string") {
        gorevler = await storage.getGorevlerByProjeId(parseInt(projeId));
      } else if (durum && typeof durum === "string") {
        gorevler = await storage.getGorevlerByDurum(durum);
      } else {
        gorevler = await storage.getAllGorevler();
      }
      
      res.json(gorevler);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Görev detayı
  app.get("/api/gorevler/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const gorev = await storage.getGorevById(id);
      if (!gorev) {
        return res.status(404).json({ message: "Görev bulunamadı" });
      }

      res.json(gorev);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Yeni görev oluştur
  app.post("/api/gorevler", async (req, res) => {
    try {
      const validatedData = gorevFormSchema.parse({
        ...req.body,
        sonTeslimTarihi: req.body.sonTeslimTarihi ? new Date(req.body.sonTeslimTarihi) : undefined,
        baslangicTarihi: new Date(req.body.baslangicTarihi),
        bitisTarihi: req.body.bitisTarihi ? new Date(req.body.bitisTarihi) : undefined
      });

      const gorevData: InsertGorev = {
        ...validatedData,
        sonTeslimTarihi: validatedData.sonTeslimTarihi ?? undefined,
        bitisTarihi: validatedData.bitisTarihi ?? undefined,
        userId: validatedData.userId ?? undefined
      };

      const gorev = await storage.createGorev(gorevData);
      res.status(201).json(gorev);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Bilinmeyen bir hata oluştu" });
      }
    }
  });

  // Görev güncelle
  app.put("/api/gorevler/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const validatedData = gorevFormSchema.partial().parse(req.body);
      const gorev = await storage.updateGorev(id, validatedData as Partial<InsertGorev>);
      
      if (!gorev) {
        return res.status(404).json({ message: "Görev bulunamadı" });
      }

      res.json(gorev);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Görev sil
  app.delete("/api/gorevler/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const deleted = await storage.deleteGorev(id);
      if (!deleted) {
        return res.status(404).json({ message: "Görev bulunamadı" });
      }

      res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}