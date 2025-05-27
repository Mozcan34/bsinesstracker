import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, FileText, FolderKanban, CheckSquare } from "lucide-react";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateModal({ isOpen, onClose }: CreateModalProps) {
  const createOptions = [
    {
      title: "Yeni Cari Hesap",
      description: "Yeni müşteri veya tedarikçi ekleyin",
      icon: Building2,
      color: "bg-blue-500",
      action: () => {
        onClose();
        // Navigate to create form
      }
    },
    {
      title: "Yeni Teklif",
      description: "Müşteri için teklif oluşturun",
      icon: FileText,
      color: "bg-green-500",
      action: () => {
        onClose();
        // Navigate to create form
      }
    },
    {
      title: "Yeni Proje",
      description: "Yeni proje başlatın",
      icon: FolderKanban,
      color: "bg-purple-500",
      action: () => {
        onClose();
        // Navigate to create form
      }
    },
    {
      title: "Yeni Görev",
      description: "Yapılacak iş ekleyin",
      icon: CheckSquare,
      color: "bg-orange-500",
      action: () => {
        onClose();
        // Navigate to create form
      }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Oluştur</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          {createOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.title}
                variant="outline"
                className="flex items-center justify-start p-4 h-auto"
                onClick={option.action}
              >
                <div className={`${option.color} p-2 rounded-lg mr-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{option.title}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}