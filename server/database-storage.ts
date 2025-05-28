import {
  users, User, InsertUser,
  cariHesaplar as accounts, CariHesap as Account, InsertCariHesap as InsertAccount,
  cariHareketler as transactions, CariHareket as Transaction, InsertCariHareket as InsertTransaction,
  teklifler as quotes, Teklif as Quote, InsertTeklif as InsertQuote,
  teklifKalemleri as quoteItems, TeklifKalemi as QuoteItem, InsertTeklifKalemi as InsertQuoteItem,
  projeler as projects, Proje as Project, InsertProje as InsertProject,
  gorevler as tasks, Gorev as Task, InsertGorev as InsertTask,
} from "@shared/schema";
import { db as getDb } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  private getDbInstance() {
    return getDb;
  }

  // Cari Hesaplar
  async getAllCariHesaplar(): Promise<Account[]> {
    return await this.getDbInstance().select().from(accounts);
  }

  async getCariHesapById(id: number): Promise<Account | undefined> {
    const [account] = await this.getDbInstance().select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async createCariHesap(data: InsertAccount): Promise<Account> {
    const [created] = await this.getDbInstance().insert(accounts).values(data).returning();
    return created;
  }

  async updateCariHesap(id: number, data: Partial<InsertAccount>): Promise<Account | undefined> {
    const [updated] = await this.getDbInstance()
      .update(accounts)
      .set(data)
      .where(eq(accounts.id, id))
      .returning();
    return updated;
  }

  async deleteCariHesap(id: number): Promise<boolean> {
    await this.getDbInstance().delete(accounts).where(eq(accounts.id, id));
    return true;
  }

  async searchCariHesaplar(query: string): Promise<Account[]> {
    const lowerQuery = query.toLowerCase();
    const results = await this.getDbInstance().select().from(accounts);
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
    const [created] = await this.getDbInstance().insert(yetkiliKisiler).values(data).returning();
    return created;
  }

  async updateYetkiliKisi(id: number, data: Partial<InsertYetkiliKisi>): Promise<YetkiliKisi | undefined> {
    const [updated] = await this.getDbInstance()
      .update(yetkiliKisiler)
      .set(data)
      .where(eq(yetkiliKisiler.id, id))
      .returning();
    return updated;
  }

  async deleteYetkiliKisi(id: number): Promise<boolean> {
    await this.getDbInstance().delete(yetkiliKisiler).where(eq(yetkiliKisiler.id, id));
    return true;
  }

  // Cari Hareketler
  async getCariHareketlerByCariId(cariHesapId: number, limit: number = 25): Promise<CariHareket[]> {
    return await this.getDbInstance()
      .select()
      .from(transactions)
      .where(eq(transactions.cariHesapId, cariHesapId))
      .limit(limit);
  }

  async createCariHareket(data: InsertCariHareket): Promise<CariHareket> {
    const [created] = await this.getDbInstance().insert(transactions).values(data).returning();
    return created;
  }

  // Teklifler
  async getAllTeklifler(): Promise<Quote[]> {
    return await this.getDbInstance().select().from(quotes);
  }

  async getTeklifById(id: number): Promise<Quote | undefined> {
    const [quote] = await this.getDbInstance().select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async createTeklif(data: InsertQuote): Promise<Quote> {
    const [created] = await this.getDbInstance().insert(quotes).values(data).returning();
    return created;
  }

  async updateTeklif(id: number, data: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updated] = await this.getDbInstance()
      .update(quotes)
      .set(data)
      .where(eq(quotes.id, id))
      .returning();
    return updated;
  }

  async deleteTeklif(id: number): Promise<boolean> {
    await this.getDbInstance().delete(quotes).where(eq(quotes.id, id));
    return true;
  }

  async getTekliflerByTur(tur: string): Promise<Quote[]> {
    return await this.getDbInstance()
      .select()
      .from(quotes)
      .where(eq(quotes.teklifTuru, tur));
  }

  async searchTeklifler(query: string): Promise<Quote[]> {
    const lowerQuery = query.toLowerCase();
    const results = await this.getDbInstance().select().from(quotes);
    return results.filter(t => 
      t.teklifNo.toLowerCase().includes(lowerQuery) ||
      t.teklifKonusu.toLowerCase().includes(lowerQuery)
    );
  }

  // Teklif Kalemleri
  async getTeklifKalemleriByTeklifId(teklifId: number): Promise<QuoteItem[]> {
    return await this.getDbInstance()
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.teklifId, teklifId));
  }

  async createTeklifKalemi(data: InsertQuoteItem): Promise<QuoteItem> {
    const [created] = await this.getDbInstance().insert(quoteItems).values(data).returning();
    return created;
  }

  async deleteTeklifKalemleriByTeklifId(teklifId: number): Promise<boolean> {
    await this.getDbInstance().delete(quoteItems).where(eq(quoteItems.teklifId, teklifId));
    return true;
  }

  // Projeler
  async getAllProjeler(): Promise<Project[]> {
    return await this.getDbInstance().select().from(projects);
  }

  async getProjeById(id: number): Promise<Project | undefined> {
    const [project] = await this.getDbInstance().select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProje(data: InsertProject): Promise<Project> {
    const [created] = await this.getDbInstance().insert(projects).values(data).returning();
    return created;
  }

  async updateProje(id: number, data: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await this.getDbInstance()
      .update(projects)
      .set(data)
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProje(id: number): Promise<boolean> {
    await this.getDbInstance().delete(projects).where(eq(projects.id, id));
    return true;
  }

  async getProjelerByDurum(durum: string): Promise<Project[]> {
    return await this.getDbInstance()
      .select()
      .from(projects)
      .where(eq(projects.projeDurumu, durum));
  }

  async searchProjeler(query: string): Promise<Project[]> {
    const lowerQuery = query.toLowerCase();
    const results = await this.getDbInstance().select().from(projects);
    return results.filter(p => 
      p.projeNo.toLowerCase().includes(lowerQuery) ||
      p.projeAdi.toLowerCase().includes(lowerQuery) ||
      p.aciklama?.toLowerCase().includes(lowerQuery)
    );
  }

  // Görevler
  async getAllGorevler(): Promise<Task[]> {
    return await this.getDbInstance().select().from(tasks);
  }

  async getGorevById(id: number): Promise<Task | undefined> {
    const [task] = await this.getDbInstance().select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createGorev(data: InsertTask): Promise<Task> {
    const [created] = await this.getDbInstance().insert(tasks).values(data).returning();
    return created;
  }

  async updateGorev(id: number, data: Partial<InsertTask>): Promise<Task | undefined> {
    const [updated] = await this.getDbInstance()
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteGorev(id: number): Promise<boolean> {
    await this.getDbInstance().delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  async getGorevlerByDurum(durum: string): Promise<Task[]> {
    return await this.getDbInstance()
      .select()
      .from(tasks)
      .where(eq(tasks.durum, durum));
  }

  async getGorevlerByCariId(cariHesapId: number): Promise<Task[]> {
    return await this.getDbInstance()
      .select()
      .from(tasks)
      .where(eq(tasks.cariHesapId, cariHesapId));
  }

  async getGorevlerByProjeId(projeId: number): Promise<Task[]> {
    return await this.getDbInstance()
      .select()
      .from(tasks)
      .where(eq(tasks.projeId, projeId));
  }

  async searchGorevler(query: string): Promise<Task[]> {
    const lowerQuery = query.toLowerCase();
    const results = await this.getDbInstance().select().from(tasks);
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