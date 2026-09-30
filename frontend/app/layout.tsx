import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { RoleProvider } from "@/components/RoleContext";

export const metadata: Metadata = {
  title: "Bayora — AI Safety Validation Platform",
  description: "Secure, isolated adversarial red-team and blue-team testing of LLMs with cryptographic provenance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        <RoleProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full">
              {children}
            </main>
            <footer className="border-t border-slate-800/80 bg-[#060a12] py-6 px-4 text-center text-xs text-slate-400">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300">BAYORA</span>
                  <span>— Multi-Tenant AI Safety Validation & Cryptographic Provenance Platform</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  Ed25519 Signed • SHA-256 Chained • Zero Early Leakage Enforced
                </div>
              </div>
            </footer>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
