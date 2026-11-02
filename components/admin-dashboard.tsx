"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LogOut,
  RefreshCw,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { StoreHeader } from "@/components/storefront-ui";
import AdminFeatures from "@/components/admin-features";
import { displayFoodName } from "@/lib/accompaniments";

type OrderStatus =
  | "confirmed"
  | "preparing"
  | "on-the-way"
  | "delivered"
  | "cancelled";
type Order = {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  notes: string;
  items: Array<{
    food: string;
    name: string;
    price: number;
    quantity: number;
    accompaniments: { chips: number; samosa: number; pilau: number };
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  paymentReference: string;
  status: OrderStatus;
  createdAt: string;
};
type Counts = Record<string, number>;

const statuses: OrderStatus[] = [
  "confirmed",
  "preparing",
  "on-the-way",
  "delivered",
  "cancelled",
];
const statusLabels: Record<OrderStatus, string> = {
  confirmed: "New",
  preparing: "Preparing",
  "on-the-way": "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const money = (amount: number) =>
  `${new Intl.NumberFormat("en-RW").format(amount)} RWF`;
const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-friday focus:ring-4 focus:ring-orange-100";

async function readJson(response: Response) {
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "The request could not be completed.");
  return result;
}

export default function AdminDashboard() {
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState<Counts>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pages, setPages] = useState(0);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [activeSection, setActiveSection] = useState<
    "orders" | "menu" | "payments" | "inbox" | "reports" | "customers"
  >("orders");
  const ordersRequest = useRef<AbortController | null>(null);
  const allOrdersTotal = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0,
  );

  const query = useMemo(() => {
    const params = new URLSearchParams({
      status: filter,
      page: String(page),
      pageSize: String(pageSize),
    });
    if (appliedSearch) params.set("search", appliedSearch);
    return params.toString();
  }, [filter, appliedSearch, page, pageSize]);

  const loadOrders = useCallback(async () => {
    ordersRequest.current?.abort();
    const controller = new AbortController();
    ordersRequest.current = controller;
    setLoading(true);
    try {
      const result = await readJson(
        await fetch(`/api/admin/orders?${query}`, {
          signal: controller.signal,
        }),
      );
      setOrders(result.orders);
      setCounts(result.counts);
      setTotal(result.total);
      setPage(result.page);
      setPages(result.pages);
      setPageError("");
      setSelected((current) =>
        current
          ? result.orders.find((order: Order) => order.id === current.id) ||
            current
          : null,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setPageError(
        error instanceof Error ? error.message : "Could not load orders.",
      );
    } finally {
      if (ordersRequest.current === controller) {
        ordersRequest.current = null;
        setLoading(false);
      }
    }
  }, [query]);

  useEffect(() => {
    fetch("/api/auth")
      .then(readJson)
      .then((result) => setIsAdmin(result.user?.role === "admin"))
      .catch((error: unknown) =>
        setLoginError(
          error instanceof Error
            ? error.message
            : "Could not check your session.",
        ),
      )
      .finally(() => setChecked(true));
  }, []);

  useEffect(() => {
    if (!checked || !isAdmin) return;
    void loadOrders();
    const timer = window.setInterval(() => void loadOrders(), 15_000);
    return () => {
      window.clearInterval(timer);
      ordersRequest.current?.abort();
    };
  }, [checked, isAdmin, loadOrders]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await readJson(
        await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "admin-login", email, password }),
        }),
      );
      setIsAdmin(true);
      setPassword("");
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Could not sign in.",
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function changeStatus(order: Order, status: OrderStatus) {
    setUpdatingId(order.id);
    setPageError("");
    try {
      const result = await readJson(
        await fetch("/api/admin/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: order.id, status }),
        }),
      );
      setOrders((current) =>
        current.map((item) => (item.id === order.id ? result.order : item)),
      );
      setSelected((current) =>
        current?.id === order.id ? result.order : current,
      );
      void loadOrders();
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Could not update order.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function changePayment(
    order: Order,
    paymentStatus: Order["paymentStatus"],
    paymentReference: string,
  ) {
    setUpdatingId(order.id);
    setPageError("");
    try {
      const result = await readJson(
        await fetch("/api/admin/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: order.id,
            paymentStatus,
            paymentReference,
          }),
        }),
      );
      setOrders((current) =>
        current.map((item) => (item.id === order.id ? result.order : item)),
      );
      setSelected((current) =>
        current?.id === order.id ? result.order : current,
      );
      void loadOrders();
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Could not update payment.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    setIsAdmin(false);
    setOrders([]);
    setSelected(null);
  }

  if (!checked) {
    return (
      <main className="grid min-h-screen place-items-center text-stone-500">
        Loading admin panel…
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <StoreHeader minimal />
        <main className="grid min-h-[calc(100vh-6rem)] place-items-center bg-cream px-5 py-12">
          <form
            onSubmit={login}
            className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-stone-900/5"
          >
            <p className="text-xs font-bold uppercase tracking-[.22em] text-friday">
              Friday Restaurant
            </p>
            <h1 className="font-display mt-3 text-4xl">Admin sign in</h1>
            <p className="mt-3 text-sm leading-6 text-stone-500">
              Sign in with the admin email and password configured on the
              server.
            </p>
            <label className="mt-7 block text-sm font-semibold">
              Email address
              <input
                className={`${inputClass} mt-2`}
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Password
              <input
                className={`${inputClass} mt-2`}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {loginError && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700"
              >
                {loginError}
              </p>
            )}
            <button
              disabled={loginLoading}
              className="mt-6 w-full rounded-full bg-charcoal px-5 py-3.5 text-sm font-bold text-white hover:bg-friday disabled:cursor-wait disabled:opacity-60"
            >
              {loginLoading ? "Signing in…" : "Sign in to orders"}
            </button>
            <a
              href="/"
              className="mt-5 block text-center text-sm font-semibold text-stone-500 hover:text-friday"
            >
              Back to the restaurant
            </a>
          </form>
        </main>
      </>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-2 flex-wrap sm:gap-4 sm:px-8 lg:flex-nowrap">
          <div>
            <p className="text-2xl font-head uppercase text-friday">
              Friday Restaurant
            </p>
            <h1 className="font-display mt-1">Admin dashboard</h1>
          </div>
          <div className="flex gap-2 ml-auto flex-wrap items-center justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-bold hover:bg-stone-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline"> Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-4 py-2.5 text-sm font-bold text-white hover:bg-friday"
            >
              <LogOut size={16} />{" "}
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <nav
          aria-label="Admin sections"
          className="mb-7 flex gap-2 overflow-x-auto pb-1"
        >
          {(
            [
              ["orders", "Orders"],
              ["menu", "Menu"],
              ["payments", "Payments"],
              ["inbox", "Support inbox"],
              ["reports", "Sales reports"],
              ["customers", "Customers"],
            ] as const
          ).map(([section, label]) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-bold ${activeSection === section ? "bg-friday text-white" : "bg-white text-stone-600 border border-stone-400 hover:bg-stone-100"}`}
            >
              {label}
            </button>
          ))}
        </nav>
        {activeSection === "orders" ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Metric
                title="All orders"
                value={allOrdersTotal}
                icon={<ShoppingBag size={18} />}
              />
              <Metric
                title="New requests"
                value={counts.confirmed || 0}
                icon={<Clock3 size={18} />}
              />
              <Metric
                title="Preparing"
                value={counts.preparing || 0}
                icon={<RefreshCw size={18} />}
              />
              <Metric
                title="On the way"
                value={counts["on-the-way"] || 0}
                icon={<ArrowDownToLine size={18} />}
              />
              <Metric
                title="Delivered"
                value={counts.delivered || 0}
                icon={<ShoppingBag size={18} />}
              />
            </section>

            <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="font-display text-2xl">Customer orders</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    New requests appear automatically every 15 seconds.
                  </p>
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    setPage(1);
                    setAppliedSearch(search.trim());
                  }}
                  className="flex w-full gap-2 lg:max-w-xl"
                >
                  <label className="relative flex-1">
                    <Search
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      className={`${inputClass} pl-10`}
                      placeholder="Order number, customer or email"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                  <button className="rounded-xl bg-friday px-5 text-sm font-bold text-white hover:bg-friday">
                    Search
                  </button>
                </form>
              </div>
              <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
                {["all", ...statuses].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setFilter(status);
                    }}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${filter === status ? "bg-charcoal text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                  >
                    {status === "all"
                      ? "All"
                      : statusLabels[status as OrderStatus]}{" "}
                    <span className="ml-1 opacity-70">
                      {status === "all" ? allOrdersTotal : counts[status] || 0}
                    </span>
                  </button>
                ))}
              </div>

              {pageError && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700"
                >
                  {pageError}
                </p>
              )}
              {loading && !orders.length ? (
                <p className="py-16 text-center text-sm text-stone-500">
                  Loading orders…
                </p>
              ) : orders.length ? (
                <div className="mt-5 divide-y divide-stone-100">
                  {orders.map((order) => (
                    <article
                      key={order.id}
                      className="flex flex-col gap-4 border-b border-stone-200 py-5 last:border-b-0 md:flex-row md:items-center hover:bg-stone-50"
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(order)}
                        className="min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">{order.orderNumber}</span>
                          <StatusPill status={order.status} />
                        </div>

                        <p className="mt-1 truncate text-sm text-stone-700">
                          {order.customerName} · {order.email}
                        </p>

                        <p className="mt-1 text-xs text-stone-400">
                          {new Date(order.createdAt).toLocaleString()} ·{" "}
                          {order.items.length} item
                          {order.items.length === 1 ? "" : "s"}
                        </p>

                        {order.notes?.trim() && (
                          <div className="mt-3 rounded-xl bg-stone-200 px-3 py-2">
                            <p className="text-xs font-semibold text-stone-500">
                              Customer notes
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-stone-700">
                              {order.notes}
                            </p>
                          </div>
                        )}
                      </button>

                      <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
                        <span className="font-display text-lg">
                          {money(order.total)}
                        </span>

                        <div className="flex items-center gap-2">
                          
                          <select
                            aria-label={`Update ${order.orderNumber} status`}
                            className="max-w-40 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold"
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(event) =>
                              void changeStatus(
                                order,
                                event.target.value as OrderStatus,
                              )
                            }
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {statusLabels[status]}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => setSelected(order)}
                            className="rounded-xl border border-sage px-3 py-2 text-sm font-bold bg-sage text-white transition hover:scale-105"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="py-16 text-center text-sm text-stone-500">
                  No orders match this filter yet.
                </p>
              )}
              <div className="mt-5 flex flex-col gap-4 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-stone-500">
                  {total
                    ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total} orders`
                    : "No orders to show"}
                </p>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <label className="flex items-center gap-2 text-sm text-stone-600">
                    Rows
                    <select
                      aria-label="Orders per page"
                      className="rounded-lg border border-stone-200 bg-white px-2.5 py-2 font-semibold"
                      value={pageSize}
                      onChange={(event) => {
                        setPage(1);
                        setPageSize(Number(event.target.value));
                      }}
                    >
                      {[10, 20, 50, 100].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="min-w-16 text-center text-sm text-stone-500">
                      {pages ? `${page} / ${pages}` : "0 / 0"}
                    </span>
                    <button
                      type="button"
                      aria-label="Previous page"
                      disabled={page <= 1 || loading}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      className="rounded-lg border border-stone-400 p-2 hover:bg-stone-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next page"
                      disabled={!pages || page >= pages || loading}
                      onClick={() =>
                        setPage((current) => Math.min(pages, current + 1))
                      }
                      className="rounded-lg border border-stone-400 p-2 hover:bg-stone-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <AdminFeatures section={activeSection} />
        )}
      </div>

      {selected && (
        <OrderModal
          key={selected.id}
          order={selected}
          updating={updatingId === selected.id}
          onClose={() => setSelected(null)}
          onStatus={(status) => void changeStatus(selected, status)}
          onPayment={(status, reference) =>
            void changePayment(selected, status, reference)
          }
        />
      )}
    </main>
  );
}

