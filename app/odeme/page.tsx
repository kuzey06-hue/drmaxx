"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Building2, User, Lock, ShoppingCart, AlertCircle, CreditCard, Ticket, Tag, X } from "lucide-react";
import { StackedProductImage } from "@/components/ui/StackedProductImage";
import { getQtyDiscountPercent } from "@/contexts/CartContext";

interface BankAccount {
  id: string; banka: string; hesapSahibi: string; iban: string;
  subeAdi?: string; hesapNo?: string; aciklama?: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

const STEPS = ["Bilgiler", "Teslimat", "Ödeme"];

export default function OdemePage() {
  const { items, subtotal, qtyDiscount, getEffectivePrice, clearCart } = useCart();
  const kargo = subtotal >= 300 ? 0 : 29.90;

  // Kupon state
  const [kuponKod, setKuponKod] = useState("");
  const [kuponLoading, setKuponLoading] = useState(false);
  const [kuponError, setKuponError] = useState<string | null>(null);
  const [kuponOK, setKuponOK] = useState<{ code: string; type: "percent" | "fixed"; value: number; discount: number } | null>(null);

  const indirim = kuponOK?.discount ?? 0;
  const toplam = Math.max(0, subtotal + kargo - indirim);

  const handleKuponUygula = async () => {
    if (!kuponKod.trim()) return;
    setKuponLoading(true);
    setKuponError(null);
    setKuponOK(null);
    const res = await fetch("/api/cms/kuponlar/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: kuponKod.trim(), orderTotal: subtotal + kargo }),
    });
    const data = await res.json();
    if (data.ok) {
      setKuponOK({ code: data.kupon.code, type: data.kupon.type, value: data.kupon.value, discount: data.discount });
    } else {
      setKuponError(data.error);
    }
    setKuponLoading(false);
  };

  const handleKuponKaldir = () => { setKuponOK(null); setKuponKod(""); setKuponError(null); };

  const [step, setStep] = useState(0);
  const [invoiceType, setInvoiceType] = useState<"bireysel" | "kurumsal">("bireysel");
  const [form, setForm] = useState({
    ad: "", soyad: "", email: "", telefon: "",
    tcKimlik: "", vergiNo: "", vergiDairesi: "", firmaAdi: "",
    adres: "", ilce: "", il: "", postaKodu: "",
  });

  // Ödeme yöntemi
  const [paymentMethod, setPaymentMethod] = useState<"kart" | "havale">("kart");

