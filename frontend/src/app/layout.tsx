import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
  title: "BaleKerta — Pra-Pemeriksaan Arsitektur Adat Bali",
  description: "Sistem analisis kepatuhan tata ruang arsitektur tradisional Bali (Asta Kosala-Kosali & Asta Bumi) berbasis kecerdasan spasial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-ink-950 text-bone-100 min-h-screen selection:bg-bone-100 selection:text-ink-950`}
      >
        {children}
      </body>
    </html>
  );
}
