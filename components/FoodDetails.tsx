"use client";

import {
  buttonClass,
  EmptyState,
  money,
  useAddFood,
} from "@/components/storefront-ui";
import { FoodDetailsSkeleton } from "@/components/loading-skeletons";
import { displayFoodName } from "@/lib/food-utils";
import { Check, Clock3, Minus, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useEffect } from "react";
import type { Food } from "@/lib/menu-data";
import {
  accompanimentTotal,
  accompanimentTypes,
  emptyAccompaniments,
  isFullChicken,
  type Accompaniments,
  type AccompanimentType,
} from "@/lib/accompaniments";

interface FoodDetailsProps {
  slug: string;
}

function AccompanimentSelector({
  value,
  onChange,
}: {
  value: Accompaniments;
  onChange: (value: Accompaniments) => void;
}) {
  const total = accompanimentTotal(value);
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-bold">Choose up to 4 accompaniments</legend>
      <p className="mb-2 text-base font-bold text-sage sm:text-lg">
        Bonus: 1 sambusa included
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {accompanimentTypes.map((type: AccompanimentType) => {
          const otherCount = total - value[type];
          const limit = Math.max(0, 4 - otherCount);

          return (
            <label key={type} className="text-xs font-semibold capitalize text-stone-600">
              {type}
              <select
                aria-label={`${type} accompaniment count`}
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-sm"
                value={value[type]}
                onChange={(event) =>
                  onChange({
                    ...value,
                    [type]: Math.min(Number(event.target.value), limit),
                  })
                }
              >
                {Array.from({ length: limit + 1 }, (_, count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-stone-500">{total} of 4 selected</p>
    </fieldset>
  );
}

export default function FoodDetailsPage({ slug }: FoodDetailsProps) {
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadSlow, setLoadSlow] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const add = useAddFood();
  const [quantity, setQuantity] = useState(1);
  const [accompaniments, setAccompaniments] =
    useState<Accompaniments>(emptyAccompaniments);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setLoadError("");
    setLoadSlow(false);
    const slowTimer = window.setTimeout(() => setLoadSlow(true), 8000);

    async function loadFood() {
      try {
        const response = await fetch("/api/menu", {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Could not load menu.");
        }
        if (!Array.isArray(result.items)) {
          throw new Error("The menu response is invalid.");
        }
        if (active) {
          setFood(
            result.items.find((item: Food) => item.slug === slug) ?? null,
          );
        }
      } catch (error: unknown) {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) {
          return;
        }
        console.error("Could not load menu item.", error);
        setLoadError("Could not load this menu item. Please try again.");
      } finally {
        window.clearTimeout(slowTimer);
        if (active) setLoading(false);
      }
    }

    void loadFood();
    return () => {
      active = false;
      window.clearTimeout(slowTimer);
      controller.abort();
    };
  }, [slug, loadAttempt]);
  if (loading)
    return (
      <>
        <FoodDetailsSkeleton />
        {loadSlow && (
          <p role="status" className="fixed bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-2xl bg-white px-5 py-3 text-center text-sm text-stone-600 soft-ring">
            This is taking longer than usual.{" "}
            <button
              type="button"
              onClick={() => setLoadAttempt((attempt) => attempt + 1)}
              className="font-bold text-friday underline underline-offset-4"
            >
              Try again
            </button>
            .
          </p>
        )}
      </>
    );
  if (loadError)
    return (
      <main className="shell grid min-h-[50vh] place-items-center py-12">
        <div className="text-center">
          <p role="alert" className="text-stone-600">{loadError}</p>
          <button
            type="button"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
            className={`${buttonClass} mt-5`}
          >
            Try again
          </button>
        </div>
      </main>
    );
  if (!food)
    return (
      <EmptyState
        title="Dish not found"
        text={`This dish may no longer be available. ${slug} `}
        href="/#products"
        action="Back to Home"
      />
    );
  const fullChicken = isFullChicken(food);

  return (
    <main className="shell py-12">
      <Link
        href="/#products"
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-stone-500"
      >
        ← Back to Home
      </Link>
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-white food-shadow">
          <img
            src={food.image}
            alt={displayFoodName(food.name)}
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-friday text-xs font-bold uppercase tracking-[.2em]">
            {food.category?.name}
          </span>
          <h1 className="font-display mt-4 text-5xl leading-tight md:text-6xl font-light!">
            {displayFoodName(food.name)}
          </h1>
          <div className="mt-5 flex gap-5 text-sm text-stone-500">
            <span className="flex items-center gap-1.5">
              <Star size={16} className="fill-amber-400 text-amber-400" />{" "}
              {food.rating}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 size={16} /> {food.prepTime} min
            </span>
            <span>{food.calories} kcal</span>
          </div>
          <section className="mt-7" aria-labelledby="food-description-title">
            <h2
              id="food-description-title"
              className="font-display text-2xl"
            >
              About this dish
            </h2>
            <p className="mt-3 text-lg leading-8 text-stone-600">
              {food.longDescription}
            </p>
          </section>
          {fullChicken && (
            <AccompanimentSelector
              value={accompaniments}
              onChange={setAccompaniments}
            />
          )}
          <div className="mt-8 border-y border-stone-200 py-7">
            <p className="font-display text-3xl">{money(food.price)}</p>
            <p className="mt-1 text-sm text-stone-500">
              Freshly prepared · Delivery available
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center rounded-full border border-stone-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex size-11 items-center justify-center rounded-full hover:bg-stone-100"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="flex size-11 items-center justify-center rounded-full hover:bg-stone-100"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                add(food, quantity, fullChicken ? accompaniments : undefined)
              }
              disabled={!food.available}
              className={`${buttonClass} flex-1`}
            >
              {food.available
                ? `Add to bag · ${money(food.price * quantity)}`
                : "Currently unavailable"}
            </button>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-sage">
            <Check size={17} /> {food.available ? "Available today" : "Unavailable today"}
          </p>
        </div>
      </div>
    </main>
  );
}
