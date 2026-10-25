import { connectToDatabase } from "@/lib/db";
import { menuFoods } from "@/lib/menu-data";
import { MenuItem } from "@/lib/models/menu-item";

export async function ensureMenuSeeded() {
  await connectToDatabase();
  if ((await MenuItem.estimatedDocumentCount()) === 0) {
    await MenuItem.insertMany(
      menuFoods.map((food) => ({
        ...food,
        prepTime: food.prepTime ?? 25,
        image: food.image,
      })),
      { ordered: false },
    );
  }
}

export async function getMenuItems() {
  await ensureMenuSeeded();
  return MenuItem.find().sort({ createdAt: 1 }).lean();
}

export function serializeMenuItem(item: {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  available: boolean;
  prepTime: number;
  image: string;
  rating?: number;
  calories?: number;
}) {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    price: item.price,
    available: item.available,
    prepTime: item.prepTime,
    image: item.image,
    rating: item.rating,
    calories: item.calories,
  };
}
