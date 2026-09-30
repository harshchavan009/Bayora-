import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { RoleProvider } from "@/components/RoleContext";

export const metadata: Metadata = {
  title: "Bayora — AI Safety Validation Platform",
  description: "Enterprise security and validation console for frontier LLM red-teaming and defensive countermeasures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0c1017] text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        <RoleProvider>
          <AppShell>
            {children}
          </AppShell>
        </RoleProvider>
      </body>
    </html>
  );
}
