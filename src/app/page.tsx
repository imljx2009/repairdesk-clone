"use client";

import { useEffect, useState } from "react";
import { Users, Wrench, Package, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { useStore } from "@/lib/store-context";
import Link from "next/link";

export default function DashboardPage() {
  const { store } = useStore();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!store) return;
    fetch("/api/dashboard", {
      headers: { "x-store-id": String(store.id) },
    }).then((r) => r.json()).then(setData);
  }, [store]);

  if (!data) return <p className="text-slate-400">Loading...</p>;

  const stats = [
    { label: "Customers", value: data.customerCount, icon: Users, color: "bg-blue-500" },
    { label: "Tickets", value: data.ticketCount, icon: Wrench, color: "bg-orange-500" },
    { label: "Inventory Items", value: data.inventoryCount, icon: Package, color: "bg-green-500" },
    { label: "Revenue", value: `$${Number(data.revenue).toFixed(2)}`, icon: DollarSign, color: "bg-purple-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2"><Clock size={18} /> Ticket Status</h2>
            <Link href="/tickets" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => {
              const count = data.statusCounts?.find((s: any) => s.status === status)?._count || 0;
              const colors: Record<string, string> = {
                PENDING: "text-yellow-600 bg-yellow-50",
                IN_PROGRESS: "text-blue-600 bg-blue-50",
                COMPLETED: "text-green-600 bg-green-50",
                CANCELLED: "text-red-600 bg-red-50",
              };
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-slate-600">{status.replace("_", " ")}</span>
                  <span className={`font-semibold px-2 py-0.5 rounded ${colors[status]}`}>{count}</span>
                </div>
              );
            })}
          </div>

          {data.recentTickets?.length > 0 && (
            <>
              <h3 className="font-medium mt-5 mb-3 text-sm text-slate-500">Recent Tickets</h3>
              <div className="space-y-2">
                {data.recentTickets.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                    <span className="font-mono text-xs text-slate-400">{ticket.ticketNumber}</span>
                    <span className="flex-1 ml-2 truncate">{ticket.customer?.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      ticket.status === "PENDING" ? "bg-yellow-50 text-yellow-700" :
                      ticket.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700" :
                      "bg-green-50 text-green-700"
                    }`}>{ticket.status.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2"><AlertTriangle size={18} /> Low Stock Alerts</h2>
            <Link href="/inventory" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {data.lowStockCount === 0 ? (
            <p className="text-sm text-slate-500">All items are well stocked.</p>
          ) : (
            <p className="text-sm text-red-600 font-medium">{data.lowStockCount} item(s) below minimum stock</p>
          )}
        </div>
      </div>
    </div>
  );
}
