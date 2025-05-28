import {
  users, User, InsertUser,
  cariHesaplar, CariHesap, InsertCariHesap,
  cariHareketler, CariHareket, InsertCariHareket,
  teklifler, Teklif, InsertTeklif,
  teklifKalemleri, TeklifKalemi, InsertTeklifKalemi,
  projeler, Proje, InsertProje,
  gorevler, Gorev, InsertGorev,
  yetkiliKisiler, YetkiliKisi, InsertYetkiliKisi
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";
import { SQL } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  private getDbInstance() {
    return db;
  }

  // Cari Hesaplar
  async getAllCariHesaplar(): Promise<CariHesap[]> {
    return await this.getDbInstance().select().from(cariHesaplar);
  }

  async getCariHesapById(id: number): Promise<CariHesap | undefined> {
    const [account] = await this.getDbInstance().select().from(cariHesaplar).where(eq(cariHesaplar.id, id));
    return account;
  }

  async createCariHesap(data: InsertCariHesap): Promise<CariHesap> {
    const [created] = await this.getDbInstance().insert(cariHesaplar).values({
      firmaAdi: data.firmaAdi,
      firmaTuru: data.firmaTuru,
      subeBolge: data.subeBolge || null,
      telefon: data.telefon || null,
      email: data.email || null,
      adres: data.adres || null,
      vergiNo: data.vergiNo || null,
      vergiDairesi: data.vergiDairesi || null,
      notlar: data.notlar || null,
      isActive: true
    }).returning();
    return created;
  }

  async updateCariHesap(id: number, data: Partial<InsertCariHesap>): Promise<CariHesap | undefined> {
    const [updated] = await this.getDbInstance()
      .update(cariHesaplar)
      .set(data)
      .where(eq(cariHesaplar.id, id))
      .returning();
    return updated;
  }

  async deleteCariHesap(id: number): Promise<boolean> {
    await this.getDbInstance().delete(cariHesaplar).where(eq(cariHesaplar.id, id));
    return true;
  }

  async searchCariHesaplar(query: string): Promise<CariHesap[]> {
    const lowerQuery = query.toLowerCase();
    const results = await this.getDbInstance().select().from(cariHesaplar);
    return results.filter(c => 
      c.firmaAdi.toLowerCase().includes(lowerQuery) ||
      c.subeBolge?.toLowerCase().includes(lowerQuery) ||
      c.telefon?.toLowerCase().includes(lowerQuery) ||
      c.email?.toLowerCase().includes(lowerQuery)
    );
  }

  // Yetkili Kişiler
  async getYetkiliKisilerByCariId(cariHesapId: number): Promise<YetkiliKisi[]> {
    return await this.getDbInstance()
      .select()
      .from(yetkiliKisiler)
      .where(eq(yetkiliKisiler.cariHesapId, cariHesapId));
  }

  async createYetkiliKisi(data: InsertYetkiliKisi): Promise<YetkiliKisi> {
    const [created] = await this.getDbInstance().insert(yetkiliKisiler).values({
      cariHesapId: data.cariHesapId,
      adSoyad: data.adSoyad,
      gorevi: data.gorevi || null,
      telefon: data.telefon || null,
      email: data.email || null,
      departman: data.departman || null
    }).returning();
    return {
      ...created,
      createdAt: new Date(created.createdAt),
      updatedAt: new Date(created.updatedAt)
    };
  }

  async updateYetkiliKisi(id: number, data: Partial<InsertYetkiliKisi>): Promise<YetkiliKisi | undefined> {
    const [updated] = await this.getDbInstance()
      .update(yetkiliKisiler)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(yetkiliKisiler.id, id))
      .returning();
    if (!updated) return undefined;
    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt)
    };
  }

  async deleteYetkiliKisi(id: number): Promise<boolean> {
    await this.getDbInstance().delete(yetkiliKisiler).where(eq(yetkiliKisiler.id, id));
    return true;
  }

  // Cari Hareketler
  async getCariHareketlerByCariId(cariHesapId: number, limit: number = 25): Promise<CariHareket[]> {
    return await this.getDbInstance()
      .select()
      .from(cariHareketler)
      .where(eq(cariHareketler.cariHesapId, cariHesapId))
      .limit(limit);
  }

  async createCariHareket(data: InsertCariHareket): Promise<CariHareket> {
    const [created] = await this.getDbInstance().insert(cariHareketler).values({
      cariHesapId: data.cariHesapId,
      tarih: data.tarih,
      aciklama: data.aciklama,
      tur: data.tur,
      tutar: data.tutar,
      bakiye: data.bakiye,
      projeId: data.projeId || null
    }).returning();
    return created;
  }

  // Teklifler
  async getAllTeklifler(): Promise<Teklif[]> {
    return await this.getDbInstance().select().from(teklifler);
  }

  async getTeklifById(id: number): Promise<Teklif | undefined> {
    const [quote] = await this.getDbInstance().select().from(teklifler).where(eq(teklifler.id, id));
    return quote;
  }

  async createTeklif(data: InsertTeklif): Promise<Teklif> {
    const [created] = await this.getDbInstance().insert(teklifler).values({
      cariHesapId: data.cariHesapId,
      yetkiliKisiId: data.yetkiliKisiId || null,
      teklifNo: data.teklifNo,
      teklifTuru: data.teklifTuru,
      teklifKonusu: data.teklifKonusu,
      teklifDurumu: data.teklifDurumu || null,
      odemeSekli: data.odemeSekli || null,
      gecerlilikSuresi: data.gecerlilikSuresi || null,
      paraBirimi: data.paraBirimi || null,
      toplamTutar: data.toplamTutar || null,
      notlar: data.notlar || null,
      dosyalar: data.dosyalar || null,
      tarih: data.tarih
    } as InsertTeklif).returning();
    return created;
  }

  async updateTeklif(id: number, data: Partial<InsertTeklif>): Promise<Teklif | undefined> {
    const [updated] = await this.getDbInstance()
      .update(teklifler)
      .set(data)
      .where(eq(teklifler.id, id))
      .returning();
    return updated;
  }

  async deleteTeklif(id: number): Promise<boolean> {
    await this.getDbInstance().delete(teklifler).where(eq(teklifler.id, id));
    return true;
  }

  async getTekliflerByTur(tur: string): Promise<Teklif[]> {
    return await this.getDbInstance()
      .select()
      .from(teklifler)
      .where(eq(teklifler.teklifTuru, tur));
  }

  async searchTeklifler(query: string): Promise<Teklif[]> {
    const lowerQuery = query.toLowerCase();
    const results = await this.getDbInstance().select().from(teklifler);
    return results.filter(t => 
      t.teklifNo.toLowerCase().includes(lowerQuery) ||
      t.teklifKonusu.toLowerCase().includes(lowerQuery)
    );
  }

  // Teklif Kalemleri
  async getTeklifKalemleriByTeklifId(teklifId: number): Promise<TeklifKalemi[]> {
    return await this.getDbInstance()
      .select()
      .from(teklifKalemleri)
      .where(eq(teklifKalemleri.teklifId, teklifId));
  }

  async createTeklifKalemi(data: InsertTeklifKalemi): Promise<TeklifKalemi> {
    const [created] = await this.getDbInstance().insert(teklifKalemleri).values({
      teklifId: data.teklifId,
      urunHizmetAdi: data.urunHizmetAdi,
      miktar: data.miktar,
      birim: data.birim,
      birimFiyat: data.birimFiyat,
      tutar: data.tutar,
      iskontoTutari: data.iskontoTutari || null,
      netTutar: data.netTutar,
      kdvOrani: data.kdvOrani || null,
      toplamTutar: data.toplamTutar
    }).returning();
    return created;
  }

  async deleteTeklifKalemleriByTeklifId(teklifId: number): Promise<boolean> {
    await this.getDbInstance().delete(teklifKalemleri).where(eq(teklifKalemleri.teklifId, teklifId));
    return true;
  }

  // Projeler
  async getAllProjeler(): Promise<Proje[]> {
    return await this.getDbInstance().select().from(projeler);
  }

  async getProjeById(id: number): Promise<Proje | undefined> {
    const [project] = await this.getDbInstance().select().from(projeler).where(eq(projeler.id, id));
    return project;
  }

  async createProje(data: InsertProje): Promise<Proje> {
    const [created] = await this.getDbInstance().insert(projeler).values({
      cariHesapId: data.cariHesapId,
      teklifId: data.teklifId || null,
      projeNo: data.projeNo,
      projeAdi: data.projeAdi,
      projeDurumu: data.projeDurumu || null,
      projeTarihi: data.projeTarihi,
      sonTeslimTarihi: data.sonTeslimTarihi || null,
      butce: data.butce || null,
      harcananTutar: data.harcananTutar || null,
      tamamlanmaOrani: data.tamamlanmaOrani || null,
      sorumluKisi: data.sorumluKisi || null,
      aciklama: data.aciklama || null,
      notlar: data.notlar || null,
      dosyalar: data.dosyalar || null
    } as InsertProje).returning();
    return created;
  }

  async updateProje(id: number, data: Partial<InsertProje>): Promise<Proje | undefined> {
    const [updated] = await this.getDbInstance()
      .update(projeler)
      .set(data)
      .where(eq(projeler.id, id))
      .returning();
    return updated;
  }

  async deleteProje(id: number): Promise<boolean> {
    await this.getDbInstance().delete(projeler).where(eq(projeler.id, id));
    return true;
  }

  async getProjelerByDurum(durum: string): Promise<Proje[]> {
    return await this.getDbInstance()
      .select()
      .from(projeler)
      .where(eq(projeler.projeDurumu, durum));
  }

  async searchProjeler(query: string): Promise<Proje[]> {
    const lowerQuery = query.toLowerCase();
    const results = await this.getDbInstance().select().from(projeler);
    return results.filter(p => 
      p.projeNo.toLowerCase().includes(lowerQuery) ||
      p.projeAdi.toLowerCase().includes(lowerQuery) ||
      p.aciklama?.toLowerCase().includes(lowerQuery)
    );
  }

  // Görevler
  async getAllGorevler(): Promise<Gorev[]> {
    return await this.getDbInstance().select().from(gorevler);
  }

  async getGorevById(id: number): Promise<Gorev | undefined> {
    const [task] = await this.getDbInstance().select().from(gorevler).where(eq(gorevler.id, id));
    return task;
  }

  async createGorev(data: InsertGorev): Promise<Gorev> {
    const [created] = await this.getDbInstance().insert(gorevler).values({
      baslik: data.baslik,
      aciklama: data.aciklama || null,
      durum: data.durum || null,
      oncelik: data.oncelik || null,
      baslangicTarihi: data.baslangicTarihi || null,
      bitisTarihi: data.bitisTarihi || null,
      sonTeslimTarihi: data.sonTeslimTarihi || null,
      atananKisi: data.atananKisi || null,
      cariHesapId: data.cariHesapId || null,
      projeId: data.projeId || null,
      userId: data.userId || null,
      siralama: data.siralama || 0,
      etiketler: data.etiketler || null,
      dosyalar: data.dosyalar || null
    } as InsertGorev).returning();
    return created;
  }

  async updateGorev(id: number, data: Partial<InsertGorev>): Promise<Gorev | undefined> {
    const [updated] = await this.getDbInstance()
      .update(gorevler)
      .set(data)
      .where(eq(gorevler.id, id))
      .returning();
    return updated;
  }

  async deleteGorev(id: number): Promise<boolean> {
    await this.getDbInstance().delete(gorevler).where(eq(gorevler.id, id));
    return true;
  }

  async getGorevlerByDurum(durum: string): Promise<Gorev[]> {
    return await this.getDbInstance()
      .select()
      .from(gorevler)
      .where(eq(gorevler.durum, durum));
  }

  async getGorevlerByCariId(cariHesapId: number): Promise<Gorev[]> {
    return await this.getDbInstance()
      .select()
      .from(gorevler)
      .where(eq(gorevler.cariHesapId, cariHesapId));
  }

  async getGorevlerByProjeId(projeId: number): Promise<Gorev[]> {
    return await this.getDbInstance()
      .select()
      .from(gorevler)
      .where(eq(gorevler.projeId, projeId));
  }

  async searchGorevler(query: string): Promise<Gorev[]> {
    const lowerQuery = query.toLowerCase();
    const results = await this.getDbInstance().select().from(gorevler);
    return results.filter(g => 
      g.baslik.toLowerCase().includes(lowerQuery) ||
      g.aciklama?.toLowerCase().includes(lowerQuery) ||
      g.atananKisi?.toLowerCase().includes(lowerQuery)
    );
  }

  async getDashboardStats(period: string = 'thisMonth'): Promise<any> {
    // Bu metodu daha sonra implement edeceğiz
    return {};
  }
}