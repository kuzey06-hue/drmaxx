"use client";

import { useState, useEffect } from "react";
import { Search, Users, TrendingUp, ShoppingBag } from "lucide-react";

interface CustomerSummary {
  name: string; email: string; phone: string;
  orderCount: number; totalSpend: number; lastOrderDate: string;
}

interface Order {
  id: string; customer: string; email: string; phone: string;
  total: number; date: string; status: string;
}

function buildCustomers(orders: Order[]): CustomerSummary[] {
  const map: Record<string, CustomerSummary> = {};
  orders.forEach(o => {
    if (o.status === "İptal") return;
    if (!map[o.email]) {
      map[o.email] = { name: o.customer, email: o.email, phone: o.phone, orderCount: 0, totalSpend: 0, lastOrderDate: o.date };
    }
    map[o.email].orderCount++;
    map[o.email].totalSpend += o.total;
    if (o.date > map[o.email].lastOrderDate) map[o.email].lastOrderDate = o.date;
  });
  return Object.values(map).sort((a, b) => b.totalSpend - a.totalSpend);
}

export default function MusterilerPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/cms/orders")
      .then(r => r.json())
      .then((orders: Order[]) => {
        setCustomers(buildCustomers(orders));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpend, 0);
  const avgOrderValue = customers.length > 0
    ? customers.reduce((s, c) => s + c.totalSpend, 0) / customers.reduce((s, c) => s + c.orderCount, 0)
    : 0;

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Müşteriler</h1>
        <p className="text-sm text-gray-400 mt-0.5">{customers.length} benzersiz müşteri</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Toplam Müşteri",  value: customers.length,                   icon: Users,      color: "text-blue-500",   bg: "bg-blue-50" },
          { label: "Toplam Gelir",    value: fmt(totalRevenue),                   icon: TrendingUp, color: "text-green-500",  bg: "bg-green-50" },
          { label: "Ort. Sipariş",   value: isNaN(avgOrderValue) ? "₺0" : fmt(avgOrderValue), icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Arama */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim veya e-posta ara..."
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={36} className="text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-500">
              {search ? "Müşteri bulunamadı" : "Henüz müşteri yok"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {!search && "Sipariş geldikçe müşteriler burada görünecek."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Müşteri", "Sipariş Sayısı", "Toplam Harcama", "Son Sipariş"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.email} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{c.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                        {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                      {c.orderCount} sipariş
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-gray-900">{fmt(c.totalSpend)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(c.lastOrderDate).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
