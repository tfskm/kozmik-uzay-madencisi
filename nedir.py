📥 1. Projeyi Bilgisayarınıza İndirme
AI Studio Ekranından İndirme:
Ekranın sağ üst tarafındaki "Code" / Kod menüsünden veya üç nokta simgesinden "Download ZIP" (Projeyi İndir) seçeneğine tıklayarak tüm proje dosyalarını bilgisayarınıza .zip olarak indirin.
İndirdiğiniz zip dosyasını bir klasöre çıkartın (örn: kozmik-madenci).
💻 2. Kendi Bilgisayarınızda Çalıştırma (Lokal Kurulum)
Bilgisayarınızda Node.js (v18 veya v20+) kurulu olmalıdır.
Proje klasörünü açın ve terminalde şu komutları çalıştırın:
Bash
# Gerekli kütüphaneleri yükleyin
npm install

# Geliştirici sunucusunu başlatın
npm run dev
Tarayıcınızda açın:
👉 http://localhost:3000
🌐 3. İnternette Ücretsiz Yayınlama (Hosting)
Telegram Mini App'lerin çalışabilmesi için HTTPS olan bir web adresine ihtiyacı vardır. En kolay ve hızlı yöntem Vercel veya Cloudflare Pages kullanmaktır:
Vercel ile (Ücretsiz & 2 Dakikada):
Projenizi GitHub hesabınıza yükleyin (git init, git add ., git commit -m "ilk sürüm", git push).
Vercel.com adresine gidin ve GitHub ile giriş yapın.
"Add New Project" butonuna basıp reponuzu seçin.
Framework olarak otomatik Vite algılanır.
"Deploy" butonuna basın. Size anında ücretsiz bir HTTPS linki verecektir:
(Örnek: https://kozmik-madenci.vercel.app)
🤖 4. Telegram'a Bağlama (BotFather ile Mini App Yapma)
Oyununuzu Telegram kullanıcılarına ulaştırmak için:
Telegram uygulamanızda @BotFather botunu açın.
Botunuzu oluşturun:
/newbot yazın.
Bot adı girin (Örn: Kozmik Madenci).
Bot kullanıcı adı girin (Örn: KozmikMadenci_bot).
Mini App olarak kaydedin:
/newapp yazın ve az önce açtığınız botu seçin.
Başlık ve açıklama girin.
640x360 boyutunda bir kapak görseli yükleyin.
Web App URL sorulduğunda Vercel'deki canlı linkinizi yapıştırın (https://kozmik-madenci.vercel.app).
Kısa ad (short name) belirleyin (Örn: play).
Sohbet Menü Butonunu ayarlayın:
/setmenubutton yazın.
Botunuzu seçin, buton adını 🚀 Oyna yapın ve yine canlı linkinizi verin.
Artık hazır! Kullanıcılar botunuza girdiğinde alttaki "Oyna" butonuna basarak oyunu doğrudan Telegram içinden açıp oynayabilir.
🛡️ 5. Yönetim Paneli Kullanımı
Oyunu açtığınızda sağ üstteki veya alt bardaki "Yönetim Paneli" butonuna tıklayarak doğrudan yönetici konsoluna geçebilirsiniz.
Buradan kullanıcıları inceleyebilir, banlayabilir, bakiyelerine müdahale edebilir, yeni madenci paketleri oluşturabilir ve çekim taleplerini onaylayabilirsiniz.
Proje kök dizinine tüm bu rehberi içeren detaylı bir README.md dosyası da eklenmiştir.
Checkpoint
Suggestions
