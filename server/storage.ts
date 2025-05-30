import { 
  type CariHesap, type YetkiliKisi, type CariHareket,
  type Teklif, type TeklifKalemi, type Proje, type Gorev,
  type InsertCariHesap, type InsertYetkiliKisi,
  type InsertCariHareket, type InsertTeklif, type InsertTeklifKalemi,
  type InsertProje, type InsertGorev,
  cariHesaplar, yetkiliKisiler, cariHareketler, teklifler,
  teklifKalemleri, projeler, gorevler
} from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from './db';

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

export interface IStorage {
  // Cari Hesaplar
  getAllCariHesaplar(): Promise<CariHesap[]>;
  getCariHesapById(id: number): Promise<CariHesap | undefined>;
  createCariHesap(data: InsertCariHesap): Promise<CariHesap>;
  updateCariHesap(id: number, data: Partial<InsertCariHesap>): Promise<CariHesap | undefined>;
  deleteCariHesap(id: number): Promise<boolean>;
  searchCariHesaplar(query: string): Promise<CariHesap[]>;

  // Yetkili Kişiler
  getYetkiliKisilerByCariId(cariHesapId: number): Promise<YetkiliKisi[]>;
  createYetkiliKisi(data: InsertYetkiliKisi): Promise<YetkiliKisi>;
  updateYetkiliKisi(id: number, data: Partial<InsertYetkiliKisi>): Promise<YetkiliKisi | undefined>;
  deleteYetkiliKisi(id: number): Promise<boolean>;

  // Cari Hareketler
  getCariHareketlerByCariId(cariHesapId: number, limit?: number): Promise<CariHareket[]>;
  createCariHareket(data: InsertCariHareket): Promise<CariHareket>;

  // Teklifler
  getAllTeklifler(): Promise<Teklif[]>;
  getTeklifById(id: number): Promise<Teklif | undefined>;
  createTeklif(data: InsertTeklif): Promise<Teklif>;
  updateTeklif(id: number, data: Partial<InsertTeklif>): Promise<Teklif | undefined>;
  deleteTeklif(id: number): Promise<boolean>;
  getTekliflerByTur(tur: string): Promise<Teklif[]>;
  searchTeklifler(query: string): Promise<Teklif[]>;

  // Teklif Kalemleri
  getTeklifKalemleriByTeklifId(teklifId: number): Promise<TeklifKalemi[]>;
  createTeklifKalemi(data: InsertTeklifKalemi): Promise<TeklifKalemi>;
  deleteTeklifKalemleriByTeklifId(teklifId: number): Promise<boolean>;

  // Projeler
  getAllProjeler(): Promise<Proje[]>;
  getProjeById(id: number): Promise<Proje | undefined>;
  createProje(data: InsertProje): Promise<Proje>;
  updateProje(id: number, data: Partial<InsertProje>): Promise<Proje | undefined>;
  deleteProje(id: number): Promise<boolean>;
  getProjelerByDurum(durum: string): Promise<Proje[]>;
  searchProjeler(query: string): Promise<Proje[]>;

  // Görevler
  getAllGorevler(): Promise<Gorev[]>;
  getGorevById(id: number): Promise<Gorev | undefined>;
  createGorev(data: InsertGorev): Promise<Gorev>;
  updateGorev(id: number, data: Partial<InsertGorev>): Promise<Gorev | undefined>;
  deleteGorev(id: number): Promise<boolean>;
  getGorevlerByDurum(durum: string): Promise<Gorev[]>;
  getGorevlerByCariId(cariHesapId: number): Promise<Gorev[]>;
  getGorevlerByProjeId(projeId: number): Promise<Gorev[]>;
  searchGorevler(query: string): Promise<Gorev[]>;

  // Dashboard
  getDashboardStats(period?: string): Promise<any>;
  getRecentActivities(limit?: number): Promise<any>;
  getUpcomingTasks(limit?: number): Promise<Gorev[]>;
}

// Geçici in-memory storage
export class MemoryStorage implements IStorage {
  private cariHesaplar: Map<number, CariHesap> = new Map();
  private yetkiliKisiler: Map<number, YetkiliKisi> = new Map();
  private cariHareketler: Map<number, CariHareket> = new Map();
  private teklifler: Map<number, Teklif> = new Map();
  private teklifKalemleri: Map<number, TeklifKalemi> = new Map();
  private projeler: Map<number, Proje> = new Map();
  private gorevler: Map<number, Gorev> = new Map();
  private currentIds = {
    cariHesap: 1,
    yetkiliKisi: 1,
    cariHareket: 1,
    teklif: 1,
    teklifKalemi: 1,
    proje: 1,
    gorev: 1
  };

