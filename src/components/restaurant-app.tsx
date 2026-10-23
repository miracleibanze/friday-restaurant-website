'use client'

import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Camera, Check, ChevronDown, ChevronRight, CircleUserRound, Clock3,
  Mail, MapPin, Menu as MenuIcon, MessageCircle, Minus, Phone, Plus, Search, ShoppingBag,
  Star, Trash2, Truck, UtensilsCrossed, X,
} from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'

type Media = { url?: string; alt?: string }
type Category = { id: string; name: string; slug: string; description?: string; image?: Media }
type Food = {
  id: string; name: string; slug: string; description: string; price: number; available: boolean;
  featured: boolean; prepTime?: number; rating?: number; calories?: number; image?: Media; category?: Category
}
type CartItem = { food: Food; quantity: number }
type User = { id: string; name: string; email: string; phone?: string; defaultAddress?: string }
type Order = {
  id: string; orderNumber: string; status: string; customerName: string; email: string; phone: string;
  deliveryAddress: string; items: Array<{ food: string; name: string; price: number; quantity: number }>;
  subtotal: number; deliveryFee: number; total: number; paymentMethod: string; createdAt?: string
}

const money = (value: number) => `${new Intl.NumberFormat('en-RW').format(value)} RWF`
const api = axios.create({ baseURL: '/api' })
const inputClass = 'w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-friday focus:ring-4 focus:ring-orange-100'
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-full bg-friday px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-friday-dark disabled:cursor-not-allowed disabled:opacity-50'
const imageUrl = (media?: Media) => media?.url || ''

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Friday Restaurant home">
      <span className="bg-friday flex size-10 items-center justify-center rounded-full text-white"><UtensilsCrossed size={19} /></span>
      <span className="font-display text-2xl font-bold tracking-tight">Friday<span className="text-friday">.</span></span>
    </Link>
  )
}

function Header({ count, user }: { count: number; user: User | null }) {
  const [open, setOpen] = useState(false)
  const links = [['Menu', '/menu'], ['Categories', '/categories'], ['About', '/#about'], ['Contact', '/contact']]
  return (
    <>
      <div className="bg-charcoal py-2 text-center text-xs font-semibold text-white">
        Free delivery in Kigali on orders over 30,000 RWF
      </div>
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-cream/95 backdrop-blur-xl">
        <div className="shell flex h-20 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-8 lg:flex">
            {links.map(([label, href]) => <Link key={href} href={href} className="text-sm font-semibold text-stone-700 transition hover:text-friday">{label}</Link>)}
          </nav>
          <div className="flex items-center gap-1.5">
            <Link href="/search" className="flex size-11 items-center justify-center rounded-full transition hover:bg-white"><Search size={20} /></Link>
            <Link href={user ? '/profile' : '/login'} className="hidden size-11 items-center justify-center rounded-full transition hover:bg-white sm:flex"><CircleUserRound size={21} /></Link>
            <Link href="/cart" className="relative flex size-11 items-center justify-center rounded-full bg-charcoal text-white transition hover:bg-friday">
              <ShoppingBag size={19} />
              {count > 0 && <span className="bg-friday absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-cream">{count}</span>}
            </Link>
            <button type="button" onClick={() => setOpen(!open)} className="flex size-11 items-center justify-center rounded-full lg:hidden">{open ? <X /> : <MenuIcon />}</button>
          </div>
        </div>
        {open && <nav className="shell flex flex-col gap-1 border-t border-stone-200 py-4 lg:hidden">{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 font-semibold hover:bg-white">{label}</Link>)}<Link href={user ? '/profile' : '/login'} className="rounded-xl px-4 py-3 font-semibold hover:bg-white">{user ? 'My profile' : 'Log in'}</Link></nav>}
      </header>
    </>
  )
}

function Footer() {
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
  )
}

function FoodCard({ food, add }: { food: Food; add: (food: Food) => void }) {
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
  )
}

