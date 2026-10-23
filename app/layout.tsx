import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import StoreProvider from "@/components/store-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
