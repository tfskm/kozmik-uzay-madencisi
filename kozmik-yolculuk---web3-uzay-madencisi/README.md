# 🚀 Kozmik Yolculuk - Web3 Uzay Madencisi (Telegram Mini App)

Bu proje, Telegram üzerinde oynanabilen, Web3 cüzdan entegreli, aşama aşama gezegen keşifleri, ~6 ay amorti (ROI) süreli madenci paketleri, tamir sistemi, şans çarkı, pazar yeri ve gelişmiş bir Admin Yönetim Paneline sahip uzay temalı bir oyundur.

---

## 📋 Gereksinimler

- **Node.js**: v18.0 veya üzeri (v20+ tavsiye edilir)
- **npm** (veya pnpm / yarn)
- **Git**

---

## 🛠️ 1. Yerel Kurulum (Kendi Bilgisayarınızda Çalıştırma)

Projeyi indirdikten sonra terminali proje klasöründe açın:

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda açın:  
👉 **`http://localhost:3000`**

Projeyi canlıya hazırlamak (Production Build):
```bash
npm run build
```
Oluşturulan `dist` klasörü yayına hazırdır.

---

## 🌐 2. Ücretsiz ve Hızlı Canlıya Alma (Hosting)

Uygulamanın Telegram üzerinde açılabilmesi için **HTTPS** destekli bir adrese sahip olması gerekir.

### Seçenek A: Vercel (En Kolay & Ücretsiz)
1. Projeyi bir GitHub reponuza yükleyin (`git push`).
2. [Vercel.com](https://vercel.com) adresine giriş yapın.
3. **"Add New Project"** diyerek GitHub reponuzu seçin.
4. Framework Preset olarak **Vite** otomatik algılanır.
5. **Deploy** butonuna basın. 1 dakika içinde size ücretsiz bir URL verir (örn: `https://kozmik-madenci.vercel.app`).

### Seçenek B: Cloudflare Pages / Netlify
- Build command: `npm run build`
- Output directory: `dist`

---

## 🤖 3. Telegram Botu Olarak Entegre Etme (BotFather)

Oyununuzu Telegram'a bağlayıp kullanıcıların tek tıkla oynamasını sağlamak için:

1. Telegram'ı açın ve **[@BotFather](https://t.me/BotFather)** botunu bulun.
2. Bot oluşturun:
   - `/newbot` yazın.
   - Botunuz için bir isim girin (Örn: `Kozmik Madenci`).
   - Bot için kullanıcı adı belirleyin (Örn: `KozmikMadenci_bot`).
   - BotFather size bir **HTTP API Token** verecektir.
3. Mini App (Web App) bağlayın:
   - BotFather'a `/newapp` yazın.
   - Oluşturduğunuz botu seçin.
   - Bir başlık ve açıklama yazın.
   - 640x360 piksel boyutunda bir kapak görseli gönderin.
   - **Web App URL** sorulduğunda Vercel/canlı linkinizi yapıştırın:  
     `https://kozmik-madenci.vercel.app`
   - Bir kısa ad (short name) belirleyin (Örn: `play`).
4. Sohbet Menü Butonunu ayarlayın:
   - `/setmenubutton` yazın.
   - Botunuzu seçin ve menü butonuna canlı URL'nizi verin.
   - Buton metnini girin: `🚀 Oyna / Play`.
5. Artık botunuza gelen herkes menüdeki **"Oyna"** butonuna basarak oyunu doğrudan Telegram penceresinde oynayabilir!

---

## 🛡️ 4. Yönetim Paneli (Admin Console)

Oyunun sağ üst köşesinde veya alt menüde **"Yönetim Paneli"** butonu yer alır:
- **Kullanıcı Yönetimi**: Kullanıcıları görme, banlama/ban kaldırma, bakiye düzenleme (+/- USDT & Yıldız Tozu).
- **Paket Yönetimi**: Yeni paket ekleme sihirbazı (isim, gezegen, fiyat, günlük getiri, amorti gün sayısı, rozet), paketleri aktif/pasif yapma veya silme.
- **Çekim Kuyruğu**: Kullanıcıların talep ettiği çekimleri tek tıkla onaylama veya reddetme.
- **Ekonomi Ayarları**: Genel Telegram duyuru bandı düzenleme, min çekim limiti, komisyon oranı, tamir çarpanı ve bakım modu.

---

## 💳 5. Gerçek Web3 Ödemelerine Geçiş

Şu anda proje tarayıcı tabanlı güvenli bir Web3 ve simülasyon motoruyla çalışmaktadır.
İleride gerçek kripto yatırma/çekme işlemlerini otomatik blokzincir onayına bağlamak isterseniz:
- **TON Ağı için**: `@tonconnect/ui-react` SDK'sı ile Tonkeeper/Telegram cüzdan ödeme istekleri (payment payload) oluşturabilirsiniz.
- **USDT Ödemeleri için**: Cryptomus, NOWPayments veya OxaPay gibi kripto ödeme ağ geçitlerinin API webhook'larını entegre edebilirsiniz.
