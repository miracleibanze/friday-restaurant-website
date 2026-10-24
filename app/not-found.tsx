import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-8 text-center">
      <p className="text-friday text-sm font-bold uppercase tracking-[.22em]">
        Error 404
      </p>
      <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight text-charcoal">
        This table is empty.
      </h1>
      <p className="mt-4 max-w-md text-stone-600">
        The page you&apos;re looking for has moved, but something delicious is
        never far away.
      </p>
      <Link
        className="mt-8 rounded-full bg-friday px-6 py-3 font-bold text-white transition hover:bg-friday-dark"
        href="/"
      >
        Back to Home
      </Link>
    </main>
  );
}
