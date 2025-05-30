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
import { eq, InferInsertModel } from "drizzle-orm";
import { IStorage } from "./storage";
import { SQL } from "drizzle-orm";

// Helper function to remove undefined properties from an object
function removeUndefinedProps<T extends Record<string, any>>(obj: T): T {
  const newObj = { ...obj };
  for (const key in newObj) {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  }
  return newObj;
}

export class DatabaseStorage implements IStorage {
  private getDbInstance() {
    return db;
  }

  // Cari Hesaplar
  async getAllCariHesaplar(): Promise<CariHesap[]> {
    const results = await this.getDbInstance().select().from(cariHesaplar);
    return results.map(r => ({
      id: r.id,
      firmaAdi: r.firmaAdi,
      firmaTuru: r.firmaTuru,
      subeBolge: r.subeBolge,
      vergiDairesi: r.vergiDairesi,
      vergiNo: r.vergiNo,
      adres: r.adres,
      telefon: r.telefon,
      email: r.email,
      notlar: r.notlar,
      isActive: r.isActive ?? true,
      createdAt: r.createdAt ?? new Date(),
      updatedAt: r.updatedAt ?? new Date()
    }));
  }

  async getCariHesapById(id: number): Promise<CariHesap | undefined> {
    const [result] = await this.getDbInstance().select().from(cariHesaplar).where(eq(cariHesaplar.id, id));
    if (!result) return undefined;
    return {
      id: result.id,
      firmaAdi: result.firmaAdi,
      firmaTuru: result.firmaTuru,
      subeBolge: result.subeBolge,
      vergiDairesi: result.vergiDairesi,
      vergiNo: result.vergiNo,
      adres: result.adres,
      telefon: result.telefon,
      email: result.email,
      notlar: result.notlar,
      isActive: result.isActive ?? true,
      createdAt: result.createdAt ?? new Date(),
      updatedAt: result.updatedAt ?? new Date()
    };
  }

  async createCariHesap(data: InsertCariHesap): Promise<CariHesap> {
    const [created] = await this.getDbInstance().insert(cariHesaplar).values({
      firmaAdi: data.firmaAdi,
      firmaTuru: data.firmaTuru,
      subeBolge: data.subeBolge ?? null,
      vergiDairesi: data.vergiDairesi ?? null,
      vergiNo: data.vergiNo ?? null,
      adres: data.adres ?? null,
      telefon: data.telefon ?? null,
      email: data.email ?? null,
      notlar: data.notlar ?? null,
      isActive: true
    }).returning();

    return {
      id: created.id,
      firmaAdi: created.firmaAdi,
      firmaTuru: created.firmaTuru,
      subeBolge: created.subeBolge,
      vergiDairesi: created.vergiDairesi,
      vergiNo: created.vergiNo,
      adres: created.adres,
      telefon: created.telefon,
      email: created.email,
      notlar: created.notlar,
      isActive: created.isActive ?? true,
      createdAt: created.createdAt ?? new Date(),
      updatedAt: created.updatedAt ?? new Date()
    };
  }

  async updateCariHesap(id: number, data: Partial<InsertCariHesap>): Promise<CariHesap | undefined> {
    const [updated] = await this.getDbInstance()
      .update(cariHesaplar)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(cariHesaplar.id, id))
      .returning();

    if (!updated) return undefined;

