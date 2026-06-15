import type { Metadata } from "next";
import { Jost, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500"],
});

const monoNum = JetBrains_Mono({
  variable: "--font-mono-num",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Stablecoin Payouts — a working product concept",
  description:
    "How a platform pays sellers globally in USDC: seconds to settle, priced like software. A working, simulated demo and product brief by Michael Stanat.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${newsreader.variable} ${monoNum.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