  // Banka hesapları (Havale/EFT)
  const [bankaActive, setBankaActive] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    fetch("/api/cms/banka")
      .then(r => r.json())
      .then(d => { setBankaActive(d.active ?? false); setBankAccounts(d.accounts ?? []); })
      .catch(() => {});
  }, []);

  // PayTR state
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [paytrError, setPaytrError] = useState<string | null>(null);
  const [currentOrderNo, setCurrentOrderNo] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  /* ────────── ADIM 1 → 2: sipariş oluştur + PayTR token al ────────── */
  const handleProceedToPayment = async () => {
    setLoadingPayment(true);
    setPaytrError(null);

    // Order number'ı hemen üret (Vercel dosya yazamasa bile çalışsın)
    const generatedOrderNo = `DM-${Date.now()}`;
    setCurrentOrderNo(generatedOrderNo);

    try {
      // 1. Siparişi kaydet (başarısız olsa da devam et)
      const orderRes = await fetch("/api/cms/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: `${form.ad} ${form.soyad}`,
          email: form.email,
          phone: form.telefon,
          address: `${form.adres}, ${form.ilce}/${form.il} ${form.postaKodu}`.trim(),
          invoiceType,
          tcKimlik:     invoiceType === "bireysel" ? form.tcKimlik    : undefined,
          vergiNo:      invoiceType === "kurumsal" ? form.vergiNo     : undefined,
          vergiDairesi: invoiceType === "kurumsal" ? form.vergiDairesi : undefined,
          firmaAdi:     invoiceType === "kurumsal" ? form.firmaAdi    : undefined,
          items: items.map(i => ({
            productId: i.id,
            productName: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          total: toplam,
          status: "Beklemede",
          paymentMethod: paymentMethod === "havale" ? "Havale/EFT" : "PayTR",
          kuponKod: kuponOK?.code ?? null,
          indirim: indirim,
          orderNo: generatedOrderNo,
        }),
      }).catch(() => null);

      const order = await orderRes?.json().catch(() => null);
      const finalOrderNo = order?.orderNo ?? generatedOrderNo;
      setCurrentOrderNo(finalOrderNo);

      // Kupon kullanım sayısını artır
      if (kuponOK) {
        fetch("/api/cms/kuponlar/validate", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: kuponOK.code }),
        }).catch(() => {});
      }

      // 2. PayTR token iste
      const tokenRes = await fetch("/api/paytr/get-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name:    `${form.ad} ${form.soyad}`,
          user_address: `${form.adres}, ${form.ilce}/${form.il}`,
          user_phone:   form.telefon || "05000000000",
          email:        form.email,
          merchant_oid: finalOrderNo,
          payment_amount: Math.round(toplam * 100), // kuruş
          basket: items.map(i => ({
            name: i.name,
            price: String(Math.round(i.price * 100)),
            quantity: i.quantity,
          })),
        }),
      });

      const tokenData = await tokenRes.json();

      if (tokenData.status === "success" && tokenData.token) {
        setPaytrToken(tokenData.token);
      } else {
        setPaytrError(tokenData.reason || "PayTR bağlantısı kurulamadı.");
      }
    } catch {
      setPaytrError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoadingPayment(false);
      setStep(2);
    }
  };

  /* ────────── Demo / test modu bypass ────────── */
  const handleDemoOrder = async () => {
    if (!currentOrderNo) return;
    setLoadingPayment(true);
    await fetch("/api/cms/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: currentOrderNo, status: "İşleniyor" }),
    });
    localStorage.setItem("lastOrderNo", currentOrderNo);
    clearCart();
    window.location.href = "/odeme/basarili";
  };

  /* ────────── Havale / EFT ile sipariş onayla ────────── */
  const handleHavaleOrder = async () => {
    if (!currentOrderNo) return;
    setLoadingPayment(true);
    // Havale siparişi "Beklemede" kalır — banka transferi bekleniyor
    localStorage.setItem("lastOrderNo", currentOrderNo);
    clearCart();
    window.location.href = "/odeme/basarili?havale=1";
  };

  // Boş sepet
  if (items.length === 0 && !currentOrderNo) {
    return (
      <main>
        <Navbar />
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Sepetinizde ürün bulunmuyor.</p>
            <Link href="/urunler" className="text-orange-500 font-semibold hover:underline">Ürünlere Git</Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-6">

          {/* Breadcrumb / adımlar */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8 flex-wrap">
            <Link href="/sepet" className="hover:text-gray-600 flex items-center gap-1">
              <ArrowLeft size={12} /> Sepet
            </Link>
            {STEPS.map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span className="text-gray-300">/</span>
                <span className={`font-semibold transition-colors ${i === step ? "text-orange-500" : i < step ? "text-gray-500" : "text-gray-300"}`}>{s}</span>
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            {/* ─── SOL FORM ─────────────────────────────────────── */}
            <div className="space-y-6">

              {/* ADIM 0: MÜŞTERİ BİLGİLERİ */}
              {step === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                  <h2 className="font-bold text-gray-900 text-lg">İletişim Bilgileri</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Ad" value={form.ad} onChange={set("ad")} placeholder="Adınız" />
                    <Field label="Soyad" value={form.soyad} onChange={set("soyad")} placeholder="Soyadınız" />
                    <Field label="E-posta" value={form.email} onChange={set("email")} placeholder="ornek@email.com" type="email" className="col-span-2" />
                    <Field label="Telefon" value={form.telefon} onChange={set("telefon")} placeholder="05XX XXX XX XX" className="col-span-2" />
                  </div>

                  {/* Fatura tipi */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">Fatura Türü</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(["bireysel", "kurumsal"] as const).map((type) => (
                        <button key={type} onClick={() => setInvoiceType(type)}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${invoiceType === type ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                          {type === "bireysel" ? <User size={18} className={invoiceType === type ? "text-orange-500" : "text-gray-400"} /> : <Building2 size={18} className={invoiceType === type ? "text-orange-500" : "text-gray-400"} />}
                          <div className="text-left">
                            <p className={`text-sm font-bold ${invoiceType === type ? "text-orange-600" : "text-gray-700"}`}>{type === "bireysel" ? "Bireysel" : "Kurumsal"}</p>
                            <p className="text-xs text-gray-400">{type === "bireysel" ? "TC Kimlik No ile" : "Vergi No ile"}</p>
                          </div>
                          {invoiceType === type && (
                            <div className="ml-auto w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center"><Check size={11} className="text-white" /></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {invoiceType === "bireysel" ? (
                    <Field label="TC Kimlik No" value={form.tcKimlik} onChange={set("tcKimlik")} placeholder="XXXXXXXXXXX" maxLength={11} />
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Firma Adı" value={form.firmaAdi} onChange={set("firmaAdi")} placeholder="Firma Unvanı" className="col-span-2" />
                      <Field label="Vergi No" value={form.vergiNo} onChange={set("vergiNo")} placeholder="0000000000" />
                      <Field label="Vergi Dairesi" value={form.vergiDairesi} onChange={set("vergiDairesi")} placeholder="Vergi Dairesi" />
                    </div>
                  )}

                  <button onClick={() => setStep(1)} disabled={!form.ad || !form.soyad || !form.email}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-40">
                    Devam Et <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* ADIM 1: TESLİMAT */}
              {step === 1 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                  <h2 className="font-bold text-gray-900 text-lg">Teslimat Adresi</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Adres</label>
                      <textarea value={form.adres} onChange={set("adres")} rows={3}
                        placeholder="Mahalle, cadde, sokak, bina/daire no"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-orange-400 focus:bg-white focus:outline-none resize-none" />
                    </div>
                    <Field label="İlçe" value={form.ilce} onChange={set("ilce")} placeholder="İlçe" />
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">İl</label>
                      <select value={form.il} onChange={set("il")} className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none">
                        <option value="">Seçin...</option>
                        {["İstanbul","Ankara","İzmir","Bursa","Antalya","Adana","Konya","Gaziantep","Mersin","Kayseri","Diğer"].map(il => <option key={il}>{il}</option>)}
                      </select>
                    </div>
                    <Field label="Posta Kodu" value={form.postaKodu} onChange={set("postaKodu")} placeholder="34XXX" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Geri</button>
                    <button onClick={handleProceedToPayment} disabled={!form.adres || !form.il || loadingPayment}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-40">
                      {loadingPayment ? (
                        <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Yükleniyor...</>
                      ) : (
                        <>Ödemeye Geç <ArrowRight size={16} /></>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ADIM 2: ÖDEME — PayTR iFrame veya Demo */}
              {step === 2 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                    <CreditCard size={18} className="text-orange-500" />
                    <h2 className="font-bold text-gray-900 text-lg">Ödeme</h2>
                    <Lock size={13} className="text-gray-300 ml-auto" />
                    <span className="text-xs text-gray-400">SSL Güvenli</span>
                  </div>

                  {/* ── Ödeme Yöntemi Seçici ── */}
                  <div className="px-6 pt-5 pb-1 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("kart")}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === "kart" ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${paymentMethod === "kart" ? "bg-orange-500" : "bg-gray-100"}`}>
                        <CreditCard size={16} className={paymentMethod === "kart" ? "text-white" : "text-gray-400"} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${paymentMethod === "kart" ? "text-orange-700" : "text-gray-700"}`}>Kredi / Banka Kartı</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Visa, Mastercard, Troy</p>
                      </div>
                    </button>

                    {bankaActive && bankAccounts.length > 0 && (
                      <button
                        onClick={() => setPaymentMethod("havale")}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === "havale" ? "border-gray-700 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${paymentMethod === "havale" ? "bg-gray-700" : "bg-gray-100"}`}>
                          <Building2 size={16} className={paymentMethod === "havale" ? "text-white" : "text-gray-400"} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${paymentMethod === "havale" ? "text-gray-900" : "text-gray-700"}`}>Havale / EFT</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{bankAccounts.length} hesap mevcut</p>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* ── KREDİ KARTI: PayTR iFrame ── */}
                  {paymentMethod === "kart" && (
                    <>
                      {paytrToken && (
                        <div className="p-4">
                          <iframe
                            src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
                            id="paytriframe"
                            frameBorder="0"
                            scrolling="no"
                            style={{ width: "100%", minHeight: 500 }}
                            onLoad={(e) => {
                              const iframe = e.currentTarget;
                              try {
                                const h = iframe.contentWindow?.document.body.scrollHeight;
                                if (h) iframe.style.height = h + "px";
                              } catch { /* cross-origin */ }
                            }}
                          />
                        </div>
                      )}

                      {!paytrToken && (
                        <div className="p-6 space-y-4">
                          {paytrError && (
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                              <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-amber-700">PayTR Bilgisi</p>
                                <p className="text-xs text-amber-600 mt-0.5">{paytrError}</p>
                                <p className="text-xs text-amber-500 mt-1">
                                  Canlıya geçmek için <strong>.env.local</strong> dosyasında PayTR kimlik bilgilerini doldurun.
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm font-bold text-blue-700 mb-1">🧪 Test / Demo Modu</p>
                            <p className="text-xs text-blue-600 leading-relaxed">
                              PayTR entegrasyonu için merchant bilgileri gereklidir. Şu an demo modunda sipariş oluşturabilirsiniz.
                              Sipariş <strong>#{currentOrderNo}</strong> sisteme kaydedildi.
                            </p>
                          </div>
                          <div className="border border-gray-100 rounded-xl p-4 space-y-3 text-sm text-gray-600">
                            <div className="flex justify-between"><span>Müşteri</span><span className="font-semibold">{form.ad} {form.soyad}</span></div>
                            <div className="flex justify-between"><span>E-posta</span><span className="font-semibold">{form.email}</span></div>
                            <div className="flex justify-between border-t border-gray-100 pt-3"><span className="font-bold">Toplam</span><span className="font-black text-orange-500 text-base">{fmt(toplam)}</span></div>
                          </div>
                          <button onClick={handleDemoOrder} disabled={loadingPayment}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50 shadow-lg shadow-orange-200">
                            {loadingPayment ? "İşleniyor..." : <><Check size={15} /> Siparişi Onayla (Demo)</>}
                          </button>
                          <button onClick={() => setStep(1)} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                            Geri Dön
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── HAVALE / EFT ── */}
                  {paymentMethod === "havale" && (
                    <div className="p-6 space-y-5">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nasıl Çalışır?</p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Aşağıdaki hesap bilgilerinden birine <strong>{fmt(toplam)}</strong> tutarında havale/EFT yapın.
                          Açıklama kısmına sipariş numaranızı <strong>({currentOrderNo ?? "…"})</strong> yazın.
                          Ödeme onaylandıktan sonra siparişiniz işleme alınacaktır.
                        </p>
                      </div>

                      {/* Banka hesap kartları */}
                      <div className="space-y-3">
                        {bankAccounts.map(acc => (
                          <div key={acc.id} className="rounded-xl border border-gray-200 overflow-hidden">
                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                              <Building2 size={15} className="text-gray-500 flex-shrink-0" />
                              <p className="text-sm font-bold text-gray-800">{acc.banka}</p>
                            </div>
                            <div className="p-4 space-y-2.5">
                              <BankRow label="Hesap Sahibi" value={acc.hesapSahibi} />
                              <BankRow label="IBAN" value={acc.iban} mono />
                              {acc.subeAdi && <BankRow label="Şube" value={acc.subeAdi} />}
                              {acc.hesapNo && <BankRow label="Hesap No" value={acc.hesapNo} mono />}
                              {acc.aciklama && (
                                <p className="text-[11px] text-orange-600 bg-orange-50 rounded-lg px-3 py-2 mt-1 font-medium">
                                  💡 {acc.aciklama}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Sipariş numarası vurgusu */}
                      <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                        <span className="text-xs font-semibold text-orange-600">Açıklamaya yazın:</span>
                        <span className="text-sm font-black text-orange-700 font-mono tracking-wider">{currentOrderNo ?? "..."}</span>
                      </div>

                      <button onClick={handleHavaleOrder} disabled={loadingPayment}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-bold transition-colors disabled:opacity-50 shadow-lg shadow-gray-300">
                        {loadingPayment ? "İşleniyor..." : <><Check size={15} /> Havale ile Sipariş Ver</>}
                      </button>
                      <button onClick={() => setStep(1)} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                        Geri Dön
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── SAĞ: SİPARİŞ ÖZETİ ─────────────────────────── */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4">Sipariş Özeti</h3>

                {/* Ürün listesi */}
                <div className="space-y-3 mb-4">
                  {items.map((item) => {
                    const effPrice = getEffectivePrice(item);
                    const discPct  = getQtyDiscountPercent(item.quantity);
                    return (
                      <div key={item.id} className="flex gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        {/* Ürün görseli — adet arttıkça şişe istiflenir */}
                        <div className="relative flex-shrink-0">
                          <StackedProductImage
                            image={item.image}
                            color={item.color}
                            name={item.name}
                            quantity={item.quantity}
                            className="w-[60px] h-[60px]"
                            sizes="60px"
                          />
                          {/* Adet rozeti */}
                          <span className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gray-800 text-white text-[9px] font-bold flex items-center justify-center z-10">
                            {item.quantity}
                          </span>
                        </div>

                        {/* Bilgi */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                          <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[11px] text-gray-400">{item.quantity} × {fmt(effPrice)}</p>
                            {discPct > 0 && (
                              <span className="text-[9px] font-bold px-1 py-0.5 rounded-full bg-green-100 text-green-700">
                                -%{discPct}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Satır toplamı */}
                        <p className="text-sm font-bold text-gray-900 flex-shrink-0 self-center">
                          {fmt(effPrice * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {/* Kupon girişi */}
                {step < 2 && (
                  <div className="mb-4">
                    {kuponOK ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-green-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-green-700 font-mono">{kuponOK.code}</p>
                            <p className="text-[10px] text-green-600">
                              {kuponOK.type === "percent" ? `%${kuponOK.value}` : `₺${kuponOK.value}`} indirim uygulandı
                            </p>
                          </div>
                        </div>
                        <button onClick={handleKuponKaldir} className="text-green-400 hover:text-red-500 transition-colors ml-2">
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-2">
                          <input
                            value={kuponKod}
                            onChange={e => { setKuponKod(e.target.value.toUpperCase()); setKuponError(null); }}
                            onKeyDown={e => e.key === "Enter" && handleKuponUygula()}
                            placeholder="Kupon kodu"
                            className="flex-1 h-9 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-mono uppercase placeholder:font-sans placeholder:normal-case placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none transition-all"
                          />
                          <button onClick={handleKuponUygula} disabled={kuponLoading || !kuponKod.trim()}
                            className="px-4 h-9 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold transition-colors disabled:opacity-40">
                            {kuponLoading ? "..." : "Uygula"}
                          </button>
                        </div>
                        {kuponError && (
                          <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                            <AlertCircle size={11} /> {kuponError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  {qtyDiscount > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Liste Fiyatı</span>
                      <span className="line-through">{fmt(subtotal + qtyDiscount)}</span>
                    </div>
                  )}
                  {qtyDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span className="flex items-center gap-1"><Tag size={12} /> Adet İndirimi</span>
                      <span>-{fmt(qtyDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500"><span>Ara Toplam</span><span>{fmt(subtotal)}</span></div>
                  <div className="flex justify-between text-gray-500">
                    <span>Kargo</span>
                    <span className={kargo === 0 ? "text-green-500 font-semibold" : ""}>{kargo === 0 ? "Ücretsiz" : fmt(kargo)}</span>
                  </div>
                  {kuponOK && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <Ticket size={12} /> {kuponOK.code}
                      </span>
                      <span>-{fmt(indirim)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-gray-100">
                    <span>Toplam</span><span>{fmt(toplam)}</span>
                  </div>
                </div>
              </div>

              {/* Güven rozetleri */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                {[["🔒", "256-bit SSL güvenli ödeme"], ["↩️", "14 gün içinde kolay iade"], ["🚚", "300₺ üzeri ücretsiz kargo"]].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-2.5 py-2 text-xs text-gray-500 border-b border-gray-50 last:border-0">
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function BankRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide w-20 flex-shrink-0">{label}</span>
      <span className={`text-sm text-gray-800 font-semibold ${mono ? "font-mono tracking-wide" : ""} select-all`}>{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", className = "", maxLength }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; className?: string; maxLength?: number;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength}
        className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none" />
    </div>
  );
}
