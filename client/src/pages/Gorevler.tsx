
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Calendar, User, AlertCircle, CheckCircle2, Clock, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gorevFormSchema, type GorevFormData, type Gorev, type CariHesap, type Proje } from '@shared/schema';
import { toast } from '@/hooks/use-toast';

const priorityColors = {
  'Düşük': 'bg-green-100 text-green-800',
  'Orta': 'bg-yellow-100 text-yellow-800',
  'Yüksek': 'bg-red-100 text-red-800'
};

const statusColors = {
  'Bekliyor': 'bg-gray-100 text-gray-800',
  'Devam Ediyor': 'bg-blue-100 text-blue-800',
  'Tamamlandı': 'bg-green-100 text-green-800'
};

const statusIcons = {
  'Bekliyor': Clock,
  'Devam Ediyor': AlertCircle,
  'Tamamlandı': CheckCircle2
};

interface GorevWithDetails extends Gorev {
  cariHesap?: { firmaAdi: string };
  proje?: { projeAdi: string };
}

export default function Gorevler() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedGorev, setSelectedGorev] = useState<GorevWithDetails | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGorev, setEditingGorev] = useState<GorevWithDetails | null>(null);

  const queryClient = useQueryClient();

  // Görevleri getir
  const { data: gorevler = [], isLoading: gorevlerLoading } = useQuery<GorevWithDetails[]>({
    queryKey: ['gorevler', searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('durum', statusFilter);
      
      const response = await fetch(`/api/gorevler?${params}`);
      if (!response.ok) throw new Error('Görevler yüklenirken hata oluştu');
      return response.json();
    }
  });

  // Cari hesapları getir
  const { data: cariHesaplar = [] } = useQuery<CariHesap[]>({
    queryKey: ['cari-hesaplar'],
    queryFn: async () => {
      const response = await fetch('/api/cari-hesaplar');
      if (!response.ok) throw new Error('Cari hesaplar yüklenirken hata oluştu');
      return response.json();
    }
  });

  // Projeleri getir
  const { data: projeler = [] } = useQuery<Proje[]>({
    queryKey: ['projeler'],
    queryFn: async () => {
      const response = await fetch('/api/projeler');
      if (!response.ok) throw new Error('Projeler yüklenirken hata oluştu');
      return response.json();
    }
  });

  // Görev oluşturma mutation
  const createGorevMutation = useMutation({
    mutationFn: async (data: GorevFormData) => {
      const response = await fetch('/api/gorevler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Görev oluşturulurken hata oluştu');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gorevler'] });
      setIsFormOpen(false);
      toast({ title: 'Başarılı', description: 'Görev başarıyla oluşturuldu' });
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Görev oluşturulurken hata oluştu', variant: 'destructive' });
    }
  });

  // Görev güncelleme mutation
  const updateGorevMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<GorevFormData> }) => {
      const response = await fetch(`/api/gorevler/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Görev güncellenirken hata oluştu');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gorevler'] });
      setEditingGorev(null);
      setIsFormOpen(false);
      toast({ title: 'Başarılı', description: 'Görev başarıyla güncellendi' });
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Görev güncellenirken hata oluştu', variant: 'destructive' });
    }
  });

  // Görev silme mutation
  const deleteGorevMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/gorevler/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Görev silinirken hata oluştu');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gorevler'] });
      toast({ title: 'Başarılı', description: 'Görev başarıyla silindi' });
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Görev silinirken hata oluştu', variant: 'destructive' });
    }
  });

  const form = useForm<GorevFormData>({
    resolver: zodResolver(gorevFormSchema),
    defaultValues: {
      baslik: '',
      aciklama: '',
      durum: 'Bekliyor',
      oncelik: 'Orta',
      atananKisi: '',
      siralama: 0
    }
  });

  useEffect(() => {
    if (editingGorev) {
      form.reset({
        baslik: editingGorev.baslik,
        aciklama: editingGorev.aciklama || '',
        durum: editingGorev.durum,
        oncelik: editingGorev.oncelik,
        baslangicTarihi: editingGorev.baslangicTarihi || undefined,
        bitisTarihi: editingGorev.bitisTarihi || undefined,
        sonTeslimTarihi: editingGorev.sonTeslimTarihi || undefined,
        atananKisi: editingGorev.atananKisi || '',
        cariHesapId: editingGorev.cariHesapId || undefined,
        projeId: editingGorev.projeId || undefined,
        siralama: editingGorev.siralama || 0,
        etiketler: editingGorev.etiketler || '',
        dosyalar: editingGorev.dosyalar || ''
      });
    } else {
      form.reset({
        baslik: '',
        aciklama: '',
        durum: 'Bekliyor',
        oncelik: 'Orta',
        atananKisi: '',
        siralama: 0
      });
    }
  }, [editingGorev, form]);

  const onSubmit = (data: GorevFormData) => {
    if (editingGorev) {
      updateGorevMutation.mutate({ id: editingGorev.id, data });
    } else {
      createGorevMutation.mutate(data);
    }
  };

  const filteredGorevler = gorevler.filter(gorev => {
    const matchesSearch = gorev.baslik.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gorev.aciklama?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !priorityFilter || gorev.oncelik === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleEdit = (gorev: GorevWithDetails) => {
    setEditingGorev(gorev);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      deleteGorevMutation.mutate(id);
    }
  };

  const openCreateForm = () => {
    setEditingGorev(null);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Görevler</h1>
          <p className="text-muted-foreground">Yapılacaklar ve görev takibi</p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Görev
        </Button>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Görev ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tümü</SelectItem>
                <SelectItem value="Bekliyor">Bekliyor</SelectItem>
                <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Öncelik filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tümü</SelectItem>
                <SelectItem value="Düşük">Düşük</SelectItem>
                <SelectItem value="Orta">Orta</SelectItem>
                <SelectItem value="Yüksek">Yüksek</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setPriorityFilter('');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Filtreleri Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Görev Listesi */}
      {gorevlerLoading ? (
        <div className="text-center py-8">Yükleniyor...</div>
      ) : (
        <div className="grid gap-4">
          {filteredGorevler.map((gorev) => {
            const StatusIcon = statusIcons[gorev.durum];
            return (
              <Card key={gorev.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="h-4 w-4" />
                        <h3 className="font-semibold">{gorev.baslik}</h3>
                        <Badge className={priorityColors[gorev.oncelik]}>
                          {gorev.oncelik}
                        </Badge>
                        <Badge className={statusColors[gorev.durum]}>
                          {gorev.durum}
                        </Badge>
                      </div>
                      
                      {gorev.aciklama && (
                        <p className="text-muted-foreground mb-2">{gorev.aciklama}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {gorev.atananKisi && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {gorev.atananKisi}
                          </div>
                        )}
                        {gorev.cariHesap && (
                          <div>Müşteri: {gorev.cariHesap.firmaAdi}</div>
                        )}
                        {gorev.proje && (
                          <div>Proje: {gorev.proje.projeAdi}</div>
                        )}
                        {gorev.sonTeslimTarihi && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(gorev.sonTeslimTarihi).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(gorev)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(gorev.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredGorevler.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Henüz görev bulunmuyor.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Görev Formu Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGorev ? 'Görevi Düzenle' : 'Yeni Görev'}
            </DialogTitle>
            <DialogDescription>
              {editingGorev ? 'Görev bilgilerini güncelleyin.' : 'Yeni bir görev oluşturun.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="baslik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Görev Başlığı *</FormLabel>
                    <FormControl>
                      <Input placeholder="Görev başlığını girin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aciklama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Görev açıklaması" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="durum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durum</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bekliyor">Bekliyor</SelectItem>
                          <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                          <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oncelik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Öncelik</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Düşük">Düşük</SelectItem>
                          <SelectItem value="Orta">Orta</SelectItem>
                          <SelectItem value="Yüksek">Yüksek</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="atananKisi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atanan Kişi</FormLabel>
                    <FormControl>
                      <Input placeholder="Görevi üstlenen kişi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cariHesapId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Müşteri</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Müşteri seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Seçim yok</SelectItem>
                          {cariHesaplar.map((cari) => (
                            <SelectItem key={cari.id} value={cari.id.toString()}>
                              {cari.firmaAdi}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proje</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Proje seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Seçim yok</SelectItem>
                          {projeler.map((proje) => (
                            <SelectItem key={proje.id} value={proje.id.toString()}>
                              {proje.projeAdi}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="baslangicTarihi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Başlangıç Tarihi</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bitisTarihi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bitiş Tarihi</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sonTeslimTarihi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Son Teslim Tarihi</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="etiketler"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiketler</FormLabel>
                    <FormControl>
                      <Input placeholder="Virgülle ayırarak etiketler girin" {...field} />
                    </FormControl>
                    <FormDescription>
                      Örnek: acil, yazılım, müşteri toplantısı
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  disabled={createGorevMutation.isPending || updateGorevMutation.isPending}
                >
                  {editingGorev ? 'Güncelle' : 'Oluştur'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
