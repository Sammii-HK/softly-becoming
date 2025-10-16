# Softly Becoming - Digital Wellness Platform

A modern, full-stack digital wellness platform combining newsletter automation, social media management, and digital product sales. Built with Next.js 15, deployed on Vercel's edge infrastructure.

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Vercel Edge Functions, Node.js runtime for database operations
- **Database**: Turso (libSQL/SQLite) - edge-optimized, globally distributed
- **File Storage**: Vercel Blob - secure, CDN-backed file delivery
- **Authentication**: JWT-based magic links (passwordless)
- **Payments**: Stripe (subscriptions + one-time payments)
- **Email**: Resend API with domain authentication
- **Social Media**: Succulent Social API (4 platforms)
- **Image Generation**: Vercel OG with custom color palette system

### Deployment
- **Platform**: Vercel (edge functions, static hosting, blob storage)
- **Database**: Turso edge database (free tier: 500MB, 1B reads/month)
- **CDN**: Vercel Edge Network (global distribution)
- **Monitoring**: Built-in Vercel observability + custom logging

## 🎯 Business Model

### Revenue Streams
1. **Digital Products**: Quote graphic collections ($14-39, tiered licensing)
2. **Newsletter Subscriptions**: Free tier + paid premium content
3. **Social Media Automation**: 4-platform posting (Instagram, X, Pinterest, Bluesky)

### Product Generation Pipeline
- **Quote Engine**: Algorithmic generation with theme/tone controls
- **Image Rendering**: Dynamic OG images with 30+ color palettes
- **Pack Creation**: Automated ZIP packaging with licensing
- **Stripe Integration**: Auto-creation of products and pricing tiers

## 🔧 System Components

### Core Services

#### Newsletter System
```
/api/email/daily          # Automated daily email dispatch
/api/subscribe            # Subscriber management
/api/letters/*            # Newsletter content management
```

#### Digital Products
```
/api/generate/pack-direct # Direct-to-blob pack generation
/api/shop/products        # Dynamic product catalog
/api/checkout/*           # Multi-tier licensing checkout
/api/download/blob/*      # Secure file delivery
```

#### Social Media Automation
```
/api/cron/dispatcher      # Daily posting orchestration
/api/cron/morning|afternoon|evening  # Time-based content
/lib/runner/post-one      # Single post generation & publishing
```

#### Authentication & Billing
```
/api/auth/*               # Magic link authentication
/api/billing/*            # Stripe subscription management
/api/webhooks/stripe      # Payment event processing
```

### Image Generation Engine

#### Dynamic OG Images (`/api/og`, `/api/og-portrait`)
- **Color System**: 30 accessibility-compliant color combinations
- **Typography**: Crimson Text font with fallback to system serif
- **Layout**: Left-aligned text with colored emphasis on final line
- **Error Handling**: Graceful fallbacks for 100% reliability
- **Caching**: Client-side caching to minimize server load

#### Brand Assets (`/api/logo`)
- **Multi-format**: Square, Twitter, Facebook, Instagram, LinkedIn
- **Daily Quotes**: Inspirational quotes on banner formats
- **Consistent Branding**: Subtle "softly becoming" attribution

### Data Models

```typescript
// Core entities
Subscriber {
  email, name, status, tier, stripeId
  emailEvents: EmailEvent[]
}

EmailEvent {
  type: "delivered" | "opened" | "clicked"
  subscriber, messageId, timestamp, metadata
}

Letter {
  subject, theme, lineToKeep, bodyHtml, bodyText
  status: "DRAFT" | "SCHEDULED" | "SENT"
  sendAt, createdAt
}
```

## 🚀 Deployment Architecture

### Edge-First Design
- **Functions**: Vercel Edge Runtime where possible
- **Database**: Turso edge replicas (sub-10ms queries globally)
- **Storage**: Vercel Blob with global CDN
- **Caching**: Aggressive client-side caching for OG images

### Scalability Considerations
- **Serverless**: Auto-scaling to zero, pay-per-request
- **Edge Distribution**: Global performance optimization
- **Blob Storage**: Unlimited file storage with CDN
- **Database**: Automatic read replicas across regions

### Security Implementation
- **Authentication**: Signed JWT tokens with expiration
- **File Access**: Time-limited, signed download URLs
- **Payment Processing**: PCI-compliant via Stripe
- **Webhook Verification**: Cryptographic signature validation
- **Environment Isolation**: Strict secret management

## 🔄 Automation Workflows

### Daily Content Pipeline
1. **Cron Dispatcher** (08:00 UTC) triggers:
   - 3x social posts (morning/afternoon/evening)
   - Daily email to free subscribers
   - Weekly paid letter delivery (Sundays)
   - Content backlog management (Mondays)

2. **Content Generation**:
   - Algorithmic quote generation with quality guards
   - Dynamic image creation with color rotation
   - Duplicate prevention via Redis-style tracking
   - Multi-platform formatting optimization

