"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  HandCoins,
  Link2,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Ticket,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

type LeadStatus = "new" | "approved" | "rejected";
type InfluencerStatus = "active" | "pending" | "paused";
type PayoutStatus = "pending" | "paid" | "cancelled";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  instagram: string;
  website: string;
  channel: string;
  message: string;
  status: LeadStatus;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
};

type Influencer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  instagram: string;
  channel: string;
  notes: string;
  status: InfluencerStatus;
  commissionRate: number;
  couponCode: string;
  couponDiscountRate: number;
  personalDiscountCode: string;
  personalDiscountRate: number;
  refCode: string;
  joinedAt: string;
  updatedAt: string;
  referralUrl: string;
  totalClicks: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  totalPaid: number;
  pendingPayout: number;
  unpaidCommission: number;
};

type Payout = {
  id: string;
  influencerId: string;
  amount: number;
  status: PayoutStatus;
  periodStart: string;
  periodEnd: string;
  note: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
};

type AffiliateSettings = {
  baseUrl: string;
  defaultCommissionRate: number;
  defaultCouponDiscountRate: number;
  cookieDays: number;
  minimumPayout: number;
  currency: string;
  updatedAt: string;
};

type Summary = {
  influencerCount: number;
  activeInfluencerCount: number;
  pendingLeadCount: number;
  totalClicks: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  totalPaid: number;
  unpaidCommission: number;
};

type ApiResponse = {
  settings: AffiliateSettings;
  influencers: Influencer[];
  payouts: Payout[];
  leads: Lead[];
  summary: Summary;
};

type TabKey = "dashboard" | "tools" | "payouts" | "settings" | "leads";

type InfluencerForm = {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  instagram: string;
  channel: string;
  notes: string;
  status: InfluencerStatus;
  commissionRate: number;
  couponCode: string;
  couponDiscountRate: number;
  personalDiscountCode: string;
  personalDiscountRate: number;
  refCode: string;
  leadId?: string;
};

