import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";
import BottomNavigation from "./BottomNavigation";
import CreateModal from "./CreateModal";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/20">
            <div className="flex items-center justify-between px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">İş Yönetimi</h1>
              <div className="w-10" /> {/* Spacer for balance */}
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation onCreateClick={() => setIsCreateModalOpen(true)} />

        {/* Create Modal */}
        <CreateModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      </div>
    </div>
  );
}