import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, IM_Fell_English } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientShell from "@/components/ClientShell";
import { AuthProvider } from "@/context/AuthContext";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const imFell = IM_Fell_English({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-im-fell",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Art From Heart — Portraits & Commissions",
  description:
    "World-class pencil sketches, digital portraits, and custom commissions crafted with soul.",
  openGraph: {
    title: "Art From Heart — Portraits & Commissions",
    description: "Handcrafted pencil sketches. Upload your photo for an instant price estimate.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased ${cormorant.variable} ${dmSans.variable} ${imFell.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <ClientShell>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </ClientShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