function SectionTitle({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return <div className="mb-10 max-w-2xl">{eyebrow && <p className="text-friday mb-3 text-xs font-bold uppercase tracking-[.22em]">{eyebrow}</p>}<h2 className="font-display text-balance text-4xl font-semibold leading-tight md:text-5xl">{title}</h2>{text && <p className="mt-4 leading-7 text-stone-600">{text}</p>}</div>
}

function Home({ foods, categories, add }: { foods: Food[]; categories: Category[]; add: (f: Food) => void }) {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="shell grid min-h-[720px] items-center gap-12 py-16 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative z-10">
            <p className="text-friday mb-5 text-xs font-bold uppercase tracking-[.24em]">Kigali’s feel-good kitchen</p>
            <h1 className="font-display text-balance text-6xl font-semibold leading-[.96] tracking-tight text-charcoal md:text-8xl">Great food.<br /><em className="text-friday font-normal">Friday feeling.</em></h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-stone-600">Freshly grilled favourites, local comfort food and joyful sharing plates, made to order and delivered across Kigali.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link href="/menu" className={buttonClass}>Order now <ArrowRight size={17} /></Link><Link href="/categories" className="inline-flex items-center rounded-full border border-stone-300 px-6 py-3.5 text-sm font-bold transition hover:bg-white">Explore categories</Link></div>
            <div className="mt-10 flex items-center gap-6 text-sm text-stone-600"><span className="flex items-center gap-2"><Clock3 size={18} className="text-friday" /> 25–40 min</span><span className="flex items-center gap-2"><Star size={18} className="fill-friday text-friday" /> 4.9 Kigali rating</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute -inset-12 rounded-full bg-orange-200/50 blur-3xl" />
            <div className="relative aspect-square overflow-hidden rounded-[45%_55%_50%_45%] border-[12px] border-white food-shadow">
              <img src="/api/media/file/friday-restaurant-spread-original.jpg" alt="Friday Restaurant signature food spread" className="size-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -left-3 rounded-2xl bg-white p-4 soft-ring"><p className="text-xs text-stone-500">Today’s favourite</p><p className="mt-1 font-bold">Friday Family Feast</p></div>
          </div>
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="shell"><div className="flex items-end justify-between gap-6"><SectionTitle eyebrow="Choose your mood" title="There’s always something good." /><Link href="/categories" className="mb-10 hidden items-center gap-2 text-sm font-bold md:flex">All categories <ArrowRight size={16} /></Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{categories.map((category) => <Link key={category.id} href={`/menu?category=${category.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-stone-200">{imageUrl(category.image) && <img src={imageUrl(category.image)} alt={category.image?.alt || category.name} className="size-full object-cover transition duration-700 group-hover:scale-110" />}<span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" /><span className="font-display absolute bottom-5 left-5 right-4 text-xl font-bold text-white">{category.name}</span></Link>)}</div></div>
      </section>
      <section className="py-24"><div className="shell"><SectionTitle eyebrow="Friday favourites" title="The dishes Kigali keeps coming back for." text="Made fresh when you order, with generous portions and ingredients we’re proud of." /><div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{foods.filter((f) => f.featured).slice(0, 6).map((food) => <FoodCard key={food.id} food={food} add={add} />)}</div><div className="mt-12 text-center"><Link href="/menu" className={buttonClass}>See the full menu <ArrowRight size={17} /></Link></div></div></section>
      <section id="about" className="shell overflow-hidden rounded-[2.5rem] bg-sage text-white"><div className="grid lg:grid-cols-2"><img src="/api/media/file/grilled-chicken-original.jpg" alt="Friday Restaurant grilled signature dishes" className="h-full min-h-96 w-full object-cover" /><div className="flex flex-col justify-center p-10 md:p-16"><p className="mb-4 text-xs font-bold uppercase tracking-[.22em] text-orange-200">Our kitchen</p><h2 className="font-display text-4xl font-semibold md:text-5xl">Made with Kigali energy.</h2><p className="mt-6 leading-8 text-white/75">Friday is your neighbourhood table: familiar flavours, playful twists and a warm welcome every day of the week. We source locally and cook everything with care.</p><Link href="/contact" className="mt-8 inline-flex items-center gap-2 font-bold">Come say hello <ArrowRight size={17} /></Link></div></div></section>
    </>
  )
}

function MenuPage({ foods, categories, add, initialSearch = '' }: { foods: Food[]; categories: Category[]; add: (f: Food) => void; initialSearch?: string }) {
  const [query, setQuery] = useState(initialSearch)
  const [category, setCategory] = useState('all')
  const [price, setPrice] = useState('all')
  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get('category')
    if (selected) setCategory(selected)
  }, [])
  const filtered = foods.filter((food) => {
    const matchesName = food.name.toLowerCase().includes(query.toLowerCase()) || food.description.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === 'all' || food.category?.slug === category
    const matchesPrice = price === 'all' || (price === 'under-10' ? food.price < 10000 : price === '10-15' ? food.price >= 10000 && food.price <= 15000 : food.price > 15000)
    return matchesName && matchesCategory && matchesPrice
  })
  return (
    <main className="shell py-14">
      <SectionTitle eyebrow={initialSearch !== undefined && initialSearch === '' ? 'Find a favourite' : 'Made fresh for you'} title={initialSearch !== undefined && initialSearch === '' ? 'Search Friday.' : 'Our menu'} text="Grilled, stacked, tossed and baked to order in our Kigali kitchen." />
      <div className="soft-ring sticky top-24 z-20 mb-10 grid gap-3 rounded-3xl bg-white/95 p-3 backdrop-blur md:grid-cols-[1fr_auto_auto]">
        <label className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} /><input className={`${inputClass} pl-11`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search burgers, chicken, pizza..." /></label>
        <select className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold outline-none" value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select>
        <select className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold outline-none" value={price} onChange={(e) => setPrice(e.target.value)}><option value="all">Any price</option><option value="under-10">Under 10,000</option><option value="10-15">10,000–15,000</option><option value="over-15">Over 15,000</option></select>
      </div>
      <div className="mb-6 flex items-center justify-between"><p className="text-sm text-stone-500">{filtered.length} delicious result{filtered.length === 1 ? '' : 's'}</p>{(query || category !== 'all' || price !== 'all') && <button type="button" onClick={() => { setQuery(''); setCategory('all'); setPrice('all') }} className="text-sm font-bold text-friday">Clear filters</button>}</div>
      {filtered.length ? <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{filtered.map((food) => <FoodCard key={food.id} food={food} add={add} />)}</div> : <div className="rounded-3xl bg-white py-20 text-center"><UtensilsCrossed className="mx-auto text-stone-300" size={40} /><h3 className="font-display mt-4 text-2xl font-bold">No dishes match that yet.</h3><p className="mt-2 text-stone-500">Try another search or clear your filters.</p></div>}
    </main>
  )
}

function CategoriesPage({ categories }: { categories: Category[] }) {
  return <main className="shell py-14"><SectionTitle eyebrow="Pick a craving" title="Browse by category." text="Whatever kind of Friday you’re having, there’s a plate for it." /><div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{categories.map((c) => <Link href={`/menu?category=${c.slug}`} key={c.id} className="group overflow-hidden rounded-[2rem] bg-white food-shadow"><div className="aspect-[16/10] overflow-hidden">{imageUrl(c.image) && <img src={imageUrl(c.image)} alt={c.image?.alt || c.name} className="size-full object-cover transition duration-700 group-hover:scale-105" />}</div><div className="p-7"><div className="flex items-center justify-between"><h2 className="font-display text-2xl font-bold">{c.name}</h2><span className="flex size-10 items-center justify-center rounded-full bg-orange-50 text-friday"><ArrowRight size={18} /></span></div><p className="mt-3 leading-7 text-stone-500">{c.description}</p></div></Link>)}</div></main>
}

function FoodDetails({ food, add }: { food?: Food; add: (food: Food, quantity?: number) => void }) {
  const [quantity, setQuantity] = useState(1)
  if (!food) return <EmptyState title="Dish not found" text="This dish may no longer be on the menu." href="/menu" action="Back to menu" />
  return <main className="shell py-12"><Link href="/menu" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-stone-500">← Back to menu</Link><div className="grid gap-12 lg:grid-cols-2"><div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-white food-shadow">{imageUrl(food.image) && <img src={imageUrl(food.image)} alt={food.image?.alt || food.name} className="size-full object-cover" />}</div><div className="flex flex-col justify-center"><span className="text-friday text-xs font-bold uppercase tracking-[.2em]">{food.category?.name}</span><h1 className="font-display mt-4 text-5xl font-semibold leading-tight md:text-6xl">{food.name}</h1><div className="mt-5 flex gap-5 text-sm text-stone-500"><span className="flex items-center gap-1.5"><Star size={16} className="fill-amber-400 text-amber-400" /> {food.rating}</span><span className="flex items-center gap-1.5"><Clock3 size={16} /> {food.prepTime} min</span><span>{food.calories} kcal</span></div><p className="mt-7 text-lg leading-8 text-stone-600">{food.description}</p><div className="mt-8 border-y border-stone-200 py-7"><p className="font-display text-3xl font-bold">{money(food.price)}</p><p className="mt-1 text-sm text-stone-500">Freshly prepared · Delivery available</p></div><div className="mt-8 flex flex-wrap gap-4"><div className="flex items-center rounded-full border border-stone-200 bg-white p-1"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex size-11 items-center justify-center rounded-full hover:bg-stone-100"><Minus size={16} /></button><span className="w-10 text-center font-bold">{quantity}</span><button type="button" onClick={() => setQuantity(quantity + 1)} className="flex size-11 items-center justify-center rounded-full hover:bg-stone-100"><Plus size={16} /></button></div><button type="button" onClick={() => add(food, quantity)} className={`${buttonClass} flex-1`}>Add to bag · {money(food.price * quantity)}</button></div><p className="mt-5 flex items-center gap-2 text-sm font-semibold text-sage"><Check size={17} /> Available today</p></div></div></main>
}

function CartPage({ cart, update, remove }: { cart: CartItem[]; update: (id: string, q: number) => void; remove: (id: string) => void }) {
  const subtotal = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0)
  const delivery = subtotal >= 30000 ? 0 : 2000
  if (!cart.length) return <EmptyState title="Your bag is waiting." text="Add something delicious from the menu to get started." href="/menu" action="Explore the menu" />
  return <main className="shell py-14"><SectionTitle eyebrow="Your order" title="Good choices." /><div className="grid gap-10 lg:grid-cols-[1fr_380px]"><div className="space-y-4">{cart.map(({ food, quantity }) => <div key={food.id} className="flex gap-4 rounded-3xl bg-white p-4 soft-ring"><div className="size-28 shrink-0 overflow-hidden rounded-2xl bg-stone-100">{imageUrl(food.image) && <img src={imageUrl(food.image)} alt="" className="size-full object-cover" />}</div><div className="flex flex-1 flex-col justify-between py-1"><div className="flex justify-between gap-4"><div><Link href={`/food/${food.slug}`} className="font-display text-lg font-bold">{food.name}</Link><p className="mt-1 text-sm text-stone-500">{money(food.price)}</p></div><button type="button" onClick={() => remove(food.id)} className="text-stone-400 transition hover:text-red-500" aria-label="Remove item"><Trash2 size={18} /></button></div><div className="flex items-center justify-between"><div className="flex items-center rounded-full border border-stone-200"><button type="button" onClick={() => update(food.id, quantity - 1)} className="p-2.5"><Minus size={14} /></button><span className="w-7 text-center text-sm font-bold">{quantity}</span><button type="button" onClick={() => update(food.id, quantity + 1)} className="p-2.5"><Plus size={14} /></button></div><span className="font-bold">{money(food.price * quantity)}</span></div></div></div>)}</div><OrderSummary subtotal={subtotal} delivery={delivery} action={<Link href="/checkout" className={`${buttonClass} w-full`}>Continue to checkout <ArrowRight size={17} /></Link>} /></div></main>
}

function OrderSummary({ subtotal, delivery, action }: { subtotal: number; delivery: number; action?: React.ReactNode }) {
  return <aside className="h-fit rounded-3xl bg-charcoal p-7 text-white"><h2 className="font-display text-2xl font-bold">Order summary</h2><div className="mt-6 space-y-4 border-b border-white/10 pb-6 text-sm"><div className="flex justify-between text-stone-400"><span>Subtotal</span><span className="text-white">{money(subtotal)}</span></div><div className="flex justify-between text-stone-400"><span>Delivery</span><span className="text-white">{delivery ? money(delivery) : 'Free'}</span></div></div><div className="my-6 flex items-end justify-between"><span className="font-bold">Total</span><span className="font-display text-2xl font-bold">{money(subtotal + delivery)}</span></div>{action}<p className="mt-4 text-center text-xs text-stone-500">Secure checkout · Freshness guaranteed</p></aside>
}

function Checkout({ cart, user, completed }: { cart: CartItem[]; user: User | null; completed: (order: Order) => void }) {
  const router = useRouter()
  const subtotal = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0)
  const deliveryFee = subtotal >= 30000 ? 0 : 2000
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  if (!cart.length) return <EmptyState title="Nothing to check out yet." text="Your cart is empty." href="/menu" action="Choose a meal" />
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('')
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const orderNumber = `FR-${Date.now().toString().slice(-7)}`
    try {
      const response = await api.post('/orders', {
        orderNumber, customer: user?.id || undefined, customerName: data.name, email: data.email, phone: data.phone,
        deliveryAddress: data.address, notes: data.notes, paymentMethod: data.payment,
        items: cart.map((item) => ({ food: item.food.id, name: item.food.name, price: item.food.price, quantity: item.quantity })),
        subtotal, deliveryFee, total: subtotal + deliveryFee, status: 'confirmed',
      })
      completed(response.data.doc); router.push('/order-confirmation')
    } catch (err) { setError(axios.isAxiosError(err) ? (err.response?.data?.errors?.[0]?.message || 'We could not place your order. Please check your details.') : 'Something went wrong.') }
    finally { setLoading(false) }
  }
  return <main className="shell py-14"><SectionTitle eyebrow="Almost there" title="Where should we bring it?" /><div className="grid gap-10 lg:grid-cols-[1fr_380px]"><form onSubmit={submit} className="space-y-8"><FormSection title="Your details"><div className="grid gap-4 sm:grid-cols-2"><Field name="name" label="Full name" defaultValue={user?.name} required /><Field name="email" type="email" label="Email address" defaultValue={user?.email} required /><Field name="phone" label="Phone number" placeholder="+250 7•• ••• •••" defaultValue={user?.phone} required /><Field name="address" label="Delivery address" placeholder="Street, neighbourhood, landmark" defaultValue={user?.defaultAddress} required /></div></FormSection><FormSection title="Payment"><div className="grid gap-3 sm:grid-cols-3">{[['mobile-money', 'Mobile Money'], ['card', 'Card on delivery'], ['cash', 'Cash on delivery']].map(([value, label], i) => <label key={value} className="cursor-pointer rounded-2xl border border-stone-200 bg-white p-4 text-sm font-bold has-[:checked]:border-friday has-[:checked]:bg-orange-50"><input type="radio" name="payment" value={value} defaultChecked={i === 0} className="mr-2 accent-friday" />{label}</label>)}</div></FormSection><FormSection title="One last thing"><label className="block text-sm font-semibold">Delivery notes<textarea name="notes" className={`${inputClass} mt-2 min-h-28 resize-none`} placeholder="Gate code, allergies or anything else we should know..." /></label></FormSection>{error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}<button disabled={loading} className={`${buttonClass} w-full sm:w-auto`}>{loading ? 'Placing your order…' : `Place order · ${money(subtotal + deliveryFee)}`}</button></form><OrderSummary subtotal={subtotal} delivery={deliveryFee} /></div></main>
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl bg-white p-6 soft-ring md:p-8"><h2 className="font-display mb-6 text-2xl font-bold">{title}</h2>{children}</section>
}
function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block text-sm font-semibold">{label}<input {...props} className={`${inputClass} mt-2`} /></label>
}

function Confirmation({ order }: { order: Order | null }) {
  if (!order) return <EmptyState title="No recent order found." text="Place an order and your confirmation will appear here." href="/menu" action="Order now" />
  return <main className="shell flex min-h-[70vh] items-center justify-center py-14"><div className="w-full max-w-2xl rounded-[2.5rem] bg-white p-8 text-center food-shadow md:p-12"><span className="bg-sage mx-auto flex size-20 items-center justify-center rounded-full text-white"><Check size={34} /></span><p className="text-friday mt-8 text-xs font-bold uppercase tracking-[.22em]">Order confirmed</p><h1 className="font-display mt-3 text-4xl font-semibold">Dinner is on its way.</h1><p className="mx-auto mt-4 max-w-md leading-7 text-stone-500">Thanks, {order.customerName}. The kitchen has received your order and will start preparing it shortly.</p><div className="mt-8 grid gap-3 rounded-3xl bg-stone-50 p-5 text-left sm:grid-cols-2"><div><p className="text-xs text-stone-400">Order number</p><p className="mt-1 font-bold">{order.orderNumber}</p></div><div><p className="text-xs text-stone-400">Estimated delivery</p><p className="mt-1 font-bold">35–45 minutes</p></div><div><p className="text-xs text-stone-400">Total</p><p className="mt-1 font-bold">{money(order.total)}</p></div><div><p className="text-xs text-stone-400">Payment</p><p className="mt-1 font-bold capitalize">{order.paymentMethod.replace('-', ' ')}</p></div></div><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/order-tracking" className={buttonClass}>Track order <Truck size={17} /></Link><Link href="/menu" className="rounded-full border border-stone-200 px-6 py-3.5 text-sm font-bold">Back to menu</Link></div></div></main>
}

function Tracking({ order }: { order: Order | null }) {
  const [number, setNumber] = useState(order?.orderNumber || '')
  const [active, setActive] = useState(Boolean(order))
  const steps = ['Order confirmed', 'Preparing your food', 'On the way', 'Delivered']
  return <main className="shell py-14"><div className="mx-auto max-w-3xl"><SectionTitle eyebrow="Order updates" title="Track your Friday." text="Enter your order number to see the latest kitchen and delivery status." /><form onSubmit={(e) => { e.preventDefault(); setActive(Boolean(number.trim())) }} className="flex gap-3 rounded-3xl bg-white p-3 soft-ring"><input value={number} onChange={(e) => setNumber(e.target.value)} className={`${inputClass} border-0 bg-stone-50`} placeholder="e.g. FR-1234567" required /><button className={buttonClass}>Track</button></form>{active && <div className="mt-8 rounded-[2rem] bg-white p-8 food-shadow"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-6"><div><p className="text-xs text-stone-400">Tracking order</p><p className="mt-1 font-bold">{number}</p></div><span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-friday">Preparing</span></div><div className="mt-8 space-y-0">{steps.map((step, i) => <div key={step} className="flex gap-4"><div className="flex flex-col items-center"><span className={`flex size-10 items-center justify-center rounded-full ${i < 2 ? 'bg-friday text-white' : 'bg-stone-100 text-stone-400'}`}>{i < 2 ? <Check size={17} /> : i + 1}</span>{i < steps.length - 1 && <span className={`h-14 w-0.5 ${i < 1 ? 'bg-friday' : 'bg-stone-100'}`} />}</div><div className="pt-2"><p className={`font-bold ${i < 2 ? 'text-charcoal' : 'text-stone-400'}`}>{step}</p>{i === 1 && <p className="mt-1 text-sm text-stone-500">Your meal is being prepared fresh.</p>}</div></div>)}</div></div>}</div></main>
}

function AuthPage({ mode, loggedIn }: { mode: 'login' | 'register' | 'forgot'; loggedIn: (user: User, token: string) => void }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(''); setMessage('')
    const data = Object.fromEntries(new FormData(event.currentTarget))
    try {
      if (mode === 'forgot') { await api.post('/users/forgot-password', { email: data.email }); setMessage('If an account exists for that email, password reset instructions are on the way.') }
      else if (mode === 'register') { await api.post('/users', { name: data.name, email: data.email, password: data.password }); const res = await api.post('/users/login', { email: data.email, password: data.password }); loggedIn(res.data.user, res.data.token); router.push('/profile') }
      else { const res = await api.post('/users/login', { email: data.email, password: data.password }); loggedIn(res.data.user, res.data.token); router.push('/profile') }
    } catch (err) { setError(axios.isAxiosError(err) ? (err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Please check your details and try again.') : 'Something went wrong.') }
    finally { setLoading(false) }
  }
  const content = mode === 'login' ? ['Welcome back.', 'Log in to reorder favourites and track every delivery.'] : mode === 'register' ? ['Your Friday starts here.', 'Create an account for faster checkout and easy order history.'] : ['Reset your password.', 'We’ll send recovery instructions to your email address.']
  return <main className="shell grid min-h-[72vh] items-center gap-10 py-14 lg:grid-cols-2"><div className="hidden overflow-hidden rounded-[2.5rem] lg:block"><img src="/api/media/file/kigali-bowl-original.jpg" alt="A fresh Friday Restaurant meal" className="h-[620px] w-full object-cover" /></div><div className="mx-auto w-full max-w-md"><p className="text-friday text-xs font-bold uppercase tracking-[.22em]">{mode === 'login' ? 'Customer login' : mode === 'register' ? 'Join Friday' : 'Account recovery'}</p><h1 className="font-display mt-3 text-5xl font-semibold">{content[0]}</h1><p className="mt-4 leading-7 text-stone-500">{content[1]}</p><form onSubmit={submit} className="mt-8 space-y-4">{mode === 'register' && <Field name="name" label="Full name" required />}<Field name="email" type="email" label="Email address" required />{mode !== 'forgot' && <Field name="password" type="password" label="Password" minLength={8} required />}{error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}{message && <p className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700">{message}</p>}<button disabled={loading} className={`${buttonClass} w-full`}>{loading ? 'Please wait…' : mode === 'login' ? 'Log in' : mode === 'register' ? 'Create account' : 'Send reset instructions'}</button></form>{mode === 'login' && <div className="mt-5 flex justify-between text-sm"><Link href="/forgot-password" className="font-semibold text-friday">Forgot password?</Link><Link href="/register" className="font-semibold">Create account</Link></div>}{mode === 'register' && <p className="mt-5 text-center text-sm text-stone-500">Already have an account? <Link href="/login" className="font-bold text-friday">Log in</Link></p>}{mode === 'forgot' && <Link href="/login" className="mt-5 block text-center text-sm font-bold text-friday">Back to login</Link>}</div></main>
}

function Profile({ user, token, logout, updateUser }: { user: User | null; token: string; logout: () => void; updateUser: (u: User) => void }) {
  const [message, setMessage] = useState('')
  if (!user) return <EmptyState title="Log in to see your profile." text="Your saved details and order history live here." href="/login" action="Log in" />
  const userId = user.id
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); try { const res = await api.patch(`/users/${userId}`, data, { headers: { Authorization: `JWT ${token}` } }); updateUser(res.data.doc); setMessage('Profile updated successfully.') } catch { setMessage('We could not update your profile.') } }
  return <main className="shell py-14"><div className="flex flex-wrap items-end justify-between gap-4"><SectionTitle eyebrow="Your account" title={`Hello, ${user.name.split(' ')[0]}.`} /><button type="button" onClick={logout} className="mb-10 rounded-full border border-stone-200 px-5 py-3 text-sm font-bold">Log out</button></div><div className="grid gap-8 lg:grid-cols-[260px_1fr]"><aside className="h-fit rounded-3xl bg-charcoal p-5 text-white"><Link href="/profile" className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold">Profile <ChevronRight size={16} /></Link><Link href="/order-history" className="mt-2 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-stone-300 hover:bg-white/10">Order history <ChevronRight size={16} /></Link></aside><form onSubmit={save} className="rounded-3xl bg-white p-7 soft-ring md:p-9"><h2 className="font-display text-2xl font-bold">Personal details</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field name="name" label="Full name" defaultValue={user.name} required /><Field name="email" type="email" label="Email" defaultValue={user.email} disabled /><Field name="phone" label="Phone" defaultValue={user.phone} /><Field name="defaultAddress" label="Default delivery address" defaultValue={user.defaultAddress} /></div>{message && <p className="mt-5 text-sm font-semibold text-sage">{message}</p>}<button className={`${buttonClass} mt-7`}>Save changes</button></form></div></main>
}

function OrderHistory({ user, token }: { user: User | null; token: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { if (!user) { setLoading(false); return } api.get('/orders?sort=-createdAt&depth=0', { headers: { Authorization: `JWT ${token}` } }).then((r) => setOrders(r.data.docs)).finally(() => setLoading(false)) }, [user, token])
  if (!user) return <EmptyState title="Log in to see previous orders." text="Your Friday favourites are even easier to reorder." href="/login" action="Log in" />
  return <main className="shell py-14"><SectionTitle eyebrow="Your account" title="Order history." />{loading ? <p>Loading orders…</p> : orders.length ? <div className="space-y-4">{orders.map((order) => <Link key={order.id} href={`/order-details/${order.id}`} className="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-white p-6 soft-ring"><div><p className="font-display text-xl font-bold">{order.orderNumber}</p><p className="mt-1 text-sm text-stone-500">{order.items?.length || 0} items · {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}</p></div><div className="text-right"><span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold capitalize text-green-700">{order.status}</span><p className="mt-2 font-bold">{money(order.total)}</p></div></Link>)}</div> : <EmptyState title="No orders yet." text="Once you order, everything will appear here." href="/menu" action="Browse menu" compact />}</main>
}

function Contact() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); try { await api.post('/contact-messages', Object.fromEntries(new FormData(event.currentTarget))); setSent(true); event.currentTarget.reset() } catch { setError('We could not send your message. Please try again.') } }
  return <main className="shell py-14"><SectionTitle eyebrow="Talk to us" title="We’d love to hear from you." text="Questions, feedback or a special request? Send us a note and our Kigali team will get back to you." /><div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr]"><div className="rounded-[2rem] bg-charcoal p-8 text-white"><h2 className="font-display text-2xl font-bold">Friday Restaurant</h2><div className="mt-8 space-y-6 text-sm text-stone-300"><p className="flex gap-3"><MapPin className="text-friday" /> KG 7 Ave, Kimihurura<br />Kigali, Rwanda</p><p className="flex gap-3"><Phone className="text-friday" /> +250 788 123 456</p><p className="flex gap-3"><Mail className="text-friday" /> hello@friday.rw</p><p className="flex gap-3"><Clock3 className="text-friday" /> Daily, 10:00–22:30</p></div></div><form onSubmit={submit} className="rounded-[2rem] bg-white p-7 soft-ring md:p-9"><div className="grid gap-5 sm:grid-cols-2"><Field name="name" label="Your name" required /><Field name="email" type="email" label="Email address" required /><div className="sm:col-span-2"><Field name="subject" label="Subject" required /></div><label className="block text-sm font-semibold sm:col-span-2">Message<textarea name="message" className={`${inputClass} mt-2 min-h-36 resize-none`} required /></label></div>{sent && <p className="mt-5 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">Thanks! Your message has been sent.</p>}{error && <p className="mt-5 text-sm font-bold text-red-600">{error}</p>}<button className={`${buttonClass} mt-6`}>Send message <ArrowRight size={17} /></button></form></div></main>
}

const faq = [
  ['Where do you deliver?', 'We deliver throughout central Kigali, including Kimihurura, Kacyiru, Remera, Nyarutarama, Kigali Heights and nearby neighbourhoods.'],
  ['How long does delivery take?', 'Most orders arrive in 25–45 minutes. Larger orders and peak Friday evenings may take a little longer.'],
  ['Can I change my order after placing it?', 'Call us as soon as possible. If the kitchen has not started your order, we will do our best to update it.'],
  ['What payment methods do you accept?', 'We accept MTN MoMo, Airtel Money, cash on delivery and card on delivery.'],
  ['Do you cater for allergies?', 'Please add allergy information in the delivery notes. Our team will contact you if we cannot safely accommodate the request.'],
]
function FAQ() { const [open, setOpen] = useState(0); return <main className="shell max-w-4xl py-14"><SectionTitle eyebrow="Good to know" title="Frequently asked questions." /> <div className="space-y-3">{faq.map(([q, a], i) => <div key={q} className="overflow-hidden rounded-2xl bg-white soft-ring"><button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between p-5 text-left font-bold">{q}<ChevronDown size={18} className={`transition ${open === i ? 'rotate-180' : ''}`} /></button>{open === i && <p className="px-5 pb-5 leading-7 text-stone-500">{a}</p>}</div>)}</div></main> }

function Legal({ type }: { type: 'privacy' | 'terms' }) {
  const privacy = [['Information we collect', 'We collect the details you provide when ordering or creating an account, including your name, contact details, delivery address and order history.'], ['How we use it', 'We use your information to prepare and deliver orders, provide customer support, improve our menu and keep your account secure.'], ['Your choices', 'You can update your account details at any time. Contact us to request access to or deletion of your personal information.']]
  const terms = [['Ordering', 'Orders are confirmed once accepted by our kitchen. Availability and preparation times may vary during busy periods.'], ['Delivery and payment', 'Please provide an accurate Kigali delivery address and reachable phone number. Payment is due using the method chosen at checkout.'], ['Cancellations and refunds', 'Contact us immediately if there is an issue. Refunds are assessed fairly based on order status and product quality.']]
  const items = type === 'privacy' ? privacy : terms
  return <main className="shell max-w-4xl py-14"><SectionTitle eyebrow="Friday Restaurant" title={type === 'privacy' ? 'Privacy policy.' : 'Terms of service.'} text={`Last updated ${new Date().toLocaleDateString('en-RW', { month: 'long', year: 'numeric' })}`} /><div className="rounded-[2rem] bg-white p-8 soft-ring md:p-12"><p className="leading-8 text-stone-600">{type === 'privacy' ? 'We respect your privacy and only collect what we need to serve you well.' : 'These terms help keep ordering from Friday clear, fair and delicious.'}</p>{items.map(([title, text], i) => <section key={title} className="mt-9"><h2 className="font-display text-2xl font-bold">{i + 1}. {title}</h2><p className="mt-3 leading-8 text-stone-600">{text}</p></section>)}</div></main>
}

function EmptyState({ title, text, href, action, compact = false }: { title: string; text: string; href: string; action: string; compact?: boolean }) {
  return <main className={`shell flex flex-col items-center justify-center text-center ${compact ? 'py-16' : 'min-h-[65vh] py-20'}`}><span className="flex size-20 items-center justify-center rounded-full bg-orange-50 text-friday"><ShoppingBag size={30} /></span><h1 className="font-display mt-6 text-4xl font-semibold">{title}</h1><p className="mt-3 max-w-md leading-7 text-stone-500">{text}</p><Link href={href} className={`${buttonClass} mt-7`}>{action} <ArrowRight size={17} /></Link></main>
}

export default function RestaurantApp({ route }: { route?: string }) {
  const [foods, setFoods] = useState<Food[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState('')
  const [lastOrder, setLastOrder] = useState<Order | null>(null)
  const [ready, setReady] = useState(false)
  const pathname = route || '/'

  useEffect(() => {
    Promise.all([api.get('/foods?limit=100&depth=1&sort=name'), api.get('/categories?limit=100&depth=1&sort=name')]).then(([f, c]) => { setFoods(f.data.docs); setCategories(c.data.docs) }).finally(() => setReady(true))
    try { setCart(JSON.parse(localStorage.getItem('friday-cart') || '[]')); setUser(JSON.parse(localStorage.getItem('friday-user') || 'null')); setToken(localStorage.getItem('friday-token') || ''); setLastOrder(JSON.parse(localStorage.getItem('friday-order') || 'null')) } catch { /* Ignore invalid local data. */ }
  }, [])
  useEffect(() => { if (ready) localStorage.setItem('friday-cart', JSON.stringify(cart)) }, [cart, ready])

  function add(food: Food, quantity = 1) { setCart((items) => { const existing = items.find((i) => i.food.id === food.id); return existing ? items.map((i) => i.food.id === food.id ? { ...i, quantity: i.quantity + quantity } : i) : [...items, { food, quantity }] }) }
  function update(id: string, quantity: number) { quantity < 1 ? remove(id) : setCart((items) => items.map((i) => i.food.id === id ? { ...i, quantity } : i)) }
  function remove(id: string) { setCart((items) => items.filter((i) => i.food.id !== id)) }
  function loggedIn(nextUser: User, nextToken: string) { setUser(nextUser); setToken(nextToken); localStorage.setItem('friday-user', JSON.stringify(nextUser)); localStorage.setItem('friday-token', nextToken) }
  function logout() { setUser(null); setToken(''); localStorage.removeItem('friday-user'); localStorage.removeItem('friday-token') }
  function completed(order: Order) { setLastOrder(order); setCart([]); localStorage.setItem('friday-order', JSON.stringify(order)); localStorage.setItem('friday-cart', '[]') }
  function updateUser(next: User) { setUser(next); localStorage.setItem('friday-user', JSON.stringify(next)) }

  const content = useMemo(() => {
    if (!ready && ['/','/menu','/categories','/search'].includes(pathname)) return <div className="shell grid min-h-[70vh] place-items-center"><div className="text-center"><span className="mx-auto block size-10 animate-spin rounded-full border-4 border-orange-100 border-t-friday" /><p className="mt-4 text-sm font-semibold text-stone-500">Warming up the kitchen…</p></div></div>
    if (pathname === '/') return <Home foods={foods} categories={categories} add={add} />
    if (pathname === '/menu') return <MenuPage foods={foods} categories={categories} add={add} initialSearch={undefined} />
    if (pathname === '/search') return <MenuPage foods={foods} categories={categories} add={add} initialSearch="" />
    if (pathname === '/categories') return <CategoriesPage categories={categories} />
    if (pathname.startsWith('/food/')) return <FoodDetails food={foods.find((f) => f.slug === pathname.split('/')[2])} add={add} />
    if (pathname === '/cart') return <CartPage cart={cart} update={update} remove={remove} />
    if (pathname === '/checkout') return <Checkout cart={cart} user={user} completed={completed} />
    if (pathname === '/order-confirmation') return <Confirmation order={lastOrder} />
    if (pathname === '/order-tracking') return <Tracking order={lastOrder} />
    if (pathname === '/register') return <AuthPage mode="register" loggedIn={loggedIn} />
    if (pathname === '/login') return <AuthPage mode="login" loggedIn={loggedIn} />
    if (pathname === '/forgot-password') return <AuthPage mode="forgot" loggedIn={loggedIn} />
    if (pathname === '/profile') return <Profile user={user} token={token} logout={logout} updateUser={updateUser} />
    if (pathname === '/order-history') return <OrderHistory user={user} token={token} />
    if (pathname.startsWith('/order-details/')) return lastOrder ? <Confirmation order={lastOrder} /> : <OrderHistory user={user} token={token} />
    if (pathname === '/contact') return <Contact />
    if (pathname === '/faq') return <FAQ />
    if (pathname === '/privacy-policy') return <Legal type="privacy" />
    if (pathname === '/terms') return <Legal type="terms" />
    return <EmptyState title="This page got away." text="Let’s get you back to something delicious." href="/menu" action="Explore the menu" />
  }, [ready, pathname, foods, categories, cart, user, token, lastOrder])

  return <><Header count={cart.reduce((sum, i) => sum + i.quantity, 0)} user={user} />{content}<Footer /></>
}
