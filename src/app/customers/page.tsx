"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useStore } from "@/lib/store-context";

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  notes: string | null;
}

const emptyForm = { name: "", email: "", phone: "", address: "", notes: "" };

export default function CustomersPage() {
  const { store } = useStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  function headers() {
    return { "Content-Type": "application/json", "x-store-id": String(store?.id || 1) };
  }

  useEffect(() => {
    if (!store) return;
    fetch("/api/customers", { headers: { "x-store-id": String(store.id) } })
      .then((r) => r.json()).then(setCustomers);
  }, [store]);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form };
    if (!body.email) body.email = null as any;
    if (!body.address) body.address = null as any;
    if (!body.notes) body.notes = null as any;
    if (editing) {
      const res = await fetch(`/api/customers/${editing.id}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) });
      const updated = await res.json();
      setCustomers(customers.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      const res = await fetch("/api/customers", { method: "POST", headers: headers(), body: JSON.stringify(body) });
      setCustomers([await res.json(), ...customers]);
    }
    setShowForm(false); setEditing(null); setForm(emptyForm);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this customer?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE", headers: { "x-store-id": String(store?.id || 1) } });
    setCustomers(customers.filter((c) => c.id !== id));
  }

  function handleEdit(customer: Customer) {
    setEditing(customer);
    setForm({ name: customer.name, email: customer.email || "", phone: customer.phone, address: customer.address || "", notes: customer.notes || "" });
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700">
          <Plus size={16} /> Add Customer
        </button>
      </div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Edit" : "New"} Customer</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={3} />
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
              <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th><th className="text-left px-4 py-3 font-medium text-slate-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Phone</th><th className="text-left px-4 py-3 font-medium text-slate-500">Address</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{customer.name}</td>
                <td className="px-4 py-3 text-slate-500">{customer.email || "—"}</td>
                <td className="px-4 py-3">{customer.phone}</td>
                <td className="px-4 py-3 text-slate-500">{customer.address || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:text-blue-800 p-1"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-800 p-1 ml-1"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No customers found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
