import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import CartProvider from "@/components/cart-provider";
import { CartToast } from "@/components/cart-toast";
import AppProviders from "@/components/providers/app-providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || "https://donpacopet.com";

const description = "Tienda online de alimentos, accesorios y cuidado para tu mascota.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Don Paco Pet Shop",
  description,
  openGraph: {
    title: "Don Paco Pet Shop",
    description,
    url: siteUrl,
    siteName: "Don Paco Pet Shop",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1280,
        height: 626,
        alt: "Don Paco Pet Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Don Paco Pet Shop",
    description,
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <AppProviders>
          <CartProvider>
            {children}
            <CartToast />
          </CartProvider>
        </AppProviders>
      </body>
    </html>
  );
}
