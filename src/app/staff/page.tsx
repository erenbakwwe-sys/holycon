"use client";

import { useState } from "react";
import { LogOut, Stamp, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import PinLogin from "@/components/staff/PinLogin";
import StampAction from "@/components/staff/StampAction";
import RewardVerify from "@/components/staff/RewardVerify";
import type { Staff } from "@/types";

type Tab = "stamp" | "reward";

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("stamp");

  const handleLogin = (loggedInStaff: Staff) => {
    setStaff(loggedInStaff);
  };

  const handleLogout = () => {
    setStaff(null);
    setActiveTab("stamp");
  };

  // PIN Login Screen
  if (!staff) {
    return <PinLogin onLogin={handleLogin} />;
  }

  // Staff Dashboard
  return (
    <div className="min-h-screen bg-coffee-radial flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#FAF8F5]/90 border-b border-[#EBE6DD] backdrop-blur-sm shadow-sm relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shadow-inner">
            <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22h18" />
              <path d="M6 18h12" />
              <path d="m12 2-9 5h18Z" />
              <path d="M7 10v8M12 10v8M17 10v8" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-gradient-gold-light tracking-widest leading-none uppercase">
              Holycon
            </h1>
            <p className="text-coffee-600 text-xs font-semibold mt-0.5 leading-none">
              🏛️ {staff.name}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 text-xs font-medium",
            "bg-[#FAF6EC]/90 text-coffee-600 border border-[#EADEC9]",
            "hover:bg-red-50 hover:text-red-600 hover:border-red-200",
            "active:scale-95 shadow-sm"
          )}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Çıkış</span>
        </button>
      </header>

      {/* Tab Selector */}
      <div className="flex p-1.5 mx-4 mt-4 bg-[#F4EFE6]/80 rounded-2xl border border-[#DECBAA]/30 shadow-sm relative z-10">
        <button
          onClick={() => setActiveTab("stamp")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300",
            activeTab === "stamp"
              ? "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-950 shadow-md shadow-gold/15"
              : "text-coffee-600 hover:text-coffee-900 hover:bg-white/50"
          )}
        >
          <Stamp className="w-4.5 h-4.5" />
          Damga Ver
        </button>
        <button
          onClick={() => setActiveTab("reward")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300",
            activeTab === "reward"
              ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-600/10"
              : "text-coffee-600 hover:text-coffee-900 hover:bg-white/50"
          )}
        >
          <ShieldCheck className="w-4.5 h-4.5" />
          Ödül Doğrula
        </button>
      </div>

      {/* Tab Content */}
      <main className="flex-1 flex flex-col mt-2 overflow-y-auto relative z-10">
        {activeTab === "stamp" ? (
          <StampAction staff={staff} />
        ) : (
          <RewardVerify staff={staff} />
        )}
      </main>
    </div>
  );
}
