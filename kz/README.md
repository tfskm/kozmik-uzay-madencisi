# Kozmik Yolculuk – Gerçek TON ödemeli sürüm

## Ekonomi (neden böyle?)
- KRD ve Yıldız Tozu **oyun içi** para birimidir; nakde çevrilemez. Çekim özelliği yoktur.
- Gerçek para yalnızca **TON ile Yıldız Tozu satın alma** için kullanılır (dijital ürün satışı).
- "Günlük % getiri / amorti" vaadi kaldırılmıştır. Bu tür vaatleri geri eklemeyin.

## Kurulum
1. `npm install`
2. `.env.example` → `.env` (BOT_TOKEN, TREASURY_ADDRESS)
3. `public/tonconnect-manifest.json` içindeki domaini kendi https adresinle değiştir, `public/assets/icon.png` ekle
4. `npm start` (build alır, sunucuyu başlatır; HTTPS arkasında çalıştır: Caddy/nginx/Coolify)
5. BotFather → Web App URL = site adresin. Önce testnet'te dene (TONCENTER_URL=https://testnet.toncenter.com).

## Akış
Cüzdan bağla → TON öde (yorum `UID:<telegramId>`) → sunucu zincirden okur, hash'i tekilleştirir →
istemci `/api/claim-stardust` ile bakiyeyi alır. Telegram imzası her istekte doğrulanır.

## Yapılmadı / sıradaki
- KRD ve diğer oyun durumu hâlâ cihazda (localStorage). Nakit değeri olmadığı için risk düşük, ama
  lider tablosu ve ödül için sunucuya taşınmalı (`/api/score`, `/api/leaderboard` hazır, arayüze bağlanmadı).
- AdminPanel simülasyon; kullanıcı/bakiye yönetimi sunucuya bağlanmalı.
- Satın alınan Yıldız Tozu cihazda tutulur (silinirse kaybolur) → sonraki adım: bakiyeyi sunucuda tutmak.

## Ekonomi motoru (server/economy.js) + simülatör
- `node server/sim.js` → 800 oyunculu, 365 günlük ekonomi simülasyonu (kaynak/yakım/oyuncu başı stok).
- API: `GET /api/game`, `POST /api/game/act` {type: buy|claim|repair|unlock|travel|daily}. Tüm hesap sunucuda.
- Bulgu: oyuncu madenci sınırına ulaşınca KRD biriktiriyor (enflasyon). Çözüm = sonsuz harcama kalemleri
  (üstel maliyetli yükseltmeler, yeni gezegenler/ekipman, sezon sıfırlama). Parametreler economy.js'te.

### Denge turu 2
Eklendi: Reaktör yükseltmesi (+%5 üretim, maliyet 40×1.5^seviye), gezegenle büyüyen slot sayısı, sahip olunan madenci sayısıyla artan satın alma maliyeti (%6 üstel), ölü madencinin temizlenmesi. API: `{type:'upgrade'}`.
Sonuç (sim.js): yakım/kaynak %68 → %86; toplam KRD stoku ~60-77K'da yatay (artık şişmiyor).
NOT: Bu denge yalnızca KRD hiçbir zaman nakde çevrilemezse geçerlidir.

### Denge turu 3
Matkap yükseltmesi eklendi (+%4 üretim, 60x1.55^seviye, API: {type:"drill"}). Sim: yakım/kaynak %89, toplam stok yıl sonunda düşüşte.

### Arayüz ↔ sunucu bağlantısı (tamamlandı)
GameContext artık `/api/game` ile konuşur: madenci satın alma/toplama/tamir, gezegen açma/gitme, Reaktör/Matkap ve günlük ödül sunucuda hesaplanır (15 sn'de bir senkron).
Olay/savaş/çark gibi yerel aktivite KRD kazancı sunucuya `activity` olarak bildirilir ve saatte 15 KRD ile sınırlanır.
Bilinen sınırlar: tamir yalnızca KRD ile; Pazar/Çark/Kutu harcamaları yerel kalır ve sonraki senkronda KRD'ye yansımaz; Admin panelinde eklenen paketler sunucu kataloğunda (server/catalog.json) yoksa alınamaz.

### Denge turu 4 (katalog paketleriyle)
Sim artık gerçek 8 paketi, gezegen kilidini ve slot sınırını kullanır. Başlangıç bakiyesi 40 KRD. Sonuç: yakım/kaynak %91, toplam stok ~40-52K yatay. `node server/sim.js`

### Pazar / Çark / Sandık sunucuda (tamamlandı)
- `server/shop.js`: çark (100 Yıldız Tozu/çevirme, beklenen ödül ≈ 60 ST + 0.7 KRD → net yakım), sandıklar (beklenen KRD ödülü fiyatın %55-80'i), pazar (stok tabloda, paylaşımlı).
- Yıldız Tozu artık sunucuda tutulur; TON ile alınan miktar `absorb()` ile oyuncu durumuna eklenir. Kur: 1 TON = 2000 Yıldız Tozu (`STARDUST_PER_TON`), böylece oyunda ücretsiz kazanılan Yıldız Tozu TON satışını değersizleştirmez.
- NOT: Para ile alınan para birimiyle şans (çark/sandık) mekaniği bazı ülkelerde "loot box" düzenlemesine girer; gerçek paraya geçmeden önce kontrol edin.
