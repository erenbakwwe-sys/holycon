import { NextResponse } from "next/server";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createStaff, getSettings } from "@/lib/firestore";

export async function GET() {
  const logs: string[] = [];
  try {
    logs.push("Setup/Seed işlemi başlatıldı.");

    // 1. Initialize settings
    logs.push("Varsayılan ayarlar kontrol ediliyor...");
    const settings = await getSettings();
    logs.push(`Ayarlar hazır: ${JSON.stringify(settings)}`);

    // 2. Initialize default staff
    logs.push("Varsayılan personel (Eren - PIN: 1234) kontrol ediliyor...");
    const staffQuery = query(collection(db, "staff"), where("name", "==", "Eren"));
    const staffSnap = await getDocs(staffQuery);

    if (staffSnap.empty) {
      const staff = await createStaff("Eren", "1234");
      logs.push(`Eren adlı personel başarıyla eklendi. ID: ${staff.id}`);
    } else {
      logs.push("Eren adlı personel zaten mevcut.");
    }

    // 3. Create Admin auth user
    logs.push("Yönetici hesabı (admin@holycon.com) oluşturuluyor...");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        "admin@holycon.com",
        "admin123456"
      );
      logs.push(`Yönetici hesabı başarıyla oluşturuldu: ${userCredential.user.email}`);
    } catch (authError: unknown) {
      const err = authError as { code?: string; message?: string };
      if (err.code === "auth/email-already-in-use") {
        logs.push("Yönetici hesabı zaten mevcut (admin@holycon.com).");
      } else {
        logs.push(`Yönetici hesabı oluşturulurken hata: ${err.message || "Bilinmeyen hata"}`);
        throw authError;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Veritabanı kurulumu ve seed işlemi başarıyla tamamlandı.",
      logs,
    });
  } catch (error: unknown) {
    console.error("Setup API error:", error);
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Kurulum sırasında hata oluştu.",
        logs,
      },
      { status: 500 }
    );
  }
}
