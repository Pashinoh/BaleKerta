import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BaleKerta | Pra-Pemeriksaan Tata Ruang Adat Bali (Sanga Mandala & PBG)",
  description:
    "Sistem verifikasi kepatuhan orientasi kosmologis Asta Kosala-Kosali, Asta Bumi, dan Perda Provinsi Bali No. 5/2005 sebelum pengajuan Persetujuan Bangunan Gedung (PBG).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-ink-950 text-bone-100 min-h-screen selection:bg-bone-100 selection:text-ink-950`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
