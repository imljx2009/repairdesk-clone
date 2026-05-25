"use client";

import { useEffect, useState } from "react";
import { Plus, Minus, Trash2, ShoppingCart, Search } from "lucide-react";
import { useStore } from "@/lib/store-context";

interface Customer { id: number; name: string; phone: string; }
interface InventoryItem { id: number; name: string; sku: string; quantity: number; price: number; }
interface CartItem { itemId: number; name: string; sku: string; price: number; quantity: number; }
interface Sale { id: number; saleNumber: string; customer: { name: string } | null; total: number; payment: string; createdAt: string; }

export default function POSPage() {
  const { store } = useStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [payment, setPayment] = useState("CASH");
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [showReceipt, setShowReceipt] = useState<Sale | null>(null);

  function headers() { return { "Content-Type": "application/json", "x-store-id": String(store?.id || 1) }; }

  useEffect(() => {
    if (!store) return;
    const sid = String(store.id);
    fetch("/api/customers", { headers: { "x-store-id": sid } }).then((r) => r.json()).then(setCustomers);
    fetch("/api/inventory", { headers: { "x-store-id": sid } }).then((r) => r.json()).then(setInventory);
    fetch("/api/pos", { headers: { "x-store-id": sid } }).then((r) => r.json()).then(setSales);
  }, [store]);

  const filteredItems = inventory.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(item: InventoryItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === item.id);
      if (existing) return prev.map((c) => c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { itemId: item.id, name: item.name, sku: item.sku, price: item.price, quantity: 1 }];
    });
  }

  function updateQuantity(itemId: number, delta: number) {
    setCart((prev) => prev.map((c) => c.itemId === itemId ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter((c) => c.quantity > 0));
  }

  function removeFromCart(itemId: number) {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  async function handleCheckout() {
    if (cart.length === 0) return;
    const res = await fetch("/api/pos", {
      method: "POST", headers: headers(),
      body: JSON.stringify({ customerId: customerId ? Number(customerId) : null, payment, items: cart.map((c) => ({ itemId: c.itemId, quantity: c.quantity, price: c.price })) }),
    });
    const sale = await res.json();
    setCart([]); setCustomerId(""); setShowReceipt(sale);
    fetch("/api/inventory", { headers: { "x-store-id": String(store?.id) } }).then((r) => r.json()).then(setInventory);
    fetch("/api/pos", { headers: { "x-store-id": String(store?.id) } }).then((r) => r.json()).then(setSales);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Point of Sale</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredItems.map((item) => (
                <button key={item.id} onClick={() => addToCart(item)} disabled={item.quantity <= 0}
                  className={`p-3 rounded-lg border text-left transition-colors ${item.quantity <= 0 ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "hover:border-blue-400 hover:bg-blue-50 cursor-pointer"}`}>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-slate-500">${item.price.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">{item.quantity} in stock</p>
                </button>
              ))}
              {filteredItems.length === 0 && <p className="col-span-full text-center text-slate-400 py-8">No products found</p>}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h2 className="font-semibold mb-3">Recent Sales</h2>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-slate-500"><th className="text-left py-2 font-medium">Sale #</th><th className="text-left py-2 font-medium">Customer</th><th className="text-left py-2 font-medium">Payment</th><th className="text-right py-2 font-medium">Total</th></tr></thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{sale.saleNumber}</td>
                    <td className="py-2">{sale.customer?.name || "Walk-in"}</td>
                    <td className="py-2">{sale.payment}</td>
                    <td className="py-2 text-right font-medium">${sale.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col h-fit sticky top-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><ShoppingCart size={18} /> Cart ({cart.length})</h2>
          <div className="space-y-2 mb-4 flex-1 min-h-[200px] max-h-[400px] overflow-y-auto">
            {cart.map((item) => (
              <div key={item.itemId} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-slate-500">${item.price.toFixed(2)} each</p></div>
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={() => updateQuantity(item.itemId, -1)} className="p-1 hover:bg-slate-200 rounded"><Minus size={14} /></button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.itemId, 1)} className="p-1 hover:bg-slate-200 rounded"><Plus size={14} /></button>
                  <button onClick={() => removeFromCart(item.itemId)} className="p-1 hover:bg-red-100 rounded ml-1"><Trash2 size={14} className="text-red-500" /></button>
                </div>
              </div>
            ))}
            {cart.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">Cart is empty</p>}
          </div>
          <div className="border-t pt-3 space-y-3">
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <div className="flex gap-2">
              {["CASH", "CARD"].map((p) => (
                <button key={p} onClick={() => setPayment(p)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${payment === p ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{p}</button>
              ))}
            </div>
            <div className="flex items-center justify-between text-lg font-bold"><span>Total</span><span>${total.toFixed(2)}</span></div>
            <button onClick={handleCheckout} disabled={cart.length === 0}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors">
              Charge ${total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
      {showReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-2">✓</div>
            <h2 className="text-lg font-bold mb-1">Payment Successful</h2>
            <p className="text-sm text-slate-500 mb-4">{showReceipt.saleNumber}</p>
            <p className="text-3xl font-bold mb-4">${showReceipt.total.toFixed(2)}</p>
            <p className="text-sm text-slate-500 mb-6">Paid via {showReceipt.payment}</p>
            <button onClick={() => setShowReceipt(null)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
