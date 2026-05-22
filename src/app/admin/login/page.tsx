"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, Lock, User, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/admin/dashboard");
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Hata",
        description: "Kullanıcı adı ve şifre gerekli.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const emailForAuth = `${username.toLowerCase().trim()}@holycon.com`;
      await signIn(emailForAuth, password);
      toast({
        title: "Başarılı",
        description: "Giriş yapıldı, yönlendiriliyorsunuz...",
      });
      router.push("/admin/dashboard");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Giriş başarısız.";
      toast({
        title: "Giriş Hatası",
        description: message.includes("auth/")
          ? "Kullanıcı adı veya şifre hatalı."
          : message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-coffee-radial">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-coffee-radial relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[140px] animate-bokeh-1" />
        <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] bg-coffee-400/10 rounded-full blur-[150px] animate-bokeh-2" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-dark via-gold to-gold-light flex items-center justify-center mb-4 shadow-xl shadow-gold/25 animate-float">
            <Landmark className="h-8 w-8 text-coffee-950" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gradient-gold-light tracking-widest uppercase mb-1">
            Holycon
          </h1>
          <p className="text-coffee-500 text-xs font-semibold uppercase tracking-widest">
            🏛️ Kafe Yönetim Paneli
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass-premium border-gold/20 shadow-2xl animate-slide-up bg-white/70">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2.5xl font-display font-bold text-gradient-gold-light uppercase tracking-wide">
              Yönetici Girişi
            </CardTitle>
            <CardDescription className="text-coffee-500 font-semibold text-xs">
              Devam etmek için kutsal anahtarınızı girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-coffee-700 text-sm font-semibold">
                  Kullanıcı Adı
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="pl-10 bg-white/80 border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold focus:ring-gold/10 h-11 rounded-xl"
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-coffee-700 text-sm font-semibold">
                  Şifre
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-white/80 border-[#DECBAA]/45 text-coffee-950 placeholder:text-coffee-300 focus:border-gold focus:ring-gold/10 h-11 rounded-xl"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coffee-950 font-bold h-12 transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:scale-[1.01] active:scale-[0.99] btn-shimmer rounded-xl mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-coffee-950" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  "GİRİŞ YAP ➔"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-coffee-500 font-semibold text-xs mt-8">
          © 2026 Stampify — Holycon Kafe
        </p>
      </div>
    </div>
  );
}
