"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { menuCategories, menuFoods } from "@/lib/menu-data";
import {
  completeOrder,
  removeFromCart,
  setOrders,
  setUser,
  updateCartItem,
  updateProfile,
  type Order,
} from "@/lib/store/store";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  buttonClass,
  ConfirmedOrder,
  EmptyState,
  Field,
  FoodCard,
  FormSection,
  imageUrl,
  inputClass,
  money,
  OrderSummary,
  SectionTitle,
  useAddFood,
} from "@/components/storefront-ui";

export function HomePage() {
  const add = useAddFood();
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="shell grid min-h-[680px] items-center gap-12 py-16 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative z-10">
            <p className="text-friday mb-5 text-xs font-bold uppercase tracking-[.24em]">Kigali’s feel-good kitchen</p>
            <h1 className="font-display text-balance text-6xl font-semibold leading-[.96] tracking-tight text-charcoal md:text-8xl">Great food.<br /><em className="text-friday font-normal">Friday feeling.</em></h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-stone-600">Freshly grilled favourites, local comfort food and joyful sharing plates, made to order and delivered across Kigali.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link href="/menu" className={buttonClass}>Order now <ArrowRight size={17} /></Link><Link href="/categories" className="inline-flex items-center rounded-full border border-stone-300 px-6 py-3.5 text-sm font-bold transition hover:bg-white">Explore categories</Link></div>
            <div className="mt-10 flex items-center gap-6 text-sm text-stone-600"><span className="flex items-center gap-2"><Clock3 size={18} className="text-friday" /> 25–40 min</span><span className="flex items-center gap-2"><Star size={18} className="fill-friday text-friday" /> 4.9 Kigali rating</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-2xl"><div className="absolute -inset-12 rounded-full bg-orange-200/50 blur-3xl" /><div className="relative aspect-square overflow-hidden rounded-[45%_55%_50%_45%] border-[12px] border-white shadow-xl"><img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=85" alt="Friday Restaurant signature food spread" className="size-full object-cover" /></div><div className="absolute -bottom-2 -left-3 rounded-2xl bg-white p-4 shadow-lg"><p className="text-xs text-stone-500">Today’s favourite</p><p className="mt-1 font-bold">Friday Family Feast</p></div></div>
        </div>
      </section>
      <section className="bg-white py-20"><div className="shell"><div className="flex items-end justify-between gap-6"><SectionTitle eyebrow="Choose your mood" title="There’s always something good." /><Link href="/categories" className="mb-10 hidden items-center gap-2 text-sm font-bold md:flex">All categories <ArrowRight size={16} /></Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{menuCategories.map((category) => <Link key={category.id} href={`/menu?category=${category.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-stone-200">{imageUrl(category.image) && <img src={imageUrl(category.image)} alt={category.image?.alt || category.name} className="size-full object-cover transition duration-700 group-hover:scale-110" />}<span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" /><span className="font-display absolute bottom-5 left-5 right-4 text-xl font-bold text-white">{category.name}</span></Link>)}</div></div></section>
      <section className="py-24"><div className="shell"><SectionTitle eyebrow="Friday favourites" title="The dishes Kigali keeps coming back for." text="Made fresh when you order, with generous portions and ingredients we’re proud of." /><div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{menuFoods.filter((food) => food.featured).slice(0, 6).map((food) => <FoodCard key={food.id} food={food} add={add} />)}</div><div className="mt-12 text-center"><Link href="/menu" className={buttonClass}>See the full menu <ArrowRight size={17} /></Link></div></div></section>
      <section id="about" className="shell overflow-hidden rounded-[2.5rem] bg-sage text-white"><div className="grid lg:grid-cols-2"><img src="https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1000&q=85" alt="Friday Restaurant grilled signature dishes" className="h-full min-h-96 w-full object-cover" /><div className="flex flex-col justify-center p-10 md:p-16"><p className="mb-4 text-xs font-bold uppercase tracking-[.22em] text-orange-200">Our kitchen</p><h2 className="font-display text-4xl font-semibold md:text-5xl">Made with Kigali energy.</h2><p className="mt-6 leading-8 text-white/75">Friday is your neighbourhood table: familiar flavours, playful twists and a warm welcome every day of the week. We source locally and cook everything with care.</p><Link href="/contact" className="mt-8 inline-flex items-center gap-2 font-bold">Come say hello <ArrowRight size={17} /></Link></div></div></section>
    </>
  );
}

export function MenuPage({ searchMode = false }: { searchMode?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");
  const add = useAddFood();
  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("category");
    if (selected) setCategory(selected);
  }, []);
  const filtered = menuFoods.filter((food) => {
    const matches = food.name.toLowerCase().includes(query.toLowerCase()) || food.description.toLowerCase().includes(query.toLowerCase());
    const categoryMatches = category === "all" || food.category?.slug === category;
    const priceMatches = price === "all" || (price === "under-10" ? food.price < 10_000 : price === "10-15" ? food.price >= 10_000 && food.price <= 15_000 : food.price > 15_000);
    return matches && categoryMatches && priceMatches;
  });
  return <main className="shell py-14"><SectionTitle eyebrow={searchMode ? "Find a favourite" : "Made fresh for you"} title={searchMode ? "Search Friday." : "Our menu"} text="Grilled, stacked, tossed and baked to order in our Kigali kitchen." /><div className="soft-ring sticky top-24 z-20 mb-10 grid gap-3 rounded-3xl bg-white/95 p-3 backdrop-blur md:grid-cols-[1fr_auto_auto]"><label className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} /><input className={`${inputClass} pl-11`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search burgers, chicken, pizza..." /></label><select aria-label="Filter by category" className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold outline-none" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{menuCategories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select><select aria-label="Filter by price" className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold outline-none" value={price} onChange={(event) => setPrice(event.target.value)}><option value="all">Any price</option><option value="under-10">Under 10,000</option><option value="10-15">10,000–15,000</option><option value="over-15">Over 15,000</option></select></div><div className="mb-6 flex items-center justify-between"><p className="text-sm text-stone-500">{filtered.length} delicious result{filtered.length === 1 ? "" : "s"}</p>{(query || category !== "all" || price !== "all") && <button type="button" onClick={() => { setQuery(""); setCategory("all"); setPrice("all"); }} className="text-sm font-bold text-friday">Clear filters</button>}</div>{filtered.length ? <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{filtered.map((food) => <FoodCard key={food.id} food={food} add={add} />)}</div> : <div className="rounded-3xl bg-white py-20 text-center"><UtensilsCrossed className="mx-auto text-stone-300" size={40} /><h3 className="font-display mt-4 text-2xl font-bold">No dishes match that yet.</h3><p className="mt-2 text-stone-500">Try another search or clear your filters.</p></div>}</main>;
}

export function CategoriesPage() {
  return <main className="shell py-14"><SectionTitle eyebrow="Pick a craving" title="Browse by category." text="Whatever kind of Friday you’re having, there’s a plate for it." /><div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{menuCategories.map((category) => <Link href={`/menu?category=${category.slug}`} key={category.id} className="group overflow-hidden rounded-[2rem] bg-white food-shadow"><div className="aspect-[16/10] overflow-hidden">{imageUrl(category.image) && <img src={imageUrl(category.image)} alt={category.image?.alt || category.name} className="size-full object-cover transition duration-700 group-hover:scale-105" />}</div><div className="p-7"><div className="flex items-center justify-between"><h2 className="font-display text-2xl font-bold">{category.name}</h2><span className="flex size-10 items-center justify-center rounded-full bg-orange-50 text-friday"><ArrowRight size={18} /></span></div><p className="mt-3 leading-7 text-stone-500">{category.description}</p></div></Link>)}</div></main>;
}

export function FoodDetailsPage({ slug }: { slug: string }) {
  const food = menuFoods.find((item) => item.slug === slug);
  const add = useAddFood();
  const [quantity, setQuantity] = useState(1);
  if (!food) return <EmptyState title="Dish not found" text="This dish may no longer be on the menu." href="/menu" action="Back to menu" />;
  return <main className="shell py-12"><Link href="/menu" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-stone-500">← Back to menu</Link><div className="grid gap-12 lg:grid-cols-2"><div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-white food-shadow">{imageUrl(food.image) && <img src={imageUrl(food.image)} alt={food.image?.alt || food.name} className="size-full object-cover" />}</div><div className="flex flex-col justify-center"><span className="text-friday text-xs font-bold uppercase tracking-[.2em]">{food.category?.name}</span><h1 className="font-display mt-4 text-5xl font-semibold leading-tight md:text-6xl">{food.name}</h1><div className="mt-5 flex gap-5 text-sm text-stone-500"><span className="flex items-center gap-1.5"><Star size={16} className="fill-amber-400 text-amber-400" /> {food.rating}</span><span className="flex items-center gap-1.5"><Clock3 size={16} /> {food.prepTime} min</span><span>{food.calories} kcal</span></div><p className="mt-7 text-lg leading-8 text-stone-600">{food.description}</p><div className="mt-8 border-y border-stone-200 py-7"><p className="font-display text-3xl font-bold">{money(food.price)}</p><p className="mt-1 text-sm text-stone-500">Freshly prepared · Delivery available</p></div><div className="mt-8 flex flex-wrap gap-4"><div className="flex items-center rounded-full border border-stone-200 bg-white p-1"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex size-11 items-center justify-center rounded-full hover:bg-stone-100"><Minus size={16} /></button><span className="w-10 text-center font-bold">{quantity}</span><button type="button" onClick={() => setQuantity(quantity + 1)} className="flex size-11 items-center justify-center rounded-full hover:bg-stone-100"><Plus size={16} /></button></div><button type="button" onClick={() => add(food, quantity)} className={`${buttonClass} flex-1`}>Add to bag · {money(food.price * quantity)}</button></div><p className="mt-5 flex items-center gap-2 text-sm font-semibold text-sage"><Check size={17} /> Available today</p></div></div></main>;
}

export function CartPage() {
  const cart = useAppSelector((state) => state.app.cart);
  const dispatch = useAppDispatch();
  const subtotal = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  const delivery = subtotal >= 30_000 ? 0 : 2_000;
  if (!cart.length) return <EmptyState title="Your bag is waiting." text="Add something delicious from the menu to get started." href="/menu" action="Explore the menu" />;
  return <main className="shell py-14"><SectionTitle eyebrow="Your order" title="Good choices." /><div className="grid gap-10 lg:grid-cols-[1fr_380px]"><div className="space-y-4">{cart.map(({ food, quantity }) => <div key={food.id} className="flex gap-4 rounded-3xl bg-white p-4 soft-ring"><div className="size-28 shrink-0 overflow-hidden rounded-2xl bg-stone-100">{imageUrl(food.image) && <img src={imageUrl(food.image)} alt="" className="size-full object-cover" />}</div><div className="flex flex-1 flex-col justify-between py-1"><div className="flex justify-between gap-4"><div><Link href={`/food/${food.slug}`} className="font-display text-lg font-bold">{food.name}</Link><p className="mt-1 text-sm text-stone-500">{money(food.price)}</p></div><button type="button" onClick={() => dispatch(removeFromCart(food.id))} className="text-stone-400 transition hover:text-red-500" aria-label="Remove item"><Trash2 size={18} /></button></div><div className="flex items-center justify-between"><div className="flex items-center rounded-full border border-stone-200"><button type="button" onClick={() => dispatch(updateCartItem({ id: food.id, quantity: quantity - 1 }))} className="p-2.5" aria-label={`Remove one ${food.name}`}><Minus size={14} /></button><span className="w-7 text-center text-sm font-bold">{quantity}</span><button type="button" onClick={() => dispatch(updateCartItem({ id: food.id, quantity: quantity + 1 }))} className="p-2.5" aria-label={`Add one ${food.name}`}><Plus size={14} /></button></div><span className="font-bold">{money(food.price * quantity)}</span></div></div></div>)}</div><OrderSummary subtotal={subtotal} delivery={delivery} action={<Link href="/checkout" className={`${buttonClass} w-full`}>Continue to checkout <ArrowRight size={17} /></Link>} /></div></main>;
}

export function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.app.cart);
  const user = useAppSelector((state) => state.app.user);
  const subtotal = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  const delivery = subtotal >= 30_000 ? 0 : 2_000;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!cart.length) return <EmptyState title="Nothing to check out yet." text="Your cart is empty." href="/menu" action="Choose a meal" />;
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
          items: cart.map(({ food, quantity }) => ({ food: food.id, quantity })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not place your order.");
      const order = result.order as Order;
      dispatch(completeOrder(order));
      localStorage.setItem("friday-order", JSON.stringify(order));
      router.push("/order-confirmation");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not place the order.");
    } finally {
      setLoading(false);
    }
  }
  return <main className="shell py-14"><SectionTitle eyebrow="Almost there" title="Where should we bring it?" /><div className="grid gap-10 lg:grid-cols-[1fr_380px]"><form onSubmit={submit} className="space-y-8"><FormSection title="Your details"><div className="grid gap-4 sm:grid-cols-2"><Field name="name" label="Full name" defaultValue={user?.name} required /><Field name="email" type="email" label="Email address" defaultValue={user?.email} required /><Field name="phone" label="Phone number" placeholder="+250 7•• ••• •••" defaultValue={user?.phone} required /><Field name="address" label="Delivery address" placeholder="Street, neighbourhood, landmark" defaultValue={user?.defaultAddress} required /></div></FormSection><FormSection title="Payment"><div className="grid gap-3 sm:grid-cols-3">{[["mobile-money", "Mobile Money"], ["card", "Card on delivery"], ["cash", "Cash on delivery"]].map(([value, label], index) => <label key={value} className="cursor-pointer rounded-2xl border border-stone-200 bg-white p-4 text-sm font-bold has-[:checked]:border-friday has-[:checked]:bg-orange-50"><input type="radio" name="payment" value={value} defaultChecked={index === 0} className="mr-2 accent-friday" />{label}</label>)}</div></FormSection><FormSection title="One last thing"><label className="block text-sm font-semibold">Delivery notes<textarea name="notes" className={`${inputClass} mt-2 min-h-28 resize-none`} placeholder="Gate code, allergies or anything else we should know..." /></label></FormSection>{error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}<button disabled={loading} className={`${buttonClass} w-full sm:w-auto`}>{loading ? "Placing your order…" : `Place order · ${money(subtotal + delivery)}`}</button></form><OrderSummary subtotal={subtotal} delivery={delivery} /></div></main>;
}

export function OrderConfirmationPage({ id }: { id?: string }) {
  const order = useAppSelector((state) => id ? state.app.orders.find((item) => item.id === id) || null : state.app.lastOrder);
  return <ConfirmedOrder order={order} />;
}

export function TrackingPage() {
  const [number, setNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("number");
    if (initial) setNumber(initial);
  }, []);
  async function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setOrder(null); setSearched(true);
    try {
      const response = await fetch(`/api/orders?orderNumber=${encodeURIComponent(number.trim())}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not look up this order.");
      setOrder(result.order);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not look up this order.");
    } finally {
      setLoading(false);
    }
  }
  const steps = ["Order confirmed", "Preparing your food", "On the way", "Delivered"];
  const statusIndex: Record<string, number> = { confirmed: 0, preparing: 1, "on-the-way": 2, delivered: 3 };
  const current = order ? statusIndex[order.status] ?? 0 : 0;
  return <main className="shell py-14"><div className="mx-auto max-w-3xl"><SectionTitle eyebrow="Order updates" title="Track your Friday." text="Enter your order number to see the latest kitchen and delivery status." /><form onSubmit={track} className="flex gap-3 rounded-3xl bg-white p-3 soft-ring"><input value={number} onChange={(event) => setNumber(event.target.value)} className={`${inputClass} border-0 bg-stone-50`} placeholder="e.g. FR-1234567" required /><button disabled={loading} className={buttonClass}>{loading ? "Checking…" : "Track"}</button></form>{error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}{searched && !order && !error && <p className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm font-semibold text-stone-700">We couldn’t find that order. Check the number and try again.</p>}{order && <div className="mt-8 rounded-[2rem] bg-white p-8 food-shadow"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-6"><div><p className="text-xs text-stone-400">Tracking order</p><p className="mt-1 font-bold">{order.orderNumber}</p></div><span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-bold capitalize text-friday">{order.status.replace("-", " ")}</span></div><div className="mt-8">{steps.map((step, index) => <div key={step} className="flex gap-4"><div className="flex flex-col items-center"><span className={`flex size-10 items-center justify-center rounded-full ${index <= current ? "bg-friday text-white" : "bg-stone-100 text-stone-400"}`}>{index <= current ? <Check size={17} /> : index + 1}</span>{index < steps.length - 1 && <span className={`h-14 w-0.5 ${index < current ? "bg-friday" : "bg-stone-100"}`} />}</div><div className="pt-2"><p className={`font-bold ${index <= current ? "text-charcoal" : "text-stone-400"}`}>{step}</p>{index === current && <p className="mt-1 text-sm text-stone-500">Your order is up to date.</p>}</div></div>)}</div></div>}</div></main>;
}

export function AuthPage({ mode }: { mode: "login" | "register" | "forgot" }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (mode === "forgot") {
        setMessage("Password reset email is not configured yet. Please contact the restaurant for account help.");
        return;
      }
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, name: data.name, email: data.email, password: data.password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Please check your details and try again.");
      dispatch(setUser(result.user));
      router.push("/profile");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  }
  const content = mode === "login" ? ["Welcome back.", "Log in to reorder favourites and track every delivery."] : mode === "register" ? ["Your Friday starts here.", "Create an account for faster checkout and easy order history."] : ["Reset your password.", "We’ll send recovery instructions to your email address."];
  return <main className="shell grid min-h-[72vh] items-center gap-10 py-14 lg:grid-cols-2"><div className="hidden overflow-hidden rounded-[2.5rem] lg:block"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85" alt="A fresh Friday Restaurant meal" className="h-[620px] w-full object-cover" /></div><div className="mx-auto w-full max-w-md"><p className="text-friday text-xs font-bold uppercase tracking-[.22em]">{mode === "login" ? "Customer login" : mode === "register" ? "Join Friday" : "Account recovery"}</p><h1 className="font-display mt-3 text-5xl font-semibold">{content[0]}</h1><p className="mt-4 leading-7 text-stone-500">{content[1]}</p><form onSubmit={submit} className="mt-8 space-y-4">{mode === "register" && <Field name="name" label="Full name" required />}<Field name="email" type="email" label="Email address" required />{mode !== "forgot" && <Field name="password" type="password" label="Password" minLength={8} required />}{error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}{message && <p className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700">{message}</p>}<button disabled={loading} className={`${buttonClass} w-full`}>{loading ? "Please wait…" : mode === "login" ? "Log in" : mode === "register" ? "Create account" : "Send reset instructions"}</button></form>{mode === "login" && <div className="mt-5 flex justify-between text-sm"><Link href="/forgot-password" className="font-semibold text-friday">Forgot password?</Link><Link href="/register" className="font-semibold">Create account</Link></div>}{mode === "register" && <p className="mt-5 text-center text-sm text-stone-500">Already have an account? <Link href="/login" className="font-bold text-friday">Log in</Link></p>}{mode === "forgot" && <Link href="/login" className="mt-5 block text-center text-sm font-bold text-friday">Back to login</Link>}</div></main>;
}

