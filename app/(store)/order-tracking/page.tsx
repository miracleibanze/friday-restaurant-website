"use client";

import {
  buttonClass,
  inputClass,
  SectionTitle,
} from "@/components/storefront-ui";
import { PageLoader } from "@/app/loading";
import { Order } from "@/lib/store/store";
import { Check } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";

export default function TrackingPage() {
  const [number, setNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [deliveryError, setDeliveryError] = useState("");
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const lookupOrder = useCallback(async (orderNumber: string) => {
    setLoading(true);
    setError("");
    setDeliveryError("");
    setOrder(null);
    setSearched(true);
    try {
      const response = await fetch(
        `/api/orders?orderNumber=${encodeURIComponent(orderNumber.trim())}`,
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not look up this order.");
      setOrder(result.order);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not look up this order.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("number");
    if (initial?.trim()) {
      setNumber(initial);
      void lookupOrder(initial);
    }
  }, [lookupOrder]);
  function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void lookupOrder(number);
  }
  async function confirmDelivery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order) return;
    setConfirmingDelivery(true);
    setDeliveryError("");
    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: order.orderNumber, phone }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not confirm delivery.");
      setOrder((current) =>
        current ? { ...current, status: result.order.status } : current,
      );
    } catch (cause) {
      setDeliveryError(
        cause instanceof Error
          ? cause.message
          : "Could not confirm delivery.",
      );
    } finally {
      setConfirmingDelivery(false);
    }
  }
  const steps = [
    "Order confirmed",
    "Preparing your food",
    "On the way",
    "Delivered",
  ];
  const statusIndex: Record<string, number> = {
    confirmed: 0,
    preparing: 1,
    "on-the-way": 2,
    delivered: 3,
  };
  const current = order ? (statusIndex[order.status] ?? 0) : 0;
  return (
    <main className="shell py-14">
      <div className="mx-auto max-w-3xl">
        <SectionTitle
          eyebrow="Order updates"
          title="Track your Friday."
          text="Enter your order number to see the latest kitchen and delivery status."
        />
        <form
          onSubmit={track}
          className="flex gap-3 rounded-3xl bg-white p-3 soft-ring"
        >
          <input
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            className={`${inputClass} border-0 bg-stone-50`}
            placeholder="e.g. FR-1234567"
            required
          />
          <button disabled={loading} className={buttonClass}>
            {loading ? "Checking…" : "Track"}
          </button>
        </form>
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700"
          >
            {error}
          </p>
        )}
        {searched && !loading && !order && !error && (
          <p className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm font-semibold text-stone-700">
            We couldn’t find that order. Check the number and try again.
          </p>
        )}
        {order && (
          <div className="mt-8 rounded-[2rem] bg-white p-8 food-shadow">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-6">
              <div>
                <p className="text-xs text-stone-400">Tracking order</p>
                <p className="mt-1 font-bold">{order.orderNumber}</p>
              </div>
              <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-bold capitalize text-friday">
                {order.status.replace("-", " ")}
              </span>
            </div>
            <p className="mt-5 rounded-2xl bg-stone-50 px-4 py-3 text-sm">
              <span className="font-semibold">Payment status: </span>
              <span className="capitalize">
                {order.paymentStatus ?? "pending"}
              </span>
            </p>
            {order.status === "on-the-way" && (
              <form
                onSubmit={confirmDelivery}
                className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4"
              >
                <h2 className="font-bold text-green-900">
                  Has your order arrived?
                </h2>
                <p className="mt-1 text-sm text-green-800">
                  Confirm delivery so the restaurant knows it reached you.
                </p>
                <label className="mt-4 block text-sm font-semibold text-stone-700">
                  Phone number used for this order
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className={`${inputClass} mt-2`}
                    required
                  />
                </label>
                {deliveryError && (
                  <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
                    {deliveryError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={confirmingDelivery}
                  className={`${buttonClass} mt-4`}
                >
                  {confirmingDelivery ? "Confirming…" : "Confirm delivery"}
                </button>
              </form>
            )}
            {order.status === "delivered" && (
              <p className="mt-5 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
                This order has been marked as delivered. Thank you for confirming!
              </p>
            )}
            <div className="mt-8">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex size-10 items-center justify-center rounded-full ${index <= current ? "bg-friday text-white" : "bg-stone-100 text-stone-400"}`}
                    >
                      {index <= current ? <Check size={17} /> : index + 1}
                    </span>
                    {index < steps.length - 1 && (
                      <span
                        className={`h-14 w-0.5 ${index < current ? "bg-friday" : "bg-stone-100"}`}
                      />
                    )}
                  </div>
                  <div className="pt-2">
                    <p
                      className={`font-bold ${index <= current ? "text-charcoal" : "text-stone-400"}`}
                    >
                      {step}
                    </p>
                    {index === current && (
                      <p className="mt-1 text-sm text-stone-500">
                        Your order is up to date.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {loading && <PageLoader label="Finding your order…" overlay />}
    </main>
  );
}
