"use client";

import {
  buttonClass,
  EmptyState,
  money,
  OrderSummary,
  PageLoader,
  SectionTitle,
} from "@/components/storefront-ui";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { removeFromCart, updateCartItem } from "@/lib/store/store";
import { displayFoodName } from "@/lib/accompaniments";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const cart = useAppSelector((state) => state.app.cart);
  const initialized = useAppSelector((state) => state.app.initialized);
  const dispatch = useAppDispatch();
  const subtotal = cart.reduce(
    (sum, item) => sum + item.food.price * item.quantity,
    0,
  );
  if (!initialized) return <PageLoader label="Restoring your basket…" />;
  if (!cart.length)
    return (
      <EmptyState
        title="Your bag is waiting."
        text="Add something delicious to the cart to get started."
        href="/#products"
        action="Back to Home"
      />
    );
  return (
    <main className="shell py-14">
      <SectionTitle eyebrow="Your order" title="Good choices." />
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {cart.map(({ food, quantity, accompaniments }) => (
            <div
              key={food.id}
              className="flex gap-4 rounded-3xl bg-white p-4 soft-ring"
            >
              <div className="size-28 shrink-0 overflow-hidden rounded-2xl bg-stone-100">
                <img
                  src={food.image}
                  alt={displayFoodName(food.name)}
                  className="size-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between py-1">
                <div className="flex justify-between gap-4 mb-2">
                  <div>
                    <Link
                      href={`/food/${food.slug}`}
                      className="font-display text-lg"
                    >
                      {displayFoodName(food.name)}
                    </Link>
                    <p className="mt-1 text-sm text-stone-500">
                      {money(food.price)}
                    </p>
                    <p className="mt-1 text-xs capitalize text-stone-500">
                      Accompaniments:{" "}
                      {Object.entries(accompaniments)
                        .filter(([, count]) => count > 0)
                        .map(([name, count]) => `${count} ${name}`)
                        .join(", ") || "none"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCart(food.id))}
                    className="text-stone-400 transition hover:text-red-500"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between flex-wrap">
                  <div className="flex items-center rounded-full border border-stone-200">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateCartItem({
                            id: food.id,
                            quantity: quantity - 1,
                          }),
                        )
                      }
                      className="p-2.5"
                      aria-label={`Remove one ${displayFoodName(food.name)}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm font-bold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateCartItem({
                            id: food.id,
                            quantity: quantity + 1,
                          }),
                        )
                      }
                      className="p-2.5"
                      aria-label={`Add one ${displayFoodName(food.name)}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-bold">
                    {money(food.price * quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <OrderSummary
          subtotal={subtotal}
          action={
            <Link href="/checkout" className={`${buttonClass} w-full`}>
              Continue to checkout <ArrowRight size={17} />
            </Link>
          }
        />
      </div>
    </main>
  );
}
