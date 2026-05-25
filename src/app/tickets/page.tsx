"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useStore } from "@/lib/store-context";

interface Customer { id: number; name: string; phone: string; }

interface Ticket {
  id: number; ticketNumber: string; customer: Customer;
  deviceName: string; deviceModel: string | null; serialNumber: string | null;
  issue: string; status: string; cost: number; notes: string | null; createdAt: string;
}

const statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const emptyForm = { customerId: "", deviceName: "", deviceModel: "", serialNumber: "", issue: "", cost: "0", notes: "" };

export default function TicketsPage() {
  const { store } = useStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  function headers(extra?: Record<string, string>) {
    return { "Content-Type": "application/json", "x-store-id": String(store?.id || 1), ...extra };
  }

  useEffect(() => {
    if (!store) return;
    const sid = String(store.id);
    fetch("/api/tickets", { headers: { "x-store-id": sid } }).then((r) => r.json()).then(setTickets);
    fetch("/api/customers", { headers: { "x-store-id": sid } }).then((r) => r.json()).then(setCustomers);
  }, [store]);

  const filtered = tickets.filter((t) =>
    t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
    t.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    t.deviceName.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, customerId: Number(form.customerId), cost: Number(form.cost), deviceModel: form.deviceModel || null, serialNumber: form.serialNumber || null, notes: form.notes || null };
    if (editing) {
      const res = await fetch(`/api/tickets/${editing.id}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) });
      const updated = await res.json();
      setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const res = await fetch("/api/tickets", { method: "POST", headers: headers(), body: JSON.stringify(body) });
      setTickets([await res.json(), ...tickets]);
    }
    setShowForm(false); setEditing(null); setForm(emptyForm);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this ticket?")) return;
    await fetch(`/api/tickets/${id}`, { method: "DELETE", headers: { "x-store-id": String(store?.id || 1) } });
    setTickets(tickets.filter((t) => t.id !== id));
  }

  function handleEdit(ticket: Ticket) {
    setEditing(ticket);
    setForm({ customerId: String(ticket.customer.id), deviceName: ticket.deviceName, deviceModel: ticket.deviceModel || "", serialNumber: ticket.serialNumber || "", issue: ticket.issue, cost: String(ticket.cost), notes: ticket.notes || "" });
    setShowForm(true);
  }

  async function handleStatusChange(ticket: Ticket, newStatus: string) {
    const res = await fetch(`/api/tickets/${ticket.id}`, { method: "PUT", headers: headers(), body: JSON.stringify({ status: newStatus }) });
    const updated = await res.json();
    setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
  }

  const statusStyles: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-700", IN_PROGRESS: "bg-blue-50 text-blue-700",
    COMPLETED: "bg-green-50 text-green-700", CANCELLED: "bg-red-50 text-red-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Repair Tickets</h1>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700"><Plus size={16} /> New Ticket</button>
      </div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Edit" : "New"} Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="">Select customer...</option>
                {customers.map((c) => (<option key={c.id} value={c.id}>{c.name} ({c.phone})</option>))}
              </select>
              <input required placeholder="Device Name" value={form.deviceName} onChange={(e) => setForm({ ...form, deviceName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <input placeholder="Device Model" value={form.deviceModel} onChange={(e) => setForm({ ...form, deviceModel: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <input placeholder="Serial Number" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <textarea required placeholder="Issue description" value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={3} />
              <input type="number" step="0.01" placeholder="Cost" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <textarea placeholder="Internal notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={2} />
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
              <th className="text-left px-4 py-3 font-medium text-slate-500">Ticket #</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Device</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Issue</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">Cost</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr key={ticket.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{ticket.ticketNumber}</td>
                <td className="px-4 py-3 font-medium">{ticket.customer.name}</td>
                <td className="px-4 py-3">{ticket.deviceName}{ticket.deviceModel ? ` (${ticket.deviceModel})` : ""}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{ticket.issue}</td>
                <td className="px-4 py-3">
                  <select value={ticket.status} onChange={(e) => handleStatusChange(ticket, e.target.value)}
                    className={`text-xs px-2 py-1 rounded border-0 font-medium cursor-pointer ${statusStyles[ticket.status] || ""}`}>
                    {statuses.map((s) => (<option key={s} value={s}>{s.replace("_", " ")}</option>))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right font-medium">${ticket.cost.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(ticket)} className="text-blue-600 hover:text-blue-800 p-1"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(ticket.id)} className="text-red-600 hover:text-red-800 p-1 ml-1"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No tickets found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
