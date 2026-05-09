import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Award, FlaskConical, Users, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Hakkımızda | DR.MAXX",
  description: "DR.MAXX, bilimsel formüllerle geliştirilmiş premium takviyeler üreten sağlık markasıdır.",
};

const values = [
  { icon: FlaskConical, title: "Bilimsel Formüller", desc: "Her ürünümüz, klinik araştırmalara dayanan formüllerle geliştirilmektedir." },
  { icon: Shield, title: "GMP Sertifikalı", desc: "Üretimimiz uluslararası GMP standartlarını karşılayan tesislerde gerçekleştirilir." },
  { icon: Award, title: "Doktor Onaylı", desc: "Ürünlerimiz uzman doktorlar ve beslenme uzmanlarından onay almaktadır." },
  { icon: Users, title: "Müşteri Odaklı", desc: "Sağlık yolculuğunuzda yanınızda olmak için 7/24 destek sunuyoruz." },
];

const milestones = [
  { year: "2018", text: "DR.MAXX markası İstanbul'da kuruldu." },
  { year: "2020", text: "GMP sertifikası alınarak üretim standartları uluslararası seviyeye çıkarıldı." },
  { year: "2022", text: "50.000'den fazla mutlu müşteriye ulaşıldı." },
  { year: "2024", text: "Ürün gamı genişletilerek 20+ premium takviye hayata geçirildi." },
  { year: "2026", text: "Türkiye'nin lider bilimsel takviye markası olma hedefine emin adımlarla ilerleniyor." },
];

export default function HakkimizdaPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <div className="bg-[#0A0F1E] py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-3">Hakkımızda</p>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            Bilimi Sağlığa<br />
            <span className="text-orange-500">Dönüştürüyoruz</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            DR.MAXX, 2018&apos;den bu yana bilimsel altyapılı formüllerle insanların daha sağlıklı,
            daha enerjik ve daha bilinçli bir yaşam sürmelerine destek olmaktadır.
          </p>
        </div>
      </div>

      {/* Misyon */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-3">Misyonumuz</p>
              <h2 className="text-3xl font-black text-gray-900 mb-6 leading-tight">
                Herkes İçin Erişilebilir<br />Premium Sağlık
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Amacımız, karmaşık bilimsel araştırmaları herkesin anlayabileceği ve hayatına
                kolayca entegre edebileceği ürünlere dönüştürmektir. Kaliteden ödün vermeden,
                şeffaf formülasyon anlayışımızla her bireyin sağlık potansiyelini en üst seviyeye
                çıkarmak istiyoruz.
              </p>
              <ul className="space-y-3">
                {["Şeffaf içerik listesi", "Bağımsız laboratuvar testleri", "Klinik destekli dozajlar", "Türkiye'de üretim"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-orange-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "50K+", label: "Mutlu Müşteri" },
                { num: "20+",  label: "Premium Ürün" },
                { num: "8+",   label: "Yıl Deneyim" },
                { num: "100%", label: "GMP Sertifikalı" },
              ].map(({ num, label }) => (
                <div key={label} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 text-center border border-orange-100">
                  <p className="text-3xl font-black text-orange-500">{num}</p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Değerlerimiz */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-3">Değerlerimiz</p>
            <h2 className="text-3xl font-black text-gray-900">Bizi Farklı Kılan Nedir?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tarihçe */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-3">Yolculuğumuz</p>
            <h2 className="text-3xl font-black text-gray-900">Tarihçemiz</h2>
          </div>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-px bg-orange-100" />
            <div className="space-y-8">
              {milestones.map(({ year, text }) => (
                <div key={year} className="flex gap-8 items-start">
                  <div className="w-16 flex-shrink-0 text-right">
                    <span className="text-sm font-black text-orange-500">{year}</span>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow-sm" />
                    <p className="text-gray-700 leading-relaxed pl-4">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
