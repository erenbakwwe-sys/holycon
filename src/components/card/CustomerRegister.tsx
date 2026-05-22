"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createCustomer, getCustomerByReferralCode, addReferralBonus } from "@/lib/firestore";
import type { Customer, Settings } from "@/types";

interface CustomerRegisterProps {
  phone: string;
  referralCode: string | null;
  settings: Settings;
  onRegistered: (customer: Customer) => void;
}

export default function CustomerRegister({
  phone,
  referralCode,
  settings,
  onRegistered,
}: CustomerRegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "İsim gerekli",
        description: "Lütfen adınızı girin.",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "E-posta gerekli",
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const birthdayDate = birthday ? new Date(birthday) : null;

      const customer = await createCustomer(
        name.trim(),
        phone,
        email.trim(),
        birthdayDate,
        referralCode
      );

      // Handle referral bonus
      if (referralCode) {
        try {
          const referrer = await getCustomerByReferralCode(referralCode);
          if (referrer && referrer.id) {
            await addReferralBonus(referrer.id, settings.referralBonus);
            toast({
              title: "Referans bonusu! 🎉",
              description: `Arkadaşınız sayesinde kayıt oldunuz!`,
            });
          }
        } catch {
          console.error("Referral bonus failed");
        }
      }

      toast({
        title: "Hoş geldiniz! 🏛️✨",
        description: `${settings.businessName} ailesine katıldınız.`,
      });

      onRegistered(customer);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Kayıt hatası",
        description: "Bir sorun oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold/25 to-gold-light/10 border border-gold/45 mb-4 shadow-[0_8px_32px_rgba(212,175,55,0.22)]">
          <svg className="w-10 h-10 text-gold animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 22h18" />
            <path d="M6 18h12" />
            <path d="m12 2-9 5h18Z" />
            <path d="M7 10v8M12 10v8M17 10v8" />
          </svg>
        </div>
        <h2 className="font-display text-3xl text-gradient-gold-light tracking-wide mb-2 uppercase">
          Hoş Geldiniz
        </h2>
        <p className="text-coffee-500 text-xs font-semibold uppercase tracking-widest">
          {settings.businessName} Ayrıcalık Kartınızı Oluşturalım
        </p>
        {referralCode && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/25 animate-pulse">
            <span className="text-xs">🎁</span>
            <span className="text-xs text-gold font-medium">Referans daveti algılandı!</span>
          </div>
        )}
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-premium rounded-3xl p-6 space-y-4 border border-gold/20 shadow-2xl bg-white/70">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-coffee-700 text-sm font-semibold tracking-wide">
              Adınız *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Adınızı girin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white/50 border-gold/25 text-coffee-900 placeholder:text-coffee-400 focus:border-gold focus:ring-gold/20 h-12 rounded-xl transition-all duration-300 shadow-sm"
            />
          </div>

          {/* Phone Field (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-coffee-700 text-sm font-semibold tracking-wide">
              Telefon Numarası
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              readOnly
              className="bg-coffee-100/30 border-gold/15 text-coffee-400 h-12 rounded-xl cursor-not-allowed shadow-none"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-coffee-700 text-sm font-semibold tracking-wide">
              E-posta *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/50 border-gold/25 text-coffee-900 placeholder:text-coffee-400 focus:border-gold focus:ring-gold/20 h-12 rounded-xl transition-all duration-300 shadow-sm"
            />
            <p className="text-[10px] text-coffee-400 mt-1 leading-relaxed font-medium">
              🔒 E-posta adresiniz sadece hediye ödül bildirimleriniz için kullanılır.
            </p>
          </div>

          {/* Birthday Field */}
          <div className="space-y-2">
            <Label htmlFor="birthday" className="text-coffee-700 text-sm font-semibold tracking-wide">
              Doğum Tarihi <span className="text-coffee-400 font-normal">(opsiyonel)</span>
            </Label>
            <Input
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="bg-white/50 border-gold/25 text-coffee-900 placeholder:text-coffee-400 focus:border-gold focus:ring-gold/20 h-12 rounded-xl transition-all duration-300 shadow-sm"
            />
            <p className="text-[10px] text-coffee-400 mt-1 leading-relaxed font-medium">
              🎂 Doğum gününüzde size özel tanrısal lütufları tanımlamak için kullanılır.
            </p>
          </div>
        </div>

        {/* Privacy & Trust Badge */}
        <div className="glass-premium-gold rounded-3xl p-5 space-y-3 border border-gold/30 bg-[#FAF6EC]/85 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2.5 text-gold font-bold tracking-wider uppercase text-xs">
            <span className="text-base">🛡️</span>
            <span>Kutsal Güven Anlaşması</span>
          </div>
          <p className="text-[11px] leading-relaxed text-coffee-600 font-semibold">
            {settings.businessName} olarak gizliliğinize en üst düzeyde önem veriyoruz:
          </p>
          <ul className="space-y-2 text-[11px] text-coffee-500 list-none pl-0 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span><strong>Sıfır Spam:</strong> Reklam içerikli toplu SMS veya pazarlama e-postası göndermeyiz.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span><strong>Maksimum Güvenlik:</strong> Verileriniz şifreli veritabanlarında saklanır, 3. şahıslarla asla paylaşılmaz.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span><strong>Adil Kullanım:</strong> Verileriniz sadece kazandığınız liyakat pullarını takip etmek içindir.</span>
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !name.trim() || !email.trim()}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-white font-semibold text-base shadow-lg shadow-gold/25 hover:shadow-gold/45 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:shadow-none btn-shimmer"
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Kayıt yapılıyor...
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              🏛️ Kartımı Oluştur
            </span>
          )}
        </Button>
      </form>

      {/* Footer note */}
      <p className="text-center text-coffee-400 text-xs mt-6 leading-relaxed font-semibold">
        Kaydolarak {settings.businessName} sadakat programı
        <br />
        koşullarını kabul etmiş olursunuz.
      </p>
    </div>
  );
}
