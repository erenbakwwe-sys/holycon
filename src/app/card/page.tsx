"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCustomerByPhone, getSettings } from "@/lib/firestore";
import type { Customer, Settings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import StampCard from "@/components/card/StampCard";
import CustomerRegister from "@/components/card/CustomerRegister";
import RewardClaim from "@/components/card/RewardClaim";
import ReviewPrompt from "@/components/card/ReviewPrompt";
import ReferralSection from "@/components/card/ReferralSection";
import { usePushNotification } from "@/hooks/usePushNotification";

function CustomerCardContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // State variables
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingPhone, setSubmittingPhone] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Modals / Flows
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

  // Referral code from URL (?ref=XYZ)
  const refCode = searchParams.get("ref");

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await getSettings();
        setSettings(s);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
    loadSettings();
  }, []);

  // Check localStorage for saved session
  useEffect(() => {
    const savedPhone = localStorage.getItem("holycon_customer_phone");
    if (savedPhone) {
      setPhone(savedPhone);
      handlePhoneCheck(savedPhone);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time subscription to customer document in Firestore
  useEffect(() => {
    if (!customer?.id) return;

    const docRef = doc(db, "customers", customer.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Customer;
        // Check if stamps increased to show a toast message
        if (customer && data.stamps > customer.stamps) {
          toast({
            title: "Altın Pul Eklendi! 🏛️✨",
            description: `Yeni pulunuz tanımlandı! Güncel pul: ${data.stamps}`,
          });
        }
        setCustomer({ id: docSnap.id, ...data });
      }
    }, (error) => {
      console.error("Real-time subscription error:", error);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.id]);

  // Hook for push notifications
  const { permission, requestPermission, isSupported } = usePushNotification(customer?.id);

  // Handle phone lookup
  const handlePhoneCheck = async (phoneNumber: string) => {
    if (!phoneNumber) return;
    setSubmittingPhone(true);
    setLoading(true);

    // Clean phone number: remove spaces and non-digit characters except +
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, "");

    try {
      const existingCustomer = await getCustomerByPhone(cleanPhone);
      if (existingCustomer) {
        setCustomer(existingCustomer);
        localStorage.setItem("holycon_customer_phone", cleanPhone);
        setIsNewUser(false);
      } else {
        setIsNewUser(true);
      }
    } catch (error) {
      console.error("Phone lookup failed:", error);
      toast({
        title: "Sistem hatası",
        description: "Giriş yapılamadı. Lütfen internetinizi kontrol edin.",
        variant: "destructive",
      });
    } finally {
      setSubmittingPhone(false);
      setLoading(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast({
        title: "Geçersiz telefon numarası",
        description: "Lütfen geçerli bir telefon numarası girin.",
        variant: "destructive",
      });
      return;
    }
    handlePhoneCheck(phone);
  };

  const handleRegistered = (newCustomer: Customer) => {
    setCustomer(newCustomer);
    localStorage.setItem("holycon_customer_phone", newCustomer.phone);
    setIsNewUser(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("holycon_customer_phone");
    setCustomer(null);
    setPhone("");
    setIsNewUser(false);
  };

  if (loading && !submittingPhone) {
    return (
      <div className="min-h-screen bg-coffee-radial flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Bokeh Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[10%] left-[-10%] w-[250px] h-[250px] rounded-full bg-gold/5 blur-[100px] animate-bokeh-1" />
          <div className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-coffee-400/5 blur-[120px] animate-bokeh-2" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
          <p className="text-coffee-300 text-sm mt-4">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // 1. Phone number login form
  if (!customer && !isNewUser) {
    return (
      <div className="min-h-screen bg-coffee-radial flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Bokeh Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-gold/10 blur-[120px] animate-bokeh-1" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-coffee-400/10 blur-[130px] animate-bokeh-2" />
        </div>

        <div className="w-full max-w-md space-y-8 animate-slide-up relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold/25 to-gold-light/10 border border-gold/45 mb-4 shadow-[0_8px_32px_rgba(212,175,55,0.22)]">
              <svg className="w-10 h-10 text-gold animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 22h18" />
                <path d="M6 18h12" />
                <path d="m12 2-9 5h18Z" />
                <path d="M7 10v8M12 10v8M17 10v8" />
              </svg>
            </div>
            <h1 className="font-display text-4.5xl font-bold text-gradient-gold-light tracking-widest uppercase mb-2">
              Holycon
            </h1>
            <p className="text-coffee-500 text-xs font-semibold uppercase tracking-widest">
              Dijital Sadakat Kartı
            </p>
          </div>

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="glass-premium rounded-3xl p-6 space-y-4 border border-white/5 shadow-2xl">
              <div className="space-y-2">
                <Label htmlFor="phone-input" className="text-coffee-200 text-sm font-medium tracking-wide">
                  Telefon Numaranız
                </Label>
                <Input
                  id="phone-input"
                  type="tel"
                  placeholder="0555 555 55 55"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-coffee-950/40 border-coffee-800/40 text-coffee-100 placeholder:text-coffee-600 focus:border-gold/50 focus:ring-gold/20 h-12 rounded-xl transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
                />
                <p className="text-[10px] text-coffee-400 mt-2 leading-relaxed">
                  🔒 Sadece size özel kartınızı sorgulamak içindir. Spam SMS veya reklam kesinlikle gönderilmez.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submittingPhone || phone.length < 10}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-900 font-semibold text-base shadow-lg shadow-gold/25 hover:shadow-gold/45 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 btn-shimmer"
            >
              {submittingPhone ? "Kontrol ediliyor..." : "Devam Et ➔"}
            </Button>
          </form>

          {refCode && (
            <div className="text-center animate-pulse">
              <span className="text-xs text-gold/90 bg-gold/15 px-3 py-1.5 rounded-full border border-gold/30">
                🎁 Referans daveti algılandı!
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. New user registration form
  if (isNewUser && settings) {
    return (
      <div className="min-h-screen bg-coffee-radial flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Bokeh Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-gold/10 blur-[120px] animate-bokeh-1" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-coffee-400/10 blur-[130px] animate-bokeh-2" />
        </div>

        <div className="relative z-10 w-full flex flex-col items-center">
          <CustomerRegister
            phone={phone}
            referralCode={refCode}
            settings={settings}
            onRegistered={handleRegistered}
          />
          <button
            onClick={() => setIsNewUser(false)}
            className="text-coffee-400 hover:text-coffee-200 text-xs mt-6 transition-colors border-b border-coffee-700/50 pb-0.5 hover:border-coffee-400"
          >
            ← Telefon numarasını değiştir
          </button>
        </div>
      </div>
    );
  }

  // 3. Customer Dashboard
  return (
    <div className="min-h-screen bg-coffee-radial flex flex-col p-4 sm:p-6 pb-24 overflow-x-hidden relative">
      {/* Bokeh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] left-[-15%] w-[350px] h-[350px] rounded-full bg-gold/10 blur-[140px] animate-bokeh-1" />
        <div className="absolute bottom-[10%] right-[-15%] w-[400px] h-[400px] rounded-full bg-coffee-400/10 blur-[150px] animate-bokeh-2" />
      </div>

      <div className="relative z-10 flex flex-col w-full">
        {/* Top bar with Logout */}
        <div className="w-full max-w-md mx-auto flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gold animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22h18" />
              <path d="M6 18h12" />
              <path d="m12 2-9 5h18Z" />
              <path d="M7 10v8M12 10v8M17 10v8" />
            </svg>
            <span className="font-display font-bold text-lg text-gradient-gold-light tracking-widest uppercase">Holycon</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-coffee-300 hover:text-coffee-100 text-xs font-medium py-1.5 px-4 rounded-full border border-coffee-700/60 bg-coffee-800/30 hover:bg-coffee-800/60 transition-all duration-300"
          >
            Çıkış Yap
          </button>
        </div>

        {/* Main content grid */}
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Push Notification Promo Banner */}
          {isSupported && permission === "default" && (
            <div className="glass-premium rounded-2xl p-4 border border-gold/20 bg-gradient-to-r from-gold/10 to-transparent flex items-center justify-between gap-4 animate-slide-up shadow-lg">
              <div className="space-y-0.5">
                <p className="text-coffee-100 text-xs font-semibold">Anlık Bildirimleri Açın 🔔</p>
                <p className="text-coffee-400 text-[10px]">Damgalarınızı anında bildirimle görün.</p>
              </div>
              <Button
                size="sm"
                onClick={requestPermission}
                className="bg-gradient-to-r from-gold-dark to-gold text-coffee-900 hover:scale-[1.02] text-[11px] font-semibold h-8 rounded-lg shadow transition-all duration-300"
              >
                İzin Ver
              </Button>
            </div>
          )}

          {/* Feedback Section (if triggered) */}
          {showFeedbackPrompt && settings && (
            <ReviewPrompt
              customer={customer!}
              googleMapsUrl={settings.googleMapsUrl}
              onComplete={() => setShowFeedbackPrompt(false)}
            />
          )}

          {/* Active Stamp Card */}
          {customer && settings && (
            <StampCard
              customer={customer}
              stampsRequired={settings.stampsRequired}
              rewardDescription={settings.rewardDescription}
              onClaimReward={() => setShowClaimModal(true)}
            />
          )}

          {/* Referral Section */}
          {customer && settings && (
            <ReferralSection customer={customer} settings={settings} />
          )}
        </div>
      </div>

      {/* Reward Claiming Modal */}
      {showClaimModal && customer && (
        <RewardClaim
          customer={customer}
          onCodeGenerated={() => {
            // Once code is generated, the customer has claimed a reward.
            // We can prompt them for feedback after they close the modal.
          }}
          onClose={() => {
            setShowClaimModal(false);
            // Trigger feedback prompt after they close the claim window
            setShowFeedbackPrompt(true);
          }}
        />
      )}
    </div>
  );
}

export default function CustomerCardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-coffee-radial flex flex-col items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
          <p className="text-coffee-300 text-sm mt-4">Yükleniyor...</p>
        </div>
      }
    >
      <CustomerCardContent />
    </Suspense>
  );
}
