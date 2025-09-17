import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import "./globals.css";
import NavigationBar from "@/components/navigation";

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-typewriter",
});

export const metadata: Metadata = {
  title: "Typewriter Portfolio",
  description:
    "A modern developer portfolio inspired by early 1900s typewritten pages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${courierPrime.variable} antialiased`}>
        <div className="site-canvas">
          <div className="paper-sheet">
            <NavigationBar />
            <main className="page-content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
