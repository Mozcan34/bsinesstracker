import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, Briefcase, Calculator } from "lucide-react";

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateModal({ open, onClose }: CreateModalProps) {
  const [, navigate] = useLocation();

  const items = [
    {
      title: "Yeni Cari Hesap",
      description: "Yeni müşteri veya tedarikçi ekleyin",
      icon: Plus,
      color: "bg-blue-500",
      action: () => {
        onClose();
        navigate("/accounts/new");
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
      icon: Users,
      color: "bg-purple-500",
      action: () => {
        onClose();
        navigate("/projects/new");
      }
    },
    {
      title: "Yeni Görev",
      description: "Yapılacak iş ekleyin",
      icon: Briefcase,
      color: "bg-orange-500",
      action: () => {
        onClose();
        navigate("/tasks/new");
      }
    },
    {
      title: "Yeni Hesap",
      description: "Yeni hesap ekleyin",
      icon: Calculator,
      color: "bg-teal-500",
      action: () => {
        onClose();
        navigate("/accounts/new");
      }
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Oluştur</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <Button
              key={item.title}
              variant="outline"
              className="h-32 flex-col gap-2 hover:bg-accent"
              onClick={item.action}
            >
              <item.icon className={`h-8 w-8 ${item.color} text-white rounded-lg p-1.5`} />
              <div className="space-y-1 text-left">
                <h3 className="font-medium leading-none">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}