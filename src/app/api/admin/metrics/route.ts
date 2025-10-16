import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { assertAdmin } from "@/lib/auth/internal";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try { 
    assertAdmin(req); 
  } catch { 
    return NextResponse.json({ error: "unauthorised" }, { status: 401 }); 
  }

  try {
    const [countFree, countPaid, events] = await Promise.all([
      prisma.subscriber.count({ where: { tier: "FREE", status: "ACTIVE" } }),
      prisma.subscriber.count({ where: { tier: "PAID", status: "ACTIVE" } }),
      prisma.emailEvent.groupBy({
        by: ["type"],
        _count: { type: true },
        where: { ts: { gte: new Date(Date.now() - 1000*60*60*24*7) } } // last 7 days
      })
    ]);

    const eventMap = Object.fromEntries(events.map((e: any) => [e.type, e._count.type]));

    return NextResponse.json({
      countFree,
      countPaid,
      events: {
        delivered: eventMap.delivered || 0,
        opened: eventMap.opened || 0,
        clicked: eventMap.clicked || 0,
      }
    });
  } catch (error) {
    console.error("Metrics error:", error);
    return NextResponse.json({ 
      error: "Database not available" 
    }, { status: 500 });
  }
}
