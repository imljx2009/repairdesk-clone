"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface Store {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

interface StoreContextType {
  store: Store | null;
  stores: Store[];
  setStore: (store: Store) => void;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType>({
  store: null,
  stores: [],
  setStore: () => {},
  loading: true,
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStoreState] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stores")
      .then((r) => r.json())
      .then((data) => {
        setStores(data);
        const saved = localStorage.getItem("selectedStoreId");
        const found = saved ? data.find((s: Store) => s.id === Number(saved)) : null;
        setStoreState(found || data[0] || null);
        setLoading(false);
      });
  }, []);

  function setStore(newStore: Store) {
    localStorage.setItem("selectedStoreId", String(newStore.id));
    setStoreState(newStore);
  }

  return (
    <StoreContext.Provider value={{ store, stores, setStore, loading }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
