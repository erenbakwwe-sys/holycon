"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types";

interface StampCardProps {
  customer: Customer;
  stampsRequired: number;
  rewardDescription: string;
  onClaimReward: () => void;
}

export default function StampCard({
  customer,
  stampsRequired,
  rewardDescription,
  onClaimReward,
}: StampCardProps) {
  const stamps = customer.stamps;
  const canClaim = stamps >= stampsRequired;
  const progress = Math.min((stamps / stampsRequired) * 100, 100);

  // Generate the stamp grid — dynamic grid size based on stampsRequired
  const cols = useMemo(() => {
    if (stampsRequired <= 6) return 3;
    if (stampsRequired <= 8) return 4;
    return 5;
  }, [stampsRequired]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-slide-up">
      {/* Card Header */}
      <div className="text-center">
        <p className="text-coffee-500 text-[10px] uppercase tracking-widest font-semibold mb-1.5">Holycon Sadakat Programı</p>
        <h2 className="font-display text-3xl text-gradient-gold font-bold mb-1.5 tracking-wide">
          {customer.name} 👋
        </h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border border-gold/25 text-coffee-600 text-xs shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
          <span>{customer.totalVisits} toplam ziyaret</span>
        </div>
      </div>

      {/* The Stamp Card */}
      <div className="relative">
        {/* Card glow effect */}
        {canClaim && (
          <div className="absolute -inset-1 bg-gradient-to-r from-gold-light/30 via-gold/40 to-gold-dark/30 rounded-[34px] blur-xl animate-pulse-glow" />
        )}

        <div
          className={cn(
            "relative glass-premium rounded-[32px] overflow-hidden border border-gold/20 shadow-2xl bg-white/70",
            canClaim && "border-gold/40"
          )}
        >
          {/* Card Top Accent */}
          <div className="h-1.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />

          {/* Card Content */}
          <div className="p-6">
            {/* Brand Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-[#F5F2E9] border border-gold/45 flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 22h18" />
                    <path d="M6 18h12" />
                    <path d="m12 2-9 5h18Z" />
                    <path d="M7 10v8M12 10v8M17 10v8" />
                  </svg>
                </div>
                <div>
                  <p className="text-coffee-900 font-display text-sm font-semibold tracking-widest uppercase">
                    Holycon
                  </p>
                  <p className="text-coffee-400 text-[8px] uppercase tracking-widest font-bold">
                    Tanrısal Ayrıcalık
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gold font-display text-2xl font-bold leading-none">
                  {stamps}
                  <span className="text-coffee-400 text-sm font-sans font-normal">
                    /{stampsRequired}
                  </span>
                </p>
                <p className="text-coffee-500 text-[8px] uppercase tracking-widest font-bold mt-0.5">
                  Liyakat
                </p>
              </div>
            </div>

            {/* Stamp Grid */}
            <div
              className="mb-6"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: "0.75rem",
              }}
            >
              {Array.from({ length: stampsRequired }).map((_, i) => {
                const isActive = i < stamps;
                return (
                  <div
                    key={i}
                    className={cn(
                      "relative aspect-square rounded-2xl flex items-center justify-center transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-br from-white to-[#FAF6EC] border border-gold/45 shadow-[0_4px_12px_rgba(212,175,55,0.12)]"
                        : "bg-white/30 border border-gold/10"
                    )}
                  >
                    {/* Stamp inner wax seal / laureate wreath */}
                    <div
                      className={cn(
                        "w-[82%] h-[82%] rounded-full flex items-center justify-center transition-all duration-500",
                        isActive
                          ? "bg-gradient-to-br from-gold-light via-gold to-gold-dark shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.6),0_3px_8px_rgba(212,175,55,0.35)] animate-stamp-pop text-white"
                          : "bg-[#FAF6EC]/30 border border-dashed border-gold/30 opacity-45 text-coffee-300"
                      )}
                      style={{
                        animationDelay: isActive ? `${i * 80}ms` : "0s",
                      }}
                    >
                      {isActive ? (
                        /* Greek Laurel Wreath SVG for Active */
                        <svg className="w-6 h-6 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 10a8 8 0 0 0 8 8 8 8 0 0 0 8-8" />
                          <path d="M12 2v16" />
                          <path d="M8 5C6 7 6 9 8 11" />
                          <path d="M16 5c2 2 2 4 0 6" />
                          <path d="M7 14c-1.5.5-2 1.5-1 2.5" />
                          <path d="M17 14c1.5.5 2 1.5 1 2.5" />
                        </svg>
                      ) : (
                        /* Inactive Wreath Outline */
                        <svg className="w-5 h-5 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 10a8 8 0 0 0 8 8 8 8 0 0 0 8-8" />
                          <path d="M12 2v16" />
                        </svg>
                      )}
                    </div>

                    {/* Stamp number */}
                    <span
                      className={cn(
                        "absolute bottom-1 right-2 text-[9px] font-mono font-bold tracking-wider",
                        isActive ? "text-gold-dark/40" : "text-coffee-300"
                      )}
                    >
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-coffee-500 text-xs">Aura İlerlemesi</span>
                <span className="text-gold text-xs font-semibold">
                  %{Math.round(progress)}
                </span>
              </div>
              <div className="h-2.5 bg-[#FAF6EC] rounded-full overflow-hidden border border-gold/15 relative">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    canClaim
                      ? "bg-gradient-to-r from-gold-dark via-gold to-gold-light animate-shimmer bg-gold-shimmer shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                      : "bg-gradient-to-r from-gold-dark/80 to-gold/90"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Reward Section */}
          <div className="border-t border-gold/15 bg-gradient-to-b from-white/10 to-[#FAF6EC]/30">
            {/* Dashed divider for "tear here" effect */}
            <div className="flex items-center -mt-px relative z-10">
              <div className="w-4 h-8 -ml-2 bg-[#ECE6D5] rounded-r-full border-r border-t border-b border-gold/20" />
              <div className="flex-1 border-t border-dashed border-gold/30 mx-2" />
              <div className="w-4 h-8 -mr-2 bg-[#ECE6D5] rounded-l-full border-l border-t border-b border-gold/20" />
            </div>

            <div className="px-6 pb-6 pt-2">
              {canClaim ? (
                <button
                  onClick={onClaimReward}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-white font-semibold text-base shadow-lg shadow-gold/25 hover:shadow-gold/45 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 btn-shimmer"
                >
                  <span className="flex items-center justify-center gap-2">
                    🎁 Ödülünü Talep Et!
                  </span>
                </button>
              ) : (
                <div className="text-center py-2">
                  <p className="text-coffee-600 text-sm mb-1.5">
                    Seçkin ödül için{" "}
                    <span className="text-gold font-bold">
                      {stampsRequired - stamps} pul
                    </span>{" "}
                    kaldı
                  </p>
                  <p className="text-coffee-400 text-xs flex items-center justify-center gap-1.5 uppercase tracking-wider font-semibold">
                    🎁 Ödül: {rewardDescription}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tapınak Ziyareti", value: customer.totalVisits, icon: "🏛️", delay: "0s" },
          { label: "Lütuf Kazanımı", value: customer.rewardsClaimed, icon: "🏆", delay: "0.15s" },
          { label: "Elçi Sayısı", value: customer.referralCount, icon: "👥", delay: "0.3s" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-premium rounded-2xl p-4 text-center border border-gold/15 bg-white/70 shadow-md animate-float"
            style={{ animationDelay: stat.delay }}
          >
            <span className="text-xl mb-1 block">{stat.icon}</span>
            <p className="text-gradient-gold font-display text-xl font-bold leading-none">
              {stat.value}
            </p>
            <p className="text-coffee-400 text-[8px] uppercase tracking-widest mt-2 font-bold leading-tight">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
