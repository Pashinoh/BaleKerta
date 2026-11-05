import React, { Suspense } from "react";
import { Metadata } from "next";
import { PanduanPageClient } from "./PanduanPageClient";

export const metadata: Metadata = {
  title: "Panduan | BaleKerta",
  description: "Panduan lengkap istilah arsitektur tradisional Bali, arah suci, Sanga Mandala, dan pedoman Asta Bumi untuk desain denah yang patih adat.",
  openGraph: {
    title: "Panduan | BaleKerta",
    description: "Panduan lengkap istilah arsitektur tradisional Bali",
    type: "website",
  },
};

export default function PanduanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-950 text-bone-100">Loading Panduan...</div>}>
      <PanduanPageClient />
    </Suspense>
  );
}