function Metric({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between text-sm font-semibold text-stone-500">
        <span>{title}</span>
        <span className="text-friday">{icon}</span>
      </div>
      <p className="font-display mt-3 text-3xl">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const color =
    status === "delivered"
      ? "bg-green-50 text-green-700"
      : status === "cancelled"
        ? "bg-red-50 text-red-700"
        : status === "confirmed"
          ? "bg-orange-50 text-orange-700"
          : "bg-blue-50 text-blue-700";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>
      {statusLabels[status]}
    </span>
  );
}

function OrderModal({
  order,
  updating,
  onClose,
  onStatus,
  onPayment,
}: {
  order: Order;
  updating: boolean;
  onClose: () => void;
  onStatus: (status: OrderStatus) => void;
  onPayment: (status: Order["paymentStatus"], reference: string) => void;
}) {
  const [paymentReference, setPaymentReference] = useState(
    order.paymentReference ?? "",
  );
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-friday">
              Order request
            </p>
            <h2 id="order-modal-title" className="font-display mt-2 text-3xl">
              {order.orderNumber}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="rounded-full bg-stone-100 p-2 hover:bg-stone-200"
          >
            <X size={19} />
          </button>
        </div>
        <div className="mt-6 grid gap-4 rounded-2xl bg-stone-50 p-5 sm:grid-cols-2">
          <Detail label="Customer" value={order.customerName} />
          <Detail label="Email" value={order.email} />
          <Detail label="Phone" value={order.phone} />
          <Detail label="Delivery address" value={order.deliveryAddress} />
          <Detail
            label="Payment method"
            value={order.paymentMethod.replace("-", " ")}
          />
          <Detail
            label="Account linked"
            value={
              order.customerId ? "Yes — registered account" : "Guest order"
            }
          />
        </div>
        <h3 className="mt-7 font-bold">Items</h3>
        <div className="mt-3 divide-y divide-stone-100 rounded-2xl border border-stone-100 px-4">
          {order.items.map((item, index) => (
            <div
              key={`${item.food}-${index}`}
              className="flex justify-between gap-3 py-3 text-sm"
            >
              <span>
                {item.quantity} × {displayFoodName(item.name)}
                {item.accompaniments &&
                  Object.values(item.accompaniments).some((count) => count > 0) && (
                    <span className="block text-xs capitalize text-stone-500">
                      {Object.entries(item.accompaniments)
                        .filter(([, count]) => count > 0)
                        .map(([name, count]) => `${count} ${name}`)
                        .join(", ")}
                    </span>
                  )}
              </span>
              <span className="font-semibold">
                {money(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="ml-auto mt-4 max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-stone-500">
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 font-bold">
            <span>Total</span>
            <span>{money(order.total)}</span>
          </div>
        </div>
        {order.notes && (
          <p className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm">
            <strong>Delivery notes:</strong> {order.notes}
          </p>
        )}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <StatusPill status={order.status} />
          <label className="flex items-center gap-3 text-sm font-semibold">
            Update status
            <select
              value={order.status}
              disabled={updating}
              onChange={(event) => onStatus(event.target.value as OrderStatus)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-stone-200 p-4 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm font-semibold">
            Payment status
            <select
              value={order.paymentStatus ?? "pending"}
              disabled={updating}
              onChange={(event) =>
                onPayment(
                  event.target.value as Order["paymentStatus"],
                  paymentReference,
                )
              }
              className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2"
            >
              {(["pending", "paid", "failed"] as const).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1 text-sm font-semibold">
            Receipt number
            <input
              value={paymentReference}
              maxLength={100}
              onChange={(event) => setPaymentReference(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2"
              placeholder="Receipt number or transaction ID"
            />
          </label>
          <button
            type="button"
            disabled={updating}
            onClick={() =>
              onPayment(order.paymentStatus ?? "pending", paymentReference)
            }
            className="rounded-full bg-charcoal px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            Save reference
          </button>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold capitalize">
        {value}
      </p>
    </div>
  );
}
