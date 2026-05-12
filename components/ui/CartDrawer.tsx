"use client";

import { useCart, getQtyDiscountPercent, getNextQtyTier } from "@/contexts/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Tag, Zap } from "lucide-react";
import Link from "next/link";
import { StackedProductImage } from "./StackedProductImage";

function formatPrice(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

export function CartDrawer() {
  const {
    items, removeItem, updateQty,
    subtotal, qtyDiscount, getEffectivePrice,
    isOpen, closeCart,
  } = useCart();

  const kargo  = subtotal >= 300 ? 0 : 29.90;
  const toplam = subtotal + kargo;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={18} className="text-orange-500" />
                <h2 className="font-bold text-gray-900">Sepetim</h2>
                {items.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-bold">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Adet indirim bantı */}
            {items.length > 0 && (
              <div className="px-4 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex items-center gap-2">
                <Zap size={12} className="text-orange-500 flex-shrink-0" />
                <p className="text-[11px] text-orange-700 font-semibold">
                  2 al <span className="font-black">%5</span> · 3 al <span className="font-black">%10</span> adet indirimi
                </p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-16">
                  <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center">
                    <Package size={32} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-700">Sepetiniz boş</p>
                    <p className="text-sm text-gray-400 mt-1">Ürünleri keşfedin ve sepete ekleyin</p>
                  </div>
                  <Link
                    href="/urunler" onClick={closeCart}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Ürünlere Git <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => {
                    const discPct      = getQtyDiscountPercent(item.quantity);
                    const nextTier     = getNextQtyTier(item.quantity);
                    const effectivePrice = getEffectivePrice(item);
                    const isDiscounted = discPct > 0;

                    return (
                      <div key={item.id} className="flex gap-3 p-3 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                        {/* Stacked image */}
                        <StackedProductImage
                          image={item.image} color={item.color}
                          name={item.name} quantity={item.quantity}
                          className="w-16 h-16" sizes="64px"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>

                          {/* Fiyat */}
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-bold text-orange-500">{formatPrice(effectivePrice)}</p>
                            {isDiscounted && (
                              <>
                                <p className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</p>
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                  -%{discPct}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Qty + Sil */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                              <button
                                onClick={() => updateQty(item.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
                              <button
                                onClick={() => updateQty(item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                            <span className="ml-auto text-sm font-bold text-gray-700">
                              {formatPrice(effectivePrice * item.quantity)}
                            </span>
                          </div>

                          {/* Sonraki kademe ipucu */}
                          {nextTier && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                              className="text-[10px] text-orange-600 font-semibold mt-1.5 flex items-center gap-1"
                            >
                              <Zap size={9} />
                              {nextTier.minQty - item.quantity} adet daha ekle → <span className="font-black">%{nextTier.percent} indirim!</span>
                            </motion.p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-5 space-y-2.5 bg-white">
                {/* Ara toplam */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Ara Toplam</span>
                  <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
                </div>

                {/* Adet indirimi */}
                {qtyDiscount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                      <Tag size={12} /> Adet İndirimi
                    </span>
                    <span className="font-bold text-green-600">-{formatPrice(qtyDiscount)}</span>
                  </motion.div>
                )}

                {/* Kargo */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Kargo</span>
                  <span className={kargo === 0 ? "text-green-500 font-semibold" : ""}>
                    {kargo === 0 ? "Ücretsiz" : formatPrice(kargo)}
                  </span>
                </div>

                {/* Toplam */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Toplam</span>
                  <span className="text-lg font-black text-gray-900">{formatPrice(toplam)}</span>
                </div>

                {/* CTA */}
                <Link
                  href="/odeme" onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-500/20"
                >
                  Ödemeye Geç <ArrowRight size={15} />
                </Link>
                <Link
                  href="/sepet" onClick={closeCart}
                  className="flex items-center justify-center w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Sepeti Görüntüle
                </Link>

                {subtotal < 300 && (
                  <p className="text-center text-xs text-gray-400">
                    <span className="text-orange-500 font-semibold">{formatPrice(300 - subtotal)}</span> daha ekle, kargo ücretsiz!
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
