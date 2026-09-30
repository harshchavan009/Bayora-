import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { RoleProvider } from "@/components/RoleContext";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Bayora — AI Safety & Security Validation Platform",
  description: "Enterprise security and validation console for frontier LLM red-teaming, defense evaluation, and cryptographic audit proofs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-foreground antialiased selection:bg-accent/20 selection:text-accent">
        <ThemeProvider>
          <RoleProvider>
            <AppShell>
              {children}
            </AppShell>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
