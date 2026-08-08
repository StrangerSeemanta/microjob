import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { Analytics } from "@vercel/analytics/next";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Microjob - Earn money completing task",
  description: "Earn money even more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-mono",
        jetbrainsMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col  bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#111827_100%)]">
        <ClerkProvider>{children}</ClerkProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
