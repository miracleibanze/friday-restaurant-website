"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { money } from "@/components/storefront-ui";
import type { Food } from "@/lib/menu-data";
import { displayFoodName } from "@/lib/accompaniments";
import { X } from "lucide-react";

type Section = "menu" | "payments" | "inbox" | "reports" | "customers";
type MenuForm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  prepTime: string;
  image: string;
  available: boolean;
};
const emptyMenuForm: MenuForm = {
  id: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  prepTime: "25",
  image: "",
  available: true,
};
const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500";

async function requestJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "The request could not be completed.");
  return result;
}

export default function AdminFeatures({ section }: { section: Section }) {
  if (section === "menu") return <MenuManagement />;
  if (section === "payments") return <PaymentManagement />;
  if (section === "inbox") return <MessageInbox />;
  if (section === "reports") return <SalesReports />;
  return <CustomerManagement />;
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm sm:p-7">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
      {children}
    </section>
  );
}

function Notice({ error }: { error: string }) {
  if (!error) return null;
  return (
    <p
      role="alert"
      className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700"
    >
      {error}
    </p>
  );
}

function MenuManagement() {
  const [items, setItems] = useState<Food[]>([]);
  const [form, setForm] = useState<MenuForm>(emptyMenuForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await requestJson("/api/admin/menu");
      setItems(result.items);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load menu items.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      ...form,
      price: Number(form.price),
      prepTime: Number(form.prepTime),
    };
    try {
      await requestJson("/api/admin/menu", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setForm(emptyMenuForm);
      setFormOpen(false);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save menu item.",
      );
    } finally {
      setSaving(false);
    }
  }

  function edit(item: Food) {
    setForm({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: String(item.price),
      prepTime: String(item.prepTime ?? 25),
      image: item.image,
      available: item.available,
    });
    setError("");
    setFormOpen(true);
  }

  function addItem() {
    setForm(emptyMenuForm);
    setError("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setForm(emptyMenuForm);
    setError("");
    setFormOpen(false);
  }

  async function toggleAvailability(item: Food) {
    setError("");
    try {
      await requestJson("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          id: item.id,
          price: Number(item.price),
          prepTime: Number(item.prepTime ?? 25),
          available: !item.available,
        }),
      });
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not update availability.",
      );
    }
  }

  return (
    <Panel
      title="Menu management"
      description="Add dishes, edit their details, and control what customers can order."
    >
      <Notice error={error} />
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={addItem}
          className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-bold text-white"
        >
          Add dish
        </button>
      </div>
      {formOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-item-modal-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3
                  id="menu-item-modal-title"
                  className="font-display text-2xl"
                >
                  {form.id ? "Edit menu item" : "Add menu item"}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  Update the details customers see on the menu.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close menu item form"
                className="rounded-full bg-stone-100 p-2 hover:bg-stone-200 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>
            <Notice error={error} />
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Dish name
                <input
                  className={`${inputClass} mt-1`}
                  value={form.name}
                  required
                  maxLength={120}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </label>
              <label className="text-sm font-semibold">
                Slug (optional)
                <input
                  className={`${inputClass} mt-1`}
                  value={form.slug}
                  placeholder="Generated from name"
                  onChange={(event) =>
                    setForm({ ...form, slug: event.target.value })
                  }
                />
              </label>
              <label className="text-sm font-semibold">
                Price (RWF)
                <input
                  className={`${inputClass} mt-1`}
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  required
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                />
              </label>
              <label className="text-sm font-semibold">
                Preparation time (minutes)
                <input
                  className={`${inputClass} mt-1`}
                  type="number"
                  min="1"
                  max="240"
                  value={form.prepTime}
                  required
                  onChange={(event) =>
                    setForm({ ...form, prepTime: event.target.value })
                  }
                />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Image URL or site path
                <input
                  className={`${inputClass} mt-1`}
                  value={form.image}
                  required
                  disabled={true}
                  maxLength={1000}
                  placeholder="/dish.jpg"
                  onChange={(event) =>
                    setForm({ ...form, image: event.target.value })
                  }
                />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Description
                <textarea
                  className={`${inputClass} mt-1 min-h-24`}
                  value={form.description}
                  required
                  maxLength={1000}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(event) =>
                    setForm({ ...form, available: event.target.checked })
                  }
                />
                Available for ordering
              </label>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button
                  disabled={saving}
                  className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saving ? "Saving…" : form.id ? "Save changes" : "Add dish"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-full border px-5 py-2.5 text-sm font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {loading ? (
        <p className="py-8 text-center text-sm text-stone-500">Loading menu…</p>
      ) : (
        <div className="mt-5 divide-y divide-stone-100">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <p className="font-bold">
                  {displayFoodName(item.name)}{" "}
                  <span className="ml-2 rounded-full bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600">
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {money(item.price)} · {item.prepTime ?? 25} min
                </p>
              </div>
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => edit(item)}
                  className="rounded-lg border px-3 py-2 text-sm font-bold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void toggleAvailability(item)}
                  className={`rounded-lg border px-3 py-2 text-sm font-bold ${item.available ? "bg-red-400 text-white hover:bg-red-500" : "bg-green-400 text-white hover:bg-green-500"}`}
                >
                  {item.available ? "Disable" : "Enable"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
}

type PayOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  paymentReference: string;
  createdAt: string;
};

function PaymentManagement() {
  const [orders, setOrders] = useState<PayOrder[]>([]);
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    requestJson(
      `/api/admin/orders?status=all&paymentStatus=${status}&page=${page}&pageSize=20`,
    )
      .then((result) => {
        if (active) {
          setOrders(result.orders);
          setPage(result.page);
          setPages(result.pages);
          setTotal(result.total);
          setError("");
        }
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load payment records.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, page, refresh]);
  const savePayment = async (
    id: string,
    paymentStatus: string,
    paymentReference: string,
  ) => {
    setError("");
    try {
      await requestJson("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, paymentStatus, paymentReference }),
      });
      setRefresh((value) => value + 1);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update payment.",
      );
    }
  };
  return (
    <Panel
      title="Payment tracking"
      description="Record manual payment reconciliation. Payment methods are not charged by this website."
    >
      <Notice error={error} />
      <div className="mt-5 flex flex-wrap gap-2">
        {["pending", "paid", "failed"].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setStatus(value);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${status === value ? "bg-charcoal text-white" : "bg-stone-100 text-stone-600"}`}
          >
            {value}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="py-8 text-center text-sm text-stone-500">
          Loading payments…
        </p>
      ) : orders.length ? (
        <div className="mt-4 divide-y divide-stone-100">
          {orders.map((order) => (
            <PaymentRow key={order.id} order={order} onSave={savePayment} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-stone-500">
          No {status} payments.
        </p>
      )}
      {!loading && total > 0 && (
        <Pagination
          page={page}
          pages={pages}
          total={total}
          pageSize={20}
          loading={loading}
          onPage={setPage}
        />
      )}
    </Panel>
  );
}

function PaymentRow({
  order,
  onSave,
}: {
  order: PayOrder;
  onSave: (id: string, status: string, reference: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(order.paymentStatus || "pending");
  const [reference, setReference] = useState(order.paymentReference || "");
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        await onSave(order.id, status, reference);
        setSaving(false);
      }}
      className="grid gap-3 py-4 md:grid-cols-[1fr_140px_1fr_auto] md:items-center"
    >
      <div>
        <p className="font-bold">
          {order.orderNumber} · {order.customerName}
        </p>
        <p className="mt-1 text-sm text-stone-500">
          {money(order.total)} · {order.paymentMethod.replace("-", " ")} ·{" "}
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>
      <select
        aria-label={`Payment status for ${order.orderNumber}`}
        className={inputClass}
        value={status}
        onChange={(event) => {
          const value = event.target.value;
          if (value === "pending" || value === "paid" || value === "failed")
            setStatus(value);
        }}
      >
        {["pending", "paid", "failed"].map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <input
        aria-label={`Payment reference for ${order.orderNumber}`}
        className={inputClass}
        value={reference}
        maxLength={100}
        placeholder="Receipt number / transaction reference"
        onChange={(event) => setReference(event.target.value)}
      />
      <button
        disabled={saving}
        className="rounded-lg bg-charcoal px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

function MessageInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await requestJson(
        `/api/admin/messages?page=${page}&pageSize=20`,
      );
      setMessages(result.messages);
      setPage(result.page);
      setPages(result.pages);
      setTotal(result.total);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load messages.",
      );
    } finally {
      setLoading(false);
    }
  }, [page]);
  useEffect(() => {
    void load();
  }, [load, refresh]);
  async function update(id: string, status: string) {
    setError("");
    try {
      await requestJson("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setRefresh((value) => value + 1);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update message.",
      );
    }
  }
  return (
    <Panel
      title="Customer support inbox"
      description="Messages from the website contact form, newest first. Use Reply to respond through your email client."
    >
      <Notice error={error} />
      {loading ? (
        <p className="py-8 text-center text-sm text-stone-500">
          Loading messages…
        </p>
      ) : messages.length ? (
        <div className="mt-5 space-y-4">
          {messages.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border border-stone-200 p-4 ${item.status === "new" ? "bg-stone-200" : item.status === "resolved" ? "bg-green-100" : ""} `}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{item.subject}</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {item.name} · {item.email} ·{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <select
                  aria-label={`Message status for ${item.subject}`}
                  className={`${inputClass} capitalize max-w-[7rem]`}
                  value={item.status}
                  onChange={(event) => void update(item.id, event.target.value)}
                >
                  {["new", "read", "resolved"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                {item.message}
              </p>

              <a
                href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(item.email)}&su=${encodeURIComponent(`Re: ${item.subject}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-full bg-charcoal px-4 py-2 text-sm font-bold text-white"
              >
                Reply by email
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-stone-500">
          No customer messages yet.
        </p>
      )}
      {!loading && total > 0 && (
        <Pagination
          page={page}
          pages={pages}
          total={total}
          pageSize={20}
          loading={loading}
          onPage={setPage}
        />
      )}
    </Panel>
  );
}

function Pagination({
  page,
  pages,
  total,
  pageSize,
  loading,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  loading: boolean;
  onPage: (page: number) => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-100 pt-4 text-sm text-stone-500">
      <span>
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{" "}
        of {total}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border px-3 py-2 disabled:opacity-40"
        >
          Previous
        </button>
        <span>
          {page} / {pages}
        </span>
        <button
          type="button"
          disabled={loading || page >= pages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border px-3 py-2 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

type Report = {
  summary: {
    orders: number;
    cancelledOrders: number;
    paidRevenue: number;
    paidOrders: number;
    pendingPayments: number;
  };
  bestSellers: Array<{
    id: string;
    name: string;
    quantity: number;
    sales: number;
  }>;
  dailySales: Array<{ date: string; orders: number; paidRevenue: number }>;
};

function SalesReports() {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    requestJson(`/api/admin/reports?days=${days}`)
      .then((result) => {
        if (active) {
          setReport(result);
          setError("");
        }
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Could not load reports.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [days]);
  return (
    <Panel
      title="Sales reports"
      description="Sales and popular dishes for recent periods. Recorded revenue includes orders marked paid."
    >
      <Notice error={error} />
      <label className="mt-5 flex items-center gap-2 text-sm font-semibold">
        Period
        <select
          className={`${inputClass} w-auto`}
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
        >
          {[7, 30, 90].map((value) => (
            <option key={value} value={value}>
              Last {value} days
            </option>
          ))}
        </select>
      </label>
      {loading ? (
        <p className="py-8 text-center text-sm text-stone-500">
          Loading report…
        </p>
      ) : (
        report && (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <ReportMetric
                label="Paid revenue"
                value={money(report.summary.paidRevenue)}
              />
              <ReportMetric
                label="Paid orders"
                value={report.summary.paidOrders}
              />
              <ReportMetric label="All orders" value={report.summary.orders} />
              <ReportMetric
                label="Pending payments"
                value={report.summary.pendingPayments}
              />
              <ReportMetric
                label="Cancelled orders"
                value={report.summary.cancelledOrders}
              />
            </div>
            <h3 className="mt-7 font-bold">Daily sales trend</h3>
            {report.dailySales.length ? (
              <div className="mt-3 divide-y divide-stone-100">
                {report.dailySales.map((day) => (
                  <div
                    key={day.date}
                    className="flex justify-between gap-3 py-3 text-sm"
                  >
                    <span className="font-semibold">
                      {new Date(`${day.date}T00:00:00`).toLocaleDateString()}
                    </span>
                    <span className="text-stone-600">
                      {day.orders} orders · {money(day.paidRevenue)} paid
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-stone-500">
                No daily sales in this period.
              </p>
            )}
            <h3 className="mt-7 font-bold">Best-selling dishes</h3>
            {report.bestSellers.length ? (
              <div className="mt-3 divide-y divide-stone-100">
                {report.bestSellers.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-3 py-3 text-sm"
                  >
                    <span className="font-semibold">
                      {item.name}{" "}
                      <span className="text-stone-500">
                        · {item.quantity} sold
                      </span>
                    </span>
                    <span className="text-stone-600">{money(item.sales)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-stone-500">
                No sales in this period.
              </p>
            )}
          </>
        )
      )}
    </Panel>
  );
}

function ReportMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 p-4">
      <p className="text-sm font-semibold text-stone-500">{label}</p>
      <p className="font-display mt-2 text-2xl">{value}</p>
    </div>
  );
}

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  defaultAddress: string;
  createdAt: string;
  orderCount: number;
  lifetimeSpend: number;
  lastOrderAt: string | null;
};
type CustomerHistory = {
  customer: Pick<
    Customer,
    "id" | "name" | "email" | "phone" | "defaultAddress" | "createdAt"
  >;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
    items: string[];
  }>;
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  async function showHistory(customerId: string, requestedPage = 1) {
    setHistoryLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        customerId,
        page: String(requestedPage),
        pageSize: "20",
      });
      const result = await requestJson(`/api/admin/customers?${query}`);
      setHistory(result);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load customer order history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }
  useEffect(() => {
    let active = true;
    setLoading(true);
    const query = new URLSearchParams({
      page: String(page),
      search: appliedSearch,
    });
    requestJson(`/api/admin/customers?${query}`)
      .then((result) => {
        if (active) {
          setCustomers(result.customers);
          setPages(result.pages);
          setTotal(result.total);
          setError("");
        }
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load customers.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, appliedSearch]);
  return (
    <Panel
      title="Customer management"
      description="Registered customer accounts and their order activity. Guest checkout customers are not registered accounts."
    >
      <Notice error={error} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setAppliedSearch(search.trim());
        }}
        className="mt-5 flex gap-2"
      >
        <input
          className={inputClass}
          aria-label="Search customers"
          placeholder="Search name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className="rounded-xl bg-friday px-5 text-sm font-bold text-white">
          Search
        </button>
      </form>
      {loading ? (
        <p className="py-8 text-center text-sm text-stone-500">
          Loading customers…
        </p>
      ) : customers.length ? (
        <>
          <div className="mt-4 divide-y divide-stone-100">
            {customers.map((item) => (
              <article
                key={item.id}
                className="grid gap-2 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
              >
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-stone-500">
                    {item.email} {item.phone && `· ${item.phone}`}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    {item.defaultAddress || "No saved delivery address"}
                  </p>
                </div>
                <p className="text-sm text-stone-600">
                  {item.orderCount} orders · {money(item.lifetimeSpend)} paid
                  total
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-stone-500">
                    {item.lastOrderAt
                      ? `Last order ${new Date(item.lastOrderAt).toLocaleDateString()}`
                      : "No orders yet"}
                  </p>
                  <button
                    type="button"
                    disabled={historyLoading}
                    onClick={() => void showHistory(item.id)}
                    className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50 hover:bg-stone-100"
                  >
                    {historyLoading ? "Loading…" : "History"}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="flex items-center justify-between border-t pt-4 text-sm text-stone-500">
            <span>{total} customer accounts</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Previous
              </button>
              <span>{pages ? `${page} / ${pages}` : "0 / 0"}</span>
              <button
                type="button"
                disabled={!pages || page >= pages || loading}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="py-10 text-center text-sm text-stone-500">
          No customer accounts found.
        </p>
      )}
      {history && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setHistory(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-history-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="customer-history-title"
                  className="font-display text-2xl"
                >
                  {history.customer.name}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  {history.customer.email} · Account created{" "}
                  {new Date(history.customer.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistory(null)}
                className="rounded-lg border px-3 py-2 text-sm font-bold"
              >
                Close
              </button>
            </div>
            <h4 className="mt-6 font-bold">
              Order history ({history.total} total)
            </h4>
            {history.orders.length ? (
              <div className="mt-3 divide-y divide-stone-100">
                {history.orders.map((order) => (
                  <article key={order.id} className="py-3">
                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                      <span className="font-bold">
                        {order.orderNumber} · {money(order.total)}
                      </span>
                      <span className="text-stone-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs capitalize text-stone-500">
                      Order: {order.status.replaceAll("-", " ")} · Payment:{" "}
                      {order.paymentStatus}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {order.items.join(", ")}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-stone-500">
                No orders for this customer.
              </p>
            )}
            {history.total > 0 && (
              <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm text-stone-500">
                <span>
                  Showing {(history.page - 1) * history.pageSize + 1}–
                  {Math.min(history.page * history.pageSize, history.total)} of{" "}
                  {history.total}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={historyLoading || history.page <= 1}
                    onClick={() =>
                      void showHistory(history.customer.id, history.page - 1)
                    }
                    className="rounded-lg border px-3 py-2 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span>
                    {history.page} / {history.pages}
                  </span>
                  <button
                    type="button"
                    disabled={historyLoading || history.page >= history.pages}
                    onClick={() =>
                      void showHistory(history.customer.id, history.page + 1)
                    }
                    className="rounded-lg border px-3 py-2 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </Panel>
  );
}
