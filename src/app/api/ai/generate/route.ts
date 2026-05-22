import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Claude API yapılandırılmamış",
          generatedText:
            "🔔 AI kampanya sihirbazı henüz yapılandırılmamış. Lütfen .env.local dosyasına ANTHROPIC_API_KEY ekleyin.",
        },
        { status: 200 }
      );
    }

    const { segment, purpose, channel } = await req.json();

    const segmentLabels: Record<string, string> = {
      inactive_14_days: "14+ gün gelmemiş müşteriler",
      no_rewards: "Hiç ödül kullanmamış müşteriler",
      all_customers: "Tüm müşteriler",
    };

    const channelLabels: Record<string, string> = {
      whatsapp: "WhatsApp",
      email: "E-posta",
      push: "Push Bildirim",
      all: "Tüm kanallar",
    };

    const prompt = `Sen bir kafe için pazarlama uzmanısın. Holycon Kafe için bir kampanya mesajı yaz.

Hedef kitle: ${segmentLabels[segment] || segment}
Kampanya amacı: ${purpose}
Gönderim kanalı: ${channelLabels[channel] || channel}

Kurallar:
- Türkçe yaz
- Sıcak, samimi, kahve severler için uygun bir ton kullan
- Kısa ve etkili ol (max 280 karakter WhatsApp için, 500 karakter email için)
- Emoji kullan ama abartma
- İşletme adı "Holycon Kafe" olarak geçsin
- Bir call-to-action ekle
- ${channel === "email" ? "Email için konu satırı da öner (Konu: ... şeklinde)" : ""}

Sadece mesaj metnini yaz, başka açıklama ekleme.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Claude API error:", errorData);
      return NextResponse.json(
        { error: "AI API hatası", details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedText =
      data.content?.[0]?.text || "Mesaj üretilemedi, lütfen tekrar deneyin.";

    return NextResponse.json({ generatedText });
  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
