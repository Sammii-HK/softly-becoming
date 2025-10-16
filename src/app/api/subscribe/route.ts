import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const form = await req.formData();
  const schema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    source: z.string().optional(),
  });
  const parse = schema.safeParse({
    email: form.get("email"),
    name: form.get("name") || undefined,
    source: form.get("source") || "web",
  });
  if (!parse.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { email, name, source } = parse.data;

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (!existing) {
    await prisma.subscriber.create({ data: { email, name, source } });
  } else if (existing.status !== "ACTIVE") {
    await prisma.subscriber.update({ where: { email }, data: { status: "ACTIVE" } });
  }

  // Send immediate welcome
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Welcome to Soft Rebuild Daily",
    html: `<p>thank you for joining.</p><p>one gentle note each morning, in your inbox.</p><p>— soft rebuild</p>`,
  });

  return NextResponse.json({ ok: true });
}
