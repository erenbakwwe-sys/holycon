"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submitFeedback } from "@/lib/firestore";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types";

interface ReviewPromptProps {
  customer: Customer;
  googleMapsUrl: string;
  onComplete: () => void;
}

export default function ReviewPrompt({
  customer,
  googleMapsUrl,
  onComplete,
}: ReviewPromptProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { toast } = useToast();

  const handleStarClick = (star: number) => {
    setRating(star);

    if (star >= 4 && googleMapsUrl) {
      // High rating → redirect to Google Maps
      setTimeout(() => {
        window.open(googleMapsUrl, "_blank");
        toast({
          title: "Teşekkürler! ⭐",
          description: "Google'da değerlendirmeniz çok önemli!",
        });
        onComplete();
      }, 500);
    } else if (star >= 1 && star <= 3) {
      // Low rating → show feedback form
      setShowFeedbackForm(true);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      toast({
        title: "Lütfen bir mesaj yazın",
        description: "Geri bildiriminizi duymak isteriz.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await submitFeedback(
        customer.id!,
        customer.name,
        customer.phone,
        rating,
        feedbackMessage.trim()
      );
      setSubmitted(true);
      toast({
        title: "Teşekkürler! 🏛️✨",
        description: "Geri bildiriminiz bize ulaştı.",
      });
      setTimeout(onComplete, 2000);
    } catch (error) {
      console.error("Feedback error:", error);
      toast({
        title: "Hata",
        description: "Geri bildirim gönderilemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const starLabels = ["", "Kötü", "Fena değil", "İyi", "Çok iyi", "Mükemmel"];

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto animate-slide-up">
        <div className="glass-premium rounded-[32px] p-8 text-center bg-white/70 border border-gold/20 shadow-xl">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 flex items-center justify-center">
            <span className="text-4xl animate-bounce">💚</span>
          </div>
          <h3 className="font-display text-xl text-coffee-900 font-bold mb-2">
            Teşekkürler!
          </h3>
          <p className="text-coffee-600 text-sm font-semibold">
            Geri bildiriminiz başarıyla iletildi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="glass-premium rounded-[32px] overflow-hidden bg-white/70 border border-gold/20 shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-b from-gold/5 to-transparent px-6 pt-8 pb-4 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gold/20 to-gold-light/10 border border-gold/30 flex items-center justify-center shadow-md">
            <span className="text-3xl">⭐</span>
          </div>
          <h3 className="font-display text-xl text-coffee-950 font-bold uppercase tracking-wider mb-1">
            Deneyiminiz nasıldı?
          </h3>
          <p className="text-coffee-600 text-sm font-medium">
            Bizi değerlendirin, daha iyisini sunalım
          </p>
        </div>

        {/* Star Rating */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 shadow-sm",
                  (hoveredStar >= star || rating >= star)
                    ? "bg-gold/20 border border-gold/40 scale-110 shadow-gold/20"
                    : "bg-[#FAF6EC]/60 border border-gold/20 hover:border-gold/35"
                )}
              >
                <span
                  className={cn(
                    "text-2xl transition-all duration-300",
                    (hoveredStar >= star || rating >= star)
                      ? "drop-shadow-[0_0_6px_rgba(212,175,55,0.65)]"
                      : "grayscale opacity-40"
                  )}
                >
                  ⭐
                </span>
              </button>
            ))}
          </div>

          {/* Star Label */}
          <div className="h-6 mt-3 text-center">
            {(hoveredStar > 0 || rating > 0) && (
              <p className="text-gold font-bold text-sm animate-fade-in">
                {starLabels[hoveredStar || rating]}
              </p>
            )}
          </div>
        </div>

        {/* Feedback Form (for low ratings) */}
        {showFeedbackForm && (
          <div className="px-6 pb-6 animate-slide-up">
            <div className="border-t border-gold/15 pt-5">
              <p className="text-coffee-600 text-sm mb-3 font-semibold">
                Neleri geliştirebiliriz? Geri bildiriminizi paylaşın:
              </p>
              <Textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Deneyiminizi anlatın..."
                rows={4}
                className="bg-white/60 border-gold/20 text-coffee-900 placeholder:text-coffee-400 focus:border-gold focus:ring-gold/20 rounded-xl resize-none shadow-sm"
              />
              <div className="flex gap-3 mt-4">
                <Button
                  variant="ghost"
                  onClick={onComplete}
                  className="flex-1 h-12 rounded-xl text-coffee-500 hover:text-coffee-700 hover:bg-[#FAF6EC]"
                >
                  Geç
                </Button>
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={loading || !feedbackMessage.trim()}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-white font-bold hover:shadow-gold/30 hover:shadow-lg disabled:opacity-50 btn-shimmer"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    "Gönder"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Skip Button (when no feedback form shown) */}
        {!showFeedbackForm && rating === 0 && (
          <div className="px-6 pb-6">
            <button
              onClick={onComplete}
              className="w-full text-center text-coffee-500 hover:text-coffee-700 text-xs font-semibold transition-colors"
            >
              Şimdi değil, geç →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
