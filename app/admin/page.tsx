"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, TrendingUp, Package, Users } from "lucide-react";

interface OrderItem { productId: string; productName: string; quantity: number; price: number; }
interface Order {
  id: string; orderNo: string; customer: string; email: string;
  total: number; status: string; date: string; items: OrderItem[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

const statusColors: Record<string, string> = {
  "Beklemede":    "bg-yellow-100 text-yellow-700",
  "İşleniyor":   "bg-blue-100 text-blue-700",
  "Kargoda":     "bg-purple-100 text-purple-700",
  "Teslim Edildi":"bg-green-100 text-green-700",
  "İptal":       "bg-red-100 text-red-700",
};

// Bar chart static demo data – son 7 gün
const barData = [
  { day: "Pzt", revenue: 4200 },
  { day: "Sal", revenue: 7800 },
  { day: "Çar", revenue: 5300 },
  { day: "Per", revenue: 9100 },
  { day: "Cum", revenue: 11400 },
  { day: "Cmt", revenue: 6700 },
  { day: "Paz", revenue: 8900 },
];
const maxBar = Math.max(...barData.map(d => d.revenue));

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/cms/orders").then(r => r.json()),
      fetch("/api/cms/products").then(r => r.json()),
    ]).then(([ordersData, productsData]) => {
      setOrders(ordersData);
      setProductCount(productsData.length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const validOrders = orders.filter(o => o.status !== "İptal");
  const totalRevenue = validOrders.reduce((s, o) => s + o.total, 0);
  const uniqueCustomers = new Set(orders.map(o => o.email)).size;
  const pendingCount = orders.filter(o => o.status === "Beklemede").length;
  const cancelCount = orders.filter(o => o.status === "İptal").length;

  const kpis = [
    { label: "Toplam Sipariş",  value: loading ? "—" : String(orders.length), icon: ShoppingBag, color: "text-blue-600",   bg: "bg-blue-50",   sub: loading ? "" : `${pendingCount} beklemede` },
    { label: "Toplam Gelir",    value: loading ? "—" : `₺${totalRevenue.toLocaleString("tr-TR")}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", sub: `${cancelCount} iptal hariç` },
    { label: "Aktif Ürünler",   value: loading ? "—" : String(productCount), icon: Package, color: "text-orange-500", bg: "bg-orange-50", sub: "Toplam SKU" },
    { label: "Müşteri Sayısı",  value: loading ? "—" : String(uniqueCustomers), icon: Users, color: "text-purple-600", bg: "bg-purple-50", sub: "Benzersiz alıcı" },
  ];

  // Top products by sales count from orders
  const productSales: Record<string, { name: string; count: number }> = {};
  orders.forEach(o => {
    o.items?.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.productName, count: 0 };
      }
      productSales[item.productId].count += item.quantity;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.count - a.count).slice(0, 5);
  const maxSales = topProducts[0]?.count ?? 1;

  const recentOrders = [...orders].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} custom={i} variants={fadeUp} initial="hidden" animate="show"
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={kpi.color} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Bar Chart */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show"
          className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Son 7 Günlük Gelir</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full font-medium">Bu Hafta</span>
          </div>
          <div className="flex items-end gap-3 h-36">
            {barData.map(d => {
              const pct = (d.revenue / maxBar) * 100;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-medium">₺{(d.revenue / 1000).toFixed(1)}k</span>
                  <div className="w-full flex items-end" style={{ height: "80px" }}>
                    <div className="w-full bg-gradient-to-t from-[#F97316] to-orange-300 rounded-t-lg transition-all"
                      style={{ height: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold">{d.day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Son Siparişler</h2>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingBag size={28} className="text-gray-200 mb-2" />
              <p className="text-xs text-gray-400">Henüz sipariş yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{order.customer}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{order.orderNo}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-gray-900">₺{order.total.toLocaleString("tr-TR")}</p>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show"
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">En Çok Satan Ürünler</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Sipariş verisi gelince satış grafiği burada görünecek.</p>
        ) : (
          <div className="space-y-4">
            {topProducts.map(p => (
              <div key={p.name} className="flex items-center gap-4">
                <p className="text-sm font-medium text-gray-700 w-52 truncate">{p.name}</p>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#F97316] to-orange-300"
                    style={{ width: `${(p.count / maxSales) * 100}%` }} />
                </div>
                <p className="text-sm font-bold text-gray-900 w-16 text-right">{p.count} adet</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
