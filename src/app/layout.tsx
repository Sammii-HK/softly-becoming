import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Softly Becoming - Gentle Wisdom for Women Rebuilding with Intention",
    template: "%s | Softly Becoming"
  },
  description: "Daily gentle reflections, weekly letters, and beautiful quote collections for women rebuilding their lives with intention. Join thousands finding strength in softness.",
  keywords: ["gentle wisdom", "women rebuilding", "daily inspiration", "self care", "gentle strength", "mindful living", "personal growth", "intentional living", "women empowerment", "gentle transformation"],
  authors: [{ name: "Softly Becoming" }],
  creator: "Softly Becoming",
  publisher: "Softly Becoming",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://softlybecoming.uk'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Softly Becoming - Gentle Wisdom for Women Rebuilding with Intention",
    description: "Daily gentle reflections, weekly letters, and beautiful quote collections for women rebuilding their lives with intention.",
    url: 'https://softlybecoming.uk',
    siteName: 'Softly Becoming',
    images: [
      {
        url: '/api/og?text=Softly%20Becoming%0AGentile%20wisdom%20for%20women%20rebuilding%20with%20intention&branding=true',
        width: 1200,
        height: 630,
        alt: 'Softly Becoming - Gentle wisdom for women rebuilding with intention',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Softly Becoming - Gentle Wisdom for Women",
    description: "Daily gentle reflections and beautiful quote collections for women rebuilding with intention.",
    images: ['/api/og?text=Softly%20Becoming%0AGentile%20wisdom%20for%20women%20rebuilding%20with%20intention&branding=true'],
    creator: '@softly_becoming',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // You'll need to add this from Google Search Console
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}