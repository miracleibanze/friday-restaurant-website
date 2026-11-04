function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton-shimmer rounded-xl ${className}`} />;
}

export function AdminRowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading records" className="divide-y divide-stone-100">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} aria-hidden="true" className="flex items-center justify-between gap-4 py-4">
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-5 w-2/5" />
            <SkeletonBlock className="h-4 w-3/5" />
          </div>
          <SkeletonBlock className="h-9 w-24 rounded-full" />
        </div>
      ))}
      <span className="sr-only">Loading records…</span>
    </div>
  );
}

export function RoutePageSkeleton() {
  return (
    <main className="shell min-h-[65vh] py-14" role="status" aria-label="Loading page">
      <SkeletonBlock className="mb-3 h-3 w-24" />
      <SkeletonBlock className="mb-10 h-10 w-64" />
      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonBlock className="h-64 rounded-3xl" />
        <div className="space-y-4">
          <SkeletonBlock className="h-16 rounded-2xl" />
          <SkeletonBlock className="h-16 rounded-2xl" />
          <SkeletonBlock className="h-16 rounded-2xl" />
          <SkeletonBlock className="h-12 w-48 rounded-full" />
        </div>
      </div>
      <span className="sr-only">Loading page…</span>
    </main>
  );
}

export function TrackingResultSkeleton() {
  return (
    <div role="status" aria-label="Looking up order" className="mt-8 rounded-[2rem] bg-white p-8 food-shadow">
      <div aria-hidden="true">
        <div className="flex justify-between gap-4 border-b border-stone-100 pb-6">
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-5 w-44" />
          </div>
          <SkeletonBlock className="h-9 w-28 rounded-full" />
        </div>
        <SkeletonBlock className="mt-5 h-12 w-full rounded-2xl" />
        <div className="mt-8 space-y-5">
          {[0, 1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-4">
              <SkeletonBlock className="size-10 rounded-full" />
              <SkeletonBlock className="h-5 w-48 max-w-full" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Looking up your order…</span>
    </div>
  );
}

export function FoodGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading menu"
      className="flex flex-wrap gap-5 max-lg:justify-center"
    >
      {Array.from({ length: count }, (_, index) => (
        <article
          key={index}
          aria-hidden="true"
          className="food-shadow w-60 min-w-60 overflow-hidden rounded-[1.75rem] bg-white sm:w-60 md:max-w-96"
        >
          <SkeletonBlock className="aspect-[4/3] rounded-none" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-3">
                <SkeletonBlock className="h-6 w-4/5" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-2/3" />
              </div>
              <SkeletonBlock className="size-6 shrink-0 rounded-full" />
            </div>
            <div className="mt-5 flex items-center justify-between">
              <SkeletonBlock className="h-6 w-24" />
              <SkeletonBlock className="size-11 rounded-full" />
            </div>
          </div>
        </article>
      ))}
      <span className="sr-only">Loading menu items…</span>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <main className="shell min-h-[60vh] py-14" role="status" aria-label="Loading basket">
      <SkeletonBlock className="mb-3 h-3 w-24" />
      <SkeletonBlock className="mb-10 h-10 w-56" />
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {[0, 1].map((item) => (
            <div key={item} aria-hidden="true" className="flex gap-4 rounded-3xl bg-white p-4 soft-ring">
              <SkeletonBlock className="size-28 shrink-0 rounded-2xl" />
              <div className="flex flex-1 flex-col justify-between py-1">
                <div className="space-y-3">
                  <SkeletonBlock className="h-5 w-48 max-w-full" />
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-4 w-36 max-w-full" />
                </div>
                <div className="flex justify-between">
                  <SkeletonBlock className="h-9 w-28 rounded-full" />
                  <SkeletonBlock className="h-5 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div aria-hidden="true" className="h-fit rounded-3xl bg-white p-6 soft-ring">
          <SkeletonBlock className="mb-6 h-6 w-36" />
          <SkeletonBlock className="mb-3 h-4 w-full" />
          <SkeletonBlock className="mb-6 h-4 w-2/3" />
          <SkeletonBlock className="h-12 w-full rounded-full" />
        </div>
      </div>
      <span className="sr-only">Loading your basket…</span>
    </main>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <main className="shell min-h-[60vh] py-14" role="status" aria-label="Preparing checkout">
      <SkeletonBlock className="mb-3 h-3 w-24" />
      <SkeletonBlock className="mb-10 h-10 w-80 max-w-full" />
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {[0, 1, 2].map((section) => (
            <section key={section} aria-hidden="true" className="rounded-3xl bg-white p-6 soft-ring">
              <SkeletonBlock className="mb-6 h-6 w-40" />
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1, 2, 3].slice(0, section === 0 ? 4 : section === 1 ? 3 : 1).map((field) => (
                  <SkeletonBlock key={field} className={`h-12 ${section === 2 ? "min-h-28" : ""}`} />
                ))}
              </div>
            </section>
          ))}
          <SkeletonBlock className="h-12 w-48 rounded-full" />
        </div>
        <div aria-hidden="true" className="h-fit rounded-3xl bg-white p-6 soft-ring">
          <SkeletonBlock className="mb-6 h-6 w-36" />
          <SkeletonBlock className="mb-3 h-4 w-full" />
          <SkeletonBlock className="mb-6 h-4 w-2/3" />
          <SkeletonBlock className="h-6 w-full" />
        </div>
      </div>
    </main>
  );
}

export function ProfilePageSkeleton() {
  return (
    <main className="shell min-h-[60vh] py-14" role="status" aria-label="Loading profile">
      <SkeletonBlock className="mb-3 h-3 w-24" />
      <SkeletonBlock className="mb-10 h-10 w-64" />
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <SkeletonBlock className="h-48 rounded-3xl" />
        <div aria-hidden="true" className="rounded-3xl bg-white p-7 soft-ring md:p-9">
          <SkeletonBlock className="mb-8 h-7 w-48" />
          <div className="grid gap-5 sm:grid-cols-2">
            {[0, 1, 2, 3].map((field) => <SkeletonBlock key={field} className="h-12" />)}
          </div>
          <SkeletonBlock className="mt-8 h-12 w-40 rounded-full" />
        </div>
      </div>
      <span className="sr-only">Loading your profile…</span>
    </main>
  );
}

export function OrderHistorySkeleton() {
  return (
    <main className="shell min-h-[60vh] py-14" role="status" aria-label="Loading order history">
      <SkeletonBlock className="mb-3 h-3 w-24" />
      <SkeletonBlock className="mb-10 h-10 w-56" />
      <div className="space-y-4">
        {[0, 1, 2].map((order) => (
          <div key={order} aria-hidden="true" className="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-white p-6 soft-ring">
            <div className="space-y-3">
              <SkeletonBlock className="h-6 w-40" />
              <SkeletonBlock className="h-4 w-52 max-w-full" />
            </div>
            <div className="space-y-3">
              <SkeletonBlock className="ml-auto h-6 w-24 rounded-full" />
              <SkeletonBlock className="h-5 w-28" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading your orders…</span>
    </main>
  );
}

export function FoodDetailsSkeleton() {
  return (
    <main className="shell min-h-[60vh] py-12" role="status" aria-label="Loading menu item">
      <SkeletonBlock className="mb-8 h-5 w-32" />
      <div className="grid gap-12 lg:grid-cols-2">
        <SkeletonBlock className="aspect-square rounded-[2.5rem]" />
        <div aria-hidden="true" className="flex flex-col justify-center">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="mt-5 h-12 w-4/5" />
          <SkeletonBlock className="mt-3 h-12 w-2/3" />
          <div className="mt-6 flex gap-5">
            {[0, 1, 2].map((item) => <SkeletonBlock key={item} className="h-4 w-16" />)}
          </div>
          <SkeletonBlock className="mt-9 h-6 w-40" />
          <SkeletonBlock className="mt-4 h-20 w-full" />
          <SkeletonBlock className="mt-8 h-24 w-full" />
          <SkeletonBlock className="mt-8 h-12 w-full rounded-full" />
        </div>
      </div>
      <span className="sr-only">Loading menu item…</span>
    </main>
  );
}

export function OrderConfirmationSkeleton() {
  return (
    <main className="shell grid min-h-[70vh] place-items-center py-14" role="status" aria-label="Loading order">
      <div aria-hidden="true" className="w-full max-w-2xl rounded-[2.5rem] bg-white p-8 food-shadow md:p-12">
        <SkeletonBlock className="mx-auto size-20 rounded-full" />
        <SkeletonBlock className="mx-auto mt-8 h-4 w-28" />
        <SkeletonBlock className="mx-auto mt-4 h-9 w-72 max-w-full" />
        <SkeletonBlock className="mx-auto mt-4 h-5 w-4/5" />
        <SkeletonBlock className="mt-8 h-36 w-full rounded-3xl" />
        <div className="mt-8 flex justify-center gap-3">
          <SkeletonBlock className="h-12 w-36 rounded-full" />
          <SkeletonBlock className="h-12 w-36 rounded-full" />
        </div>
      </div>
      <span className="sr-only">Loading order details…</span>
    </main>
  );
}
