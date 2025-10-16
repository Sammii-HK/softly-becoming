import { put, del, list } from '@vercel/blob';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

interface PackUploadResult {
  success: boolean;
  packId: string;
  zipUrl?: string;
  previewUrl?: string;
  fileCount: number;
  error?: string;
}

export async function uploadPackToBlob(
  packPath: string, 
  packId: string, 
  series: string
): Promise<PackUploadResult> {
  try {
    console.log(`📤 Uploading ${packId} to Vercel Blob...`);
    
    // Create ZIP file
    const JSZip = require('jszip');
    const zip = new JSZip();
    
    // Get all PNG files
    const files = readdirSync(packPath).filter(file => file.endsWith('.png'));
    let previewFile = '';
    
    for (const file of files) {
      const filePath = join(packPath, file);
      const fileData = readFileSync(filePath);
      zip.file(file, fileData);
      
      // Use first file as preview
      if (!previewFile) previewFile = file;
    }
    
    // Add pack info and license
    const packInfoPath = join(packPath, 'pack-info.json');
    const packInfo = readFileSync(packInfoPath, 'utf8');
    zip.file('pack-info.json', packInfo);
    
    const license = createLicenseText(packId);
    zip.file('LICENSE.txt', license);
    
    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Upload ZIP to Vercel Blob
    const zipBlob = await put(`packs/${series}/${packId}.zip`, zipBuffer, {
      access: 'public', // Will be secured via our API
      contentType: 'application/zip',
      addRandomSuffix: false // Keep predictable names
    });
    
    // Upload preview image separately for shop display
    let previewUrl = '';
    if (previewFile) {
      const previewPath = join(packPath, previewFile);
      const previewBuffer = readFileSync(previewPath);
      
      const previewBlob = await put(`previews/${series}/${packId}-preview.png`, previewBuffer, {
        access: 'public',
        contentType: 'image/png',
        addRandomSuffix: false
      });
      
      previewUrl = previewBlob.url;
    }
    
    console.log(`✅ Uploaded ${packId}: ${files.length} files`);
    
    return {
      success: true,
      packId,
      zipUrl: zipBlob.url,
      previewUrl,
      fileCount: files.length
    };
    
  } catch (error) {
    console.error(`❌ Upload failed for ${packId}:`, error);
    return {
      success: false,
      packId,
      fileCount: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function getSecureDownloadUrl(
  packId: string, 
  sessionId: string, 
  expiresInHours = 24
): Promise<string | null> {
  try {
    // In production, you'd verify the Stripe session here
    // For now, generate a secure signed URL
    
    const crypto = require('crypto');
    const secret = process.env.BLOB_READ_WRITE_TOKEN || process.env.CRON_SHARED_SECRET;
    const expiryTime = Date.now() + (expiresInHours * 60 * 60 * 1000);
    
    const payload = `${packId}:${sessionId}:${expiryTime}`;
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
    
    return `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/blob/${packId}?token=${token}`;
    
  } catch (error) {
    console.error('Failed to generate secure download URL:', error);
    return null;
  }
}

export async function listAllPacks(): Promise<any[]> {
  try {
    const blobs = await list({
      prefix: 'packs/',
      limit: 1000
    });
    
    return blobs.blobs.map(blob => ({
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      pathname: blob.pathname
    }));
    
  } catch (error) {
    console.error('Failed to list packs:', error);
    return [];
  }
}

export async function deletePackFromBlob(packId: string, series: string): Promise<boolean> {
  try {
    await del(`packs/${series}/${packId}.zip`);
    await del(`previews/${series}/${packId}-preview.png`);
    return true;
  } catch (error) {
    console.error(`Failed to delete ${packId}:`, error);
    return false;
  }
}

function createLicenseText(packId: string): string {
  return `
Digital Quote Pack License

Product: ${packId}
Downloaded: ${new Date().toISOString()}
Provider: Soft Rebuild (softly-becoming.vercel.app)

COMMERCIAL USE INCLUDED:
✅ Use for social media posts and stories
✅ Use for client work and projects
✅ Use for website and blog graphics  
✅ Print for physical products and merchandise
✅ Include in larger digital packages or courses

RESTRICTIONS:
❌ Cannot resell as standalone quote packs
❌ Cannot claim as your own original work
❌ Cannot redistribute the source files
❌ Cannot use for competing quote businesses

ATTRIBUTION (Optional but Appreciated):
"Quotes from Soft Rebuild" or link to softly-becoming.vercel.app

For questions or commercial licensing inquiries:
hello@softrebuild.com

Thank you for supporting gentle, authentic content creation! 🌸
`;
}
