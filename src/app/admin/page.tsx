"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-coffee-radial">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
    </div>
  );
}
