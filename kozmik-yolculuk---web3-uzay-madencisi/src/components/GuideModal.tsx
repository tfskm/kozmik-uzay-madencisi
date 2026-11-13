import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Coins,
  Rocket,
  Shield,
  Pickaxe,
  Globe2,
  Gift,
  ShoppingBag,
  Wallet,
  Wrench,
  Flame,
  Award,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeGuideTab, setActiveGuideTab] = useState<
    'basics' | 'menus' | 'earnings' | 'voyage' | 'durability' | 'stepbystep'
  >('basics');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03141c]/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in">
      <div className="bg-gradient-to-b from-[#0a3848] via-[#08303e] to-[#062430] border border-cyan-400/50 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/70 overflow-hidden relative">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-teal-500/25 flex items-center justify-between bg-[#072d3b]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-display">
                Kozmik Madenci: Oyuncu Kılavuzu
              </h3>
              <p className="text-xs text-teal-100/70">
                Sıfırdan zirveye: çalışma mantığı, menüler ve kazanç mekanikleri
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="text-teal-200/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 p-2.5 sm:px-4 bg-[#05222d] border-b border-teal-500/20 overflow-x-auto no-scrollbar">
          {[
            { id: 'basics', label: '1. Temel Mantık', icon: Zap },
            { id: 'menus', label: '2. Menüler', icon: Globe2 },
            { id: 'earnings', label: '3. Kazanç & ROI', icon: Coins },
            { id: 'voyage', label: '4. Uzay Arenası', icon: Rocket },
            { id: 'durability', label: '5. Tamir & Aşınma', icon: Wrench },
            { id: 'stepbystep', label: '6. Adım Adım Başla', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeGuideTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveGuideTab(tab.id as typeof activeGuideTab);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-md font-black'
                    : 'bg-[#072c39] text-teal-200/75 hover:text-white border border-teal-500/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-teal-50/90 leading-relaxed font-sans">
          {/* TAB 1: BASICS */}
          {activeGuideTab === 'basics' && (
            <div className="space-y-4">
              <div className="bg-[#05222d] border border-cyan-500/30 rounded-2xl p-4">
                <h4 className="text-sm font-black text-cyan-300 font-display flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Oyunun Temel Amacı Nedir?
                </h4>
                <p className="text-teal-100/80 text-xs sm:text-sm">
                  Kozmik Madenci, oyuncuların kendi uzay madenciliği filosunu kurup farklı gezegenlerde madencilik yaparak düzenli pasif gelir elde ettiği, uzay arenasındaki uçuşlarda lazer ve manevralarla puan topladığı ve tüm kazanç/zarar parametrelerinin esnek olarak yönetilebildiği yeni nesil bir <strong>Web3 / Telegram Simülasyonudur</strong>.
                </p>
              </div>

              <h4 className="text-sm font-bold text-white font-display mt-2">
                💰 Oyundaki 4 Temel Değer Birimi:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-[#05202b] border border-emerald-400/30 rounded-2xl p-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    USDT (Tether)
                  </div>
                  <p className="text-[11px] text-teal-100/75 mt-1">
                    Ana likit varlığınızdır. Paket satın almakta, para çekme (Withdraw) ve yatırma işlemlerinde kullanılır. 1 USDT = $1.00 USD.
                  </p>
                </div>

                <div className="bg-[#05202b] border border-cyan-400/30 rounded-2xl p-3">
                  <div className="flex items-center gap-2 text-cyan-300 font-black text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Yıldız Tozu (Stardust)
                  </div>
                  <p className="text-[11px] text-teal-100/75 mt-1">
                    Madencilik hasatlarında bedava üretilen oyun içi cevherdir. Madenci tamirlerinde, pazar yeri takaslarında ve çarkta harcanır.
                  </p>
                </div>

                <div className="bg-[#05202b] border border-teal-400/30 rounded-2xl p-3">
                  <div className="flex items-center gap-2 text-teal-300 font-black text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                    Uçuş Puanı (Voyage Points)
                  </div>
                  <p className="text-[11px] text-teal-100/75 mt-1">
                    Uzay arenasında yıldız toplama (+10), kristal toplama (+50) ve korsan yok etme (+100) ile kazanılan puandır. Skorunuzu ve rütbenizi belirler.
                  </p>
                </div>

                <div className="bg-[#05202b] border border-amber-400/30 rounded-2xl p-3">
                  <div className="flex items-center gap-2 text-amber-300 font-black text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    TON (The Open Network)
                  </div>
                  <p className="text-[11px] text-teal-100/75 mt-1">
                    Telegram ekosisteminin yerel para birimidir. Cüzdan bağlantısıyla USDT veya TON olarak hızlı işlem yapılabilir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MENUS */}
          {activeGuideTab === 'menus' && (
            <div className="space-y-3">
              <p className="text-teal-200/80 text-xs">
                Uygulamanın alt navigasyonunda bulunan 6 ana menü ve üst bardaki yönetici paneli:
              </p>

              <div className="space-y-2">
                <div className="bg-[#05222d] border border-teal-500/25 rounded-2xl p-3">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-cyan-300">
                    <Pickaxe className="w-4 h-4 text-emerald-400" />
                    1. Madencilik (Mining & Space Flight)
                  </div>
                  <p className="text-[11px] text-teal-100/70 mt-1">
                    Ana oyun ve simülasyon ekranıdır. Geminizi uçurabilir, lazerle ateş edebilir, gerçek zamanlı biriken madencilik hasılatını <strong>"Hasılatı Topla"</strong> butonuyla kasanıza aktarabilirsiniz. Alttaki çekmecelerden filonuzu ve mevcut gezegeninizi görebilirsiniz.
                  </p>
                </div>

                <div className="bg-[#05222d] border border-teal-500/25 rounded-2xl p-3">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-cyan-300">
                    <ShoppingBag className="w-4 h-4 text-teal-400" />
                    2. Paketler (Mining Rigs Shop)
                  </div>
                  <p className="text-[11px] text-teal-100/70 mt-1">
                    Filonuza yeni madenci gemileri eklediğiniz mağazadır. Her paketin amorti süresi (günlük % getirisi), günlük USDT üretimi ve dayanıklılık tüketimi şeffafça listelenir.
                  </p>
                </div>

                <div className="bg-[#05222d] border border-teal-500/25 rounded-2xl p-3">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-cyan-300">
                    <Globe2 className="w-4 h-4 text-cyan-400" />
                    3. Gezegenler (Sector Map)
                  </div>
                  <p className="text-[11px] text-teal-100/70 mt-1">
                    Evrendeki farklı madencilik sektörleridir (Mars, Europa, Titan, Kepler, vb.). Her gezegenin kendine has bir <strong>Üretim Çarpanı</strong> (ör. 1.0x, 1.25x, 2.1x) vardır.
                  </p>
                </div>

                <div className="bg-[#05222d] border border-teal-500/25 rounded-2xl p-3">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-cyan-300">
                    <Gift className="w-4 h-4 text-amber-400" />
                    4. Şans Çarkı & Kutular (Fortune Wheel)
                  </div>
                  <p className="text-[11px] text-teal-100/70 mt-1">
                    Her gün verilen ücretsiz çevirme hakkı veya Yıldız Tozu ile çarkı çevirerek anında USDT, Yıldız Tozu veya gizemli uzay sandıkları kazanabilirsiniz.
                  </p>
                </div>

                <div className="bg-[#05222d] border border-teal-500/25 rounded-2xl p-3">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-cyan-300">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    5. Pazar Yeri & Takas (Marketplace)
                  </div>
                  <p className="text-[11px] text-teal-100/70 mt-1">
                    Topladığınız Yıldız Tozlarını doğrudan USDT'ye dönüştürebilir (Takas Standı) veya kalkan jeneratörü, lazer soğutucu ve madencilik çipi gibi özel güçlendiriciler satın alabilirsiniz.
                  </p>
                </div>

                <div className="bg-[#05222d] border border-teal-500/25 rounded-2xl p-3">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-cyan-300">
                    <Wallet className="w-4 h-4 text-cyan-300" />
                    6. Cüzdan & Finans (Wallet & Referral)
                  </div>
                  <p className="text-[11px] text-teal-100/70 mt-1">
                    Bakiye yatırma (Deposit), kişisel kripto cüzdanınıza para çekme (Withdraw), işlem geçmişinizi izleme ve %10 komisyonlu Telegram referans davet linkinizi kopyalama merkezidir.
                  </p>
                </div>

                <div className="bg-[#05222d] border border-rose-500/30 rounded-2xl p-3">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-rose-300">
                    <Shield className="w-4 h-4 text-rose-400" />
                    7. Yönetici Paneli (Admin Console - Üst Bardaki Buton)
                  </div>
                  <p className="text-[11px] text-teal-100/70 mt-1">
                    Bütün ekonomi ayarlarını, uzay arenasındaki puan/hasar katsayılarını, ürün geliş sıklıklarını, paketleri ve çekim onaylarını dinamik yönetme ekranıdır.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EARNINGS & ROI */}
          {activeGuideTab === 'earnings' && (
            <div className="space-y-4">
              <div className="bg-[#05222d] border border-teal-500/30 rounded-2xl p-4">
                <h4 className="text-sm font-black text-emerald-300 font-display mb-1">
                  📈 Pasif Madencilik Kazancı Nasıl Hesaplanır?
                </h4>
                <p className="text-xs text-teal-100/80 leading-relaxed">
                  Hesabınızdaki aktif madencilerin günlük üretimleri saniyelik olarak işler. Siz çevrimdışıyken bile üretim durmaz.
                </p>

                <div className="mt-3 bg-[#031720] p-3 rounded-xl border border-teal-500/20 font-mono text-xs space-y-1 text-teal-200">
                  <div><strong>Net Günlük Getiri</strong> = Paket Günlük Üretimi × Gezegen Çarpanı × (Kondisyon / 100)</div>
                  <div className="text-[11px] text-teal-300/70 mt-1">
                    Örnek: $100'lık bir madenci günlük $0.55 üretiyorsa ve 1.5x çarpanlı Kepler gezegeninde çalışıyorsa, tam kondisyonda günlük $0.825 USDT üretir.
                  </div>
                </div>
              </div>

              <div className="bg-[#05222d] border border-cyan-500/30 rounded-2xl p-4 space-y-2">
                <h4 className="text-sm font-black text-cyan-300 font-display">
                  ⏳ Amorti (ROI) Süresi Nedir?
                </h4>
                <p className="text-xs text-teal-100/80">
                  Paketin satın alma bedelinin tamamen geri kazanıldığı süredir. Sistemdeki paketler 120 gün ile 360 gün arasında amorti olacak şekilde dengelenmiştir. Amorti süresinden sonraki tüm üretimler net kârdır!
                </p>
              </div>

              <div className="bg-[#05222d] border border-amber-500/30 rounded-2xl p-4 space-y-2">
                <h4 className="text-sm font-black text-amber-300 font-display">
                  🤝 Referans Komisyonu
                </h4>
                <p className="text-xs text-teal-100/80">
                  Davet ettiğiniz arkadaşlarınızın topladığı madencilik hasılatlarından sistem size doğrudan <strong>%10 komisyon</strong> ve kayıt başına <strong>100 Yıldız Tozu</strong> hediye eder.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: VOYAGE */}
          {activeGuideTab === 'voyage' && (
            <div className="space-y-4">
              <div className="bg-[#05222d] border border-cyan-500/30 rounded-2xl p-4">
                <h4 className="text-sm font-black text-cyan-300 font-display mb-1">
                  🚀 Uzay Uçuşu & Savaş Arenası Kuralları
                </h4>
                <p className="text-xs text-teal-100/80 leading-relaxed">
                  Madencilik sekmesindeki tam ekran uzay arenasında geminizi fareyle veya dokunarak kontrol edebilirsiniz:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-[#05202b] border border-amber-400/30 rounded-xl p-3">
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    ⭐ Sarı Yıldızlar
                  </div>
                  <div className="text-[11px] text-teal-100/75 mt-1">
                    Geminize dokununca <strong>+10 Puan</strong> ve hafif enerji kazandırır.
                  </div>
                </div>

                <div className="bg-[#05202b] border border-cyan-400/30 rounded-xl p-3">
                  <div className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                    💎 Kozmik Kristaller
                  </div>
                  <div className="text-[11px] text-teal-100/75 mt-1">
                    Nadir çıkar. Dokununca <strong>+50 Puan</strong> ve kalkan yenilemesi sağlar.
                  </div>
                </div>

                <div className="bg-[#05202b] border border-rose-400/30 rounded-xl p-3">
                  <div className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                    🪨 Asteroitler
                  </div>
                  <div className="text-[11px] text-teal-100/75 mt-1">
                    Çarpışırsanız kalkanınıza hasar verir ve -20 Puan düşürür. Lazerle vurarak parçalayabilirsiniz!
                  </div>
                </div>

                <div className="bg-[#05202b] border border-purple-400/30 rounded-xl p-3">
                  <div className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                    🛸 Korsan Dronları
                  </div>
                  <div className="text-[11px] text-teal-100/75 mt-1">
                    Düşman gemileridir. <strong>"Ateş Et"</strong> butonu veya ekrana tıklayarak lazerle vurduğunuzda <strong>+100 Korsan Ödül Puanı</strong> verir.
                  </div>
                </div>
              </div>

              <div className="bg-[#031822] p-3 rounded-xl border border-teal-500/20 text-[11px] text-teal-200/80">
                ⚙️ <em>Not: Bütün bu puanlar, hasar miktarları ve nesnelerin geliş sıklığı Yönetici Panelinden anlık olarak değiştirilebilir.</em>
              </div>
            </div>
          )}

          {/* TAB 5: DURABILITY */}
          {activeGuideTab === 'durability' && (
            <div className="space-y-4">
              <div className="bg-[#05222d] border border-amber-500/30 rounded-2xl p-4">
                <h4 className="text-sm font-black text-amber-300 font-display mb-1">
                  🛠️ Madenci Kondisyonu & Bakım Hangarı
                </h4>
                <p className="text-xs text-teal-100/80 leading-relaxed">
                  Madenciler çalıştıkça gün başına hafif bir aşınmaya uğrar (örneğin günde %1.4). Kondisyon düştükçe madencinin üretim verimi de o oranda azalır.
                </p>
              </div>

              <div className="space-y-2">
                <div className="bg-[#05202b] border border-teal-500/25 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0">
                    ✨
                  </div>
                  <div>
                    <div className="text-xs font-bold text-cyan-300">Yıldız Tozu ile Bedava Tamir</div>
                    <div className="text-[11px] text-teal-100/75 mt-0.5">
                      Madencilik yaparken cebinizden para çıkmadan topladığınız Yıldız Tozlarını kullanarak madencinizi %100 kondisyona getirebilirsiniz.
                    </div>
                  </div>
                </div>

                <div className="bg-[#05202b] border border-teal-500/25 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                    💵
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400">USDT ile Hızlı Tamir</div>
                    <div className="text-[11px] text-teal-100/75 mt-0.5">
                      Yeterli tozunuz yoksa küçük bir miktar USDT ödeyerek anında filonuzu tamir edebilirsiniz.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: STEP BY STEP */}
          {activeGuideTab === 'stepbystep' && (
            <div className="space-y-3">
              <p className="text-teal-200/80 text-xs">
                Oyuna yeni başlayan bir oyuncunun izlemesi gereken en kazançlı 5 adım:
              </p>

              <div className="space-y-2.5">
                <div className="bg-[#05222d] border border-teal-500/25 rounded-2xl p-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-cyan-400/20 text-cyan-300 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Cüzdanınızı Bağlayın & Başlangıç Paketinizi İnceleyin</div>
                    <div className="text-[11px] text-teal-100/75 mt-0.5">
                      Üst bardaki "Cüzdan" butonuna tıklayarak Tonkeeper, MetaMask veya Phantom cüzdanınızı bağlayın.
                    </div>
                  </div>
                </div>

                <div className="bg-[#05222d] border border-teal-500/25 rounded-2xl p-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-cyan-400/20 text-cyan-300 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Günlük Ücretsiz Çarkınızı Çevirin</div>
                    <div className="text-[11px] text-teal-100/75 mt-0.5">
                      "Şans Çarkı" sekmesine giderek günlük ücretsiz şansınızı deneyin; bedava USDT ve Yıldız Tozu kazanın.
                    </div>
                  </div>
                </div>

                <div className="bg-[#05222d] border border-teal-500/25 rounded-2xl p-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-cyan-400/20 text-cyan-300 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Paket Satın Alarak Filonuzu Büyütün</div>
                    <div className="text-[11px] text-teal-100/75 mt-0.5">
                      "Paketler" sekmesinden bütçenize uygun madenci gemisini seçin ve günlük sabit getirinizi başlatın.
                    </div>
                  </div>
                </div>

                <div className="bg-[#05222d] border border-teal-500/25 rounded-2xl p-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-cyan-400/20 text-cyan-300 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Uzay Uçuşu Yapın & Madenleri Hasat Edin</div>
                    <div className="text-[11px] text-teal-100/75 mt-0.5">
                      "Madencilik" ekranında geminizi sürün, yıldızları ve kristalleri toplayarak puanınızı artırın; biriken hasılatı "Hasılatı Topla" ile cüzdanınıza aktarın.
                    </div>
                  </div>
                </div>

                <div className="bg-[#05222d] border border-teal-500/25 rounded-2xl p-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-cyan-400/20 text-cyan-300 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    5
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Kazançlarınızı Çekin veya Yeniden Yatırın</div>
                    <div className="text-[11px] text-teal-100/75 mt-0.5">
                      "Cüzdan" sekmesinden kazandığınız USDT'leri kişisel kripto adresinize anında çekebilir veya yeni madenciler alarak kartopu etkisiyle gelirinizi katlayabilirsiniz.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 sm:p-4 border-t border-teal-500/20 bg-[#05202b] flex items-center justify-between">
          <div className="text-[11px] text-teal-300/70">
            Tüm haklar saklıdır • Kozmik Madenci Web3 v2.4
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 shadow-md transition active:scale-95"
          >
            Anladım, Oyna!
          </button>
        </div>
      </div>
    </div>
  );
};
