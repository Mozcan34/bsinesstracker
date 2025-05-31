import { pgTable, text, serial, timestamp, varchar, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { z } from "zod";

// Kullanıcılar tablosu
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  position: varchar("position", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cari Hesaplar tablosu
export const cariHesaplar = pgTable("cari_hesaplar", {
  id: serial("id").primaryKey(),
  firmaAdi: text("firma_adi").notNull(),
  firmaTuru: text("firma_turu").notNull(),
  subeBolge: text("sube_bolge"),
  vergiDairesi: text("vergi_dairesi"),
  vergiNo: text("vergi_no"),
  adres: text("adres"),
  telefon: text("telefon"),
  email: text("email"),
  notlar: text("notlar"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Yetkili Kişiler tablosu
export const yetkiliKisiler = pgTable("yetkili_kisiler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull(),
  adSoyad: text("ad_soyad").notNull(),
  gorevi: text("gorevi"),
  departman: text("departman"),
  telefon: text("telefon"),
  email: text("email"),
  notlar: text("notlar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Cari Hesap Hareketleri tablosu
export const cariHareketler = pgTable("cari_hareketler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull(),
  tur: text("tur").notNull(),
  tutar: decimal("tutar").notNull(),
  bakiye: decimal("bakiye").notNull(),
  aciklama: text("aciklama"),
  projeId: integer("proje_id"),
  tarih: timestamp("tarih").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Teklifler tablosu
export const teklifler = pgTable("teklifler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull(),
  yetkiliKisiId: integer("yetkili_kisi_id"),
  teklifNo: text("teklif_no").notNull(),
  teklifTuru: text("teklif_turu").notNull(),
  teklifKonusu: text("teklif_konusu").notNull(),
  teklifDurumu: text("teklif_durumu").notNull(),
  odemeSekli: text("odeme_sekli"),
  gecerlilikSuresi: text("gecerlilik_suresi"),
  paraBirimi: text("para_birimi"),
  toplamTutar: decimal("toplam_tutar").notNull(),
  notlar: text("notlar"),
  dosyalar: text("dosyalar").array(),
  tarih: timestamp("tarih").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Teklif Kalemleri tablosu
export const teklifKalemleri = pgTable("teklif_kalemleri", {
  id: serial("id").primaryKey(),
  teklifId: integer("teklif_id").notNull(),
  urunHizmetAdi: text("urun_hizmet_adi").notNull(),
  miktar: decimal("miktar").notNull(),
  birim: text("birim").notNull(),
  birimFiyat: decimal("birim_fiyat").notNull(),
  tutar: decimal("tutar").notNull(),
  iskontoTutari: decimal("iskonto_tutari"),
  netTutar: decimal("net_tutar").notNull(),
  kdvOrani: decimal("kdv_orani").notNull(),
  toplamTutar: decimal("toplam_tutar").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Projeler tablosu
export const projeler = pgTable("projeler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull(),
  teklifId: integer("teklif_id"),
  projeNo: text("proje_no").notNull(),
  projeAdi: text("proje_adi").notNull(),
  projeDurumu: text("proje_durumu").notNull(),
  projeTarihi: timestamp("proje_tarihi").notNull(),
  sonTeslimTarihi: timestamp("son_teslim_tarihi"),
  butce: decimal("butce"),
  harcananTutar: decimal("harcanan_tutar"),
  tamamlanmaOrani: integer("tamamlanma_orani"),
  sorumluKisi: text("sorumlu_kisi"),
  aciklama: text("aciklama"),
  notlar: text("notlar"),
  dosyalar: text("dosyalar").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Görevler tablosu
export const gorevler = pgTable("gorevler", {
  id: serial("id").primaryKey(),
  projeId: integer("proje_id"),
  cariHesapId: integer("cari_hesap_id").notNull(),
  baslik: text("baslik").notNull(),
  aciklama: text("aciklama"),
  baslangicTarihi: timestamp("baslangic_tarihi").notNull(),
  bitisTarihi: timestamp("bitis_tarihi"),
  sonTeslimTarihi: timestamp("son_teslim_tarihi"),
  durum: text("durum").notNull(),
  oncelik: text("oncelik").notNull(),
  atananKisi: text("atanan_kisi"),
  userId: integer("user_id"),
  siralama: integer("siralama"),
  etiketler: text("etiketler").array(),
  dosyalar: text("dosyalar").array(),
  notlar: text("notlar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Zod şemaları
export const insertUserSchema = z.object({
  username: z.string().min(3, { message: "Kullanıcı adı en az 3 karakter olmalıdır" }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır" }),
  name: z.string().min(2, { message: "Ad Soyad en az 2 karakter olmalıdır" }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  phone: z.string().optional(),
  position: z.string().optional(),
});

export const insertCariHesapSchema = z.object({
  firmaAdi: z.string().min(1, "Firma adı zorunludur"),
  firmaTuru: z.string().min(1, "Firma türü zorunludur"),
  subeBolge: z.string().optional(),
  vergiDairesi: z.string().optional(),
  vergiNo: z.string().optional(),
  adres: z.string().optional(),
  telefon: z.string().optional(),
  email: z.string().email("Geçerli bir email adresi giriniz").optional(),
  notlar: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const insertYetkiliKisiSchema = z.object({
  cariHesapId: z.number(),
  adSoyad: z.string().min(1, "Ad Soyad zorunludur"),
  gorevi: z.string().optional(),
  departman: z.string().optional(),
  telefon: z.string().optional(),
  email: z.string().email("Geçerli bir email adresi giriniz").optional(),
  notlar: z.string().optional()
});

// Tip tanımları
export type User = {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string | null;
  position: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

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
  createdAt: Date | null;
  updatedAt: Date | null;
};

// Insert tipleri
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCariHesap = z.infer<typeof insertCariHesapSchema>;
export type InsertYetkiliKisi = z.infer<typeof insertYetkiliKisiSchema>;
export type InsertCariHareket = z.infer<typeof insertCariHareketSchema>;
export type InsertTeklif = z.infer<typeof insertTeklifSchema>;
export type InsertTeklifKalemi = z.infer<typeof insertTeklifKalemiSchema>;
export type InsertProje = z.infer<typeof insertProjeSchema>;
export type InsertGorev = z.infer<typeof insertGorevSchema>;

// Temel tipler
export type CariHareket = {
  id: number;
  cariHesapId: number;
  tur: string;
  tutar: string;
  bakiye: string;
  aciklama: string | null;
  projeId: number | null;
  tarih: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
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
  teklifId?: number | null;
  projeNo: string;
  projeAdi: string;
  projeDurumu: "Devam Ediyor" | "Tamamlandı" | "İptal" | "Beklemede";
  projeTarihi: Date;
  sonTeslimTarihi?: Date | null;
  butce?: string | null;
  harcananTutar?: string | null;
  tamamlanmaOrani?: number | null;
  sorumluKisi?: string | null;
  aciklama?: string | null;
  notlar?: string | null;
  dosyalar?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  cariHesap?: {
    firmaAdi: string;
    firmaTuru?: string;
  };
};

export type Gorev = {
  id: number;
  baslik: string;
  aciklama: string | null;
  durum: string;
  oncelik: string;
  baslangicTarihi: Date;
  bitisTarihi?: Date | null;
  sonTeslimTarihi?: Date | null;
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

export const insertCariHareketSchema = z.object({
  cariHesapId: z.number(),
  tur: z.string(),
  tutar: z.string(),
  bakiye: z.string(),
  aciklama: z.string().optional(),
  projeId: z.number().optional(),
  tarih: z.date().optional()
});

export const insertTeklifSchema = z.object({
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

export const insertTeklifKalemiSchema = z.object({
  teklifId: z.number(),
  urunHizmetAdi: z.string(),
  miktar: z.string(),
  birim: z.string(),
  birimFiyat: z.string(),
  tutar: z.string(),
  iskontoTutari: z.string().optional(),
  netTutar: z.string(),
  kdvOrani: z.string(),
  toplamTutar: z.string()
});

export const insertProjeSchema = z.object({
  cariHesapId: z.number(),
  teklifId: z.number().optional(),
  projeNo: z.string(),
  projeAdi: z.string(),
  projeDurumu: z.string(),
  projeTarihi: z.date(),
  sonTeslimTarihi: z.date().nullable(),
  butce: z.string().optional(),
  harcananTutar: z.string().optional(),
  tamamlanmaOrani: z.number().optional(),
  sorumluKisi: z.string().optional(),
  aciklama: z.string().optional(),
  notlar: z.string().optional(),
  dosyalar: z.array(z.string()).optional()
});

export const insertGorevSchema = z.object({
  projeId: z.number().optional(),
  cariHesapId: z.number(),
  baslik: z.string(),
  aciklama: z.string().optional(),
  baslangicTarihi: z.date(),
  bitisTarihi: z.date().optional(),
  sonTeslimTarihi: z.date().optional(),
  durum: z.string(),
  oncelik: z.string(),
  atananKisi: z.string().optional(),
  userId: z.number().optional(),
  siralama: z.number().optional(),
  etiketler: z.array(z.string()).optional(),
  dosyalar: z.array(z.string()).optional(),
  notlar: z.string().optional()
});

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

// Form şemaları
export const userFormSchema = z.object({
  username: z.string().min(3, { message: "Kullanıcı adı en az 3 karakter olmalıdır" }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır" }),
  name: z.string().min(2, { message: "Ad Soyad en az 2 karakter olmalıdır" }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  phone: z.string().optional(),
  position: z.string().optional(),
});

export const yetkiliKisiFormSchema = z.object({
  cariHesapId: z.number(),
  adSoyad: z.string().min(1, "Ad Soyad zorunludur"),
  gorevi: z.string().optional(),
  departman: z.string().optional(),
  telefon: z.string().optional(),
  email: z.string().email("Geçerli bir email adresi giriniz").optional(),
  notlar: z.string().optional()
});