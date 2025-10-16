import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token required" },
        { status: 400 }
      );
    }

    // Verify the magic link token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.CRON_SHARED_SECRET);
    
    const { payload } = await jwtVerify(token, secret);
    
    // Generate a longer-lived session token (24 hours)
    const sessionToken = await new SignJWT({
      email: payload.email,
      subscriberId: payload.subscriberId,
      tier: payload.tier,
      stripeId: payload.stripeId
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(secret);

    return NextResponse.json({
      success: true,
      user: {
        email: payload.email,
        subscriberId: payload.subscriberId,
        tier: payload.tier,
        stripeId: payload.stripeId
      },
      authToken: sessionToken
    });

  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
