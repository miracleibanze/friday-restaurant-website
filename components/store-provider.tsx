"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { makeStore, initialize, setOrders, setOrdersError, setUser } from "@/lib/store/store";

function StoreSync() {
  const dispatch = useAppDispatch();
  const { cart, initialized, user } = useAppSelector((state) => state.app);
  const userId = user?.id;

  useEffect(() => {
    let savedCart = [];
    let lastOrder = null;
    try {
      savedCart = JSON.parse(localStorage.getItem("friday-cart") || "[]");
      lastOrder = JSON.parse(localStorage.getItem("friday-order") || "null");
    } catch {
      localStorage.removeItem("friday-cart");
      localStorage.removeItem("friday-order");
    }

    dispatch(initialize({ cart: savedCart, lastOrder }));
    fetch("/api/auth")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not restore account session.");
        dispatch(result.user?.role === "customer" ? setUser(result.user) : setUser(null));
      })
      .catch((error: unknown) => {
        console.error("Could not restore account session.", error);
      });
  }, [dispatch]);

  useEffect(() => {
    if (initialized) localStorage.setItem("friday-cart", JSON.stringify(cart));
  }, [cart, initialized]);

  useEffect(() => {
    if (!userId) {
      dispatch(setOrders([]));
      return;
    }
    const controller = new AbortController();
    fetch("/api/orders", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load your orders.");
        dispatch(setOrders(result.orders));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        dispatch(setOrdersError(error instanceof Error ? error.message : "Could not load your orders."));
      });
    return () => controller.abort();
  }, [dispatch, userId]);

  return null;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();
  return (
    <Provider store={storeRef.current}>
      <StoreSync />
      {children}
    </Provider>
  );
}
