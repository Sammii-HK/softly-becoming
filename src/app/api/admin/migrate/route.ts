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
    // Test database connection by counting subscribers
    const subscriberCount = await prisma.subscriber.count();
    
    // Simple table existence check
    let hasAllTables = true;
    try {
      await prisma.subscriber.findFirst();
      await prisma.emailEvent.findFirst();
      await prisma.letter.findFirst();
    } catch (error) {
      hasAllTables = false;
    }
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        subscriberCount,
        schema: {
          allTablesExist: hasAllTables
        }
      },
      message: hasAllTables ? "Database fully configured" : "Database connected but tables missing"
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
