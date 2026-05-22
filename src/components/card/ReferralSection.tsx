"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Customer, Settings } from "@/types";

interface ReferralSectionProps {
  customer: Customer;
  settings: Settings;
}

export default function ReferralSection({
  customer,
  settings,
}: ReferralSectionProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Generate the referral link
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/card?ref=${customer.referralCode}`
    : `https://holycon-ad387.firebaseapp.com/card?ref=${customer.referralCode}`; // fallback

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Kopyalandı! 📋",
        description: "Referans linki panoya kopyalandı. Arkadaşlarınızla paylaşabilirsiniz!",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
      toast({
        title: "Hata",
        description: "Link kopyalanamadı. Lütfen manuel olarak seçip kopyalayın.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${settings.businessName} Sadakat Kartı`,
          text: `Selam! ${settings.businessName} sadakat programına üye ol, her ziyaretinde liyakat pulu kazan. Bu linkten kayıt olursan ikimiz de ekstra lütuf pulu kazanacağız! 🏛️✨`,
          url: referralLink,
        });
      } catch (err) {
        console.error("Share error:", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="glass-premium rounded-[32px] p-6 space-y-5 border border-gold/20 shadow-2xl bg-white/70">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 shadow-inner animate-pulse">
            <span className="text-2xl">🎁</span>
          </div>
          <div>
            <h3 className="font-display text-lg text-gradient-gold-light font-bold leading-snug tracking-wide uppercase">
              Elçi Ol, Lütuf Kazan!
            </h3>
            <p className="text-coffee-600 text-xs mt-1 leading-relaxed font-medium">
              Her davet ettiğin arkadaşın üye olduğunda anında{" "}
              <span className="text-gold font-bold font-mono">
                +{settings.referralBonus} pul
              </span>{" "}
              kazanırsın!
            </p>
          </div>
        </div>

        {/* Stats and Info Box */}
        <div className="bg-white/50 border border-gold/15 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-coffee-400 text-[8px] uppercase tracking-widest font-bold">
              Referans Kodu
            </p>
            <p className="font-mono text-xl font-bold text-coffee-800 tracking-wider mt-0.5">
              {customer.referralCode}
            </p>
          </div>
          <div className="text-right">
            <p className="text-coffee-400 text-[8px] uppercase tracking-widest font-bold">
              Kazanılan Lütuf
            </p>
            <p className="text-gold font-display text-xl font-bold mt-0.5">
              {customer.referralCount * settings.referralBonus} Pul
            </p>
          </div>
        </div>

        {/* Link Share widget */}
        <div className="space-y-2">
          <label className="text-coffee-700 text-xs font-semibold pl-1 tracking-wide">
            Referans Linkiniz
          </label>
          <div className="flex items-center gap-2 bg-[#FAF6EC]/50 border border-gold/20 rounded-xl p-2 pl-3">
            <span className="text-coffee-600 text-xs truncate flex-1 font-mono">
              {referralLink}
            </span>
            <Button
              size="sm"
              onClick={handleCopy}
              className={cn(
                "h-9 rounded-lg px-4 text-xs font-semibold transition-all duration-300",
                copied
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-[#EADEC9] hover:bg-[#DECBAA] text-coffee-900 border border-gold/20"
              )}
            >
              {copied ? "Kopyalandı" : "Kopyala"}
            </Button>
          </div>
        </div>

        {/* Share Button (Primary action on mobile) */}
        <Button
          onClick={handleShare}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-gold-dark/25 to-gold/25 hover:from-gold-dark/35 hover:to-gold/35 border border-gold/35 text-gold-dark font-bold text-sm transition-all duration-300 btn-shimmer"
        >
          <span className="flex items-center justify-center gap-2">
            🔗 Elçi Linkini Paylaş
          </span>
        </Button>
      </div>
    </div>
  );
}
