import { pgTable, text, serial, timestamp, varchar, numeric, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Kullanıcılar tablosu
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Cari Hesaplar tablosu
export const cariHesaplar = pgTable("cari_hesaplar", {
  id: serial("id").primaryKey(),
  ad: text("ad").notNull(),
  tip: text("tip").notNull(),
  vergiDairesi: text("vergi_dairesi"),
  vergiNo: text("vergi_no"),
  adres: text("adres"),
  telefon: text("telefon"),
  email: text("email"),
  notlar: text("notlar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Yetkili Kişiler tablosu
export const yetkiliKisiler = pgTable("yetkili_kisiler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull(),
  ad: text("ad").notNull(),
  unvan: text("unvan"),
  telefon: text("telefon"),
  email: text("email"),
  notlar: text("notlar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Projeler tablosu
export const projeler = pgTable("projeler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull(),
  projeNo: text("proje_no").notNull(),
  projeAdi: text("proje_adi").notNull(),
  baslangicTarihi: timestamp("baslangic_tarihi").notNull(),
  bitisTarihi: timestamp("bitis_tarihi"),
  durum: text("durum").notNull(),
  butce: decimal("butce"),
  notlar: text("notlar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Cari Hesap Hareketleri tablosu
export const cariHareketler = pgTable("cari_hareketler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull(),
  tip: text("tip").notNull(),
  tutar: decimal("tutar").notNull(),
  aciklama: text("aciklama"),
  tarih: timestamp("tarih").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Teklifler tablosu
export const teklifler = pgTable("teklifler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull(),
  teklifNo: text("teklif_no").notNull(),
  teklifTarihi: timestamp("teklif_tarihi").notNull(),
  gecerlilikTarihi: timestamp("gecerlilik_tarihi"),
  durum: text("durum").notNull(),
  toplamTutar: decimal("toplam_tutar").notNull(),
  notlar: text("notlar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Teklif Kalemleri tablosu
export const teklifKalemleri = pgTable("teklif_kalemleri", {
  id: serial("id").primaryKey(),
  teklifId: integer("teklif_id").notNull(),
  urunKodu: text("urun_kodu").notNull(),
  urunAdi: text("urun_adi").notNull(),
  miktar: decimal("miktar").notNull(),
  birim: text("birim").notNull(),
  birimFiyat: decimal("birim_fiyat").notNull(),
  kdvOrani: decimal("kdv_orani").notNull(),
  toplamTutar: decimal("toplam_tutar").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Yapılacaklar/Görevler tablosu
export const gorevler = pgTable("gorevler", {
  id: serial("id").primaryKey(),
  projeId: integer("proje_id"),
  cariHesapId: integer("cari_hesap_id"),
  baslik: text("baslik").notNull(),
  aciklama: text("aciklama"),
  baslangicTarihi: timestamp("baslangic_tarihi").notNull(),
  bitisTarihi: timestamp("bitis_tarihi"),
  durum: text("durum").notNull(),
  oncelik: text("oncelik").notNull(),
  atananKisi: text("atanan_kisi"),
  notlar: text("notlar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Insert ve Update schemaları
export const insertUserSchema = createInsertSchema(users, {
  // id: z.undefined(), // Otomatik artan alanlar için bu şekilde bırakılabilir veya tamamen çıkarılabilir.
  // createdAt: z.undefined(),
  // updatedAt: z.undefined(),
});

export const insertCariHesapSchema = createInsertSchema(cariHesaplar);
export type InsertCariHesap = Omit<CariHesap, 'id' | 'createdAt' | 'updatedAt'>;

export const insertYetkiliKisiSchema = z.object({
  cariHesapId: z.number(),
  adSoyad: z.string(),
  gorevi: z.string().nullable(),
  departman: z.string().nullable(),
  telefon: z.string().nullable(),
  email: z.string().nullable(),
  notlar: z.string().nullable()
});

export type InsertYetkiliKisi = z.infer<typeof insertYetkiliKisiSchema>;

export const insertCariHareketSchema = z.object({
  cariHesapId: z.number(),
  tur: z.string(),
  tutar: z.string(),
  bakiye: z.string(),
  aciklama: z.string().nullable(),
  projeId: z.number().nullable(),
  tarih: z.date().optional().default(() => new Date())
});

export type InsertCariHareket = z.infer<typeof insertCariHareketSchema>;

export const insertTeklifSchema = createInsertSchema(teklifler);
export type InsertTeklif = Omit<Teklif, 'id' | 'createdAt' | 'updatedAt'>;

export const insertTeklifKalemiSchema = createInsertSchema(teklifKalemleri);
export type InsertTeklifKalemi = Omit<TeklifKalemi, 'id' | 'createdAt'>;

export const insertProjeSchema = z.object({
  cariHesapId: z.number(),
  teklifId: z.number().optional(),
  projeNo: z.string(),
  projeAdi: z.string(),
  projeDurumu: z.string(),
  projeTarihi: z.string().transform(str => new Date(str)),
  sonTeslimTarihi: z.string().optional().transform(str => str ? new Date(str) : null),
  butce: z.string().optional(),
  harcananTutar: z.string().optional(),
  tamamlanmaOrani: z.number().optional(),
  sorumluKisi: z.string().optional(),
  aciklama: z.string().optional(),
  notlar: z.string().optional(),
  dosyalar: z.array(z.string()).optional()
});

export type InsertProje = z.infer<typeof insertProjeSchema>;

export const insertGorevSchema = z.object({
  projeId: z.number().optional(),
  cariHesapId: z.number(),
  baslik: z.string(),
  aciklama: z.string().optional(),
  baslangicTarihi: z.string().transform(str => new Date(str)),
  bitisTarihi: z.string().optional().transform(str => str ? new Date(str) : null),
  sonTeslimTarihi: z.string().optional().transform(str => str ? new Date(str) : null),
  durum: z.string(),
  oncelik: z.string(),
  atananKisi: z.string().optional(),
  siralama: z.number().optional(),
  etiketler: z.array(z.string()).optional(),
  dosyalar: z.array(z.string()).optional(),
  notlar: z.string().optional(),
  userId: z.number().nullable().default(null)
});

export type InsertGorev = z.infer<typeof insertGorevSchema>;

// Temel tipler
export type CariHesap = {
  id: number;
  firmaAdi: string;
  firmaTuru: string;
  subeBolge: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  adres: string | null;
  telefon: string | null;
  email: string | null;
  notlar: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type YetkiliKisi = {
  id: number;
  cariHesapId: number;
  adSoyad: string;
  gorevi: string | null;
  departman: string | null;
  telefon: string | null;
  email: string | null;
  notlar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CariHareket = {
  id: number;
  cariHesapId: number;
  tur: string;
  tutar: string;
  bakiye: string;
  aciklama: string | null;
  projeId: number | null;
  tarih: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Teklif = {
  id: number;
  cariHesapId: number;
  yetkiliKisiId: number | null;
  teklifNo: string;
  teklifTuru: string;
  teklifKonusu: string;
  teklifDurumu: string;
  odemeSekli: string | null;
  gecerlilikSuresi: string | null;
  paraBirimi: string | null;
  toplamTutar: string;
  notlar: string | null;
  dosyalar: string[] | null;
  tarih: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TeklifKalemi = {
  id: number;
  teklifId: number;
  urunHizmetAdi: string;
  miktar: string;
  birim: string;
  birimFiyat: string;
  tutar: string;
  iskontoTutari: string | null;
  netTutar: string;
  kdvOrani: string;
  toplamTutar: string;
  createdAt: Date;
};

export type Proje = {
  id: number;
  cariHesapId: number;
  teklifId: number | null;
  projeNo: string;
  projeAdi: string;
  projeDurumu: string;
  projeTarihi: Date;
  sonTeslimTarihi: Date | null;
  butce: string | null;
  harcananTutar: string | null;
  tamamlanmaOrani: number | null;
  sorumluKisi: string | null;
  aciklama: string | null;
  notlar: string | null;
  dosyalar: string[] | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Gorev = {
  id: number;
  baslik: string;
  aciklama: string | null;
  durum: string;
  oncelik: string;
  baslangicTarihi: Date;
  bitisTarihi: Date | null;
  sonTeslimTarihi: Date | null;
  atananKisi: string | null;
  cariHesapId: number;
  projeId: number | null;
  userId: number | null;
  siralama: number | null;
  etiketler: string[] | null;
  dosyalar: string[] | null;
  createdAt: Date;
  updatedAt: Date;
};

// Form şemaları
export const cariHesapFormSchema = z.object({
  firmaAdi: z.string().min(1, "Firma adı zorunludur"),
  firmaTuru: z.string().min(1, "Firma türü zorunludur"),
  subeBolge: z.string().optional(),
  vergiDairesi: z.string().optional(),
  vergiNo: z.string().optional(),
  adres: z.string().optional(),
  telefon: z.string().optional(),
  email: z.string().email("Geçerli bir email adresi giriniz").optional(),
  notlar: z.string().optional()
});

export const teklifFormSchema = z.object({
  cariHesapId: z.number(),
  yetkiliKisiId: z.number().optional(),
  teklifNo: z.string(),
  teklifTuru: z.string(),
  teklifKonusu: z.string(),
  teklifDurumu: z.string(),
  odemeSekli: z.string().optional(),
  gecerlilikSuresi: z.string().optional(),
  paraBirimi: z.string().optional(),
  toplamTutar: z.string(),
  notlar: z.string().optional(),
  dosyalar: z.array(z.string()).optional()
});

export const projeFormSchema = z.object({
  cariHesapId: z.number(),
  teklifId: z.number().optional(),
  projeNo: z.string(),
  projeAdi: z.string(),
  projeDurumu: z.string(),
  projeTarihi: z.string().transform(str => new Date(str)),
  sonTeslimTarihi: z.string().optional().transform(str => str ? new Date(str) : null),
  butce: z.string().optional(),
  harcananTutar: z.string().optional(),
  tamamlanmaOrani: z.number().optional(),
  sorumluKisi: z.string().optional(),
  aciklama: z.string().optional(),
  notlar: z.string().optional(),
  dosyalar: z.array(z.string()).optional()
});

export const gorevFormSchema = z.object({
  projeId: z.number().optional(),
  cariHesapId: z.number(),
  baslik: z.string(),
  aciklama: z.string().optional(),
  baslangicTarihi: z.string().transform(str => new Date(str)),
  bitisTarihi: z.string().optional().transform(str => str ? new Date(str) : null),
  sonTeslimTarihi: z.string().optional().transform(str => str ? new Date(str) : null),
  durum: z.string(),
  oncelik: z.string(),
  atananKisi: z.string().optional(),
  siralama: z.number().optional(),
  etiketler: z.array(z.string()).optional(),
  dosyalar: z.array(z.string()).optional(),
  notlar: z.string().optional(),
  userId: z.number().nullable().default(null)
});

// Zod şemaları
export const cariHesapSchema = z.object({
  id: z.number(),
  firmaAdi: z.string(),
  firmaTuru: z.string(),
  subeBolge: z.string().nullable(),
  vergiDairesi: z.string().nullable(),
  vergiNo: z.string().nullable(),
  adres: z.string().nullable(),
  telefon: z.string().nullable(),
  email: z.string().nullable(),
  notlar: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const yetkiliKisiSchema = z.object({
  id: z.number(),
  cariHesapId: z.number(),
  adSoyad: z.string(),
  gorevi: z.string().nullable(),
  departman: z.string().nullable(),
  telefon: z.string().nullable(),
  email: z.string().nullable(),
  notlar: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const cariHareketSchema = z.object({
  id: z.number(),
  cariHesapId: z.number(),
  tur: z.string(),
  tutar: z.string(),
  bakiye: z.string(),
  aciklama: z.string().nullable(),
  projeId: z.number().nullable(),
  tarih: z.date(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const teklifSchema = z.object({
  id: z.number(),
  cariHesapId: z.number(),
  yetkiliKisiId: z.number().nullable(),
  teklifNo: z.string(),
  teklifTuru: z.string(),
  teklifKonusu: z.string(),
  teklifDurumu: z.string(),
  odemeSekli: z.string().nullable(),
  gecerlilikSuresi: z.string().nullable(),
  paraBirimi: z.string().nullable(),
  toplamTutar: z.string(),
  notlar: z.string().nullable(),
  dosyalar: z.array(z.string()).nullable(),
  tarih: z.date(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const teklifKalemiSchema = z.object({
  id: z.number(),
  teklifId: z.number(),
  urunHizmetAdi: z.string(),
  miktar: z.string(),
  birim: z.string(),
  birimFiyat: z.string(),
  tutar: z.string(),
  iskontoTutari: z.string().nullable(),
  netTutar: z.string(),
  kdvOrani: z.string(),
  toplamTutar: z.string(),
  createdAt: z.date()
});

export const projeSchema = z.object({
  id: z.number(),
  cariHesapId: z.number(),
  teklifId: z.number().nullable(),
  projeNo: z.string(),
  projeAdi: z.string(),
  projeDurumu: z.string(),
  projeTarihi: z.date(),
  sonTeslimTarihi: z.date().nullable(),
  butce: z.string().nullable(),
  harcananTutar: z.string().nullable(),
  tamamlanmaOrani: z.number().nullable(),
  sorumluKisi: z.string().nullable(),
  aciklama: z.string().nullable(),
  notlar: z.string().nullable(),
  dosyalar: z.array(z.string()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const gorevSchema = z.object({
  id: z.number(),
  baslik: z.string(),
  aciklama: z.string().nullable(),
  durum: z.string(),
  oncelik: z.string(),
  baslangicTarihi: z.date(),
  bitisTarihi: z.date().nullable(),
  sonTeslimTarihi: z.date().nullable(),
  atananKisi: z.string().nullable(),
  cariHesapId: z.number(),
  projeId: z.number().nullable(),
  userId: z.number().nullable(),
  siralama: z.number().nullable(),
  etiketler: z.array(z.string()).nullable(),
  dosyalar: z.array(z.string()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});