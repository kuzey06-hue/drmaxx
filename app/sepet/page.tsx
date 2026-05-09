"use client";

import { useCart, getQtyDiscountPercent, getNextQtyTier, QTY_TIERS } from "@/contexts/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, Tag, Zap, Check } from "lucide-react";
import { StackedProductImage } from "@/components/ui/StackedProductImage";

function formatPrice(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

/** Ürün başına kademe ilerleme çubuğu */
function QtyTierProgress({ quantity }: { quantity: number }) {
  const discPct  = getQtyDiscountPercent(quantity);
  const nextTier = getNextQtyTier(quantity);
  const maxQty   = QTY_TIERS[QTY_TIERS.length - 1].minQty;

  if (quantity >= maxQty) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
        <Check size={10} />
        Maksimum indirim aktif — %{discPct}
      </div>
    );
  }

  if (nextTier) {
    const needed = nextTier.minQty - quantity;
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 text-[11px] text-orange-600 font-semibold"
      >
        <Zap size={10} className="flex-shrink-0" />
        <span>
          {needed} adet daha ekle →{" "}
          <span className="font-black">%{nextTier.percent} indirim</span> kazan!
        </span>
      </motion.div>
    );
  }
  return null;
}

export default function SepetPage() {
  const {
    items, removeItem, updateQty, subtotal,
    qtyDiscount, getEffectivePrice, clearCart,
  } = useCart();

  const kargo  = subtotal >= 300 ? 0 : 29.90;
  const toplam = subtotal + kargo;

  return (
    <main>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Sepetim</h1>

          {/* Adet indirim bilgi bandı */}
          <div className="flex items-center gap-6 mb-8 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
            <Zap size={20} className="text-orange-500 flex-shrink-0" />
            <div className="flex items-center gap-6 flex-wrap">
              {QTY_TIERS.map(tier => (
                <div key={tier.minQty} className="flex items-center gap-2">
                  <span className="text-sm font-black text-orange-600">%{tier.percent}</span>
                  <span className="text-sm text-gray-600">
                    indirim — {tier.minQty} veya daha fazla adet alımında
                  </span>
                </div>
              ))}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 rounded-3xl bg-orange-50 flex items-center justify-center mb-6">
                <ShoppingCart size={36} className="text-orange-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">Sepetiniz boş</h2>
              <p className="text-gray-400 text-sm mb-8">Ürünleri keşfedin ve sepetinize ekleyin.</p>
              <Link
                href="/urunler"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
              >
                Ürünlere Git <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

              {/* ── Sol: Ürün listesi ─────────────────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{items.reduce((s, i) => s + i.quantity, 0)} ürün</p>
                  <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                    Sepeti Temizle
                  </button>
                </div>

                <AnimatePresence>
                  {items.map((item) => {
                    const discPct        = getQtyDiscountPercent(item.quantity);
                    const effectivePrice = getEffectivePrice(item);
                    const isDiscounted   = discPct > 0;
                    const itemSaving     = item.price * item.quantity - effectivePrice * item.quantity;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4"
                      >
                        {/* Stacked image */}
                        <div className="relative">
                          <StackedProductImage
                            image={item.image} color={item.color}
                            name={item.name} quantity={item.quantity}
                            className="w-20 h-20" sizes="80px"
                          />
                          {/* İndirim rozeti — resmin üzerinde */}
                          <AnimatePresence>
                            {isDiscounted && (
                              <motion.span
                                key="badge"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute -top-2 -right-2 text-[10px] font-black bg-green-500 text-white px-1.5 py-0.5 rounded-full z-10 shadow-md"
                              >
                                -%{discPct}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Bilgi */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/urunler/${item.slug}`}
                              className="font-semibold text-gray-900 hover:text-orange-500 transition-colors line-clamp-2 leading-snug"
                            >
                              {item.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Fiyat satırı */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-orange-500 font-bold">{formatPrice(effectivePrice)}</span>
                            {isDiscounted && (
                              <span className="text-sm text-gray-400 line-through">{formatPrice(item.price)}</span>
                            )}
                            <span className="text-xs text-gray-400">/ adet</span>
                          </div>

                          {/* Tasarruf satırı */}
                          <AnimatePresence>
                            {isDiscounted && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-[11px] text-green-600 font-semibold mt-0.5"
                              >
                                Bu üründe {formatPrice(itemSaving)} tasarruf ediyorsunuz 🎉
                              </motion.p>
                            )}
                          </AnimatePresence>

                          {/* Miktar + toplam */}
                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                              <button
                                onClick={() => updateQty(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-10 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                              <button
                                onClick={() => updateQty(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <span className="font-bold text-gray-800">
                              {formatPrice(effectivePrice * item.quantity)}
                            </span>
                          </div>

                          {/* Sonraki kademe ipucu */}
                          <div className="mt-2">
                            <QtyTierProgress quantity={item.quantity} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* ── Sağ: Sipariş özeti ───────────────────────────── */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 mb-5">Sipariş Özeti</h2>

                  <div className="space-y-3 text-sm">
                    {/* Ham tutar (indirim öncesi) */}
                    {qtyDiscount > 0 && (
                      <div className="flex justify-between text-gray-400">
                        <span>Liste Fiyatı</span>
                        <span className="line-through">{formatPrice(subtotal + qtyDiscount)}</span>
                      </div>
                    )}

                    {/* Adet indirimi */}
                    <AnimatePresence>
                      {qtyDiscount > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex justify-between items-center"
                        >
                          <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                            <Tag size={12} />
                            Adet İndirimi
                          </span>
                          <span className="font-bold text-green-600">-{formatPrice(qtyDiscount)}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Ara toplam */}
                    <div className="flex justify-between text-gray-700 font-semibold">
                      <span>Ara Toplam</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>

                    {/* Kargo */}
                    <div className="flex justify-between text-gray-500">
                      <span>Kargo</span>
                      <span className={kargo === 0 ? "text-green-500 font-semibold" : ""}>
                        {kargo === 0 ? "Ücretsiz" : formatPrice(kargo)}
                      </span>
                    </div>

                    {kargo > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-orange-500 bg-orange-50 rounded-xl px-3 py-2">
                        <Tag size={11} />
                        <span>{formatPrice(300 - subtotal)} daha ekle, kargo ücretsiz!</span>
                      </div>
                    )}

                    {/* Genel toplam */}
                    <div className="flex justify-between font-black text-gray-900 text-base pt-3 border-t border-gray-100">
                      <span>Toplam</span>
                      <span>{formatPrice(toplam)}</span>
                    </div>

                    {/* Toplam tasarruf özeti */}
                    {qtyDiscount > 0 && (
                      <div className="flex items-center justify-center gap-2 bg-green-50 rounded-xl px-3 py-2.5 text-green-700 text-xs font-semibold">
                        <Check size={13} className="text-green-500" />
                        Toplamda <span className="font-black">{formatPrice(qtyDiscount)}</span> tasarruf ettiniz!
                      </div>
                    )}
                  </div>

                  <Link
                    href="/odeme"
                    className="flex items-center justify-center gap-2 w-full mt-5 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Ödemeye Geç <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/urunler"
                    className="flex items-center justify-center w-full mt-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Alışverişe Devam Et
                  </Link>
                </div>

                {/* Güven rozetleri */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  {[
                    { icon: "🔒", text: "256-bit SSL ile güvenli ödeme" },
                    { icon: "↩️", text: "14 gün içinde kolay iade" },
                    { icon: "🚚", text: "300₺ üzeri ücretsiz kargo" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 py-2 text-xs text-gray-500 border-b border-gray-50 last:border-0">
                      <span>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
