"use client";

import {
  BackdropImage,
  buttonClass,
  FoodCard,
  SectionTitle,
  useAddFood,
} from "@/components/storefront-ui";
import { FoodGridSkeleton } from "@/components/loading-skeletons";
import { ArrowRight, Clock3, Phone, Star, WavesVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Food } from "@/lib/menu-data";

export default function HomePage() {
  const add = useAddFood();
  const [foods, setFoods] = useState<Food[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [menuSlow, setMenuSlow] = useState(false);
  const [menuAttempt, setMenuAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setMenuLoading(true);
    setMenuError("");
    setMenuSlow(false);
    const slowTimer = window.setTimeout(() => setMenuSlow(true), 8000);
    fetch("/api/menu", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load menu.");
        if (!Array.isArray(result.items)) {
          throw new Error("The menu response is invalid.");
        }
        if (active) setFoods(result.items);
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return;
        console.error("Could not refresh storefront menu.", error);
        setMenuError("Could not load the menu. Please try again later.");
      })
      .finally(() => {
        window.clearTimeout(slowTimer);
        if (active) setMenuLoading(false);
      });
    return () => {
      active = false;
      window.clearTimeout(slowTimer);
      controller.abort();
    };
  }, [menuAttempt]);
  return (
    <>
      <section className="relative overflow-hidden bg-opacity-gradient md:bg-gradient pb-8">
        <div className="shell grid md:min-h-[600px] min-h-[500px] items-center gap-12 pb-14 pt-2 md:pt-0 md:grid-cols-[.9fr_1.1fr]">
          <div className="relative z-10 max-md:flex flex-col items-center max-md:text-center md:pl-10">
            <p className="text-friday mb-5 text-xs font-bold uppercase tracking-[.24em]">
              Kigali’s feel-good kitchen and fish
            </p>
            <h1 className="font-display text-balance md:text-6xl text-5xl leading-[.96] tracking-tight text-charcoal">
              Order now.
              <br />
              <em className="text-friday">Enjoy the meal.</em>
            </h1>
            <p className="mt-7 max-w-lg text-md leading-none text-stone-600 md:text-lg">
              From whole chicken and fish to chicken wings, juicy burgers, and
              more, enjoy delicious meals made for every craving and delivered
              across Kigali.
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
          <div className="hidden md:block relative mx-auto w-full max-w-md">
            <div className="absolute -inset-12 rounded-full bg-orange-200/50 blur-3xl" />
            <div className="relative aspect-square overflow-hidden rounded-[45%_55%_50%_45%] border-[12px] border-white shadow-xl">
              <img
                src="/friday-family-feast.jpg"
                alt="Friday Restaurant signature food spread"
                className="size-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -left-3 rounded-2xl bg-white p-4 shadow-lg">
              <p className="text-xs text-stone-500">Make it your own</p>
              <p className="mt-1 font-bold">Add More to Your Plate</p>
            </div>
            <WavesVertical className="absolute top-0 text-white right-20 size-24" />
          </div>
        </div>
        <BackdropImage />
      </section>
      <section
        id="products"
        className="bg-[#fcfcfc] py-20 rounded-t-[2.5rem] -translate-y-8 border border-white"
      >
        <div className="shell">
          <SectionTitle
            eyebrow="Choose your mood"
            title="Choose Your Plate."
            text="Made fresh when you order, with generous portions and ingredients we’re proud of."
          />
          <div className="flex flex-wrap gap-5 flex-column lg:flex-row max-lg:items-center">
            {menuLoading ? (
              <div className="w-full">
                {menuSlow && (
                  <p role="status" className="mb-5 text-center text-sm text-stone-600">
                    This is taking longer than usual. Check your connection or{" "}
                    <button
                      type="button"
                      onClick={() => setMenuAttempt((attempt) => attempt + 1)}
                      className="font-bold text-friday underline underline-offset-4"
                    >
                      try again
                    </button>
                    .
                  </p>
                )}
                <FoodGridSkeleton count={6} />
              </div>
            ) : menuError ? (
              <div className="w-full py-10 text-center">
                <p role="alert" className="text-red-700">{menuError}</p>
                <button
                  type="button"
                  onClick={() => setMenuAttempt((attempt) => attempt + 1)}
                  className={`${buttonClass} mt-5`}
                >
                  Try again
                </button>
              </div>
            ) : foods.length > 0 ? (
              foods.map((food) => (
                <FoodCard key={food.id} food={food} add={add} />
              ))
            ) : (
              <p className="w-full py-10 text-center text-stone-500">
                No menu items are currently available.
              </p>
            )}
          </div>
        </div>
      </section>
      <section
        id="about"
        className="shell overflow-hidden rounded-[2.5rem] bg-sage text-white"
      >
        <div className="grid lg:grid-cols-2">
          <img
            src="/Chef-Cooking.jpg"
            alt="Friday Restaurant grilled signature dishes"
            className="h-full min-h-96 w-full object-cover"
          />
          <div className="flex flex-col justify-center p-10 md:p-16">
            <p className="mb-4 text-xs font-bold uppercase tracking-[.22em] text-orange-200">
              Our kitchen
            </p>
            <h2 className="font-display text-4xl md:text-5xl">
              Made with Kigali energy.
            </h2>
            <p className="mt-6 leading-8 text-white/75">
              Friday is your neighbourhood table: familiar flavours, playful
              twists and a warm welcome every day of the week. We source locally
              and cook everything with care.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 font-bold bg-friday px-6 py-3.5 text-sm transition hover:bg-friday/90 rounded-full w-full sm:max-w-max"
            >
              Come say hello <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
