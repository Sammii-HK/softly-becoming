#!/usr/bin/env tsx

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { generateQuotes } from '../src/lib/generator/builder';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface PackConfig {
  name: string;
  count: number;
  seed: number;
  theme?: string;
  format: 'square' | 'portrait' | 'both';
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

async function generateProductPack(config: PackConfig): Promise<void> {
  console.log(`\n🎨 Generating "${config.name}" pack...`);
  
  // Create output directory
  const outputDir = join(process.cwd(), 'product-packs', config.name);
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
  const metadata = {
    packName: config.name,
    generatedAt: new Date().toISOString(),
    totalImages: quotes.length * (config.format === 'both' ? 2 : 1),
    seed: config.seed,
    theme: config.theme,
    format: config.format,
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
  
  console.log(`✅ Pack "${config.name}" complete!`);
  console.log(`📁 Files saved to: ${outputDir}`);
}

// Predefined pack configurations
const PACK_CONFIGS: PackConfig[] = [
  {
    name: 'soft-strength-collection',
    count: 25,
    seed: 12345,
    theme: 'soft_strength',
    format: 'both'
  },
  {
    name: 'rebuilding-journey',
    count: 20,
    seed: 54321,
    theme: 'rebuilding',
    format: 'square'
  },
  {
    name: 'self-trust-quotes',
    count: 30,
    seed: 98765,
    theme: 'self_trust',
    format: 'portrait'
  },
  {
    name: 'mixed-inspiration-pack',
    count: 50,
    seed: 11111,
    format: 'both'
  }
];

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
