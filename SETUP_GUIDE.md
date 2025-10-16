# Soft Rebuild - Complete Setup Guide

## 🌿 Project Overview
Fully automated content system for Instagram + email newsletter with paid tier. Generates quotes, creates images, posts to Instagram, sends emails, and manages paid subscriptions - all hands-off.

## 📋 Environment Variables Needed

Create `.env.local` with these variables:

```bash
# Base Configuration
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Email System (Resend)
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM=soft@rebuilddaily.co

# Instagram Posting (Ayrshare)
AYRSHARE_API_KEY=your_ayr_key
AYRSHARE_PROFILE=yourInstagramHandle

# Paid Subscriptions (Stripe)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx

# Redis for De-duplication & Analytics
REDIS_URL=rediss://:password@upstash-url:port
REDIS_PREFIX=softrebuild

# Security Tokens
CRON_SHARED_SECRET=superlongrandomstring123
MANUAL_BULK_TOKEN=anotherlongrandomtoken456
ADMIN_TOKEN=youradmintoken789
```

## 🔧 Services to Set Up

### 1. Database (PostgreSQL)
- **Recommended**: Vercel Postgres or Supabase
- **Setup**: Create database, copy connection string to `DATABASE_URL`

### 2. Email Service (Resend)
- **Sign up**: https://resend.com
- **Plan**: Free tier (3k emails/month)
- **Setup**: Create API key, verify domain for `EMAIL_FROM`

### 3. Instagram Posting (Ayrshare)
- **Sign up**: https://www.ayrshare.com
- **Plan**: Starter plan (~$20/month for Instagram posting)
- **Setup**: Connect Instagram account, get API key

### 4. Payments (Stripe)
- **Sign up**: https://stripe.com
- **Setup**: 
  - Create product for "Sunday Letter" subscription
  - Set price (suggested: £6/month or £60/year)
  - Copy price ID to `STRIPE_PRICE_ID`
  - Set up webhooks endpoint: `https://your-app.vercel.app/api/webhooks/stripe`

### 5. Redis (Upstash)
- **Sign up**: https://upstash.com
- **Plan**: Free tier sufficient to start
- **Setup**: Create Redis database, copy connection string

### 6. Font File
- Download a serif font (suggested: Playfair Display)
- Save as `public/fonts/PlayfairDisplay-Regular.ttf`

## 📦 Installation Steps

```bash
# 1. Create Next.js project
pnpm create next-app soft-rebuild --ts --eslint --tailwind --app
cd soft-rebuild

# 2. Install dependencies
pnpm add prisma @prisma/client resend stripe slugify zod ioredis dayjs @vercel/og canvas nanoid

# 3. Initialize Prisma
pnpm prisma init

# 4. Set up database schema (copy from build files)
pnpm prisma migrate dev -n "initial_setup"

# 5. Generate Prisma client
pnpm prisma generate
```

## 🚀 Deployment Steps

1. **Deploy to Vercel**
   - Connect GitHub repo to Vercel
   - Add all environment variables in Vercel dashboard
   - Deploy

2. **Set up Stripe Webhooks**
   - In Stripe dashboard, add webhook endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.deleted`

3. **Set up Resend Webhooks**
   - In Resend dashboard, add webhook: `https://your-app.vercel.app/api/webhooks/resend`
   - Select events: `email.delivered`, `email.opened`, `email.clicked`

4. **Test the System**
   - Visit `/api/generate?count=5` to test quote generation
   - Visit `/api/og?text=test` to test image generation
   - Visit `/inbox` to test subscription form
   - Visit `/admin/letters` to test admin interface

## 🔄 How It Works Daily

### Automated Flow (No Manual Work)
1. **08:00 UTC**: Cron dispatcher runs
   - Posts 3 Instagram quotes (morning/afternoon/evening)
   - Sends daily free email to subscribers
   - On Sundays: sends paid letter to premium subscribers
   - On Mondays: generates 4 weeks of new letter backlog

### Content Generation
- **Quotes**: 5,800+ unique combinations from curated fragments
- **Letters**: Auto-generated from quote lines using templating system
- **Images**: Generated on-demand, no storage needed
- **No Repeats**: Redis-backed deduplication across all content

### Revenue Streams
- **Paid Subscriptions**: £6/month for Sunday letters
- **Sponsorships**: £200-1k/week for brand partnerships
- **Digital Products**: PDF journals, wallpaper packs
- **Affiliate Links**: Books, courses (disclosed)

## 📊 Expected Growth Timeline

### Month 1-3: Foundation
- Build to 1k free subscribers
- Launch paid tier
- 50-100 paid subscribers
- Revenue: £300-600/month

### Month 4-6: Growth
- Scale to 3-5k free subscribers  
- 200-300 paid subscribers
- Add sponsorship slots
- Revenue: £1,500-3,000/month

### Month 7-12: Scale
- 5-10k free subscribers
- 500+ paid subscribers
- Regular sponsorships
- Digital product launches
- Revenue: £3,000-6,000/month

## 🎯 Success Metrics to Track

- **Growth**: New subscribers/day, conversion rate free→paid
- **Engagement**: Email open rates, Instagram engagement
- **Revenue**: MRR, customer lifetime value
- **Content**: Quote uniqueness, letter feedback
- **Technical**: System uptime, delivery rates

## 🛠 Manual Tasks (Minimal)

### Weekly (5 minutes)
- Check `/admin/metrics` for performance
- Review upcoming letters in `/admin/letters`
- Optional: adjust themes or scheduling

### Monthly (15 minutes)
- Review revenue in Stripe dashboard
- Check subscriber growth trends
- Plan any seasonal content themes

### As Needed
- Respond to subscriber emails
- Create occasional bonus content
- Update fragment pools (quarterly)

## 🔒 Security Notes

- All admin endpoints require token authentication
- Webhook endpoints validate signatures
- Rate limiting on public forms
- No sensitive data in logs
- Regular security updates via Dependabot

## 📈 Scaling Options

When you hit limits:
- **Resend**: Upgrade for more email volume
- **Ayrshare**: Add more social platforms
- **Vercel**: Pro plan for more cron jobs
- **Database**: Scale PostgreSQL instance
- **Redis**: Upgrade for more storage

---

This system is designed to run itself. Once deployed, you'll have a professional content operation that generates revenue while you focus on strategy and growth.
