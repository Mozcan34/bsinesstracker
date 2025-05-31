import { eq, and, or, like, desc, sql } from "drizzle-orm";
import { db } from "./db.js";
import { 
  cariHesaplar,
  yetkiliKisiler,
  cariHareketler,
  teklifler,
  teklifKalemleri,
  projeler,
  gorevler,
  type CariHesap,
  type YetkiliKisi,
  type CariHareket,
  type Teklif,
  type TeklifKalemi,
  type Proje,
  type Gorev,
  type InsertCariHesap,
  type InsertYetkiliKisi,
  type InsertCariHareket,
  type InsertTeklif,
  type InsertTeklifKalemi,
  type InsertProje,
  type InsertGorev
} from "@shared/schema";

export interface IStorage {
  // Cari Hesap işlemleri
  createCariHesap(data: InsertCariHesap): Promise<CariHesap>;
  getAllCariHesaplar(): Promise<CariHesap[]>;
  getCariHesapById(id: number): Promise<CariHesap | null>;
  updateCariHesap(id: number, data: Partial<InsertCariHesap>): Promise<CariHesap | null>;
  deleteCariHesap(id: number): Promise<boolean>;
  searchCariHesaplar(query: string): Promise<CariHesap[]>;

  // Yetkili Kişi işlemleri
  createYetkiliKisi(data: InsertYetkiliKisi): Promise<YetkiliKisi>;
  getYetkiliKisilerByCariId(cariHesapId: number): Promise<YetkiliKisi[]>;
  updateYetkiliKisi(id: number, data: Partial<InsertYetkiliKisi>): Promise<YetkiliKisi | null>;
  deleteYetkiliKisi(id: number): Promise<boolean>;

  // Cari Hareket işlemleri
  createCariHareket(data: InsertCariHareket): Promise<CariHareket>;
  getCariHareketlerByCariId(cariHesapId: number): Promise<CariHareket[]>;
  updateCariHareket(id: number, data: Partial<InsertCariHareket>): Promise<CariHareket | null>;
  deleteCariHareket(id: number): Promise<boolean>;

  // Teklif işlemleri
  createTeklif(data: InsertTeklif): Promise<Teklif>;
  getAllTeklifler(): Promise<Teklif[]>;
  getTeklifById(id: number): Promise<Teklif | null>;
  updateTeklif(id: number, data: Partial<InsertTeklif>): Promise<Teklif | null>;
  deleteTeklif(id: number): Promise<boolean>;
  searchTeklifler(query: string): Promise<Teklif[]>;
  getTekliflerByTur(tur: string): Promise<Teklif[]>;

  // Teklif Kalemi işlemleri
  createTeklifKalemi(data: InsertTeklifKalemi): Promise<TeklifKalemi>;
  getAllTeklifKalemleri(): Promise<TeklifKalemi[]>;
  getTeklifKalemiById(id: number): Promise<TeklifKalemi | null>;
  updateTeklifKalemi(id: number, data: Partial<InsertTeklifKalemi>): Promise<TeklifKalemi | null>;
  deleteTeklifKalemi(id: number): Promise<boolean>;
  getTeklifKalemleriByTeklifId(teklifId: number): Promise<TeklifKalemi[]>;

  // Proje işlemleri
  createProje(data: InsertProje): Promise<Proje>;
  getAllProjeler(): Promise<Proje[]>;
  getProjeById(id: number): Promise<Proje | null>;
  updateProje(id: number, data: Partial<InsertProje>): Promise<Proje | null>;
  deleteProje(id: number): Promise<boolean>;
  searchProjeler(query: string): Promise<Proje[]>;
  getProjelerByDurum(durum: string): Promise<Proje[]>;

  // Görev işlemleri
  createGorev(data: InsertGorev): Promise<Gorev>;
  getAllGorevler(): Promise<Gorev[]>;
  getGorevById(id: number): Promise<Gorev | null>;
  updateGorev(id: number, data: Partial<InsertGorev>): Promise<Gorev | null>;
  deleteGorev(id: number): Promise<boolean>;
  searchGorevler(query: string): Promise<Gorev[]>;
  getGorevlerByDurum(durum: string): Promise<Gorev[]>;
  getGorevlerByProjeId(projeId: number): Promise<Gorev[]>;
  getGorevlerByCariId(cariHesapId: number): Promise<Gorev[]>;

