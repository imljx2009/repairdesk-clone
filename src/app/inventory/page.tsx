"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useStore } from "@/lib/store-context";

interface InventoryItem {
  id: number; name: string; sku: string; category: string | null;
  quantity: number; price: number; cost: number; description: string | null; minStock: number;
}

const emptyForm = { name: "", sku: "", category: "", quantity: "0", price: "0", cost: "0", description: "", minStock: "0" };

export default function InventoryPage() {
  const { store } = useStore();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  function headers() { return { "Content-Type": "application/json", "x-store-id": String(store?.id || 1) }; }

  useEffect(() => {
    if (!store) return;
    fetch("/api/inventory", { headers: { "x-store-id": String(store.id) } }).then((r) => r.json()).then(setItems);
  }, [store]);

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()) || (i.category && i.category.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, quantity: Number(form.quantity), price: Number(form.price), cost: Number(form.cost), minStock: Number(form.minStock), category: form.category || null, description: form.description || null };
    if (editing) {
      const res = await fetch(`/api/inventory/${editing.id}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) });
      const updated = await res.json();
      setItems(items.map((i) => (i.id === updated.id ? updated : i)));
    } else {
      const res = await fetch("/api/inventory", { method: "POST", headers: headers(), body: JSON.stringify(body) });
      setItems([await res.json(), ...items]);
    }
    setShowForm(false); setEditing(null); setForm(emptyForm);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/inventory/${id}`, { method: "DELETE", headers: { "x-store-id": String(store?.id || 1) } });
    setItems(items.filter((i) => i.id !== id));
  }

  function handleEdit(item: InventoryItem) {
    setEditing(item);
    setForm({ name: item.name, sku: item.sku, category: item.category || "", quantity: String(item.quantity), price: String(item.price), cost: String(item.cost), description: item.description || "", minStock: String(item.minStock) });
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700"><Plus size={16} /> Add Item</button>
      </div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Edit" : "New"} Inventory Item</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                <input required placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs text-slate-500">Qty</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
                <div><label className="text-xs text-slate-500">Price</label><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
                <div><label className="text-xs text-slate-500">Cost</label><input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              </div>
              <div><label className="text-xs text-slate-500">Min Stock</label><input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={2} />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">{editing ? "Update" : "Create"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 bg-slate-200 py-2 rounded-lg text-sm font-medium hover:bg-slate-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th><th className="text-left px-4 py-3 font-medium text-slate-500">SKU</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Category</th><th className="text-right px-4 py-3 font-medium text-slate-500">Qty</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">Price</th><th className="text-right px-4 py-3 font-medium text-slate-500">Cost</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className={`border-b last:border-0 hover:bg-slate-50 ${item.quantity <= item.minStock ? "bg-red-50" : ""}`}>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.sku}</td>
                <td className="px-4 py-3 text-slate-500">{item.category || "—"}</td>
                <td className={`px-4 py-3 text-right font-medium ${item.quantity <= item.minStock ? "text-red-600" : ""}`}>{item.quantity}{item.quantity <= item.minStock && " ⚠"}</td>
                <td className="px-4 py-3 text-right">${item.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-slate-500">${item.cost.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 p-1"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1 ml-1"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No items found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
