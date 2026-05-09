"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, X, CheckCircle2, Shield, User, Mail } from "lucide-react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const ROLES = ["Yönetici", "Editör", "Moderatör"];
const STATUSES = ["Aktif", "Pasif"];

function UserModal({
  user,
  onClose,
  onSave,
}: {
  user: Partial<AdminUser> | null;
  onClose: () => void;
  onSave: (u: Partial<AdminUser>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<AdminUser>>(
    user ?? { name: "", email: "", role: "Editör", status: "Aktif" }
  );
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isNew = !user?.id;

  const set = (k: keyof AdminUser) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">{isNew ? "Yeni Kullanıcı" : "Kullanıcıyı Düzenle"}</h3>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Ad Soyad</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.name ?? ""} onChange={set("name")} placeholder="Ad Soyad"
                  className="h-10 w-full pl-9 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:bg-white focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">E-posta</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.email ?? ""} onChange={set("email")} type="email" placeholder="ornek@drmaxx.com"
                  className="h-10 w-full pl-9 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:bg-white focus:outline-none" />
              </div>
            </div>
            {isNew && (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Şifre</label>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="En az 8 karakter"
                  className="h-10 w-full px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:bg-white focus:outline-none" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Rol</label>
                <select value={form.role ?? "Editör"} onChange={set("role")}
                  className="h-10 w-full px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:bg-white focus:outline-none">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Durum</label>
                <select value={form.status ?? "Aktif"} onChange={set("status")}
                  className="h-10 w-full px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:bg-white focus:outline-none">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${saved ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
              {saved ? <><CheckCircle2 size={15} /> Kaydedildi</> : saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button onClick={onClose} className="h-10 px-4 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">İptal</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function KullanicilarPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<AdminUser> | null | false>(false);

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(data => { setUsers(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (u: Partial<AdminUser>) => {
    if (u.id) {
      await fetch("/api/admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(u) });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, ...u } as AdminUser : x));
    } else {
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(u) });
      const created = await res.json();
      setUsers(prev => [...prev, created]);
    }
  };

  const handleDelete = async (id: number) => {
    if (id === 1) { alert("Varsayılan yönetici silinemez."); return; }
    if (!confirm("Bu kullanıcıyı silmek istiyor musunuz?")) return;
    await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kullanıcılar</h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} kullanıcı</p>
        </div>
        <button onClick={() => setModal(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors shadow-md shadow-orange-200">
          <Plus size={15} /> Yeni Kullanıcı
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Kullanıcı", "Rol", "Durum", "Kayıt Tarihi", "İşlemler"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                      <Shield size={12} className="text-orange-400" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal(user)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all">
                        <Edit3 size={14} />
                      </button>
                      {user.id !== 1 && (
                        <button onClick={() => handleDelete(user.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal !== false && (
        <UserModal user={modal} onClose={() => setModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
