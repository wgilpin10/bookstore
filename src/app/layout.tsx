import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import DashboardLayout from "@/components/DashboardLayout";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Bookshop — Inventory Dashboard",
  description:
    "Manage your bookshop inventory with a beautiful, market-ready dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
