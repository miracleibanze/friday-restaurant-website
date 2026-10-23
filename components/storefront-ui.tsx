"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Camera,
  CircleUserRound,
  Clock3,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Phone,
  Plus,
  ShoppingBag,
  Star,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addToCart, type Order } from "@/lib/store/store";
import type { Food } from "@/lib/menu-data";

export const money = (value: number) => `${new Intl.NumberFormat("en-RW").format(value)} RWF`;
export const inputClass = "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-friday focus:ring-4 focus:ring-orange-100";
export const buttonClass = "inline-flex items-center justify-center gap-2 rounded-full bg-friday px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-friday-dark disabled:cursor-not-allowed disabled:opacity-50";
export const imageUrl = (media?: { url?: string }) => media?.url || "";

export function useAddFood() {
  const dispatch = useAppDispatch();
  return (food: Food, quantity = 1) => dispatch(addToCart({ food, quantity }));
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Friday Restaurant home">
      <span className="bg-friday flex size-10 items-center justify-center rounded-full text-white"><UtensilsCrossed size={19} /></span>
      <span className="font-display text-2xl font-bold tracking-tight">Friday<span className="text-friday">.</span></span>
    </Link>
  );
}

export function StoreHeader() {
  const cart = useAppSelector((state) => state.app.cart);
  const user = useAppSelector((state) => state.app.user);
  const [open, setOpen] = useState(false);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const links = [["Menu", "/menu"], ["Categories", "/categories"], ["About", "/#about"], ["Contact", "/contact"]];
  return (
    <>
      <div className="bg-charcoal py-2 text-center text-xs font-semibold text-white">Free delivery in Kigali on orders over 30,000 RWF</div>
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-cream/95 backdrop-blur-xl">
        <div className="shell flex h-20 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-8 lg:flex">{links.map(([label, href]) => <Link key={href} href={href} className="text-sm font-semibold text-stone-700 transition hover:text-friday">{label}</Link>)}</nav>
          <div className="flex items-center gap-1.5">
            <Link href="/search" aria-label="Search menu" className="flex size-11 items-center justify-center rounded-full transition hover:bg-white"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg></Link>
            <Link aria-label={user ? "My profile" : "Log in"} href={user ? "/profile" : "/login"} className="hidden size-11 items-center justify-center rounded-full transition hover:bg-white sm:flex"><CircleUserRound size={21} /></Link>
            <Link aria-label={`Cart (${count} items)`} href="/cart" className="relative flex size-11 items-center justify-center rounded-full bg-charcoal text-white transition hover:bg-friday">
              <ShoppingBag size={19} />
              {count > 0 && <span className="bg-friday absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-cream">{count}</span>}
            </Link>
            <button type="button" aria-label="Toggle navigation" onClick={() => setOpen(!open)} className="flex size-11 items-center justify-center rounded-full lg:hidden">{open ? <X /> : <MenuIcon />}</button>
          </div>
        </div>
        {open && <nav className="shell flex flex-col gap-1 border-t border-stone-200 py-4 lg:hidden">{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 font-semibold hover:bg-white">{label}</Link>)}<Link href={user ? "/profile" : "/login"} className="rounded-xl px-4 py-3 font-semibold hover:bg-white">{user ? "My profile" : "Log in"}</Link></nav>}
      </header>
    </>
  );
}

export function StoreFooter() {
  return (
    <footer className="bg-charcoal mt-24 text-white">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div><Logo /><p className="mt-5 max-w-xs text-sm leading-7 text-stone-400">Good food, good mood. Made fresh in Kigali and delivered with care.</p><div className="mt-5 flex gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-white/10"><Camera size={17} /></span><span className="flex size-9 items-center justify-center rounded-full bg-white/10"><MessageCircle size={17} /></span></div></div>
        <div><p className="font-display text-lg font-bold">Explore</p><div className="mt-5 flex flex-col gap-3 text-sm text-stone-400"><Link href="/menu">Our menu</Link><Link href="/categories">Categories</Link><Link href="/order-tracking">Track an order</Link><Link href="/faq">FAQs</Link></div></div>
        <div><p className="font-display text-lg font-bold">Legal</p><div className="mt-5 flex flex-col gap-3 text-sm text-stone-400"><Link href="/privacy-policy">Privacy policy</Link><Link href="/terms">Terms of service</Link><Link href="/contact">Contact us</Link></div></div>
        <div><p className="font-display text-lg font-bold">Visit Friday</p><div className="mt-5 space-y-3 text-sm text-stone-400"><p className="flex gap-3"><MapPin size={18} className="text-friday" /> KG 7 Ave, Kigali, Rwanda</p><p className="flex gap-3"><Phone size={18} className="text-friday" /> +250 788 123 456</p><p className="flex gap-3"><Clock3 size={18} className="text-friday" /> Daily, 10:00–22:30</p></div></div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-stone-500">© {new Date().getFullYear()} Friday Restaurant. Made in Kigali.</div>
    </footer>
  );
}

export function SectionTitle({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return <div className="mb-10 max-w-2xl">{eyebrow && <p className="text-friday mb-3 text-xs font-bold uppercase tracking-[.22em]">{eyebrow}</p>}<h2 className="font-display text-balance text-4xl font-semibold leading-tight md:text-5xl">{title}</h2>{text && <p className="mt-4 leading-7 text-stone-600">{text}</p>}</div>;
}

export function FoodCard({ food, add }: { food: Food; add: (food: Food) => void }) {
  return (
    <article className="food-shadow group overflow-hidden rounded-[1.75rem] bg-white">
      <Link href={`/food/${food.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-stone-100">
        {imageUrl(food.image) && <img src={imageUrl(food.image)} alt={food.image?.alt || food.name} className="size-full object-cover transition duration-700 group-hover:scale-105" />}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold backdrop-blur">{food.category?.name}</span>
        {!food.available && <span className="absolute inset-0 flex items-center justify-center bg-charcoal/60 font-bold text-white">Currently unavailable</span>}
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3"><div><Link href={`/food/${food.slug}`} className="font-display text-xl font-bold leading-tight transition hover:text-friday">{food.name}</Link><p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">{food.description}</p></div><span className="flex shrink-0 items-center gap-1 text-xs font-bold"><Star size={14} className="fill-amber-400 text-amber-400" />{food.rating}</span></div>
        <div className="mt-5 flex items-center justify-between"><span className="font-display text-lg font-bold">{money(food.price)}</span><button type="button" disabled={!food.available} onClick={() => add(food)} className="bg-charcoal flex size-11 items-center justify-center rounded-full text-white transition hover:rotate-6 hover:bg-friday disabled:opacity-30" aria-label={`Add ${food.name} to cart`}><Plus size={19} /></button></div>
      </div>
    </article>
  );
}

export function EmptyState({ title, text, href, action, compact = false }: { title: string; text: string; href: string; action: string; compact?: boolean }) {
  return <main className={`shell flex flex-col items-center justify-center text-center ${compact ? "py-12" : "min-h-[60vh] py-20"}`}><h1 className="font-display text-3xl font-bold">{title}</h1><p className="mt-3 max-w-md leading-7 text-stone-500">{text}</p><Link href={href} className={`${buttonClass} mt-7`}>{action}</Link></main>;
}

export function OrderSummary({ subtotal, delivery, action }: { subtotal: number; delivery: number; action?: React.ReactNode }) {
  return <aside className="h-fit rounded-3xl bg-charcoal p-7 text-white"><h2 className="font-display text-2xl font-bold">Order summary</h2><div className="mt-6 space-y-4 border-b border-white/10 pb-6 text-sm"><div className="flex justify-between text-stone-400"><span>Subtotal</span><span className="text-white">{money(subtotal)}</span></div><div className="flex justify-between text-stone-400"><span>Delivery</span><span className="text-white">{delivery ? money(delivery) : "Free"}</span></div></div><div className="my-6 flex items-end justify-between"><span className="font-bold">Total</span><span className="font-display text-2xl font-bold">{money(subtotal + delivery)}</span></div>{action}<p className="mt-4 text-center text-xs text-stone-500">Checkout · Freshness guaranteed</p></aside>;
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl bg-white p-6 soft-ring md:p-8"><h2 className="font-display mb-6 text-2xl font-bold">{title}</h2>{children}</section>;
}

export function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block text-sm font-semibold">{label}<input {...props} className={`${inputClass} mt-2`} /></label>;
}

export function ConfirmedOrder({ order }: { order: Order | null }) {
  if (!order) return <EmptyState title="No recent order found." text="Place an order and your confirmation will appear here." href="/menu" action="Order now" />;
  return <main className="shell flex min-h-[70vh] items-center justify-center py-14"><div className="w-full max-w-2xl rounded-[2.5rem] bg-white p-8 text-center food-shadow md:p-12"><span className="bg-sage mx-auto flex size-20 items-center justify-center rounded-full text-white">✓</span><p className="text-friday mt-8 text-xs font-bold uppercase tracking-[.22em]">Order {order.status}</p><h1 className="font-display mt-3 text-4xl font-semibold">{order.status === "confirmed" ? "Dinner is on its way." : "Your order update."}</h1><p className="mx-auto mt-4 max-w-md leading-7 text-stone-500">Thanks, {order.customerName}. Your order has been received by the Friday team.</p><div className="mt-8 grid gap-3 rounded-3xl bg-stone-50 p-5 text-left sm:grid-cols-2"><div><p className="text-xs text-stone-400">Order number</p><p className="mt-1 font-bold">{order.orderNumber}</p></div><div><p className="text-xs text-stone-400">Estimated delivery</p><p className="mt-1 font-bold">35–45 minutes</p></div><div><p className="text-xs text-stone-400">Total</p><p className="mt-1 font-bold">{money(order.total)}</p></div><div><p className="text-xs text-stone-400">Payment</p><p className="mt-1 font-bold capitalize">{order.paymentMethod.replace("-", " ")}</p></div></div><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href={`/order-tracking?number=${encodeURIComponent(order.orderNumber)}`} className={buttonClass}>Track order</Link><Link href="/menu" className="rounded-full border border-stone-200 px-6 py-3.5 text-sm font-bold">Back to menu</Link></div></div></main>;
}