export function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.app.user);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  if (!user) return <EmptyState title="Log in to see your profile." text="Your saved details and order history live here." href="/login" action="Log in" />;
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/auth", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.name, phone: data.phone, defaultAddress: data.defaultAddress }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update profile.");
      dispatch(updateProfile(result.user));
      setMessage("Profile updated successfully.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update your profile.");
    }
  }
  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    dispatch(setUser(null));
    dispatch(setOrders([]));
    router.push("/");
  }
  return <main className="shell py-14"><div className="flex flex-wrap items-end justify-between gap-4"><SectionTitle eyebrow="Your account" title={`Hello, ${user.name.split(" ")[0]}.`} /><button type="button" onClick={() => void logout()} className="mb-10 rounded-full border border-stone-200 px-5 py-3 text-sm font-bold">Log out</button></div><div className="grid gap-8 lg:grid-cols-[260px_1fr]"><aside className="h-fit rounded-3xl bg-charcoal p-5 text-white"><Link href="/profile" className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold">Profile</Link><Link href="/order-history" className="mt-2 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-stone-300 hover:bg-white/10">Order history</Link></aside><form onSubmit={save} className="rounded-3xl bg-white p-7 soft-ring md:p-9"><h2 className="font-display text-2xl font-bold">Personal details</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field name="name" label="Full name" defaultValue={user.name} required /><Field name="email" type="email" label="Email" defaultValue={user.email} disabled /><Field name="phone" label="Phone" defaultValue={user.phone} /><Field name="defaultAddress" label="Default delivery address" defaultValue={user.defaultAddress} /></div>{message && <p className="mt-5 text-sm font-semibold text-sage">{message}</p>}{error && <p role="alert" className="mt-5 text-sm font-semibold text-red-600">{error}</p>}<button className={`${buttonClass} mt-7`}>Save changes</button></form></div></main>;
}

