import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Eye, Edit, Trash2, FileText, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Form schema
const teklifFormSchema = z.object({
  teklifTuru: z.enum(['Verilen', 'Alınan']),
  teklifKonusu: z.string().min(1, 'Teklif konusu gereklidir'),
  cariHesapId: z.number().min(1, 'Cari hesap seçimi gereklidir'),
  yetkiliKisiId: z.number().optional(),
  teklifDurumu: z.enum(['Beklemede', 'Onaylandı', 'Kaybedildi', 'İptal']).default('Beklemede'),
  odemeSekli: z.string().optional(),
  gecerlilikSuresi: z.string().optional(),
  paraBirimi: z.string().default('₺'),
  notlar: z.string().optional(),
  kalemler: z.array(z.object({
    urunHizmetAdi: z.string().min(1, 'Ürün/Hizmet adı gereklidir'),
    miktar: z.number().min(0.01, 'Miktar 0\'dan büyük olmalıdır'),
    birim: z.string().min(1, 'Birim gereklidir'),
    birimFiyat: z.number().min(0, 'Birim fiyat 0\'dan küçük olamaz'),
    iskontoTutari: z.number().min(0, 'İskonto tutarı 0\'dan küçük olamaz').default(0),
    kdvOrani: z.number().min(0).max(100, 'KDV oranı 0-100 arasında olmalıdır').default(20)
  })).min(1, 'En az bir kalem eklenmeli')
});

type TeklifFormData = z.infer<typeof teklifFormSchema>;

interface Teklif {
  id: number;
  teklifNo: string;
  teklifTuru: string;
  tarih: string;
  cariHesapId: number;
  yetkiliKisiId?: number;
  teklifKonusu: string;
  teklifDurumu: string;
  odemeSekli?: string;
  gecerlilikSuresi?: string;
  paraBirimi: string;
  toplamTutar?: number;
  notlar?: string;
  cariHesap?: {
    firmaAdi: string;
    firmaTuru: string;
  };
  yetkiliKisi?: {
    adSoyad: string;
  };
  kalemler?: TeklifKalemi[];
}

interface TeklifKalemi {
  id: number;
  urunHizmetAdi: string;
  miktar: number;
  birim: string;
  birimFiyat: number;
  tutar: number;
  iskontoTutari: number;
  netTutar: number;
  kdvOrani: number;
  toplamTutar: number;
}

interface CariHesap {
  id: number;
  firmaAdi: string;
  firmaTuru: string;
}

