import { connectToDatabase } from "@/lib/db";
import { MenuItem } from "@/lib/models/menu-item";

export async function ensureMenuDatabaseConnected() {
  await connectToDatabase();
}

export async function getMenuItems() {
  await ensureMenuDatabaseConnected();
  return MenuItem.find().sort({ createdAt: 1 }).lean();
}

export function serializeMenuItem(item: {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
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
    longDescription: item.longDescription ?? "",
    price: item.price,
    available: item.available,
    prepTime: item.prepTime,
    image: item.image ?? "",
    rating: item.rating,
    calories: item.calories,
  };
}
