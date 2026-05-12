"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";

type OriginalityRecord = {
  id: string;
  lisansKod: string;
  productName: string;
  productSlug: string;
  serialNo: string;
  batchNo: string;
  productionDate: string;
  expiryDate: string;
  soldToName: string;
  soldToCity: string;
  soldToPhone: string;
  soldAt: string;
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const EMPTY_FORM: Omit<OriginalityRecord, "id" | "createdAt" | "updatedAt"> = {
  lisansKod: "",
  productName: "",
  productSlug: "",
  serialNo: "",
  batchNo: "",
  productionDate: "",
  expiryDate: "",
  soldToName: "",
  soldToCity: "",
  soldToPhone: "",
  soldAt: "",
  notes: "",
  active: true,
};

const inputClassName =
  "w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-gray-800 focus:border-orange-400 focus:outline-none";

const normalizeLicenseCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");

export default function AdminOrijinallikPage() {
  const [records, setRecords] = useState<OriginalityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const activeCount = useMemo(
    () => records.filter((item) => item.active).length,
    [records],
  );

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/orijinallik");
      const data = (await res.json()) as OriginalityRecord[];
      setRecords(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRecords();
  }, []);

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormOpen(false);
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (item: OriginalityRecord) => {
    setForm({
      lisansKod: item.lisansKod,
      productName: item.productName,
      productSlug: item.productSlug,
      serialNo: item.serialNo,
      batchNo: item.batchNo,
      productionDate: item.productionDate,
      expiryDate: item.expiryDate,
      soldToName: item.soldToName,
      soldToCity: item.soldToCity,
      soldToPhone: item.soldToPhone,
      soldAt: item.soldAt,
      notes: item.notes,
      active: item.active,
    });
    setEditingId(item.id);
    setFormOpen(true);
  };

  const saveRecord = async () => {
    const lisansKod = normalizeLicenseCode(form.lisansKod);
    if (!lisansKod) {
      alert("Lisans kodu zorunludur.");
      return;
    }

    setSaving(true);
    const payload = { ...form, lisansKod };

    try {
      const res = await fetch("/api/cms/orijinallik", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        alert(data.error ?? "Kayıt işlemi başarısız.");
        return;
      }

      await fetchRecords();
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Bu kaydı silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/cms/orijinallik?id=${id}`, { method: "DELETE" });
    await fetchRecords();
  };

  const buildVerifyLink = (lisansKod: string) =>
    `${origin}/orijinallik-sorgulama?lisanskod=${encodeURIComponent(lisansKod)}`;

  const buildQrImage = (lisansKod: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(buildVerifyLink(lisansKod))}`;

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orijinallik QR Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">
            {records.length} kayıt · {activeCount} aktif
          </p>
        </div>
        <button
          onClick={openNew}
          className="h-10 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Yeni Kayıt
        </button>
      </div>

      {formOpen && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">
              {editingId ? "Kayıt Düzenle" : "Yeni Kayıt Ekle"}
            </h2>
            <button
              onClick={resetForm}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 inline-flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className={inputClassName}
              placeholder="Lisans Kodu *"
              value={form.lisansKod}
              onChange={(e) => setField("lisansKod", e.target.value)}
            />
            <input
              className={inputClassName}
              placeholder="Ürün Adı"
              value={form.productName}
              onChange={(e) => setField("productName", e.target.value)}
            />
            <input
              className={inputClassName}
              placeholder="Ürün Slug (opsiyonel)"
              value={form.productSlug}
              onChange={(e) => setField("productSlug", e.target.value)}
            />
            <input
              className={inputClassName}
              placeholder="Seri No"
              value={form.serialNo}
              onChange={(e) => setField("serialNo", e.target.value)}
            />
            <input
              className={inputClassName}
              placeholder="Parti No"
              value={form.batchNo}
              onChange={(e) => setField("batchNo", e.target.value)}
            />
            <input
              className={inputClassName}
              placeholder="Telefon"
              value={form.soldToPhone}
              onChange={(e) => setField("soldToPhone", e.target.value)}
            />
            <input
              className={inputClassName}
              placeholder="Satılan Kişi"
              value={form.soldToName}
              onChange={(e) => setField("soldToName", e.target.value)}
            />
            <input
              className={inputClassName}
              placeholder="İl"
              value={form.soldToCity}
              onChange={(e) => setField("soldToCity", e.target.value)}
            />
            <label className="text-xs text-gray-500 flex flex-col gap-1">
              Satış Tarihi
              <input
                className={inputClassName}
                type="date"
                value={form.soldAt}
                onChange={(e) => setField("soldAt", e.target.value)}
              />
            </label>
            <label className="text-xs text-gray-500 flex flex-col gap-1">
              Üretim Tarihi
              <input
                className={inputClassName}
                type="date"
                value={form.productionDate}
                onChange={(e) => setField("productionDate", e.target.value)}
              />
            </label>
            <label className="text-xs text-gray-500 flex flex-col gap-1">
              Son Kullanım Tarihi
              <input
                className={inputClassName}
                type="date"
                value={form.expiryDate}
                onChange={(e) => setField("expiryDate", e.target.value)}
              />
            </label>
            <div className="flex items-end">
              <button
                onClick={() => setField("active", !form.active)}
                className={`h-10 px-4 rounded-xl text-sm font-semibold ${
                  form.active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {form.active ? "Aktif" : "Pasif"}
              </button>
            </div>
          </div>

          <textarea
            className="w-full min-h-20 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-orange-400 focus:outline-none"
            placeholder="Not"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
            >
              İptal
            </button>
            <button
              onClick={() => void saveRecord()}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-gray-500">Yükleniyor...</div>
        ) : records.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Kayıt bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Lisans</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Ürün</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">SKT</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Satış</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">QR</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((item) => {
                  const verifyLink = buildVerifyLink(item.lisansKod);
                  const qrText = copied === verifyLink ? "Kopyalandı" : "Link Kopyala";

                  return (
                    <tr key={item.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-gray-900">{item.lisansKod}</p>
                        {item.serialNo && (
                          <p className="text-xs text-gray-500 mt-1">Seri: {item.serialNo}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{item.productName || "-"}</p>
                        {item.batchNo && (
                          <p className="text-xs text-gray-500 mt-1">Parti: {item.batchNo}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{item.expiryDate || "-"}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700">{item.soldToName || "-"}</p>
                        <p className="text-xs text-gray-500">
                          {[item.soldToCity, item.soldToPhone].filter(Boolean).join(" · ") || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={buildQrImage(item.lisansKod)}
                            alt={item.lisansKod}
                            className="w-16 h-16 rounded-md border border-gray-200"
                          />
                          <button
                            onClick={() => void copyText(verifyLink)}
                            className="h-8 px-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 inline-flex items-center gap-1"
                          >
                            {copied === verifyLink ? <Check size={12} /> : <Copy size={12} />}
                            {qrText}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex h-7 px-2 rounded-full text-xs font-semibold items-center ${
                            item.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.active ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 inline-flex items-center justify-center"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => void deleteRecord(item.id)}
                            className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-red-50 text-red-500 inline-flex items-center justify-center"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700 flex items-start gap-2">
        <ShieldCheck size={16} className="mt-0.5" />
        QR, `lisanskod` parametresi içeren doğrulama linki ile üretilir ve ön yüzde kamera ile okutulabilir.
      </div>
    </div>
  );
}
