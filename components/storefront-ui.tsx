"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  ChevronUp,
  CircleUserRound,
  Clock3,
  Minus,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Mail,
  Phone,
  Plus,
  ShoppingBag,
  Star,
  UtensilsCrossed,
  X,
  ExternalLink,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addToCart, type Order } from "@/lib/store/store";
import type { Food } from "@/lib/menu-data";
import { displayFoodName } from "@/lib/food-utils";
import {
  accompanimentTotal,
  accompanimentTypes,
  emptyAccompaniments,
  isFullChicken,
  type Accompaniments,
} from "@/lib/accompaniments";
import { usePathname } from "next/navigation";
import Image from "next/image";

export const money = (value: number) =>
  `${new Intl.NumberFormat("en-RW").format(value)} RWF`;
export const inputClass =
  "w-full rounded-2xl border border-stone-300 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-300 focus:border-friday focus:ring-4 focus:ring-orange-100";
export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-friday px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-friday-dark disabled:cursor-not-allowed disabled:opacity-50";

export function useAddFood() {
  const dispatch = useAppDispatch();
  return (
    food: Food,
    quantity = 1,
    accompaniments?: Accompaniments,
  ) => dispatch(addToCart({ food, quantity, accompaniments }));
}

function AccompanimentModal({
  food,
  onClose,
  onAdd,
}: {
  food: Food;
  onClose: () => void;
  onAdd: (quantity: number, accompaniments: Accompaniments) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Accompaniments>(emptyAccompaniments);
  const total = accompanimentTotal(selected);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-x-0 bottom-0 top-[3.75rem] z-[998] flex items-start justify-center overflow-y-auto bg-charcoal/55 px-3 pb-4 pt-4 backdrop-blur-sm sm:px-6 sm:pb-6 sm:pt-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="accompaniment-title"
        className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] bg-[#fcfcfc] food-shadow sm:rounded-[2rem]"
      >
        <div className="relative h-36 shrink-0 overflow-hidden sm:h-44">
          <img
            src={food.image}
            alt={displayFoodName(food.name)}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-charcoal/10" />
          <p className="absolute bottom-4 left-5 text-xs font-bold uppercase tracking-[.2em] text-white/85">
            Make it your own
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close accompaniment selection"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition hover:rotate-90 hover:bg-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 id="accompaniment-title" className="font-display sm:text-2xl text-xl">
                {displayFoodName(food.name)}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-500">
                {food.description}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-bold text-friday">
              {money(food.price)}
            </span>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-white p-3.5 soft-ring">
            <span className="text-sm font-bold text-stone-600">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="flex size-8 items-center justify-center rounded-full bg-stone-100 disabled:opacity-40"
              >
                <Minus size={14} />
              </button>
              <span className="w-5 text-center font-bold text-charcoal">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((current) => current + 1)}
                className="flex size-8 items-center justify-center rounded-full bg-stone-100"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-base font-bold text-sage sm:text-lg">
              Bonus: 1 sambusa included
            </p>
            <div className="mb-1 flex items-center justify-between gap-3">
              <h3 className="font-display text-xl">Choose your sides</h3>
              <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-bold text-sage">
                {total} / 4 selected
              </span>
            </div>
            <div className="space-y-2.5">
              {accompanimentTypes.map((type) => {
                const limit = total - selected[type] < 4;
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-3.5 transition hover:border-friday/40"
                  >
                    <div>
                      <span className="font-semibold capitalize text-charcoal">
                        {type}
                      </span>
                      <span className="mt-0.5 block text-xs text-stone-400">
                        Side portion
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Remove one ${type}`}
                        disabled={selected[type] === 0}
                        onClick={() =>
                          setSelected((current) => ({
                            ...current,
                            [type]: current[type] - 1,
                          }))
                        }
                        className="flex size-7 items-center justify-center rounded-full bg-stone-100 disabled:opacity-40"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-5 text-center text-sm font-bold">
                        {selected[type]}
                      </span>
                      <button
                        type="button"
                        aria-label={`Add one ${type}`}
                        disabled={!limit}
                        onClick={() =>
                          setSelected((current) => ({
                            ...current,
                            [type]: current[type] + 1,
                          }))
                        }
                        className="flex size-7 items-center justify-center rounded-full bg-stone-100 disabled:opacity-40"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="shrink-0 border-t border-stone-200 bg-white px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold text-stone-600">Total</span>
            <span className="font-display text-2xl">
              {money(food.price * quantity)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onAdd(quantity, selected);
              onClose();
            }}
            className={`${buttonClass} w-full`}
          >
            Add to bag · {money(food.price * quantity)}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      aria-label="Friday Restaurant home"
    >
      <Image
        src="/logo.png"
        alt="Friday Restaurant"
        width={100}
        height={100}
        className="object-contain size-10 "
      />
      <span className="font-head lg:text-2xl text-xl tracking-tight">
        Friday<span className="text-friday">.</span>
      </span>
    </Link>
  );
}

export function StoreHeader({ minimal = false }: { minimal?: boolean }) {
  const cart = useAppSelector((state) => state.app.cart);
  const cartInitialized = useAppSelector((state) => state.app.initialized);
  const user = useAppSelector((state) => state.app.user);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [cartList, setCartList] = useState(false);
  const count = cartInitialized
    ? cart.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  const linksNeeded =
    !minimal &&
    !["/login", "/register", "/forgot-password"].some((path) =>
      pathname.startsWith(path),
    );

  const links = [
    ["Home", "/"],
    ["Menu", "/#products"],
    ["About", "/#about"],
    ["Contact", "/contact"],
  ];

  const toggleCart: any = () => {
    setCartList(false);
  };

  useEffect(() => {
    if (cart.length > 0) setCartList(true);
    setTimeout(() => {
      setCartList(false);
    }, 3000);
  }, [cart]);
  return (
    <>
      <header className="sticky top-0 z-[999] border-b border-stone-200/70 backdrop-blur-xl bg-white/40">
        <div className="shell flex h-15 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-1.5">
            <nav className="hidden items-center gap-8 lg:flex mr-4">
              {linksNeeded &&
                links.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm font-semibold text-stone-700 transition hover:text-friday"
                  >
                    {label}
                  </Link>
                ))}
            </nav>

            {linksNeeded && (
              <Link
                aria-label={user ? "My profile" : "Log in"}
                href={user ? "/profile" : "/login"}
                className="hidden size-11 items-center justify-center rounded-full transition hover:bg-white sm:flex"
              >
                <CircleUserRound size={21} />
              </Link>
            )}
            {linksNeeded && (
              <div className="relative">
                <Link
                  aria-label={`Cart (${count} items)`}
                  href="/cart"
                  className="relative flex lg:size-11 size-9 items-center justify-center rounded-full bg-charcoal text-white transition hover:bg-friday"
                >
                  <svg
                    data-v-26afd543=""
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      data-v-26afd543=""
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    ></path>
                  </svg>
                  {count > 0 && (
                    <>
                      <span className="bg-friday absolute lg:-right-1 -right-2 lg:-top-1 -top-2 flex size-5 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-cream">
                        {count}
                      </span>
                    </>
                  )}
                </Link>
                {cartList && (
                  <div
                    id="dropMenu"
                    className="hidden lg:block bg-white border border-black/10 absolute! top-full translate-y-2  rounded-xl min-w-40 max-w-max right-0 left-auto text-charcoal"
                  >
                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center w-full hover:bg-secondary duration-300 transition-all py-2 px-3 text-[15px] border-b border-black/10"
                      >
                        <div className="flex-1">
                          <h4 className="text-[18px] font-semibold leading-none">
                            {displayFoodName(item.food.name)}
                          </h4>
                        </div>
                        <span className="text-[12px] bg-black text-white rounded-full p-1 h-5 w-5 flex-0 flex items-center justify-center aspect-square">
                          {item.quantity}
                        </span>
                      </div>
                    ))}
                    <div
                      className="w-full flex items-center justify-center"
                      onClick={toggleCart}
                    >
                      <ChevronUp size={20} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {!minimal && (
              <button
                type="button"
                aria-label="Toggle navigation"
                onClick={() => setOpen(!open)}
                className="flex size-11 items-center justify-center rounded-full lg:hidden"
              >
                {open ? <X /> : <MenuIcon />}
              </button>
            )}
          </div>
        </div>
        {open && (
          <nav className="shell flex flex-col gap-1 border-t border-stone-200 py-4 lg:hidden">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-white"
              >
                {label}
              </Link>
            ))}
            <Link
              href={user ? "/profile" : "/login"}
              className="rounded-xl px-4 py-3 font-semibold hover:bg-white"
            >
              {user ? "My profile" : "Log in"}
            </Link>
          </nav>
        )}
      </header>
      <div
        role="status"
        className="fixed inset-x-0 bottom-0 z-[100] bg-amber-100 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-center text-sm font-semibold text-amber-950 shadow-[0_-4px_16px_rgb(0_0_0_/_0.08)]"
      >
        The business is currently not open. Orders placed during this time will
        be considered test trials and won't be processes, and will be deleted when the business is open.
      </div>
    </>
  );
}

export function StoreFooter() {
  return (
    <footer className="bg-charcoal mt-24 text-white z-[200]">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-7 text-stone-300">
            Good food, good mood. Made fresh in Kigali and delivered with care.
          </p>
          <div className="mt-5 flex gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/10">
              <Camera size={17} />
            </span>
            <span className="flex size-9 items-center justify-center rounded-full bg-white/10">
              <MessageCircle size={17} />
            </span>
          </div>
        </div>
        <div>
          <p className="font-display text-lg">Explore</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-stone-300">
            <Link href="/#products">Our Menu</Link>
            <Link href="/order-tracking">Track an order</Link>
            <Link href="/faq">FAQs</Link>
          </div>
        </div>
        <div>
          <p className="font-display text-lg">Legal</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-stone-300">
            <Link href="/privacy-policy">Privacy policy</Link>
            <Link href="/terms">Terms of service</Link>
            <Link href="/contact">Contact us</Link>
          </div>
        </div>
        <div>
          <p className="font-display text-lg">Visit Friday</p>
          <div className="mt-5 space-y-3 text-sm text-stone-300">
            <a
              href="https://maps.app.goo.gl/6D8CJSscADL6tnb68"
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3"
            >
              <MapPin size={18} className="text-friday" /> KG 7 Ave, Kigali,
              Rwanda
            </a>
            <a href="tel:+250788767191" className="flex gap-3">
              <Phone size={18} className="text-friday" /> 0788767191
            </a>
            <a
              href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent("amosndayam@gmail.com")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3"
            >
              <Mail size={18} className="text-friday" />{" "}
              amosndayam@gmail.com
            </a>
            <p className="flex gap-3">
              <Clock3 size={18} className="text-friday" /> Daily, 10:00–22:30
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-stone-300 flex justify-center items-center flex-wrap gap-2">
        <span className="text-center">
          © {new Date().getFullYear()} Friday Restaurant. All rights reserved.
        </span>
        <Link href="/admin" className="text-center cursor-pointer">
          Made in Kigali.
        </Link>
      </div>
      <div className="mt-6 border-t border-stone-200/70 pt-2 pb-16 text-center">
        <p className="text-xs text-stone-300">
          Website by{" "}
          <a
            href="https://ibanze-miracle.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-stone-300 transition hover:text-amber-100 inline-flex items-center justify-center"
          >
            IBANZE Miracle{" "}
            <ExternalLink size={12} className="inline-block ml-1" />
          </a>
        </p>
      </div>
    </footer>
  );
}

export const BackdropImage = ({ className }: { className?: string }) => {
  return (
    <div
      className={`absolute inset-0 -z-1 overflow-hidden oppacity-30 ${className || ""}`}
    >
      <img
        src="/friday-family-feast.jpg"
        alt=""
        className="object-cover w-full h-full opacity-30"
      />
    </div>
  );
};
export function SectionTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && (
        <p className="text-friday mb-3 text-xs font-bold uppercase tracking-[.30em]">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-balance md:text-4xl text-3xl leading-tight">
        {title}
      </h2>
      {text && (
        <p className="mt-2 mb-8 leading-none text-stone-600 max-md:text-sm">
          {text}
        </p>
      )}
    </div>
  );
}

export function FoodCard({
  food,
  add,
}: {
  food: Food;
  add: (
    food: Food,
    quantity?: number,
    accompaniments?: Accompaniments,
  ) => void;
}) {
  const [showAccompanimentModal, setShowAccompanimentModal] = useState(false);
  return (
    <>
    <article
      className="food-shadow group overflow-hidden rounded-[1.75rem] bg-white sm:
    w-60 md:max-w-96 max-md:flex-1 min-w-60"
    >
      <Link
        href={`/food/${food.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-stone-100"
      >
        <img
          src={food.image}
          alt={displayFoodName(food.name)}
          className="size-full object-cover transition duration-700 group-hover:scale-105"
        />
        {!food.available && (
          <span className="absolute inset-0 flex items-center justify-center bg-charcoal/60 font-bold text-white">
            Currently unavailable
          </span>
        )}
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="mb-auto">
            <Link
              href={`/food/${food.slug}`}
              className="text-xl font-bold leading-tight transition hover:text-friday"
            >
              {displayFoodName(food.name)}
            </Link>
            <p className="mt-2 line-clamp-2 text-sm leading-tight text-stone-500">
              {food.description}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs font-bold">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {food.rating}
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="font-bold text-lg">{money(food.price)}</span>
          <button
            type="button"
            disabled={!food.available}
            onClick={() =>
              isFullChicken(food)
                ? setShowAccompanimentModal(true)
                : add(food)
            }
            className="bg-charcoal flex size-11 items-center justify-center rounded-full text-white transition hover:rotate-6 hover:bg-friday disabled:opacity-30"
            aria-label={`Add ${displayFoodName(food.name)} to cart`}
          >
            <Plus size={19} />
          </button>
        </div>
      </div>
    </article>
    {showAccompanimentModal && (
      <AccompanimentModal
        food={food}
        onClose={() => setShowAccompanimentModal(false)}
        onAdd={(quantity, accompaniments) =>
          add(food, quantity, accompaniments)
        }
      />
    )}
    </>
  );
}

export function EmptyState({
  title,
  text,
  href,
  action,
  compact = false,
}: {
  title: string;
  text: string;
  href: string;
  action: string;
  compact?: boolean;
}) {
  return (
    <main
      className={`shell flex flex-col items-center justify-center text-center ${compact ? "py-12" : "min-h-[60vh] py-20"}`}
    >
      <h1 className="font-display text-3xl">{title}</h1>
      <p className="mt-3 max-w-md leading-7 text-stone-500">{text}</p>
      <Link href={href} className={`${buttonClass} mt-7`}>
        {action}
      </Link>
    </main>
  );
}

export function OrderSummary({
  subtotal,
  action,
}: {
  subtotal: number;
  action?: React.ReactNode;
}) {
  return (
    <aside className="h-fit rounded-3xl bg-charcoal p-7 text-white">
      <h2 className="font-display text-2xl font-light">Order summary</h2>
      <div className="mt-6 border-b border-white/10 pb-6 text-sm">
        <div className="flex justify-between text-stone-300">
          <span>Subtotal</span>
          <span className="text-white">{money(subtotal)}</span>
        </div>
      </div>
      <div className="my-6 flex items-end justify-between">
        <span className="font-bold">Total</span>
        <span className="font-display text-2xl">
          {money(subtotal)}
        </span>
      </div>
      {action}
      <p className="mt-4 text-center text-xs leading-5 text-stone-400">
        Delivery charges vary by location.{" "}
        <Link href="/contact" className="font-semibold text-white underline">
          Contact us
        </Link>{" "}
        for delivery information.
      </p>
    </aside>
  );
}

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 soft-ring md:p-8">
      <h2 className="font-display mb-6 text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input {...props} className={`${inputClass} mt-2`} />
    </label>
  );
}

export function ConfirmedOrder({ order }: { order: Order | null }) {
  if (!order)
    return (
      <EmptyState
        title="No recent order found."
        text="Place an order and your confirmation will appear here."
        href="/#products"
        action="Order now"
      />
    );
  return (
    <main className="shell flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-2xl rounded-[2.5rem] bg-white p-8 text-center food-shadow md:p-12">
        <span className="bg-sage mx-auto flex size-20 items-center justify-center rounded-full text-white">
          ✓
        </span>
        <p className="text-friday mt-8 text-xs font-bold uppercase tracking-[.22em]">
          Order {order.status}
        </p>
        <h1 className="font-display mt-3 text-3xl leading-tight md:text-4xl">
          {order.status === "confirmed"
            ? "Dinner is on its way."
            : "Your order update."}
        </h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-stone-500">
          Thanks, {order.customerName}. Your order has been received by the
          Friday team.
        </p>
        <div className="mt-8 grid gap-3 rounded-3xl bg-stone-50 p-5 text-left sm:grid-cols-2">
          <div>
            <p className="text-xs text-stone-300">Order number</p>
            <p className="mt-1 font-bold">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-xs text-stone-300">Estimated delivery</p>
            <p className="mt-1 font-bold">35–45 minutes</p>
          </div>
          <div>
            <p className="text-xs text-stone-300">Total</p>
            <p className="mt-1 font-bold">{money(order.total)}</p>
          </div>
          <div>
            <p className="text-xs text-stone-300">Payment</p>
            <p className="mt-1 font-bold capitalize">
              {order.paymentMethod.replace("-", " ")}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-300">Payment status</p>
            <p className="mt-1 font-bold capitalize">
              {order.paymentStatus ?? "pending"}
            </p>
          </div>
          {order.paymentReference && (
            <div>
              <p className="text-xs text-stone-300">Receipt number</p>
              <p className="mt-1 break-all font-bold">
                {order.paymentReference}
              </p>
            </div>
          )}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/order-tracking?number=${encodeURIComponent(order.orderNumber)}`}
            className={buttonClass}
          >
            Track order
          </Link>
          <Link
            href="/#products"
            className="rounded-full border border-stone-200 px-6 py-3.5 text-sm font-bold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
