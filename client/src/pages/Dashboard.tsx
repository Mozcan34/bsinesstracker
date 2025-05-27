import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, FolderKanban, CheckSquare, Users, Clock, TrendingUp, AlertTriangle } from "lucide-react";

interface DashboardStats {
  cariHesaplar: number;
  teklifler: number;
  projeler: number;
  toplamGorevler: number;
  bekleyenGorevler: number;
  devamEdenGorevler: number;
  tamamlananGorevler: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const statsCards = [
    {
      title: "Cari Hesaplar",
      value: stats?.cariHesaplar || 0,
      icon: Building2,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Teklifler",
      value: stats?.teklifler || 0,
      icon: FileText,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Projeler",
      value: stats?.projeler || 0,
      icon: FolderKanban,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Toplam Görevler",
      value: stats?.toplamGorevler || 0,
      icon: CheckSquare,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  const gorevStats = [
    {
      title: "Bekleyen Görevler",
      value: stats?.bekleyenGorevler || 0,
      icon: Clock,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      title: "Devam Eden",
      value: stats?.devamEdenGorevler || 0,
      icon: TrendingUp,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Tamamlanan",
      value: stats?.tamamlananGorevler || 0,
      icon: CheckSquare,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">İş Yönetimi Dashboard</h1>
          <p className="text-blue-100">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">İş Yönetimi Dashboard</h1>
        <p className="text-blue-100">İşlerinizi tek yerden yönetin</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-xl`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <CheckSquare className="mr-2 h-5 w-5 text-blue-600" />
              Görev Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gorevStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`${stat.bgColor} p-2 rounded-lg`}>
                        <Icon className={`h-4 w-4 ${stat.textColor}`} />
                      </div>
                      <span className="font-medium text-gray-700">{stat.title}</span>
                    </div>
                    <span className="font-bold text-gray-900">{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Hızlı İşlemler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                <span className="font-medium">Yeni Cari Hesap</span>
                <Building2 className="h-5 w-5" />
              </button>
              <button className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200">
                <span className="font-medium">Yeni Teklif</span>
                <FileText className="h-5 w-5" />
              </button>
              <button className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
                <span className="font-medium">Yeni Proje</span>
                <FolderKanban className="h-5 w-5" />
              </button>
              <button className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200">
                <span className="font-medium">Yeni Görev</span>
                <CheckSquare className="h-5 w-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            İş Yönetimi Uygulamasına Hoş Geldiniz! 🎉
          </h2>
          <p className="text-blue-100 text-lg">
            Cari hesaplarınızı, tekliflerinizi, projelerinizi ve görevlerinizi tek yerden yönetebilirsiniz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}