"use client";

import { useEffect, useState } from "react";
import {
  Megaphone,
  Users,
  MessageSquare,
  Sparkles,
  Send,
  History,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Mail,
  Bell,
  Smartphone,
  Crown,
  Loader2,
} from "lucide-react";
import {
  getCampaigns,
  createCampaign,
  getCustomersBySegment,
} from "@/lib/firestore";
import type { Campaign, Customer, CampaignSegment, CampaignChannel } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { toast } = useToast();

  // Stepper State
  const [step, setStep] = useState(1); // 1: Segment, 2: Message, 3: Channel, 4: Preview
  const [selectedSegment, setSelectedSegment] = useState<CampaignSegment>("all_customers");
  const [targetCustomers, setTargetCustomers] = useState<Customer[]>([]);
  const [loadingTargetCount, setLoadingTargetCount] = useState(false);

  const [message, setMessage] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<CampaignChannel>("push");
  const [sending, setSending] = useState(false);

  // AI Wizard State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiTone, setAiTone] = useState("friendly");
  const [aiPurpose, setAiPurpose] = useState("discount");
  const [generatingAi, setGeneratingAi] = useState(false);

  // Load campaign history
  async function loadCampaigns() {
    try {
      setLoadingHistory(true);
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
      toast({
        title: "Hata",
        description: "Kampanya geçmişi yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update target count when segment changes
  useEffect(() => {
    async function updateTargetCount() {
      setLoadingTargetCount(true);
      try {
        const list = await getCustomersBySegment(selectedSegment);
        setTargetCustomers(list);
      } catch (error) {
        console.error("Error fetching segment count:", error);
      } finally {
        setLoadingTargetCount(false);
      }
    }
    updateTargetCount();
  }, [selectedSegment]);

  // AI Text Generation handler
  const handleGenerateAiText = async () => {
    setGeneratingAi(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segment: selectedSegment,
          tone: aiTone,
          purpose: aiPurpose,
          channel: selectedChannel,
        }),
      });

      const data = await response.json();
      if (response.ok && data.generatedText) {
        setMessage(data.generatedText);
        setIsAiOpen(false);
        toast({
          title: "Mesaj üretildi! ✨",
          description: "Claude AI kampanya metnini oluşturdu.",
        });
      } else {
        throw new Error(data.error || "Metin üretilemedi");
      }
    } catch (error) {
      const err = error as Error;
      console.error("AI generation failed:", err);
      // Fallback text generator tailored to Greek Mythology branding
      const fallbacks: Record<string, string> = {
        discount: "Merhaba! Holycon Tapınağı'nda size özel kutsal bir fırsat var! Bu hafta Ambrosia ve nektar ikramlarımızda %20 lütuf sizi bekliyor. Hemen gelip mührünüzü okutmayı unutmayın! 🏛️✨",
        celebration: "Selam! Bugün kutsal nektar keyfini ikiye katlamaya ne dersiniz? Holycon'da güler yüzlü görevlilerimiz ve kutsal sunumlarımız sizi bekliyor! 🏛️🌿",
        reminder: "Tapınağın huzurunu ve nektarın tadını özlediniz mi? 🏛️ Holycon'da biriktirdiğiniz kutsal mühürleri tamamlamak ve ödülünüzü almak için sabırsızlanıyoruz!",
      };
      const text = fallbacks[aiPurpose] || "Merhaba! Holycon Tapınağı'nda günün kutsal nektarı hazır. Sizi aramızda görmekten mutluluk duyarız! 🏛️";
      setMessage(text);
      setIsAiOpen(false);
      toast({
        title: "Taslak oluşturuldu (Çevrimdışı Mod)",
        description: "API anahtarı bulunmadığı için örnek bir kampanya metni hazırlandı.",
      });
    } finally {
      setGeneratingAi(false);
    }
  };

  // Trigger campaign broadcast send
  const handleSendCampaign = async () => {
    if (!message.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir kampanya mesajı girin.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Call broadcast API route
      const response = await fetch("/api/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segment: selectedSegment,
          message: message.trim(),
          channel: selectedChannel,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Kampanya gönderilemedi");
      }

      toast({
        title: "Kampanya gönderildi! 🚀",
        description: `${targetCustomers.length} alıcıya gönderim kuyruğa alındı.`,
      });

      // Clear & Reset Form
      setMessage("");
      setStep(1);
      loadCampaigns();
    } catch (error) {
      const err = error as Error;
      console.error("Campaign send error:", err);
      // Log in Firestore anyway as draft/failed
      try {
        await createCampaign({
          message: message.trim(),
          segment: selectedSegment,
          channel: selectedChannel,
          sentCount: 0,
          targetCount: targetCustomers.length,
          createdAt: new Date(),
          status: "failed",
        });
        loadCampaigns();
      } catch (err) {
        console.error("Failed to log failed campaign:", err);
      }

      toast({
        title: "Gönderim Hatası",
        description: err.message || "Kampanya gönderilemedi, entegrasyon ayarlarını kontrol edin.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const segmentsMap = {
    all_customers: "Tüm Kutsal Elçiler",
    inactive_14_days: "14 Gündür Gelmeyenler",
    no_rewards: "Hiç Lütuf Almayanlar",
    custom: "Özel Segment",
  };

  const channelsMap = {
    push: "Mobil Bildirim",
    whatsapp: "WhatsApp Mesajı",
    email: "E-Posta",
    all: "Tüm Kanallar",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gradient-gold-light uppercase tracking-wide">
          Kampanya Yönetimi
        </h1>
        <p className="text-sm text-coffee-600 font-semibold mt-1">
          🏛️ Müşterilerinize bildirim, WhatsApp veya e-posta göndererek onları tapınağa davet edin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stepper Card */}
        <div className="lg:col-span-2 glass-premium bg-white/70 border border-gold/15 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-[#EBE6DD]">
            <h2 className="font-display text-lg font-bold text-coffee-950 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-gold-dark" />
              KAMPANYA SİHİRBAZI
            </h2>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    step === s
                      ? "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-950 scale-110 shadow-md font-bold"
                      : step > s
                      ? "bg-gold/20 text-gold-dark font-bold"
                      : "bg-[#EBE6DD]/60 text-coffee-400 font-bold"
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: SEGMENT */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold text-coffee-700 uppercase tracking-wider mb-2">
                1. Hedef Kitle (Segment) Seçin
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: "all_customers",
                    title: "Tüm Elçiler",
                    desc: "Sistemde kayıtlı aktif tüm kutsal elçiler",
                    icon: Users,
                  },
                  {
                    id: "inactive_14_days",
                    title: "14 Gündür Uğramayanlar",
                    desc: "En az 2 haftadır tapınağı ziyaret etmeyen elçiler",
                    icon: AlertTriangle,
                  },
                  {
                    id: "no_rewards",
                    title: "Hiç Lütuf Almayanlar",
                    desc: "Kutsal mühür kartı olup henüz lütuf talep etmemiş elçiler",
                    icon: Crown,
                  },
                ].map((seg) => {
                  const Icon = seg.icon;
                  return (
                    <button
                      key={seg.id}
                      onClick={() => setSelectedSegment(seg.id as CampaignSegment)}
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between h-36 ${
                        selectedSegment === seg.id
                          ? "bg-gold/10 border-gold"
                          : "bg-white border-[#DECBAA]/30 hover:border-gold/30 hover:bg-[#F4EFE6]/10"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${selectedSegment === seg.id ? "text-gold-dark" : "text-coffee-400"}`} />
                      <div>
                        <p className="font-bold text-coffee-950 text-sm">{seg.title}</p>
                        <p className="text-coffee-500 text-[11px] mt-1 line-clamp-2 font-semibold">{seg.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[#F4EFE6]/35 border border-[#EBE6DD] flex items-center justify-between">
                <span className="text-coffee-600 text-xs font-bold">Hedefteki kişi sayısı:</span>
                {loadingTargetCount ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                ) : (
                  <span className="font-mono font-bold text-gold-dark text-base">{targetCustomers.length} Elçi</span>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: MESSAGE */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-coffee-700 uppercase tracking-wider">
                  2. Kampanya Mesajı Yazın
                </h3>
                <Button
                  size="sm"
                  onClick={() => setIsAiOpen(true)}
                  className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl gap-1.5 text-xs h-9 px-3.5 font-bold shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Claude AI ile Üret
                </Button>
              </div>

              <Textarea
                placeholder="Müşterilerinize göndermek istediğiniz tanrısal mesajı buraya yazın..."
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold rounded-xl resize-none min-h-[120px] font-medium"
              />
              <p className="text-[10px] text-coffee-500 text-right font-semibold">
                {message.length} karakter. İdeal boyut 160 karakterdir.
              </p>
            </div>
          )}

          {/* STEP 3: CHANNEL */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold text-coffee-700 uppercase tracking-wider mb-2">
                3. Gönderim Kanalı Seçin
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: "push",
                    title: "Push Bildirimi",
                    desc: "Kullanıcı telefonuna anlık PWA bildirimi",
                    icon: Bell,
                  },
                  {
                    id: "whatsapp",
                    title: "WhatsApp Mesajı",
                    desc: "WhatsApp Business API üzerinden mesaj",
                    icon: MessageSquare,
                  },
                  {
                    id: "email",
                    title: "E-Posta Kampanyası",
                    desc: "EmailJS şablonuyla e-posta kutusuna",
                    icon: Mail,
                  },
                ].map((chan) => {
                  const Icon = chan.icon;
                  return (
                    <button
                      key={chan.id}
                      onClick={() => setSelectedChannel(chan.id as CampaignChannel)}
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between h-36 ${
                        selectedChannel === chan.id
                          ? "bg-gold/10 border-gold"
                          : "bg-white border-[#DECBAA]/30 hover:border-gold/30 hover:bg-[#F4EFE6]/10"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${selectedChannel === chan.id ? "text-gold-dark" : "text-coffee-400"}`} />
                      <div>
                        <p className="font-bold text-coffee-950 text-sm">{chan.title}</p>
                        <p className="text-coffee-500 text-[11px] mt-1 font-semibold">{chan.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW & SEND */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-xs font-bold text-coffee-700 uppercase tracking-wider">
                4. Önizleme ve Onay
              </h3>

              <div className="bg-[#FAF8F5]/90 border border-[#EBE6DD] rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm pb-4 border-b border-[#EBE6DD]">
                  <div>
                    <p className="text-coffee-500 text-xs font-bold uppercase tracking-wider">Hedef Segment</p>
                    <p className="text-coffee-950 font-bold mt-0.5">{segmentsMap[selectedSegment]}</p>
                  </div>
                  <div>
                    <p className="text-coffee-500 text-xs font-bold uppercase tracking-wider">Gönderim Kanalı</p>
                    <p className="text-coffee-950 font-bold mt-0.5">{channelsMap[selectedChannel]}</p>
                  </div>
                  <div>
                    <p className="text-coffee-500 text-xs font-bold uppercase tracking-wider">Tahmini Alıcı Sayısı</p>
                    <p className="text-gold-dark font-mono font-bold mt-0.5">{targetCustomers.length} Elçi</p>
                  </div>
                  <div>
                    <p className="text-coffee-500 text-xs font-bold uppercase tracking-wider">Gönderim Modu</p>
                    <p className="text-emerald-600 font-bold mt-0.5">Hemen Gönder</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-coffee-500 text-xs font-bold uppercase tracking-wider">Mesaj İçeriği</p>
                  <div className="bg-[#F4EFE6]/35 border border-[#EBE6DD]/60 rounded-xl p-4 text-coffee-900 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {message}
                  </div>
                </div>
              </div>

              {selectedChannel === "whatsapp" && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs flex gap-2.5 font-semibold">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
                  <p>
                    <strong>Not:</strong> WhatsApp gönderimleri için Meta Business hesabınızın açık ve bakiyenizin olması gerekir. API hatası durumunda kampanya geçmişe &apos;başarısız&apos; olarak kaydedilir.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Stepper Footer buttons */}
          <div className="flex justify-between pt-4 border-t border-[#EBE6DD]">
            <Button
              variant="ghost"
              disabled={step === 1}
              onClick={() => setStep((s) => s - 1)}
              className="text-coffee-600 hover:text-coffee-900 hover:bg-[#F4EFE6]/40 rounded-xl h-11 px-4 gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Geri
            </Button>

            {step < 4 ? (
              <Button
                disabled={step === 2 && !message.trim()}
                onClick={() => setStep((s) => s + 1)}
                className="bg-white border-[#DECBAA]/45 text-coffee-950 hover:bg-[#F4EFE6]/40 rounded-xl h-11 px-5 font-bold gap-1.5 shadow-sm"
              >
                İleri
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSendCampaign}
                disabled={sending || targetCustomers.length === 0}
                className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-950 font-bold hover:shadow-md transition-all rounded-xl h-11 px-6 gap-2"
              >
                <Send className="h-4 w-4" />
                {sending ? "Gönderiliyor..." : "Kampanyayı Başlat"}
              </Button>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="glass-premium bg-white/70 border border-gold/15 p-6 rounded-2xl space-y-4 self-start shadow-sm">
          <h3 className="font-display text-md font-bold text-coffee-950 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-gold-dark" />
            SEGMENT DETAYLARI
          </h3>
          <div className="space-y-3.5 text-xs font-semibold">
            <div className="p-3 bg-[#F4EFE6]/35 border border-[#EBE6DD]/60 rounded-xl space-y-1">
              <span className="text-coffee-800 font-bold block">Tüm Kutsal Elçiler</span>
              <span className="text-coffee-500 block">Tapınağa üye olan, kaydı silinmemiş tüm elçilerinizi hedefler.</span>
            </div>
            <div className="p-3 bg-[#F4EFE6]/35 border border-[#EBE6DD]/60 rounded-xl space-y-1">
              <span className="text-coffee-800 font-bold block">14 Gündür Uğramayanlar</span>
              <span className="text-coffee-500 block">Son 2 haftadır tapınaktan mühür almamış elçiler. Onları nektar kokusuyla geri çağırın.</span>
            </div>
            <div className="p-3 bg-[#F4EFE6]/35 border border-[#EBE6DD]/60 rounded-xl space-y-1">
              <span className="text-coffee-800 font-bold block">Hiç Lütuf Almayanlar</span>
              <span className="text-coffee-500 block">Mühür toplayıp henüz lütfunu (ödül) kullanmamış olanlar. Onları ödülünü almaya teşvik edin.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns History */}
      <Card className="glass-premium bg-white/70 border border-gold/15 overflow-hidden rounded-2xl shadow-sm">
        <div className="p-5 border-b border-[#EBE6DD] flex items-center gap-2.5">
          <History className="h-5 w-5 text-gold-dark" />
          <h2 className="font-display text-lg font-bold text-coffee-950">KAMPANYA GEÇMİŞİ</h2>
        </div>

        {loadingHistory ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-gold animate-spin" />
            <p className="text-coffee-500 text-sm font-semibold">Geçmiş kampanyalar yükleniyor...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-20 text-center text-coffee-500 text-sm font-semibold">
            Henüz gönderilmiş kampanya bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#EBE6DD] hover:bg-transparent">
                  <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider">Tarih</TableHead>
                  <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider">Kampanya Mesajı</TableHead>
                  <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider">Segment</TableHead>
                  <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider">Kanal</TableHead>
                  <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider text-center">Durum</TableHead>
                  <TableHead className="text-coffee-700 text-xs font-bold uppercase tracking-wider text-right">Erişim</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((camp) => (
                  <TableRow key={camp.id} className="border-[#EBE6DD] hover:bg-[#F4EFE6]/35 transition-colors">
                    <TableCell className="text-xs text-coffee-600 py-4 font-mono font-medium">
                      {camp.createdAt instanceof Date
                        ? camp.createdAt.toLocaleString("tr-TR")
                        : (camp.createdAt as { toDate?: () => Date })?.toDate
                        ? (camp.createdAt as { toDate: () => Date }).toDate().toLocaleString("tr-TR")
                        : "Bilinmiyor"}
                    </TableCell>
                    <TableCell className="py-4 max-w-sm">
                      <p className="text-sm font-semibold text-coffee-950 line-clamp-2">{camp.message}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-xs text-coffee-700 font-semibold">
                        {segmentsMap[camp.segment] || camp.segment}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-xs text-coffee-700 font-semibold">
                        {channelsMap[camp.channel] || camp.channel}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge
                        variant="secondary"
                        className={
                          camp.status === "sent"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold"
                            : camp.status === "draft"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20 font-bold"
                            : "bg-red-500/10 text-red-600 border border-red-500/20 font-bold"
                        }
                      >
                        {camp.status === "sent" ? "Gönderildi" : camp.status === "draft" ? "Taslak" : "Başarısız"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-4 font-mono text-sm font-bold text-coffee-800">
                      {camp.sentCount}/{camp.targetCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* CLAUDE AI WIZARD DIALOG */}
      <Dialog open={isAiOpen} onOpenChange={setIsAiOpen}>
        <DialogContent className="glass-premium bg-white border border-gold/25 text-coffee-950 sm:max-w-md rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-gradient-gold-light font-display font-bold text-xl uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold-dark animate-pulse" />
              Claude AI Sihirbazı
            </DialogTitle>
            <DialogDescription className="text-coffee-600 font-semibold text-xs mt-1">
              Yapay zeka desteğiyle hedef kitlenizi ikna edecek etkili kampanya metinleri oluşturun.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-coffee-700 text-sm font-semibold">Kampanya Amacı</Label>
              <Select value={aiPurpose} onValueChange={setAiPurpose}>
                <SelectTrigger className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl">
                  <SelectValue placeholder="Amaç seçin" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gold/20 text-coffee-950">
                  <SelectItem value="discount">İndirim & Lütuf Duyurusu</SelectItem>
                  <SelectItem value="celebration">Kutsal Nektar Daveti</SelectItem>
                  <SelectItem value="reminder">Geri Çağırma (Özleme Mesajı)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-coffee-700 text-sm font-semibold">Mesaj Tonu</Label>
              <Select value={aiTone} onValueChange={setAiTone}>
                <SelectTrigger className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl">
                  <SelectValue placeholder="Ton seçin" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gold/20 text-coffee-950">
                  <SelectItem value="friendly">Samimi & Güler Yüzlü</SelectItem>
                  <SelectItem value="exclusive">Özel & Premium</SelectItem>
                  <SelectItem value="urgent">Acele Et (Sınırlı Süre)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsAiOpen(false)}
              className="text-coffee-600 hover:text-coffee-900 hover:bg-[#F4EFE6]/40 rounded-xl"
            >
              Kapat
            </Button>
            <Button
              onClick={handleGenerateAiText}
              disabled={generatingAi}
              className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-950 font-bold hover:shadow-md rounded-xl px-5 gap-1.5"
            >
              {generatingAi ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Metin Üretiliyor...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Metin Üret
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
