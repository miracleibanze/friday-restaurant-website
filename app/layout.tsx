import type { Metadata } from "next";
import StoreProvider from "@/components/store-provider";
import "./globals.css";

const siteUrl = "https://friday-restaurant-website.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Friday Restaurant | Whole Chicken & Fish in Kigali",
    template: "%s | Friday Restaurant",
  },
  description:
    "Enjoy delicious whole chicken and fresh fish at Friday Restaurant in Kigali, Rwanda. Explore our menu, check prices, and order your favourite meal online.",
  applicationName: "Friday Restaurant",
  keywords: [
    "Friday Restaurant",
    "restaurant in Kigali",
    "whole chicken Kigali",
    "roast chicken Kigali",
    "grilled chicken Kigali",
    "fresh fish Kigali",
    "fish restaurant Kigali",
    "chicken and fish Rwanda",
    "order chicken online Kigali",
    "order fish online Kigali",
    "food delivery Kigali",
    "Kigali restaurant menu",
    "Rwanda restaurants",
  ],
  authors: [{ name: "Friday Restaurant" }],
  creator: "Friday Restaurant",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Friday Restaurant",
    locale: "en_RW",
    title: "Friday Restaurant | Whole Chicken & Fish in Kigali",
    description:
      "Looking for whole chicken or fish in Kigali? Discover Friday Restaurant, explore our menu, and order your favourite meal online.",
    images: [
      {
        url: "public/logo2.png",
        width: 1200,
        height: 630,
        alt: "Whole chicken and fish at Friday Restaurant in Kigali",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Friday Restaurant | Whole Chicken & Fish in Kigali",
    description:
      "Enjoy whole chicken and fish in Kigali, Rwanda. Explore the Friday Restaurant menu and order online.",
    images: ["public/logo2.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
