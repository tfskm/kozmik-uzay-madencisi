# Kozmik Yolculuk – Web3 Uzay Madencisi (Telegram Mini App)

Sunucu destekli, TON cüzdanı ile KRD yüklenebilen uzay madenciliği oyunu.

## Ekonomi (önemli, lütfen okuyun)

- **KRD** ve **Yıldız Tozu** oyun içi para birimleridir. **Nakit değeri yoktur, nakde çevrilemez.**
- Gerçek para yalnızca **TON ile KRD yükleme** için kullanılır (dijital ürün satışı).
- **Çekim (withdraw) özelliği yoktur.** Bu bilinçli bir tercihtir.
- "Günlük % getiri" veya "amorti garantisi" gibi vaatler **yoktur**. Aşağıdaki oranlar oyun dengesi içindir, yatırım tavsiyesi değildir.

### Üretim matematiği

| Değer | Varsayılan |
|---|---|
| Paket günlük oranı (tam kondisyonda) | %0.6 (gezegen çarpanı hariç) |
| Gezegen çarpanı | ×1.00 → ×2.00 |
| Aşınma | Günde %1.0 – %1.7 (paket bazlı) |
| Madenci ömrü | 240 gün |
| Tamir (KRD) | Paket fiyatının %0.08'i / her %1 kondisyon |
| Tamir (Toz) | Paket fiyatının %5'i / her %1 kondisyon |
| 1 TON | 20 KRD (admin panelinden değiştirilebilir) |
| Minimum TON | 0.5 TON |
| Toz → KRD | 500 Toz = 1 KRD |
| Reaktör | +%5 üretim / seviye |
| Matkap | +%4 üretim / seviye |

Tam kondisyonda brüt geri dönüş yaklaşık **~167 gün**dür (1 / 0.006). Tamir ve aşınma bu süreyi uzatır.
Madenci 240 gün sonra emekli olur. Bu bir yatırım aracı değildir.

### Doğrulama

```bash
node server/sim.js
```

365 günlük, 800 oyuncuyla ekonomi simülasyonu çalıştırır (kaynak/yakım dengesi).

## Kurulum (yerel)

```bash
npm install
copy .env.example .env
npm start
```

`.env` içine şunları yazın:

- `BOT_TOKEN` → BotFather'dan aldığınız token
- `TREASURY_ADDRESS` → TON ödemelerinin gideceği cüzdan adresi
- `ADMIN_IDS` → yönetici Telegram ID'leri, virgülle (örn. `123456789,987654321`)
- `TONCENTER_URL` → test için `https://testnet.toncenter.com`, canlı için `https://toncenter.com`

Tarayıcıda Telegram olmadan test etmek için: `DEV=1 npm run server` (build aldıktan sonra).

## Yayına alma (Coolify)

1. GitHub'a push edin (bu adımı siz yapacaksınız).
2. Coolify'da yeni uygulama → GitHub deposu → **Dockerfile** seçin.
3. Ortam değişkenlerini girin: `BOT_TOKEN`, `TREASURY_ADDRESS`, `ADMIN_IDS`, `TONCENTER_URL`, `TONCENTER_KEY`, `PORT=3000`, `DB_PATH=/data/game.db`.
4. **Volume** ekleyin: `/data` (veritabanı kalıcı olsun diye).
5. Domaini HTTPS ile bağlayın.
6. BotFather → Bot Settings → Menu Button → Web App URL = domaininiz.

> TON Connect manifest sunucu tarafından otomatik üretilir: `https://domaininiz/tonconnect-manifest.json`.
> Cüzdan uygulamalarının ikonu görmesi için `public/assets/icon.png` dosyasını kendi logonuzla değiştirebilirsiniz (kare, en az 180×180 px).

## Admin paneli

- Alt menüdeki **Yönetim** sekmesi yalnızca `ADMIN_IDS` listesindeki kullanıcılara görünür.
- Panelden yönetilebilenler:
  - Duyuru metni ve bakım modu
  - TON → KRD kuru, minimum TON
  - Tamir maliyetleri, çark maliyeti, günlük Toz, Toz → KRD kuru
  - Paket fiyatları, günlük oranları, aşınma ve aktiflik
  - Gezegen kilit maliyetleri, çarpanlar, seviye şartları, günlük ödül serisi
  - Pazar stoğu
  - Oyuncu bakiyesi, ban ve sıfırlama

`ADMIN_IDS=*` yazarsanız herkes admin olur — **üretimde kullanmayın.**

## Akış

1. Oyuncu cüzdanını TON Connect ile bağlar.
2. TON gönderir; işlem yorumu `UID:<telegramId>` olarak eklenir.
3. Sunucu zinciri okur, işlem hash'ini tekilleştirir ve KRD'yi hesaba yazar.
4. Oyuncu KRD ile madenci paketi alır, üretim birikir, toplar, tamir eder.

## API

| Yöntem | Yol | Açıklama |
|---|---|---|
| GET | `/api/config` | Kasa adresi, kur, admin bilgisi |
| GET | `/api/whoami` | Kullanıcı ve admin durumu |
| GET | `/api/game` | Tam oyun durumu |
| POST | `/api/game/act` | Oyun aksiyonu |
| POST | `/api/claim-deposit` | Onaylanan TON ödemesini KRD'ye çevir |
| POST | `/api/wallet` | Cüzdan adresini kaydet |
| GET | `/api/admin/state` | Admin panel verisi (admin) |
| POST | `/api/admin/settings` | Ayar güncelle (admin) |
| POST | `/api/admin/catalog` | Paket güncelle (admin) |
| POST | `/api/admin/player` | Oyuncu düzenle (admin) |
| POST | `/api/admin/stock` | Pazar stoğu (admin) |

## Teknik notlar

- Ekonomi **sunucu otoriterdir**. İstemci yalnızca görüntüler; bakiye istemcide hesaplanmaz.
- Veritabanı: SQLite (`better-sqlite3`). Yedeklemek için `game.db` dosyasını kopyalayın.
- `npm start` = `vite build && node server/index.js`.
