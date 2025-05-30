import { cariHesaplar, cariHareketler, teklifler, teklifKalemleri, projeler, gorevler, yetkiliKisiler } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
// Helper function to remove undefined properties from an object
function removeUndefinedProps(obj) {
    const newObj = { ...obj };
    for (const key in newObj) {
        if (newObj[key] === undefined) {
            delete newObj[key];
        }
    }
    return newObj;
}
export class DatabaseStorage {
    getDbInstance() {
        return db;
    }
    // Cari Hesaplar
    async getAllCariHesaplar() {
        return await this.getDbInstance().select().from(cariHesaplar);
    }
    async getCariHesapById(id) {
        const [account] = await this.getDbInstance().select().from(cariHesaplar).where(eq(cariHesaplar.id, id));
        return account;
    }
    async createCariHesap(data) {
        const insertData = {
            firmaAdi: data.firmaAdi,
            firmaTuru: data.firmaTuru,
            subeBolge: data.subeBolge ?? null,
            telefon: data.telefon ?? null,
            email: data.email ?? null,
            adres: data.adres ?? null,
            vergiNo: data.vergiNo ?? null,
            vergiDairesi: data.vergiDairesi ?? null,
            notlar: data.notlar ?? null,
            isActive: data.isActive !== undefined ? data.isActive : true,
        };
        const [created] = await this.getDbInstance().insert(cariHesaplar).values(insertData).returning();
        return created;
    }
    async updateCariHesap(id, data) {
        const valuesToUpdate = removeUndefinedProps(data);
        if (Object.keys(valuesToUpdate).length === 0) {
            return this.getCariHesapById(id);
        }
        const [updated] = await this.getDbInstance()
            .update(cariHesaplar)
            .set(valuesToUpdate)
            .where(eq(cariHesaplar.id, id))
            .returning();
        return updated;
    }
    async deleteCariHesap(id) {
        await this.getDbInstance().delete(cariHesaplar).where(eq(cariHesaplar.id, id));
        return true;
    }
    async searchCariHesaplar(query) {
        const lowerQuery = query.toLowerCase();
        const results = await this.getDbInstance().select().from(cariHesaplar);
        return results.filter(c => c.firmaAdi.toLowerCase().includes(lowerQuery) ||
            c.subeBolge?.toLowerCase().includes(lowerQuery) ||
            c.telefon?.toLowerCase().includes(lowerQuery) ||
            c.email?.toLowerCase().includes(lowerQuery));
    }
    // Yetkili Kişiler
    async getYetkiliKisilerByCariId(cariHesapId) {
        return await this.getDbInstance()
            .select()
            .from(yetkiliKisiler)
            .where(eq(yetkiliKisiler.cariHesapId, cariHesapId));
    }
    async createYetkiliKisi(data) {
        const valuesToInsert = {
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
    async updateYetkiliKisi(id, data) {
        const { cariHesapId, adSoyad, ...otherData } = data;
        const valuesToUpdate = {
            ...removeUndefinedProps(otherData),
            updatedAt: new Date(),
        };
        const [updated] = await this.getDbInstance()
            .update(yetkiliKisiler)
            .set(valuesToUpdate)
            .where(eq(yetkiliKisiler.id, id))
            .returning();
        if (!updated)
            return undefined;
        return {
            ...updated,
            createdAt: new Date(updated.createdAt),
            updatedAt: new Date(updated.updatedAt)
        };
    }
    async deleteYetkiliKisi(id) {
        await this.getDbInstance().delete(yetkiliKisiler).where(eq(yetkiliKisiler.id, id));
        return true;
    }
    // Cari Hareketler
    async getCariHareketlerByCariId(cariHesapId, limit = 25) {
        return await this.getDbInstance()
            .select()
            .from(cariHareketler)
            .where(eq(cariHareketler.cariHesapId, cariHesapId))
            .limit(limit);
    }
    async createCariHareket(data) {
        const valuesToInsert = {
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
    async getAllTeklifler() {
        return await this.getDbInstance().select().from(teklifler);
    }
    async getTeklifById(id) {
        const [quote] = await this.getDbInstance().select().from(teklifler).where(eq(teklifler.id, id));
        return quote;
    }
    async createTeklif(data) {
        const valuesToInsert = {
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
    async updateTeklif(id, data) {
        const valuesToUpdate = {
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
    async deleteTeklif(id) {
        await this.getDbInstance().delete(teklifler).where(eq(teklifler.id, id));
        return true;
    }
    async getTekliflerByTur(tur) {
        return await this.getDbInstance()
            .select()
            .from(teklifler)
            .where(eq(teklifler.teklifTuru, tur));
    }
    async searchTeklifler(query) {
        const lowerQuery = query.toLowerCase();
        const results = await this.getDbInstance().select().from(teklifler);
        return results.filter(t => t.teklifNo.toLowerCase().includes(lowerQuery) ||
            t.teklifKonusu.toLowerCase().includes(lowerQuery));
    }
    // Teklif Kalemleri
    async getTeklifKalemleriByTeklifId(teklifId) {
        return await this.getDbInstance()
            .select()
            .from(teklifKalemleri)
            .where(eq(teklifKalemleri.teklifId, teklifId));
    }
    async createTeklifKalemi(data) {
        const valuesToInsert = {
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
    async deleteTeklifKalemleriByTeklifId(teklifId) {
        await this.getDbInstance().delete(teklifKalemleri).where(eq(teklifKalemleri.teklifId, teklifId));
        return true;
    }
    // Projeler
    async getAllProjeler() {
        return await this.getDbInstance().select().from(projeler);
    }
    async getProjeById(id) {
        const [project] = await this.getDbInstance().select().from(projeler).where(eq(projeler.id, id));
        return project;
    }
    async createProje(data) {
        const valuesToInsert = {
            ...removeUndefinedProps(data),
            cariHesapId: data.cariHesapId,
            projeNo: data.projeNo,
            projeAdi: data.projeAdi,
            projeTarihi: data.projeTarihi,
        };
        const [created] = await this.getDbInstance().insert(projeler).values(valuesToInsert).returning();
        return created;
    }
    async updateProje(id, data) {
        const valuesToUpdate = {
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
    async deleteProje(id) {
        await this.getDbInstance().delete(projeler).where(eq(projeler.id, id));
        return true;
    }
    async getProjelerByDurum(durum) {
        return await this.getDbInstance()
            .select()
            .from(projeler)
            .where(eq(projeler.projeDurumu, durum));
    }
    async searchProjeler(query) {
        const lowerQuery = query.toLowerCase();
        const results = await this.getDbInstance().select().from(projeler);
        return results.filter(p => p.projeNo.toLowerCase().includes(lowerQuery) ||
            p.projeAdi.toLowerCase().includes(lowerQuery) ||
            p.aciklama?.toLowerCase().includes(lowerQuery));
    }
    // Görevler
    async getAllGorevler() {
        return await this.getDbInstance().select().from(gorevler);
    }
    async getGorevById(id) {
        const [task] = await this.getDbInstance().select().from(gorevler).where(eq(gorevler.id, id));
        return task;
    }
    async createGorev(data) {
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
    async updateGorev(id, data) {
        const valuesToUpdate = {
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
    async deleteGorev(id) {
        await this.getDbInstance().delete(gorevler).where(eq(gorevler.id, id));
        return true;
    }
    async getGorevlerByDurum(durum) {
        return await this.getDbInstance()
            .select()
            .from(gorevler)
            .where(eq(gorevler.durum, durum));
    }
    async getGorevlerByCariId(cariHesapId) {
        return await this.getDbInstance()
            .select()
            .from(gorevler)
            .where(eq(gorevler.cariHesapId, cariHesapId));
    }
    async getGorevlerByProjeId(projeId) {
        return await this.getDbInstance()
            .select()
            .from(gorevler)
            .where(eq(gorevler.projeId, projeId));
    }
    async searchGorevler(query) {
        const lowerQuery = query.toLowerCase();
        const results = await this.getDbInstance().select().from(gorevler);
        return results.filter(g => g.baslik.toLowerCase().includes(lowerQuery) ||
            g.aciklama?.toLowerCase().includes(lowerQuery) ||
            g.atananKisi?.toLowerCase().includes(lowerQuery));
    }
    async getDashboardStats(period = 'thisMonth') {
        // Bu metodu daha sonra implement edeceğiz
        return {};
    }
    async getRecentActivities(limit = 10) {
        // TODO: Implement this method
        return [];
    }
    async getUpcomingTasks(limit = 5) {
        const results = await this.getDbInstance()
            .select()
            .from(gorevler)
            .where(eq(gorevler.durum, "Bekliyor"))
            .limit(limit);
        return results;
    }
}
