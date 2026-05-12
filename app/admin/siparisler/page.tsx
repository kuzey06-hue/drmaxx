"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check, RefreshCw, ShoppingBag } from "lucide-react";
import Image from "next/image";

type OrderStatus = "Beklemede" | "İşleniyor" | "Kargoda" | "Teslim Edildi" | "İptal";

interface OrderItem { productId: string; productName: string; quantity: number; price: number; }
interface ProductMeta { image?: string; color: string; slug: string; }
interface Order {
  id: string; orderNo: string; customer: string; email: string;
  phone: string; address: string; items: OrderItem[];
  total: number; status: OrderStatus; date: string; paymentMethod: string;
  invoiceType?: string; tcKimlik?: string; vergiNo?: string;
  vergiDairesi?: string; firmaAdi?: string;
  source?: string; sourceOrderId?: string;
}

const sourceConfig: Record<string, { label: string; cls: string }> = {
  "Trendyol":    { label: "TY",  cls: "bg-orange-100 text-orange-700" },
  "Hepsiburada": { label: "HB",  cls: "bg-red-100 text-red-700" },
  "n11":         { label: "n11", cls: "bg-purple-100 text-purple-700" },
};

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  "Beklemede":    { label: "Beklemede",    className: "bg-yellow-100 text-yellow-700" },
  "İşleniyor":   { label: "İşleniyor",    className: "bg-blue-100 text-blue-700" },
  "Kargoda":     { label: "Kargoda",      className: "bg-purple-100 text-purple-700" },
  "Teslim Edildi":{ label: "Teslim Edildi",className: "bg-green-100 text-green-700" },
  "İptal":       { label: "İptal",        className: "bg-red-100 text-red-700" },
};

const allStatuses: OrderStatus[] = ["Beklemede", "İşleniyor", "Kargoda", "Teslim Edildi", "İptal"];

