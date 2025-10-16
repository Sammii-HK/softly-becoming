import { Resend } from 'resend';
import { LicenseTier } from '@/lib/pricing/getPrices';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendOrderEmailOptions {
  customerEmail: string;
  orderId: string;
  productTitle: string;
  licenseType: LicenseTier;
  downloadUrl: string;
  amount: number;
  currency: string;
}

/**
 * Send order confirmation and download email
 */
export async function sendOrderEmail({
  customerEmail,
  orderId,
  productTitle,
  licenseType,
  downloadUrl,
  amount,
  currency
}: SendOrderEmailOptions) {
  try {
    const currencySymbol = currency === 'GBP' ? '£' : '$';
    const formattedAmount = currency === 'GBP' 
      ? `${currencySymbol}${amount}`
      : `${currencySymbol}${amount.toFixed(2)}`;

    const subject = 'your softly becoming download';
    
    const htmlContent = generateHtmlEmail({
      productTitle,
      licenseType,
      downloadUrl,
      orderId,
      formattedAmount
    });

    const textContent = generateTextEmail({
      productTitle,
      licenseType,
      downloadUrl,
      orderId,
      formattedAmount
    });

    const result = await resend.emails.send({
      from: 'softly becoming <orders@softlybecoming.com>',
      to: customerEmail,
      subject,
      html: htmlContent,
      text: textContent,
      tags: [
        { name: 'type', value: 'order_confirmation' },
        { name: 'license', value: licenseType },
        { name: 'product', value: productTitle.toLowerCase().replace(/\s+/g, '_') }
      ]
    });

    return result;

  } catch (error) {
    console.error('Error sending order email:', error);
    throw new Error(`Failed to send order email: ${error}`);
  }
}

/**
 * Generate HTML email content
 */
