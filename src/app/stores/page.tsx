"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store-context";

interface Store {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

const emptyForm = { name: "", address: "", phone: "", email: "" };

export default function StoresPage() {
  const { stores, setStore, store } = useStore();
  const [localStores, setLocalStores] = useState<Store[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setLocalStores(stores);
  }, [stores]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form };
    if (!body.address) body.address = null as any;
    if (!body.phone) body.phone = null as any;
    if (!body.email) body.email = null as any;

    if (editing) {
      const res = await fetch(`/api/stores/${editing.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      setLocalStores(localStores.map((s) => (s.id === updated.id ? updated : s)));
      if (store?.id === updated.id) setStore(updated);
    } else {
      const res = await fetch("/api/stores", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const created = await res.json();
      setLocalStores([...localStores, created]);
    }
    setShowForm(false); setEditing(null); setForm(emptyForm);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this store and all its data?")) return;
    await fetch(`/api/stores/${id}`, { method: "DELETE" });
    setLocalStores(localStores.filter((s) => s.id !== id));
    if (store?.id === id) {
      const remaining = localStores.filter((s) => s.id !== id);
      if (remaining.length > 0) setStore(remaining[0]);
    }
  }

  function handleEdit(s: Store) {
    setEditing(s);
    setForm({ name: s.name, address: s.address || "", phone: s.phone || "", email: s.email || "" });
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Stores</h1>
        <button
          onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={16} /> Add Store
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Edit" : "New"} Store</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Store Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <input placeholder="Address" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <input placeholder="Phone" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <input placeholder="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  {editing ? "Update" : "Create"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                  className="flex-1 bg-slate-200 py-2 rounded-lg text-sm font-medium hover:bg-slate-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {localStores.map((s) => (
          <div key={s.id} className={`bg-white rounded-xl shadow-sm border p-5 ${store?.id === s.id ? "ring-2 ring-blue-500" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                {s.address && <p className="text-sm text-slate-500 mt-1">{s.address}</p>}
                {s.phone && <p className="text-sm text-slate-500">{s.phone}</p>}
                {s.email && <p className="text-sm text-slate-500">{s.email}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800 p-1"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={15} /></button>
              </div>
            </div>
            {store?.id === s.id && (
              <p className="text-xs text-blue-600 font-medium mt-2">Currently selected</p>
            )}
            {store?.id !== s.id && (
              <button onClick={() => setStore(s)} className="text-xs text-slate-500 hover:text-blue-600 mt-2 font-medium">
                Switch to this store →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
