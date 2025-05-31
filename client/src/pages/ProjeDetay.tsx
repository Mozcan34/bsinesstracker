import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  Building,
  FileText,
  TrendingUp,
  Clock,
  DollarSign,
  Plus,
} from "lucide-react";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Proje } from "@shared/schema";

const durum_colors = {
  "Devam Ediyor": "bg-blue-100 text-blue-800",
  "Tamamlandı": "bg-green-100 text-green-800",
  "İptal": "bg-red-100 text-red-800",
  "Beklemede": "bg-yellow-100 text-yellow-800",
} as const;

export default function ProjeDetay() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: proje, isLoading } = useQuery<Proje>({
    queryKey: [`/api/projeler/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/projeler/${id}`);
      if (!response.ok) throw new Error("Proje yüklenemedi");
      return response.json();
    },
  });

  const { data: gorevler } = useQuery({
    queryKey: [`/api/gorevler`, { projeId: id }],
    queryFn: async () => {
      const response = await fetch(`/api/gorevler?projeId=${id}`);
      if (!response.ok) throw new Error("Görevler yüklenemedi");
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: Proje["projeDurumu"]) => {
      const response = await fetch(`/api/projeler/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projeDurumu: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error("Proje durumu güncellenemedi");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projeler/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projeler"] });
      toast({
        title: "Başarılı",
        description: "Proje durumu güncellendi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Proje durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (status: Proje["projeDurumu"]) => {
    updateStatusMutation.mutate(status);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(parseFloat(amount));
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTaskStats = () => {
    if (!gorevler) return { total: 0, completed: 0, inProgress: 0, pending: 0 };
    
    return gorevler.reduce((acc: any, gorev: any) => {
      acc.total++;
      switch (gorev.durum) {
        case "Tamamlandı":
          acc.completed++;
          break;
        case "Devam Ediyor":
          acc.inProgress++;
          break;
        case "Bekliyor":
          acc.pending++;
          break;
      }
      return acc;
    }, { total: 0, completed: 0, inProgress: 0, pending: 0 });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Geri</span>
          </Button>
          <Skeleton className="h-8 w-56" />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </div>
              
              <div className="md:w-1/3">
                <Skeleton className="h-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!proje) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-lg text-muted-foreground">Proje bulunamadı</p>
        <Button onClick={() => navigate("/projeler")} className="mt-4">
          Projelere Dön
        </Button>
      </div>
    );
  }

  const deadline = proje.sonTeslimTarihi ? getDaysUntilDeadline(proje.sonTeslimTarihi) : null;
  const taskStats = getTaskStats();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={() => navigate("/projeler")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Geri</span>
          </Button>
          <h2 className="text-2xl font-semibold">Proje Detayı</h2>
        </div>
        <Button onClick={() => navigate(`/proje-form/${id}`)}>
          <Edit className="h-4 w-4 mr-1" />
          <span>Düzenle</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{proje.projeAdi}</h1>
                  <p className="text-muted-foreground mb-2">Proje No: {proje.projeNo}</p>
                  {proje.aciklama && (
                    <p className="text-sm text-muted-foreground max-w-2xl">
                      {proje.aciklama}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 mt-4 sm:mt-0">
                  <Badge className={`${durum_colors[proje.projeDurumu]} border-0`}>
                    {proje.projeDurumu}
                  </Badge>
                  <Select value={proje.projeDurumu} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                      <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                      <SelectItem value="Beklemede">Beklemede</SelectItem>
                      <SelectItem value="İptal">İptal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Başlangıç</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(proje.projeTarihi)}
                    </p>
                  </div>
                </div>

                {proje.sonTeslimTarihi && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Teslim Tarihi</p>
                      <p className={`text-sm ${deadline !== null && deadline < 0 ? "text-red-600 font-medium" : deadline !== null && deadline <= 7 ? "text-orange-600 font-medium" : "text-muted-foreground"}`}>
                        {formatDate(proje.sonTeslimTarihi)}
                        {deadline !== null && deadline <= 7 && deadline >= 0 && (
                          <span className="block text-xs">({deadline} gün kaldı)</span>
                        )}
                        {deadline !== null && deadline < 0 && (
                          <span className="block text-xs">({Math.abs(deadline)} gün geçmiş)</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {proje.sorumluKisi && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Sorumlu</p>
                      <p className="text-sm text-muted-foreground">{proje.sorumluKisi}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">İlerleme</p>
                    <p className="text-sm font-bold">{proje.tamamlanmaOrani || 0}%</p>
                  </div>
                </div>
              </div>

              {/* İlerleme çubuğu */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Proje İlerlemesi</span>
                  <span className="text-sm text-muted-foreground">{proje.tamamlanmaOrani || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${proje.tamamlanmaOrani || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Bütçe bilgileri */}
              {(proje.butce || proje.harcananTutar) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {proje.butce && (
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Toplam Bütçe</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(proje.butce)}
                        </p>
                      </div>
                    </div>
                  )}

                  {proje.harcananTutar && (
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <DollarSign className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">Harcanan Tutar</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(proje.harcananTutar)}
                        </p>
                        {proje.butce && (
                          <p className="text-xs text-muted-foreground">
                            Kalan: {formatCurrency((parseFloat(proje.butce) - parseFloat(proje.harcananTutar)).toString())}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {proje.notlar && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Notlar</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {proje.notlar}
                  </p>
                </div>
              )}
            </div>

            <div className="lg:w-1/3">
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Firma Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Building className="h-8 w-8 text-blue-600 bg-blue-100 rounded-lg p-1.5" />
                    <div>
                      <p className="font-medium">{proje.cariHesap?.firmaAdi}</p>
                      <p className="text-sm text-muted-foreground">
                        {proje.cariHesap?.firmaTuru}
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {proje.teklifId && (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/teklif-detay/${proje.teklifId}`)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      <span>İlgili Teklifi Görüntüle</span>
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => navigate(`/cari-hesap-detay/${proje.cariHesapId}`)}
                  >
                    <Building className="h-4 w-4 mr-1" />
                    <span>Firma Detayları</span>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Görev İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">
                    {taskStats.total} Görev
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tamamlanan</span>
                      <span className="text-sm font-medium text-green-600">
                        {taskStats.completed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Devam Eden</span>
                      <span className="text-sm font-medium text-blue-600">
                        {taskStats.inProgress}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Bekleyen</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {taskStats.pending}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate(`/gorev-form?project=${id}`)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Görev Ekle</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Görevler listesi */}
      {gorevler && gorevler.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Proje Görevleri ({gorevler.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gorevler.slice(0, 5).map((gorev: any) => (
                <div key={gorev.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-medium">{gorev.baslik}</h4>
                    {gorev.aciklama && (
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {gorev.aciklama}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      gorev.durum === "Tamamlandı" ? "default" : 
                      gorev.durum === "Devam Ediyor" ? "secondary" : 
                      "outline"
                    }>
                      {gorev.durum}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/gorev-detay/${gorev.id}`)}
                    >
                      Görüntüle
                    </Button>
                  </div>
                </div>
              ))}
              
              {gorevler.length > 5 && (
                <div className="text-center pt-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/gorevler?project=${id}`)}
                  >
                    Tüm Görevleri Görüntüle ({gorevler.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