export function OrderHistoryPage() {
  const user = useAppSelector((state) => state.app.user);
  const orders = useAppSelector((state) => state.app.orders);
  const error = useAppSelector((state) => state.app.ordersError);
  if (!user) return <EmptyState title="Log in to see previous orders." text="Your Friday favourites are even easier to reorder." href="/login" action="Log in" />;
  return <main className="shell py-14"><SectionTitle eyebrow="Your account" title="Order history." />{error && <p role="alert" className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}{orders.length ? <div className="space-y-4">{orders.map((order) => <Link key={order.id} href={`/order-details/${order.id}`} className="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-white p-6 soft-ring"><div><p className="font-display text-xl font-bold">{order.orderNumber}</p><p className="mt-1 text-sm text-stone-500">{order.items.length} items · {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recent"}</p></div><div className="text-right"><span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold capitalize text-green-700">{order.status}</span><p className="mt-2 font-bold">{money(order.total)}</p></div></Link>)}</div> : !error && <EmptyState title="No orders yet." text="Once you order, everything will appear here." href="/menu" action="Browse menu" compact />}</main>;
}

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const messages = JSON.parse(localStorage.getItem("friday-contact-messages") || "[]");
      messages.push({ ...Object.fromEntries(new FormData(event.currentTarget)), createdAt: new Date().toISOString() });
      localStorage.setItem("friday-contact-messages", JSON.stringify(messages));
      setSent(true);
      event.currentTarget.reset();
    } catch {
      setError("We could not save your message. Please try again.");
    }
  }
  return <main className="shell py-14"><SectionTitle eyebrow="Talk to us" title="We’d love to hear from you." text="Questions, feedback or a special request? Call or email our Kigali team." /><div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr]"><div className="rounded-[2rem] bg-charcoal p-8 text-white"><h2 className="font-display text-2xl font-bold">Friday Restaurant</h2><div className="mt-8 space-y-6 text-sm text-stone-300"><p className="flex gap-3"><MapPin className="text-friday" /> KG 7 Ave, Kimihurura<br />Kigali, Rwanda</p><p className="flex gap-3"><Phone className="text-friday" /> +250 788 123 456</p><p className="flex gap-3"><Mail className="text-friday" /> hello@friday.rw</p><p className="flex gap-3"><Clock3 className="text-friday" /> Daily, 10:00–22:30</p></div></div><form onSubmit={submit} className="rounded-[2rem] bg-white p-7 soft-ring md:p-9"><div className="grid gap-5 sm:grid-cols-2"><Field name="name" label="Your name" required /><Field name="email" type="email" label="Email address" required /><div className="sm:col-span-2"><Field name="subject" label="Subject" required /></div><label className="block text-sm font-semibold sm:col-span-2">Message<textarea name="message" className={`${inputClass} mt-2 min-h-36 resize-none`} required /></label></div>{sent && <p className="mt-5 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">Thanks! Your message has been saved in this browser.</p>}{error && <p role="alert" className="mt-5 text-sm font-bold text-red-600">{error}</p>}<button className={`${buttonClass} mt-6`}>Save message <ArrowRight size={17} /></button></form></div></main>;
}

