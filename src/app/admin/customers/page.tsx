"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAllCustomers,
  updateCustomerStamps,
  resetCustomerStamps,
  softDeleteCustomer,
  addStampLog,
} from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { formatPhone, timeAgo } from "@/lib/utils";
import type { Customer } from "@/types";
import {
  Search,
  Plus,
  Minus,
  RotateCcw,
  Trash2,
  Loader2,
  Users,
  Landmark,
} from "lucide-react";

type DialogMode = "add" | "subtract" | "reset" | "delete" | null;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  async function loadCustomers() {
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast({
        title: "Hata",
        description: "Müşteriler yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().replace(/\s/g, "");
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.replace(/\s/g, "").includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);


  function openDialog(mode: DialogMode, customer: Customer) {
    setDialogMode(mode);
    setSelectedCustomer(customer);
    setAdminNote("");
  }

  function closeDialog() {
    setDialogMode(null);
    setSelectedCustomer(null);
    setAdminNote("");
  }

  async function handleAddStamp() {
    if (!selectedCustomer?.id) return;
    setActionLoading(true);
    try {
      await updateCustomerStamps(selectedCustomer.id, 1);
      await addStampLog(
        selectedCustomer.id,
        "admin",
        "manual_adjustment",
        selectedCustomer.name,
        "Admin",
        adminNote || "Manuel +1 damga"
      );
      toast({
        title: "Başarılı",
        description: `${selectedCustomer.name} için +1 damga eklendi.`,
      });
      closeDialog();
      await loadCustomers();
    } catch (error) {
      console.error(error);
      toast({
        title: "Hata",
        description: "Damga eklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSubtractStamp() {
    if (!selectedCustomer?.id) return;
    if (selectedCustomer.stamps <= 0) {
      toast({
        title: "Uyarı",
        description: "Müşterinin damga sayısı zaten 0.",
        variant: "destructive",
      });
      closeDialog();
      return;
    }
    setActionLoading(true);
    try {
      await updateCustomerStamps(selectedCustomer.id, -1);
      await addStampLog(
        selectedCustomer.id,
        "admin",
        "manual_adjustment",
        selectedCustomer.name,
        "Admin",
        adminNote || "Manuel -1 damga"
      );
      toast({
        title: "Başarılı",
        description: `${selectedCustomer.name} için -1 damga çıkarıldı.`,
      });
      closeDialog();
      await loadCustomers();
    } catch (error) {
      console.error(error);
      toast({
        title: "Hata",
        description: "Damga çıkarılırken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReset() {
    if (!selectedCustomer?.id) return;
    setActionLoading(true);
    try {
      await resetCustomerStamps(selectedCustomer.id);
      await addStampLog(
        selectedCustomer.id,
        "admin",
        "manual_adjustment",
        selectedCustomer.name,
        "Admin",
        adminNote || "Damgalar sıfırlandı"
      );
      toast({
        title: "Başarılı",
        description: `${selectedCustomer.name} damgaları sıfırlandı.`,
      });
      closeDialog();
      await loadCustomers();
    } catch (error) {
      console.error(error);
      toast({
        title: "Hata",
        description: "Sıfırlama sırasında hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedCustomer?.id) return;
    setActionLoading(true);
    try {
      await softDeleteCustomer(selectedCustomer.id);
      toast({
        title: "Başarılı",
        description: `${selectedCustomer.name} silindi.`,
      });
      closeDialog();
      await loadCustomers();
    } catch (error) {
      console.error(error);
      toast({
        title: "Hata",
        description: "Müşteri silinirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  function handleConfirm() {
    switch (dialogMode) {
      case "add":
        return handleAddStamp();
      case "subtract":
        return handleSubtractStamp();
      case "reset":
        return handleReset();
      case "delete":
        return handleDelete();
    }
  }

  const dialogConfig: Record<
    string,
    { title: string; description: string; confirmLabel: string; variant: "default" | "destructive" }
  > = {
    add: {
      title: "Mühür Ekle (+1)",
      description: `${selectedCustomer?.name || ""} müşterisine 1 kutsal mühür (damga) eklenecek.`,
      confirmLabel: "Ekle",
      variant: "default",
    },
    subtract: {
      title: "Mühür Çıkar (-1)",
      description: `${selectedCustomer?.name || ""} müşterisinden 1 kutsal mühür çıkarılacak.`,
      confirmLabel: "Çıkar",
      variant: "default",
    },
    reset: {
      title: "Mühürleri Sıfırla",
      description: `${selectedCustomer?.name || ""} müşterisinin tüm liyakat mühürleri sıfırlanacak. Bu işlem geri alınamaz.`,
      confirmLabel: "Sıfırla",
      variant: "destructive",
    },
    delete: {
      title: "Müşteriyi Sil",
      description: `${selectedCustomer?.name || ""} müşterisi silinecek. Lütfen bir silme nedeni ekleyin.`,
      confirmLabel: "Sil",
      variant: "destructive",
    },
  };

  const currentDialog = dialogMode ? dialogConfig[dialogMode] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient-gold-light uppercase tracking-wide">
            Müşteriler
          </h1>
          <p className="text-sm text-coffee-600 font-semibold mt-1">
            🏛️ Toplam {customers.length} kutsal elçi kayıtlı
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="glass-premium bg-white/80 border border-gold/15 rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-coffee-500 uppercase tracking-wider">Müşteri Sayısı</p>
              <p className="text-lg font-display font-bold text-coffee-950">
                {customers.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-premium bg-white/80 border border-gold/15 rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-gold-dark" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-coffee-500 uppercase tracking-wider">Aktif Mühürler</p>
              <p className="text-lg font-display font-bold text-coffee-950">
                {customers.reduce((a, c) => a + c.stamps, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-premium bg-white/80 border border-gold/15 rounded-xl shadow-sm col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-coffee-500 uppercase tracking-wider">Toplam Ziyaret</p>
              <p className="text-lg font-display font-bold text-coffee-950">
                {customers.reduce((a, c) => a + c.totalVisits, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="İsim, e-posta veya telefon ile ara..."
          className="pl-10 bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl"
        />
      </div>

      {/* Table */}
      <Card className="glass-premium bg-white/70 border border-gold/15 overflow-hidden rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <Table>
             <TableHeader>
              <TableRow className="border-[#EBE6DD] hover:bg-transparent">
                <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider">
                  Müşteri Adı
                </TableHead>
                <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider">
                  E-posta
                </TableHead>
                <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider">
                  Telefon
                </TableHead>
                <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider text-center">
                  Mühür (Damga)
                </TableHead>
                <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider text-center">
                  Ziyaret
                </TableHead>
                <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider">
                  Son Ziyaret
                </TableHead>
                <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider text-right">
                  Kutsal İşlemler
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-coffee-500 py-12 font-semibold"
                  >

                    {searchQuery
                      ? "Aramanızla eşleşen müşteri bulunamadı."
                      : "Henüz kutsal elçi kaydı yok."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="border-[#EBE6DD] hover:bg-[#F4EFE6]/35 transition-colors"
                  >
                    <TableCell className="font-semibold text-coffee-950 text-sm">
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-coffee-700 text-sm">
                      {customer.email || "—"}
                    </TableCell>
                    <TableCell className="text-coffee-700 text-sm font-mono font-medium">
                      {formatPhone(customer.phone)}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className="bg-gold/10 text-gold-dark border border-gold/25 font-bold text-sm min-w-[2.5rem] justify-center rounded-full"
                      >
                        {customer.stamps}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-coffee-700 text-sm font-semibold">
                      {customer.totalVisits}
                    </TableCell>
                    <TableCell className="text-coffee-600 text-sm font-medium">
                      {customer.lastVisit
                        ? timeAgo(customer.lastVisit)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-full"
                          onClick={() => openDialog("add", customer)}
                          title="Mühür Ekle +1"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border border-transparent hover:border-orange-100 rounded-full"
                          onClick={() => openDialog("subtract", customer)}
                          title="Mühür Çıkar -1"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border border-transparent hover:border-yellow-100 rounded-full"
                          onClick={() => openDialog("reset", customer)}
                          title="Sıfırla"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-full"
                          onClick={() => openDialog("delete", customer)}
                          title="Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!dialogMode} onOpenChange={() => closeDialog()}>
        <DialogContent className="glass-premium bg-white border border-gold/25 text-coffee-950 sm:max-w-md rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-gradient-gold-light font-display font-bold text-xl uppercase tracking-wide">
              {currentDialog?.title}
            </DialogTitle>
            <DialogDescription className="text-coffee-600 font-semibold text-xs mt-1">
              {currentDialog?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-coffee-700 text-sm font-semibold">
                {dialogMode === "delete" ? "Silme Nedeni" : "Not (opsiyonel)"}
              </Label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  dialogMode === "delete"
                    ? "Silme nedenini belirtin..."
                    : "İşlem hakkında not ekleyin..."
                }
                className="mt-1.5 bg-[#FAF8F5]/90 border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold focus:ring-gold/10 min-h-[80px] rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={closeDialog}
              className="text-coffee-600 hover:text-coffee-900 hover:bg-[#F4EFE6]/40 rounded-xl"
              disabled={actionLoading}
            >
              İptal
            </Button>
            <Button
              variant={currentDialog?.variant === "destructive" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={actionLoading || (dialogMode === "delete" && !adminNote.trim())}
              className={
                currentDialog?.variant === "destructive"
                  ? "rounded-xl font-bold"
                  : "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-950 font-bold hover:shadow-md rounded-xl"
              }
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {currentDialog?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