interface YetkiliKisi {
  id: number;
  cariHesapId: number;
  adSoyad: string;
  gorevi?: string | null;
  telefon?: string | null;
  email?: string | null;
  departman?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function Teklifler() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTur, setSelectedTur] = useState<string>('');
  const [selectedDurum, setSelectedDurum] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeklif, setSelectedTeklif] = useState<Teklif | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingTeklif, setEditingTeklif] = useState<Teklif | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Teklifler listesi
  const { data: teklifler = [], isLoading } = useQuery({
    queryKey: ['teklifler', searchTerm, selectedTur, selectedDurum],
    queryFn: async () => {
      let url = '/api/teklifler';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTur) params.append('tur', selectedTur);
      if (selectedDurum) params.append('durum', selectedDurum);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Teklifler yüklenemedi');
      return response.json();
    },
  });

  // Cari hesaplar listesi
  const { data: cariHesaplar = [] } = useQuery({
    queryKey: ['cari-hesaplar'],
    queryFn: async () => {
      const response = await fetch('/api/cari-hesaplar');
      if (!response.ok) throw new Error('Cari hesaplar yüklenemedi');
      return response.json();
    },
  });

  // Yetkili kişiler listesi
  const { data: yetkiliKisiler = [] } = useQuery({
    queryKey: ['yetkili-kisiler'],
    queryFn: async () => {
      const response = await fetch('/api/yetkili-kisiler');
      if (!response.ok) throw new Error('Yetkili kişiler yüklenemedi');
      return response.json();
    },
  });

  // Form
  const form = useForm<TeklifFormData>({
    resolver: zodResolver(teklifFormSchema),
    defaultValues: {
      teklifTuru: 'Verilen',
      teklifDurumu: 'Beklemde',
      paraBirimi: '₺',
      kalemler: [
        {
          urunHizmetAdi: '',
          miktar: 1,
          birim: 'Adet',
          birimFiyat: 0,
          iskontoTutari: 0,
          kdvOrani: 20
        }
      ]
    }
  });

  // Teklif oluşturma/güncelleme
  const teklifMutation = useMutation({
    mutationFn: async (data: TeklifFormData) => {
      const url = editingTeklif ? `/api/teklifler/${editingTeklif.id}` : '/api/teklifler';
      const method = editingTeklif ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tarih: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Teklif kaydedilemedi');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teklifler'] });
      toast({
        title: 'Başarılı',
        description: editingTeklif ? 'Teklif güncellendi' : 'Teklif oluşturuldu',
      });
      handleCloseForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Teklif silme
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/teklifler/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Teklif silinemedi');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teklifler'] });
      toast({
        title: 'Başarılı',
        description: 'Teklif silindi',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTeklif(null);
    form.reset();
  };

  const handleEdit = (teklif: Teklif) => {
    setEditingTeklif(teklif);
    
    // Form verilerini doldur
    form.reset({
      teklifTuru: teklif.teklifTuru as 'Verilen' | 'Alınan',
      teklifKonusu: teklif.teklifKonusu,
      cariHesapId: teklif.cariHesapId,
      yetkiliKisiId: teklif.yetkiliKisiId,
      teklifDurumu: teklif.teklifDurumu as 'Beklemede' | 'Onaylandı' | 'Kaybedildi' | 'İptal',
      odemeSekli: teklif.odemeSekli || '',
      gecerlilikSuresi: teklif.gecerlilikSuresi || '',
      paraBirimi: teklif.paraBirimi,
      notlar: teklif.notlar || '',
      kalemler: teklif.kalemler?.map(kalem => ({
        urunHizmetAdi: kalem.urunHizmetAdi,
        miktar: kalem.miktar,
        birim: kalem.birim,
        birimFiyat: kalem.birimFiyat,
        iskontoTutari: kalem.iskontoTutari,
        kdvOrani: kalem.kdvOrani
      })) || []
    });
    
    setIsFormOpen(true);
  };

  const handleViewDetail = (teklif: Teklif) => {
    setSelectedTeklif(teklif);
    setIsDetailOpen(true);
  };

  const addKalem = () => {
    const currentKalemler = form.getValues('kalemler');
    form.setValue('kalemler', [
      ...currentKalemler,
      {
        urunHizmetAdi: '',
        miktar: 1,
        birim: 'Adet',
        birimFiyat: 0,
        iskontoTutari: 0,
        kdvOrani: 20
      }
    ]);
  };

  const removeKalem = (index: number) => {
    const currentKalemler = form.getValues('kalemler');
    if (currentKalemler.length > 1) {
      form.setValue('kalemler', currentKalemler.filter((_, i) => i !== index));
    }
  };

  const calculateKalemTotals = (index: number) => {
    const kalemler = form.getValues('kalemler');
    const kalem = kalemler[index];
    
    if (kalem) {
      const tutar = kalem.miktar * kalem.birimFiyat;
      const netTutar = tutar - kalem.iskontoTutari;
      const kdvTutar = (netTutar * kalem.kdvOrani) / 100;
      const toplamTutar = netTutar + kdvTutar;
      
      return { tutar, netTutar, toplamTutar };
    }
    
    return { tutar: 0, netTutar: 0, toplamTutar: 0 };
  };

  const calculateGrandTotal = () => {
    const kalemler = form.watch('kalemler');
    return kalemler.reduce((total, _, index) => {
      const { toplamTutar } = calculateKalemTotals(index);
      return total + toplamTutar;
    }, 0);
  };

  const getStatusBadgeVariant = (durum: string) => {
    switch (durum) {
      case 'Onaylandı': return 'default';
      case 'Beklemede': return 'secondary';
      case 'Kaybedildi': return 'destructive';
      case 'İptal': return 'outline';
      default: return 'secondary';
    }
  };

  const getTurBadgeVariant = (tur: string) => {
    return tur === 'Verilen' ? 'default' : 'secondary';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teklifler</h1>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Teklif
        </Button>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Teklif ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedTur} onValueChange={setSelectedTur}>
              <SelectTrigger>
                <SelectValue placeholder="Teklif Türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tüm Türler</SelectItem>
                <SelectItem value="Verilen">Verilen</SelectItem>
                <SelectItem value="Alınan">Alınan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDurum} onValueChange={setSelectedDurum}>
              <SelectTrigger>
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tüm Durumlar</SelectItem>
                <SelectItem value="Beklemede">Beklemede</SelectItem>
                <SelectItem value="Onaylandı">Onaylandı</SelectItem>
                <SelectItem value="Kaybedildi">Kaybedildi</SelectItem>
                <SelectItem value="İptal">İptal</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedTur('');
                setSelectedDurum('');
              }}
            >
              Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teklifler Listesi */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teklif No</TableHead>
                <TableHead>Türü</TableHead>
                <TableHead>Konu</TableHead>
                <TableHead>Cari Hesap</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teklifler.map((teklif: Teklif) => (
                <TableRow key={teklif.id}>
                  <TableCell className="font-medium">{teklif.teklifNo}</TableCell>
                  <TableCell>
                    <Badge variant={getTurBadgeVariant(teklif.teklifTuru)}>
                      {teklif.teklifTuru}
                    </Badge>
                  </TableCell>
                  <TableCell>{teklif.teklifKonusu}</TableCell>
                  <TableCell>{teklif.cariHesap?.firmaAdi}</TableCell>
                  <TableCell>
                    {new Date(teklif.tarih).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(teklif.teklifDurumu)}>
                      {teklif.teklifDurumu}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {teklif.toplamTutar ? 
                      `${teklif.toplamTutar.toLocaleString('tr-TR')} ${teklif.paraBirimi}` 
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(teklif)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(teklif)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(teklif.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {teklifler.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Henüz teklif bulunmuyor.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teklif Formu */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTeklif ? 'Teklif Düzenle' : 'Yeni Teklif Oluştur'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit((data) => teklifMutation.mutate(data))} className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teklifTuru">Teklif Türü</Label>
                <Select 
                  value={form.watch('teklifTuru')} 
                  onValueChange={(value: 'Verilen' | 'Alınan') => form.setValue('teklifTuru', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verilen">Verilen Teklif</SelectItem>
                    <SelectItem value="Alınan">Alınan Teklif</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.teklifTuru && (
                  <p className="text-sm text-red-500">{form.formState.errors.teklifTuru.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="teklifDurumu">Durum</Label>
                <Select 
                  value={form.watch('teklifDurumu')} 
                  onValueChange={(value: 'Beklemede' | 'Onaylandı' | 'Kaybedildi' | 'İptal') => form.setValue('teklifDurumu', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beklemede">Beklemede</SelectItem>
                    <SelectItem value="Onaylandı">Onaylandı</SelectItem>
                    <SelectItem value="Kaybedildi">Kaybedildi</SelectItem>
                    <SelectItem value="İptal">İptal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="teklifKonusu">Teklif Konusu</Label>
              <Input
                {...form.register('teklifKonusu')}
                placeholder="Teklif konusunu giriniz"
              />
              {form.formState.errors.teklifKonusu && (
                <p className="text-sm text-red-500">{form.formState.errors.teklifKonusu.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cariHesapId">Cari Hesap</Label>
                <Select 
                  value={form.watch('cariHesapId')?.toString()} 
                  onValueChange={(value) => form.setValue('cariHesapId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cari hesap seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {cariHesaplar.map((cari: CariHesap) => (
                      <SelectItem key={cari.id} value={cari.id.toString()}>
                        {cari.firmaAdi} ({cari.firmaTuru})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.cariHesapId && (
                  <p className="text-sm text-red-500">{form.formState.errors.cariHesapId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="yetkiliKisiId">Yetkili Kişi (Opsiyonel)</Label>
                <Select 
                  value={form.watch('yetkiliKisiId')?.toString() || ''} 
                  onValueChange={(value) => form.setValue('yetkiliKisiId', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Yetkili kişi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {yetkiliKisiler
                      .filter((kisi: YetkiliKisi) => kisi.cariHesapId === form.watch('cariHesapId'))
                      .map((kisi: YetkiliKisi) => (
                        <SelectItem key={kisi.id} value={kisi.id.toString()}>
                          {kisi.adSoyad}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="odemeSekli">Ödeme Şekli</Label>
                <Input
                  {...form.register('odemeSekli')}
                  placeholder="Ödeme şekli"
                />
              </div>

              <div>
                <Label htmlFor="gecerlilikSuresi">Geçerlilik Süresi</Label>
                <Input
                  {...form.register('gecerlilikSuresi')}
                  placeholder="Geçerlilik süresi"
                />
              </div>

              <div>
                <Label htmlFor="paraBirimi">Para Birimi</Label>
                <Select 
                  value={form.watch('paraBirimi')} 
                  onValueChange={(value) => form.setValue('paraBirimi', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="₺">TL (₺)</SelectItem>
                    <SelectItem value="$">USD ($)</SelectItem>
                    <SelectItem value="€">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Teklif Kalemleri */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg font-semibold">Teklif Kalemleri</Label>
                <Button type="button" onClick={addKalem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Kalem Ekle
                </Button>
              </div>
              
              <div className="space-y-4 border rounded-lg p-4">
                {form.watch('kalemler').map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-2">
                      <Label>Ürün/Hizmet</Label>
                      <Input
                        {...form.register(`kalemler.${index}.urunHizmetAdi`)}
                        placeholder="Ürün/Hizmet adı"
                      />
                    </div>
                    
                    <div>
                      <Label>Miktar</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`kalemler.${index}.miktar`, { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div>
                      <Label>Birim</Label>
                      <Input
                        {...form.register(`kalemler.${index}.birim`)}
                        placeholder="Adet"
                      />
                    </div>
                    
                    <div>
                      <Label>Birim Fiyat</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`kalemler.${index}.birimFiyat`, { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div>
                      <Label>İskonto</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`kalemler.${index}.iskontoTutari`, { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>KDV %</Label>
                        <Input
                          type="number"
                          {...form.register(`kalemler.${index}.kdvOrani`, { valueAsNumber: true })}
                        />
                      </div>
                      {form.watch('kalemler').length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeKalem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="md:col-span-7 text-right text-sm text-muted-foreground">
                      Toplam: {calculateKalemTotals(index).toplamTutar.toLocaleString('tr-TR')} {form.watch('paraBirimi')}
                    </div>
                  </div>
                ))}
                
                <div className="text-right text-lg font-semibold mt-4">
                  Genel Toplam: {calculateGrandTotal().toLocaleString('tr-TR')} {form.watch('paraBirimi')}
                </div>
              </div>
              
              {form.formState.errors.kalemler && (
                <p className="text-sm text-red-500">{form.formState.errors.kalemler.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="notlar">Notlar</Label>
              <Textarea
                {...form.register('notlar')}
                placeholder="Teklif notları"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                İptal
              </Button>
              <Button type="submit" disabled={teklifMutation.isPending}>
                {teklifMutation.isPending ? 'Kaydediliyor...' : (editingTeklif ? 'Güncelle' : 'Kaydet')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Teklif Detay Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Teklif Detayı - {selectedTeklif?.teklifNo}</DialogTitle>
          </DialogHeader>
          
          {selectedTeklif && (
            <div className="space-y-6">
              {/* Teklif Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Teklif Türü</Label>
                  <p>{selectedTeklif.teklifTuru}</p>
                </div>
                <div>
                  <Label className="font-semibold">Durum</Label>
                  <p>
                    <Badge variant={getStatusBadgeVariant(selectedTeklif.teklifDurumu)}>
                      {selectedTeklif.teklifDurumu}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Konu</Label>
                  <p>{selectedTeklif.teklifKonusu}</p>
                </div>
                <div>
                  <Label className="font-semibold">Tarih</Label>
                  <p>{new Date(selectedTeklif.tarih).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <Label className="font-semibold">Cari Hesap</Label>
                  <p>{selectedTeklif.cariHesap?.firmaAdi}</p>
                </div>
                {selectedTeklif.yetkiliKisi && (
                  <div>
                    <Label className="font-semibold">Yetkili Kişi</Label>
                    <p>{selectedTeklif.yetkiliKisi.adSoyad}</p>
                  </div>
                )}
              </div>

              {/* Teklif Kalemleri */}
              {selectedTeklif.kalemler && selectedTeklif.kalemler.length > 0 && (
                <div>
                  <Label className="font-semibold text-lg">Teklif Kalemleri</Label>
                  <Table className="mt-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ürün/Hizmet</TableHead>
                        <TableHead>Miktar</TableHead>
                        <TableHead>Birim</TableHead>
                        <TableHead>Birim Fiyat</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>İskonto</TableHead>
                        <TableHead>Net Tutar</TableHead>
                        <TableHead>KDV</TableHead>
                        <TableHead>Toplam</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTeklif.kalemler.map((kalem, index) => (
                        <TableRow key={index}>
                          <TableCell>{kalem.urunHizmetAdi}</TableCell>
                          <TableCell>{kalem.miktar}</TableCell>
                          <TableCell>{kalem.birim}</TableCell>
                          <TableCell>{kalem.birimFiyat.toLocaleString('tr-TR')}</TableCell>
                          <TableCell>{kalem.tutar.toLocaleString('tr-TR')}</TableCell>
                          <TableCell>{kalem.iskontoTutari.toLocaleString('tr-TR')}</TableCell>
                          <TableCell>{kalem.netTutar.toLocaleString('tr-TR')}</TableCell>
                          <TableCell>%{kalem.kdvOrani}</TableCell>
                          <TableCell className="font-semibold">
                            {kalem.toplamTutar.toLocaleString('tr-TR')} {selectedTeklif.paraBirimi}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="text-right mt-4">
                    <p className="text-lg font-bold">
                      Genel Toplam: {selectedTeklif.toplamTutar?.toLocaleString('tr-TR')} {selectedTeklif.paraBirimi}
                    </p>
                  </div>
                </div>
              )}

              {/* Notlar */}
              {selectedTeklif.notlar && (
                <div>
                  <Label className="font-semibold">Notlar</Label>
                  <p className="whitespace-pre-wrap">{selectedTeklif.notlar}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
