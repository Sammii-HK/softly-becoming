import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json(); // Resend sends { type, data: { to, message_id, ... } }
  const type = body?.type as string;
  const email = body?.data?.to as string | undefined;
  if (!email) return NextResponse.json({ ok: true });

  const s = await prisma.subscriber.findUnique({ where: { email } });
  if (!s) return NextResponse.json({ ok: true });

  const t = type?.includes("open") ? "opened"
         : type?.includes("click") ? "clicked"
         : type?.includes("delivered") ? "delivered"
         : null;
  if (!t) return NextResponse.json({ ok: true });

  await prisma.emailEvent.create({
    data: {
      subscriberId: s.id,
      type: t as any,
      messageId: body?.data?.message_id,
      meta: body,
    }
  });
  return NextResponse.json({ ok: true });
}
