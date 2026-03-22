import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";
import { RootProviders } from "@/components/providers/RootProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description:
    "Schedule harm-reduction copilot for rotating shift workers — circadian risk, recovery, and humane next steps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#04112d] font-sans text-[#edf2ff]`}
      >
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
