import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, name } = await req.json();
  // Ensure subscriber exists
  const sub = await prisma.subscriber.upsert({
    where: { email },
    update: { name },
    create: { email, name },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/inbox?thanks=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/inbox?cancelled=1`,
    metadata: { subscriberId: sub.id },
  });

  return NextResponse.json({ url: session.url });
}
