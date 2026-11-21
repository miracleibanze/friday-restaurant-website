"use client";

import {
  buttonClass,
  EmptyState,
  money,
  OrderSummary,
  SectionTitle,
} from "@/components/storefront-ui";
import { CartPageSkeleton } from "@/components/loading-skeletons";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { cartItemKey, removeFromCart, updateCartItem } from "@/lib/store/store";
import { displayFoodName } from "@/lib/food-utils";
import { accompanimentLabel, isFullChicken } from "@/lib/accompaniments";
import { FoodImage } from "@/components/FoodImage";
import { ArrowRight, MessageCircle, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const cart = useAppSelector((state) => state.app.cart);
  const initialized = useAppSelector((state) => state.app.initialized);
  const dispatch = useAppDispatch();
  const subtotal = cart.reduce(
    (sum, item) => sum + item.food.price * item.quantity,
    0,
  );
  const whatsappMessage = [
    "Hello, I would like to place this order:",
    ...cart.flatMap((item) => {
      const { food, quantity, accompaniments } = item;
      const sides = accompanimentLabel(
        accompaniments,
        isFullChicken(food) ? quantity : 0,
      );
      return [
        `- ${displayFoodName(food.name)} x${quantity} — ${money(food.price * quantity)}`,
        ...(sides ? [`  Sides: ${sides}`] : []),
      ];
    }),
    `Total: ${money(subtotal)}`,
  ].join("\n");
  const whatsappUrl = `https://wa.me/250782578829?text=${encodeURIComponent(whatsappMessage)}`;
  if (!initialized) return <CartPageSkeleton />;
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
          {cart.map((item) => {
            const { food, quantity, accompaniments } = item;
            const itemKey = cartItemKey(item);
            return (
            <div
              key={itemKey}
              className="flex gap-4 rounded-3xl bg-white p-4 soft-ring"
            >
              <div className="size-28 shrink-0 overflow-hidden rounded-2xl bg-stone-100">
                <FoodImage
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
                    {accompanimentLabel(
                      accompaniments,
                      isFullChicken(food) ? quantity : 0,
                    ) && (
                      <p className="mt-1 text-xs capitalize text-stone-500">
                        Sides:{" "}
                        {accompanimentLabel(
                          accompaniments,
                          isFullChicken(food) ? quantity : 0,
                        )}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCart(itemKey))}
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
                            id: itemKey,
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
                            id: itemKey,
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
            );
          })}
        </div>
        <OrderSummary
          subtotal={subtotal}
          action={
            <>
              <Link href="/checkout" className={`${buttonClass} w-full`}>
                Continue to checkout <ArrowRight size={17} />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1fb95a]"
              >
                <MessageCircle size={17} />
                Order with WhatsApp
              </a>
            </>
          }
        />
      </div>
    </main>
  );
}
