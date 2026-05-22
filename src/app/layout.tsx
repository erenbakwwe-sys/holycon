import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Stampify | Holycon Kafe Sadakat Kartı",
  description:
    "Holycon Kafe dijital sadakat kartı. Kahve al, pul biriktir, ödül kazan! QR okutarak hemen başla.",
  keywords: ["sadakat kartı", "dijital kart", "kahve", "holycon", "stampify"],
  authors: [{ name: "Holycon Kafe" }],
  openGraph: {
    title: "Stampify | Holycon Kafe Sadakat Kartı",
    description: "Kahve al, pul biriktir, ödül kazan!",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2C1810",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans min-h-screen`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
