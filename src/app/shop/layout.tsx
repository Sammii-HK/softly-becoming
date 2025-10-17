import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beautiful Quote Collections - Digital Downloads for Women",
  description: "Professional quote graphics for women rebuilding with intention. Instant download, personal & commercial licenses. Perfect for social media, websites, and inspiration.",
  keywords: ["quote graphics", "digital downloads", "inspirational quotes", "social media templates", "women empowerment", "commercial license", "instant download"],
  openGraph: {
    title: "Softly Becoming - Beautiful Quote Collections",
    description: "Professional quote graphics for women rebuilding with intention. Instant download with commercial license.",
    images: ['/api/og?text=Beautiful%20Quote%20Collections%0AProfessional%20graphics%20for%20women&branding=true'],
  },
  twitter: {
    title: "Beautiful Quote Collections - Softly Becoming",
    description: "Professional quote graphics for women rebuilding with intention. Instant download with commercial license.",
    images: ['/api/og?text=Beautiful%20Quote%20Collections%0AProfessional%20graphics%20for%20women&branding=true'],
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

