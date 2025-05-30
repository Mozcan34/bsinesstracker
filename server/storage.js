// Geçici in-memory storage
export class MemoryStorage {
    constructor() {
        this.cariHesaplar = new Map();
        this.yetkiliKisiler = new Map();
        this.cariHareketler = new Map();
        this.teklifler = new Map();
        this.teklifKalemleri = new Map();
        this.projeler = new Map();
        this.gorevler = new Map();
        this.currentIds = {
            cariHesap: 1,
            yetkiliKisi: 1,
            cariHareket: 1,
            teklif: 1,
            teklifKalemi: 1,
            proje: 1,
            gorev: 1
        };
        this.initSampleData();
    }
    initSampleData() {
        // Örnek cari hesap
        const sampleCariHesap = {
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
        const sampleGorev = {
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
    async getAllCariHesaplar() {
        return Array.from(this.cariHesaplar.values())
            .filter(c => c.isActive)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getCariHesapById(id) {
        return this.cariHesaplar.get(id);
    }
    async createCariHesap(data) {
        const id = this.currentIds.cariHesap++;
        const now = new Date();
        const cariHesap = {
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
    async updateCariHesap(id, data) {
        const existing = this.cariHesaplar.get(id);
        if (!existing)
            return undefined;
        const updated = {
            ...existing,
            ...data,
            updatedAt: new Date()
        };
        this.cariHesaplar.set(id, updated);
        return updated;
    }
    async deleteCariHesap(id) {
        const existing = this.cariHesaplar.get(id);
        if (!existing)
            return false;
        const updated = {
            ...existing,
            isActive: false,
            updatedAt: new Date()
        };
        this.cariHesaplar.set(id, updated);
        return true;
    }
    async searchCariHesaplar(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.cariHesaplar.values())
            .filter(c => c.isActive && (c.firmaAdi.toLowerCase().includes(lowerQuery) ||
            c.subeBolge?.toLowerCase().includes(lowerQuery) ||
            c.telefon?.toLowerCase().includes(lowerQuery) ||
            c.email?.toLowerCase().includes(lowerQuery)))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // Yetkili Kişiler CRUD
    async getYetkiliKisilerByCariId(cariHesapId) {
        return Array.from(this.yetkiliKisiler.values())
            .filter(y => y.cariHesapId === cariHesapId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async createYetkiliKisi(data) {
        const id = this.currentIds.yetkiliKisi++;
        const now = new Date();
        const yetkiliKisi = {
            id,
            cariHesapId: data.cariHesapId,
            adSoyad: data.adSoyad,
            gorevi: data.gorevi || null,
            departman: data.departman || null,
            telefon: data.telefon || null,
            email: data.email || null,
            notlar: data.notlar || null,
            createdAt: now,
            updatedAt: now
        };
        this.yetkiliKisiler.set(id, yetkiliKisi);
        return yetkiliKisi;
    }
    async updateYetkiliKisi(id, data) {
        const existing = this.yetkiliKisiler.get(id);
        if (!existing)
            return undefined;
        const updated = {
            ...existing,
            ...data,
            updatedAt: new Date()
        };
        this.yetkiliKisiler.set(id, updated);
        return updated;
    }
    async deleteYetkiliKisi(id) {
        return this.yetkiliKisiler.delete(id);
    }
    // Cari Hareketler CRUD
    async getCariHareketlerByCariId(cariHesapId, limit = 25) {
        return Array.from(this.cariHareketler.values())
            .filter(h => h.cariHesapId === cariHesapId)
            .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime())
            .slice(0, limit);
    }
    async createCariHareket(data) {
        const id = this.currentIds.cariHareket++;
        const now = new Date();
        const hareket = {
            id,
            cariHesapId: data.cariHesapId,
            tarih: data.tarih,
            aciklama: data.aciklama,
            tur: data.tur,
            tutar: data.tutar,
            bakiye: data.bakiye,
            projeId: data.projeId || null,
            createdAt: now,
            updatedAt: now
        };
        this.cariHareketler.set(id, hareket);
        return hareket;
    }
    // Teklifler CRUD
    async getAllTeklifler() {
        return Array.from(this.teklifler.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getTeklifById(id) {
        return this.teklifler.get(id);
    }
    async createTeklif(data) {
        const id = this.currentIds.teklif++;
        const now = new Date();
        const teklif = {
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
            tarih: data.tarih,
            createdAt: now,
            updatedAt: now
        };
        this.teklifler.set(id, teklif);
        return teklif;
    }
    async updateTeklif(id, data) {
        const existing = this.teklifler.get(id);
        if (!existing)
            return undefined;
        const updated = {
            ...existing,
            ...data,
            updatedAt: new Date()
        };
        this.teklifler.set(id, updated);
        return updated;
    }
    async deleteTeklif(id) {
        return this.teklifler.delete(id);
    }
    async getTekliflerByTur(tur) {
        return Array.from(this.teklifler.values())
            .filter(t => t.teklifTuru === tur)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async searchTeklifler(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.teklifler.values())
            .filter(t => t.teklifNo.toLowerCase().includes(lowerQuery) ||
            t.teklifKonusu.toLowerCase().includes(lowerQuery))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // Teklif Kalemleri CRUD
    async getTeklifKalemleriByTeklifId(teklifId) {
        return Array.from(this.teklifKalemleri.values())
            .filter(k => k.teklifId === teklifId)
            .sort((a, b) => a.id - b.id);
    }
    async createTeklifKalemi(data) {
        const id = this.currentIds.teklifKalemi++;
        const now = new Date();
        const kalem = {
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
    async deleteTeklifKalemleriByTeklifId(teklifId) {
        const toDelete = Array.from(this.teklifKalemleri.entries())
            .filter(([_, kalem]) => kalem.teklifId === teklifId)
            .map(([id, _]) => id);
        toDelete.forEach(id => this.teklifKalemleri.delete(id));
        return toDelete.length > 0;
    }
    // Projeler CRUD
    async getAllProjeler() {
        return Array.from(this.projeler.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getProjeById(id) {
        return this.projeler.get(id);
    }
    async createProje(data) {
        const id = this.currentIds.proje++;
        const now = new Date();
        const proje = {
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
    async updateProje(id, data) {
        const existing = this.projeler.get(id);
        if (!existing)
            return undefined;
        const updated = {
            ...existing,
            ...data,
            updatedAt: new Date()
        };
        this.projeler.set(id, updated);
        return updated;
    }
    async deleteProje(id) {
        return this.projeler.delete(id);
    }
    async getProjelerByDurum(durum) {
        return Array.from(this.projeler.values())
            .filter(p => p.projeDurumu === durum)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async searchProjeler(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.projeler.values())
            .filter(p => p.projeNo.toLowerCase().includes(lowerQuery) ||
            p.projeAdi.toLowerCase().includes(lowerQuery) ||
            p.aciklama?.toLowerCase().includes(lowerQuery))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // Görevler CRUD
    async getAllGorevler() {
        return Array.from(this.gorevler.values())
            .sort((a, b) => (a.siralama || 0) - (b.siralama || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getGorevById(id) {
        return this.gorevler.get(id);
    }
    async createGorev(data) {
        const id = this.currentIds.gorev++;
        const now = new Date();
        const gorev = {
            id,
            baslik: data.baslik,
            aciklama: data.aciklama || null,
            durum: data.durum,
            oncelik: data.oncelik,
            baslangicTarihi: data.baslangicTarihi,
            bitisTarihi: data.bitisTarihi || null,
            sonTeslimTarihi: data.sonTeslimTarihi || null,
            atananKisi: data.atananKisi || null,
            cariHesapId: data.cariHesapId,
            projeId: data.projeId || null,
            userId: data.userId || null,
            siralama: data.siralama || null,
            etiketler: data.etiketler || null,
            dosyalar: data.dosyalar || null,
            createdAt: now,
            updatedAt: now
        };
        this.gorevler.set(id, gorev);
        return gorev;
    }
    async updateGorev(id, data) {
        const existing = this.gorevler.get(id);
        if (!existing)
            return undefined;
        const updated = {
            ...existing,
            ...data,
            updatedAt: new Date()
        };
        this.gorevler.set(id, updated);
        return updated;
    }
    async deleteGorev(id) {
        return this.gorevler.delete(id);
    }
    async getGorevlerByDurum(durum) {
        return Array.from(this.gorevler.values())
            .filter(g => g.durum === durum)
            .sort((a, b) => (a.siralama || 0) - (b.siralama || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getGorevlerByCariId(cariHesapId) {
        return Array.from(this.gorevler.values())
            .filter(g => g.cariHesapId === cariHesapId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getGorevlerByProjeId(projeId) {
        return Array.from(this.gorevler.values())
            .filter(g => g.projeId === projeId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async searchGorevler(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.gorevler.values())
            .filter(g => g.baslik.toLowerCase().includes(lowerQuery) ||
            g.aciklama?.toLowerCase().includes(lowerQuery) ||
            g.atananKisi?.toLowerCase().includes(lowerQuery))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getDashboardStats(period = 'thisMonth') {
        const now = new Date();
        let startDate;
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
            .filter(t => new Date(t.createdAt) >= startDate);
        const projelerArray = Array.from(this.projeler.values())
            .filter(p => new Date(p.createdAt) >= startDate);
        const gorevlerArray = Array.from(this.gorevler.values())
            .filter(g => new Date(g.createdAt) >= startDate);
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
    async getRecentActivities(limit = 10) {
        const activities = [];
        // Son eklenen görevler
        const recentTasks = Array.from(this.gorevler.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit)
            .map(task => ({
            type: 'task',
            title: task.baslik,
            date: task.createdAt,
            status: task.durum
        }));
        // Son eklenen teklifler
        const recentQuotes = Array.from(this.teklifler.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit)
            .map(quote => ({
            type: 'quote',
            title: quote.teklifNo,
            date: quote.createdAt,
            status: quote.teklifDurumu
        }));
        // Son eklenen projeler
        const recentProjects = Array.from(this.projeler.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit)
            .map(project => ({
            type: 'project',
            title: project.projeAdi,
            date: project.createdAt,
            status: project.projeDurumu
        }));
        // Tüm aktiviteleri birleştir, sırala ve limitle
        return [...recentTasks, ...recentQuotes, ...recentProjects]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);
    }
    async getUpcomingTasks(limit = 5) {
        const now = new Date();
        return Array.from(this.gorevler.values())
            .filter(task => task.durum !== 'Tamamlandı' &&
            task.baslangicTarihi &&
            new Date(task.baslangicTarihi) > now)
            .sort((a, b) => new Date(a.baslangicTarihi).getTime() - new Date(b.baslangicTarihi).getTime())
            .slice(0, limit);
    }
}
export const storage = new MemoryStorage();
