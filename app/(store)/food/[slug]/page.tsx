import { FoodDetailsPage } from "@/components/storefront-pages";
import { menuFoods } from "@/lib/menu-data";

export function generateStaticParams() {
  return menuFoods.map(({ slug }) => ({ slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FoodDetailsPage slug={slug} />;
}
