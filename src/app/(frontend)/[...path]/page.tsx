import RestaurantApp from '@/components/restaurant-app'
import { notFound } from 'next/navigation'

const routes = [
  'menu',
  'categories',
  'search',
  'cart',
  'checkout',
  'order-confirmation',
  'order-tracking',
  'register',
  'login',
  'forgot-password',
  'profile',
  'order-history',
  'contact',
  'faq',
  'privacy-policy',
  'terms',
]

const foods = [
  'fire-grilled-chicken',
  'kigali-bbq-chicken',
  'the-friday-burger',
  'crispy-chicken-burger',
  'garden-fire-pizza',
  'chicken-pili-pili-pizza',
  'isombe-comfort-bowl',
  'brochette-plate',
  'friday-friends-platter',
  'kigali-family-feast',
]

export function generateStaticParams() {
  return [
    ...routes.map((route) => ({ path: [route] })),
    ...foods.map((slug) => ({ path: ['food', slug] })),
    { path: ['order-details', 'latest'] },
  ]
}

export default async function RoutedPage({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const joined = path.join('/')
  const isFood = path.length === 2 && path[0] === 'food' && foods.includes(path[1])
  const isOrder = path.length === 2 && path[0] === 'order-details'
  if (!routes.includes(joined) && !isFood && !isOrder) notFound()
  return <RestaurantApp route={`/${path.join('/')}`} />
}
