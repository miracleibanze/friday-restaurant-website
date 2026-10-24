"use client";

import {
  buttonClass,
  EmptyState,
  Field,
  SectionTitle,
} from "@/components/storefront-ui";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setOrders, setUser, updateProfile } from "@/lib/store/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.app.user);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

 

  if (!user)
    return (
      <EmptyState
        title="Log in to see your profile."
        text="Your saved details and order history live here."
        href="/login"
        action="Log in"
      />
    );
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          defaultAddress: data.defaultAddress,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not update profile.");
      dispatch(updateProfile(result.user));
      setMessage("Profile updated successfully.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not update your profile.",
      );
    }
  }
  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    dispatch(setUser(null));
    dispatch(setOrders([]));
    router.push("/");
  }
  return (
    <main className="shell py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle
          eyebrow="Your account"
          title={`Hello, ${user.name.split(" ")[0]}.`}
        />
        <button
          type="button"
          onClick={() => void logout()}
          className="mb-10 rounded-full border border-stone-200 px-5 py-3 text-sm font-bold"
        >
          Log out
        </button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-3xl bg-charcoal p-5 text-white">
          <Link
            href="/profile"
            className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold"
          >
            Profile
          </Link>
          <Link
            href="/order-history"
            className="mt-2 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-stone-300 hover:bg-white/10"
          >
            Order history
          </Link>
        </aside>
        <form
          onSubmit={save}
          className="rounded-3xl bg-white p-7 soft-ring md:p-9"
        >
          <h2 className="font-display text-2xl font-bold">Personal details</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field
              name="name"
              label="Full name"
              defaultValue={user.name}
              required
            />
            <Field
              name="email"
              type="email"
              label="Email"
              defaultValue={user.email}
              disabled
            />
            <Field name="phone" label="Phone" defaultValue={user.phone} />
            <Field
              name="defaultAddress"
              label="Default delivery address"
              defaultValue={user.defaultAddress}
            />
          </div>
          {message && (
            <p className="mt-5 text-sm font-semibold text-sage">{message}</p>
          )}
          {error && (
            <p role="alert" className="mt-5 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}
          <button className={`${buttonClass} mt-7`}>Save changes</button>
        </form>
      </div>
    </main>
  );
}
