"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import {
  ShoppingCart, Heart, ChevronRight, Check,
  ShieldCheck, Truck, RotateCcw, Star, Minus, Plus, FlaskConical
} from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/ui/ProductCard";
import { Badge } from "@/components/ui/Badge";

const TABS = ["Açıklama", "İçerikler", "Kullanım", "Yorumlar"] as const;
type Tab = (typeof TABS)[number];

const TRUST = [
  { icon: ShieldCheck, label: "GMP Sertifikalı", desc: "Uluslararası standartlarda üretim" },
  { icon: FlaskConical, label: "Klinik Destekli", desc: "Bilimsel çalışmalarla kanıtlanmış" },
  { icon: Truck, label: "Hızlı Teslimat", desc: "Aynı gün kargo imkânı" },
  { icon: RotateCcw, label: "İade Garantisi", desc: "30 gün içinde koşulsuz iade" },
];

const REVIEWS = [
  { name: "Merve A.", date: "Mart 2025", rating: 5, text: "Gerçekten çok etkili. 3 hafta içinde fark ettim. Kesinlikle tavsiye ediyorum." },
  { name: "Ahmet Y.", date: "Şubat 2025", rating: 5, text: "Kalitesi çok yüksek, içerik listesi şeffaf. Bir daha sipariş vereceğim." },
  { name: "Selin K.", date: "Ocak 2025", rating: 4, text: "İyi bir ürün, paketleme de çok özenli. Etkilerini hissettim." },
];

interface Props {
  product: Product;
  related: Product[];
}

