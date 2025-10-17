import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/database/client";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.CRON_SHARED_SECRET);
    
    // Verify the session token
    const { payload } = await jwtVerify(token, secret);
    
    // Get fresh user data from database
    const subscriber = await prisma.subscriber.findUnique({
      where: { id: payload.subscriberId as string },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        tier: true, 
        status: true, 
        stripeId: true,
        createdAt: true
      }
    });

    if (!subscriber || subscriber.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "User not found or inactive" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: subscriber.email,
        subscriberId: subscriber.id,
        tier: subscriber.tier,
        stripeId: subscriber.stripeId,
        name: subscriber.name,
        memberSince: subscriber.createdAt
      }
    });

  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      { error: "Invalid or expired session" },
      { status: 401 }
    );
  }
}
