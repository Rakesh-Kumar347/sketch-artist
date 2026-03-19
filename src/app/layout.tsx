import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ArtFromHeart — Pencil Sketch Commissions",
  description:
    "Beautiful handcrafted pencil sketches by a passionate artist. Upload your photo and get an instant price estimate.",
  openGraph: {
    title: "ArtFromHeart — Pencil Sketch Commissions",
    description:
      "Handcrafted pencil sketches. Upload your photo for an instant price estimate.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className={`${geist.className} min-h-screen flex flex-col`}>
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
