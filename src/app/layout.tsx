import type { Metadata } from "next";
import { Courier_Prime, Tangerine } from "next/font/google";
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

const signatureScript = Tangerine({
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
