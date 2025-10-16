import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  const { packId } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const sessionId = searchParams.get("session_id");
  const email = searchParams.get("email");

  if (!token && !sessionId) {
    return NextResponse.json(
      { error: "Download token or session ID required" },
      { status: 401 }
    );
  }

  try {
    // Verify the download is authorized
    let isAuthorized = false;
    let customerEmail = email;

    if (sessionId) {
      // Verify Stripe session
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.metadata?.productId === packId && 
          session.payment_status === "paid") {
        isAuthorized = true;
        customerEmail = session.customer_details?.email || email;
      }
    } else if (token) {
      // Verify secure token (you can implement JWT or signed tokens here)
      // For now, simple check - in production, use proper JWT verification
      const expectedToken = generateSecureToken(packId, customerEmail || "");
      isAuthorized = token === expectedToken;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Invalid or expired download link" },
        { status: 403 }
      );
    }

    // Find the pack files
    const packPath = findPackPath(packId);
    
    if (!packPath) {
      return NextResponse.json(
        { error: "Product pack not found" },
        { status: 404 }
      );
    }

    // Create ZIP file of all pack images
    const zipBuffer = await createPackZip(packPath, packId);
    
    // Log the download for analytics
    console.log(`📦 Download: ${packId} by ${customerEmail}`);

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${packId}.zip"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });

  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}

function findPackPath(packId: string): string | null {
  const productsDir = join(process.cwd(), 'product-packs');
  
  // Search through all series folders
  const seriesFolders = readdirSync(productsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const series of seriesFolders) {
    const seriesDir = join(productsDir, series);
    const packDir = join(seriesDir, packId);
    
    if (existsSync(packDir)) {
      return packDir;
    }
  }

  return null;
}

function generateSecureToken(packId: string, email: string): string {
  // Simple token generation - in production, use proper JWT or signed tokens
  const secret = process.env.DOWNLOAD_SECRET || "fallback-secret";
  const crypto = require('crypto');
  
  return crypto
    .createHmac('sha256', secret)
    .update(`${packId}:${email}:${new Date().toDateString()}`)
    .digest('hex')
    .substring(0, 32);
}

async function createPackZip(packPath: string, packId: string): Promise<Buffer> {
  // For now, return a simple response. In production, you'd want to:
  // 1. Use a proper ZIP library (like 'archiver' or 'node-stream-zip')
  // 2. Stream the files to avoid memory issues
  // 3. Add proper error handling
  
  const JSZip = require('jszip');
  const zip = new JSZip();
  
  // Get all PNG files in the pack
  const files = readdirSync(packPath)
    .filter(file => file.endsWith('.png'));
  
  for (const file of files) {
    const filePath = join(packPath, file);
    const fileData = readFileSync(filePath);
    zip.file(file, fileData);
  }
  
  // Add pack info
  const packInfoPath = join(packPath, 'pack-info.json');
  if (existsSync(packInfoPath)) {
    const packInfo = readFileSync(packInfoPath, 'utf8');
    zip.file('pack-info.json', packInfo);
  }
  
  // Add license file
  const license = `
Digital Quote Pack License

Product: ${packId}
Downloaded: ${new Date().toISOString()}

COMMERCIAL USE INCLUDED:
✅ Use for social media posts
✅ Use for client work  
✅ Use for website graphics
✅ Print for physical products
✅ Resell as part of larger packages

RESTRICTIONS:
❌ Cannot resell as standalone quote packs
❌ Cannot claim as your own original work
❌ Cannot remove attribution if included

For questions: hello@softrebuild.com
`;
  
  zip.file('LICENSE.txt', license);
  
  return await zip.generateAsync({ type: 'nodebuffer' });
}
