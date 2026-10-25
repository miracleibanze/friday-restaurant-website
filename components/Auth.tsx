"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setUser } from "@/lib/store/store";
import { useAppDispatch } from "@/lib/store/hooks";
import { buttonClass, Field } from "@/components/storefront-ui";

export default function AuthPage({
  mode,
}: {
  mode: "login" | "register" | "forgot";
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const content =
    mode === "login"
      ? [
          "Welcome back.",
          "Log in to reorder favourites and track every delivery.",
        ]
      : mode === "register"
        ? [
            "Your Friday starts here.",
            "Create an account for faster checkout and easy order history.",
          ]
        : [
            "Reset your password.",
            "We’ll send recovery instructions to your email address.",
          ];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (mode === "forgot") {
      setMessage("Password reset email delivery is not configured yet.");
      return;
    }

    setLoading(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      dispatch(setUser(result.user));
      router.push("/profile");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not complete the account request.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell grid min-h-[72vh] items-center gap-10 py-14 lg:grid-cols-2">
      <div className="hidden overflow-hidden rounded-[2.5rem] lg:block">
        <img
          src="/friday-family-feast.jpg"
          alt="A fresh Friday Restaurant meal"
          className="h-[620px] w-full object-cover"
        />
      </div>
      <div className="mx-auto w-full max-w-md">
        <p className="text-friday text-xs font-bold uppercase tracking-[.22em]">
          {mode === "login"
            ? "Customer login"
            : mode === "register"
              ? "Join Friday"
              : "Account recovery"}
        </p>
        <h1 className="font-display mt-3 text-5xl font-semibold">
          {content[0]}
        </h1>
        <p className="mt-4 leading-7 text-stone-500">{content[1]}</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "register" && (
            <Field name="name" label="Full name" required />
          )}
          <Field name="email" type="email" label="Email address" required />
          {mode !== "forgot" && (
            <Field
              name="password"
              type="password"
              label="Password"
              minLength={8}
              required
            />
          )}
          {error && (
            <p
              role="alert"
              className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700"
            >
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700">
              {message}
            </p>
          )}
          <button disabled={loading} className={`${buttonClass} w-full`}>
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Log in"
                : mode === "register"
                  ? "Create account"
                  : "Send reset instructions"}
          </button>
        </form>
        {mode === "login" && (
          <div className="mt-5 flex justify-between text-sm">
            <Link href="/forgot-password" className="font-semibold text-friday">
              Forgot password?
            </Link>
            <Link href="/register" className="font-semibold">
              Create account
            </Link>
          </div>
        )}
        {mode === "register" && (
          <p className="mt-5 text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-friday">
              Log in
            </Link>
          </p>
        )}
        {mode === "forgot" && (
          <Link
            href="/login"
            className="mt-5 block text-center text-sm font-bold text-friday"
          >
            Back to login
          </Link>
        )}
      </div>
    </main>
  );
}
