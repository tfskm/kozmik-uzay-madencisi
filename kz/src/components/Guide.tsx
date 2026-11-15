import React from 'react';
import { useGame } from '../context/GameContext';
import {
  Map, Coins, Sparkles, Pickaxe, Rocket, Shield, Zap, Wrench, CalendarDays,
  TrendingUp, TrendingDown, Target, ShoppingBag, Gem, Users, Info, CheckCircle2
} from 'lucide-react';

const Section: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode; tone?: string }> = ({ icon: Icon, title, children, tone = 'border-cyan-500/30' }) => (
  <div className={`bg-[#083546]/90 border ${tone} rounded-2xl p-4 space-y-2`}>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-[#052430] border border-cyan-500/30 flex items-center justify-center text-cyan-300">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-sm font-black text-white font-display">{title}</h3>
    </div>
    <div className="text-xs text-teal-100/85 space-y-1.5 leading-relaxed">{children}</div>
  </div>
);

const Row: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent = 'text-white' }) => (
  <div className="flex items-center justify-between gap-3 bg-[#052430]/70 border border-teal-500/20 rounded-lg px-2.5 py-1.5">
    <span className="text-teal-200/80">{label}</span>
    <span className={`font-mono font-bold ${accent} text-right`}>{value}</span>
  </div>
);