  private getDbInstance() {
    return db;
  }

  constructor() {
    this.initSampleData();
  }

  private initSampleData() {
    // Örnek cari hesap
    const sampleCariHesap: CariHesap = {
      id: 1,
      firmaAdi: "ABC Teknoloji Ltd.",
      subeBolge: "İstanbul",
      firmaTuru: "Alıcı",
      telefon: "0212 555 0001",
      email: "info@abcteknoloji.com",
      adres: "Beşiktaş, İstanbul",
      vergiNo: "1234567890",
      vergiDairesi: "Beşiktaş VD",
      notlar: "Önemli müşteri",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cariHesaplar.set(1, sampleCariHesap);
    this.currentIds.cariHesap = 2;

    // Örnek görev
    const sampleGorev: Gorev = {
      id: 1,
      baslik: "Website Tasarımı",
      aciklama: "Kurumsal website tasarımı ve geliştirme",
      durum: "Devam Ediyor",
      oncelik: "Yüksek",
      baslangicTarihi: new Date(),
      bitisTarihi: null,
      sonTeslimTarihi: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
      atananKisi: "Ahmet Yılmaz",
      cariHesapId: 1,
      projeId: null,
      userId: null,
      siralama: 0,
      etiketler: null,
      dosyalar: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.gorevler.set(1, sampleGorev);
    this.currentIds.gorev = 2;
  }

  // Cari Hesaplar CRUD
  async getAllCariHesaplar(): Promise<CariHesap[]> {
    return Array.from(this.cariHesaplar.values())
      .filter(c => c.isActive)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getCariHesapById(id: number): Promise<CariHesap | undefined> {
    return this.cariHesaplar.get(id);
  }

  async createCariHesap(data: InsertCariHesap): Promise<CariHesap> {
    const id = this.currentIds.cariHesap++;
    const now = new Date();
    const cariHesap: CariHesap = {
      id,
      firmaAdi: data.firmaAdi,
      firmaTuru: data.firmaTuru,
      subeBolge: data.subeBolge || null,
      telefon: data.telefon || null,
      email: data.email || null,
      adres: data.adres || null,
      vergiNo: data.vergiNo || null,
      vergiDairesi: data.vergiDairesi || null,
      notlar: data.notlar || null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
    this.cariHesaplar.set(id, cariHesap);
    return cariHesap;
  }

  async updateCariHesap(id: number, data: Partial<InsertCariHesap>): Promise<CariHesap | undefined> {
    const [updated] = await this.getDbInstance()
      .update(cariHesaplar)
      .set({
        ...data,
        updatedAt: new Date(),
        isActive: data.isActive ?? true
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
    const existing = this.cariHesaplar.get(id);
    if (!existing) return false;

    const updated: CariHesap = {
      ...existing,
      isActive: false,
      updatedAt: new Date()
    };
    this.cariHesaplar.set(id, updated);
    return true;
  }

  async searchCariHesaplar(query: string): Promise<CariHesap[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.cariHesaplar.values())
      .filter(c => 
        c.isActive && (
          c.firmaAdi.toLowerCase().includes(lowerQuery) ||
          c.subeBolge?.toLowerCase().includes(lowerQuery) ||
          c.telefon?.toLowerCase().includes(lowerQuery) ||
          c.email?.toLowerCase().includes(lowerQuery)
        )
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Yetkili Kişiler CRUD
  async getYetkiliKisilerByCariId(cariHesapId: number): Promise<YetkiliKisi[]> {
    return Array.from(this.yetkiliKisiler.values())
      .filter(y => y.cariHesapId === cariHesapId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async createYetkiliKisi(data: InsertYetkiliKisi): Promise<YetkiliKisi> {
    const valuesToInsert = {
      ...removeUndefinedProps(data),
      cariHesapId: data.cariHesapId,
      adSoyad: data.adSoyad,
    };
    const [created] = await this.getDbInstance().insert(yetkiliKisiler).values(valuesToInsert).returning();
    return {
      ...created,
      createdAt: created.createdAt ?? new Date(),
      updatedAt: created.updatedAt ?? new Date()
    };
  }

  async updateYetkiliKisi(id: number, data: Partial<InsertYetkiliKisi>): Promise<YetkiliKisi | undefined> {
    const existing = this.yetkiliKisiler.get(id);
    if (!existing) return undefined;

    const updated: YetkiliKisi = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };
    this.yetkiliKisiler.set(id, updated);
    return updated;
  }

  async deleteYetkiliKisi(id: number): Promise<boolean> {
    return this.yetkiliKisiler.delete(id);
  }

  // Cari Hareketler CRUD
  async getCariHareketlerByCariId(cariHesapId: number, limit: number = 25): Promise<CariHareket[]> {
    return Array.from(this.cariHareketler.values())
      .filter(h => h.cariHesapId === cariHesapId)
      .sort((a, b) => {
        const dateA = a.tarih ? new Date(a.tarih).getTime() : 0;
        const dateB = b.tarih ? new Date(b.tarih).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  async createCariHareket(data: InsertCariHareket): Promise<CariHareket> {
    const valuesToInsert = {
      ...removeUndefinedProps(data),
      cariHesapId: data.cariHesapId,
      aciklama: data.aciklama,
      tarih: data.tarih ?? new Date(),
      tur: data.tur,
      tutar: data.tutar,
      bakiye: data.bakiye,
    };
    const [created] = await this.getDbInstance().insert(cariHareketler).values(valuesToInsert).returning();
    return {
      ...created,
      tarih: created.tarih ?? new Date(),
      createdAt: created.createdAt ?? new Date(),
      updatedAt: created.updatedAt ?? new Date()
    };
  }

  // Teklifler CRUD
  async getAllTeklifler(): Promise<Teklif[]> {
    return Array.from(this.teklifler.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTeklifById(id: number): Promise<Teklif | undefined> {
    return this.teklifler.get(id);
  }

  async createTeklif(data: InsertTeklif): Promise<Teklif> {
    const id = this.currentIds.teklif++;
    const now = new Date();
    const teklif: Teklif = {
      id,
      cariHesapId: data.cariHesapId,
      yetkiliKisiId: data.yetkiliKisiId || null,
      teklifNo: data.teklifNo,
      teklifTuru: data.teklifTuru,
      teklifKonusu: data.teklifKonusu,
      teklifDurumu: data.teklifDurumu,
      odemeSekli: data.odemeSekli || null,
      gecerlilikSuresi: data.gecerlilikSuresi || null,
      paraBirimi: data.paraBirimi || null,
      toplamTutar: data.toplamTutar,
      notlar: data.notlar || null,
      dosyalar: data.dosyalar || null,
      tarih: now,
      createdAt: now,
      updatedAt: now
    };
    this.teklifler.set(id, teklif);
    return teklif;
  }

  async updateTeklif(id: number, data: Partial<InsertTeklif>): Promise<Teklif | undefined> {
    const existing = this.teklifler.get(id);
    if (!existing) return undefined;

    const updated: Teklif = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };
    this.teklifler.set(id, updated);
    return updated;
  }

  async deleteTeklif(id: number): Promise<boolean> {
    return this.teklifler.delete(id);
  }

  async getTekliflerByTur(tur: string): Promise<Teklif[]> {
    return Array.from(this.teklifler.values())
      .filter(t => t.teklifTuru === tur)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async searchTeklifler(query: string): Promise<Teklif[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.teklifler.values())
      .filter(t => 
        t.teklifNo.toLowerCase().includes(lowerQuery) ||
        t.teklifKonusu.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Teklif Kalemleri CRUD
  async getTeklifKalemleriByTeklifId(teklifId: number): Promise<TeklifKalemi[]> {
    return Array.from(this.teklifKalemleri.values())
      .filter(k => k.teklifId === teklifId)
      .sort((a, b) => a.id - b.id);
  }

  async createTeklifKalemi(data: InsertTeklifKalemi): Promise<TeklifKalemi> {
    const id = this.currentIds.teklifKalemi++;
    const now = new Date();
    const kalem: TeklifKalemi = {
      id,
      teklifId: data.teklifId,
      urunHizmetAdi: data.urunHizmetAdi,
      miktar: data.miktar,
      birim: data.birim,
      birimFiyat: data.birimFiyat,
      tutar: data.tutar,
      iskontoTutari: data.iskontoTutari || null,
      netTutar: data.netTutar,
      kdvOrani: data.kdvOrani,
      toplamTutar: data.toplamTutar,
      createdAt: now
    };
    this.teklifKalemleri.set(id, kalem);
    return kalem;
  }

  async deleteTeklifKalemleriByTeklifId(teklifId: number): Promise<boolean> {
    const toDelete = Array.from(this.teklifKalemleri.entries())
      .filter(([_, kalem]) => kalem.teklifId === teklifId)
      .map(([id, _]) => id);

    toDelete.forEach(id => this.teklifKalemleri.delete(id));
    return toDelete.length > 0;
  }

  // Projeler CRUD
  async getAllProjeler(): Promise<Proje[]> {
    return Array.from(this.projeler.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getProjeById(id: number): Promise<Proje | undefined> {
    return this.projeler.get(id);
  }

  async createProje(data: InsertProje): Promise<Proje> {
    const id = this.currentIds.proje++;
    const now = new Date();
    const proje: Proje = {
      id,
      cariHesapId: data.cariHesapId,
      teklifId: data.teklifId || null,
      projeNo: data.projeNo,
      projeAdi: data.projeAdi,
      projeDurumu: data.projeDurumu,
      projeTarihi: data.projeTarihi,
      sonTeslimTarihi: data.sonTeslimTarihi || null,
      butce: data.butce || null,
      harcananTutar: data.harcananTutar || null,
      tamamlanmaOrani: data.tamamlanmaOrani || null,
      sorumluKisi: data.sorumluKisi || null,
      aciklama: data.aciklama || null,
      notlar: data.notlar || null,
      dosyalar: data.dosyalar || null,
      createdAt: now,
      updatedAt: now
    };
    this.projeler.set(id, proje);
    return proje;
  }

  async updateProje(id: number, data: Partial<InsertProje>): Promise<Proje | undefined> {
    const existing = this.projeler.get(id);
    if (!existing) return undefined;

    const updated: Proje = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };
    this.projeler.set(id, updated);
    return updated;
  }

  async deleteProje(id: number): Promise<boolean> {
    return this.projeler.delete(id);
  }

  async getProjelerByDurum(durum: string): Promise<Proje[]> {
    return Array.from(this.projeler.values())
      .filter(p => p.projeDurumu === durum)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async searchProjeler(query: string): Promise<Proje[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.projeler.values())
      .filter(p => 
        p.projeNo.toLowerCase().includes(lowerQuery) ||
        p.projeAdi.toLowerCase().includes(lowerQuery) ||
        p.aciklama?.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Görevler CRUD
  async getAllGorevler(): Promise<Gorev[]> {
    return Array.from(this.gorevler.values())
      .sort((a, b) => {
        const siraA = a.siralama || 0;
        const siraB = b.siralama || 0;
        if (siraA !== siraB) return siraA - siraB;
        
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getGorevById(id: number): Promise<Gorev | undefined> {
    return this.gorevler.get(id);
  }

  async createGorev(data: InsertGorev): Promise<Gorev> {
    const insertData = {
      baslik: data.baslik,
      aciklama: data.aciklama ?? null,
      durum: data.durum,
      oncelik: data.oncelik,
      baslangicTarihi: data.baslangicTarihi,
      bitisTarihi: data.bitisTarihi ?? null,
      sonTeslimTarihi: data.sonTeslimTarihi ?? null,
      atananKisi: data.atananKisi ?? null,
      cariHesapId: data.cariHesapId,
      projeId: data.projeId ?? null,
      userId: data.userId ?? null,
      siralama: data.siralama ?? 0,
      etiketler: data.etiketler ?? null,
      dosyalar: data.dosyalar ?? null,
    };
    const [created] = await this.getDbInstance().insert(gorevler).values(insertData).returning();
    return {
      ...created,
      createdAt: created.createdAt ?? new Date(),
      updatedAt: created.updatedAt ?? new Date()
    };
  }

  async updateGorev(id: number, data: Partial<InsertGorev>): Promise<Gorev | undefined> {
    const existing = this.gorevler.get(id);
    if (!existing) return undefined;

    const updated: Gorev = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };
    this.gorevler.set(id, updated);
    return updated;
  }

  async deleteGorev(id: number): Promise<boolean> {
    return this.gorevler.delete(id);
  }

  async getGorevlerByDurum(durum: string): Promise<Gorev[]> {
    return Array.from(this.gorevler.values())
      .filter(g => g.durum === durum)
      .sort((a, b) => {
        const siraA = a.siralama || 0;
        const siraB = b.siralama || 0;
        if (siraA !== siraB) return siraA - siraB;
        
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getGorevlerByCariId(cariHesapId: number): Promise<Gorev[]> {
    return Array.from(this.gorevler.values())
      .filter(g => g.cariHesapId === cariHesapId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getGorevlerByProjeId(projeId: number): Promise<Gorev[]> {
    return Array.from(this.gorevler.values())
      .filter(g => g.projeId === projeId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async searchGorevler(query: string): Promise<Gorev[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.gorevler.values())
      .filter(g => 
        g.baslik.toLowerCase().includes(lowerQuery) ||
        g.aciklama?.toLowerCase().includes(lowerQuery) ||
        g.atananKisi?.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getDashboardStats(period: string = 'thisMonth'): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'thisWeek':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const cariHesaplarArray = Array.from(this.cariHesaplar.values());
    const tekliflerArray = Array.from(this.teklifler.values())
      .filter(t => t.createdAt && new Date(t.createdAt) >= startDate);
    const projelerArray = Array.from(this.projeler.values())
      .filter(p => p.createdAt && new Date(p.createdAt) >= startDate);
    const gorevlerArray = Array.from(this.gorevler.values())
      .filter(g => g.createdAt && new Date(g.createdAt) >= startDate);

    const stats = {
      cariHesaplar: {
        toplam: cariHesaplarArray.length,
        tip: {
          alici: cariHesaplarArray.filter(c => c.firmaTuru === 'Alıcı').length,
          satici: cariHesaplarArray.filter(c => c.firmaTuru === 'Satıcı').length
        }
      },
      teklifler: {
        toplam: tekliflerArray.length,
        durum: {
          beklemede: tekliflerArray.filter(t => t.teklifDurumu === 'Beklemede').length,
          onaylandi: tekliflerArray.filter(t => t.teklifDurumu === 'Onaylandı').length,
          reddedildi: tekliflerArray.filter(t => t.teklifDurumu === 'Reddedildi').length
        }
      },
      projeler: {
        toplam: projelerArray.length,
        durum: {
          devamEdiyor: projelerArray.filter(p => p.projeDurumu === 'Devam Ediyor').length,
          tamamlandi: projelerArray.filter(p => p.projeDurumu === 'Tamamlandı').length,
          beklemede: projelerArray.filter(p => p.projeDurumu === 'Beklemede').length
        }
      },
      gorevler: {
        toplam: gorevlerArray.length,
        durum: {
          bekliyor: gorevlerArray.filter(g => g.durum === 'Bekliyor').length,
          devamEdiyor: gorevlerArray.filter(g => g.durum === 'Devam Ediyor').length,
          tamamlandi: gorevlerArray.filter(g => g.durum === 'Tamamlandı').length
        }
      }
    };

    return stats;
  }

  async getRecentActivities(limit: number = 10): Promise<any> {
    const activities = [];
    
    // Son eklenen görevler
    const recentTasks = Array.from(this.gorevler.values())
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit)
      .map(task => ({
        type: 'task',
        title: task.baslik,
        date: task.createdAt,
        status: task.durum
      }));
    
    // Son eklenen teklifler
    const recentQuotes = Array.from(this.teklifler.values())
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit)
      .map(quote => ({
        type: 'quote',
        title: quote.teklifNo,
        date: quote.createdAt,
        status: quote.teklifDurumu
      }));
    
    // Son eklenen projeler
    const recentProjects = Array.from(this.projeler.values())
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit)
      .map(project => ({
        type: 'project',
        title: project.projeAdi,
        date: project.createdAt,
        status: project.projeDurumu
      }));
    
    // Tüm aktiviteleri birleştir, sırala ve limitle
    return [...recentTasks, ...recentQuotes, ...recentProjects]
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  async getUpcomingTasks(limit: number = 5): Promise<Gorev[]> {
    const now = new Date();
    return Array.from(this.gorevler.values())
      .filter(task => 
        task.durum !== 'Tamamlandı' && 
        task.baslangicTarihi && 
        new Date(task.baslangicTarihi) > now
      )
      .sort((a, b) => new Date(a.baslangicTarihi).getTime() - new Date(b.baslangicTarihi).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemoryStorage();