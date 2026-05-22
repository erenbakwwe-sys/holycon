"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ShieldCheck, Check, X, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { verifyAndUseRewardCode } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Staff, RewardCode } from "@/types";

interface RewardVerifyProps {
  staff: Staff;
}

type VerifyState = "idle" | "loading" | "success" | "error";

export default function RewardVerify({ staff }: RewardVerifyProps) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<VerifyState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [verifiedReward, setVerifiedReward] = useState<RewardCode | null>(null);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  // Focus first input on mount or reset
  useEffect(() => {
    if (state === "idle" && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [state]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleInputChange = useCallback(
    (index: number, value: string) => {
      if (!/^[a-zA-Z0-9]?$/.test(value)) return;

      const upper = value.toUpperCase();
      const newCode =
        code.substring(0, index) + upper + code.substring(index + 1);
      setCode(newCode.substring(0, 6));
      setErrorMsg("");

      // Move to next input
      if (upper && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [code]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        if (code[index]) {
          // Clear current
          const newCode =
            code.substring(0, index) + code.substring(index + 1);
          setCode(newCode);
        } else if (index > 0) {
          // Move back and clear previous
          const newCode =
            code.substring(0, index - 1) + code.substring(index);
          setCode(newCode);
          inputRefs.current[index - 1]?.focus();
        }
      } else if (e.key === "Enter" && code.length === 6) {
        handleVerify();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [code]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .substring(0, 6);
    setCode(pasted);
    if (pasted.length > 0) {
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  }, []);

  const handleVerify = async () => {
    if (code.length !== 6 || !staff.id) return;

    setState("loading");
    setErrorMsg("");

    try {
      const result = await verifyAndUseRewardCode(code, staff.id);

      if (result.success && result.rewardCode) {
        setState("success");
        setVerifiedReward(result.rewardCode);
        toast({
          title: "🏛️ Ödül Onaylandı!",
          description: `${result.rewardCode.customerName} - ${result.rewardCode.rewardTitle || "Ödül kullanıldı"}`,
        });
      } else {
        setState("error");
        setErrorMsg(result.error || "Geçersiz kod");
        triggerShake();
        toast({
          title: "Doğrulama Başarısız",
          description: result.error || "Geçersiz kod",
          variant: "destructive",
        });
        // Auto-reset to idle after showing error
        setTimeout(() => {
          setState("idle");
          setCode("");
        }, 2000);
      }
    } catch {
      setState("error");
      setErrorMsg("Bağlantı hatası. Tekrar deneyin.");
      triggerShake();
      setTimeout(() => {
        setState("idle");
        setCode("");
      }, 2000);
    }
  };

  const handleReset = useCallback(() => {
    setCode("");
    setState("idle");
    setErrorMsg("");
    setVerifiedReward(null);
    setShake(false);
  }, []);

  // Success Screen
  if (state === "success" && verifiedReward) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 animate-fade-in max-w-md mx-auto w-full">
        <div className="w-24 h-24 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mb-6 shadow-md">
          <Check className="w-12 h-12 text-green-600 animate-stamp-bounce" />
        </div>

        <h2 className="font-display text-3xl font-bold text-green-600 tracking-wider mb-2">
          DOĞRULANDI! 🏛️
        </h2>

        <div className="glass-premium rounded-[24px] p-6 w-full max-w-sm mt-4 border border-gold/20 shadow-xl bg-white/80">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-coffee-600 font-semibold">
              <Gift className="w-5 h-5 text-green-500" />
              <span className="text-sm">Seçkin Lütuf Kullanıldı</span>
            </div>

            <p className="text-coffee-900 font-display font-bold text-2xl">
              {verifiedReward.customerName}
            </p>

            {verifiedReward.rewardTitle && (
              <div className="px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 inline-block">
                <p className="text-gold-dark text-xs font-bold uppercase tracking-wider">
                  🏆 {verifiedReward.rewardTitle}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-[#EBE6DD]">
              <p className="text-coffee-500 text-xs font-mono font-bold">
                KOD: <span>{verifiedReward.code}</span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleReset}
          className={cn(
            "mt-8 w-full max-w-sm h-14 rounded-xl font-bold text-base transition-all duration-300",
            "bg-[#FAF6EC] text-coffee-700 border border-gold/30 shadow-md",
            "hover:bg-[#FAF8F2] hover:border-gold hover:text-coffee-900",
            "active:scale-[0.98] select-none btn-shimmer"
          )}
        >
          Yeni Kod Doğrula
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full">
      <div className="w-full max-w-sm">
        {/* Icon & Title */}
        <div className="text-center mb-8">
          <div
            className={cn(
              "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 border transition-colors shadow-sm",
              state === "error"
                ? "bg-red-50 border-red-200 text-red-500"
                : "bg-gold/10 border-gold/30 text-gold"
            )}
          >
            <ShieldCheck
              className={cn(
                "w-8 h-8",
                state === "error" ? "text-red-500" : "text-gold"
              )}
            />
          </div>
          <h2 className="font-display text-2xl font-bold text-gradient-gold-light tracking-wide mb-1">
            Ödül Doğrula
          </h2>
          <p className="text-coffee-600 text-sm font-medium">
            Müşterinin 6 haneli kodunu girin
          </p>
        </div>

        {/* 6-Digit Code Input */}
        <div
          className={cn(
            "flex justify-center gap-2 mb-6 transition-transform",
            shake && "animate-[shake_0.5s_ease-in-out]"
          )}
          onPaste={handlePaste}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={code[i] || ""}
              onChange={(e) => handleInputChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={state === "loading"}
              className={cn(
                "w-12 h-16 text-center text-2xl font-mono font-bold rounded-xl transition-all duration-200 shadow-sm focus:outline-none focus:ring-4 focus:ring-gold/10",
                state === "error"
                  ? "bg-red-50 border-2 border-red-400 text-red-600 focus:border-red-500"
                  : code[i]
                    ? "bg-white border-2 border-gold text-gold-dark"
                    : "bg-white/80 border-2 border-gold/20 text-coffee-900 focus:border-gold"
              )}
              autoComplete="off"
            />
          ))}
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in bg-red-50 border border-red-200 px-4 py-1.5 rounded-full shadow-sm max-w-xs mx-auto">
            <X className="w-4 h-4 text-red-500" />
            <p className="text-red-600 text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={code.length !== 6 || state === "loading"}
          className={cn(
            "w-full h-16 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 shadow-md",
            "bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500",
            "text-white hover:shadow-xl hover:shadow-green-500/10",
            "active:scale-[0.97]",
            "disabled:opacity-40 disabled:active:scale-100",
            "flex items-center justify-center gap-3 select-none btn-shimmer"
          )}
        >
          {state === "loading" ? (
            <>
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Doğrulanıyor...
            </>
          ) : (
            <>
              <ShieldCheck className="w-7 h-7" />
              DOĞRULA
            </>
          )}
        </button>

        {/* Footer hint */}
        <p className="text-center text-coffee-500 text-xs font-semibold tracking-wide mt-6">
          Müşteri telefonundaki ödül kodunu girin
        </p>
      </div>

      {/* Shake keyframe */}
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