export const Guide: React.FC = () => {
  const { adminSettings, serverMeta } = useGame();
  const dailyKrd = [1, 1, 2, 2, 2, 3, 3];
  const dailyToz = serverMeta?.dailyStardust ?? adminSettings.dailyStardust ?? 50;

  return (
    <div className="space-y-4 pb-24">
      <div className="bg-gradient-to-r from-[#0d3f4f] via-[#094857] to-[#0a3b4a] border border-cyan-400/40 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
          <Map className="w-4 h-4" /> Yol Haritası & Rehber
        </div>
        <h2 className="text-xl font-black text-white font-display mt-0.5">Oyunu Baştan Sona Anla</h2>
        <p className="text-xs text-teal-100/80 mt-1">
          Para birimleri, kazanç/kayıp, günlük işler, ekipman ve oyun içi yolculuk — hepsi adım adım.
        </p>
      </div>

      <Section icon={Info} title="1) Para Birimleri (Ne Neydir?)" tone="border-emerald-500/30">
        <p><strong className="text-emerald-300">KRD:</strong> Oyun içi ana para birimidir. Madenciler üretir, markette ve paketlerde harcanır. Belirlenen limit ve kurallara ulaşan kazançlar, admin onayıyla <strong className="text-cyan-300">TON (Gram)</strong> olarak çekilebilir.</p>
        <p><strong className="text-amber-300">Yıldız Tozu (Toz):</strong> Oyun içi yardımcı para birimidir. Arenada (yıldız/kristal/taş) kazanılır, günlük ödülle gelir; tamirde veya çarkta kullanılabilir, KRD'ye çevrilebilir.</p>
        <p><strong className="text-cyan-300">TON (Gram):</strong> Gerçek kripto varlıktır. Oyun içine KRD yüklemek ve (uygun koşullarda) onaylı çekim almak için kullanılır.</p>
        <p><strong className="text-sky-300">Arenadaki "puan":</strong> Topladığın/kırdığın ödüller Yıldız Tozu olarak hesabına eklenir (aktivite limiti vardır).</p>
      </Section>

      <Section icon={CalendarDays} title="2) Günlük Görevler ve Düzenli Kazanç" tone="border-amber-500/30">
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Günlük ödül al:</strong> Her gün giriş ödülünü topla (7 günlük seri). Seri: {dailyKrd.join(' / ')} KRD + {dailyToz} Toz.</li>
          <li><strong>Madenci hasadını topla:</strong> Madencilerin zamanla KRD biriktirir; "Topla" ile bakiyene al.</li>
          <li><strong>Arenada oyna:</strong> Yıldız/kristal topla, uygun silahla taş kır, korsan avı yap → Toz kazan.</li>
          <li><strong>Bakım yap:</strong> Düşen dayanıklılığı tamir et ki üretim azalmasın.</li>
        </ul>
      </Section>

      <Section icon={Users} title="3) Mürettebat / Filo (Madenciler) — KRD Üretimi" tone="border-teal-500/30">
        <p>Madencilik paketleri filona eklenen <strong>mürettebat/makine</strong> birimleridir; pasif olarak KRD üretirler.</p>
        <Row label="Tam kondisyonda üretim" value="~%0.9 / gün (gezegen çarpanı hariç)" accent="text-emerald-300" />
        <Row label="Dayanıklılık (aşınma)" value="Her gün azalır → üretim düşer" accent="text-amber-300" />
        <Row label="Ömür" value="240 gün" accent="text-cyan-300" />
        <Row label="Tamir" value="KRD veya Yıldız Tozu ile yapılır" accent="text-orange-300" />
        <p className="pt-1">Gezegen çarpanı, reaktör/matkap yükseltmeleri ve dayanıklılık üretimi etkiler. KRD bir yatırım getirisi garantisi değildir.</p>
      </Section>

      <Section icon={Target} title="4) Arenada Yolculuk (Roket, Silah, Kalkan, Taş)" tone="border-sky-500/30">
        <p><strong>Hareket:</strong> Roketi yukarı-aşağı sürükleyerek yıldız/kristal topla veya taşlardan kaç.</p>
        <p><strong>Silah:</strong> Ateş etmek için silah gerekir (yoksa "SİLAH YOK"). Sev.N silah, Sev.1–N taşları kırar ve ödül verir. Seviye yetersizse "YETERSİZ SİLAH SEVİYESİ" yazar.</p>
        <p><strong>Kalkan:</strong> Sev.N kalkan, Sev.1–N taşları durdurur. Taş kalkanın dış çizgisinde patlar → <span className="text-cyan-300">hasar engellenir</span> (ekstra puan vermez). Kalkanın ömrü vardır, çarptıkça tükenir. Yetersiz/tükenmişse gövde hasarı olur.</p>
        <div className="grid grid-cols-1 gap-1 pt-1">
          <Row label="Taş Sev.1" value="-%6 hasar • +10 ödül" accent="text-rose-300" />
          <Row label="Taş Sev.2" value="-%10 hasar • +20 ödül" accent="text-rose-300" />
          <Row label="Taş Sev.3" value="-%15 hasar • +35 ödül" accent="text-rose-300" />
          <Row label="Taş Sev.4" value="-%22 hasar • +55 ödül" accent="text-rose-300" />
          <Row label="Taş Sev.5" value="-%30 hasar • +80 ödül" accent="text-rose-300" />
        </div>
      </Section>

      <Section icon={TrendingUp} title="5) Kazançlar (Ne Nereden Gelir?)" tone="border-emerald-500/30">
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Madenci üretimi:</strong> Sürekli KRD (hasatla toplarsın).</li>
          <li><strong>Günlük ödül:</strong> KRD + Toz (7 günlük seri).</li>
          <li><strong>Arena:</strong> Yıldız/kristal toplama, taş kırma, kalkanla engelleme, korsan avı → Yıldız Tozu.</li>
          <li><strong>Şans:</strong> Çark ve sandıklardan KRD/Toz/ek ödüller çıkabilir.</li>
          <li><strong>Dönüşüm:</strong> Yıldız Tozu → KRD (kur: markette belirtilir).</li>`r`n          <li><strong>Çekim:</strong> Limit/koşulları sağlayan KRD, admin belirlediği kurla TON (Gram) olarak talep edilir; admin onayı gerekir.</li>
        </ul>
      </Section>

      <Section icon={TrendingDown} title="6) Kayıplar / Giderler (Ne Azaltır?)" tone="border-rose-500/30">
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Madenci aşınması:</strong> Günlük dayanıklılık düşer, üretim azalır (tamir gerekir).</li>
          <li><strong>Tamir maliyeti:</strong> KRD veya Yıldız Tozu harcanır.</li>
          <li><strong>Taş çarpması:</strong> Kalkan yok/yetersizse madenci dayanıklılığına hasar gelir.</li>
          <li><strong>Harcamalar:</strong> Ekipman, gezegen açma, yükseltme, çark/sandık KRD veya Toz tüketir.</li>
          <li><strong>Risk:</strong> Tüm ödüller oyun içidir; gelir/kazanç garantisi yoktur.</li>
        </ul>
      </Section>

      <Section icon={ShoppingBag} title="7) Pazar, Paketler ve İndirimler" tone="border-fuchsia-500/30">
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Tekli alım:</strong> Roket, silah, kalkan ve destek ürünlerini ayrı ayrı alabilirsin.</li>
          <li><strong>Set (paket) alımı:</strong> Birden fazla ürünü birlikte alırsın; toplam fiyat tek tek alımdan <span className="text-emerald-300 font-bold">indirimli</span> olur.</li>
          <li><strong>Destek:</strong> Toz→KRD çevirme ve sarf malzemeleri markettedir.</li>
        </ul>
      </Section>

      <Section icon={CheckCircle2} title="8) Yeni Oyuncu Yol Haritası (Adım Adım)" tone="border-cyan-500/30">
        <ol className="list-decimal pl-4 space-y-1.5">
          <li><strong>Başla:</strong> Günlük ödülünü al. Başlangıç roketin (S1) hazırdır.</li>
          <li><strong>İlk kazanç:</strong> Arenada roketi yukarı-aşağı hareket ettir; silahın yoksa yıldız/kristal topla ve taşlardan kaç.</li>
          <li><strong>İlk ekipman:</strong> Biriktirdiğinle silah ve kalkan al (veya indirimli set). Seviyeyi taşa göre seç.</li>
          <li><strong>Mürettebat kur:</strong> Madenci paketi al → KRD üretmeye başlar. Hasadı düzenli topla.</li>
          <li><strong>Bakım & büyüme:</strong> Madencileri tamir et, yükseltmeler yap, yeni gezegenler aç.</li>
          <li><strong>İlerle:</strong> Daha güçlü roket/silah/kalkan al; büyük taşları kır, kalkanla engelle, ödülü artır.</li>
          <li><strong>Düzenli oyna:</strong> Günlük ödül + hasat + arena döngüsünü sürdür; harcamalarını kazancına göre dengele.</li>
        </ol>
      </Section>

      <Section icon={Gem} title="Hızlı Özet" tone="border-white/20">
        <p><strong>KRD:</strong> üret, harca; koşulları sağlayan kazanımı admin onayıyla TON (Gram) çekebilirsin. <strong>Toz:</strong> arena/günlük kazan, dönüştür/harca. <strong>Mürettebat:</strong> madenciler KRD üretir ama aşınır. <strong>Arena:</strong> silahla kır, kalkanla engelle, yoksa kaç/topla.</p>
      </Section>
    </div>
  );
};