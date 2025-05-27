import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCariHesapSchema, insertYetkiliKisiSchema, insertCariHareketSchema,
  insertTeklifSchema, insertTeklifKalemiSchema, insertProjeSchema, insertGorevSchema,
  cariHesapFormSchema, teklifFormSchema, projeFormSchema, gorevFormSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard istatistikleri
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const { period = 'thisMonth' } = req.query;
      const stats = await storage.getDashboardStats(period as string);
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "İstatistikler yüklenirken hata oluştu" });
    }
  });

  // === CARİ HESAPLAR ===
  
  // Tüm cari hesapları getir
  app.get("/api/cari-hesaplar", async (req, res) => {
    try {
      const { search } = req.query;
      let cariHesaplar;
      
      if (search && typeof search === "string") {
        cariHesaplar = await storage.searchCariHesaplar(search);
      } else {
        cariHesaplar = await storage.getAllCariHesaplar();
      }
      
      res.json(cariHesaplar);
    } catch (error) {
      console.error("Cari hesaplar error:", error);
      res.status(500).json({ message: "Cari hesaplar yüklenirken hata oluştu" });
    }
  });

  // Cari hesap detayı
  app.get("/api/cari-hesaplar/:id", async (req, res) => {
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
    } catch (error) {
      console.error("Cari hesap detay error:", error);
      res.status(500).json({ message: "Cari hesap yüklenirken hata oluştu" });
    }
  });

  // Yeni cari hesap oluştur
  app.post("/api/cari-hesaplar", async (req, res) => {
    try {
      const validatedData = cariHesapFormSchema.parse(req.body);
      const cariHesap = await storage.createCariHesap(validatedData);
      res.status(201).json(cariHesap);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      console.error("Cari hesap oluşturma error:", error);
      res.status(500).json({ message: "Cari hesap oluşturulurken hata oluştu" });
    }
  });

  // Cari hesap güncelle
  app.put("/api/cari-hesaplar/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const validatedData = cariHesapFormSchema.partial().parse(req.body);
      const cariHesap = await storage.updateCariHesap(id, validatedData);
      
      if (!cariHesap) {
        return res.status(404).json({ message: "Cari hesap bulunamadı" });
      }

      res.json(cariHesap);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      console.error("Cari hesap güncelleme error:", error);
      res.status(500).json({ message: "Cari hesap güncellenirken hata oluştu" });
    }
  });

  // Cari hesap sil
  app.delete("/api/cari-hesaplar/:id", async (req, res) => {
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
    } catch (error) {
      console.error("Cari hesap silme error:", error);
      res.status(500).json({ message: "Cari hesap silinirken hata oluştu" });
    }
  });

  // === YETKİLİ KİŞİLER ===
  
  // Cari hesaba ait yetkili kişiler
  app.get("/api/cari-hesaplar/:cariId/yetkili-kisiler", async (req, res) => {
    try {
      const cariId = parseInt(req.params.cariId);
      if (isNaN(cariId)) {
        return res.status(400).json({ message: "Geçersiz cari hesap ID" });
      }

      const yetkiliKisiler = await storage.getYetkiliKisilerByCariId(cariId);
      res.json(yetkiliKisiler);
    } catch (error) {
      console.error("Yetkili kişiler error:", error);
      res.status(500).json({ message: "Yetkili kişiler yüklenirken hata oluştu" });
    }
  });

  // Yeni yetkili kişi ekle
  app.post("/api/yetkili-kisiler", async (req, res) => {
    try {
      const validatedData = insertYetkiliKisiSchema.parse(req.body);
      const yetkiliKisi = await storage.createYetkiliKisi(validatedData);
      res.status(201).json(yetkiliKisi);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      console.error("Yetkili kişi oluşturma error:", error);
      res.status(500).json({ message: "Yetkili kişi oluşturulurken hata oluştu" });
    }
  });

  // === CARİ HAREKETLER ===
  
  // Cari hesaba ait hareketler
  app.get("/api/cari-hesaplar/:cariId/hareketler", async (req, res) => {
    try {
      const cariId = parseInt(req.params.cariId);
      if (isNaN(cariId)) {
        return res.status(400).json({ message: "Geçersiz cari hesap ID" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 25;
      const hareketler = await storage.getCariHareketlerByCariId(cariId, limit);
      res.json(hareketler);
    } catch (error) {
      console.error("Cari hareketler error:", error);
      res.status(500).json({ message: "Cari hareketler yüklenirken hata oluştu" });
    }
  });

  // Yeni cari hareket ekle
  app.post("/api/cari-hareketler", async (req, res) => {
    try {
      const validatedData = insertCariHareketSchema.parse(req.body);
      const hareket = await storage.createCariHareket(validatedData);
      res.status(201).json(hareket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      console.error("Cari hareket oluşturma error:", error);
      res.status(500).json({ message: "Cari hareket oluşturulurken hata oluştu" });
    }
  });

  // === TEKLİFLER ===
  
  // Tüm teklifleri getir
  app.get("/api/teklifler", async (req, res) => {
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
    } catch (error) {
      console.error("Teklifler error:", error);
      res.status(500).json({ message: "Teklifler yüklenirken hata oluştu" });
    }
  });

  // Teklif detayı
  app.get("/api/teklifler/:id", async (req, res) => {
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
    } catch (error) {
      console.error("Teklif detay error:", error);
      res.status(500).json({ message: "Teklif yüklenirken hata oluştu" });
    }
  });

  // Yeni teklif oluştur
  app.post("/api/teklifler", async (req, res) => {
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
      
      const teklif = await storage.createTeklif(validatedTeklifData);
      
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      console.error("Teklif oluşturma error:", error);
      res.status(500).json({ message: "Teklif oluşturulurken hata oluştu" });
    }
  });

  // Teklif güncelle
  app.put("/api/teklifler/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const { kalemler, ...teklifData } = req.body;
      const validatedData = teklifFormSchema.partial().parse(teklifData);
      
      const teklif = await storage.updateTeklif(id, validatedData);
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      console.error("Teklif güncelleme error:", error);
      res.status(500).json({ message: "Teklif güncellenirken hata oluştu" });
    }
  });

  // Teklif sil
  app.delete("/api/teklifler/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      // Önce teklif kalemlerini sil
      await storage.deleteTeklifKalemleriByTeklifId(id);
      
      const deleted = await storage.deleteTeklif(id);
      if (!deleted) {
        return res.status(404).json({ message: "Teklif bulunamadı" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Teklif silme error:", error);
      res.status(500).json({ message: "Teklif silinirken hata oluştu" });
    }
  });

  // === PROJELER ===
  
  // Tüm projeleri getir
  app.get("/api/projeler", async (req, res) => {
    try {
      const { durum, search } = req.query;
      let projeler;
      
      if (search && typeof search === "string") {
        projeler = await storage.searchProjeler(search);
      } else if (durum && typeof durum === "string") {
        projeler = await storage.getProjelerByDurum(durum);
      } else {
        projeler = await storage.getAllProjeler();
      }
      
      res.json(projeler);
    } catch (error) {
      console.error("Projeler error:", error);
      res.status(500).json({ message: "Projeler yüklenirken hata oluştu" });
    }
  });

  // Proje detayı
  app.get("/api/projeler/:id", async (req, res) => {
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
    } catch (error) {
      console.error("Proje detay error:", error);
      res.status(500).json({ message: "Proje yüklenirken hata oluştu" });
    }
  });

  // Yeni proje oluştur
  app.post("/api/projeler", async (req, res) => {
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      console.error("Proje oluşturma error:", error);
      res.status(500).json({ message: "Proje oluşturulurken hata oluştu" });
    }
  });

  // Proje güncelle
  app.put("/api/projeler/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const validatedData = projeFormSchema.partial().parse(req.body);
      const proje = await storage.updateProje(id, validatedData);
      
      if (!proje) {
        return res.status(404).json({ message: "Proje bulunamadı" });
      }

      res.json(proje);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      console.error("Proje güncelleme error:", error);
      res.status(500).json({ message: "Proje güncellenirken hata oluştu" });
    }
  });

  // Proje sil
  app.delete("/api/projeler/:id", async (req, res) => {
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
    } catch (error) {
      console.error("Proje silme error:", error);
      res.status(500).json({ message: "Proje silinirken hata oluştu" });
    }
  });

  // === GÖREVLER ===
  
  // Tüm görevleri getir
  app.get("/api/gorevler", async (req, res) => {
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
    } catch (error) {
      console.error("Görevler error:", error);
      res.status(500).json({ message: "Görevler yüklenirken hata oluştu" });
    }
  });

  // Görev detayı
  app.get("/api/gorevler/:id", async (req, res) => {
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
    } catch (error) {
      console.error("Görev detay error:", error);
      res.status(500).json({ message: "Görev yüklenirken hata oluştu" });
    }
  });

  // Yeni görev oluştur
  app.post("/api/gorevler", async (req, res) => {
    try {
      const validatedData = gorevFormSchema.parse(req.body);
      const gorev = await storage.createGorev(validatedData);
      res.status(201).json(gorev);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      console.error("Görev oluşturma error:", error);
      res.status(500).json({ message: "Görev oluşturulurken hata oluştu" });
    }
  });

  // Görev güncelle
  app.put("/api/gorevler/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ID" });
      }

      const validatedData = gorevFormSchema.partial().parse(req.body);
      const gorev = await storage.updateGorev(id, validatedData);
      
      if (!gorev) {
        return res.status(404).json({ message: "Görev bulunamadı" });
      }

      res.json(gorev);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      console.error("Görev güncelleme error:", error);
      res.status(500).json({ message: "Görev güncellenirken hata oluştu" });
    }
  });

  // Görev sil
  app.delete("/api/gorevler/:id", async (req, res) => {
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
    } catch (error) {
      console.error("Görev silme error:", error);
      res.status(500).json({ message: "Görev silinirken hata oluştu" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}