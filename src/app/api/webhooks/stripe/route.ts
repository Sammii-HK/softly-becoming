import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const email = s.customer_details?.email;
    const subscriberId = s.metadata?.subscriberId;
    if (email && subscriberId) {
      await prisma.subscriber.update({
        where: { id: subscriberId },
        data: { tier: "PAID", stripeId: String(s.customer) || undefined },
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = String(sub.customer);
    await prisma.subscriber.updateMany({
      where: { stripeId: customerId },
      data: { tier: "FREE" },
    });
  }

  return NextResponse.json({ received: true });
}
