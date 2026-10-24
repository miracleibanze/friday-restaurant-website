import FoodDetailsPage from "@/components/FoodDetails"; 
import { menuFoods } from "@/lib/menu-data"; 

// 1. Emeza neza ko generateStaticParams isohora ibintu mu buryo bugaragara
export function generateStaticParams() { 
  return menuFoods.map(({ slug }) => ({ slug })); 
} 

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 2. Koresha uburyo busanzwe bwo gutegereza (await) params
export default async function Page({ params }: PageProps) { 
  const { slug } = await params; 
  
  return <FoodDetailsPage slug={slug} />; 
}
