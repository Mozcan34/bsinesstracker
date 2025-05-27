
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, DollarSign, Users, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface DashboardStats {
  totalCariHesaplar: number;
  totalTeklifler: number;
  totalProjeler: number;
  totalGorevler: number;
  teklifDurumDagilimi: Array<{ name: string; value: number }>;
  projeDurumDagilimi: Array<{ name: string; value: number }>;
  gorevDurumDagilimi: Array<{ name: string; value: number }>;
  aylikTeklifTrendi: Array<{ month: string; teklifSayisi: number; toplamTutar: number }>;
  cariTipDagilimi: Array<{ name: string; value: number }>;
}

export default function Raporlar() {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [reportType, setReportType] = useState('overview');

  // Dashboard verilerini getir
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?period=${selectedPeriod}`);
      if (!response.ok) throw new Error('İstatistikler yüklenirken hata oluştu');
      return response.json();
    }
  });

  const exportData = (type: string) => {
    // CSV export fonksiyonu
    const csvData = generateCSVData(type);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-raporu-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVData = (type: string) => {
    if (!stats) return '';
    
    switch (type) {
      case 'teklifler':
        return [
          'Durum,Adet',
          ...stats.teklifDurumDagilimi.map(item => `${item.name},${item.value}`)
        ].join('\n');
      
      case 'projeler':
        return [
          'Durum,Adet',
          ...stats.projeDurumDagilimi.map(item => `${item.name},${item.value}`)
        ].join('\n');
      
      case 'gorevler':
        return [
          'Durum,Adet',
          ...stats.gorevDurumDagilimi.map(item => `${item.name},${item.value}`)
        ].join('\n');
      
      default:
        return 'Veri bulunamadı';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Raporlar yükleniyor...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Rapor verileri yüklenemedi.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Raporlar</h1>
          <p className="text-muted-foreground">İş süreçlerinizin detaylı analizi</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">Bu Hafta</SelectItem>
              <SelectItem value="thisMonth">Bu Ay</SelectItem>
              <SelectItem value="thisQuarter">Bu Çeyrek</SelectItem>
              <SelectItem value="thisYear">Bu Yıl</SelectItem>
              <SelectItem value="lastMonth">Geçen Ay</SelectItem>
              <SelectItem value="lastQuarter">Geçen Çeyrek</SelectItem>
              <SelectItem value="lastYear">Geçen Yıl</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportData('genel')}>
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCariHesaplar}</div>
            <p className="text-xs text-muted-foreground">
              Aktif müşteri sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Teklif</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeklifler}</div>
            <p className="text-xs text-muted-foreground">
              Verilen ve alınan teklifler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Proje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjeler}</div>
            <p className="text-xs text-muted-foreground">
              Devam eden projeler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Görev</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGorevler}</div>
            <p className="text-xs text-muted-foreground">
              Tamamlanmamış görevler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detaylı Raporlar */}
      <Tabs defaultValue="teklifler" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teklifler">Teklif Analizi</TabsTrigger>
          <TabsTrigger value="projeler">Proje Analizi</TabsTrigger>
          <TabsTrigger value="gorevler">Görev Analizi</TabsTrigger>
          <TabsTrigger value="musteriler">Müşteri Analizi</TabsTrigger>
        </TabsList>

        <TabsContent value="teklifler" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Teklif Durum Dağılımı</CardTitle>
                <CardDescription>Tekliflerin mevcut durumları</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.teklifDurumDagilimi}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.teklifDurumDagilimi.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aylık Teklif Trendi</CardTitle>
                <CardDescription>Son 6 ayın teklif performansı</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.aylikTeklifTrendi}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="teklifSayisi" stroke="#8884d8" name="Teklif Sayısı" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Teklif Detay Tablosu</CardTitle>
                <CardDescription>Teklif durumlarının detaylı analizi</CardDescription>
              </div>
              <Button variant="outline" onClick={() => exportData('teklifler')}>
                <Download className="h-4 w-4 mr-2" />
                CSV İndir
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.teklifDurumDagilimi.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <Badge variant="secondary">{item.value} adet</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projeler" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Proje Durum Dağılımı</CardTitle>
                <CardDescription>Projelerin mevcut durumları</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.projeDurumDagilimi}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proje Performans Özeti</CardTitle>
                <CardDescription>Proje durumlarının özet tablosu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.projeDurumDagilimi.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.value} proje</Badge>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(item.value / stats.totalProjeler) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gorevler" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Görev Durum Dağılımı</CardTitle>
                <CardDescription>Görevlerin mevcut durumları</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.gorevDurumDagilimi}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#FFBB28"
                      dataKey="value"
                    >
                      {stats.gorevDurumDagilimi.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Görev Tamamlanma Oranı</CardTitle>
                <CardDescription>Görev performans metrikleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.gorevDurumDagilimi.map((item, index) => {
                    const percentage = (item.value / stats.totalGorevler) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.value} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="musteriler" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Müşteri Tip Dağılımı</CardTitle>
                <CardDescription>Alıcı ve satıcı müşteri oranları</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.cariTipDagilimi}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#FF8042"
                      dataKey="value"
                    >
                      {stats.cariTipDagilimi.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Müşteri Özet Bilgileri</CardTitle>
                <CardDescription>Müşteri segmentasyonu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.cariTipDagilimi.find(item => item.name === 'Alıcı')?.value || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Alıcı Müşteri</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.cariTipDagilimi.find(item => item.name === 'Satıcı')?.value || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Satıcı Müşteri</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{stats.totalCariHesaplar}</div>
                      <div className="text-sm text-muted-foreground">Toplam Müşteri</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
