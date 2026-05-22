"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, User, Key, ShieldCheck, Loader2 } from "lucide-react";
import {
  getAllStaff,
  createStaff,
  updateStaffStatus,
  deleteStaff,
} from "@/lib/firestore";
import type { Staff } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Add Staff form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load staff members
  async function loadStaff() {
    try {
      setLoading(true);
      const data = await getAllStaff();
      setStaffList(data);
    } catch (error) {
      console.error("Staff loading error:", error);
      toast({
        title: "Hata",
        description: "Personel listesi yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Add Staff submission
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPin.length !== 4 || isNaN(Number(newPin))) {
      toast({
        title: "Geçersiz giriş",
        description: "Lütfen geçerli bir isim ve 4 haneli sayısal PIN girin.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createStaff(newName.trim(), newPin);
      toast({
        title: "Görevli eklendi! 🎉",
        description: `${newName} başarıyla kutsal görevli olarak kaydedildi.`,
      });
      setNewName("");
      setNewPin("");
      setIsAddOpen(false);
      loadStaff();
    } catch (error) {
      console.error("Create staff error:", error);
      toast({
        title: "Hata",
        description: "Görevli eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle staff active/inactive status
  const handleStatusToggle = async (staffId: string, currentStatus: boolean) => {
    try {
      await updateStaffStatus(staffId, !currentStatus);
      toast({
        title: "Durum güncellendi",
        description: "Görevli aktiflik durumu başarıyla değiştirildi.",
      });
      // Update local state
      setStaffList((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, isActive: !currentStatus } : s))
      );
    } catch (error) {
      console.error("Toggle status error:", error);
      toast({
        title: "Hata",
        description: "Görevli durumu güncellenemedi.",
        variant: "destructive",
      });
    }
  };

  // Handle Delete staff
  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (!confirm(`${staffName} adlı görevliyi silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await deleteStaff(staffId);
      toast({
        title: "Görevli silindi",
        description: `${staffName} kutsal listeden silindi.`,
      });
      loadStaff();
    } catch (error) {
      console.error("Delete staff error:", error);
      toast({
        title: "Hata",
        description: "Görevli silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const filteredStaff = staffList.filter((staff) =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient-gold-light uppercase tracking-wide">
            Kutsal Görevliler
          </h1>
          <p className="text-sm text-coffee-600 font-semibold mt-1">
            🏛️ Tapınakta damga (mühür) verecek ve ödül doğrulayacak kutsal görevlileri yönetin
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-950 hover:shadow-gold/20 hover:shadow-md transition-all gap-2 self-start sm:self-auto rounded-xl h-11 px-5 font-bold">
              <Plus className="h-4 w-4" />
              Yeni Görevli Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-premium bg-white border border-gold/25 text-coffee-950 sm:max-w-md rounded-3xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-gradient-gold-light font-display font-bold text-xl uppercase tracking-wide">
                Görevli Ekle
              </DialogTitle>
              <DialogDescription className="text-coffee-600 font-semibold text-xs mt-1">
                Kutsal görevlinin giriş yaparken kullanacağı 4 haneli PIN kodunu belirleyin.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-coffee-700 text-sm font-semibold">
                  Görevli Adı Soyadı
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
                  <Input
                    id="name"
                    placeholder="Hermes Yılmaz"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="bg-[#FAF8F5]/90 border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold focus:ring-gold/10 pl-10 h-11 rounded-xl font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-coffee-700 text-sm font-semibold">
                  Giriş PIN Kodu (4 Hane)
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
                  <Input
                    id="pin"
                    type="password"
                    placeholder="••••"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                    required
                    className="bg-[#FAF8F5]/90 border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold focus:ring-gold/10 pl-10 h-11 rounded-xl tracking-[0.2em] font-medium"
                  />
                </div>
              </div>
              <DialogFooter className="pt-4 gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddOpen(false)}
                  className="text-coffee-600 hover:text-coffee-900 hover:bg-[#F4EFE6]/40 rounded-xl"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-950 font-bold hover:shadow-md rounded-xl px-5"
                >
                  {submitting ? "Ekleniyor..." : "Görevli Ekle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Panel Content */}
      <Card className="glass-premium bg-white/70 border border-gold/15 overflow-hidden rounded-2xl shadow-sm">
        {/* Search */}
        <div className="p-4 bg-[#F4EFE6]/20 border-b border-[#EBE6DD] flex items-center justify-between">
          <Input
            placeholder="Görevli ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-10 rounded-xl"
          />
        </div>

        {/* Staff Table */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-gold animate-spin" />
            <p className="text-coffee-500 text-sm font-semibold">Görevliler yükleniyor...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 border border-gold/20 text-gold-dark mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-coffee-800 font-bold">Görevli Bulunamadı</p>
            <p className="text-coffee-500 text-xs font-semibold">Yeni bir kutsal görevli ekleyerek başlayabilirsiniz.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#EBE6DD] hover:bg-transparent">
                  <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider">Görevli</TableHead>
                  <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider text-center">Durum</TableHead>
                  <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider text-center">Verilen Mühür</TableHead>
                  <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider text-center">Kayıt Tarihi</TableHead>
                  <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id} className="border-[#EBE6DD] hover:bg-[#F4EFE6]/35 transition-colors">
                    <TableCell className="font-semibold text-coffee-950 text-sm flex items-center gap-3 py-4">
                      <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center border border-gold/25">
                        <span className="text-sm font-bold text-gold-dark">
                          {staff.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-coffee-950">{staff.name}</p>
                        <p className="text-coffee-500 text-[10px] uppercase font-mono tracking-wider font-semibold">
                          PIN: ••••
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={staff.isActive}
                          onCheckedChange={() => handleStatusToggle(staff.id!, staff.isActive)}
                          className="data-[state=checked]:bg-gold"
                        />
                        <Badge
                          variant="secondary"
                          className={
                            staff.isActive
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold"
                              : "bg-[#EBE6DD] text-coffee-500 border border-transparent font-bold"
                          }
                        >
                          {staff.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm font-bold text-coffee-800 py-4 font-mono">
                      {staff.totalStampsGiven} Mühür
                    </TableCell>
                    <TableCell className="text-center text-xs text-coffee-600 py-4 font-mono font-medium">
                      {staff.createdAt instanceof Date
                        ? staff.createdAt.toLocaleDateString("tr-TR")
                        : (staff.createdAt as { toDate?: () => Date })?.toDate
                        ? (staff.createdAt as { toDate: () => Date }).toDate().toLocaleDateString("tr-TR")
                        : "Bilinmiyor"}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteStaff(staff.id!, staff.name)}
                        className="text-coffee-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-full h-9 w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
