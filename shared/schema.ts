import { pgTable, text, serial, timestamp, varchar, numeric, boolean, integer } from "drizzle-orm/pg-core";
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
  firmaAdi: text("firma_adi").notNull(),
  subeBolge: text("sube_bolge"),
  firmaTuru: text("firma_turu").notNull(),
  telefon: text("telefon"),
  email: text("email"),
  adres: text("adres"),
  vergiNo: text("vergi_no"),
  vergiDairesi: text("vergi_dairesi"),
  notlar: text("notlar"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Yetkili Kişiler tablosu
export const yetkiliKisiler = pgTable("yetkili_kisiler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull(),
  adSoyad: text("ad_soyad").notNull(),
  gorevi: text("gorevi"),
  telefon: text("telefon"),
  email: text("email"),
  departman: text("departman"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Projeler tablosu
export const projeler = pgTable("projeler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull(),
  teklifId: integer("teklif_id"),
  projeNo: text("proje_no").notNull(),
  projeAdi: text("proje_adi").notNull(),
  projeDurumu: text("proje_durumu"),
  projeTarihi: timestamp("proje_tarihi").notNull(),
  sonTeslimTarihi: timestamp("son_teslim_tarihi"),
  butce: text("butce"),
  harcananTutar: text("harcanan_tutar"),
  tamamlanmaOrani: text("tamamlanma_orani"),
  sorumluKisi: text("sorumlu_kisi"),
  aciklama: text("aciklama"),
  notlar: text("notlar"),
  dosyalar: text("dosyalar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Cari Hesap Hareketleri tablosu
export const cariHareketler = pgTable("cari_hareketler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull(),
  tarih: timestamp("tarih").notNull(),
  aciklama: text("aciklama").notNull(),
  tur: text("tur").notNull(),
  tutar: text("tutar").notNull(),
  bakiye: text("bakiye").notNull(),
  projeId: integer("proje_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Teklifler tablosu
export const teklifler = pgTable("teklifler", {
  id: serial("id").primaryKey(),
  cariHesapId: integer("cari_hesap_id").notNull(),
  yetkiliKisiId: integer("yetkili_kisi_id"),
  teklifNo: text("teklif_no").notNull(),
  teklifTuru: text("teklif_turu").notNull(),
  teklifKonusu: text("teklif_konusu").notNull(),
  teklifDurumu: text("teklif_durumu"),
  odemeSekli: text("odeme_sekli"),
  gecerlilikSuresi: text("gecerlilik_suresi"),
  paraBirimi: text("para_birimi"),
  toplamTutar: text("toplam_tutar"),
  notlar: text("notlar"),
  dosyalar: text("dosyalar"),
  tarih: timestamp("tarih").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Teklif Kalemleri tablosu
export const teklifKalemleri = pgTable("teklif_kalemleri", {
  id: serial("id").primaryKey(),
  teklifId: integer("teklif_id").notNull(),
  urunHizmetAdi: text("urun_hizmet_adi").notNull(),
  miktar: text("miktar").notNull(),
  birim: text("birim").notNull(),
  birimFiyat: text("birim_fiyat").notNull(),
  tutar: text("tutar").notNull(),
  iskontoTutari: text("iskonto_tutari"),
  netTutar: text("net_tutar").notNull(),
  kdvOrani: text("kdv_orani"),
  toplamTutar: text("toplam_tutar").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Yapılacaklar/Görevler tablosu
export const gorevler = pgTable("gorevler", {
  id: serial("id").primaryKey(),
  baslik: text("baslik").notNull(),
  aciklama: text("aciklama"),
  durum: text("durum"),
  oncelik: text("oncelik"),
  baslangicTarihi: timestamp("baslangic_tarihi"),
  bitisTarihi: timestamp("bitis_tarihi"),
  sonTeslimTarihi: timestamp("son_teslim_tarihi"),
  atananKisi: text("atanan_kisi"),
  cariHesapId: integer("cari_hesap_id"),
  projeId: integer("proje_id"),
  userId: integer("user_id"),
  siralama: integer("siralama"),
  etiketler: text("etiketler"),
  dosyalar: text("dosyalar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Insert ve Update schemaları
export const insertUserSchema = createInsertSchema(users, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined
});

export const insertCariHesapSchema = createInsertSchema(cariHesaplar, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined
});

export const insertYetkiliKisiSchema = createInsertSchema(yetkiliKisiler, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined
});

export const insertCariHareketSchema = createInsertSchema(cariHareketler, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined
});

export const insertTeklifSchema = createInsertSchema(teklifler, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined
});

export const insertTeklifKalemiSchema = createInsertSchema(teklifKalemleri, {
  id: undefined,
  createdAt: undefined
});

export const insertProjeSchema = createInsertSchema(projeler, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined
});

export const insertGorevSchema = createInsertSchema(gorevler, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined
});

// Type exports
export type User = {
  id: number;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertUser = {
  email: string;
  isActive?: boolean;
};

export type CariHesap = {
  id: number;
  firmaAdi: string;
  subeBolge: string | null;
  firmaTuru: string;
  telefon: string | null;
  email: string | null;
  adres: string | null;
  vergiNo: string | null;
  vergiDairesi: string | null;
  notlar: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertCariHesap = {
  firmaAdi: string;
  subeBolge?: string | null;
  firmaTuru: string;
  telefon?: string | null;
  email?: string | null;
  adres?: string | null;
  vergiNo?: string | null;
  vergiDairesi?: string | null;
  notlar?: string | null;
  isActive?: boolean;
};

export type YetkiliKisi = {
  id: number;
  cariHesapId: number;
  adSoyad: string;
  gorevi?: string | null;
  telefon?: string | null;
  email?: string | null;
  departman?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertYetkiliKisi = Omit<YetkiliKisi, 'id' | 'createdAt' | 'updatedAt'>;

export type CariHareket = {
  id: number;
  cariHesapId: number;
  tarih: Date;
  aciklama: string;
  tur: string;
  tutar: string;
  bakiye: string;
  projeId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertCariHareket = {
  cariHesapId: number;
  tarih: Date;
  aciklama: string;
  tur: string;
  tutar: string;
  bakiye: string;
  projeId?: number | null;
};

export type Teklif = {
  id: number;
  cariHesapId: number;
  yetkiliKisiId: number | null;
  teklifNo: string;
  teklifTuru: string;
  teklifKonusu: string;
  teklifDurumu: string | null;
  odemeSekli: string | null;
  gecerlilikSuresi: string | null;
  paraBirimi: string | null;
  toplamTutar: string | null;
  notlar: string | null;
  dosyalar: string | null;
  tarih: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertTeklif = {
  cariHesapId: number;
  yetkiliKisiId?: number | null;
  teklifNo: string;
  teklifTuru: string;
  teklifKonusu: string;
  teklifDurumu?: string | null;
  odemeSekli?: string | null;
  gecerlilikSuresi?: string | null;
  paraBirimi?: string | null;
  toplamTutar?: string | null;
  notlar?: string | null;
  dosyalar?: string | null;
  tarih: Date;
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
  kdvOrani: string | null;
  toplamTutar: string;
  createdAt: Date;
};

export type InsertTeklifKalemi = {
  teklifId: number;
  urunHizmetAdi: string;
  miktar: string;
  birim: string;
  birimFiyat: string;
  tutar: string;
  iskontoTutari?: string | null;
  netTutar: string;
  kdvOrani?: string | null;
  toplamTutar: string;
};

export type Proje = {
  id: number;
  cariHesapId: number;
  teklifId: number | null;
  projeNo: string;
  projeAdi: string;
  projeDurumu: string | null;
  projeTarihi: Date;
  sonTeslimTarihi: Date | null;
  butce: string | null;
  harcananTutar: string | null;
  tamamlanmaOrani: string | null;
  sorumluKisi: string | null;
  aciklama: string | null;
  notlar: string | null;
  dosyalar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertProje = {
  cariHesapId: number;
  teklifId?: number | null;
  projeNo: string;
  projeAdi: string;
  projeDurumu?: string | null;
  projeTarihi: Date;
  sonTeslimTarihi?: Date | null;
  butce?: string | null;
  harcananTutar?: string | null;
  tamamlanmaOrani?: string | null;
  sorumluKisi?: string | null;
  aciklama?: string | null;
  notlar?: string | null;
  dosyalar?: string | null;
};

export type Gorev = {
  id: number;
  baslik: string;
  aciklama: string | null;
  durum: string | null;
  oncelik: string | null;
  baslangicTarihi: Date | null;
  bitisTarihi: Date | null;
  sonTeslimTarihi: Date | null;
  atananKisi: string | null;
  cariHesapId: number | null;
  projeId: number | null;
  userId: number | null;
  siralama: number | null;
  etiketler: string | null;
  dosyalar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertGorev = {
  baslik: string;
  aciklama?: string | null;
  durum?: string | null;
  oncelik?: string | null;
  baslangicTarihi?: Date | null;
  bitisTarihi?: Date | null;
  sonTeslimTarihi?: Date | null;
  atananKisi?: string | null;
  cariHesapId?: number | null;
  projeId?: number | null;
  userId?: number | null;
  siralama?: number | null;
  etiketler?: string | null;
  dosyalar?: string | null;
};

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