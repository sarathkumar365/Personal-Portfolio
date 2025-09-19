import type { Metadata } from "next";
import { Ballet, Courier_Prime } from "next/font/google";
import "./globals.css";
import NavigationBar from "@/components/navigation";
import SignatureMark from "@/components/signature-mark";

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-typewriter",
});

const signatureScript = Ballet({
  subsets: ["latin"],
  weight: "400",
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
          <SignatureMark
            fontClass={signatureScript.className}
            name="Sarath Kumar"
          />
          <div className="paper-sheet">
            <NavigationBar />
            <main className="page-content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
