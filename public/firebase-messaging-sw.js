/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker
// This file must be in /public and named exactly firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBQGsMjAFnN04vcd101Xdipo455SEnlKbs",
  authDomain: "holycon-ad387.firebaseapp.com",
  projectId: "holycon-ad387",
  storageBucket: "holycon-ad387.firebasestorage.app",
  messagingSenderId: "470538583899",
  appId: "1:470538583899:web:5e1293448c6481739ea47e",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message:", payload);
  
  const notificationTitle = payload.notification?.title || "Holycon Kafe";
  const notificationOptions = {
    body: payload.notification?.body || "Yeni bir bildiriminiz var!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: payload.data,
    vibrate: [100, 50, 100],
    actions: [
      {
        action: "open",
        title: "Aç",
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/card") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/card");
      }
    })
  );
});