    return {
      id: updated.id,
      firmaAdi: updated.firmaAdi,
      firmaTuru: updated.firmaTuru,
      subeBolge: updated.subeBolge,
      vergiDairesi: updated.vergiDairesi,
      vergiNo: updated.vergiNo,
      adres: updated.adres,
      telefon: updated.telefon,
      email: updated.email,
      notlar: updated.notlar,
      isActive: updated.isActive ?? true,
      createdAt: updated.createdAt ?? new Date(),
      updatedAt: updated.updatedAt ?? new Date()
    };
  }

  async deleteCariHesap(id: number): Promise<boolean> {
    const [deleted] = await this.getDbInstance()
      .update(cariHesaplar)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(cariHesaplar.id, id))
      .returning();
    return !!deleted;
  }

  async searchCariHesaplar(query: string): Promise<CariHesap[]> {
    const results = await this.getDbInstance().select().from(cariHesaplar);
    const lowerQuery = query.toLowerCase();
    return results
      .filter(c => c.isActive)
      .filter(c =>
        c.firmaAdi.toLowerCase().includes(lowerQuery) ||
        c.subeBolge?.toLowerCase().includes(lowerQuery) ||
        c.telefon?.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery)
      )
      .map(r => ({
        id: r.id,
        firmaAdi: r.firmaAdi,
        firmaTuru: r.firmaTuru,
        subeBolge: r.subeBolge,
        vergiDairesi: r.vergiDairesi,
        vergiNo: r.vergiNo,
        adres: r.adres,
        telefon: r.telefon,
        email: r.email,
        notlar: r.notlar,
        isActive: r.isActive ?? true,
        createdAt: r.createdAt ?? new Date(),
        updatedAt: r.updatedAt ?? new Date()
      }));
  }

  // Yetkili Kişiler
  async getYetkiliKisilerByCariId(cariHesapId: number): Promise<YetkiliKisi[]> {
    return await this.getDbInstance()
      .select()
      .from(yetkiliKisiler)
      .where(eq(yetkiliKisiler.cariHesapId, cariHesapId));
  }

  async createYetkiliKisi(data: InsertYetkiliKisi): Promise<YetkiliKisi> {
    const valuesToInsert: InferInsertModel<typeof yetkiliKisiler> = {
      ...removeUndefinedProps(data),
      cariHesapId: data.cariHesapId,
      adSoyad: data.adSoyad,
    };
    const [created] = await this.getDbInstance().insert(yetkiliKisiler).values(valuesToInsert).returning();
    return {
      ...created,
      createdAt: new Date(created.createdAt),
      updatedAt: new Date(created.updatedAt)
    };
  }

  async updateYetkiliKisi(id: number, data: Partial<InsertYetkiliKisi>): Promise<YetkiliKisi | undefined> {
    const { cariHesapId, adSoyad, ...otherData } = data;
    const valuesToUpdate: Partial<InsertYetkiliKisi> & { updatedAt: Date } = {
      ...removeUndefinedProps(otherData),
      updatedAt: new Date(),
    };
    const [updated] = await this.getDbInstance()
      .update(yetkiliKisiler)
      .set(valuesToUpdate)
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
    const valuesToInsert: InferInsertModel<typeof cariHareketler> = {
      ...removeUndefinedProps(data),
      cariHesapId: data.cariHesapId,
      aciklama: data.aciklama,
      tarih: data.tarih,
      tur: data.tur,
      tutar: data.tutar,
      bakiye: data.bakiye,
    };
    const [created] = await this.getDbInstance().insert(cariHareketler).values(valuesToInsert).returning();
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
    const valuesToInsert: InferInsertModel<typeof teklifler> = {
        ...removeUndefinedProps(data),
        cariHesapId: data.cariHesapId,
        teklifNo: data.teklifNo,
        teklifTuru: data.teklifTuru,
        teklifKonusu: data.teklifKonusu,
        tarih: data.tarih,
    };
    const [created] = await this.getDbInstance().insert(teklifler).values(valuesToInsert).returning();
    return created;
  }

  async updateTeklif(id: number, data: Partial<InsertTeklif>): Promise<Teklif | undefined> {
    const valuesToUpdate: Partial<InsertTeklif> & { updatedAt: Date } = {
      ...removeUndefinedProps(data),
      updatedAt: new Date(),
    };
    const [updated] = await this.getDbInstance()
      .update(teklifler)
      .set(valuesToUpdate)
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
    const valuesToInsert: InferInsertModel<typeof teklifKalemleri> = {
        ...removeUndefinedProps(data),
        teklifId: data.teklifId,
        urunHizmetAdi: data.urunHizmetAdi,
        miktar: data.miktar,
        birim: data.birim,
        birimFiyat: data.birimFiyat,
        tutar: data.tutar,
        netTutar: data.netTutar,
        toplamTutar: data.toplamTutar,
    };
    const [created] = await this.getDbInstance().insert(teklifKalemleri).values(valuesToInsert).returning();
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
    const valuesToInsert: InferInsertModel<typeof projeler> = {
        ...removeUndefinedProps(data),
        cariHesapId: data.cariHesapId,
        projeNo: data.projeNo,
        projeAdi: data.projeAdi,
        projeTarihi: data.projeTarihi,
    };
    const [created] = await this.getDbInstance().insert(projeler).values(valuesToInsert).returning();
    return created;
  }

  async updateProje(id: number, data: Partial<InsertProje>): Promise<Proje | undefined> {
    const valuesToUpdate: Partial<InsertProje> & { updatedAt: Date } = {
      ...removeUndefinedProps(data),
      updatedAt: new Date(),
    };
    const [updated] = await this.getDbInstance()
      .update(projeler)
      .set(valuesToUpdate)
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
    const insertData = {
      baslik: data.baslik,
      aciklama: data.aciklama ?? null,
      durum: data.durum ?? null,
      oncelik: data.oncelik ?? null,
      baslangicTarihi: data.baslangicTarihi ?? null,
      bitisTarihi: data.bitisTarihi ?? null,
      sonTeslimTarihi: data.sonTeslimTarihi ?? null,
      atananKisi: data.atananKisi ?? null,
      cariHesapId: data.cariHesapId ?? null,
      projeId: data.projeId ?? null,
      userId: data.userId ?? null,
      siralama: data.siralama ?? 0,
      etiketler: data.etiketler ?? null,
      dosyalar: data.dosyalar ?? null,
    };
    const [created] = await this.getDbInstance().insert(gorevler).values(insertData).returning();
    return created;
  }

  async updateGorev(id: number, data: Partial<InsertGorev>): Promise<Gorev | undefined> {
    const valuesToUpdate: Partial<InsertGorev> & { updatedAt: Date } = {
      ...removeUndefinedProps(data),
      updatedAt: new Date(),
    };
    const [updated] = await this.getDbInstance()
      .update(gorevler)
      .set(valuesToUpdate)
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

  async getRecentActivities(limit: number = 10): Promise<any> {
    // TODO: Implement this method
    return [];
  }

  async getUpcomingTasks(limit: number = 5): Promise<Gorev[]> {
    const results = await this.getDbInstance()
      .select()
      .from(gorevler)
      .where(eq(gorevler.durum, "Bekliyor"))
      .limit(limit);
    return results;
  }
}