### Product Creation Workflow
1. **Admin generates pack** (`/admin/packs`)
2. **Images created** → Direct upload to Vercel Blob
3. **Stripe products** → Auto-creation with 3-tier pricing
4. **Shop updates** → Dynamic catalog refresh
5. **Ready for sale** → Immediate availability

### Purchase Fulfillment
1. **Customer checkout** → Stripe processes payment
2. **Webhook triggered** → Validates payment and license tier
3. **Download generated** → Secure, time-limited blob URL
4. **Email delivery** → Professional confirmation with license
5. **Access expires** → 24-hour download window

## 📊 Performance Optimizations

### Frontend
- **Static Generation**: Pre-rendered pages where possible
- **Image Optimization**: Next.js automatic optimization
- **Code Splitting**: Automatic bundle optimization
- **Client Caching**: Strategic caching for dynamic content

### Backend
- **Edge Functions**: Sub-100ms response times globally
- **Database Queries**: Optimized with proper indexing
- **File Delivery**: CDN-cached with edge distribution
- **Rate Limiting**: Built-in Vercel protection

### Cost Optimization
- **Turso Free Tier**: 500MB storage, 1B reads/month
- **Vercel Blob**: $0.15/GB storage + bandwidth
- **Stripe**: 2.9% + 30¢ per transaction
- **Resend**: 3,000 emails/month free

## 🛠️ Development Workflow

### Local Development
```bash
npm run dev                    # Start development server
npm run generate:packs         # Create product packs locally
npm run db:migrate            # Run database migrations
npm run db:studio             # Open Prisma Studio
```

### Production Deployment
```bash
git push                       # Automatic Vercel deployment
npm run build                  # Verify production build
/admin/packs                   # Generate products via UI
/admin/stripe                  # Sync Stripe products
```

### Testing & Debugging
```bash
/test/succulent               # Social media integration test
/test/email                   # Email delivery test
/admin/metrics                # Subscriber analytics
```

## 🔐 Security Architecture

### Authentication Flow
1. **Magic Link Request** → Email validation + JWT generation
2. **Token Verification** → Cryptographic signature validation
3. **Session Management** → 24-hour session tokens
4. **Account Access** → Stripe customer portal integration

### Payment Security
- **PCI Compliance**: Stripe handles all payment data
- **Webhook Validation**: HMAC signature verification
- **Amount Verification**: Server-side payment validation
- **Fraud Prevention**: Stripe's ML-based fraud detection

### File Security
- **No Public Access**: Files stored in private Vercel Blob
- **Signed URLs**: Time-limited, cryptographically signed
- **License Enforcement**: Appropriate licensing per purchase tier
- **Audit Trail**: Complete download logging

## 📈 Monitoring & Analytics

### Business Metrics
- **Subscriber Growth**: Free vs paid tier conversion
- **Email Engagement**: Open rates, click tracking
- **Product Sales**: Revenue by collection and license tier
- **Social Media**: Post performance across 4 platforms

### Technical Metrics
- **Function Performance**: Response times, error rates
- **Database Health**: Query performance, connection pooling
- **Blob Usage**: Storage consumption, bandwidth costs
- **Build Performance**: Deploy times, bundle sizes

## 🎨 Brand & Content System

### Visual Identity
- **Color Palette**: 30 accessibility-compliant combinations
- **Typography**: Crimson Text serif with system fallbacks
- **Brand Colors**: Lavender heather (#A78BFA) primary accent
- **Layout**: Left-aligned, editorial-style typography

### Content Strategy
- **Tone**: Gentle, supportive, authentic
- **Themes**: Soft strength, rebuilding, self-trust, boundaries
- **Frequency**: Daily social posts, weekly premium content
- **Quality**: AI-powered content guards for appropriateness

## 🚀 Scaling Considerations

### Immediate Scale (0-1K users)
- **Current Architecture**: Handles easily on free tiers
- **Cost**: ~$0-20/month (Vercel Pro if needed)
- **Performance**: Sub-100ms globally

### Growth Scale (1K-10K users)
- **Database**: Turso paid tier ($29/month)
- **Blob Storage**: ~$50-100/month depending on downloads
- **Email**: Resend paid tiers ($20+/month)

### Enterprise Scale (10K+ users)
- **Multi-region**: Database replicas in multiple regions
- **CDN Optimization**: Advanced caching strategies
- **Monitoring**: Comprehensive observability stack
- **Team Access**: Role-based admin permissions

---

## 🛡️ Production Readiness

✅ **Security**: PCI-compliant payments, signed file access, JWT authentication  
✅ **Performance**: Edge-optimized, globally distributed, sub-100ms responses  
✅ **Reliability**: Graceful error handling, multiple fallback layers  
✅ **Scalability**: Serverless architecture, automatic scaling  
✅ **Monitoring**: Comprehensive logging and error tracking  
✅ **Cost-Effective**: Free tier friendly, scales with revenue  

**Status: Production Ready** 🎯

---

*Built with care for women rebuilding softly. Every technical decision optimized for gentle, authentic user experiences.*