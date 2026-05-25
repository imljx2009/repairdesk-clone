"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wrench, Package, ShoppingCart, Building2, ClipboardCheck, LogOut } from "lucide-react";
import StoreSwitcher from "./StoreSwitcher";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/tickets", label: "Repair Tickets", icon: Wrench },
  { href: "/checkin", label: "Check-In", icon: ClipboardCheck },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/pos", label: "Point of Sale", icon: ShoppingCart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-tight">RepairDesk</h1>
        <p className="text-sm text-slate-400 mt-1">Shop Management</p>
      </div>
      <StoreSwitcher />
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-700 space-y-2">
        {user && (
          <div className="px-3 py-2 text-xs text-slate-400">
            <p className="font-medium text-slate-300">{user.name}</p>
            <p className="truncate">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-700 text-[10px] uppercase tracking-wider">{user.role}</span>
          </div>
        )}
        <Link
          href="/stores"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/stores"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          <Building2 size={18} />
          Manage Stores
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-700/30 hover:text-red-300 transition-colors w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
