import Image from "next/image";

export function PageLoader({
  label,
  overlay = false,
}: {
  label: string;
  overlay?: boolean;
}) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center text-center"
    >
      <div className="relative grid size-20 place-items-center">
        <span className="absolute inset-0 rounded-full border-4 border-orange-100" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-friday" />
        <Image
          src="/logo.png"
          alt="Friday Restaurant"
          width={300}
          height={300}
          className="size-15 object-contain"
        />
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[.24em] text-friday">
        Friday Restaurant
      </p>
      <p className="mt-2 text-sm font-semibold text-stone-600">{label}</p>
      <span className="mt-5 flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-2 animate-pulse rounded-full bg-friday"
            style={{ animationDelay: `${dot * 160}ms` }}
          />
        ))}
      </span>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-cream/95 p-6 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <main className="shell grid min-h-[60vh] place-items-center py-14">
      {content}
    </main>
  );
}

export default function Loading() {
  return <PageLoader label="Loading your Friday experience…" />;
}

