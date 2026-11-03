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
  longDescription?: string;
  price: number;
  available: boolean;
  prepTime?: number;
  rating?: number;
  calories?: number;
  image: string;
  category?: Category;
};