export default function SiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "Tümü">("Tümü");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalStatus, setModalStatus] = useState<OrderStatus>("Beklemede");
  const [saveAnim, setSaveAnim] = useState(false);
  const [productMap, setProductMap] = useState<Record<string, ProductMeta>>({});

  const fetchOrders = useCallback(() => {
    setLoading(true);
    fetch("/api/cms/orders")
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Ürün meta verilerini yükle (resim + renk eşleştirmesi için)
  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then((products: Array<{ id: string | number; image?: string; color: string; slug: string; name: string }>) => {
        const map: Record<string, ProductMeta> = {};
        products.forEach(p => {
          // id ile eşleştir
          map[String(p.id)] = { image: p.image, color: p.color, slug: p.slug };
          // isim ile de eşleştir (pazaryeri siparişleri için fallback)
          map[p.name.toLowerCase()] = { image: p.image, color: p.color, slug: p.slug };
        });
        setProductMap(map);
      })
      .catch(() => {});
  }, []);

  const filtered = activeFilter === "Tümü" ? orders : orders.filter(o => o.status === activeFilter);
  const getCount = (s: OrderStatus | "Tümü") => s === "Tümü" ? orders.length : orders.filter(o => o.status === s).length;

  const handleOpenModal = (order: Order) => { setSelectedOrder(order); setModalStatus(order.status); };
  const handleCloseModal = () => setSelectedOrder(null);

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    await fetch("/api/cms/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedOrder.id, status: modalStatus }),
    });
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: modalStatus } : o));
    setSaveAnim(true);
    setTimeout(() => { setSaveAnim(false); handleCloseModal(); }, 900);
  };

  const totalRevenue = orders.filter(o => o.status !== "İptal").reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Siparişler</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} sipariş · Toplam{" "}
            <span className="text-orange-500 font-semibold">
              {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(totalRevenue)}
            </span>
          </p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all">
          <RefreshCw size={13} /> Yenile
        </button>
      </div>

      {/* Filtreler */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["Tümü", ...allStatuses] as (OrderStatus | "Tümü")[]).map((status) => {
          const count = getCount(status);
          const isActive = activeFilter === status;
          return (
            <button key={status} onClick={() => setActiveFilter(status)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all ${
                isActive ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200" : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-500"
              }`}>
              {status}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
            <RefreshCw size={15} className="animate-spin" /> Siparişler yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-500">
              {activeFilter === "Tümü" ? "Henüz sipariş yok" : `"${activeFilter}" durumunda sipariş yok`}
            </p>
            {activeFilter === "Tümü" && (
              <p className="text-xs text-gray-400 mt-1">Müşteriler sipariş verdiğinde burada görünecek.</p>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Sipariş No", "Müşteri", "Tarih", "Ürünler", "Toplam", "Durum", "İşlem"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => handleOpenModal(order)}>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold text-gray-700 font-mono">{order.orderNo}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{order.customer}</p>
                      {order.source && sourceConfig[order.source] && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${sourceConfig[order.source].cls}`}>
                          {sourceConfig[order.source].label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{order.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {new Date(order.date).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{order.items?.length ?? 0} çeşit</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-gray-900">₺{order.total.toLocaleString("tr-TR")}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusConfig[order.status]?.className ?? "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(order); }}
                      className="text-xs text-orange-500 hover:text-orange-700 font-semibold transition-colors">
                      Detay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={handleCloseModal}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedOrder.orderNo}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(selectedOrder.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <button onClick={handleCloseModal} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <X size={15} className="text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {/* Müşteri */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Müşteri Bilgileri</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedOrder.customer}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.email}</p>
                  {selectedOrder.phone && <p className="text-sm text-gray-500">{selectedOrder.phone}</p>}
                  {selectedOrder.address && <p className="text-sm text-gray-500">{selectedOrder.address}</p>}
                  {selectedOrder.invoiceType && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-400">Fatura: <span className="text-gray-600 font-medium">{selectedOrder.invoiceType === "kurumsal" ? "Kurumsal" : "Bireysel"}</span></p>
                      {selectedOrder.firmaAdi && <p className="text-xs text-gray-500">Firma: {selectedOrder.firmaAdi}</p>}
                      {selectedOrder.vergiNo && <p className="text-xs text-gray-500">Vergi No: {selectedOrder.vergiNo} / {selectedOrder.vergiDairesi}</p>}
                      {selectedOrder.tcKimlik && <p className="text-xs text-gray-500">TC: {selectedOrder.tcKimlik}</p>}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 pt-1">Ödeme: {selectedOrder.paymentMethod}</p>
                </div>

                {/* Ürünler */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sipariş Detayı</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => {
                      // id ile bul, yoksa isim ile dene
                      const meta = productMap[item.productId]
                        ?? productMap[item.productName?.toLowerCase()]
                        ?? null;
                      const bgColor = meta?.color ?? "#F97316";

                      return (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                          {/* Ürün görseli */}
                          <div
                            className="w-14 h-14 rounded-xl flex-shrink-0 relative overflow-hidden"
                            style={{ background: `${bgColor}15` }}
                          >
                            {meta?.image ? (
                              <Image
                                src={meta.image}
                                alt={item.productName}
                                fill
                                className="object-contain p-1.5"
                                sizes="56px"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center rounded-xl"
                                style={{ background: `linear-gradient(135deg, ${bgColor}30, ${bgColor}60)` }}
                              >
                                <span className="text-[9px] font-black" style={{ color: bgColor }}>DM</span>
                              </div>
                            )}
                            {/* Adet rozeti */}
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gray-700 text-white text-[9px] font-bold flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>

                          {/* Bilgi */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 leading-snug truncate">{item.productName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.quantity} adet × ₺{item.price.toLocaleString("tr-TR")}</p>
                          </div>

                          {/* Satır toplamı */}
                          <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                            ₺{(item.quantity * item.price).toLocaleString("tr-TR")}
                          </p>
                        </div>
                      );
                    })}
                    <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700">Toplam</span>
                      <span className="text-base font-black text-orange-500">₺{selectedOrder.total.toLocaleString("tr-TR")}</span>
                    </div>
                  </div>
                </div>

                {/* Durum */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Durumu Güncelle</p>
                  <div className="relative">
                    <select value={modalStatus} onChange={e => setModalStatus(e.target.value as OrderStatus)}
                      className="w-full appearance-none text-sm font-semibold px-4 py-2.5 pr-9 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all">
                      {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 flex-shrink-0">
                <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
                  İptal
                </button>
                <button onClick={handleSaveStatus}
                  className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-xl transition-colors ${saveAnim ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600"}`}>
                  {saveAnim ? <><Check size={13} /> Kaydedildi</> : "Kaydet"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
