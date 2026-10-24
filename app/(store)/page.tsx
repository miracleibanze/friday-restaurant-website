"use client";

import {
  buttonClass,
  FoodCard,
  SectionTitle,
  useAddFood,
} from "@/components/storefront-ui";
import { menuFoods } from "@/lib/menu-data";
import { ArrowRight, Clock3, Phone, Star } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const add = useAddFood();
  return (
    <>
      <section className="relative overflow-hidden bg-gradient pb-8 scroll-mt-16">
        <div className="shell grid lg:min-h-[600px] min-h-[500px] items-center gap-12 pb-14 pt-2 lg:pt-0 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative z-10 max-lg:flex flex-col items-center text-center">
            <p className="text-friday mb-5 text-xs font-bold uppercase tracking-[.24em]">
              Kigali’s feel-good kitchen and fish
            </p>
            <h1 className="text-balance lg:text-6xl text-5xl font-bold leading-[.96] tracking-tight text-charcoal">
              Order now.
              <br />
              <em className="text-friday font-semibold">Enjoy the meal.</em>
            </h1>
            <p className="mt-7 max-w-lg lg:text-lg text-md leading-8 text-stone-600">
              Freshly grilled favourites and joyful sharing plates of full fish
              and chicken, made to order and delivered across Kigali.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/#products" className={buttonClass}>
                Order now <ArrowRight size={17} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border border-stone-300 px-6 py-3.5 text-sm font-bold transition hover:bg-white gap-3"
              >
                Contact Us <Phone fill="black" size={17} />
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-stone-600">
              <span className="flex items-center gap-2">
                <Clock3 size={18} className="text-friday" /> 25–40 min
              </span>
              <span className="flex items-center gap-2">
                <Star size={18} className="fill-friday text-friday" /> 4.9
                Kigali rating
              </span>
            </div>
          </div>
          <div className="hidden lg:block relative mx-auto w-full max-w-md">
            <div className="absolute -inset-12 rounded-full bg-orange-200/50 blur-3xl" />
            <div className="relative aspect-square overflow-hidden rounded-[45%_55%_50%_45%] border-[12px] border-white shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=85"
                alt="Friday Restaurant signature food spread"
                className="size-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -left-3 rounded-2xl bg-white p-4 shadow-lg">
              <p className="text-xs text-stone-500">Today’s favourite</p>
              <p className="mt-1 font-bold">Friday Family Feast</p>
            </div>
          </div>
        </div>
      </section>
      <section
        id="products"
        className="bg-[#fcfcfc] py-20 rounded-t-[2.5rem] -translate-y-8 border border-white scroll-mt-10"
      >
        <div className="shell">
          <SectionTitle
            eyebrow="Choose your mood"
            title="Choose Your Plate."
            text="Made fresh when you order, with generous portions and ingredients we’re proud of."
          />
          <div className="flex flex-wrap gap-5 flex-column lg:flex-row max-lg:items-center">
            {menuFoods.map((food) => (
              <FoodCard key={food.id} food={food} add={add} />
            ))}
          </div>
        </div>
      </section>
      <section
        id="about"
        className="shell overflow-hidden rounded-[2.5rem] bg-sage text-white scroll-mt-24"
      >
        <div className="grid lg:grid-cols-2">
          <img
            src="https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1000&q=85"
            alt="Friday Restaurant grilled signature dishes"
            className="h-full min-h-96 w-full object-cover"
          />
          <div className="flex flex-col justify-center p-10 md:p-16">
            <p className="mb-4 text-xs font-bold uppercase tracking-[.22em] text-orange-200">
              Our kitchen
            </p>
            <h2 className="font-display text-4xl font-semibold md:text-5xl">
              Made with Kigali energy.
            </h2>
            <p className="mt-6 leading-8 text-white/75">
              Friday is your neighbourhood table: familiar flavours, playful
              twists and a warm welcome every day of the week. We source locally
              and cook everything with care.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 font-bold"
            >
              Come say hello <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