function generateHtmlEmail({
  productTitle,
  licenseType,
  downloadUrl,
  orderId,
  formattedAmount
}: {
  productTitle: string;
  licenseType: LicenseTier;
  downloadUrl: string;
  orderId: string;
  formattedAmount: string;
}): string {
  const licenseDescription = {
    personal: 'for your own use (phone, prints for self). no resale.',
    commercial: 'for client or small business use, up to 5,000 uses.',
    extended: 'unlimited commercial projects and resale rights.'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>your softly becoming download</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #3a3a3a; max-width: 600px; margin: 0 auto; padding: 20px; background: #faf9f7; }
    .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .title { font-size: 28px; font-weight: 300; margin: 0 0 10px 0; }
    .subtitle { color: #666; font-size: 16px; margin: 0; }
    .download-section { background: #f8f8f8; padding: 25px; border-radius: 6px; margin: 25px 0; text-align: center; }
    .download-button { display: inline-block; background: #3a3a3a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: 500; }
    .order-details { background: #faf9f7; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .licence-info { border-left: 3px solid #3a3a3a; padding-left: 15px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
    .upgrade-cta { background: #f0f0f0; padding: 20px; border-radius: 6px; margin: 25px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">thank you 🤍</h1>
      <p class="subtitle">your download is ready</p>
    </div>

    <div class="download-section">
      <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 400;">${productTitle}</h2>
      <p style="margin: 0 0 20px 0; color: #666;">click below to download your images</p>
      <a href="${downloadUrl}" class="download-button">download your pack</a>
    </div>

    <div class="order-details">
      <h3 style="margin: 0 0 15px 0; font-size: 16px;">order details</h3>
      <div class="detail-row">
        <span>order number:</span>
        <span>${orderId}</span>
      </div>
      <div class="detail-row">
        <span>licence:</span>
        <span>${licenseType}</span>
      </div>
      <div class="detail-row">
        <span>amount paid:</span>
        <span>${formattedAmount}</span>
      </div>
    </div>

      <div class="licence-info">
        <h3 style="margin: 0 0 10px 0; font-size: 16px;">your ${licenseType} licence</h3>
        <p style="margin: 0; color: #666;">${licenseDescription[licenseType]}</p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #888;">licence agreement included in your download</p>
      </div>

    ${licenseType !== 'extended' ? `
    <div class="upgrade-cta">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">need broader rights later?</h3>
      <p style="margin: 0 0 15px 0; color: #666;">you can upgrade your licence any time with the difference only.</p>
      <p style="margin: 0; font-size: 14px;"><a href="mailto:orders@softlybecoming.com?subject=Upgrade%20License%20${orderId}" style="color: #3a3a3a;">reply to this email to upgrade</a></p>
    </div>
    ` : ''}

    <div class="footer">
      <p>this download is for the ${licenseType} licence you selected at checkout.<br>
      keep this email for your records.</p>
      <p style="margin-top: 20px;">
        <a href="${downloadUrl}" style="color: #3a3a3a;">download again</a> • 
        <a href="mailto:orders@softlybecoming.com" style="color: #3a3a3a;">support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email content
 */
function generateTextEmail({
  productTitle,
  licenseType,
  downloadUrl,
  orderId,
  formattedAmount
}: {
  productTitle: string;
  licenseType: LicenseTier;
  downloadUrl: string;
  orderId: string;
  formattedAmount: string;
}): string {
  const licenseDescription = {
    personal: 'for your own use (phone, prints for self). no resale.',
    commercial: 'for client or small business use, up to 5,000 uses.',
    extended: 'unlimited commercial projects and resale rights.'
  };

  return `
thank you 🤍

your softly becoming download is ready.

${productTitle}
${licenseType} licence - ${licenseDescription[licenseType]}

DOWNLOAD YOUR PACK:
${downloadUrl}

ORDER DETAILS:
order number: ${orderId}
licence: ${licenseType}
amount paid: ${formattedAmount}

${licenseType !== 'extended' ? `
UPGRADE LATER:
need broader rights? you can upgrade your licence any time with the difference only.
reply to this email to upgrade.
` : ''}

---

this download is for the ${licenseType} licence you selected at checkout.
keep this email for your records. if you need to upgrade later, reply to this message.

© softly becoming. all rights reserved.
  `.trim();
}

/**
 * Send upgrade confirmation email
 */
export async function sendUpgradeEmail({
  customerEmail,
  orderId,
  productTitle,
  oldLicense,
  newLicense,
  downloadUrl,
  upgradeAmount,
  currency
}: {
  customerEmail: string;
  orderId: string;
  productTitle: string;
  oldLicense: LicenseTier;
  newLicense: LicenseTier;
  downloadUrl: string;
  upgradeAmount: number;
  currency: string;
}) {
  try {
    const currencySymbol = currency === 'GBP' ? '£' : '$';
    const formattedAmount = currency === 'GBP' 
      ? `${currencySymbol}${upgradeAmount}`
      : `${currencySymbol}${upgradeAmount.toFixed(2)}`;

    const result = await resend.emails.send({
      from: 'softly becoming <orders@softlybecoming.com>',
      to: customerEmail,
      subject: 'licence upgraded - new download ready',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>licence upgraded 🤍</h1>
          <p>your ${productTitle} licence has been upgraded from ${oldLicense} to ${newLicense}.</p>
          
          <div style="background: #f8f8f8; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <a href="${downloadUrl}" style="display: inline-block; background: #3a3a3a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px;">download updated pack</a>
          </div>
          
          <p><strong>upgrade fee:</strong> ${formattedAmount}<br>
          <strong>order:</strong> ${orderId}</p>
          
          <p>your new download includes the updated licence file. keep this email for your records.</p>
        </div>
      `,
      text: `
licence upgraded 🤍

your ${productTitle} licence has been upgraded from ${oldLicense} to ${newLicense}.

download updated pack: ${downloadUrl}

upgrade fee: ${formattedAmount}
order: ${orderId}

your new download includes the updated licence file. keep this email for your records.
      `.trim()
    });

    return result;

  } catch (error) {
    console.error('Error sending upgrade email:', error);
    throw new Error(`Failed to send upgrade email: ${error}`);
  }
}
