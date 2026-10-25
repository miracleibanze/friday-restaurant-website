'use client'

import { EmptyState, money, PageLoader, SectionTitle } from "@/components/storefront-ui";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { loadOrders, restoreSession } from "@/lib/store/store";
import Link from "next/link";

export default function OrderHistoryPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.app.user);
  const orders = useAppSelector((state) => state.app.orders);
  const error = useAppSelector((state) => state.app.ordersError);
  const sessionStatus = useAppSelector((state) => state.app.sessionStatus);
  const ordersStatus = useAppSelector((state) => state.app.ordersStatus);

  if (sessionStatus === "idle" || sessionStatus === "loading") {
    return <PageLoader label="Checking your account…" />;
  }
  if (sessionStatus === "error") {
    return (
      <main className="shell py-14">
        <SectionTitle eyebrow="Your account" title="Orders unavailable." />
        <p role="alert" className="mt-5 text-sm text-red-700">
          We couldn’t verify your session. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => void dispatch(restoreSession())}
          className="mt-5 font-semibold text-friday underline underline-offset-4"
        >
          Try again
        </button>
      </main>
    );
  }
  if (user && (ordersStatus === "idle" || ordersStatus === "loading")) {
    return <PageLoader label="Loading your orders…" />;
  }
  if (!user)
    return (
      <EmptyState
        title="Log in to see previous orders."
        text="Your Friday favourites are even easier to reorder."
        href="/login"
        action="Log in"
      />
    );
  return (
    <main className="shell py-14">
      <SectionTitle eyebrow="Your account" title="Order history." />
      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          <p role="alert">{error}</p>
          <button type="button" onClick={() => void dispatch(loadOrders())} className="underline underline-offset-4">
            Try again
          </button>
        </div>
      )}
      {orders.length ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order-details/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-white p-6 soft-ring"
            >
              <div>
                <p className="font-display text-xl">
                  {order.orderNumber}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {order.items.length} items ·{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "Recent"}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold capitalize text-green-700">
                  {order.status}
                </span>
                <p className="mt-2 font-bold">{money(order.total)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        !error && (
          <EmptyState
            title="No orders yet."
            text="Once you order, everything will appear here."
            href="/#products"
            action="Browse to Home"
            compact
          />
        )
      )}
    </main>
  );
}
