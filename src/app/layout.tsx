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

export const metadata: Metadata = {
  title: "Don Paco Pet Shop",
  description: "Tienda online de Don Paco en Rio Negro. Alimentos, accesorios y cuidado para tu mascota.",
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
