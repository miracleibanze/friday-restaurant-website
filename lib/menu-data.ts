export type Media = { url?: string; alt?: string };
export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: Media;
};
export type Food = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  available: boolean;
  prepTime?: number;
  rating?: number;
  calories?: number;
  image: string;
  category?: Category;
};

const meals: Array<{
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  prepTime?: number;
  calories?: number;
}> = [
  {
    name: "Full Chicken",
    slug: "full-chicken",
    description: "A whole chicken served with 2 chips, 2 pilau, and 3 samosas.",
    price: 21000,
    image: "/Chicken.jpg",
    calories: 680,
  },
  {
    name: "Full Fish",
    slug: "full-fish",
    description: "A whole fish served with 2 chips.",
    price: 16000,
    image: "/Fish.jpg",
    calories: 720,
  },
  {
    name: "Half Chicken",
    slug: "half-chicken",
    description:
      "Half a chicken served with your choice of 2 chips or 2 pilau.",
    price: 13000,
    image: "/Half-Chicken.jpg",
  },
  {
    name: "Chicken Wings",
    slug: "chicken-wings",
    description: "Chicken wings served with 1 portion of chips.",
    price: 7000,
    image: "/Chicken-Wings.jpg",
  },
  {
    name: "Chicken Leg",
    slug: "chicken-leg",
    description: "A chicken leg served with 1 portion of chips.",
    price: 7000,
    image: "/Chicken-Legs.jpg",
  },
  {
    name: "Chicken Burger",
    slug: "chicken-burger",
    description: "A chicken burger served with 1 portion of chips.",
    price: 7000,
    image: "/Chicken-Burger.jpg",
  },
  {
    name: "Beef Burger",
    slug: "beef-burger",
    description: "A beef burger served with 1 portion of chips.",
    price: 7000,
    image: "/Beef-Burger.jpg",
  },
];

export const menuFoods: Food[] = meals.map((meal, index) => {
  return {
    id: meal.slug,
    name: meal.name,
    slug: meal.slug,
    description: meal.description,
    price: meal.price,
    available: true,
    prepTime: meal.prepTime ?? 25,
    rating: 4.7 + (index % 3) / 10,
    calories: meal.calories,
    image: meal.image,
  };
});
