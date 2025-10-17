import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/internal";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    assertAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Test database connection first
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table'
    ` as any[];
    
    const tableNames = tables.map((t: any) => t.name);
    const hasSubscriber = tableNames.includes('Subscriber');
    const hasEmailEvent = tableNames.includes('EmailEvent');
    const hasLetter = tableNames.includes('Letter');

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        tables: tableNames,
        schema: {
          subscriber: hasSubscriber,
          emailEvent: hasEmailEvent,
          letter: hasLetter
        }
      },
      message: "Database connection successful"
    });

  } catch (error) {
    console.error("Database migration check failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Database connection failed",
      help: "Run 'npx prisma db push' with your production DATABASE_URL"
    }, { status: 500 });
  }
}
