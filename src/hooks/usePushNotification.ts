"use client";

import { useState, useEffect, useCallback } from "react";
import { getToken } from "firebase/messaging";
import { getMessagingInstance } from "@/lib/firebase";
import { updateCustomerFcmToken } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

export function usePushNotification(customerId?: string) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupForegroundListener = async () => {
      const messaging = await getMessagingInstance();
      if (messaging) {
        const { onMessage: onMsg } = await import("firebase/messaging");
        unsubscribe = onMsg(messaging, (payload) => {
          toast({
            title: payload.notification?.title || "Holycon Kafe",
            description: payload.notification?.body || "Yeni bildirim!",
          });
        });
      }
    };

    setupForegroundListener();
    return () => unsubscribe?.();
  }, [toast]);

  const requestPermission = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        const messaging = await getMessagingInstance();
        if (messaging) {
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          const fcmToken = await getToken(messaging, { vapidKey });
          setToken(fcmToken);

          // Save to Firestore
          await updateCustomerFcmToken(customerId, fcmToken, true);

          toast({
            title: "Bildirimler açıldı! 🔔",
            description: "Artık damga ve ödül bildirimlerini alacaksınız.",
          });
        }
      } else {
        toast({
          title: "Bildirim izni reddedildi",
          description: "Tarayıcı ayarlarından değiştirebilirsiniz.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Push notification error:", error);
      toast({
        title: "Bildirim hatası",
        description: "Bildirimler şu an için kullanılamıyor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [customerId, toast]);

  return {
    permission,
    token,
    loading,
    requestPermission,
    isSupported: typeof window !== "undefined" && "Notification" in window,
  };
}
