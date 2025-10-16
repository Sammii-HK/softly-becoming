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
  series: string,
  licenseType: string = 'commercial'
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
    
    const license = createLicenseText(packId, licenseType);
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

function createLicenseText(packId: string, licenseType: string = 'commercial'): string {
  const licenseDescriptions = {
    personal: {
      title: 'PERSONAL LICENCE',
      description: 'for your own use (phone, prints for self). no resale.',
      permissions: [
        '✅ personal social media accounts',
        '✅ personal prints and wallpapers', 
        '✅ personal inspiration and motivation'
      ],
      restrictions: [
        '❌ no commercial use',
        '❌ no client work',
        '❌ no resale or redistribution'
      ]
    },
    commercial: {
      title: 'COMMERCIAL LICENCE',
      description: 'for client or small business use, up to 5,000 uses.',
      permissions: [
        '✅ business social media and marketing',
        '✅ client work and projects',
        '✅ website and blog graphics',
        '✅ print products (up to 5,000 copies)',
        '✅ include in presentations and courses'
      ],
      restrictions: [
        '❌ cannot resell as standalone quote packs',
        '❌ cannot exceed 5,000 total usage limit',
        '❌ cannot sublicense to others'
      ]
    },
    extended: {
      title: 'EXTENDED LICENCE',
      description: 'unlimited commercial projects and resale rights.',
      permissions: [
        '✅ unlimited commercial usage',
        '✅ resale as part of physical products',
        '✅ include in digital courses and products',
        '✅ unlimited print runs and merchandise',
        '✅ apps, software, and digital platforms'
      ],
      restrictions: [
        '❌ cannot resell as standalone quote packs',
        '❌ cannot claim original authorship'
      ]
    }
  };

  const license = licenseDescriptions[licenseType as keyof typeof licenseDescriptions] || licenseDescriptions.commercial;

  return `
${license.title}

softly becoming digital image pack
product: ${packId}
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
