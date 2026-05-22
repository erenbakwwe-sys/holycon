"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllCustomers,
  getAllStaff,
  getStampLogsByDate,
} from "@/lib/firestore";
import type { Customer, Staff, StampLog } from "@/types";
import { Timestamp } from "firebase/firestore";
import {
  Users,
  Award,
  TrendingUp,
  CalendarCheck,
  Loader2,
  BarChart3,
  Activity,
} from "lucide-react";

// Dynamically import Recharts (no SSR)
const AreaChart = dynamic(
  () => import("recharts").then((m) => m.AreaChart),
  { ssr: false }
);
const Area = dynamic(
  () => import("recharts").then((m) => m.Area),
  { ssr: false }
);
const BarChart = dynamic(
  () => import("recharts").then((m) => m.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import("recharts").then((m) => m.Bar),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((m) => m.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((m) => m.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((m) => m.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);

const DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function getDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toDate(val: Timestamp | Date): Date {
  return val instanceof Date ? val : val.toDate();
}

export default function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [logs, setLogs] = useState<StampLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const now = new Date();
        const sevenDaysAgo = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        );
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const [c, s, l] = await Promise.all([
          getAllCustomers(),
          getAllStaff(),
          getStampLogsByDate(sevenDaysAgo, now),
        ]);
        setCustomers(c);
        setStaff(s);
        setLogs(l);
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const todayKey = getDateKey(now);
    const fourteenDaysAgo = new Date(
      now.getTime() - 14 * 24 * 60 * 60 * 1000
    );

    const todayVisitors = logs.filter((l) => {
      const ts = l.timestamp;
      if (!ts) return false;
      return getDateKey(toDate(ts)) === todayKey && l.type === "stamp";
    }).length;

    const totalCustomers = customers.length;

    const totalRewardsClaimed = customers.reduce(
      (acc, c) => acc + (c.rewardsClaimed || 0),
      0
    );

    const activeCustomers = customers.filter((c) => {
      const lv = c.lastVisit;
      if (!lv) return false;
      return toDate(lv) >= fourteenDaysAgo;
    }).length;

    return { todayVisitors, totalCustomers, totalRewardsClaimed, activeCustomers };
  }, [customers, logs]);

  // Weekly visits chart data
  const weeklyData = useMemo(() => {
    const data: { day: string; visits: number; newCustomers: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = getDateKey(d);
      const dayName = DAY_NAMES[d.getDay()];

      const visits = logs.filter((l) => {
        if (!l.timestamp || l.type !== "stamp") return false;
        return getDateKey(toDate(l.timestamp)) === key;
      }).length;

      const newCust = customers.filter((c) => {
        if (!c.createdAt) return false;
        return getDateKey(toDate(c.createdAt)) === key;
      }).length;

      data.push({ day: dayName, visits, newCustomers: newCust });
    }
    return data;
  }, [logs, customers]);

  // Top 10 customers
  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.totalVisits - a.totalVisits)
      .slice(0, 10)
      .map((c) => ({
        name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
        visits: c.totalVisits,
        stamps: c.stamps,
      }));
  }, [customers]);

  // Staff performance
  const staffPerformance = useMemo(() => {
    return [...staff]
      .filter((s) => s.totalStampsGiven > 0)
      .sort((a, b) => b.totalStampsGiven - a.totalStampsGiven)
      .map((s) => ({
        name: s.name,
        stamps: s.totalStampsGiven,
      }));
  }, [staff]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Bugünkü Ziyaretçi",
      value: stats.todayVisitors,
      icon: CalendarCheck,
      gradient: "from-gold/10 to-gold-dark/10",
      iconColor: "text-gold-dark",
    },
    {
      title: "Toplam Müşteri",
      value: stats.totalCustomers,
      icon: Users,
      gradient: "from-[#decbaa]/10 to-[#cbae85]/10",
      iconColor: "text-[#cbae85]",
    },
    {
      title: "Ödül Kullanan",
      value: stats.totalRewardsClaimed,
      icon: Award,
      gradient: "from-emerald-500/10 to-green-500/10",
      iconColor: "text-emerald-600",
    },
    {
      title: "Aktif Müşteri",
      value: stats.activeCustomers,
      icon: TrendingUp,
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gradient-gold-light tracking-wide uppercase">
          Dashboard
        </h1>
        <p className="text-sm text-coffee-600 font-semibold mt-1">
          🏛️ Holycon Tapınağı Genel İstatistikleri
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="glass-premium bg-white/80 border border-gold/15 hover:border-gold/30 hover:shadow-lg transition-all duration-300 rounded-[20px]"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-coffee-500 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-display font-bold text-gradient-gold-light mt-1.5">
                    {stat.value.toLocaleString("tr-TR")}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} border border-gold/20 flex items-center justify-center shadow-sm`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Visits */}
        <Card className="glass-premium bg-white/70 border border-gold/15 rounded-[24px] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-coffee-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-gold-dark" />
              Haftalık Ziyaretler (Mühürleme)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DD" />
                  <XAxis
                    dataKey="day"
                    stroke="#4E4642"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#4E4642"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FAF8F5",
                      border: "1px solid #DECBAA",
                      borderRadius: "12px",
                      color: "#2A2421",
                      fontSize: "12px",
                      fontWeight: 600,
                      boxShadow: "0 10px 25px -5px rgba(212,175,55,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="#D4AF37"
                    strokeWidth={2.5}
                    fill="url(#colorVisits)"
                    name="Ziyaret"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily New Registrations */}
        <Card className="glass-premium bg-white/70 border border-gold/15 rounded-[24px] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-coffee-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-[#AA7C11]" />
              Günlük Yeni Kayıtlar (Kutsal İttifak)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DD" />
                  <XAxis
                    dataKey="day"
                    stroke="#4E4642"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#4E4642"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FAF8F5",
                      border: "1px solid #DECBAA",
                      borderRadius: "12px",
                      color: "#2A2421",
                      fontSize: "12px",
                      fontWeight: 600,
                      boxShadow: "0 10px 25px -5px rgba(212,175,55,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="newCustomers"
                    fill="#D4AF37"
                    radius={[6, 6, 0, 0]}
                    name="Yeni Kayıt"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Customers */}
        <Card className="glass-premium bg-white/70 border border-gold/15 rounded-[24px] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-coffee-800 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              Liyakati En Yüksek 10 Elçi (Müşteri)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {topCustomers.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCustomers}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DD" />
                    <XAxis
                      type="number"
                      stroke="#4E4642"
                      fontSize={11}
                      fontWeight={600}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#4E4642"
                      fontSize={11}
                      fontWeight={600}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FAF8F5",
                        border: "1px solid #DECBAA",
                        borderRadius: "12px",
                        color: "#2A2421",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    />
                    <Bar
                      dataKey="visits"
                      fill="#CBAE85"
                      radius={[0, 6, 6, 0]}
                      name="Ziyaret"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-coffee-500 font-semibold text-sm">
                  Henüz yeterli liyakat verisi yok
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Staff Performance */}
        <Card className="glass-premium bg-white/70 border border-gold/15 rounded-[24px] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-coffee-800 uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-gold-dark" />
              Rahiplerin Performansı (Personel Mühür Sayıları)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {staffPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={staffPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DD" />
                    <XAxis
                      dataKey="name"
                      stroke="#4E4642"
                      fontSize={11}
                      fontWeight={600}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#4E4642"
                      fontSize={11}
                      fontWeight={600}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FAF8F5",
                        border: "1px solid #DECBAA",
                        borderRadius: "12px",
                        color: "#2A2421",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    />
                    <Bar
                      dataKey="stamps"
                      fill="#AA8C60"
                      radius={[6, 6, 0, 0]}
                      name="Verilen Damga"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-coffee-500 font-semibold text-sm">
                  Henüz yeterli rahip performansı verisi yok
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
