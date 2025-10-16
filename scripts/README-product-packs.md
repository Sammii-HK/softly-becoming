# Digital Product Pack Generator 🎨

Generate beautiful PNG collections of your quotes for selling as digital products!

## Quick Start

```bash
# Generate all predefined packs
npm run generate:packs

# Generate a specific pack
npm run generate:pack soft-strength-collection
```

## Available Packs

### 🌸 **Soft Strength Collection** (25 images)
- **Theme**: Soft strength quotes
- **Formats**: Both square (1080x1080) and portrait (1080x1920)
- **Perfect for**: Instagram posts and stories

### 🔄 **Rebuilding Journey** (20 images)
- **Theme**: Rebuilding and starting over
- **Format**: Square (1080x1080)
- **Perfect for**: Social media posts

### 💫 **Self Trust Quotes** (30 images)
- **Theme**: Self-trust and inner wisdom
- **Format**: Portrait (1080x1920)
- **Perfect for**: Instagram stories and Pinterest

### 🌈 **Mixed Inspiration Pack** (50 images)
- **Theme**: All themes mixed
- **Formats**: Both square and portrait
- **Perfect for**: Complete digital product offering

## Output Structure

Each pack creates:
```
product-packs/
└── pack-name/
    ├── 01-quote-title-square.png
    ├── 01-quote-title-portrait.png
    ├── 02-another-quote-square.png
    ├── ...
    └── pack-info.json (metadata)
```

## Features

✨ **20 Beautiful Pastel Colors** - Automatically rotates through gorgeous backgrounds
🎯 **Anti-Orphan Technology** - Prevents single words on lines
📐 **Perfect Typography** - Elegant serif font with optimal spacing
🎨 **Multiple Formats** - Square for posts, portrait for stories
📋 **Metadata Included** - JSON file with all quote details
🔢 **Organized Naming** - Sequential numbering with descriptive names

## Customization

Edit `scripts/generate-product-pack.ts` to:
- Add new pack configurations
- Change themes, counts, or formats
- Modify naming conventions
- Add new image sizes

## Digital Product Ideas

💰 **Etsy/Gumroad Products**:
- "50 Soft Strength Quote Graphics - Instagram Ready"
- "Self-Trust Affirmation Pack - Stories & Posts"
- "Rebuilding Journey Quote Collection - Social Media Kit"

📱 **Usage Rights**:
- Perfect for coaches, therapists, wellness brands
- Ready-to-post social media content
- High-resolution PNG files
- Commercial use friendly

## Technical Details

- **Resolution**: 1080x1080 (square), 1080x1920 (portrait)
- **Format**: PNG with transparency support
- **Colors**: 20 rotating pastel backgrounds
- **Typography**: Optimized for readability
- **File sizes**: ~200-500KB each (perfect for digital delivery)

---

*Generated with love by the Soft Rebuild quote system* 🌸
