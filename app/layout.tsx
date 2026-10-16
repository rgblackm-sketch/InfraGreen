import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "InfraGreen | Smarter solutions for stormwater", template: "%s | InfraGreen" },
  description:
    "Connect with qualified local professionals for stormwater and green-infrastructure services in the New Orleans metro area.",
  openGraph: {
    title: "InfraGreen | Smarter solutions for stormwater",
    description: "Connect with qualified local professionals for stormwater and green-infrastructure services in the New Orleans metro area.",
    siteName: "InfraGreen",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}