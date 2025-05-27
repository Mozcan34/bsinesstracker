import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Building2, FileText, CheckSquare, Plus } from "lucide-react";

interface BottomNavigationProps {
  onCreateClick: () => void;
}

const navItems = [
  { name: "Ana Sayfa", href: "/", icon: Home },
  { name: "Cari", href: "/cari-hesaplar", icon: Building2 },
  { name: "Teklif", href: "/teklifler", icon: FileText },
  { name: "Görevler", href: "/gorevler", icon: CheckSquare },
];

export default function BottomNavigation({ onCreateClick }: BottomNavigationProps) {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/20 md:hidden z-40">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a className="flex flex-col items-center justify-center py-2 px-3 min-w-0">
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`text-xs mt-1 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                  {item.name}
                </span>
              </a>
            </Link>
          );
        })}
        <Button
          onClick={onCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}