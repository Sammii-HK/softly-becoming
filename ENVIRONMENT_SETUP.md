# Production Environment Setup - Stripe-First Architecture

This document outlines the production-ready setup for the tiered pricing and licensing system, leveraging Stripe's native capabilities for security and reliability.

## Required Environment Variables

### Stripe Configuration (CRITICAL)
```bash
STRIPE_SECRET_KEY=sk_live_...  # Your LIVE Stripe secret key (test: sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook endpoint secret from Stripe Dashboard
```

### Email Delivery
```bash
RESEND_API_KEY=re_...  # Your Resend API key for transactional emails
```

### Application Configuration
```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com  # Your production domain
SITE_CURRENCY=GBP  # Default currency: 'GBP' or 'USD' (Stripe handles conversion)
DATABASE_URL=file:./dev.db  # SQLite for development, PostgreSQL for production
```

## Stripe Setup (Production-Ready)

### 1. Webhook Configuration
In your Stripe Dashboard → Webhooks:

- **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
- **Events to send** (Complete Newsletter + Digital Products):
  - `checkout.session.completed` (both subscriptions and product purchases)
  - `customer.subscription.created` (new paid newsletter subscribers)
  - `customer.subscription.updated` (plan changes, status updates)
  - `customer.subscription.deleted` (cancellations - downgrade to free)
  - `invoice.payment_failed` (failed subscription payments)
  - `charge.refunded` (handle refunds for both subscriptions and products)
- **Copy the webhook secret** → `STRIPE_WEBHOOK_SECRET`

### 2. Security Features Enabled
- ✅ **Signature verification** - All webhooks are cryptographically verified
- ✅ **Idempotency** - Duplicate webhooks are handled safely
- ✅ **Amount validation** - Stripe guarantees payment amounts
- ✅ **Currency handling** - Stripe manages all currency conversion
- ✅ **PCI compliance** - No sensitive payment data touches your servers

### 3. Why Stripe-First Architecture?
- **Security**: Stripe handles PCI compliance, fraud detection, and payment processing
- **Reliability**: Built-in retry logic, webhook validation, and error handling
- **Scalability**: Automatic currency conversion and international payment support
- **Compliance**: SOC 2, PCI DSS Level 1 certified infrastructure

## Resend Email Setup

1. **Create a Resend account** at https://resend.com
2. **Add your domain** and verify DNS settings
3. **Generate an API key** and add it as `RESEND_API_KEY`
4. **Update the email sender** in `src/lib/fulfilment/sendEmail.ts`:
   ```typescript
   from: 'softly becoming <orders@yourdomain.com>'
   ```

## Database Migration

After setting up environment variables, run the database migration:

```bash
pnpm db:migrate
```

This will create the new `Order` table for tracking purchases and fulfillment.

## Testing the System

### Test Pricing Function (Stripe-Based)
```bash
node -e "
const { getBasePriceInCents, formatPriceFromCents } = require('./src/lib/pricing/getPrices.ts');
console.log('24 images, commercial:', getBasePriceInCents(24, 'commercial'), 'pence');
console.log('Formatted:', formatPriceFromCents(getBasePriceInCents(24, 'commercial'), 'GBP'));
"
```

### Test Stripe Integration
```bash
# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

### Test Product Data
```bash
node -e "
const { getAllProducts } = require('./src/lib/products/getProduct.ts');
console.log('Products:', getAllProducts().map(p => ({ id: p.id, images: p.imageCount })));
"
```

## Vercel Blob Storage Setup

Your products are stored in Vercel Blob with this structure:
```
Vercel Blob:
├── packs/
│   ├── strength/soft-strength-collection.zip
│   ├── transformation/rebuilding-journey.zip
│   └── trust/self-trust-quotes.zip
└── previews/
    ├── strength/soft-strength-collection-preview.png
    └── [other-previews...]
```

### Upload Products to Blob
Use your existing admin endpoint:
```bash
POST /api/upload/pack-to-blob
{
  "packId": "soft-strength-collection",
  "series": "strength"
}
```

### Blob Environment Variables
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_...  # From Vercel Dashboard
```

## File Permissions (Minimal)

Only need write access to:
- `prisma/dev.db` (for database writes)

**No local file storage needed** - everything uses Vercel Blob!

## Production Security Checklist

### Stripe Security (Handled Automatically)
- ✅ **PCI DSS Compliance**: Stripe is PCI Level 1 certified
- ✅ **Webhook Signatures**: All webhooks are cryptographically signed
- ✅ **Payment Validation**: Stripe validates all payment amounts and currencies
- ✅ **Fraud Detection**: Built-in machine learning fraud prevention
- ✅ **3D Secure**: Automatic SCA compliance for European payments

### Application Security
- ✅ **Environment Variables**: Never commit secrets to version control
- ✅ **Database Validation**: All inputs validated before database operations
- ✅ **File System Security**: Atomic file operations with cleanup
- ✅ **Email Validation**: Multiple layers of email format validation
- ✅ **Error Handling**: Comprehensive error logging without exposing internals

### Production Deployment
- Use `STRIPE_SECRET_KEY` with `sk_live_` prefix for production
- Enable webhook signature verification in Stripe Dashboard
- Set up monitoring for failed webhook deliveries
- Configure log aggregation for error tracking
- Implement proper backup strategy for order data

## Troubleshooting

### Common Issues

1. **Webhook verification fails**: Ensure `STRIPE_WEBHOOK_SECRET` matches your Stripe dashboard
2. **Email sending fails**: Verify Resend API key and domain configuration  
3. **Product not found errors**: Check product data in `content/products/index.json`
4. **Blob download fails**: Verify `BLOB_READ_WRITE_TOKEN` and check Vercel Blob dashboard
5. **License not updating**: Ensure Stripe session includes correct `license` metadata

### Debug Mode

Set `NODE_ENV=development` to enable additional logging in webhook handlers and blob operations.

### Blob Storage Benefits
- ✅ **Global CDN**: Fast downloads worldwide via Vercel Edge Network
- ✅ **Automatic scaling**: No server resource limits
- ✅ **License injection**: Dynamic license files per purchase
- ✅ **Secure access**: Stripe session verification required
- ✅ **Analytics**: Download tracking with customer info
