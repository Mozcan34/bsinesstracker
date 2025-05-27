import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Building2, 
  FileText, 
  FolderKanban, 
  CheckSquare, 
  BarChart3, 
  Settings 
} from "lucide-react";

const navigationItems = [
  {
    name: "Ana Sayfa",
    href: "/",
    icon: Home,
  },
  {
    name: "Cari Hesaplar",
    href: "/cari-hesaplar",
    icon: Building2,
  },
  {
    name: "Teklifler",
    href: "/teklifler",
    icon: FileText,
  },
  {
    name: "Projeler",
    href: "/projeler",
    icon: FolderKanban,
  },
  {
    name: "Yapılacaklar",
    href: "/gorevler",
    icon: CheckSquare,
  },
  {
    name: "Raporlar",
    href: "/raporlar",
    icon: BarChart3,
  },
  {
    name: "Ayarlar",
    href: "/ayarlar",
    icon: Settings,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-white/95 backdrop-blur-md shadow-xl pt-5 pb-4 overflow-y-auto border-r border-gray-200/20">
          <nav className="mt-5 flex-1 px-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600",
                      "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105"
                    )}
                  >
                    <Icon
                      className={cn(
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-blue-500",
                        "mr-3 h-5 w-5"
                      )}
                    />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>
          
          <div className="flex-shrink-0 flex border-t border-gray-200/50 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full h-9 w-9 flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-semibold">KU</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Kullanıcı Adı
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    İş Yöneticisi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}