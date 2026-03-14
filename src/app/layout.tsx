import type { Metadata } from "next";
import { Inter, Poppins, Orbitron } from "next/font/google";
import "./globals.css";
import { TopNavBar } from "@/components/TopNavBar";
import { StreakWarningToast } from "@/components/juice/StreakWarningToast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LevelUp Learning",
  description: "Gamified learning for high school students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} ${orbitron.variable} antialiased selection:bg-primary-sky/30 bg-neutral-offwhite`}
      >
        <div className="cyberpunk-bg" />
        <StreakWarningToast />
        <TopNavBar />
        <main className="pt-20 relative z-10"> {/* Add padding for fixed TopNavBar */}
          {children}
        </main>
      </body>
    </html>
  );
}
