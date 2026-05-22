"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  Landmark,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/customers", label: "Müşteriler", icon: Users },
  { href: "/admin/staff", label: "Personel", icon: UserCog },
  { href: "/admin/campaigns", label: "Kampanyalar", icon: Megaphone },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-[#FAF8F5]/90">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-dark via-gold to-gold-light flex items-center justify-center shadow-md shadow-gold/20 animate-float">
          <Landmark className="h-5 w-5 text-coffee-950" />
        </div>
        <div>
          <h1 className="text-base font-display font-bold text-gradient-gold-light tracking-wider uppercase leading-none">
            Holycon
          </h1>
          <p className="text-[10px] text-coffee-500 font-bold uppercase tracking-widest mt-1 leading-none">Admin Panel</p>
        </div>
      </div>

      <Separator className="bg-[#EBE6DD]" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
                isActive
                  ? "bg-gold/10 text-gold-dark border border-gold/20 shadow-sm"
                  : "text-coffee-600 hover:text-coffee-900 hover:bg-[#F4EFE6]/50"
              )}
            >
              <item.icon
                className={cn("h-4 w-4", isActive ? "text-gold-dark" : "text-coffee-500")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4">
        <Separator className="bg-[#EBE6DD] mb-3" />
        <p className="text-[10px] text-coffee-500 font-semibold text-center uppercase tracking-wider">
          Holycon 🏛️ Stampify
        </p>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [user, loading, isLoginPage, router]);

  async function handleLogout() {
    try {
      await signOut();
      toast({ title: "Çıkış yapıldı", description: "Güvenli çıkış başarılı." });
      router.push("/admin/login");
    } catch {
      toast({
        title: "Hata",
        description: "Çıkış yapılırken hata oluştu.",
        variant: "destructive",
      });
    }
  }

  // Login page: no layout chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-coffee-radial">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center animate-pulse shadow-lg shadow-gold/25">
            <Landmark className="h-6 w-6 text-coffee-950" />
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gold border-t-transparent" />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#FAF9F6] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-60 flex-col bg-[#FAF8F5]/90 border-r border-[#EBE6DD] backdrop-blur-sm shadow-sm relative z-20">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-[#FAF8F5] border-r border-[#EBE6DD]"
        >
          <div className="absolute right-3 top-3 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="text-coffee-600 hover:text-coffee-900 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarContent
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 h-14 border-b border-[#EBE6DD] bg-[#FAF8F5]/85 backdrop-blur-sm shrink-0 shadow-sm relative z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-coffee-600 hover:text-coffee-900 h-9 w-9"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-sm font-bold text-gradient-gold-light tracking-wide uppercase leading-tight">
                Holycon Pantheon
              </h2>
              <p className="text-[10px] text-coffee-500 font-bold uppercase tracking-widest -mt-0.5 hidden sm:block">
                Yönetim Paneli
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-coffee-600 font-semibold hidden sm:inline">
              🏛️ {user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-coffee-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#EBE6DD] transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Çıkış</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#FAF9F6] scrollbar-thin">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
