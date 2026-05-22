"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { createRewardCode } from "@/lib/firestore";
import type { Customer } from "@/types";

interface RewardClaimProps {
  customer: Customer;
  onCodeGenerated: (code: string) => void;
  onClose: () => void;
}

// Confetti piece colors
const CONFETTI_COLORS = [
  "#D4AF37", "#F4D068", "#AA7C11", "#FFD700",
  "#F5F2E9", "#ECE6D5", "#AA8C60", "#DECBAA",
];

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const size = Math.random() * 8 + 4;
  const shape = index % 3; // 0 = square, 1 = circle, 2 = rectangle

  return (
    <div
      className="absolute top-0 animate-confetti-fall animate-duration-3000"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${2.5 + Math.random() * 2}s`,
      }}
    >
      <div
        style={{
          width: shape === 2 ? size * 2 : size,
          height: size,
          backgroundColor: color,
          borderRadius: shape === 1 ? "50%" : "2px",
          opacity: 0.9,
        }}
      />
    </div>
  );
}

export default function RewardClaim({
  customer,
  onCodeGenerated,
  onClose,
}: RewardClaimProps) {
  const [rewardCode, setRewardCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [expired, setExpired] = useState(false);
  const { toast } = useToast();

  // Generate reward code on mount
  const generateCode = useCallback(async () => {
    try {
      setLoading(true);
      const result = await createRewardCode(
        customer.id!,
        customer.name
      );
      setRewardCode(result.code);
      onCodeGenerated(result.code);
    } catch (error) {
      console.error("Failed to generate reward code:", error);
      toast({
        title: "Hata",
        description: "Ödül kodu oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [customer.id, customer.name, onCodeGenerated, toast]);

  useEffect(() => {
    generateCode();
  }, [generateCode]);

  // Countdown timer
  useEffect(() => {
    if (!rewardCode || expired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rewardCode, expired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formatTime = (m: number, s: number) =>
    `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#12100F]/70 backdrop-blur-md flex items-center justify-center p-4">
      {/* Confetti */}
      {!loading && rewardCode && !expired && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-10 h-10 rounded-full border border-gold/25 bg-white flex items-center justify-center text-coffee-500 hover:text-coffee-800 transition-colors shadow-md font-bold"
        >
          ✕
        </button>

        <div className="glass-premium rounded-[32px] overflow-hidden bg-white/95 border border-gold/25 shadow-2xl">
          {loading ? (
            /* Loading State */
            <div className="p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold/25 to-gold-light/10 border border-gold/45 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-gold" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="text-coffee-500 text-sm font-semibold">Kutsal kodunuz oluşturuluyor...</p>
            </div>
          ) : expired ? (
            /* Expired State */
            <div className="p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <span className="text-4xl">⏰</span>
              </div>
              <h3 className="font-display text-xl text-coffee-950 font-bold mb-2">
                Süre Doldu
              </h3>
              <p className="text-coffee-600 text-sm mb-6 font-semibold">
                Kodun geçerlilik süresi doldu. Yeni kod almak için butona basın.
              </p>
              <button
                onClick={() => {
                  setExpired(false);
                  setTimeLeft(10 * 60);
                  generateCode();
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-white font-bold text-sm shadow-md shadow-gold/20 btn-shimmer"
              >
                Yeni Kod Al
              </button>
            </div>
          ) : (
            /* Success State */
            <div className="text-center">
              {/* Celebration Header */}
              <div className="bg-gradient-to-b from-gold/10 to-transparent pt-8 pb-4 px-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold/25 to-gold-light/10 border-2 border-gold/45 flex items-center justify-center animate-stamp-bounce shadow-md">
                  <span className="text-5xl">🏆</span>
                </div>
                <h3 className="font-display text-2xl text-coffee-950 font-bold uppercase tracking-wider mb-1">
                  Tebrikler!
                </h3>
                <p className="text-coffee-600 text-sm font-semibold">
                  {customer.name}, lütuf hakkınızı kazandınız!
                </p>
              </div>

              {/* Reward Code Display */}
              <div className="px-6 py-6">
                <p className="text-coffee-500 text-[9px] uppercase tracking-widest font-bold mb-3">
                  Ödül Doğrulama Kodunuz
                </p>
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-gold-light/20 via-gold/30 to-gold-dark/20 rounded-2xl blur-sm animate-pulse" />
                  <div className="relative bg-[#FAF6EC] rounded-2xl border border-gold/40 py-5 px-4">
                    <p className="font-mono text-4xl font-bold tracking-[0.3em] text-gradient-gold pl-[0.3em]">
                      {rewardCode}
                    </p>
                  </div>
                </div>

                {/* Timer */}
                <div className="mt-4 flex items-center justify-center gap-2 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-coffee-600 text-sm">
                    Kalan süre:{" "}
                    <span className={timeLeft < 60 ? "text-red-500 font-bold" : "text-gold font-bold"}>
                      {formatTime(minutes, seconds)}
                    </span>
                  </span>
                </div>

                {/* Progress bar for timer */}
                <div className="mt-3 h-1 bg-gold/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / (10 * 60)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="border-t border-gold/15 px-6 py-5 bg-[#FAF6EC]/30">
                <div className="flex items-start gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/35 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <span className="text-sm">🏛️</span>
                  </div>
                  <div>
                    <p className="text-coffee-900 text-sm font-semibold">
                      Bu kodu yetkiliye gösterin
                    </p>
                    <p className="text-coffee-500 text-xs mt-0.5 font-medium leading-relaxed">
                      Görevli personel bu kodu girerek kutsal ödülünüzü teslim edecektir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
