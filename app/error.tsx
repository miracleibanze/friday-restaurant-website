"use client";

import { buttonClass } from "@/components/storefront-ui";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="shell grid min-h-[65vh] place-items-center py-14">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[.24em] text-friday">
          Something went wrong
        </p>
        <h1 className="font-display mt-3 text-3xl">We couldn’t load this page.</h1>
        <p className="mt-4 leading-7 text-stone-600">
          Check your internet connection and try again. If the problem continues,
          refresh the page in a moment.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className={buttonClass}>
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full border border-stone-300 px-6 py-3.5 text-sm font-bold transition hover:bg-white"
          >
            Refresh page
          </button>
        </div>
      </div>
    </main>
  );
}
