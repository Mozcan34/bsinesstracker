import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Building2, 
  FileText, 
  FolderKanban, 
  CheckSquare, 
  BarChart3, 
  Settings,
  X 
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: "Ana Sayfa", href: "/", icon: Home },
  { name: "Cari Hesaplar", href: "/cari-hesaplar", icon: Building2 },
  { name: "Teklifler", href: "/teklifler", icon: FileText },
  { name: "Projeler", href: "/projeler", icon: FolderKanban },
  { name: "Yapılacaklar", href: "/gorevler", icon: CheckSquare },
  { name: "Raporlar", href: "/raporlar", icon: BarChart3 },
  { name: "Ayarlar", href: "/ayarlar", icon: Settings },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 md:hidden">
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white/95 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menü</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-6 w-6 text-gray-400" />
          </Button>
        </div>
        <nav className="mt-5 px-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600",
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                  )}
                  onClick={onClose}
                >
                  <Icon className={cn(isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500", "mr-3 h-5 w-5")} />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}