const defaultInfluencerForm = (): InfluencerForm => ({
  fullName: "",
  email: "",
  phone: "",
  city: "",
  instagram: "",
  channel: "",
  notes: "",
  status: "active",
  commissionRate: 18,
  couponCode: "",
  couponDiscountRate: 10,
  personalDiscountCode: "",
  personalDiscountRate: 10,
  refCode: "",
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default function AdminAffiliatePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [form, setForm] = useState<InfluencerForm>(defaultInfluencerForm());
  const [showForm, setShowForm] = useState(false);
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string>("");
  const [payoutForm, setPayoutForm] = useState({
    influencerId: "",
    amount: "",
    status: "pending" as PayoutStatus,
    periodStart: "",
    periodEnd: "",
    note: "",
  });
  const [settingsForm, setSettingsForm] = useState<AffiliateSettings | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/affiliate-program", { cache: "no-store" });
      const json = await parseJsonSafe<ApiResponse>(res);
      if (json) {
        setData(json);
        setSettingsForm(json.settings);
        if (json.influencers.length > 0) {
          setSelectedInfluencerId((prev) => prev || json.influencers[0].id);
          setPayoutForm((prev) => ({ ...prev, influencerId: prev.influencerId || json.influencers[0].id }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const selectedInfluencer = useMemo(
    () => data?.influencers.find((item) => item.id === selectedInfluencerId) ?? null,
    [data?.influencers, selectedInfluencerId],
  );

  const mutate = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/affiliate-program", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await parseJsonSafe<{ ok?: boolean; error?: string }>(res);
      if (!res.ok || !json?.ok) {
        alert(json?.error ?? "İşlem başarısız.");
        setSaving(false);
        return false;
      }
      await fetchData();
      return true;
    } catch {
      alert("Bağlantı hatası oluştu.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      alert("Kopyalama başarısız.");
    }
  };

  const openCreateForm = () => {
    setForm(() => {
      const base = defaultInfluencerForm();
      if (data?.settings) {
        base.commissionRate = data.settings.defaultCommissionRate;
        base.couponDiscountRate = data.settings.defaultCouponDiscountRate;
        base.personalDiscountRate = data.settings.defaultCouponDiscountRate;
      }
      return base;
    });
    setShowForm(true);
  };

  const openEditForm = (influencer: Influencer) => {
    setForm({
      id: influencer.id,
      fullName: influencer.fullName,
      email: influencer.email,
      phone: influencer.phone,
      city: influencer.city,
      instagram: influencer.instagram,
      channel: influencer.channel,
      notes: influencer.notes,
      status: influencer.status,
      commissionRate: influencer.commissionRate,
      couponCode: influencer.couponCode,
      couponDiscountRate: influencer.couponDiscountRate,
      personalDiscountCode: influencer.personalDiscountCode,
      personalDiscountRate: influencer.personalDiscountRate,
      refCode: influencer.refCode,
    });
    setShowForm(true);
  };

  const saveInfluencer = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      alert("Ad soyad ve e-posta zorunludur.");
      return;
    }

    const ok = await mutate({
      action: form.id ? "updateInfluencer" : "createInfluencer",
      influencer: form,
    });

    if (ok) {
      setShowForm(false);
      setForm(defaultInfluencerForm());
    }
  };

  const convertLead = async (lead: Lead) => {
    const ok = await mutate({
      action: "createInfluencer",
      influencer: {
        fullName: lead.name,
        email: lead.email,
        phone: lead.phone,
        city: lead.city,
        instagram: lead.instagram,
        channel: lead.channel,
        notes: lead.message,
        leadId: lead.id,
      },
    });
    if (ok) setActiveTab("dashboard");
  };

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    await fetch("/api/cms/affiliate", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await fetchData();
  };

  const addPayout = async () => {
    if (!payoutForm.influencerId || !payoutForm.amount) {
      alert("Influencer ve tutar zorunludur.");
      return;
    }

    const ok = await mutate({
      action: "recordPayout",
      payout: {
        influencerId: payoutForm.influencerId,
        amount: Number(payoutForm.amount),
        status: payoutForm.status,
        periodStart: payoutForm.periodStart,
        periodEnd: payoutForm.periodEnd,
        note: payoutForm.note,
      },
    });

    if (ok) {
      setPayoutForm((prev) => ({
        ...prev,
        amount: "",
        periodStart: "",
        periodEnd: "",
        note: "",
      }));
    }
  };

  const saveSettings = async () => {
    if (!settingsForm) return;
    await mutate({
      action: "saveSettings",
      settings: settingsForm,
    });
  };

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "dashboard", label: "Anasayfa" },
    { key: "tools", label: "Pazarlama Araçları" },
    { key: "payouts", label: "Ödemeler" },
    { key: "settings", label: "Ayarlar" },
    { key: "leads", label: "Başvurular" },
  ];

  if (loading || !data || !settingsForm) {
    return (
      <div className="h-64 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-sm text-gray-500 gap-2">
        <RefreshCw size={14} className="animate-spin" />
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                activeTab === tab.key
                  ? "bg-orange-500 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                icon: Users,
                label: "Influencer",
                value: data.summary.influencerCount,
                sub: `${data.summary.activeInfluencerCount} aktif`,
              },
              {
                icon: TrendingUp,
                label: "Toplam Satış",
                value: formatCurrency(data.summary.totalRevenue),
                sub: `${data.summary.totalOrders} sipariş`,
              },
              {
                icon: Wallet,
                label: "Komisyon",
                value: formatCurrency(data.summary.totalCommission),
                sub: `Ödenen ${formatCurrency(data.summary.totalPaid)}`,
              },
              {
                icon: HandCoins,
                label: "Bekleyen Komisyon",
                value: formatCurrency(data.summary.unpaidCommission),
                sub: "Ödeme bekleyen",
              },
              {
                icon: Megaphone,
                label: "Yeni Başvuru",
                value: data.summary.pendingLeadCount,
                sub: "Onay bekliyor",
              },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <card.icon size={14} />
                  {card.label}
                </div>
                <p className="text-lg font-black text-gray-900 mt-2">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Influencer Yönetimi</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void fetchData()}
                  className="h-9 px-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 inline-flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  Yenile
                </button>
                <button
                  onClick={openCreateForm}
                  className="h-9 px-3 rounded-xl bg-orange-500 text-white text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Plus size={14} />
                  Yeni
                </button>
              </div>
            </div>

            {showForm && (
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Ad Soyad *"
                    className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
                  />
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="E-posta *"
                    className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Telefon"
                    className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="İl"
                    className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
                  />
                  <input
                    value={form.instagram}
                    onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@instagram"
                    className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
                  />
                  <input
                    value={form.channel}
                    onChange={(e) => setForm((prev) => ({ ...prev, channel: e.target.value }))}
                    placeholder="Kanal Türü"
                    className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <input
                    value={form.couponCode}
                    onChange={(e) => setForm((prev) => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                    placeholder="Takipçi Kuponu"
                    className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
                  />
                  <input
                    type="number"
                    value={form.couponDiscountRate}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, couponDiscountRate: Number(e.target.value) || 0 }))
                    }
                    placeholder="İndirim %"
                    className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
                  />
                  <input
                    value={form.personalDiscountCode}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, personalDiscountCode: e.target.value.toUpperCase() }))
                    }
                    placeholder="Kişisel Kupon"
                    className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
                  />
                  <input
                    type="number"
                    value={form.personalDiscountRate}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, personalDiscountRate: Number(e.target.value) || 0 }))
                    }
                    placeholder="Kişisel %"
                    className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
                  />
                  <input
                    type="number"
                    value={form.commissionRate}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, commissionRate: Number(e.target.value) || 0 }))
                    }
                    placeholder="Komisyon %"
                    className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
                  />
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, status: e.target.value as InfluencerStatus }))
                    }
                    className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
                  >
                    <option value="active">Aktif</option>
                    <option value="pending">Beklemede</option>
                    <option value="paused">Durduruldu</option>
                  </select>
                </div>

                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notlar"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setForm(defaultInfluencerForm());
                    }}
                    className="h-9 px-4 rounded-xl border border-gray-200 text-sm text-gray-600"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => void saveInfluencer()}
                    disabled={saving}
                    className="h-9 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={14} />
                    {form.id ? "Güncelle" : "Kaydet"}
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-500">
                    <th className="py-3 text-left">Influencer</th>
                    <th className="py-3 text-left">Kuponlar</th>
                    <th className="py-3 text-left">Oranlar</th>
                    <th className="py-3 text-left">Performans</th>
                    <th className="py-3 text-left">Kazanç</th>
                    <th className="py-3 text-left">Durum</th>
                    <th className="py-3 text-left">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.influencers.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <p className="text-sm font-semibold text-gray-900">{item.fullName}</p>
                        <p className="text-xs text-gray-500">{item.email}</p>
                      </td>
                      <td className="py-3 text-xs">
                        <p className="font-mono text-gray-800">{item.couponCode}</p>
                        <p className="font-mono text-gray-500">{item.personalDiscountCode}</p>
                      </td>
                      <td className="py-3 text-xs text-gray-600">
                        <p>Komisyon %{item.commissionRate}</p>
                        <p>İndirim %{item.couponDiscountRate}</p>
                      </td>
                      <td className="py-3 text-xs text-gray-600">
                        <p>{item.totalOrders} sipariş</p>
                        <p>{formatCurrency(item.totalRevenue)}</p>
                      </td>
                      <td className="py-3 text-xs text-gray-600">
                        <p>Komisyon: {formatCurrency(item.totalCommission)}</p>
                        <p>Bekleyen: {formatCurrency(item.unpaidCommission)}</p>
                      </td>
                      <td className="py-3">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            void mutate({
                              action: "updateInfluencer",
                              influencer: { id: item.id, status: e.target.value },
                            })
                          }
                          className="h-8 px-2 rounded-lg border border-gray-200 text-xs"
                        >
                          <option value="active">Aktif</option>
                          <option value="pending">Beklemede</option>
                          <option value="paused">Durduruldu</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => void handleCopy(item.referralUrl)}
                            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 inline-flex items-center justify-center"
                            title="Link Kopyala"
                          >
                            <Link2 size={13} />
                          </button>
                          <button
                            onClick={() => openEditForm(item)}
                            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 inline-flex items-center justify-center"
                            title="Düzenle"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Influencer kaydını silmek istiyor musunuz?")) {
                                void mutate({ action: "deleteInfluencer", id: item.id });
                              }
                            }}
                            className="w-8 h-8 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 inline-flex items-center justify-center"
                            title="Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.influencers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-gray-500">
                        Henüz influencer kaydı yok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tools" && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Pazarlama Araçları</h2>
            {data.influencers.length === 0 ? (
              <p className="text-sm text-gray-500">Önce influencer eklemelisiniz.</p>
            ) : (
              <>
                <select
                  value={selectedInfluencerId}
                  onChange={(e) => setSelectedInfluencerId(e.target.value)}
                  className="h-10 w-full max-w-md rounded-xl border border-gray-200 px-3 text-sm"
                >
                  {data.influencers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.fullName}
                    </option>
                  ))}
                </select>

                {selectedInfluencer && (
                  <div className="mt-4 grid md:grid-cols-3 gap-3">
                    <div className="border border-gray-200 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Referans Linki</p>
                      <p className="text-xs font-mono text-gray-800 mt-1 break-all">
                        {selectedInfluencer.referralUrl}
                      </p>
                      <button
                        onClick={() => void handleCopy(selectedInfluencer.referralUrl)}
                        className="mt-3 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-700 inline-flex items-center gap-1"
                      >
                        <Copy size={12} />
                        Kopyala
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Takipçi Kuponu</p>
                      <p className="text-lg font-black text-gray-900 mt-1 font-mono">
                        {selectedInfluencer.couponCode}
                      </p>
                      <p className="text-xs text-gray-500">%{selectedInfluencer.couponDiscountRate} indirim</p>
                      <button
                        onClick={() => void handleCopy(selectedInfluencer.couponCode)}
                        className="mt-3 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-700 inline-flex items-center gap-1"
                      >
                        <Copy size={12} />
                        Kopyala
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Kişisel İndirim</p>
                      <p className="text-lg font-black text-gray-900 mt-1 font-mono">
                        {selectedInfluencer.personalDiscountCode}
                      </p>
                      <p className="text-xs text-gray-500">%{selectedInfluencer.personalDiscountRate} indirim</p>
                      <button
                        onClick={() => void handleCopy(selectedInfluencer.personalDiscountCode)}
                        className="mt-3 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-700 inline-flex items-center gap-1"
                      >
                        <Copy size={12} />
                        Kopyala
                      </button>
                    </div>
                  </div>
                )}

                {selectedInfluencer && (
                  <div className="mt-4 border border-gray-200 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-2">Paylaşım Kısayolları</p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `${selectedInfluencer.referralUrl} Kupon: ${selectedInfluencer.couponCode}`,
                        )}`}
                        target="_blank"
                        className="h-8 px-3 rounded-lg bg-green-100 text-green-700 text-xs font-semibold inline-flex items-center"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                          `${selectedInfluencer.referralUrl} Kupon: ${selectedInfluencer.couponCode}`,
                        )}`}
                        target="_blank"
                        className="h-8 px-3 rounded-lg bg-black text-white text-xs font-semibold inline-flex items-center"
                      >
                        X
                      </a>
                      <a
                        href="https://www.instagram.com/"
                        target="_blank"
                        className="h-8 px-3 rounded-lg bg-pink-100 text-pink-700 text-xs font-semibold inline-flex items-center"
                      >
                        Instagram
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "payouts" && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-bold text-gray-900">Ödeme Ekle</h2>
            <div className="grid md:grid-cols-5 gap-3">
              <select
                value={payoutForm.influencerId}
                onChange={(e) => setPayoutForm((prev) => ({ ...prev, influencerId: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
              >
                <option value="">Influencer Seç</option>
                {data.influencers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fullName}
                  </option>
                ))}
              </select>
              <input
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="Tutar"
                type="number"
                className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
              />
              <input
                value={payoutForm.periodStart}
                onChange={(e) => setPayoutForm((prev) => ({ ...prev, periodStart: e.target.value }))}
                placeholder="Başlangıç"
                type="date"
                className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
              />
              <input
                value={payoutForm.periodEnd}
                onChange={(e) => setPayoutForm((prev) => ({ ...prev, periodEnd: e.target.value }))}
                placeholder="Bitiş"
                type="date"
                className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
              />
              <select
                value={payoutForm.status}
                onChange={(e) => setPayoutForm((prev) => ({ ...prev, status: e.target.value as PayoutStatus }))}
                className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
              >
                <option value="pending">Beklemede</option>
                <option value="paid">Ödendi</option>
                <option value="cancelled">İptal</option>
              </select>
            </div>
            <textarea
              value={payoutForm.note}
              onChange={(e) => setPayoutForm((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Açıklama"
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
            />
            <button
              onClick={() => void addPayout()}
              disabled={saving}
              className="h-9 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Wallet size={14} />
              Kaydet
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500">
                  <th className="py-3 text-left">Influencer</th>
                  <th className="py-3 text-left">Tutar</th>
                  <th className="py-3 text-left">Dönem</th>
                  <th className="py-3 text-left">Durum</th>
                  <th className="py-3 text-left">Not</th>
                  <th className="py-3 text-left">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.payouts.map((payout) => {
                  const influencer = data.influencers.find((item) => item.id === payout.influencerId);
                  return (
                    <tr key={payout.id}>
                      <td className="py-3 text-sm text-gray-800">{influencer?.fullName ?? "-"}</td>
                      <td className="py-3 text-sm font-semibold text-gray-900">{formatCurrency(payout.amount)}</td>
                      <td className="py-3 text-xs text-gray-600">
                        {payout.periodStart || "-"} / {payout.periodEnd || "-"}
                      </td>
                      <td className="py-3">
                        <select
                          value={payout.status}
                          onChange={(e) =>
                            void mutate({
                              action: "updatePayout",
                              payout: { id: payout.id, status: e.target.value },
                            })
                          }
                          className="h-8 px-2 rounded-lg border border-gray-200 text-xs"
                        >
                          <option value="pending">Beklemede</option>
                          <option value="paid">Ödendi</option>
                          <option value="cancelled">İptal</option>
                        </select>
                      </td>
                      <td className="py-3 text-xs text-gray-600">{payout.note || "-"}</td>
                      <td className="py-3">
                        <button
                          onClick={() => {
                            if (confirm("Ödeme kaydını silmek istiyor musunuz?")) {
                              void mutate({ action: "deletePayout", id: payout.id });
                            }
                          }}
                          className="w-8 h-8 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 inline-flex items-center justify-center"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {data.payouts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-gray-500">
                      Ödeme kaydı yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 inline-flex items-center gap-2">
            <Settings2 size={14} />
            Program Ayarları
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              value={settingsForm.baseUrl}
              onChange={(e) => setSettingsForm((prev) => (prev ? { ...prev, baseUrl: e.target.value } : prev))}
              placeholder="Site URL"
              className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
            />
            <input
              value={settingsForm.defaultCommissionRate}
              onChange={(e) =>
                setSettingsForm((prev) =>
                  prev ? { ...prev, defaultCommissionRate: Number(e.target.value) || 0 } : prev,
                )
              }
              type="number"
              placeholder="Varsayılan Komisyon"
              className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
            />
            <input
              value={settingsForm.defaultCouponDiscountRate}
              onChange={(e) =>
                setSettingsForm((prev) =>
                  prev ? { ...prev, defaultCouponDiscountRate: Number(e.target.value) || 0 } : prev,
                )
              }
              type="number"
              placeholder="Varsayılan İndirim"
              className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
            />
            <input
              value={settingsForm.cookieDays}
              onChange={(e) =>
                setSettingsForm((prev) =>
                  prev ? { ...prev, cookieDays: Number(e.target.value) || 0 } : prev,
                )
              }
              type="number"
              placeholder="Cookie Gün"
              className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
            />
            <input
              value={settingsForm.minimumPayout}
              onChange={(e) =>
                setSettingsForm((prev) =>
                  prev ? { ...prev, minimumPayout: Number(e.target.value) || 0 } : prev,
                )
              }
              type="number"
              placeholder="Min Ödeme"
              className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
            />
            <input
              value={settingsForm.currency}
              onChange={(e) =>
                setSettingsForm((prev) =>
                  prev ? { ...prev, currency: e.target.value.toUpperCase() } : prev,
                )
              }
              placeholder="Para Birimi"
              className="h-10 px-3 rounded-xl border border-gray-200 text-sm"
            />
          </div>
          <button
            onClick={() => void saveSettings()}
            disabled={saving}
            className="h-9 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            Ayarları Kaydet
          </button>
        </div>
      )}

      {activeTab === "leads" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500">
                <th className="py-3 text-left">Kişi</th>
                <th className="py-3 text-left">İletişim</th>
                <th className="py-3 text-left">Kanal</th>
                <th className="py-3 text-left">Mesaj</th>
                <th className="py-3 text-left">Durum</th>
                <th className="py-3 text-left">Tarih</th>
                <th className="py-3 text-left">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="py-3">
                    <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.city || "-"}</p>
                  </td>
                  <td className="py-3 text-xs text-gray-600">
                    <p>{lead.email}</p>
                    <p>{lead.phone || "-"}</p>
                  </td>
                  <td className="py-3 text-xs text-gray-600">
                    <p>{lead.channel || "-"}</p>
                    <p>{lead.instagram || lead.website || "-"}</p>
                  </td>
                  <td className="py-3 text-xs text-gray-600 max-w-[300px] truncate">{lead.message || "-"}</td>
                  <td className="py-3">
                    <select
                      value={lead.status}
                      onChange={(e) => void updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      className="h-8 px-2 rounded-lg border border-gray-200 text-xs"
                    >
                      <option value="new">Yeni</option>
                      <option value="approved">Onaylı</option>
                      <option value="rejected">Reddedildi</option>
                    </select>
                  </td>
                  <td className="py-3 text-xs text-gray-600">
                    {new Date(lead.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => void convertLead(lead)}
                      className="h-8 px-3 rounded-lg bg-orange-500 text-white text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Ticket size={12} />
                      Influencer Yap
                    </button>
                  </td>
                </tr>
              ))}
              {data.leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-gray-500">
                    Başvuru yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