export function FAQPage() {
  const [open, setOpen] = useState(0);
  const questions = [
    ["Where do you deliver?", "We deliver throughout central Kigali, including Kimihurura, Kacyiru, Remera, Nyarutarama, Kigali Heights and nearby neighbourhoods."],
    ["How long does delivery take?", "Most orders arrive in 25–45 minutes. Larger orders and peak Friday evenings may take a little longer."],
    ["Can I change my order after placing it?", "Call us as soon as possible. If the kitchen has not started your order, we will do our best to update it."],
    ["What payment methods do you accept?", "We accept MTN MoMo, Airtel Money, cash on delivery and card on delivery."],
    ["Do you cater for allergies?", "Please add allergy information in the delivery notes. Our team will contact you if we cannot safely accommodate the request."],
  ];
  return <main className="shell max-w-4xl py-14"><SectionTitle eyebrow="Good to know" title="Frequently asked questions." /><div className="space-y-3">{questions.map(([question, answer], index) => <div key={question} className="overflow-hidden rounded-2xl bg-white soft-ring"><button type="button" onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between p-5 text-left font-bold">{question}<ChevronDown size={18} className={`transition ${open === index ? "rotate-180" : ""}`} /></button>{open === index && <p className="px-5 pb-5 leading-7 text-stone-500">{answer}</p>}</div>)}</div></main>;
}

export function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const privacy = [["Information we collect", "We collect the details you provide when ordering or creating an account, including your name, contact details, delivery address and order history."], ["How we use it", "We use your information to prepare and deliver orders, provide customer support, improve our menu and keep your account secure."], ["Your choices", "You can update your account details at any time. Contact us to request access to or deletion of your personal information."]];
  const terms = [["Ordering", "Orders are confirmed once accepted by our kitchen. Availability and preparation times may vary during busy periods."], ["Delivery and payment", "Please provide an accurate Kigali delivery address and reachable phone number. Payment is due using the method chosen at checkout."], ["Cancellations and refunds", "Contact us immediately if there is an issue. Refunds are assessed fairly based on order status and product quality."]];
  const items = type === "privacy" ? privacy : terms;
  return <main className="shell max-w-4xl py-14"><SectionTitle eyebrow="Friday Restaurant" title={type === "privacy" ? "Privacy policy." : "Terms of service."} text={`Last updated ${new Date().toLocaleDateString("en-RW", { month: "long", year: "numeric" })}`} /><div className="rounded-[2rem] bg-white p-8 soft-ring md:p-12"><p className="leading-8 text-stone-600">{type === "privacy" ? "We respect your privacy and only collect what we need to serve you well." : "These terms help keep ordering from Friday clear, fair and delicious."}</p>{items.map(([title, text], index) => <section key={title} className="mt-9"><h2 className="font-display text-2xl font-bold">{index + 1}. {title}</h2><p className="mt-3 leading-8 text-stone-600">{text}</p></section>)}</div></main>;
}