export function ProductDetail({ product, related }: Props) {
  const { addItem } = useCart();

  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Açıklama");
  const [imgError, setImgError] = useState(false);

  const hasImage = !!product.image && !imgError;
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  function handleAddToCart() {
    addItem({
      id:    String(product.id),
      slug:  product.slug,
      name:  product.name,
      price: product.price,
      image: product.image,
      color: product.color ?? "#F97316",
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-orange-500 transition-colors">Anasayfa</Link>
          <ChevronRight size={12} />
          <Link href="/" className="hover:text-orange-500 transition-colors">Ürünler</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600 font-medium truncate">{product.name}</span>
        </div>
      </div>

      {/* Ana ürün alanı */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">

          {/* Sol — Görsel */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            {/* Ana görsel */}
            <div
              className="relative rounded-3xl overflow-hidden flex items-center justify-center aspect-square"
              style={{
                background: `linear-gradient(135deg, ${product.color}12 0%, ${product.color}25 100%)`,
              }}
            >
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge label={product.badge} />
                </div>
              )}
              {discount && (
                <div className="absolute top-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                  -{discount}%
                </div>
              )}
              {hasImage ? (
                <Image
                  src={product.image!}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => setImgError(true)}
                  priority
                />
              ) : (
                <div
                  className="w-48 h-64 rounded-2xl flex flex-col items-center justify-center text-white font-bold shadow-xl"
                  style={{ background: `linear-gradient(160deg, ${product.color}, ${product.color}cc)` }}
                >
                  <span className="text-xs tracking-widest opacity-70 mb-2">DR.MAXX</span>
                  <span className="text-center px-4 text-sm leading-snug">{product.name}</span>
                </div>
              )}
            </div>

            {/* Trust badges — sadece masaüstünde */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {TRUST.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 px-4 py-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <Icon size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{label}</p>
                    <p className="text-[10px] text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sağ — Bilgi */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* Kategori + Ad */}
            <div>
              <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-500 mb-3">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2">
                {product.name}
              </h1>
              <p className="text-sm text-gray-400">{product.quantity}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviewCount} yorum)</span>
            </div>

            {/* Kısa açıklama */}
            {product.shortDesc && (
              <p className="text-gray-600 leading-relaxed text-sm border-l-2 border-orange-200 pl-4">
                {product.shortDesc}
              </p>
            )}

            {/* Faydalar */}
            {product.benefits && (
              <ul className="flex flex-col gap-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-50 mt-0.5">
                      <Check size={11} className="text-green-600" strokeWidth={2.5} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {/* Fiyat */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-300 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Miktar + Sepet */}
            <div className="flex flex-col gap-3">
              {/* Adet */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Adet:</span>
                <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-gray-900">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all ${
                    added
                      ? "bg-green-500 text-white"
                      : "bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98]"
                  }`}
                >
                  {added ? (
                    <><Check size={16} /> Sepete Eklendi!</>
                  ) : (
                    <><ShoppingCart size={16} /> Sepete Ekle</>
                  )}
                </button>
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white transition-all hover:border-rose-200"
                >
                  <Heart
                    size={18}
                    className={wishlisted ? "fill-rose-500 text-rose-500" : "text-gray-400"}
                  />
                </button>
              </div>
            </div>

            {/* Trust badges — mobilde */}
            <div className="grid grid-cols-2 gap-2 lg:hidden">
              {TRUST.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                  <Icon size={13} className="text-orange-500 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tab alanı */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 bg-white rounded-3xl border border-gray-100 overflow-hidden"
        >
          {/* Tab başlıkları */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === tab ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab içerikleri */}
          <div className="p-6 md:p-8">
            {activeTab === "Açıklama" && (
              <div className="flex flex-col gap-5 text-gray-600 text-sm leading-relaxed">
                <p>{product.shortDesc}</p>
                <p className="text-gray-400">{product.description}</p>
                {/* Nereden bulunur */}
                <div className="flex items-start gap-3 rounded-2xl bg-blue-50 border border-blue-100 px-5 py-4">
                  <span className="text-lg mt-0.5">🏪</span>
                  <div>
                    <p className="font-semibold text-blue-800 text-sm mb-0.5">Nereden Bulunur?</p>
                    <p className="text-blue-700/70 text-xs leading-relaxed">Ürünlerimizi tüm eczanelerden temin edebilirsiniz.</p>
                  </div>
                </div>
                {/* Sağlık beyanı */}
                <p className="text-xs text-gray-400 border border-gray-100 rounded-xl px-4 py-3 leading-relaxed">
                  ⚕️ İlaç değildir. Takviye edici gıdalar normal beslenmenin yerine geçemez. Hastalıkların önlenmesi veya tedavi edilmesi amacıyla kullanılmaz.
                  {product.approvalNo && <> Onay No: <strong>{product.approvalNo}</strong></>}
                  {product.barcode && <> · Barkod: <strong>{product.barcode}</strong></>}
                </p>
              </div>
            )}

            {activeTab === "İçerikler" && (
              <div className="flex flex-col gap-6">
                {/* Doz tablosu */}
                {product.ingredientTable ? (
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Etken Madde Tablosu</h3>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            {product.ingredientTableHeaders ? (
                              product.ingredientTableHeaders.map((h, i) => (
                                <th key={i} className={`px-4 py-3 font-semibold text-gray-700 text-xs whitespace-nowrap ${i === 0 ? "text-left" : "text-center"}`}>{h}</th>
                              ))
                            ) : (
                              <>
                                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs">Etken Madde</th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-700 text-xs whitespace-nowrap">1 Kapsül</th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-700 text-xs whitespace-nowrap">2 Kapsül</th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-700 text-xs">BRD*</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {product.ingredientTable.map((row, i) => (
                            <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                              <td className={`px-4 py-2.5 text-xs ${row.name.startsWith("  —") ? "pl-7 text-gray-400" : "font-medium text-gray-800"}`}>
                                {row.name.replace("  — ", "— ")}
                              </td>
                              {/* Nitelik + günlük doz (3 sütun: Resveratrol tipi) */}
                              {row.nitelik !== undefined ? (
                                <>
                                  <td className="px-4 py-2.5 text-xs text-center text-gray-500">{row.nitelik}</td>
                                  <td className="px-4 py-2.5 text-xs text-center font-semibold text-gray-800">{row.dailyDose}</td>
                                </>
                              ) : row.dailyDose !== undefined && row.brd !== undefined ? (
                                /* Günlük doz + BRD (3 sütun: Phospholipid tipi) */
                                <>
                                  <td className="px-4 py-2.5 text-xs text-center font-semibold text-gray-800">{row.dailyDose}</td>
                                  <td className="px-4 py-2.5 text-xs text-center text-gray-400">{row.brd}</td>
                                </>
                              ) : row.dailyDose !== undefined ? (
                                /* Sadece günlük doz (2 sütun: Karagen tipi) */
                                <td className="px-4 py-2.5 text-xs text-center font-semibold text-gray-800">{row.dailyDose}</td>
                              ) : (
                                /* 1 kapsül / 2 kapsül / BRD (4 sütun: Sitikolin tipi) */
                                <>
                                  <td className="px-4 py-2.5 text-xs text-center text-gray-600">{row.dose1}</td>
                                  <td className="px-4 py-2.5 text-xs text-center font-semibold text-gray-800">{row.dose2}</td>
                                  <td className="px-4 py-2.5 text-xs text-center text-gray-400">{row.brd ?? "**"}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 px-1">
                      BRD: Beslenme Referans Değeri Yoktur.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {(product.ingredients ?? [product.description]).map((ing, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                        <div className="h-2 w-2 rounded-full bg-orange-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{ing}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Besin öğeleri ham liste */}
                {product.ingredientNote && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-600 mb-2">Besin Öğeleri</h3>
                    <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">
                      {product.ingredientNote}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Kullanım" && (
              <div className="flex flex-col gap-4">
                {/* Kullanım */}
                <div className="rounded-2xl bg-orange-50 border border-orange-100 p-5">
                  <h3 className="text-sm font-bold text-orange-700 mb-2">Tavsiye Edilen Günlük Kullanım</h3>
                  <p className="text-sm text-orange-900/70 leading-relaxed">
                    {product.usage ?? "Günde 1 adet sabah aç karna alınız."}
                  </p>
                </div>
                {/* Muhafaza */}
                {product.storage && (
                  <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
                    <h3 className="text-sm font-bold text-blue-700 mb-2">Muhafaza Koşulları</h3>
                    <p className="text-sm text-blue-900/70 leading-relaxed">{product.storage}</p>
                  </div>
                )}
                {/* Uyarılar */}
                {product.warnings && (
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Diğer Uyarılar</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{product.warnings}</p>
                  </div>
                )}
                {/* Üretici */}
                {product.manufacturer && (
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                    <h3 className="text-xs font-bold text-gray-600 mb-2">Üretim Bilgileri</h3>
                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{product.manufacturer}</p>
                  </div>
                )}
                {/* Sertifikalar */}
                {product.certificates && (
                  <div className="flex flex-wrap gap-2">
                    {product.certificates.split(",").map((c) => (
                      <span key={c} className="rounded-full bg-green-50 border border-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        ✓ {c.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {/* Onay / Parti / Barkod */}
                {(product.approvalNo || product.barcode || product.batchNo) && (
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400 px-1">
                    {product.approvalNo && <span>Onay No: <span className="font-medium text-gray-600">{product.approvalNo}</span></span>}
                    {product.batchNo && <span>Parti No: <span className="font-medium text-gray-600">{product.batchNo}</span></span>}
                    {product.barcode && <span>Barkod: <span className="font-medium text-gray-600">{product.barcode}</span></span>}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Yorumlar" && (
              <div className="flex flex-col gap-4">
                {/* Özet */}
                <div className="flex items-center gap-6 rounded-2xl bg-gray-50 p-5 mb-2">
                  <div className="text-center">
                    <p className="text-5xl font-black text-gray-900">{product.rating}</p>
                    <div className="flex gap-0.5 justify-center mt-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={12} className={s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{product.reviewCount} yorum</p>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    {[5,4,3,2,1].map((s) => {
                      const pct = s === 5 ? 68 : s === 4 ? 22 : s === 3 ? 7 : s === 2 ? 2 : 1;
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-3">{s}</span>
                          <Star size={10} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                          <div className="flex-1 h-1.5 rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-6">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Yorumlar */}
                {REVIEWS.map((r, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                          {r.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                          <p className="text-xs text-gray-400">{r.date} · Doğrulanmış Alıcı</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={12} className={s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* İlgili Ürünler */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-14"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">İlgili Ürünler</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
