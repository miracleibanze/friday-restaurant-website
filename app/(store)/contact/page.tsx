"use client";

import {
  buttonClass,
  Field,
  inputClass,
  SectionTitle,
} from "@/components/storefront-ui";
import { ArrowRight, Clock3, Mail, MapPin, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send message.");
      setSent(true);
      form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not save your message. Please try again.");
    }
  }
  return (
    <main className="shell py-14">
      <SectionTitle
        eyebrow="Talk to us"
        title="We’d love to hear from you."
        text="Questions, feedback or a special request? Call or email our Kigali team."
      />
      <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
        <div className="rounded-[2rem] bg-charcoal p-8 text-white">
          <h2 className="font-display text-2xl text-charcoal-50">
            Friday Restaurant
          </h2>
          <div className="mt-8 space-y-6 text-sm text-stone-300">
            <a
              href="pe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3"
            >
              <MapPin className="text-friday" /> Kigali, Kicukiro
              <br />
              Kigali, Rwanda
            </a>
            <a href="tel:+250782578829" className="flex gap-3">
              <Phone className="text-friday" /> 0782578829
            </a>  
            <a
                href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent("amosndayam@gmail.com")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3"
              >
                <Mail className="text-friday" /> amosndayam@gmail.com
              </a>
            <p className="flex gap-3">
              <Clock3 className="text-friday" /> Daily, 10:00–22:30
            </p>
          </div>
        </div>
        <form
          onSubmit={submit}
          className="rounded-[2rem] bg-white p-7 soft-ring md:p-9"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="name" label="Your name" required />
            <Field name="email" type="email" label="Email address" required />
            <div className="sm:col-span-2">
              <Field name="subject" label="Subject" required />
            </div>
            <label className="block text-sm font-semibold sm:col-span-2">
              Message
              <textarea
                name="message"
                className={`${inputClass} mt-2 min-h-36 resize-none`}
                required
              />
            </label>
          </div>
          {sent && (
            <p className="mt-5 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
              Thanks! Your message has been sent to Friday Restaurant.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-5 text-sm font-bold text-red-600">
              {error}
            </p>
          )}
          <button className={`${buttonClass} mt-6`}>
            Send message <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </main>
  );
}
