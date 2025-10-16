import { NextRequest, NextResponse } from "next/server";
import { uploadPackToBlob } from "@/lib/storage/blob";
import { assertAdmin } from "@/lib/auth/internal";
import { readFileSync, readdirSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    // Admin authentication
    assertAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { packId, series: inputSeries } = await req.json();

    if (!packId) {
      return NextResponse.json(
        { error: "Pack ID required" },
        { status: 400 }
      );
    }

    // Find the pack
    const productsDir = join(process.cwd(), 'product-packs');
    let packPath = '';
    let series = inputSeries;

    if (series) {
      packPath = join(productsDir, series, packId);
    } else {
      // Search all series
      const seriesFolders = readdirSync(productsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const seriesName of seriesFolders) {
        const testPath = join(productsDir, seriesName, packId);
        if (existsSync(testPath)) {
          packPath = testPath;
          series = seriesName;
          break;
        }
      }
    }

    if (!packPath || !existsSync(packPath)) {
      return NextResponse.json(
        { error: "Pack not found" },
        { status: 404 }
      );
    }

    // Upload to Vercel Blob
    const result = await uploadPackToBlob(packPath, packId, series);

    if (result.success) {
      // Update local metadata
      const packInfoPath = join(packPath, 'pack-info.json');
      if (existsSync(packInfoPath)) {
        const metadata = JSON.parse(readFileSync(packInfoPath, 'utf8'));
        metadata.blobZipUrl = result.zipUrl;
        metadata.blobPreviewUrl = result.previewUrl;
        metadata.uploadedToBlob = true;
        metadata.uploadedAt = new Date().toISOString();
        
        writeFileSync(packInfoPath, JSON.stringify(metadata, null, 2));
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Upload to blob error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
