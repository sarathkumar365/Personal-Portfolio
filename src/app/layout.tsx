import type { Metadata } from "next";
import { Courier_Prime, Playfair_Display, Tangerine } from "next/font/google";
import "./globals.css";
import NavigationBar from "@/components/navigation";
import SignatureMark from "@/components/signature-mark";
import {
  PageTransitionContainer,
  PageTransitionProvider,
} from "@/components/page-transition-provider";

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-typewriter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const signatureScript = Tangerine({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Sarath Kumar",
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
      <body
        className={`${courierPrime.variable} ${playfairDisplay.variable} antialiased`}
      >
        <div className="paper-texture-layer" />
        <div className="paper-highlight-layer" />
        <div className="site-canvas">
          <SignatureMark fontClass={signatureScript.className} name="Sarath" />
          <div className="paper-sheet">
            <PageTransitionProvider>
              <NavigationBar />
              <PageTransitionContainer>
                <main className="page-content">{children}</main>
              </PageTransitionContainer>
            </PageTransitionProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
