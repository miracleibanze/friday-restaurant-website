"use client";

import { ConfirmedOrder } from "@/components/storefront-ui";
import { OrderConfirmationSkeleton } from "@/components/loading-skeletons";
import { useAppSelector } from "@/lib/store/hooks";

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
    return <OrderConfirmationSkeleton />;
  }
  if (id && user && (ordersStatus === "idle" || ordersStatus === "loading")) {
    return <OrderConfirmationSkeleton />;
  }
  return <ConfirmedOrder order={order} />;
}
