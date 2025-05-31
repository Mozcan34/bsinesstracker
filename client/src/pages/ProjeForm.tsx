import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { Proje } from "@shared/schema";

const projeFormSchema = z.object({
  projeAdi: z.string().min(1, "Proje adı gereklidir"),
  aciklama: z.string().optional(),
  cariHesapId: z.string().min(1, "Firma seçimi gereklidir"),
  teklifId: z.string().optional(),
  projeTarihi: z.date({
    required_error: "Proje tarihi gereklidir",
  }),
  sonTeslimTarihi: z.date().optional(),
  projeDurumu: z.enum(["Devam Ediyor", "Tamamlandı", "İptal", "Beklemede"], {
    errorMap: () => ({ message: "Geçerli bir durum seçin" }),
  }),
  butce: z.string().optional(),
  harcananTutar: z.string().optional(),
  tamamlanmaOrani: z.string().optional(),
  sorumluKisi: z.string().optional(),
  notlar: z.string().optional(),
});

type ProjeFormValues = z.infer<typeof projeFormSchema>;

export default function ProjeForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isEditing = Boolean(id);
  
  const { data: proje, isLoading: isLoadingProje } = useQuery<Proje>({
    queryKey: [`/api/projeler/${id}`],
    enabled: isEditing,
    queryFn: async () => {
      const response = await fetch(`/api/projeler/${id}`);
      if (!response.ok) throw new Error("Proje yüklenemedi");
      return response.json();
    },
  });
  
  const { data: cariHesaplar, isLoading: isLoadingCariHesaplar } = useQuery({
    queryKey: ["/api/cari-hesaplar"],
    queryFn: async () => {
      const response = await fetch("/api/cari-hesaplar");
      if (!response.ok) throw new Error("Cari hesaplar yüklenemedi");
      return response.json();
    },
  });
  
  const { data: teklifler, isLoading: isLoadingTeklifler } = useQuery({
    queryKey: ["/api/teklifler"],
    queryFn: async () => {
      const response = await fetch("/api/teklifler");
      if (!response.ok) throw new Error("Teklifler yüklenemedi");
      return response.json();
    },
  });

  const form = useForm<ProjeFormValues>({
    resolver: zodResolver(projeFormSchema),
    defaultValues: {
      projeAdi: "",
      aciklama: "",
      cariHesapId: "",
      teklifId: "",
      projeTarihi: new Date(),
      sonTeslimTarihi: undefined,
      projeDurumu: "Devam Ediyor",
      butce: "",
      harcananTutar: "",
      tamamlanmaOrani: "0",
      sorumluKisi: "",
      notlar: "",
    },
  });

  useEffect(() => {
    if (proje && isEditing) {
      form.reset({
        projeAdi: proje.projeAdi,
        aciklama: proje.aciklama || "",
        cariHesapId: String(proje.cariHesapId),
        teklifId: proje.teklifId ? String(proje.teklifId) : "",
        projeTarihi: new Date(proje.projeTarihi),
        sonTeslimTarihi: proje.sonTeslimTarihi ? new Date(proje.sonTeslimTarihi) : undefined,
        projeDurumu: proje.projeDurumu,
        butce: proje.butce || "",
        harcananTutar: proje.harcananTutar || "",
        tamamlanmaOrani: proje.tamamlanmaOrani ? String(proje.tamamlanmaOrani) : "0",
        sorumluKisi: proje.sorumluKisi || "",
        notlar: proje.notlar || "",
      });
    }
  }, [proje, isEditing, form]);

  const createMutation = useMutation({
    mutationFn: async (data: ProjeFormValues) => {
      const payload = {
        ...data,
        cariHesapId: parseInt(data.cariHesapId),
        teklifId: data.teklifId ? parseInt(data.teklifId) : undefined,
        butce: data.butce || undefined,
        harcananTutar: data.harcananTutar || undefined,
        tamamlanmaOrani: data.tamamlanmaOrani ? parseInt(data.tamamlanmaOrani) : 0,
      };
      
      const response = await fetch("/api/projeler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error("Proje oluşturulamadı");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projeler"] });
      toast({
        title: "Başarılı",
        description: "Proje başarıyla oluşturuldu.",
      });
      navigate("/projeler");
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Proje oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProjeFormValues) => {
      const payload = {
        ...data,
        cariHesapId: parseInt(data.cariHesapId),
        teklifId: data.teklifId ? parseInt(data.teklifId) : undefined,
        butce: data.butce || undefined,
        harcananTutar: data.harcananTutar || undefined,
        tamamlanmaOrani: data.tamamlanmaOrani ? parseInt(data.tamamlanmaOrani) : 0,
      };
      
      const response = await fetch(`/api/projeler/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error("Proje güncellenemedi");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projeler"] });
      queryClient.invalidateQueries({ queryKey: [`/api/projeler/${id}`] });
      toast({
        title: "Başarılı",
        description: "Proje başarıyla güncellendi.",
      });
      navigate("/projeler");
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Proje güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ProjeFormValues) {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  if ((isEditing && isLoadingProje) || isLoadingCariHesaplar || isLoadingTeklifler) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Veriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          className="mr-2" 
          onClick={() => navigate("/projeler")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Geri</span>
        </Button>
        <h2 className="text-2xl font-semibold">
          {isEditing ? "Proje Düzenle" : "Yeni Proje"}
        </h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="projeAdi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proje Adı *</FormLabel>
                      <FormControl>
                        <Input placeholder="Proje adını girin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cariHesapId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firma *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Firma seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cariHesaplar?.map((cariHesap: any) => (
                            <SelectItem 
                              key={cariHesap.id} 
                              value={cariHesap.id.toString()}
                            >
                              {cariHesap.firmaAdi}
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
                  name="teklifId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İlgili Teklif</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Teklif seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Seçim yok</SelectItem>
                          {teklifler?.map((teklif: any) => (
                            <SelectItem 
                              key={teklif.id} 
                              value={teklif.id.toString()}
                            >
                              {teklif.teklifNo} - {teklif.teklifAdi}
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
                  name="projeTarihi"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Başlangıç Tarihi *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: tr })
                              ) : (
                                <span>Tarih seçin</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sonTeslimTarihi"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Teslim Tarihi</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: tr })
                              ) : (
                                <span>Tarih seçin</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projeDurumu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proje Durumu *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Durum seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                          <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                          <SelectItem value="Beklemede">Beklemede</SelectItem>
                          <SelectItem value="İptal">İptal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sorumluKisi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sorumlu Kişi</FormLabel>
                      <FormControl>
                        <Input placeholder="Sorumlu kişi adını girin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="butce"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bütçe</FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="harcananTutar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harcanan Tutar</FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tamamlanmaOrani"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamamlanma Oranı (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="aciklama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Açıklama</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Proje açıklamasını girin"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notlar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notlar</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Proje ile ilgili notları girin"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/projeler")}
                >
                  İptal
                </Button>
                <Button type="submit">
                  {isEditing ? "Güncelle" : "Oluştur"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
