import type { Metadata } from "next";
import StoreProvider from "@/components/store-provider";
import { siteUrl } from "@/lib/site-config";
import "./globals.css";

const siteTitle = "Friday Restaurant | Chicken, Fish & Burgers in Kigali";
const siteDescription =
  "Order whole chicken, half chicken, chicken wings, chicken legs, chicken burgers, beef burgers, and whole fish at Friday Restaurant in Kigali, Rwanda. Explore our menu and order online.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: "%s | Friday Restaurant" },
  description: siteDescription,
  applicationName: "Friday Restaurant",
  keywords: [
    "Friday Restaurant",
    "restaurant in Kigali",
    "chicken restaurant Kigali",
    "whole chicken Kigali",
    "half chicken Kigali",
    "chicken wings Kigali",
    "chicken legs Kigali",
    "chicken burger Kigali",
    "beef burger Kigali",
    "fish restaurant Kigali",
    "whole fish Kigali",
    "chicken and fish Rwanda",
    "burgers in Kigali",
    "order food online Kigali",
    "food delivery Kigali",
    "Kigali restaurant menu",
    "restaurants in Rwanda",
  ],
  authors: [{ name: "Friday Restaurant" }],
  creator: "Friday Restaurant",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Friday Restaurant",
    locale: "en_RW",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/logo2.png`,
        width: 1200,
        height: 630,
        alt: "Friday Restaurant — chicken, fish, and burgers in Kigali",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}/logo2.png`],
  },
  robots: { index: true, follow: true },
  verification: {
    google: "a_tAui1g8SWAboieXi33zsuPOcHTW_3Z3TyD9AkQ_YA", 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
