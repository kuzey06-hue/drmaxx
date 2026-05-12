import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { XCircle, ArrowLeft, Phone } from "lucide-react";
import Link from "next/link";

export default function OdemeBasarisizPage() {
  return (
    <main>
      <Navbar />
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-16">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-8">
            <XCircle size={40} className="text-red-500" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-3">Ödeme Başarısız</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Ödemeniz tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar deneyebilir
            veya farklı bir ödeme yöntemi kullanabilirsiniz.
          </p>

          <div className="bg-gray-100 rounded-xl p-4 mb-8 text-sm text-gray-500 text-left space-y-1.5">
            <p className="font-semibold text-gray-700 mb-2">Sık karşılaşılan nedenler:</p>
            <p>• Kart limitinin yetersiz olması</p>
            <p>• Kart bilgilerinin hatalı girilmesi</p>
            <p>• Bankanın işlemi reddetmesi</p>
            <p>• İnternet bağlantısı sorunu</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/odeme"
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200">
              <ArrowLeft size={15} /> Tekrar Dene
            </Link>
            <Link href="/iletisim"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm">
              <Phone size={14} /> Destek Hattı
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
