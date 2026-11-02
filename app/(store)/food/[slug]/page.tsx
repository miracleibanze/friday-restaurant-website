import FoodDetailsPage from "@/components/FoodDetails"; 

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 2. Koresha uburyo busanzwe bwo gutegereza (await) params
export default async function Page({ params }: PageProps) { 
  const { slug } = await params; 
  
  return <FoodDetailsPage key={slug} slug={slug} />;
}
