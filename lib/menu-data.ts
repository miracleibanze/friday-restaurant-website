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

const photos = {
  chicken:
    "https://images.unsplash.com/photo-1532634896-26909d0d4b58?auto=format&fit=crop&w=1000&q=85",
  bbq: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=1000&q=85",
  burger:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85",
  crispy:
    "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1000&q=85",
  pizza:
    "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1000&q=85",
  bowl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85",
  brochette:
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
  feast:
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=85",
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
    description: "A whole chicken, perfect for sharing with family or friends.",
    price: 12500,
    image: "/Chicken.jpg",
    calories: 680,
  },
  {
    name: "Full Fish",
    slug: "full-fish",
    description: "A whole fish prepared for a satisfying and delicious meal.",
    price: 14000,
    image: "/Fish.jpg",
    calories: 720,
  },
  {
    name: "Half Chicken",
    slug: "half-chicken",
    description: "Half a chicken, a satisfying meal for one or to share.",
    price: 7000,
    image: "/Half-Chicken.jpg",
  },
  {
    name: "Chicken Wings",
    slug: "chicken-wings",
    description: "Chicken wings prepared for a tasty and satisfying meal.",
    price: 5000,
    image: "/Chicken-Wings.jpg",
  },
  {
    name: "Chicken Leg",
    slug: "chicken-leg",
    description: "A chicken leg served as a simple and satisfying meal.",
    price: 3000,
    image: "/Chicken-Legs.jpg",
  },
  {
    name: "Chicken Burger",
    slug: "chicken-burger",
    description: "A burger filled with chicken, served in a soft bun.",
    price: 5000,
    image: "/Chicken-Burger.jpg",
  },
  {
    name: "Beef Burger",
    slug: "beef-burger",
    description: "A beef burger served in a soft bun for a filling meal.",
    price: 6000,
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
