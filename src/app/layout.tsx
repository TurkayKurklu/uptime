import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuroraBackground } from "@/components/ui/aurora-bg";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Antigravity — Uptime Engine",
  description:
    "High-performance uptime monitoring & visual regression engine. Track your sites with real-time health checks and automated screenshots.",
  keywords: ["uptime", "monitoring", "screenshot", "health check", "status page"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased dark`}>
      <body
        className="min-h-full flex flex-col font-poppins"
        style={{
          background: "var(--bg-primary)",
        }}
      >
        <AuroraBackground />
        <main className="flex-1 relative z-10">{children}</main>
      </body>
    </html>
  );
}
