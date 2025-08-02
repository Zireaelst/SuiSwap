import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KATA Protocol - Advanced DeFi Trading",
  description: "Programmable trading strategies with cross-chain capabilities, limit orders, and TWAP execution.",
  keywords: "DeFi, cross-chain, TWAP, limit orders, Ethereum, Sui, atomic swaps, trading",
  authors: [{ name: "KATA Protocol Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} min-h-screen bg-background text-foreground antialiased font-sans`}
      >
        <div className="relative flex min-h-screen flex-col">
          <div className="grid-background fixed inset-0 -z-20" />
          {children}
        </div>
      </body>
    </html>
  );
}
