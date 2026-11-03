"use client";

import {
  buttonClass,
  EmptyState,
  Field,
  FormSection,
  inputClass,
  money,
  OrderSummary,
  SectionTitle,
} from "@/components/storefront-ui";
import { PageLoader } from "@/app/loading";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { completeOrder, Order } from "@/lib/store/store";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.app.cart);
  const user = useAppSelector((state) => state.app.user);
  const initialized = useAppSelector((state) => state.app.initialized);
  const sessionStatus = useAppSelector((state) => state.app.sessionStatus);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.food.price * item.quantity,
    0,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!initialized || sessionStatus === "idle" || sessionStatus === "loading") {
    return <PageLoader label="Preparing your checkout…" />;
  }
  if (!cart.length)
    return (
      <EmptyState
        title="Nothing to check out yet."
        text="Your cart is empty."
        href="/#Products"
        action="Choose a meal"
      />
    );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: String(data.name),
          email: String(data.email),
          phone: String(data.phone),
          deliveryAddress: String(data.address),
          notes: String(data.notes || ""),
          paymentMethod: String(data.payment),
          items: cart.map(({ food, quantity }) => ({
            food: food.id,
            quantity,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "We could not place your order.");
      const order = result.order as Order;
      dispatch(completeOrder(order));
      localStorage.setItem("friday-order", JSON.stringify(order));
      router.push("/order-confirmation");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We could not place the order.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="shell py-14">
      <SectionTitle eyebrow="Almost there" title="Where should we bring it?" />
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="space-y-8">
          <FormSection title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                name="name"
                label="Full name"
                defaultValue={user?.name}
                required
              />
              <Field
                name="email"
                type="email"
                label="Email address"
                defaultValue={user?.email}
                required
              />
              <Field
                name="phone"
                label="Phone number"
                placeholder="+250 7•• ••• •••"
                defaultValue={user?.phone}
                required
              />
              <Field
                name="address"
                label="Delivery address"
                placeholder="Street, neighbourhood, landmark"
                defaultValue={user?.defaultAddress}
                required
              />
            </div>
          </FormSection>
          <FormSection title="Payment">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["mobile-money", "Mobile Money"],
                ["card", "Card on delivery"],
                ["cash", "Cash on delivery"],
              ].map(([value, label], index) => (
                <label
                  key={value}
                  className="cursor-pointer rounded-2xl border border-stone-200 bg-white p-4 text-sm font-bold has-[:checked]:border-friday has-[:checked]:bg-orange-50"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    defaultChecked={index === 0}
                    className="mr-2 accent-friday"
                  />
                  {label}
                </label>
              ))}
              <p className="sm:col-span-3">
                To Place an ORDER, See our Menu, Call us on{" "}
                <strong>+250 782 723 621</strong> and let us know what you want.
                You then Make Payment via{" "}
                <strong>MOMO CODE: *182*8*1*------#</strong> Friday Restaurant
                Ltd Or Via <strong>Airtel Money *182*8*1*88------#</strong>{" "}
                Friday Restaurant Ltd. We then Deliver to where you are.
              </p>
            </div>
          </FormSection>
          <FormSection title="One last thing">
            <label className="block text-sm font-semibold">
              Delivery notes
              <textarea
                name="notes"
                className={`${inputClass} mt-2 min-h-28 resize-none`}
                placeholder="Gate code, allergies or anything else we should know..."
              />
            </label>
          </FormSection>
          {error && (
            <p
              role="alert"
              className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700"
            >
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className={`${buttonClass} w-full sm:w-auto`}
          >
            {loading
              ? "Placing your order…"
              : `Place order · ${money(subtotal)}`}
          </button>
        </form>
        <OrderSummary subtotal={subtotal} />
      </div>
      {loading && <PageLoader label="Placing your order…" overlay />}
    </main>
  );
}
