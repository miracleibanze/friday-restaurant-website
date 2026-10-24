"use client";

import { ConfirmedOrder } from "@/components/storefront-ui";
import { useAppSelector } from "@/lib/store/hooks";
import { PageLoader } from "@/components/storefront-ui";

export default function OrderConfirmationPage({ id }: { id?: string }) {
  const initialized = useAppSelector((state) => state.app.initialized);
  const sessionStatus = useAppSelector((state) => state.app.sessionStatus);
  const ordersStatus = useAppSelector((state) => state.app.ordersStatus);
  const user = useAppSelector((state) => state.app.user);
  const order = useAppSelector((state) =>
    id
      ? state.app.orders.find((item) => item.id === id) || null
      : state.app.lastOrder,
  );
  if (!initialized || sessionStatus === "idle" || sessionStatus === "loading") {
    return <PageLoader label="Loading your order…" />;
  }
  if (id && user && (ordersStatus === "idle" || ordersStatus === "loading")) {
    return <PageLoader label="Finding your order…" />;
  }
  return <ConfirmedOrder order={order} />;
}
