import type { Metadata } from "next";
import "./globals.css";
import "./posters.css";
import "./footer.css";
import "./paypal.css";
import "./readability.css";

export const metadata: Metadata = {
  title: "VenuX Skin Clinic | Personalised Skin Care",
  description: "Personalised, clinician-led skin treatments and membership care in Australia.",
  openGraph: {
    title: "VenuX Skin Clinic",
    description: "Modern skin care, beautifully considered.",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "VenuX Skin Clinic" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VenuX Skin Clinic",
    description: "Modern skin care, beautifully considered.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
