import { NextRequest, NextResponse } from "next/server";
import { list } from '@vercel/blob';
import Stripe from "stripe";
import JSZip from 'jszip';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  const { packId } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const sessionId = searchParams.get("session_id");

  if (!token && !sessionId) {
    return NextResponse.json(
      { error: "Download token or session ID required" },
      { status: 401 }
    );
  }

  try {
    // Verify authorization and get license info
    let isAuthorized = false;
    let customerEmail = "";
    let licenseType = "commercial"; // default

    if (sessionId) {
      // Verify Stripe session
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.metadata?.productId === packId && 
          session.payment_status === "paid") {
        isAuthorized = true;
        customerEmail = session.customer_details?.email || "";
        licenseType = session.metadata?.license || "commercial";
      }
    } else if (token) {
      // Verify secure token
      isAuthorized = verifySecureToken(token, packId);
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Invalid or expired download link" },
        { status: 403 }
      );
    }

    // Find the pack in Vercel Blob
    const blobs = await list({
      prefix: `packs/`,
      limit: 1000
    });

    const packBlob = blobs.blobs.find(blob => 
      blob.pathname.includes(packId) && blob.pathname.endsWith('.zip')
    );

    if (!packBlob) {
      return NextResponse.json(
        { error: "Product pack not found in storage" },
        { status: 404 }
      );
    }

    // Log download for analytics
    console.log(`📦 Blob download: ${packId} (${licenseType}) by ${customerEmail}`);

    // Fetch the original ZIP and modify it with the correct license
    const response = await fetch(packBlob.url);
    const originalZipBuffer = await response.arrayBuffer();
    
    // Load the original ZIP
    const zip = new JSZip();
    await zip.loadAsync(originalZipBuffer);
    
    // Replace the license file with the correct tier
    const licenseContent = createLicenseText(packId, licenseType, customerEmail);
    zip.file('LICENSE.txt', licenseContent);
    
    // Generate the modified ZIP
    const modifiedZipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Return the modified ZIP with correct license
    return new NextResponse(new Uint8Array(modifiedZipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${packId}-${licenseType}.zip"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });

  } catch (error) {
    console.error("Blob download error:", error);
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}

function verifySecureToken(token: string, packId: string): boolean {
  try {
    const crypto = require('crypto');
    const decoded = Buffer.from(token, 'base64url').toString();
    const [payload, signature] = decoded.split(':').slice(-2);
    
    const secret = process.env.BLOB_READ_WRITE_TOKEN || process.env.CRON_SHARED_SECRET;
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    
    if (signature !== expectedSignature) {
      return false;
    }
    
    // Check expiry
    const [, , expiryStr] = decoded.split(':');
    const expiry = parseInt(expiryStr);
    
    return Date.now() < expiry;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

function createLicenseText(packId: string, licenseType: string, customerEmail: string): string {
  const licenseDescriptions = {
    personal: {
      title: 'PERSONAL LICENCE',
      description: 'for your own use (phone, prints for self). no resale.',
      permissions: [
        '• personal social media accounts',
        '• personal prints and wallpapers', 
        '• personal inspiration and motivation'
      ],
      restrictions: [
        '• no commercial use',
        '• no client work',
        '• no resale or redistribution'
      ]
    },
    commercial: {
      title: 'COMMERCIAL LICENCE',
      description: 'for client or small business use, up to 5,000 uses.',
      permissions: [
        '• business social media and marketing',
        '• client work and projects',
        '• website and blog graphics',
        '• print products (up to 5,000 copies)',
        '• include in presentations and courses'
      ],
      restrictions: [
        '• cannot resell as standalone quote packs',
        '• cannot exceed 5,000 total usage limit',
        '• cannot sublicense to others'
      ]
    },
    extended: {
      title: 'EXTENDED LICENCE',
      description: 'unlimited commercial projects and resale rights.',
      permissions: [
        '• unlimited commercial usage',
        '• resale as part of physical products',
        '• include in digital courses and products',
        '• unlimited print runs and merchandise',
        '• apps, software, and digital platforms'
      ],
      restrictions: [
        '• cannot resell as standalone quote packs',
        '• cannot claim original authorship'
      ]
    }
  };

  const license = licenseDescriptions[licenseType as keyof typeof licenseDescriptions] || licenseDescriptions.commercial;

  return `${license.title}

softly becoming digital image pack
product: ${packId}
purchased by: ${customerEmail}
downloaded: ${new Date().toLocaleDateString('en-GB')}

---

what you can do:
${license.permissions.join('\n')}

what you cannot do:
${license.restrictions.join('\n')}

---

${licenseType !== 'extended' ? 'this licence can be upgraded any time by paying the difference only.' : 'this extended licence provides maximum flexibility for commercial use.'}

questions? reply to your purchase email.

© softly becoming. all rights reserved.
`;
}
