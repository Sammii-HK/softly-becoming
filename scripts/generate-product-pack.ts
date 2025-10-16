#!/usr/bin/env tsx

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { generateQuotes } from '../src/lib/generator/builder';
import { uploadPackToBlob } from '../src/lib/storage/blob';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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

async function downloadImage(url: string, filepath: string): Promise<void> {
  try {
    console.log(`Downloading: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    writeFileSync(filepath, Buffer.from(buffer));
    console.log(`✓ Saved: ${filepath}`);
  } catch (error) {
    console.error(`✗ Failed to download ${url}:`, error);
  }
}

async function generateProductPack(config: PackConfig, version?: number): Promise<void> {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
  const versionSuffix = version ? `-v${version}` : `-${timestamp}`;
  const packId = `${config.name}${versionSuffix}`;
  
  console.log(`\n🎨 Generating "${packId}" pack...`);
  
  // Create versioned output directory
  const seriesDir = join(process.cwd(), 'product-packs', config.series);
  const outputDir = join(seriesDir, packId);
  mkdirSync(outputDir, { recursive: true });
  
  // Generate quotes
  const quotes = generateQuotes({ 
    count: config.count, 
    seed: config.seed,
    // Add theme bias if specified
    ...(config.theme && { themeBias: { [config.theme]: 2 } })
  });
  
  console.log(`Generated ${quotes.length} quotes`);
  
  // Download images for each quote
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
      const squareFile = join(outputDir, `${String(i + 1).padStart(2, '0')}-${safeTitle}-square.png`);
      await downloadImage(squareUrl, squareFile);
    }
    
    if (config.format === 'portrait' || config.format === 'both') {
      const portraitUrl = `${BASE_URL}/api/og-portrait?text=${text}`;
      const portraitFile = join(outputDir, `${String(i + 1).padStart(2, '0')}-${safeTitle}-portrait.png`);
      await downloadImage(portraitUrl, portraitFile);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Create a metadata file
  const metadata: any = {
    packId,
    packName: config.name,
    series: config.series,
    version: version || timestamp,
    generatedAt: new Date().toISOString(),
    totalImages: quotes.length * (config.format === 'both' ? 2 : 1),
    seed: config.seed,
    theme: config.theme,
    format: config.format,
    price: config.price,
    description: config.description,
    quotes: quotes.map((q, i) => ({
      index: i + 1,
      theme: q.theme,
      tone: q.tone,
      structure: q.structure,
      text: q.lines.join('\n'),
      tags: q.tags
    }))
  };
  
  writeFileSync(
    join(outputDir, 'pack-info.json'), 
    JSON.stringify(metadata, null, 2)
  );
  
  console.log(`✅ Pack "${packId}" complete!`);
  console.log(`📁 Files saved to: ${outputDir}`);
  
  // Update series index
  await updateSeriesIndex(config.series, packId, metadata);
  
  // Upload to Vercel Blob if configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    console.log(`☁️ Uploading ${packId} to Vercel Blob...`);
    const uploadResult = await uploadPackToBlob(outputDir, packId, config.series);
    
    if (uploadResult.success) {
      // Update metadata with blob URLs
      metadata.blobZipUrl = uploadResult.zipUrl;
      metadata.blobPreviewUrl = uploadResult.previewUrl;
      metadata.uploadedToBlob = true;
      
      // Re-save metadata with blob info
      writeFileSync(
        join(outputDir, 'pack-info.json'), 
        JSON.stringify(metadata, null, 2)
      );
      
      console.log(`✅ Uploaded to Blob: ${uploadResult.zipUrl}`);
    } else {
      console.log(`⚠️ Blob upload failed: ${uploadResult.error}`);
    }
  }
  
  // Auto-create Stripe product if API key is available
  if (process.env.STRIPE_SECRET_KEY && process.env.ADMIN_TOKEN) {
    await createStripeProduct(packId, metadata, config);
  }

  // Clean up local files after upload (optional)
  if (process.env.CLEANUP_AFTER_UPLOAD === 'true' && metadata.uploadedToBlob) {
    console.log(`🧹 Cleaning up local files for ${packId}...`);
    const { rmSync } = require('fs');
    try {
      rmSync(outputDir, { recursive: true, force: true });
      console.log(`✅ Local files cleaned up`);
    } catch (error) {
      console.log(`⚠️ Cleanup failed: ${error}`);
    }
  }
}

// Competitive base pricing - optimized for volume sales!
const PACK_CONFIGS: PackConfig[] = [
  {
    name: 'soft-strength-collection',
    series: 'soft-strength',
    count: 25,
    seed: 12345,
    theme: 'soft_strength',
    format: 'both',
    price: 19, // Competitive base price (was $29)
    description: 'Beautiful quotes about finding strength in gentleness. Both square and portrait formats included.'
  },
  {
    name: 'rebuilding-journey',
    series: 'rebuilding',
    count: 20,
    seed: 54321,
    theme: 'rebuilding',
    format: 'square',
    price: 16, // Competitive base price (was $24)
    description: 'Inspiring quotes for women starting over and rebuilding their lives with intention.'
  },
  {
    name: 'self-trust-quotes',
    series: 'self-trust',
    count: 30,
    seed: 98765,
    theme: 'self_trust',
    format: 'portrait',
    price: 22, // Competitive base price (was $34)
    description: 'Powerful quotes about trusting yourself and your inner wisdom. Perfect for Instagram stories.'
  },
  {
    name: 'mixed-inspiration-pack',
    series: 'complete',
    count: 50,
    seed: 11111,
    format: 'both',
    price: 39, // Competitive base price (was $67)
    description: 'Our largest collection with all themes and formats. The ultimate digital quote library.'
  },
  {
    name: 'gentle-boundaries',
    series: 'boundaries',
    count: 20,
    seed: 22222,
    theme: 'letting_go',
    format: 'both',
    price: 18, // Competitive base price (was $27)
    description: 'Learn to set boundaries with kindness. Perfect for people-pleasers learning to say no.'
  },
  {
    name: 'morning-affirmations',
    series: 'daily-rituals',
    count: 15,
    seed: 33333,
    theme: 'becoming',
    format: 'square',
    price: 14, // Competitive base price (was $22)
    description: 'Start your day with gentle affirmations. Perfect for morning routines and self-care.'
  }
];

async function updateSeriesIndex(series: string, packId: string, metadata: any): Promise<void> {
  const seriesDir = join(process.cwd(), 'product-packs', series);
  const indexFile = join(seriesDir, 'series-index.json');
  
  let seriesData: any = {
    seriesName: series,
    packs: [],
    lastUpdated: new Date().toISOString()
  };
  
  try {
    const existing = require(indexFile);
    seriesData = existing;
  } catch (error) {
    // File doesn't exist, use defaults
  }
  
  // Add or update pack in series
  const existingIndex = seriesData.packs.findIndex((p: any) => p.packId === packId);
  const packSummary = {
    packId,
    packName: metadata.packName,
    version: metadata.version,
    generatedAt: metadata.generatedAt,
    totalImages: metadata.totalImages,
    price: metadata.price,
    description: metadata.description,
    previewImage: `${packId}/01-${metadata.quotes[0]?.text.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 30).trim().replace(/\s+/g, '-')}-${metadata.format === 'portrait' ? 'portrait' : 'square'}.png`
  };
  
  if (existingIndex >= 0) {
    seriesData.packs[existingIndex] = packSummary;
  } else {
    seriesData.packs.push(packSummary);
  }
  
  seriesData.lastUpdated = new Date().toISOString();
  
  writeFileSync(indexFile, JSON.stringify(seriesData, null, 2));
  console.log(`📋 Updated series index: ${series}`);
}

async function createStripeProduct(packId: string, metadata: any, config: PackConfig): Promise<void> {
  try {
    console.log(`🔄 Creating Stripe product for ${packId}...`);
    
    const previewImageUrl = `${BASE_URL}/product-packs/${config.series}/${packId}/01-${metadata.quotes[0]?.text.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 30).trim().replace(/\s+/g, '-')}-${metadata.format === 'portrait' ? 'portrait' : 'square'}.png`;
    
    const response = await fetch(`${BASE_URL}/api/stripe/create-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`
      },
      body: JSON.stringify({
        packId,
        packName: metadata.packName,
        description: metadata.description,
        price: metadata.price,
        totalImages: metadata.totalImages,
        series: metadata.series,
        previewImageUrl
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Stripe product created: ${result.stripePriceId}`);
      
      // Update metadata with Stripe IDs
      metadata.stripeProductId = result.product.id;
      metadata.stripePriceId = result.price.id;
      
      // Re-save metadata with Stripe info
      const outputDir = join(process.cwd(), 'product-packs', config.series, packId);
      writeFileSync(
        join(outputDir, 'pack-info.json'), 
        JSON.stringify(metadata, null, 2)
      );
    } else {
      const error = await response.json();
      console.log(`⚠️ Stripe product creation failed: ${error.error}`);
    }
  } catch (error) {
    console.log(`⚠️ Stripe product creation skipped: ${error}`);
  }
}

async function main() {
  const packName = process.argv[2];
  
  if (packName) {
    // Generate specific pack
    const config = PACK_CONFIGS.find(p => p.name === packName);
    if (!config) {
      console.error(`❌ Pack "${packName}" not found.`);
      console.log('\nAvailable packs:');
      PACK_CONFIGS.forEach(p => console.log(`  - ${p.name}`));
      process.exit(1);
    }
    
    await generateProductPack(config);
  } else {
    // Generate all packs
    console.log('🚀 Generating all product packs...\n');
    
    for (const config of PACK_CONFIGS) {
      await generateProductPack(config);
      // Delay between packs
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 All packs generated successfully!');
  }
}

// Handle errors gracefully
main().catch(error => {
  console.error('❌ Error generating packs:', error);
  process.exit(1);
});
