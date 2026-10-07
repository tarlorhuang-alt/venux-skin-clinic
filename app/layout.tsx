import type { Metadata } from "next";
import "./globals.css";
import "./posters.css";
import "./footer.css";
import "./paypal.css";
import "./readability.css";

export const metadata: Metadata = {
  title: "ISA Skin Clinic & Aesthetics | Personalised Skin Care",
  description: "Personalised, clinician-led skin treatments and membership care in Australia.",
  openGraph: {
    title: "ISA Skin Clinic & Aesthetics",
    description: "Modern skin care, beautifully considered.",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "ISA Skin Clinic & Aesthetics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ISA Skin Clinic & Aesthetics",
    description: "Modern skin care, beautifully considered.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
