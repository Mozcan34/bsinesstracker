import { 
  type CariHesap, type YetkiliKisi, type CariHareket,
  type Teklif, type TeklifKalemi, type Proje, type Gorev,
  type InsertCariHesap, type InsertYetkiliKisi,
  type InsertCariHareket, type InsertTeklif, type InsertTeklifKalemi,
  type InsertProje, type InsertGorev
} from '@shared/schema';

// Geçici in-memory storage
export class MemoryStorage {
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
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getCariHesapById(id: number): Promise<CariHesap | undefined> {
    return this.cariHesaplar.get(id);
  }

  async createCariHesap(data: InsertCariHesap): Promise<CariHesap> {
    const id = this.currentIds.cariHesap++;
    const now = new Date();
    const cariHesap: CariHesap = {
      ...data,
      id,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
    this.cariHesaplar.set(id, cariHesap);
    return cariHesap;
  }

  async updateCariHesap(id: number, data: Partial<InsertCariHesap>): Promise<CariHesap | undefined> {
    const existing = this.cariHesaplar.get(id);
    if (!existing) return undefined;

    const updated: CariHesap = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };
    this.cariHesaplar.set(id, updated);
    return updated;
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
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createYetkiliKisi(data: InsertYetkiliKisi): Promise<YetkiliKisi> {
    const id = this.currentIds.yetkiliKisi++;
    const now = new Date();
    const yetkiliKisi: YetkiliKisi = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.yetkiliKisiler.set(id, yetkiliKisi);
    return yetkiliKisi;
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
      .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime())
      .slice(0, limit);
  }

  async createCariHareket(data: InsertCariHareket): Promise<CariHareket> {
    const id = this.currentIds.cariHareket++;
    const now = new Date();
    const hareket: CariHareket = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.cariHareketler.set(id, hareket);
    return hareket;
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
      ...data,
      id,
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
      ...data,
      id,
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
      ...data,
      id,
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
      .sort((a, b) => a.siralama - b.siralama || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getGorevById(id: number): Promise<Gorev | undefined> {
    return this.gorevler.get(id);
  }

  async createGorev(data: InsertGorev): Promise<Gorev> {
    const id = this.currentIds.gorev++;
    const now = new Date();
    const gorev: Gorev = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.gorevler.set(id, gorev);
    return gorev;
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
      .sort((a, b) => a.siralama - b.siralama || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getGorevlerByCariId(cariHesapId: number): Promise<Gorev[]> {
    return Array.from(this.gorevler.values())
      .filter(g => g.cariHesapId === cariHesapId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getGorevlerByProjeId(projeId: number): Promise<Gorev[]> {
    return Array.from(this.gorevler.values())
      .filter(g => g.projeId === projeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async searchGorevler(query: string): Promise<Gorev[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.gorevler.values())
      .filter(g => 
        g.baslik.toLowerCase().includes(lowerQuery) ||
        g.aciklama?.toLowerCase().includes(lowerQuery) ||
        g.atananKisi?.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getDashboardStats(period: string = 'thisMonth') {
    // Tarih aralığını belirle
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'thisWeek':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        break;
      case 'thisQuarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'lastQuarter':
        const lastQuarterStart = Math.floor(now.getMonth() / 3) * 3 - 3;
        startDate = new Date(now.getFullYear(), lastQuarterStart, 1);
        break;
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default: // thisMonth
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Toplam sayılar
    const cariHesaplarArray = Array.from(this.cariHesaplar.values()).filter(c => c.isActive);
    const totalCariHesaplar = cariHesaplarArray.length;
    const tekliflerArray = Array.from(this.teklifler.values());
    const totalTeklifler = tekliflerArray.length;
    const projelerArray = Array.from(this.projeler.values());
    const totalProjeler = projelerArray.length;
    const gorevlerArray = Array.from(this.gorevler.values());
    const totalGorevler = gorevlerArray.length;

    // Teklif durum dağılımı
    const teklifDurumDagilimi = tekliflerArray.reduce((acc, teklif) => {
      const durum = teklif.teklifDurumu || 'Belirsiz';
      acc[durum] = (acc[durum] || 0) + 1;
      return acc;
    }, {});

    const teklifDurumDagilimiArray = Object.entries(teklifDurumDagilimi).map(([name, value]) => ({
      name,
      value: value as number,
    }));
  

    // Proje durum dağılımı
    const projeDurumDagilimi = projelerArray.reduce((acc, proje) => {
      const durum = proje.projeDurumu || 'Belirsiz';
      acc[durum] = (acc[durum] || 0) + 1;
      return acc;
    }, {});

    const projeDurumDagilimiArray = Object.entries(projeDurumDagilimi).map(([name, value]) => ({
      name,
      value: value as number,
    }));

    // Görev durum dağılımı
    const gorevDurumDagilimi = gorevlerArray.reduce((acc, gorev) => {
      const durum = gorev.durum || 'Belirsiz';
      acc[durum] = (acc[durum] || 0) + 1;
      return acc;
    }, {});

    const gorevDurumDagilimiArray = Object.entries(gorevDurumDagilimi).map(([name, value]) => ({
      name,
      value: value as number,
    }));

    // Cari tip dağılımı
    const cariTipDagilimi = cariHesaplarArray.reduce((acc, cari) => {
      const tip = cari.firmaTuru || 'Belirsiz';
      acc[tip] = (acc[tip] || 0) + 1;
      return acc;
    }, {});

    const cariTipDagilimiArray = Object.entries(cariTipDagilimi).map(([name, value]) => ({
      name,
      value: value as number,
    }));

    // Aylık teklif trendi (son 6 ay)
    const nowForTrend = new Date();
    const aylikTeklifTrendi = [];
    for (let i = 5; i >= 0; i--) {
      const month = nowForTrend.getMonth() - i;
      const year = nowForTrend.getFullYear();
      const trendMonth = new Date(year, month, 1);
      const monthName = trendMonth.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });

      const teklifSayisi = tekliflerArray.filter(teklif => {
          const teklifTarih = new Date(teklif.createdAt);
          return teklifTarih.getFullYear() === trendMonth.getFullYear() &&
                 teklifTarih.getMonth() === trendMonth.getMonth();
      }).length;

      const toplamTutar = tekliflerArray.filter(teklif => {
          const teklifTarih = new Date(teklif.createdAt);
          return teklifTarih.getFullYear() === trendMonth.getFullYear() &&
                 teklifTarih.getMonth() === trendMonth.getMonth();
      }).reduce((sum, teklif) => sum + (teklif.toplamTutar || 0), 0);
        
      aylikTeklifTrendi.push({
          month: monthName,
          teklifSayisi,
          toplamTutar
      });
    }
      

    return {
      totalCariHesaplar,
      totalTeklifler,
      totalProjeler,
      totalGorevler,
      teklifDurumDagilimi: teklifDurumDagilimiArray,
      projeDurumDagilimi: projeDurumDagilimiArray,
      gorevDurumDagilimi: gorevDurumDagilimiArray,
      cariTipDagilimi: cariTipDagilimiArray,
      aylikTeklifTrendi
    };
  }
}

export const storage = new MemoryStorage();