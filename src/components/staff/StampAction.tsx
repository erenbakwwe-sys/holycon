"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Search, Award, User, X, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/utils";
import {
  getCustomerByPhone,
  updateCustomerStamps,
  incrementStaffStamps,
  addStampLog,
  getSettings,
} from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Staff, Customer, Settings } from "@/types";

interface StampActionProps {
  staff: Staff;
}

export default function StampAction({ staff }: StampActionProps) {
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isStamping, setIsStamping] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [stampSuccess, setStampSuccess] = useState(false);
  const [rewardEarned, setRewardEarned] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load settings on mount
  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  // Auto-focus phone input
  useEffect(() => {
    if (!customer && phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, [customer]);

  const handleSearch = useCallback(async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setSearchError("Geçerli bir telefon numarası girin");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const found = await getCustomerByPhone(cleaned);
      if (found) {
        setCustomer(found);
      } else {
        setSearchError("Müşteri bulunamadı");
      }
    } catch {
      setSearchError("Arama hatası. Tekrar deneyin.");
    } finally {
      setIsSearching(false);
    }
  }, [phone]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleStamp = useCallback(async () => {
    if (!customer || !customer.id || !staff.id || !settings) return;

    setIsStamping(true);

    try {
      // 1. Update customer stamps (+1)
      await updateCustomerStamps(customer.id, 1);

      // 2. Increment staff stamp count
      await incrementStaffStamps(staff.id);

      // 3. Log the stamp action
      await addStampLog(
        customer.id,
        staff.id,
        "stamp",
        customer.name,
        staff.name
      );

      // 4. Check if customer reached reward threshold
      const newStampCount = customer.stamps + 1;
      const earned = newStampCount >= settings.stampsRequired;

      if (earned) {
        setRewardEarned(true);
      }

      // 5. Show success animation
      setStampSuccess(true);

      toast({
        title: earned ? "🏛️ Kutsal Ödül Hak Edildi!" : "⚡ Damga Onaylandı!",
        description: earned
          ? `${customer.name} liyakat ödülünü kazandı! (${newStampCount}/${settings.stampsRequired})`
          : `${customer.name} - ${newStampCount}/${settings.stampsRequired} damga`,
      });

      // 6. Reset after animation
      setTimeout(() => {
        setStampSuccess(false);
        setRewardEarned(false);
        setCustomer(null);
        setPhone("");
      }, 2500);
    } catch {
      toast({
        title: "Hata",
        description: "Damga verilemedi. Tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsStamping(false);
    }
  }, [customer, staff, settings, toast]);

  const handleClear = useCallback(() => {
    setCustomer(null);
    setPhone("");
    setSearchError("");
    setStampSuccess(false);
    setRewardEarned(false);
  }, []);

  const stampsRequired = settings?.stampsRequired ?? 10;
  const stampsRemaining = customer
    ? Math.max(0, stampsRequired - customer.stamps - 1)
    : 0;

  return (
    <div className="flex flex-col h-full relative">
      {/* Success Overlay */}
      {stampSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md animate-fade-in">
          <div className="text-center p-6 glass-premium-gold rounded-[32px] max-w-xs mx-auto border border-gold/45 shadow-2xl">
            <div
              className={cn(
                "w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md transition-all",
                rewardEarned
                  ? "bg-gradient-to-br from-gold-light via-gold to-gold-dark text-white"
                  : "bg-green-100 border-2 border-green-500 text-green-600"
              )}
            >
              {rewardEarned ? (
                <Award className="w-14 h-14 animate-stamp-bounce text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.2)]" />
              ) : (
                <Check className="w-14 h-14 animate-stamp-bounce text-green-600" />
              )}
            </div>
            <h2
              className={cn(
                "font-display text-2.5xl font-bold tracking-wider mb-2",
                rewardEarned ? "text-gradient-gold-light" : "text-green-600"
              )}
            >
              {rewardEarned ? "ÖDÜL HAK EDİLDİ! 🏛️" : "DAMGA ONAYLANDI!"}
            </h2>
            <p className="text-coffee-800 font-semibold text-lg">{customer?.name}</p>
            {rewardEarned && (
              <div className="mt-3 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30">
                <p className="text-gold-dark text-xs font-bold uppercase tracking-wider">
                  🏆 {settings?.rewardDescription || "Bedava Kahve"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phone Search Area */}
      {!customer ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mb-4 shadow-sm">
                <Search className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-display text-2xl font-bold text-gradient-gold-light tracking-wide mb-1">
                Müşteri Bul
              </h2>
              <p className="text-coffee-600 text-sm font-medium">
                Telefon numarası girerek sorgulama yapın
              </p>
            </div>

            {/* Phone Input */}
            <div className="relative mb-4">
              <input
                ref={phoneInputRef}
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/[^\d\s]/g, ""));
                  setSearchError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="05XX XXX XX XX"
                className={cn(
                  "w-full h-16 text-center text-2xl font-mono tracking-wider rounded-2xl",
                  "bg-white/80 border-2 text-coffee-900 placeholder:text-coffee-300 shadow-sm",
                  "focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all duration-300",
                  searchError
                    ? "border-red-400 focus:border-red-500"
                    : "border-gold/30 focus:border-gold"
                )}
                autoComplete="off"
              />
            </div>

            {/* Error */}
            {searchError && (
              <p className="text-red-500 text-sm font-semibold text-center mb-4 animate-fade-in bg-red-50 border border-red-200 px-4 py-1.5 rounded-full">
                ⚠️ {searchError}
              </p>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={isSearching || phone.replace(/\D/g, "").length < 10}
              className={cn(
                "w-full h-14 rounded-xl font-bold text-lg transition-all duration-300",
                "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-950",
                "hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98]",
                "disabled:opacity-40 disabled:active:scale-100",
                "flex items-center justify-center gap-3 shadow-md",
                "btn-shimmer"
              )}
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-coffee-900/30 border-t-coffee-900 rounded-full animate-spin" />
                  Aranıyor...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  ARA
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Customer Found - Card Preview + Stamp Button */
        <div className="flex-1 flex flex-col px-4 py-6 animate-slide-up max-w-md mx-auto w-full">
          {/* Customer Info Card */}
          <div className="glass-premium rounded-[24px] p-6 mb-6 border border-gold/20 shadow-xl bg-white/80">
            {/* Header with close */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-[#F5F2E9] border border-gold/45 flex items-center justify-center shadow-md">
                  <User className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-gradient-gold-light">
                    {customer.name}
                  </h3>
                  <p className="text-coffee-600 text-xs font-semibold">
                    📱 {formatPhone(customer.phone)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="p-1.5 rounded-full hover:bg-red-50 text-coffee-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stamp Progress */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-coffee-600">Liyakat Mührü İlerlemesi</span>
                <span className="text-gold-dark">
                  {customer.stamps} / {stampsRequired}
                </span>
              </div>

              {/* Stamp Grid */}
              <div className="flex flex-wrap gap-2.5 justify-center py-4 bg-[#F4EFE6]/40 rounded-2xl border border-[#DECBAA]/30">
                {Array.from({ length: stampsRequired }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                      i < customer.stamps
                        ? "bg-gradient-to-br from-gold-light via-gold to-gold-dark text-white shadow-md shadow-gold/25"
                        : i === customer.stamps
                          ? "bg-gold/10 border-2 border-gold/40 border-dashed animate-pulse text-gold"
                          : "bg-white/60 border border-gold/10 text-coffee-300"
                    )}
                  >
                    {i < customer.stamps ? (
                      <svg className="w-5 h-5 text-white drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.1)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 10a8 8 0 0 0 8 8 8 8 0 0 0 8-8" />
                        <path d="M12 2v16" />
                        <path d="M8 5C6 7 6 9 8 11" />
                        <path d="M16 5c2 2 2 4 0 6" />
                      </svg>
                    ) : i === customer.stamps ? (
                      <span className="text-gold-dark text-xs font-bold">+1</span>
                    ) : (
                      <span className="text-coffee-500 text-xs font-mono font-bold">{(i + 1).toString().padStart(2, "0")}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#FAF8F2] border border-gold/10 rounded-xl py-2.5 px-1 shadow-sm">
                <p className="text-coffee-500 text-[9px] uppercase tracking-wider font-bold">Toplam Ziyaret</p>
                <p className="text-gradient-gold-light font-display font-bold text-lg mt-0.5">
                  {customer.totalVisits}
                </p>
              </div>
              <div className="bg-[#FAF8F2] border border-gold/10 rounded-xl py-2.5 px-1 shadow-sm">
                <p className="text-coffee-500 text-[9px] uppercase tracking-wider font-bold">Ödüller</p>
                <p className="text-gradient-gold-light font-display font-bold text-lg mt-0.5">
                  {customer.rewardsClaimed}
                </p>
              </div>
              <div className="bg-[#FAF8F2] border border-gold/10 rounded-xl py-2.5 px-1 shadow-sm">
                <p className="text-coffee-500 text-[9px] uppercase tracking-wider font-bold">Kalan</p>
                <p className="text-gold-dark font-display font-bold text-lg mt-0.5">
                  {stampsRemaining}
                </p>
              </div>
            </div>
          </div>

          {/* Reward Warning */}
          {customer.stamps + 1 >= stampsRequired && (
            <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4 mb-6 text-center animate-fade-in shadow-sm">
              <Sparkles className="w-6 h-6 text-gold mx-auto mb-1 animate-pulse" />
              <p className="text-gold-dark font-bold text-sm">
                Bu damga ile müşteri ödülü hak edecek! 🎉
              </p>
              <p className="text-coffee-600 text-xs font-semibold mt-1">
                🏛️ Ödül: {settings?.rewardDescription || "Liyakat Ödülü"}
              </p>
            </div>
          )}

          {/* STAMP BUTTON */}
          <div className="mt-auto">
            <button
              onClick={handleStamp}
              disabled={isStamping || stampSuccess}
              className={cn(
                "w-full h-18 rounded-2xl font-bold text-xl tracking-wider transition-all duration-300",
                "bg-gradient-to-r from-gold-dark via-gold to-gold-light",
                "text-coffee-950 hover:shadow-xl hover:shadow-gold/25",
                "active:scale-[0.97] active:shadow-md",
                "disabled:opacity-50 disabled:active:scale-100",
                "flex items-center justify-center gap-3 shadow-lg",
                "select-none btn-shimmer"
              )}
            >
              {isStamping ? (
                <>
                  <div className="w-6 h-6 border-3 border-coffee-900/30 border-t-coffee-900 rounded-full animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 text-coffee-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10a8 8 0 0 0 8 8 8 8 0 0 0 8-8" />
                    <path d="M12 2v16" />
                    <path d="M8 5C6 7 6 9 8 11" />
                    <path d="M16 5c2 2 2 4 0 6" />
                  </svg>
                  MÜHÜRLE (DAMGA VER)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
