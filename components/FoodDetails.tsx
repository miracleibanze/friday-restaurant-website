"use client";

import {
  buttonClass,
  EmptyState,
  imageUrl,
  money,
  useAddFood,
} from "@/components/storefront-ui";
import { menuFoods } from "@/lib/menu-data";
import { Check, Clock3, Minus, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface FoodDetailsProps {
  slug: string;
}

export default function FoodDetailsPage({ slug }: FoodDetailsProps) {
  // Gushaka ifunguro rishyanye na slug
  const food = menuFoods.find((item) => item.slug === slug);
  const add = useAddFood();
  const [quantity, setQuantity] = useState(1);
  if (!food)
    return (
      <EmptyState
        title="Dish not found"
        text={`This dish may no longer be available. ${slug} `}
        href="/#products"
        action="Back to Home"
      />
    );
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
          {imageUrl(food.image) && (
            <img
              src={imageUrl(food.image)}
              alt={food.image?.alt || food.name}
              className="size-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-friday text-xs font-bold uppercase tracking-[.2em]">
            {food.category?.name}
          </span>
          <h1 className="font-display mt-4 text-5xl font-semibold leading-tight md:text-6xl">
            {food.name}
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
          <p className="mt-7 text-lg leading-8 text-stone-600">
            {food.description}
          </p>
          <div className="mt-8 border-y border-stone-200 py-7">
            <p className="font-display text-3xl font-bold">
              {money(food.price)}
            </p>
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
              onClick={() => add(food, quantity)}
              className={`${buttonClass} flex-1`}
            >
              Add to bag · {money(food.price * quantity)}
            </button>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-sage">
            <Check size={17} /> Available today
          </p>
        </div>
      </div>
    </main>
  );
}
