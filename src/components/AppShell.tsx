"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import { StoreProvider } from "@/lib/store-context";
import Sidebar from "./Sidebar";

const noSidebarPaths = ["/login", "/register"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = noSidebarPaths.includes(pathname);

  return (
    <AuthProvider>
      <StoreProvider>
        <div className="flex">
          {!hideSidebar && <Sidebar />}
          <main className={`flex-1 overflow-auto ${hideSidebar ? "" : "p-6"}`}>
            {children}
          </main>
        </div>
      </StoreProvider>
    </AuthProvider>
  );
}