  // Dashboard işlemleri
  getDashboardStats(period: string): Promise<any>;
  getRecentActivities(limit: number): Promise<any>;
  getUpcomingTasks(limit: number): Promise<any>;

  // Yeni eklenen işlemler
  deleteTeklifKalemleriByTeklifId(teklifId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Cari Hesap işlemleri
  async createCariHesap(data: InsertCariHesap): Promise<CariHesap> {
    const [cariHesap] = await db.insert(cariHesaplar).values({
      ...data,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return {
      ...cariHesap,
      isActive: cariHesap.isActive ?? true,
      createdAt: cariHesap.createdAt ?? new Date(),
      updatedAt: cariHesap.updatedAt ?? new Date()
    } as CariHesap;
  }

  async getAllCariHesaplar(): Promise<CariHesap[]> {
    const result = await db.select().from(cariHesaplar).orderBy(desc(cariHesaplar.createdAt));
    return result.map(item => ({
      ...item,
      isActive: item.isActive ?? true,
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as CariHesap[];
  }

  async getCariHesapById(id: number): Promise<CariHesap | null> {
    const [cariHesap] = await db
      .select()
      .from(cariHesaplar)
      .where(eq(cariHesaplar.id, id));
    return cariHesap ? {
      ...cariHesap,
      isActive: cariHesap.isActive ?? true,
      createdAt: cariHesap.createdAt ?? new Date(),
      updatedAt: cariHesap.updatedAt ?? new Date()
    } as CariHesap : null;
  }

  async updateCariHesap(id: number, data: Partial<InsertCariHesap>): Promise<CariHesap | null> {
    const [updated] = await db
      .update(cariHesaplar)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(cariHesaplar.id, id))
      .returning();
    return updated ? {
      ...updated,
      isActive: updated.isActive ?? true,
      createdAt: updated.createdAt ?? new Date(),
      updatedAt: updated.updatedAt ?? new Date()
    } as CariHesap : null;
  }

  async deleteCariHesap(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(cariHesaplar)
      .where(eq(cariHesaplar.id, id))
      .returning();
    return !!deleted;
  }

  async searchCariHesaplar(query: string): Promise<CariHesap[]> {
    const result = await db
      .select()
      .from(cariHesaplar)
      .where(
        or(
          like(cariHesaplar.firmaAdi, `%${query}%`),
          like(cariHesaplar.vergiNo, `%${query}%`)
        )
      )
      .orderBy(desc(cariHesaplar.createdAt));
    return result.map(item => ({
      ...item,
      isActive: item.isActive ?? true,
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as CariHesap[];
  }

  // Yetkili Kişi işlemleri
  async createYetkiliKisi(data: InsertYetkiliKisi): Promise<YetkiliKisi> {
    const [yetkiliKisi] = await db.insert(yetkiliKisiler).values(data).returning();
    return yetkiliKisi;
  }

  async getYetkiliKisilerByCariId(cariHesapId: number): Promise<YetkiliKisi[]> {
    return db
      .select()
      .from(yetkiliKisiler)
      .where(eq(yetkiliKisiler.cariHesapId, cariHesapId))
      .orderBy(desc(yetkiliKisiler.createdAt));
  }

  async updateYetkiliKisi(id: number, data: Partial<InsertYetkiliKisi>): Promise<YetkiliKisi | null> {
    const [updated] = await db
      .update(yetkiliKisiler)
      .set(data)
      .where(eq(yetkiliKisiler.id, id))
      .returning();
    return updated || null;
  }

  async deleteYetkiliKisi(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(yetkiliKisiler)
      .where(eq(yetkiliKisiler.id, id))
      .returning();
    return !!deleted;
  }

  // Cari Hareket işlemleri
  async createCariHareket(data: InsertCariHareket): Promise<CariHareket> {
    const [cariHareket] = await db.insert(cariHareketler).values(data).returning();
    return cariHareket;
  }

  async getCariHareketlerByCariId(cariHesapId: number): Promise<CariHareket[]> {
    return db
      .select()
      .from(cariHareketler)
      .where(eq(cariHareketler.cariHesapId, cariHesapId))
      .orderBy(desc(cariHareketler.createdAt));
  }

  async updateCariHareket(id: number, data: Partial<InsertCariHareket>): Promise<CariHareket | null> {
    const [updated] = await db
      .update(cariHareketler)
      .set(data)
      .where(eq(cariHareketler.id, id))
      .returning();
    return updated || null;
  }

  async deleteCariHareket(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(cariHareketler)
      .where(eq(cariHareketler.id, id))
      .returning();
    return !!deleted;
  }

  // Teklif işlemleri
  async createTeklif(data: InsertTeklif): Promise<Teklif> {
    const [teklif] = await db.insert(teklifler).values({
      ...data,
      tarih: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return {
      ...teklif,
      tarih: teklif.tarih ?? new Date(),
      createdAt: teklif.createdAt ?? new Date(),
      updatedAt: teklif.updatedAt ?? new Date()
    } as Teklif;
  }

  async getAllTeklifler(): Promise<Teklif[]> {
    const result = await db.select().from(teklifler).orderBy(desc(teklifler.createdAt));
    return result.map(item => ({
      ...item,
      tarih: item.tarih ?? new Date(),
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as Teklif[];
  }

  async getTeklifById(id: number): Promise<Teklif | null> {
    const [teklif] = await db
      .select()
      .from(teklifler)
      .where(eq(teklifler.id, id));
    return teklif ? {
      ...teklif,
      tarih: teklif.tarih ?? new Date(),
      createdAt: teklif.createdAt ?? new Date(),
      updatedAt: teklif.updatedAt ?? new Date()
    } as Teklif : null;
  }

  async updateTeklif(id: number, data: Partial<InsertTeklif>): Promise<Teklif | null> {
    const [updated] = await db
      .update(teklifler)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(teklifler.id, id))
      .returning();
    return updated ? {
      ...updated,
      tarih: updated.tarih ?? new Date(),
      createdAt: updated.createdAt ?? new Date(),
      updatedAt: updated.updatedAt ?? new Date()
    } as Teklif : null;
  }

  async deleteTeklif(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(teklifler)
      .where(eq(teklifler.id, id))
      .returning();
    return !!deleted;
  }

  async searchTeklifler(query: string): Promise<Teklif[]> {
    const result = await db
      .select()
      .from(teklifler)
      .where(
        or(
          like(teklifler.teklifNo, `%${query}%`),
          like(teklifler.teklifKonusu, `%${query}%`)
        )
      )
      .orderBy(desc(teklifler.createdAt));
    return result.map(item => ({
      ...item,
      tarih: item.tarih ?? new Date(),
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as Teklif[];
  }

  async getTekliflerByTur(tur: string): Promise<Teklif[]> {
    const result = await db
      .select()
      .from(teklifler)
      .where(eq(teklifler.teklifTuru, tur))
      .orderBy(desc(teklifler.createdAt));
    return result.map(item => ({
      ...item,
      tarih: item.tarih ?? new Date(),
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as Teklif[];
  }

  // Teklif Kalemi işlemleri
  async createTeklifKalemi(data: InsertTeklifKalemi): Promise<TeklifKalemi> {
    const [teklifKalemi] = await db.insert(teklifKalemleri).values({
      ...data,
      createdAt: new Date()
    }).returning();
    return {
      ...teklifKalemi,
      createdAt: teklifKalemi.createdAt ?? new Date()
    } as TeklifKalemi;
  }

  async getAllTeklifKalemleri(): Promise<TeklifKalemi[]> {
    const result = await db.select().from(teklifKalemleri).orderBy(desc(teklifKalemleri.createdAt));
    return result.map(item => ({
      ...item,
      createdAt: item.createdAt ?? new Date()
    })) as TeklifKalemi[];
  }

  async getTeklifKalemiById(id: number): Promise<TeklifKalemi | null> {
    const [teklifKalemi] = await db
      .select()
      .from(teklifKalemleri)
      .where(eq(teklifKalemleri.id, id));
    return teklifKalemi ? {
      ...teklifKalemi,
      createdAt: teklifKalemi.createdAt ?? new Date()
    } as TeklifKalemi : null;
  }

  async updateTeklifKalemi(id: number, data: Partial<InsertTeklifKalemi>): Promise<TeklifKalemi | null> {
    const [updated] = await db
      .update(teklifKalemleri)
      .set(data)
      .where(eq(teklifKalemleri.id, id))
      .returning();
    return updated ? {
      ...updated,
      createdAt: updated.createdAt ?? new Date()
    } as TeklifKalemi : null;
  }

  async deleteTeklifKalemi(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(teklifKalemleri)
      .where(eq(teklifKalemleri.id, id))
      .returning();
    return !!deleted;
  }

  async getTeklifKalemleriByTeklifId(teklifId: number): Promise<TeklifKalemi[]> {
    const result = await db
      .select()
      .from(teklifKalemleri)
      .where(eq(teklifKalemleri.teklifId, teklifId))
      .orderBy(teklifKalemleri.id);
    return result.map(item => ({
      ...item,
      createdAt: item.createdAt ?? new Date()
    })) as TeklifKalemi[];
  }

  // Proje işlemleri
  async createProje(data: InsertProje): Promise<Proje> {
    const [proje] = await db.insert(projeler).values({
      ...data,
      projeDurumu: data.projeDurumu as "Devam Ediyor" | "Tamamlandı" | "İptal" | "Beklemede",
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return {
      ...proje,
      projeDurumu: proje.projeDurumu as "Devam Ediyor" | "Tamamlandı" | "İptal" | "Beklemede",
      createdAt: proje.createdAt ?? new Date(),
      updatedAt: proje.updatedAt ?? new Date()
    } as Proje;
  }

  async getAllProjeler(): Promise<Proje[]> {
    const result = await db.select().from(projeler).orderBy(desc(projeler.createdAt));
    return result.map(item => ({
      ...item,
      projeDurumu: item.projeDurumu as "Devam Ediyor" | "Tamamlandı" | "İptal" | "Beklemede",
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as Proje[];
  }

  async getProjeById(id: number): Promise<Proje | null> {
    const [proje] = await db
      .select()
      .from(projeler)
      .where(eq(projeler.id, id));
    return proje ? {
      ...proje,
      projeDurumu: proje.projeDurumu as "Devam Ediyor" | "Tamamlandı" | "İptal" | "Beklemede",
      createdAt: proje.createdAt ?? new Date(),
      updatedAt: proje.updatedAt ?? new Date()
    } as Proje : null;
  }

  async updateProje(id: number, data: Partial<InsertProje>): Promise<Proje | null> {
    const [updated] = await db
      .update(projeler)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(projeler.id, id))
      .returning();
    return updated ? {
      ...updated,
      projeDurumu: updated.projeDurumu as "Devam Ediyor" | "Tamamlandı" | "İptal" | "Beklemede",
      createdAt: updated.createdAt ?? new Date(),
      updatedAt: updated.updatedAt ?? new Date()
    } as Proje : null;
  }

  async deleteProje(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(projeler)
      .where(eq(projeler.id, id))
      .returning();
    return !!deleted;
  }

  async searchProjeler(query: string): Promise<Proje[]> {
    const result = await db
      .select()
      .from(projeler)
      .where(
        or(
          like(projeler.projeNo, `%${query}%`),
          like(projeler.projeAdi, `%${query}%`)
        )
      )
      .orderBy(desc(projeler.createdAt));
    return result.map(item => ({
      ...item,
      projeDurumu: item.projeDurumu as "Devam Ediyor" | "Tamamlandı" | "İptal" | "Beklemede",
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as Proje[];
  }

  async getProjelerByDurum(durum: string): Promise<Proje[]> {
    const result = await db
      .select()
      .from(projeler)
      .where(eq(projeler.projeDurumu, durum))
      .orderBy(desc(projeler.createdAt));
    return result.map(item => ({
      ...item,
      projeDurumu: item.projeDurumu as "Devam Ediyor" | "Tamamlandı" | "İptal" | "Beklemede",
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as Proje[];
  }

  // Görev işlemleri
  async createGorev(data: InsertGorev): Promise<Gorev> {
    const [gorev] = await db.insert(gorevler).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return {
      ...gorev,
      createdAt: gorev.createdAt ?? new Date(),
      updatedAt: gorev.updatedAt ?? new Date()
    } as Gorev;
  }

  async getAllGorevler(): Promise<Gorev[]> {
    const result = await db.select().from(gorevler).orderBy(desc(gorevler.createdAt));
    return result.map(item => ({
      ...item,
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as Gorev[];
  }

  async getGorevById(id: number): Promise<Gorev | null> {
    const [gorev] = await db
      .select()
      .from(gorevler)
      .where(eq(gorevler.id, id));
    return gorev ? {
      ...gorev,
      createdAt: gorev.createdAt ?? new Date(),
      updatedAt: gorev.updatedAt ?? new Date()
    } as Gorev : null;
  }

  async updateGorev(id: number, data: Partial<InsertGorev>): Promise<Gorev | null> {
    const [updated] = await db
      .update(gorevler)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(gorevler.id, id))
      .returning();
    return updated ? {
      ...updated,
      createdAt: updated.createdAt ?? new Date(),
      updatedAt: updated.updatedAt ?? new Date()
    } as Gorev : null;
  }

  async deleteGorev(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(gorevler)
      .where(eq(gorevler.id, id))
      .returning();
    return !!deleted;
  }

  async searchGorevler(query: string): Promise<Gorev[]> {
    const result = await db
      .select()
      .from(gorevler)
      .where(
        or(
          like(gorevler.baslik, `%${query}%`),
          like(gorevler.aciklama, `%${query}%`)
        )
      )
      .orderBy(desc(gorevler.createdAt));
    
    return result.map(item => ({
      ...item,
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as Gorev[];
  }

  async getGorevlerByDurum(durum: string): Promise<Gorev[]> {
    const result = await db
      .select()
      .from(gorevler)
      .where(eq(gorevler.durum, durum))
      .orderBy(desc(gorevler.createdAt));
    return result.map(item => ({
      ...item,
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as Gorev[];
  }

  async getGorevlerByProjeId(projeId: number): Promise<Gorev[]> {
    const result = await db
      .select()
      .from(gorevler)
      .where(eq(gorevler.projeId, projeId))
      .orderBy(desc(gorevler.createdAt));
    return result.map(item => ({
      ...item,
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as Gorev[];
  }

  async getGorevlerByCariId(cariHesapId: number): Promise<Gorev[]> {
    const result = await db
      .select()
      .from(gorevler)
      .where(eq(gorevler.cariHesapId, cariHesapId))
      .orderBy(desc(gorevler.createdAt));
    return result.map(item => ({
      ...item,
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date()
    })) as Gorev[];
  }

  // Dashboard işlemleri
  async getDashboardStats(period: string = "week"): Promise<any> {
    const startDate = new Date();
    if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setDate(startDate.getDate() - 7);
    }

    const [[{ count: cariHesapCount }], [{ count: teklifCount }], [{ count: projeCount }], [{ count: gorevCount }]] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(cariHesaplar)
        .where(sql`created_at >= ${startDate}`),
      db.select({ count: sql<number>`count(*)` }).from(teklifler)
        .where(sql`created_at >= ${startDate}`),
      db.select({ count: sql<number>`count(*)` }).from(projeler)
        .where(sql`created_at >= ${startDate}`),
      db.select({ count: sql<number>`count(*)` }).from(gorevler)
        .where(sql`created_at >= ${startDate}`)
    ]);

    return {
      cariHesapCount: cariHesapCount || 0,
      teklifCount: teklifCount || 0,
      projeCount: projeCount || 0,
      gorevCount: gorevCount || 0
    };
  }

  async getRecentActivities(limit: number = 10): Promise<any> {
    const activities = await Promise.all([
      db.select().from(cariHesaplar).limit(limit).orderBy(desc(cariHesaplar.createdAt)),
      db.select().from(teklifler).limit(limit).orderBy(desc(teklifler.createdAt)),
      db.select().from(projeler).limit(limit).orderBy(desc(projeler.createdAt)),
      db.select().from(gorevler).limit(limit).orderBy(desc(gorevler.createdAt))
    ]);

    return activities.flat()
      .filter(activity => activity.createdAt)
      .sort((a, b) => 
        (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
      )
      .slice(0, limit);
  }

  async getUpcomingTasks(limit: number = 5): Promise<any> {
    const tasks = await db
      .select()
      .from(gorevler)
      .where(
        and(
          sql`durum != 'Tamamlandı'`,
          sql`son_teslim_tarihi >= CURRENT_DATE`
        )
      )
      .orderBy(gorevler.sonTeslimTarihi)
      .limit(limit);
    
    return tasks.map(task => ({
      ...task,
      createdAt: task.createdAt ?? new Date(),
      updatedAt: task.updatedAt ?? new Date()
    }));
  }

  // Yeni eklenen işlemler
  async deleteTeklifKalemleriByTeklifId(teklifId: number): Promise<boolean> {
    const [deleted] = await db
      .delete(teklifKalemleri)
      .where(eq(teklifKalemleri.teklifId, teklifId))
      .returning();
    return !!deleted;
  }
}

export const storage = new DatabaseStorage();