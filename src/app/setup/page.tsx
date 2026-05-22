"use client";

import { useState } from "react";
import { Coffee, ShieldCheck, CheckCircle2, AlertCircle, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createStaff } from "@/lib/firestore";
import Link from "next/link";

interface FirebaseErrorLike {
  code?: string;
  message?: string;
}

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  async function handleSetup() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setLogs([]);
    
    addLog("Kurulum işlemi başlatıldı...");

    try {
      // 1. Initialize settings
      addLog("Varsayılan ayarlar kontrol ediliyor...");
      const settingsRef = doc(db, "settings", "main");
      await setDoc(settingsRef, {
        stampsRequired: 10,
        rewardDescription: "Bedava Kahve ☕",
        googleMapsUrl: "",
        referralBonus: 2,
        businessName: "Holycon Kafe",
        businessPhone: "",
      }, { merge: true });
      addLog("Varsayılan ayarlar (10 pul gereksinimi, Bedava Kahve ödülü) Firestore'a başarıyla yazıldı.");

      // 2. Initialize default staff
      addLog("Personel Eren (PIN: 1234) kontrol ediliyor...");
      const staffQuery = query(collection(db, "staff"), where("name", "==", "Eren"));
      const staffSnap = await getDocs(staffQuery);

      if (staffSnap.empty) {
        const staff = await createStaff("Eren", "1234");
        addLog(`Eren adlı personel başarıyla oluşturuldu. Hashed PIN veritabanına kaydedildi. ID: ${staff.id}`);
      } else {
        addLog("Eren adlı personel zaten mevcut.");
      }

      // 3. Create Admin auth user
      addLog("Yönetici hesabı (admin@holycon.com) oluşturuluyor...");
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          "admin@holycon.com",
          "admin123456"
        );
        addLog(`Yönetici hesabı başarıyla oluşturuldu: ${userCredential.user.email}`);
      } catch (authError: unknown) {
        const err = authError as FirebaseErrorLike;
        if (err.code === "auth/email-already-in-use") {
          addLog("Yönetici hesabı zaten mevcut (admin@holycon.com).");
        } else if (err.code === "auth/operation-not-allowed") {
          addLog("HATA: Firebase Console'da Email/Password Authentication yöntemi aktif edilmemiş!");
          throw new Error("Lütfen Firebase Console'da Authentication > Sign-in Method altından Email/Password seçeneğini aktif edin.");
        } else {
          addLog(`Yönetici hesabı oluşturulurken hata: ${err.message || "Bilinmeyen hata"}`);
          throw authError;
        }
      }

      addLog("Tebrikler! Kurulum başarıyla tamamlandı.");
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      const errorLike = err as FirebaseErrorLike;
      let errMsg = errorLike.message || "Kurulum sırasında beklenmeyen bir hata oluştu.";
      if (errorLike.code === "permission-denied") {
        errMsg = "Firebase izin hatası (Permission Denied). Lütfen Firebase Console'da Firestore Database'i oluşturduğunuzdan ve kuralların (Rules) okuma/yazmaya izin verdiğinden emin olun.";
      }
      setError(errMsg);
      addLog(`HATA OLUŞTU: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-coffee-gradient relative overflow-hidden p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mb-4 shadow-lg shadow-gold/20">
            <Coffee className="h-8 w-8 text-coffee-900" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient-gold">
            Stampify Setup
          </h1>
          <p className="text-coffee-400 text-sm mt-1">
            Veritabanı ve Yönetici Kurulum Sihirbazı
          </p>
        </div>

        {/* Setup Card */}
        <Card className="glass-dark border-coffee-700/50 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-coffee-50 font-display flex items-center justify-center gap-2">
              <ShieldCheck className="h-5 w-5 text-gold animate-pulse" />
              Sistem Kurulumu
            </CardTitle>
            <CardDescription className="text-coffee-400">
              Firestore ve Authentication tablolarını ilk değerleriyle hazırlar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-coffee-950/70 border border-coffee-800 rounded-xl p-4 space-y-3 text-xs text-coffee-300">
              <p className="font-semibold text-coffee-200">Bu işlem şunları gerçekleştirecektir:</p>
              <ul className="list-disc pl-4 space-y-1 text-coffee-400">
                <li>{"Firestore'da varsayılan sadakat ayarlarını (`settings/main`) oluşturur."}</li>
                <li>Giriş için varsayılan personel hesabını ekler: **Eren** (PIN: `1234`).</li>
                <li>Firebase Auth üzerinde yönetici hesabı oluşturur: **admin@holycon.com** (Şifre: `admin123456`).</li>
              </ul>
            </div>

            {/* Run Button */}
            {!success && (
              <Button
                onClick={handleSetup}
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light text-coffee-900 font-semibold h-11 transition-all duration-300 shadow-lg shadow-gold/20 rounded-xl gap-2"
              >
                <Play className="h-4 w-4 fill-current" />
                {loading ? "Kurulum Yapılıyor..." : "Kurulumu Başlat"}
              </Button>
            )}

            {/* Logs Area */}
            {logs.length > 0 && (
              <div className="space-y-2">
                <Label className="text-coffee-300 text-xs font-mono">Kurulum Günlükleri (Logs):</Label>
                <div className="bg-black/40 border border-coffee-800 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] text-green-400 space-y-1.5 scrollbar-thin">
                  {logs.map((log, index) => (
                    <div key={index} className="leading-relaxed whitespace-pre-wrap">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Box */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex gap-3 text-sm text-green-400 animate-scale-in">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-green-400" />
                <div className="space-y-3 flex-1">
                  <div>
                    <h4 className="font-semibold">Kurulum Başarılı!</h4>
                    <p className="text-xs text-green-500/80 mt-1">
                      Yönetici hesabı ve personel başarıyla oluşturuldu. Artık giriş yapıp sadakat sistemini kullanmaya başlayabilirsiniz.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="bg-green-500 hover:bg-green-600 text-white rounded-lg gap-1.5 text-xs font-semibold">
                      <Link href="/admin">
                        Admin Paneline Git
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="border-coffee-700 hover:bg-coffee-800 text-coffee-300 hover:text-coffee-100 rounded-lg text-xs font-semibold">
                      <Link href="/staff">
                        Personel Girişi
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Box */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 text-sm text-red-400 animate-scale-in">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
                <div>
                  <h4 className="font-semibold">Kurulum Hatası</h4>
                  <p className="text-xs text-red-500/80 mt-1">{error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-coffee-600 text-xs mt-6">
          © 2026 Stampify — Holycon Kafe
        </p>
      </div>
    </div>
  );
}
