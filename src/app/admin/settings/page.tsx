"use client";

import { useEffect, useState, useRef } from "react";
import {
  Sliders,
  Share2,
  QrCode,
  Download,
  Save,
  Globe,
  Lock,
  Mail,
  Crown,
  Loader2,
} from "lucide-react";
import { getSettings, updateSettings } from "@/lib/firestore";
import type { Settings } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  // Load Settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast({
          title: "Hata",
          description: "Ayarlar yüklenemedi.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Save settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      await updateSettings(settings);
      toast({
        title: "Ayarlar kaydedildi! 🎉",
        description: "Değişiklikler başarıyla uygulandı.",
      });
    } catch (error) {
      console.error("Save settings error:", error);
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Download QR Code as PNG image
  const downloadPng = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "holycon_loyalty_qr.png";
    link.href = url;
    link.click();
    toast({
      title: "QR İndirildi",
      description: "Görsel başarıyla bilgisayarınıza kaydedildi.",
    });
  };

  // Download QR Code as Print A4 PDF
  const downloadPdf = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const qrDataUrl = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Outer gold/bronze frame
    pdf.setDrawColor(212, 175, 55); // Gold color #D4AF37
    pdf.setLineWidth(2);
    pdf.rect(10, 10, 190, 277);

    // Decorative inner marble-cream frame
    pdf.setDrawColor(235, 230, 221); // Marble color #EBE6DD
    pdf.setLineWidth(0.5);
    pdf.rect(13, 13, 184, 271);

    // Title / Brand (Greek god themed)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(28);
    pdf.setTextColor(42, 36, 33); // Dark bronze #2A2421
    pdf.text("HOLYCON", 105, 45, { align: "center" });

    // Subtitle
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(16);
    pdf.setTextColor(153, 101, 21); // Gold-dark #996515
    pdf.text("KUTSAL SADAKAT ANLASMASI", 105, 55, { align: "center" });

    // Dividers
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(1);
    pdf.line(40, 65, 170, 65);

    // QR Image
    pdf.addImage(qrDataUrl, "PNG", 55, 80, 100, 100);

    // Prompt Text
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(42, 36, 33);
    pdf.text("Kameraniz ile QR Kodu Taratin!", 105, 205, { align: "center" });

    // Sub-prompt
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80);
    pdf.text(
      "Telefonunuzun kamerasini buraya dogrultarak kutsal programa katilin.",
      105,
      215,
      { align: "center" }
    );
    pdf.text(
      `Her ziyaretinizde kutsal muhur kazanin, ${settings?.stampsRequired || 10} muhurde bir tanrisal odul kazanin!`,
      105,
      222,
      { align: "center" }
    );

    // Footer decoration
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text("Powered by Holycon", 105, 265, { align: "center" });

    pdf.save("holycon_loyalty_print_a4.pdf");
    toast({
      title: "PDF İndirildi",
      description: "Yazdırılabilir A4 PDF belgesi oluşturuldu.",
    });
  };

  // Get current host URL to encode in QR code
  const customerUrl = typeof window !== "undefined"
    ? `${window.location.origin}/card`
    : "https://holycon-ad387.firebaseapp.com/card";

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
        <p className="text-coffee-500 text-sm font-semibold">Ayarlar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gradient-gold-light uppercase tracking-wide">
          Sistem Ayarları
        </h1>
        <p className="text-sm text-coffee-600 font-semibold mt-1">
          🏛️ Sadakat kurallarını, entegrasyon API anahtarlarını ve QR kod çıktılarını yönetin
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-[#F4EFE6]/50 border border-[#EBE6DD] p-1 rounded-xl">
          <TabsTrigger
            value="general"
            className="rounded-lg text-xs font-bold px-4 py-2 text-coffee-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-dark data-[state=active]:to-gold-light data-[state=active]:text-coffee-950 data-[state=active]:shadow-sm transition-all"
          >
            <Sliders className="h-3.5 w-3.5 mr-1.5" />
            Genel Ayarlar
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="rounded-lg text-xs font-bold px-4 py-2 text-coffee-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-dark data-[state=active]:to-gold-light data-[state=active]:text-coffee-950 data-[state=active]:shadow-sm transition-all"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Entegrasyonlar
          </TabsTrigger>
          <TabsTrigger
            value="qrcode"
            className="rounded-lg text-xs font-bold px-4 py-2 text-coffee-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-dark data-[state=active]:to-gold-light data-[state=active]:text-coffee-950 data-[state=active]:shadow-sm transition-all"
          >
            <QrCode className="h-3.5 w-3.5 mr-1.5" />
            QR Kod İndir
          </TabsTrigger>
        </TabsList>

        {/* GENERAL SETTINGS */}
        <TabsContent value="general" className="animate-fade-in">
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
            <div className="glass-premium bg-white/70 border border-gold/15 rounded-2xl p-6 space-y-4 shadow-sm">
              <h2 className="font-display text-lg font-bold text-coffee-950 flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-gold-dark" />
                SADAKAT PROGRAMI PARAMETRELERİ
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-coffee-700 text-sm font-semibold">
                    İşletme Adı
                  </Label>
                  <Input
                    id="businessName"
                    value={settings?.businessName || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev!, businessName: e.target.value }))
                    }
                    required
                    className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="businessPhone" className="text-coffee-700 text-sm font-semibold">
                    İşletme İletişim Telefonu
                  </Label>
                  <Input
                    id="businessPhone"
                    placeholder="0212 555 55 55"
                    value={settings?.businessPhone || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev!, businessPhone: e.target.value }))
                    }
                    className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="stampsRequired" className="text-coffee-700 text-sm font-semibold">
                    Gerekli Mühür Sayısı (Lütuf İçin)
                  </Label>
                  <Input
                    id="stampsRequired"
                    type="number"
                    min={1}
                    value={settings?.stampsRequired || 10}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev!,
                        stampsRequired: Math.max(1, parseInt(e.target.value) || 0),
                      }))
                    }
                    required
                    className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="referralBonus" className="text-coffee-700 text-sm font-semibold">
                    Davet Bonusu (Mühür)
                  </Label>
                  <Input
                    id="referralBonus"
                    type="number"
                    min={0}
                    value={settings?.referralBonus || 2}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev!,
                        referralBonus: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    required
                    className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rewardDescription" className="text-coffee-700 text-sm font-semibold">
                  Ödül (Lütuf) Açıklaması
                  </Label>
                <Input
                  id="rewardDescription"
                  placeholder="Bedava Ambrosia & Nektar 🏛️"
                  value={settings?.rewardDescription || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev!, rewardDescription: e.target.value }))
                  }
                  required
                  className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="googleMapsUrl" className="text-coffee-700 text-sm font-semibold">
                  Google Haritalar Değerlendirme URL
                </Label>
                <Input
                  id="googleMapsUrl"
                  placeholder="https://maps.app.goo.gl/..."
                  value={settings?.googleMapsUrl || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev!, googleMapsUrl: e.target.value }))
                  }
                  className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl font-medium"
                />
                <p className="text-[10px] text-coffee-500 font-semibold">
                  Müşteri ödül talep ettiğinde bu URL&apos;e yönlendirilip Google incelemesi istenir.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-950 font-bold hover:shadow-md transition-all rounded-xl h-12 px-6 gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </Button>
          </form>
        </TabsContent>

        {/* INTEGRATION SETTINGS */}
        <TabsContent value="integrations" className="animate-fade-in">
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
            {/* WhatsApp Integration */}
            <div className="glass-premium bg-white/70 border border-gold/15 rounded-2xl p-6 space-y-4 shadow-sm">
              <h2 className="font-display text-lg font-bold text-coffee-950 flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-gold-dark" />
                WHATSAPP BUSINESS API BAĞLANTISI
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="whatsappSender" className="text-coffee-700 text-sm font-semibold">
                    Gönderici Numarası (Sender ID)
                  </Label>
                  <Input
                    id="whatsappSender"
                    placeholder="90850..."
                    value={settings?.whatsappConfig?.senderId || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev!,
                        whatsappConfig: {
                          apiKey: prev?.whatsappConfig?.apiKey || "",
                          provider: prev?.whatsappConfig?.provider || "meta",
                          senderId: e.target.value,
                        },
                      }))
                    }
                    className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="whatsappProvider" className="text-coffee-700 text-sm font-semibold">
                    Sağlayıcı (Provider)
                  </Label>
                  <Input
                    id="whatsappProvider"
                    value="meta"
                    readOnly
                    className="bg-[#FAF8F5]/60 border-[#EBE6DD] text-coffee-400 rounded-xl h-11 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whatsappApiKey" className="text-coffee-700 text-sm font-semibold">
                  Meta API Key / Access Token
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
                  <Input
                    id="whatsappApiKey"
                    type="password"
                    placeholder="••••••••••••••••••••"
                    value={settings?.whatsappConfig?.apiKey || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev!,
                        whatsappConfig: {
                          senderId: prev?.whatsappConfig?.senderId || "",
                          provider: prev?.whatsappConfig?.provider || "meta",
                          apiKey: e.target.value,
                        },
                      }))
                    }
                    className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold pl-10 rounded-xl h-11 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Email Integration */}
            <div className="glass-premium bg-white/70 border border-gold/15 rounded-2xl p-6 space-y-4 shadow-sm">
              <h2 className="font-display text-lg font-bold text-coffee-950 flex items-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-gold-dark" />
                EMAILJS KAMPANYA E-POSTA BAĞLANTISI
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="emailServiceId" className="text-coffee-700 text-sm font-semibold">
                    EmailJS Service ID
                  </Label>
                  <Input
                    id="emailServiceId"
                    placeholder="service_..."
                    value={settings?.emailConfig?.serviceId || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev!,
                        emailConfig: {
                          templateId: prev?.emailConfig?.templateId || "",
                          publicKey: prev?.emailConfig?.publicKey || "",
                          serviceId: e.target.value,
                        },
                      }))
                    }
                    className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="emailTemplateId" className="text-coffee-700 text-sm font-semibold">
                    EmailJS Template ID
                  </Label>
                  <Input
                    id="emailTemplateId"
                    placeholder="template_..."
                    value={settings?.emailConfig?.templateId || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev!,
                        emailConfig: {
                          serviceId: prev?.emailConfig?.serviceId || "",
                          publicKey: prev?.emailConfig?.publicKey || "",
                          templateId: e.target.value,
                        },
                      }))
                    }
                    className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emailPublicKey" className="text-coffee-700 text-sm font-semibold">
                  EmailJS Public Key
                </Label>
                <Input
                  id="emailPublicKey"
                  placeholder="user_..."
                  value={settings?.emailConfig?.publicKey || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev!,
                      emailConfig: {
                        serviceId: prev?.emailConfig?.serviceId || "",
                        templateId: prev?.emailConfig?.templateId || "",
                        publicKey: e.target.value,
                      },
                    }))
                  }
                  className="bg-white border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold h-11 rounded-xl font-medium"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-950 font-bold hover:shadow-md transition-all rounded-xl h-12 px-6 gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Kaydediliyor..." : "Bağlantıları Kaydet"}
            </Button>
          </form>
        </TabsContent>

        {/* QR CODE DOWNLOAD */}
        <TabsContent value="qrcode" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {/* Visualizer card */}
            <div className="glass-premium bg-white/70 border border-gold/15 rounded-3xl p-8 flex flex-col items-center justify-center bg-gradient-to-b from-[#F4EFE6]/10 to-transparent min-h-[350px] shadow-sm">
              <div
                ref={qrRef}
                className="bg-white p-6 rounded-2xl border-4 border-gold shadow-md mb-6 flex items-center justify-center"
              >
                <QRCodeCanvas
                  value={customerUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="font-display font-bold text-coffee-950 text-lg text-center">
                Holycon Sadakat QR Kodu
              </p>
              <p className="text-gold-dark text-xs text-center mt-1 font-mono font-bold">
                {customerUrl}
              </p>
            </div>

            {/* Downloader controller panel */}
            <div className="space-y-6 self-center">
              <div>
                <h3 className="font-display text-lg font-bold text-coffee-950 uppercase tracking-wide">
                  MABED İÇİ POSTER & QR ÇIKTISI
                </h3>
                <p className="text-coffee-600 text-xs mt-1 font-semibold leading-relaxed">
                  Kutsal elçilerinizin tapınakta masalarda veya sunakta taratarak sadakat kartlarına kolayca erişebilmeleri için bu QR kodu indirin ve yazdırın.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={downloadPng}
                  className="bg-white border border-[#DECBAA]/45 hover:bg-[#F4EFE6]/35 text-coffee-950 rounded-xl h-13 px-5 justify-between font-bold shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    🖼️ Yalnızca QR Kodu (PNG Görseli)
                  </span>
                  <Download className="h-4 w-4 text-coffee-600" />
                </Button>

                <Button
                  onClick={downloadPdf}
                  className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-950 hover:shadow-md transition-all rounded-xl h-13 px-5 justify-between font-bold"
                >
                  <span className="flex items-center gap-2">
                    📄 A4 Poster Hazır Tasarım (Yazdırılabilir PDF)
                  </span>
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-[#F4EFE6]/35 border border-[#EBE6DD] p-4 rounded-xl space-y-1 font-semibold">
                <p className="text-coffee-800 text-xs font-bold">Tavsiye:</p>
                <p className="text-coffee-500 text-[11px] leading-relaxed">
                  Yazdırılabilir A4 PDF formatı, Holycon sadakat yönergeleri ile birlikte şık bir altın çerçeveyle gelir. Giriş alanına koymak veya sunakların yanına konumlandırmak için mükemmeldir.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
