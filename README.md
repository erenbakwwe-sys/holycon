# Stampify - Holycon Kafe Dijital Sadakat Sistemi ☕

Holycon Kafe için özel olarak geliştirilmiş, QR tabanlı, PWA (Progressive Web App) destekli dijital sadakat sistemi. Müşteriler kahve aldıkça pul (stamp) toplar, 10 pul biriktirdiklerinde ödüllerini kasada personel doğrulamasıyla alırlar.

---

## 🚀 Hızlı Başlangıç

### 1. Proje Bağımlılıklarını Kurun
Proje klasörünün (`stampify`) içinde terminali açarak paketleri yükleyin:
```bash
npm install
```

### 2. Firebase Kurulumu (Kritik Adımlar)
Uygulamanın çalışabilmesi için Firebase konsolunda aşağıdaki adımları yapmanız gerekir:

1. **Firestore Database Aktifleştirme**:
   - [Firebase Console](https://console.firebase.google.com/) sayfasına gidin.
   - Projenizi (`holycon-ad387`) seçin.
   - Soldaki menüden **Firestore Database** sayfasına girin.
   - **Create Database** (Veritabanı Oluştur) butonuna tıklayın.
   - Başlangıçta **Start in test mode** (Test modunda başlat) seçeneğini seçin (böylece okuma/yazma izinleri açık olur) ve lokasyonu seçerek veritabanını oluşturun.

2. **Authentication Aktifleştirme**:
   - Soldaki menüden **Authentication** sayfasına girin.
   - **Get Started** butonuna tıklayın.
   - Giriş yöntemleri (Sign-in method) sekmesinde **Email/Password** (E-posta/Şifre) seçeneğini seçip aktifleştirin (Enable edin ve kaydedin).

3. **Web Push (FCM VAPID Key) - İsteğe Bağlı**:
   - Push bildirimleri göndermek istiyorsanız, Firebase konsolunda sol üstteki dişli ikonuna tıklayıp **Project Settings** (Proje Ayarları) sayfasına gidin.
   - **Cloud Messaging** sekmesine geçin.
   - Sayfanın altındaki **Web configuration** bölümünden **Generate Key Pair** butonuna basarak bir VAPID anahtarı oluşturun.
   - Bu anahtarı kopyalayıp `.env.local` dosyasındaki `NEXT_PUBLIC_FIREBASE_VAPID_KEY` alanına yapıştırın.

---

## ⚙️ Çevresel Değişkenler (.env.local)

`.env.local` dosyanız şu şekilde yapılandırılmıştır:
- `NEXT_PUBLIC_FIREBASE_*` ile başlayan tüm Firebase anahtarlarınız hazır durumdadır.
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`: Push bildirimleri için yukarıda oluşturduğunuz anahtarı buraya ekleyin.
- `ANTHROPIC_API_KEY`: (İsteğe bağlı) Yapay zeka ile kampanya hazırlama sihirbazı için kullanılır. API anahtarınız yoksa sistem şablon mesajları kullanarak çalışmaya devam edecektir.

---

## 🛠️ İlk Kurulum ve Veritabanı Seed (Tohumlama)

Veritabanını ilk kez oluşturduğunuzda içi boş olacaktır. Yönetici hesabı, varsayılan ayarlar ve ilk personelin otomatik olarak kurulması için görsel bir **Setup** sayfası geliştirdik.

1. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```
2. Tarayıcınızda şu adresi açın:
   ```
   http://localhost:3000/setup
   ```
3. Açılan sayfadaki **"Kurulumu Başlat"** butonuna basarak işlemi başlatın. Kurulum günlüklerini canlı olarak takip edebilirsiniz.
4. Bu işlem sonucunda:
   - **Yönetici Hesabı**: `admin@holycon.com` (Şifre: `admin123456`) Firebase Auth sistemine eklenir.
   - **İlk Personel**: `Eren` isminde ve `1234` PIN koduna sahip personel Firestore `staff` koleksiyonuna eklenir.
   - **Ayarlar**: 10 pul gereksinimi ve varsayılan kahve ödülü ayarları `settings/main` altına yazılır.

---

## 📱 Rol ve Sayfa Yapısı

### 1. Müşteri Ekranı (`/card`)
- Müşteriler masadaki/kasadaki QR kodu tarattığında bu sayfaya gelirler.
- Telefon numaraları ve isimleriyle kolayca kayıt olurlar.
- Topladıkları kahve pullarını interaktif ve şık fincan ikonlarıyla takip ederler.
- 10 pul dolduğunda kasada personele göstermek üzere 10 dakika geçerli olan tek seferlik 6 haneli bir doğrulama kodu üretirler.
- Müşteriler kendi referans linklerini (`?ref=KOD`) paylaşarak arkadaşlarını davet edebilir ve ödül pulu kazanabilirler.

### 2. Personel Ekranı (`/staff`)
- Personel kendi 4 haneli PIN koduyla (Örn: `1234`) giriş yapar.
- Müşterinin telefon numarasını yazarak anında pul verebilir.
- Müşterinin telefonunda ürettiği 6 haneli ödül kodunu buraya yazarak doğrular ve müşterinin pullarını sıfırlayarak ikram kahvesini teslim eder.

### 3. Yönetici Paneli (`/admin`)
- `admin@holycon.com` / `admin123456` bilgileriyle giriş yapılır.
- **Dashboard**: Müşteri sayısı, toplam verilen pul, en aktif personeller ve detaylı grafikler.
- **Müşteriler**: Tüm müşteri listesi, pul miktarları, arama ve müşteri detayları.
- **Personel**: Yeni personel ekleme (4 haneli PIN belirleme), aktif/pasif yapma, personellerin performans takibi.
- **Kampanyalar**: WhatsApp, E-posta ve Push Bildirimleri ile müşterilere toplu mesaj gönderme. (İsteğe bağlı Claude AI desteği ile).
- **Ayarlar**: Gerekli pul sayısı, ödül açıklaması, Google Haritalar yorum linki ve QR kod indirme alanı.
  - *Google Maps Yorum Entegrasyonu*: Müşteriler kart ekranında Google Maps yorumu yapmaya teşvik edilir. 4-5 yıldız verenler doğrudan Google Haritalar yorum sayfasına yönlendirilirken, 1-3 yıldız arası düşük puanlar işletmenin kendisini geliştirebilmesi için sadece Firestore'a geri bildirim olarak kaydedilir.

---

## 📦 Dağıtım (Deployment)

Projeyi Vercel üzerinde tek tıkla canlıya alabilirsiniz:
1. Projenizi GitHub'a yükleyin.
2. Vercel'e gidin ve projeyi import edin.
3. `.env.local` dosyasındaki tüm değişkenleri Vercel ortam değişkenleri (Environment Variables) olarak ekleyin.
4. Firebase konsolunda **Authorized Domains** (Yetkilendirilmiş Alan Adları) listesine Vercel sitenizin adresini eklemeyi unutmayın (Authentication > Settings > Authorized domains).
