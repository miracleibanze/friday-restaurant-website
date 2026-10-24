"use client";

import { SectionTitle } from "@/components/storefront-ui";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FAQPage() {
  const [open, setOpen] = useState(0);
  const questions = [
    [
      "Where do you deliver?",
      "We deliver throughout central Kigali, including Kimihurura, Kacyiru, Remera, Nyarutarama, Kigali Heights and nearby neighbourhoods.",
    ],
    [
      "How long does delivery take?",
      "Most orders arrive in 25–45 minutes. Larger orders and peak Friday evenings may take a little longer.",
    ],
    [
      "Can I change my order after placing it?",
      "Call us as soon as possible. If the kitchen has not started your order, we will do our best to update it.",
    ],
    [
      "What payment methods do you accept?",
      "We accept MTN MoMo, Airtel Money, cash on delivery and card on delivery.",
    ],
    [
      "Do you cater for allergies?",
      "Please add allergy information in the delivery notes. Our team will contact you if we cannot safely accommodate the request.",
    ],
  ];
  return (
    <main className="shell max-w-4xl py-14">
      <SectionTitle
        eyebrow="Good to know"
        title="Frequently asked questions."
      />
      <div className="space-y-3">
        {questions.map(([question, answer], index) => (
          <div
            key={question}
            className="overflow-hidden rounded-2xl bg-white soft-ring"
          >
            <button
              type="button"
              onClick={() => setOpen(open === index ? -1 : index)}
              className="flex w-full items-center justify-between p-5 text-left font-bold"
            >
              {question}
              <ChevronDown
                size={18}
                className={`transition ${open === index ? "rotate-180" : ""}`}
              />
            </button>
            {open === index && (
              <p className="px-5 pb-5 leading-7 text-stone-500">{answer}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
