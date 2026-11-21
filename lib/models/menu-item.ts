import { model, models, Schema, type Model, type HydratedDocument } from "mongoose";

export interface MenuItemFields {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  available: boolean;
  prepTime: number;
  image: string;
  rating: number;
  calories?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type MenuItemDocument = HydratedDocument<MenuItemFields>;

const menuItemSchema = new Schema<MenuItemFields>(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    longDescription: { type: String, trim: true, maxlength: 5000 },
    price: { type: Number, required: true, min: 0 },
    available: { type: Boolean, default: true },
    prepTime: { type: Number, required: true, min: 1, max: 240, default: 25 },
    image: { type: String, trim: true, maxlength: 7_000_000, default: "" },
    rating: { type: Number, min: 0, max: 5, default: 4.7 },
    calories: { type: Number, min: 0 },
  },
  { timestamps: true },
);

const cachedMenuItem = models.MenuItem as Model<MenuItemFields> | undefined;
if (cachedMenuItem && !cachedMenuItem.schema.path("longDescription")) {
  delete models.MenuItem;
}

export const MenuItem =
  (models.MenuItem as Model<MenuItemFields> | undefined) ??
  model<MenuItemFields>("MenuItem", menuItemSchema);
