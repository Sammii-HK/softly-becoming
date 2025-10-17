import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Daily Newsletter - Free Gentle Reflections",
  description: "Start your day with intention. Join thousands of women receiving daily gentle reflections and wisdom for rebuilding with grace. Free forever, unsubscribe anytime.",
  keywords: ["daily newsletter", "gentle reflections", "women empowerment", "morning inspiration", "free newsletter", "mindful living"],
  openGraph: {
    title: "Join Softly Becoming - Free Daily Newsletter",
    description: "Daily gentle reflections delivered to your inbox. Join women rebuilding with intention.",
    images: ['/api/og?text=Join%20the%20Daily%20Newsletter%0AGentle%20reflections%20every%20morning&branding=true'],
  },
  twitter: {
    title: "Join Softly Becoming - Free Daily Newsletter",
    description: "Daily gentle reflections delivered to your inbox. Join women rebuilding with intention.",
    images: ['/api/og?text=Join%20the%20Daily%20Newsletter%0AGentle%20reflections%20every%20morning&branding=true'],
  },
};

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

