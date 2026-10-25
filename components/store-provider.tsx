"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { initialize, loadOrders, makeStore, restoreSession, setOrders, syncMenu } from "@/lib/store/store";
import type { Food } from "@/lib/menu-data";

function StoreSync() {
  const dispatch = useAppDispatch();
  const { cart, initialized, sessionStatus, user } = useAppSelector((state) => state.app);
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
    const request = dispatch(restoreSession());
    return () => request.abort();
  }, [dispatch]);

  useEffect(() => {
    if (initialized) localStorage.setItem("friday-cart", JSON.stringify(cart));
  }, [cart, initialized]);

  useEffect(() => {
    if (!initialized) return;
    const controller = new AbortController();
    fetch("/api/menu", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not refresh menu.");
        dispatch(syncMenu(result.items as Food[]));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Could not synchronize cart with current menu.", error);
      });
    return () => controller.abort();
  }, [dispatch, initialized]);

  useEffect(() => {
    if (sessionStatus !== "ready") return;
    if (!userId) {
      dispatch(setOrders([]));
      return;
    }
    const request = dispatch(loadOrders());
    return () => request.abort();
  }, [dispatch, sessionStatus, userId]);

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
