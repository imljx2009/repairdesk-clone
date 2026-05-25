"use client";

import { useStore } from "@/lib/store-context";
import { Store, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function StoreSwitcher() {
  const { store, stores, setStore } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!store) return null;

  return (
    <div ref={ref} className="relative px-3 py-3 border-b border-slate-700">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-sm text-slate-300 hover:text-white transition-colors"
      >
        <Store size={16} />
        <span className="truncate flex-1 text-left">{store.name}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-2 right-2 top-full mt-1 bg-slate-700 rounded-lg shadow-lg z-50 py-1">
          {stores.map((s) => (
            <button
              key={s.id}
              onClick={() => { setStore(s); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                s.id === store.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-200 hover:bg-slate-600"
              }`}
            >
              <p className="font-medium">{s.name}</p>
              {s.address && <p className="text-xs text-slate-400 truncate">{s.address}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
