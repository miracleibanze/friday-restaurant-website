export type Media = { url?: string; alt?: string }
export type Category = {
  id: string
  name: string
  slug: string
  description?: string
  image?: Media
}
export type Food = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  available: boolean
  featured: boolean
  prepTime?: number
  rating?: number
  calories?: number
  image?: Media
  category?: Category
}

const categories: Category[] = [
  {
    id: "grill",
    name: "From the grill",
    slug: "grill",
    description: "Smoky, flame-grilled favourites.",
    image: {
      url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=85",
      alt: "Freshly grilled chicken",
    },
  },
  {
    id: "burgers",
    name: "Burgers",
    slug: "burgers",
    description: "Stacked high and made to order.",
    image: {
      url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
      alt: "Friday-style cheeseburger",
    },
  },
  {
    id: "pizza",
    name: "Pizza",
    slug: "pizza",
    description: "Hot from the oven, perfect for sharing.",
    image: {
      url: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85",
      alt: "Freshly baked pizza",
    },
  },
  {
    id: "local",
    name: "Local comfort",
    slug: "local",
    description: "Comforting dishes with Kigali flavour.",
    image: {
      url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85",
      alt: "A colourful bowl of local comfort food",
    },
  },
  {
    id: "sharing",
    name: "Made for sharing",
    slug: "sharing",
    description: "Bring everyone to the table.",
    image: {
      url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",
      alt: "A generous platter to share",
    },
  },
]

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
}

const meals: Array<{
  name: string
  slug: string
  description: string
  price: number
  category: string
  image: string
  featured?: boolean
  prepTime?: number
  calories?: number
}> = [
  {
    name: "Fire-Grilled Chicken",
    slug: "fire-grilled-chicken",
    description: "Marinated half chicken, flame grilled and served with golden fries and house slaw.",
    price: 12500,
    category: "grill",
    image: photos.chicken,
    featured: true,
    calories: 680,
  },
  {
    name: "Kigali BBQ Chicken",
    slug: "kigali-bbq-chicken",
    description: "Slow-grilled chicken brushed with our sweet and smoky Kigali barbecue glaze.",
    price: 14000,
    category: "grill",
    image: photos.bbq,
    featured: true,
    calories: 720,
  },
  {
    name: "The Friday Burger",
    slug: "the-friday-burger",
    description: "A juicy beef patty, cheddar, tomato, crisp lettuce and Friday sauce in a toasted bun.",
    price: 9500,
    category: "burgers",
    image: photos.burger,
    featured: true,
    calories: 790,
  },
  {
    name: "Crispy Chicken Burger",
    slug: "crispy-chicken-burger",
    description: "Crunchy chicken, creamy slaw and a little pili-pili heat, with fries on the side.",
    price: 8500,
    category: "burgers",
    image: photos.crispy,
    featured: true,
    calories: 740,
  },
  {
    name: "Garden Fire Pizza",
    slug: "garden-fire-pizza",
    description: "A crisp stone-baked base topped with roasted vegetables, herbs and mozzarella.",
    price: 12000,
    category: "pizza",
    image: photos.pizza,
    featured: true,
    prepTime: 30,
    calories: 860,
  },
  {
    name: "Chicken Pili-Pili Pizza",
    slug: "chicken-pili-pili-pizza",
    description: "Grilled chicken, mozzarella and a lively pili-pili drizzle on a fresh-baked crust.",
    price: 14500,
    category: "pizza",
    image: photos.pizza,
    featured: true,
    prepTime: 30,
    calories: 920,
  },
  {
    name: "Isombe Comfort Bowl",
    slug: "isombe-comfort-bowl",
    description: "A hearty Rwandan cassava-leaf stew with rice, beans and a side of avocado.",
    price: 7500,
    category: "local",
    image: photos.bowl,
    calories: 590,
  },
  {
    name: "Brochette Plate",
    slug: "brochette-plate",
    description: "Tender grilled beef brochettes served with roasted potatoes and fresh tomato salad.",
    price: 11000,
    category: "local",
    image: photos.brochette,
    featured: true,
    calories: 640,
  },
  {
    name: "Friday Friends Platter",
    slug: "friday-friends-platter",
    description: "A generous mix of grilled chicken, brochettes, fries and dips for the whole table.",
    price: 28000,
    category: "sharing",
    image: photos.feast,
    featured: true,
    prepTime: 35,
  },
  {
    name: "Kigali Family Feast",
    slug: "kigali-family-feast",
    description: "Our signature family spread with grilled chicken, sides, salad and house sauces.",
    price: 42000,
    category: "sharing",
    image: photos.feast,
    featured: true,
    prepTime: 40,
  },
]

export const menuCategories = categories
export const menuFoods: Food[] = meals.map((meal, index) => {
  const category = categories.find((item) => item.slug === meal.category)!
  return {
    id: meal.slug,
    name: meal.name,
    slug: meal.slug,
    description: meal.description,
    price: meal.price,
    available: true,
    featured: meal.featured ?? false,
    prepTime: meal.prepTime ?? 25,
    rating: 4.7 + (index % 3) / 10,
    calories: meal.calories,
    image: { url: meal.image, alt: meal.name },
    category,
  }
})
