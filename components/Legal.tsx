import { SectionTitle } from "./storefront-ui";

export function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const privacy = [
    [
      "Information we collect",
      "We collect the details you provide when ordering or creating an account, including your name, contact details, delivery address and order history.",
    ],
    [
      "How we use it",
      "We use your information to prepare and deliver orders, provide customer support, improve our menu and keep your account secure.",
    ],
    [
      "Your choices",
      "You can update your account details at any time. Contact us to request access to or deletion of your personal information.",
    ],
  ];
  const terms = [
    [
      "Ordering",
      "Orders are confirmed once accepted by our kitchen. Availability and preparation times may vary during busy periods.",
    ],
    [
      "Delivery and payment",
      "Please provide an accurate Kigali delivery address and reachable phone number. Payment is due using the method chosen at checkout.",
    ],
    [
      "Cancellations and refunds",
      "Contact us immediately if there is an issue. Refunds are assessed fairly based on order status and product quality.",
    ],
  ];
  const items = type === "privacy" ? privacy : terms;
  return (
    <main className="shell max-w-4xl py-14">
      <SectionTitle
        eyebrow="Friday Restaurant"
        title={type === "privacy" ? "Privacy policy." : "Terms of service."}
        text={`Last updated ${new Date().toLocaleDateString("en-RW", { month: "long", year: "numeric" })}`}
      />
      <div className="rounded-[2rem] bg-white p-8 soft-ring md:p-12">
        <p className="leading-8 text-stone-600">
          {type === "privacy"
            ? "We respect your privacy and only collect what we need to serve you well."
            : "These terms help keep ordering from Friday clear, fair and delicious."}
        </p>
        {items.map(([title, text], index) => (
          <section key={title} className="mt-9">
            <h2 className="font-display text-2xl font-bold">
              {index + 1}. {title}
            </h2>
            <p className="mt-3 leading-8 text-stone-600">{text}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
