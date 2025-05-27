import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Building2, Phone, Mail, MapPin, Edit, Trash2, Eye } from "lucide-react";
import { z } from "zod";
import type { CariHesap } from "@shared/schema";

const cariHesapFormSchema = z.object({
  firmaAdi: z.string().min(1, "Firma adı zorunludur"),
  firmaTuru: z.string().min(1, "Firma türü seçiniz"),
  subeBolge: z.string().optional(),
  telefon: z.string().optional(),
  email: z.string().email("Geçerli bir email adresi giriniz").optional().or(z.literal("")),
  adres: z.string().optional(),
  vergiNo: z.string().optional(),
  vergiDairesi: z.string().optional(),
  notlar: z.string().optional(),
});

type CariHesapFormData = z.infer<typeof cariHesapFormSchema>;

export default function CariHesaplar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCariHesap, setEditingCariHesap] = useState<CariHesap | null>(null);
  const [selectedCariHesap, setSelectedCariHesap] = useState<CariHesap | null>(null);

  const queryClient = useQueryClient();

  const { data: cariHesaplar, isLoading } = useQuery<CariHesap[]>({
    queryKey: ["/api/cari-hesaplar"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: CariHesapFormData) => {
      const response = await fetch("/api/cari-hesaplar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Kayıt eklenirken hata oluştu");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cari-hesaplar"] });
      setIsCreateModalOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CariHesapFormData }) => {
      const response = await fetch(`/api/cari-hesaplar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Güncelleme sırasında hata oluştu");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cari-hesaplar"] });
      setEditingCariHesap(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/cari-hesaplar/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Silme işlemi sırasında hata oluştu");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cari-hesaplar"] });
    },
  });

  const form = useForm<CariHesapFormData>({
    resolver: zodResolver(cariHesapFormSchema),
    defaultValues: {
      firmaAdi: "",
      firmaTuru: "",
      subeBolge: "",
      telefon: "",
      email: "",
      adres: "",
      vergiNo: "",
      vergiDairesi: "",
      notlar: "",
    },
  });

  const filteredCariHesaplar = cariHesaplar?.filter((cari) =>
    cari.firmaAdi.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cari.subeBolge?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cari.telefon?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cari.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleEdit = (cariHesap: CariHesap) => {
    setEditingCariHesap(cariHesap);
    form.reset({
      firmaAdi: cariHesap.firmaAdi,
      firmaTuru: cariHesap.firmaTuru,
      subeBolge: cariHesap.subeBolge || "",
      telefon: cariHesap.telefon || "",
      email: cariHesap.email || "",
      adres: cariHesap.adres || "",
      vergiNo: cariHesap.vergiNo || "",
      vergiDairesi: cariHesap.vergiDairesi || "",
      notlar: cariHesap.notlar || "",
    });
  };

  const handleSubmit = (data: CariHesapFormData) => {
    if (editingCariHesap) {
      updateMutation.mutate({ id: editingCariHesap.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Bu cari hesabı silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingCariHesap(null);
    setIsCreateModalOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Cari Hesaplar</h1>
          <p className="text-blue-100">Müşteri ve tedarikçi bilgilerinizi yönetin</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Cari Hesap
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Firma adı, bölge, telefon veya email ile arayın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      {isLoading ? (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Cari hesaplar yükleniyor...</p>
          </CardContent>
        </Card>
      ) : filteredCariHesaplar.length === 0 ? (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchQuery ? "Arama kriterlerine uygun cari hesap bulunamadı" : "Henüz cari hesap eklenmemiş"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCariHesaplar.map((cariHesap) => (
            <Card key={cariHesap.id} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 mb-1">{cariHesap.firmaAdi}</CardTitle>
                    <Badge variant={cariHesap.firmaTuru === "Alıcı" ? "default" : "secondary"}>
                      {cariHesap.firmaTuru}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {cariHesap.subeBolge && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-2 h-4 w-4" />
                    {cariHesap.subeBolge}
                  </div>
                )}
                {cariHesap.telefon && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    {cariHesap.telefon}
                  </div>
                )}
                {cariHesap.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="mr-2 h-4 w-4" />
                    {cariHesap.email}
                  </div>
                )}
                
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCariHesap(cariHesap)}
                    className="flex-1"
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Görüntüle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(cariHesap)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cariHesap.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || !!editingCariHesap} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCariHesap ? "Cari Hesap Düzenle" : "Yeni Cari Hesap"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firmaAdi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma Adı *</FormLabel>
                    <FormControl>
                      <Input placeholder="Firma adını giriniz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firmaTuru"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma Türü *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Firma türünü seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Alıcı">Alıcı</SelectItem>
                        <SelectItem value="Satıcı">Satıcı</SelectItem>
                        <SelectItem value="Hem Alıcı Hem Satıcı">Hem Alıcı Hem Satıcı</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subeBolge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şube/Bölge</FormLabel>
                    <FormControl>
                      <Input placeholder="Şube veya bölge bilgisi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="telefon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="0212 555 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="ornek@firma.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="adres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Firma adresi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vergiNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vergi No</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vergiDairesi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vergi Dairesi</FormLabel>
                      <FormControl>
                        <Input placeholder="Kadıköy VD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notlar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ek notlar ve açıklamalar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? "Kaydediliyor..." 
                    : editingCariHesap 
                      ? "Güncelle" 
                      : "Kaydet"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex-1"
                >
                  İptal
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Detail View Modal */}
      {selectedCariHesap && (
        <Dialog open={!!selectedCariHesap} onOpenChange={() => setSelectedCariHesap(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {selectedCariHesap.firmaAdi}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Firma Türü</p>
                  <Badge variant={selectedCariHesap.firmaTuru === "Alıcı" ? "default" : "secondary"}>
                    {selectedCariHesap.firmaTuru}
                  </Badge>
                </div>
                {selectedCariHesap.subeBolge && (
                  <div>
                    <p className="text-sm text-gray-500">Şube/Bölge</p>
                    <p className="font-medium">{selectedCariHesap.subeBolge}</p>
                  </div>
                )}
              </div>
              
              {selectedCariHesap.telefon && (
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium">{selectedCariHesap.telefon}</p>
                </div>
              )}
              
              {selectedCariHesap.email && (
                <div>
                  <p className="text-sm text-gray-500">E-mail</p>
                  <p className="font-medium">{selectedCariHesap.email}</p>
                </div>
              )}
              
              {selectedCariHesap.adres && (
                <div>
                  <p className="text-sm text-gray-500">Adres</p>
                  <p className="font-medium">{selectedCariHesap.adres}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {selectedCariHesap.vergiNo && (
                  <div>
                    <p className="text-sm text-gray-500">Vergi No</p>
                    <p className="font-medium">{selectedCariHesap.vergiNo}</p>
                  </div>
                )}
                {selectedCariHesap.vergiDairesi && (
                  <div>
                    <p className="text-sm text-gray-500">Vergi Dairesi</p>
                    <p className="font-medium">{selectedCariHesap.vergiDairesi}</p>
                  </div>
                )}
              </div>
              
              {selectedCariHesap.notlar && (
                <div>
                  <p className="text-sm text-gray-500">Notlar</p>
                  <p className="font-medium">{selectedCariHesap.notlar}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => {
                    setSelectedCariHesap(null);
                    handleEdit(selectedCariHesap);
                  }}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCariHesap(null)}
                  className="flex-1"
                >
                  Kapat
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}