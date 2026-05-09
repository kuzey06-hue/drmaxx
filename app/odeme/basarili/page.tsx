"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OdemeBasariliPage() {
  const [orderNo, setOrderNo] = useState("");

  useEffect(() => {
    const no = localStorage.getItem("lastOrderNo") || "";
    setOrderNo(no);
    localStorage.removeItem("lastOrderNo");
  }, []);

  return (
    <main>
      <Navbar />
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-16">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          {/* Başarı ikonu */}
          <div className="relative inline-flex mb-8">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={40} className="text-green-500" strokeWidth={2.5} />
            </div>
            <div className="absolute -right-1 -top-1 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
              <Package size={14} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-3">Siparişiniz Alındı!</h1>
          <p className="text-gray-500 mb-2 leading-relaxed">
            Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanıp kargoya verilecektir.
          </p>
          {orderNo && (
            <div className="inline-block bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 mb-6">
              <span className="text-xs text-gray-500">Sipariş No: </span>
              <span className="text-sm font-black text-orange-600">{orderNo}</span>
            </div>
          )}

          <p className="text-xs text-gray-400 mb-8">
            Sipariş onayı e-posta adresinize gönderildi.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200">
              Anasayfaya Dön <ArrowRight size={15} />
            </Link>
            <Link href="/urunler"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm">
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
