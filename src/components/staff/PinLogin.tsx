"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getStaffByPin } from "@/lib/firestore";
import type { Staff } from "@/types";

interface PinLoginProps {
  onLogin: (staff: Staff) => void;
}

export default function PinLogin({ onLogin }: PinLoginProps) {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length >= 4 || isLoading) return;
      setError("");
      const newPin = pin + digit;
      setPin(newPin);

      // Auto-submit when 4 digits entered
      if (newPin.length === 4) {
        handleSubmit(newPin);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pin, isLoading]
  );

  const handleDelete = useCallback(() => {
    if (isLoading) return;
    setError("");
    setPin((prev) => prev.slice(0, -1));
  }, [isLoading]);

  const handleSubmit = async (submittedPin: string) => {
    setIsLoading(true);
    setError("");

    try {
      const staff = await getStaffByPin(submittedPin);
      if (staff) {
        onLogin(staff);
      } else {
        setError("Geçersiz PIN kodu");
        setPin("");
        triggerShake();
      }
    } catch {
      setError("Bağlantı hatası. Tekrar deneyin.");
      setPin("");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const numpadKeys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "del"],
  ];

  return (
    <div className="min-h-screen bg-coffee-radial flex items-center justify-center p-4 relative overflow-hidden">
      {/* Bokeh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[300px] h-[300px] rounded-full bg-gold/10 blur-[110px] animate-bokeh-1" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[350px] h-[350px] rounded-full bg-coffee-400/10 blur-[120px] animate-bokeh-2" />
      </div>

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold/25 to-gold-light/10 border border-gold/45 mb-4 shadow-[0_8px_32px_rgba(212,175,55,0.22)] animate-float">
            <svg className="w-10 h-10 text-gold animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22h18" />
              <path d="M6 18h12" />
              <path d="m12 2-9 5h18Z" />
              <path d="M7 10v8M12 10v8M17 10v8" />
            </svg>
          </div>
          <h1 className="font-display text-4.5xl font-bold text-gradient-gold-light tracking-widest uppercase mb-1">
            Holycon
          </h1>
          <p className="text-coffee-500 text-xs font-semibold uppercase tracking-widest">Personel Girişi</p>
        </div>

        {/* PIN Rings */}
        <div
          className={cn(
            "flex justify-center gap-5 mb-8 transition-transform",
            shake && "animate-[shake_0.5s_ease-in-out]"
          )}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
                i < pin.length
                  ? "border-gold bg-gradient-to-br from-gold-light to-gold scale-115 shadow-[0_0_15px_rgba(212,165,116,0.6)]"
                  : "border-coffee-300 bg-[#FAF8F5]/85"
              )}
            >
              {i < pin.length && (
                <div className="w-2.5 h-2.5 rounded-full bg-coffee-900 shadow-inner" />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        <div className="h-10 flex items-center justify-center mb-4">
          {error && (
            <p className="text-red-500 text-sm font-semibold animate-fade-in bg-red-50 border border-red-200 px-3.5 py-1 rounded-full shadow-sm">
              ⚠️ {error}
            </p>
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-coffee-600 text-sm font-medium">
              <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              Doğrulanıyor...
            </div>
          )}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 px-4">
          {numpadKeys.flat().map((key, i) => {
            if (key === "") {
              return <div key={i} />;
            }

            if (key === "del") {
              return (
                <button
                  key={i}
                  onClick={handleDelete}
                  disabled={isLoading || pin.length === 0}
                  className={cn(
                    "h-16 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center",
                    "glass-premium-gold text-coffee-700 border border-gold/30 shadow-md",
                    "hover:bg-[#FAF6EC] hover:border-gold active:scale-[0.9] active:bg-red-50 active:border-red-300 active:text-red-600",
                    "disabled:opacity-30 disabled:active:scale-100 cursor-pointer"
                  )}
                >
                  ⌫
                </button>
              );
            }

            return (
              <button
                key={i}
                onClick={() => handleDigit(key)}
                disabled={isLoading || pin.length >= 4}
                className={cn(
                  "h-16 rounded-2xl font-bold text-2xl transition-all duration-300 flex flex-col items-center justify-center",
                  "glass-premium text-coffee-800 border border-gold/25 shadow-md relative overflow-hidden",
                  "hover:bg-[#FAF6EC] hover:border-gold/50 hover:shadow-lg hover:shadow-gold/5",
                  "active:scale-[1.12] active:bg-gradient-to-br active:from-gold-light active:to-gold active:text-coffee-950 active:border-gold active:shadow-[0_0_20px_rgba(212,165,116,0.3)]",
                  "disabled:opacity-30 disabled:active:scale-100 cursor-pointer",
                  "select-none"
                )}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <p className="text-center text-coffee-500 text-xs font-semibold tracking-wider mt-8">
          4 haneli PIN kodunuzu girin
        </p>
      </div>

      {/* Shake keyframe (injected via style tag for the custom animation) */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
