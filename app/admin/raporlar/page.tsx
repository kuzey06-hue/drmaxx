"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users,
  Download, FileSpreadsheet, Calendar, ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";

interface OrderItem { productName: string; quantity: number; price: number; }
interface Order {
  id: string; orderNo: string; customer: string; email: string; phone?: string;
  address?: string; total: number; date: string; status: string;
  paymentMethod?: string; items: OrderItem[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(n);
}
function fmtPlain(n: number) {
  return Number(n.toFixed(2));
}

// ─── Excel export ─────────────────────────────────────────────────────────────
function exportToExcel(orders: Order[], dateLabel: string) {
  const wb = XLSX.utils.book_new();

  // ── SAYFA 1: Sipariş Listesi ──────────────────────────────────────────────
  const orderRows = orders.map(o => ({
    "Sipariş No":        o.orderNo,
    "Müşteri":           o.customer,
    "E-posta":           o.email,
    "Telefon":           o.phone ?? "",
    "Tarih":             o.date,
    "Durum":             o.status,
    "Ödeme Yöntemi":     o.paymentMethod ?? "",
    "Tutar (₺)":         fmtPlain(o.total),
    "Ürün Sayısı":       o.items?.length ?? 0,
    "Adres":             o.address ?? "",
  }));
  const ws1 = XLSX.utils.json_to_sheet(orderRows);
  ws1["!cols"] = [
    { wch: 18 }, { wch: 22 }, { wch: 28 }, { wch: 15 }, { wch: 12 },
    { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "Siparişler");

  // ── SAYFA 2: Sipariş Detayları (ürün bazlı) ───────────────────────────────
  const itemRows: Record<string, string | number>[] = [];
  orders.forEach(o => {
    o.items?.forEach(item => {
      itemRows.push({
        "Sipariş No":      o.orderNo,
        "Müşteri":         o.customer,
        "Tarih":           o.date,
        "Ürün Adı":        item.productName,
        "Adet":            item.quantity,
        "Birim Fiyat (₺)": fmtPlain(item.price),
        "Toplam (₺)":      fmtPlain(item.quantity * item.price),
        "Sipariş Durumu":  o.status,
      });
    });
  });
  const ws2 = XLSX.utils.json_to_sheet(itemRows.length > 0 ? itemRows : [{ Bilgi: "Ürün verisi bulunamadı" }]);
  ws2["!cols"] = [{ wch: 18 }, { wch: 22 }, { wch: 12 }, { wch: 30 }, { wch: 8 }, { wch: 16 }, { wch: 14 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Ürün Detayları");

  // ── SAYFA 3: Müşteri Özeti ────────────────────────────────────────────────
  const customerMap: Record<string, { name: string; email: string; phone: string; orderCount: number; totalSpend: number; lastDate: string }> = {};
  orders.forEach(o => {
    if (o.status === "İptal") return;
    if (!customerMap[o.email]) {
      customerMap[o.email] = { name: o.customer, email: o.email, phone: o.phone ?? "", orderCount: 0, totalSpend: 0, lastDate: o.date };
    }
    customerMap[o.email].orderCount++;
    customerMap[o.email].totalSpend += o.total;
    if (o.date > customerMap[o.email].lastDate) customerMap[o.email].lastDate = o.date;
  });
  const customerRows = Object.values(customerMap)
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .map(c => ({
      "Müşteri Adı":       c.name,
      "E-posta":           c.email,
      "Telefon":           c.phone,
      "Sipariş Sayısı":    c.orderCount,
      "Toplam Harcama (₺)": fmtPlain(c.totalSpend),
      "Son Sipariş":       c.lastDate,
    }));
  const ws3 = XLSX.utils.json_to_sheet(customerRows.length > 0 ? customerRows : [{ Bilgi: "Müşteri verisi bulunamadı" }]);
  ws3["!cols"] = [{ wch: 24 }, { wch: 28 }, { wch: 15 }, { wch: 14 }, { wch: 20 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Müşteriler");

  // ── SAYFA 4: Ürün Satış Özeti ─────────────────────────────────────────────
  const productMap: Record<string, { name: string; totalQty: number; totalRevenue: number }> = {};
  orders.filter(o => o.status !== "İptal").forEach(o => {
    o.items?.forEach(item => {
      if (!productMap[item.productName]) {
        productMap[item.productName] = { name: item.productName, totalQty: 0, totalRevenue: 0 };
      }
      productMap[item.productName].totalQty += item.quantity;
      productMap[item.productName].totalRevenue += item.quantity * item.price;
    });
  });
  const productRows = Object.values(productMap)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .map(p => ({
      "Ürün Adı":          p.name,
      "Toplam Satış (Adet)": p.totalQty,
      "Toplam Ciro (₺)":   fmtPlain(p.totalRevenue),
    }));
  const ws4 = XLSX.utils.json_to_sheet(productRows.length > 0 ? productRows : [{ Bilgi: "Satış verisi bulunamadı" }]);
  ws4["!cols"] = [{ wch: 36 }, { wch: 20 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Ürün Satışları");

  // ── SAYFA 5: Özet İstatistikler ───────────────────────────────────────────
  const valid = orders.filter(o => o.status !== "İptal");
  const totalRev = valid.reduce((s, o) => s + o.total, 0);
  const avgOrder = valid.length > 0 ? totalRev / valid.length : 0;
  const uniqueCustomers = new Set(orders.map(o => o.email)).size;
  const statusCounts = ["Beklemede", "İşleniyor", "Kargoda", "Teslim Edildi", "İptal"].map(s => ({
    "Durum": s,
    "Adet":  orders.filter(o => o.status === s).length,
    "Tutar (₺)": fmtPlain(orders.filter(o => o.status === s).reduce((acc, o) => acc + o.total, 0)),
  }));
  const summaryData = [
    { "Metrik": "Toplam Sipariş",         "Değer": orders.length },
    { "Metrik": "Geçerli Sipariş",        "Değer": valid.length },
    { "Metrik": "İptal Sipariş",          "Değer": orders.filter(o => o.status === "İptal").length },
    { "Metrik": "Toplam Gelir (₺)",       "Değer": fmtPlain(totalRev) },
    { "Metrik": "Ortalama Sipariş (₺)",   "Değer": fmtPlain(avgOrder) },
    { "Metrik": "Benzersiz Müşteri",      "Değer": uniqueCustomers },
    { "Metrik": "Dışa Aktarma Tarihi",    "Değer": new Date().toLocaleString("tr-TR") },
    { "Metrik": "Rapor Dönemi",           "Değer": dateLabel },
  ];
  const ws5 = XLSX.utils.json_to_sheet([...summaryData, {}, ...(statusCounts as unknown as typeof summaryData)]);
  ws5["!cols"] = [{ wch: 26 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws5, "Özet");

  // İndir
  XLSX.writeFile(wb, `drmaxx-rapor-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ─── Bileşen ─────────────────────────────────────────────────────────────────
export default function RaporlarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState<"tum" | "bu_ay" | "gecen_ay" | "bu_yil">("tum");
  const [showDateMenu, setShowDateMenu] = useState(false);

  useEffect(() => {
    fetch("/api/cms/orders")
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Tarih filtresi
  const now = new Date();
  const thisMonth  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth  = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const thisYear   = `${now.getFullYear()}`;

  const filteredOrders = orders.filter(o => {
    if (dateRange === "bu_ay")     return o.date.startsWith(thisMonth);
    if (dateRange === "gecen_ay")  return o.date.startsWith(lastMonth);
    if (dateRange === "bu_yil")    return o.date.startsWith(thisYear);
    return true;
  });

  const dateLabels: Record<typeof dateRange, string> = {
    tum:       "Tüm Zamanlar",
    bu_ay:     `${now.getFullYear()} ${now.toLocaleString("tr-TR", { month: "long" })}`,
    gecen_ay:  `${lastMonthDate.getFullYear()} ${lastMonthDate.toLocaleString("tr-TR", { month: "long" })}`,
    bu_yil:    `${now.getFullYear()} Yılı`,
  };

  const validOrders = filteredOrders.filter(o => o.status !== "İptal");

  const thisMonthRev = orders.filter(o => o.status !== "İptal" && o.date.startsWith(thisMonth)).reduce((s, o) => s + o.total, 0);
  const lastMonthRev = orders.filter(o => o.status !== "İptal" && o.date.startsWith(lastMonth)).reduce((s, o) => s + o.total, 0);
  const growthPct = lastMonthRev > 0 ? (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1) : "0.0";

  const totalRev = validOrders.reduce((s, o) => s + o.total, 0);
  const avgOrder = validOrders.length > 0 ? totalRev / validOrders.length : 0;
  const uniqueCustomers = new Set(filteredOrders.map(o => o.id.slice(0, 8))).size;

  const statusDist = [
    { label: "Beklemede",     count: filteredOrders.filter(o => o.status === "Beklemede").length,     color: "bg-yellow-400" },
    { label: "İşleniyor",    count: filteredOrders.filter(o => o.status === "İşleniyor").length,     color: "bg-blue-400" },
    { label: "Kargoda",      count: filteredOrders.filter(o => o.status === "Kargoda").length,       color: "bg-purple-400" },
    { label: "Teslim Edildi",count: filteredOrders.filter(o => o.status === "Teslim Edildi").length, color: "bg-green-400" },
    { label: "İptal",        count: filteredOrders.filter(o => o.status === "İptal").length,         color: "bg-red-400" },
  ].filter(s => s.count > 0);

  const recentOrders = validOrders.slice(0, 5);

  const kpiCards = [
    { title: "Toplam Gelir",        value: fmt(totalRev),        icon: DollarSign,   color: "text-green-500",  bg: "bg-green-50",
      sub: lastMonthRev > 0 ? `${Number(growthPct) >= 0 ? "+" : ""}${growthPct}% geçen aya göre` : "Seçili dönem", trend: Number(growthPct) >= 0 },
    { title: "Toplam Sipariş",      value: String(validOrders.length), icon: ShoppingCart, color: "text-blue-500",   bg: "bg-blue-50",
      sub: `${filteredOrders.filter(o => o.status === "İptal").length} iptal`, trend: true },
    { title: "Ort. Sipariş Değeri", value: fmt(avgOrder),        icon: Package,      color: "text-purple-500", bg: "bg-purple-50",
      sub: "Geçerli siparişler", trend: true },
    { title: "Toplam Müşteri",      value: String(uniqueCustomers), icon: Users,     color: "text-orange-500", bg: "bg-orange-50",
      sub: "Benzersiz alıcı", trend: true },
  ];

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      exportToExcel(filteredOrders, dateLabels[dateRange]);
      setExporting(false);
    }, 100);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Raporlar yükleniyor...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Raporlar</h1>
        <p className="text-sm text-gray-400 mb-8">Satış istatistikleri ve analizler</p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-center">
          <TrendingUp size={48} className="text-gray-200 mb-4" />
          <p className="text-lg font-bold text-gray-500">Henüz veri yok</p>
          <p className="text-sm text-gray-400 mt-2">İlk siparişler gelince raporlar burada görünecek.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-sm text-gray-400 mt-0.5">Satış istatistikleri ve analizler</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tarih filtresi */}
          <div className="relative">
            <button
              onClick={() => setShowDateMenu(v => !v)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 font-medium hover:border-orange-300 transition-all"
            >
              <Calendar size={14} className="text-gray-400" />
              {dateLabels[dateRange]}
              <ChevronDown size={13} className="text-gray-400" />
            </button>
            {showDateMenu && (
              <div className="absolute right-0 top-11 w-48 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-20">
                {(Object.entries(dateLabels) as [typeof dateRange, string][]).map(([key, label]) => (
                  <button key={key} onClick={() => { setDateRange(key); setShowDateMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${dateRange === key ? "bg-orange-50 text-orange-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Excel Export butonu */}
          <button
            onClick={handleExport}
            disabled={exporting || filteredOrders.length === 0}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              exporting
                ? "bg-green-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
            } disabled:opacity-40`}
          >
            {exporting
              ? <><FileSpreadsheet size={15} className="animate-pulse" /> Hazırlanıyor...</>
              : <><Download size={15} /> Excel İndir</>
            }
          </button>
        </div>
      </div>

      {/* Dönem etiketi */}
      {dateRange !== "tum" && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full font-semibold border border-orange-100">
            {dateLabels[dateRange]}
          </span>
          <span>— {filteredOrders.length} sipariş gösteriliyor</span>
        </div>
      )}

      {/* KPI Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} custom={i} initial="hidden" animate="show" variants={fadeUp}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon size={18} className={card.color} />
                </div>
                {card.trend
                  ? <TrendingUp size={14} className="text-green-400" />
                  : <TrendingDown size={14} className="text-red-400" />}
              </div>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{card.title}</p>
              <p className="text-[11px] text-gray-400 mt-1">{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sipariş durumu */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-5">Sipariş Durumu Dağılımı</h3>
          {statusDist.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Seçili dönemde veri yok</p>
          ) : (
            <div className="space-y-3">
              {statusDist.map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-700">{s.label}</span>
                    <span className="font-bold text-gray-900">{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`}
                      style={{ width: `${filteredOrders.length > 0 ? (s.count / filteredOrders.length) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Son siparişler */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-5">Son Siparişler</h3>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Seçili dönemde onaylanan sipariş yok</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-xs font-bold text-gray-700 font-mono">{(o as unknown as { orderNo: string }).orderNo ?? o.id}</p>
                    <p className="text-xs text-gray-400">{new Date(o.date).toLocaleDateString("tr-TR")}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{fmt(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Excel export bilgi kartı */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-200">
            <FileSpreadsheet size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Excel Raporu</p>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="font-semibold text-emerald-700">{filteredOrders.length} sipariş</span> · 5 sayfa:
              Siparişler, Ürün Detayları, Müşteriler, Ürün Satışları, Özet
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || filteredOrders.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-sm shadow-emerald-200 disabled:opacity-40 whitespace-nowrap"
        >
          <Download size={14} />
          {exporting ? "Hazırlanıyor..." : "İndir (.xlsx)"}
        </button>
      </div>
    </div>
  );
}
