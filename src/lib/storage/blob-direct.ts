import { put } from '@vercel/blob';
import { generateQuotes } from '../generator/builder';

interface PackConfig {
  name: string;
  series: string;
  count: number;
  seed: number;
  theme?: string;
  format: 'square' | 'portrait' | 'both';
  price: number;
  description: string;
}

interface DirectUploadResult {
  success: boolean;
  packId: string;
  zipUrl?: string;
  previewUrl?: string;
  fileCount: number;
  error?: string;
  metadata?: any;
}

export async function generateAndUploadPack(
  config: PackConfig,
  version?: number
): Promise<DirectUploadResult> {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
    const versionSuffix = version ? `-v${version}` : `-${timestamp}`;
    const packId = `${config.name}${versionSuffix}`;
    
    console.log(`🎨 Generating "${packId}" directly to Vercel Blob...`);
    
    // Generate quotes
    const quotes = generateQuotes({ 
      count: config.count, 
      seed: config.seed,
      ...(config.theme && { themeBias: { [config.theme]: 2 } })
    });

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const JSZip = require('jszip');
    const zip = new JSZip();
    
    let previewImageBuffer: Buffer | null = null;
    let fileCount = 0;

    // Generate and add images directly to ZIP (no local storage)
    for (let i = 0; i < quotes.length; i++) {
      const quote = quotes[i];
      const text = encodeURIComponent(quote.lines.join('\n'));
      const safeTitle = quote.lines[0]
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .substring(0, 30)
        .trim()
        .replace(/\s+/g, '-');
      
      if (config.format === 'square' || config.format === 'both') {
        const squareUrl = `${BASE_URL}/api/og?text=${text}`;
        const imageBuffer = await downloadImageBuffer(squareUrl);
        
        if (imageBuffer) {
          const filename = `${String(i + 1).padStart(2, '0')}-${safeTitle}-square.png`;
          zip.file(filename, imageBuffer);
          
          // Use first image as preview
          if (!previewImageBuffer) previewImageBuffer = imageBuffer;
          fileCount++;
        }
      }
      
      if (config.format === 'portrait' || config.format === 'both') {
        const portraitUrl = `${BASE_URL}/api/og-portrait?text=${text}`;
        const imageBuffer = await downloadImageBuffer(portraitUrl);
        
        if (imageBuffer) {
          const filename = `${String(i + 1).padStart(2, '0')}-${safeTitle}-portrait.png`;
          zip.file(filename, imageBuffer);
          
          // Use first image as preview if we don't have one
          if (!previewImageBuffer) previewImageBuffer = imageBuffer;
          fileCount++;
        }
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Create metadata
    const metadata = {
      packId,
      packName: config.name,
      series: config.series,
      version: version || timestamp,
      generatedAt: new Date().toISOString(),
      totalImages: fileCount,
      seed: config.seed,
      theme: config.theme,
      format: config.format,
      description: config.description,
      // Pricing handled by Stripe license tiers
      quotes: quotes.map((q, i) => ({
        index: i + 1,
        theme: q.theme,
        tone: q.tone,
        structure: q.structure,
        text: q.lines.join('\n'),
        tags: q.tags
      }))
    };

    // Add metadata and license to ZIP
    zip.file('pack-info.json', JSON.stringify(metadata, null, 2));
    zip.file('LICENSE.txt', createLicenseText(packId));

    // Generate ZIP buffer
    console.log(`📦 Creating ZIP with ${fileCount} images...`);
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Upload ZIP to Vercel Blob
    console.log(`☁️ Uploading to Vercel Blob...`);
    const zipBlob = await put(`packs/${config.series}/${packId}.zip`, zipBuffer, {
      access: 'public',
      contentType: 'application/zip',
      addRandomSuffix: false
    });

    // Upload preview image separately
    let previewUrl = '';
    if (previewImageBuffer) {
      const previewBlob = await put(`previews/${config.series}/${packId}-preview.png`, previewImageBuffer, {
        access: 'public',
        contentType: 'image/png',
        addRandomSuffix: false
      });
      previewUrl = previewBlob.url;
    }

    console.log(`✅ Pack "${packId}" uploaded to Blob successfully!`);
    console.log(`📦 ZIP: ${zipBlob.url}`);
    console.log(`🖼️ Preview: ${previewUrl}`);

    return {
      success: true,
      packId,
      zipUrl: zipBlob.url,
      previewUrl,
      fileCount,
      metadata
    };

  } catch (error) {
    console.error(`❌ Direct upload failed:`, error);
    return {
      success: false,
      packId: config.name,
      fileCount: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function downloadImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Failed to download image: ${url}`, error);
    return null;
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

For questions: hello@softrebuild.com
Thank you for supporting gentle, authentic content! 🌸
`;
}
