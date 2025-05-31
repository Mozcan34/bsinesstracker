import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash,
  Calendar,
  User,
  TrendingUp,
  Clock
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import type { Proje } from "@shared/schema";

const durum_colors = {
  "Devam Ediyor": "bg-blue-100 text-blue-800",
  "Tamamlandı": "bg-green-100 text-green-800",
  "İptal": "bg-red-100 text-red-800",
  "Beklemede": "bg-yellow-100 text-yellow-800",
} as const;

export default function Projeler() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDurum, setSelectedDurum] = useState<Proje["projeDurumu"] | "all">("all");
  const [activeTab, setActiveTab] = useState<Proje["projeDurumu"] | "all">("all");

  const { data: projeler, isLoading } = useQuery<Proje[]>({
    queryKey: ["/api/projeler", selectedDurum === "all" ? undefined : selectedDurum, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDurum !== "all") params.append("durum", selectedDurum);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/projeler?${params}`);
      if (!response.ok) throw new Error("Projeler yüklenemedi");
      return response.json();
    },
  });

  const handleStatusChange = (newStatus: Proje["projeDurumu"] | "all") => {
    setSelectedDurum(newStatus);
    setActiveTab(newStatus);
  };

  const getStatusStats = () => {
    if (!projeler) return { all: 0, "Devam Ediyor": 0, "Tamamlandı": 0, "Beklemede": 0, "İptal": 0 };

    const stats = projeler.reduce((acc: Record<string, number>, proje: Proje) => {
      acc.all++;
      acc[proje.projeDurumu] = (acc[proje.projeDurumu] || 0) + 1;
      return acc;
    }, { all: 0, "Devam Ediyor": 0, "Tamamlandı": 0, "Beklemede": 0, "İptal": 0 });

    return stats;
  };

  const filteredProjeler = projeler?.filter((proje: Proje) => {
    const matchesSearch = !searchTerm || 
      proje.projeAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proje.projeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proje.cariHesap?.firmaAdi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = activeTab === "all" || proje.projeDurumu === activeTab;

    return matchesSearch && matchesStatus;
  });

  const stats = getStatusStats();

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Projeler</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Projeler</h2>
        <Button onClick={() => navigate("/proje-form")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Yeni Proje</span>
        </Button>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatusChange("all")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.all}</div>
            <div className="text-sm text-gray-600">Toplam</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatusChange("Devam Ediyor")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats["Devam Ediyor"]}</div>
            <div className="text-sm text-gray-600">Devam Eden</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatusChange("Tamamlandı")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats["Tamamlandı"]}</div>
            <div className="text-sm text-gray-600">Tamamlanan</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatusChange("Beklemede")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats["Beklemede"]}</div>
            <div className="text-sm text-gray-600">Bekleyen</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatusChange("İptal")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats["İptal"]}</div>
            <div className="text-sm text-gray-600">İptal</div>
          </CardContent>
        </Card>
      </div>

      {/* Arama ve filtreler */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Proje ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedDurum} onValueChange={setSelectedDurum}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Durum filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
            <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
            <SelectItem value="Beklemede">Beklemede</SelectItem>
            <SelectItem value="İptal">İptal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleStatusChange}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="Devam Ediyor">Devam Eden</TabsTrigger>
          <TabsTrigger value="Tamamlandı">Tamamlanan</TabsTrigger>
          <TabsTrigger value="Beklemede">Bekleyen</TabsTrigger>
          <TabsTrigger value="İptal">İptal</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent>
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proje No</TableHead>
                      <TableHead>Proje Adı</TableHead>
                      <TableHead>Firma</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Başlangıç</TableHead>
                      <TableHead>Teslim</TableHead>
                      <TableHead>İlerleme</TableHead>
                      <TableHead>Sorumlu</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjeler?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Proje bulunamadı
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProjeler?.map((proje: Proje) => {
                        const deadline = proje.sonTeslimTarihi ? getDaysUntilDeadline(proje.sonTeslimTarihi) : null;

                        return (
                          <TableRow key={proje.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{proje.projeNo}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{proje.projeAdi}</div>
                                {proje.aciklama && (
                                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                                    {proje.aciklama}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{proje.cariHesap?.firmaAdi}</TableCell>
                            <TableCell>
                              <Badge className={`${durum_colors[proje.projeDurumu]} border-0`}>
                                {proje.projeDurumu}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(proje.projeTarihi)}</TableCell>
                            <TableCell>
                              {proje.sonTeslimTarihi && (
                                <div>
                                  <div>{formatDate(proje.sonTeslimTarihi)}</div>
                                  {deadline !== null && deadline <= 7 && deadline >= 0 && (
                                    <div className="text-xs text-orange-600">
                                      {deadline} gün kaldı
                                    </div>
                                  )}
                                  {deadline !== null && deadline < 0 && (
                                    <div className="text-xs text-red-600">
                                      {Math.abs(deadline)} gün geçmiş
                                    </div>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${proje.tamamlanmaOrani || 0}%` }}
                                  />
                                </div>
                                <span className="text-sm">
                                  {proje.tamamlanmaOrani || 0}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{proje.sorumluKisi || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/proje-detay/${proje.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/proje-form/${proje.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}