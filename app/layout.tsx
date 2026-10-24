import type { Metadata } from "next";
import StoreProvider from "@/components/store-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Friday Restaurant | Kigali",
  description:
    "Freshly grilled favourites, local comfort food, burgers and pizza delivered across Kigali.",
  openGraph: {
    title: "Friday Restaurant | Kigali",
    description:
      "Freshly grilled favourites, local comfort food, burgers and pizza delivered across Kigali.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
