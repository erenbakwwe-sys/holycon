import { NextRequest, NextResponse } from "next/server";
import { verifyAndUseRewardCode } from "@/lib/firestore";

export async function POST(req: NextRequest) {
  try {
    const { code, staffId } = await req.json();

    if (!code || !staffId) {
      return NextResponse.json(
        { error: "Eksik parametreler (code veya staffId)" },
        { status: 400 }
      );
    }

    const result = await verifyAndUseRewardCode(code, staffId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        rewardCode: result.rewardCode,
        message: "Kod başarıyla doğrulandı ve kullanıldı.",
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Doğrulama başarısız." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verify reward API error:", error);
    return NextResponse.json(
      { error: "Doğrulama sırasında sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
