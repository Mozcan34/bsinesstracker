import { pgTable, text, serial, timestamp, varchar, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Kullanıcılar tablosu
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cari Hesaplar tablosu
export const cariHesaplar = pgTable("cari_hesaplar", {
  id: serial("id").primaryKey(),
  firmaAdi: varchar("firma_adi", { length: 255 }).notNull(),
  subeBolge: varchar("sube_bolge", { length: 255 }),
  firmaTuru: varchar("firma_turu", { length: 50 }).notNull(), // "Alıcı" veya "Satıcı"
  telefon: varchar("telefon", { length: 50 }),
  email: varchar("email", { length: 255 }),
  adres: text("adres"),
  vergiNo: varchar("vergi_no", { length: 50 }),
  vergiDairesi: varchar("vergi_dairesi", { length: 100 }),
  notlar: text("notlar"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Yetkili Kişiler tablosu
export const yetkiliKisiler = pgTable("yetkili_kisiler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull().references(() => cariHesaplar.id),
  adSoyad: varchar("ad_soyad", { length: 255 }).notNull(),
  gorevi: varchar("gorevi", { length: 100 }),
  telefon: varchar("telefon", { length: 50 }),
  email: varchar("email", { length: 255 }),
  departman: varchar("departman", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projeler tablosu
export const projeler = pgTable("projeler", {
  id: serial("id").primaryKey(),
  projeNo: varchar("proje_no", { length: 50 }).notNull().unique(),
  projeAdi: varchar("proje_adi", { length: 255 }).notNull(),
  aciklama: text("aciklama"),
  cariHesapId: integer("cari_hesap_id").notNull().references(() => cariHesaplar.id),
  teklifId: integer("teklif_id"),
  projeTarihi: timestamp("proje_tarihi").notNull(),
  sonTeslimTarihi: timestamp("son_teslim_tarihi"),
  projeDurumu: varchar("proje_durumu", { length: 20 }).notNull().default("Devam Ediyor"),
  butce: numeric("butce", { precision: 15, scale: 2 }),
  harcananTutar: numeric("harcanan_tutar", { precision: 15, scale: 2 }).default("0"),
  tamamlanmaOrani: integer("tamamlanma_orani").default(0),
  sorumluKisi: varchar("sorumlu_kisi", { length: 255 }),
  notlar: text("notlar"),
  dosyalar: text("dosyalar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cari Hesap Hareketleri tablosu
export const cariHareketler = pgTable("cari_hareketler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull().references(() => cariHesaplar.id),
  tarih: timestamp("tarih").notNull(),
  aciklama: text("aciklama").notNull(),
  tur: varchar("tur", { length: 20 }).notNull(),
  tutar: numeric("tutar", { precision: 15, scale: 2 }).notNull(),
  bakiye: numeric("bakiye", { precision: 15, scale: 2 }).notNull(),
  projeId: integer("proje_id").references(() => projeler.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Teklifler tablosu
export const teklifler = pgTable("teklifler", {
  id: serial("id").primaryKey(),
  teklifNo: varchar("teklif_no", { length: 50 }).notNull().unique(),
  teklifTuru: varchar("teklif_turu", { length: 20 }).notNull(),
  tarih: timestamp("tarih").notNull(),
  cariHesapId: integer("cari_hesap_id").notNull().references(() => cariHesaplar.id),
  yetkiliKisiId: integer("yetkili_kisi_id").references(() => yetkiliKisiler.id),
  teklifKonusu: varchar("teklif_konusu", { length: 500 }).notNull(),
  teklifDurumu: varchar("teklif_durumu", { length: 20 }).notNull().default("Beklemede"),
  odemeSekli: varchar("odeme_sekli", { length: 100 }),
  gecerlilikSuresi: varchar("gecerlilik_suresi", { length: 100 }),
  paraBirimi: varchar("para_birimi", { length: 5 }).notNull().default("₺"),
  toplamTutar: numeric("toplam_tutar", { precision: 15, scale: 2 }),
  notlar: text("notlar"),
  dosyalar: text("dosyalar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Teklif Kalemleri tablosu
export const teklifKalemleri = pgTable("teklif_kalemleri", {
  id: serial("id").primaryKey(),
  teklifId: integer("teklif_id").notNull().references(() => teklifler.id),
  urunHizmetAdi: varchar("urun_hizmet_adi", { length: 255 }).notNull(),
  miktar: numeric("miktar", { precision: 10, scale: 2 }).notNull(),
  birim: varchar("birim", { length: 20 }).notNull(),
  birimFiyat: numeric("birim_fiyat", { precision: 15, scale: 2 }).notNull(),
  tutar: numeric("tutar", { precision: 15, scale: 2 }).notNull(),
  iskontoTutari: numeric("iskonto_tutari", { precision: 15, scale: 2 }).default("0"),
  netTutar: numeric("net_tutar", { precision: 15, scale: 2 }).notNull(),
  kdvOrani: numeric("kdv_orani", { precision: 5, scale: 2 }).default("0"),
  toplamTutar: numeric("toplam_tutar", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Yapılacaklar/Görevler tablosu
export const gorevler = pgTable("gorevler", {
  id: serial("id").primaryKey(),
  baslik: varchar("baslik", { length: 255 }).notNull(),
  aciklama: text("aciklama"),
  durum: varchar("durum", { length: 20 }).notNull().default("Bekliyor"),
  oncelik: varchar("oncelik", { length: 20 }).notNull().default("Orta"),
  baslangicTarihi: timestamp("baslangic_tarihi"),
  bitisTarihi: timestamp("bitis_tarihi"),
  sonTeslimTarihi: timestamp("son_teslim_tarihi"),
  atananKisi: varchar("atanan_kisi", { length: 255 }),
  cariHesapId: integer("cari_hesap_id").references(() => cariHesaplar.id),
  projeId: integer("proje_id").references(() => projeler.id),
  userId: integer("user_id").references(() => users.id),
  siralama: integer("siralama").default(0),
  etiketler: text("etiketler"),
  dosyalar: text("dosyalar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert ve Update schemaları
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCariHesapSchema = createInsertSchema(cariHesaplar).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertYetkiliKisiSchema = createInsertSchema(yetkiliKisiler).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCariHareketSchema = createInsertSchema(cariHareketler).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeklifSchema = createInsertSchema(teklifler).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeklifKalemiSchema = createInsertSchema(teklifKalemleri).omit({
  id: true,
  createdAt: true,
});

export const insertProjeSchema = createInsertSchema(projeler).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGorevSchema = createInsertSchema(gorevler).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CariHesap = typeof cariHesaplar.$inferSelect;
export type InsertCariHesap = z.infer<typeof insertCariHesapSchema>;

export type YetkiliKisi = typeof yetkiliKisiler.$inferSelect;
export type InsertYetkiliKisi = z.infer<typeof insertYetkiliKisiSchema>;

export type CariHareket = typeof cariHareketler.$inferSelect;
export type InsertCariHareket = z.infer<typeof insertCariHareketSchema>;

export type Teklif = typeof teklifler.$inferSelect;
export type InsertTeklif = z.infer<typeof insertTeklifSchema>;

export type TeklifKalemi = typeof teklifKalemleri.$inferSelect;
export type InsertTeklifKalemi = z.infer<typeof insertTeklifKalemiSchema>;

export type Proje = typeof projeler.$inferSelect;
export type InsertProje = z.infer<typeof insertProjeSchema>;

export type Gorev = typeof gorevler.$inferSelect;
export type InsertGorev = z.infer<typeof insertGorevSchema>;

// Form validation schemaları
export const cariHesapFormSchema = insertCariHesapSchema.extend({
  firmaAdi: z.string().min(1, "Firma adı gereklidir"),
  firmaTuru: z.enum(["Alıcı", "Satıcı"], {
    errorMap: () => ({ message: "Geçerli bir firma türü seçin" }),
  }),
});

export const teklifFormSchema = insertTeklifSchema.extend({
  teklifKonusu: z.string().min(1, "Teklif konusu gereklidir"),
  teklifTuru: z.enum(["Verilen", "Alınan"], {
    errorMap: () => ({ message: "Geçerli bir teklif türü seçin" }),
  }),
  teklifDurumu: z.enum(["Beklemede", "Onaylandı", "Kaybedildi", "İptal"], {
    errorMap: () => ({ message: "Geçerli bir durum seçin" }),
  }),
});

export const projeFormSchema = insertProjeSchema.extend({
  projeAdi: z.string().min(1, "Proje adı gereklidir"),
  projeDurumu: z.enum(["Devam Ediyor", "Tamamlandı", "İptal", "Beklemede"], {
    errorMap: () => ({ message: "Geçerli bir durum seçin" }),
  }),
});

export const gorevFormSchema = insertGorevSchema.extend({
  baslik: z.string().min(1, "Görev başlığı gereklidir"),
  durum: z.enum(["Bekliyor", "Devam Ediyor", "Tamamlandı"], {
    errorMap: () => ({ message: "Geçerli bir durum seçin" }),
  }),
  oncelik: z.enum(["Düşük", "Orta", "Yüksek"], {
    errorMap: () => ({ message: "Geçerli bir öncelik seçin" }),
  }),
});

export type CariHesapFormData = z.infer<typeof cariHesapFormSchema>;
export type TeklifFormData = z.infer<typeof teklifFormSchema>;
export type ProjeFormData = z.infer<typeof projeFormSchema>;
export type GorevFormData = z.infer<typeof gorevFormSchema>;