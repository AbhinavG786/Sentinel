import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Sentinel — AI-Powered Observability Platform",
  description:
    "Sentinel is an AI-powered observability platform with a prompt firewall. Monitor incidents, alerts, and AI policy violations in real-time.",
  keywords: ["observability", "AI security", "incident management", "prompt firewall"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full gradient-bg antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
