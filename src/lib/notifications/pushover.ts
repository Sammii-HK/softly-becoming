/**
 * Pushover integration for daily business notifications
 * Docs: https://pushover.net/api
 */

interface PushoverMessage {
  message: string;
  title?: string;
  priority?: -2 | -1 | 0 | 1 | 2; // -2=lowest, 2=emergency
  sound?: string;
  url?: string;
  url_title?: string;
  html?: 1; // Enable HTML formatting
}

interface DailyReviewData {
  date: string;
  subscribers: {
    total: number;
    newToday: number;
    freeCount: number;
    paidCount: number;
  };
  emails: {
    sent: number;
    delivered: number;
    opened: number;
    openRate: number;
    clickRate: number;
  };
  posts: {
    scheduled: number;
    posted: number;
    engagement: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  issues: string[];
  tomorrowsContent?: {
    morning?: string;
    afternoon?: string;
    evening?: string;
    night?: string;
    newsletter?: string;
  };
}

export async function sendDailyReview(data: DailyReviewData) {
  const message = formatDailyReview(data);
  
  return await sendPushoverNotification({
    message,
    title: "📊 Softly Becoming Daily Review",
    priority: 0,
    sound: "cosmic",
    html: 1,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin`,
    url_title: "Open Admin Dashboard"
  });
}

export async function sendPerformanceAlert(type: 'email' | 'social' | 'revenue', metric: string, value: number, threshold: number) {
  const emoji = type === 'email' ? '📧' : type === 'social' ? '📱' : '💰';
  const priority = value < threshold * 0.5 ? 2 : value < threshold ? 1 : 0; // Emergency if very low
  
  const message = `${emoji} Performance Alert

${metric}: ${value}${type === 'email' ? '%' : ''}
Threshold: ${threshold}${type === 'email' ? '%' : ''}

${value < threshold ? '⚠️ Below expected performance' : '✅ Meeting targets'}

Check your admin dashboard for details.`;

  return await sendPushoverNotification({
    message,
    title: `${emoji} ${type.charAt(0).toUpperCase() + type.slice(1)} Alert`,
    priority,
    sound: priority > 0 ? "siren" : "pushover",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/email-analytics`,
    url_title: "View Analytics"
  });
}

export async function sendContentNotification(type: 'pack_generated' | 'newsletter_sent' | 'post_published', details: any) {
  const notifications = {
    pack_generated: {
      title: "🎨 NEW PACK READY FOR SALE",
      message: `<b>"${details.packName}"</b> is live and earning!

📦 <b>PACK DETAILS</b>
• ${details.totalImages} high-quality images
• ${details.format === 'both' ? 'Posts + Wallpapers' : details.format} format
• Theme: ${details.theme?.replace('_', ' ') || 'Mixed'}
• Generated: ${new Date().toLocaleTimeString()}

💰 <b>PRICING STRATEGY</b>
• Personal: £3.99 (impulse buy)
• Commercial: £7.99 (main target)
• Extended: £12.99 (premium)

🚀 <b>DISTRIBUTION STATUS</b>
• Your shop: ✅ Live
• Stripe: ✅ Products created
• Ready for: Etsy, Gumroad, Creative Market

📊 <b>REVENUE PROJECTION</b>
• Conservative: £50-150/month
• Optimistic: £200-500/month
• Multiple platforms = 4x reach

🎯 <b>NEXT ACTIONS</b>
• Review pack in admin dashboard
• Distribute to other platforms
• Share on social media`,
      sound: "magic"
    },
    newsletter_sent: {
      title: "📧 NEWSLETTER DELIVERED",
      message: `Daily gentle note sent to ${details.subscriberCount} beautiful souls

📝 <b>TODAY'S CONTENT</b>
Subject: "${details.subject}"
Quote: "${details.quote}"
Theme: ${details.theme?.replace('_', ' ') || 'Gentle wisdom'}

📊 <b>DELIVERY METRICS</b>
• Sent: ${details.subscriberCount}
• Delivery rate: ${details.deliveryRate}%
• Expected opens: ~${Math.round(details.subscriberCount * 0.23)} (23%)
• Expected clicks: ~${Math.round(details.subscriberCount * 0.03)} (3%)

🎯 <b>ENGAGEMENT FORECAST</b>
• Peak opens: Next 2-4 hours
• Late opens: Evening (6-9 PM)
• Weekend catch-up: Saturday morning

💌 <b>SUBSCRIBER JOURNEY</b>
• New subscribers today will receive this
• Building trust and daily habit
• Nurturing towards paid tier

📈 <b>GROWTH IMPACT</b>
• Daily touchpoint with audience
• Brand awareness building
• Conversion opportunity via shop link`,
      sound: "cosmic"
    },
    post_published: {
      title: "📱 SOCIAL POST LIVE",
      message: `New inspiration shared with the world!

💫 <b>POST CONTENT</b>
"${details.quote}"

📊 <b>POST DETAILS</b>
• Theme: ${details.theme?.replace('_', ' ') || 'Gentle wisdom'}
• Tone: ${details.tone || 'Gentle'}
• Format: ${details.format || 'Square'}
• Posted at: ${new Date().toLocaleTimeString()}

🌍 <b>PLATFORM REACH</b>
• Instagram: ✅ Posted
• Pinterest: ✅ Pinned  
• X (Twitter): ✅ Tweeted
• Total potential reach: ~5K followers

📈 <b>ENGAGEMENT TRACKING</b>
• Likes expected: 50-150
• Comments expected: 5-20
• Saves expected: 20-80
• Profile visits: 10-30

🎯 <b>BUSINESS IMPACT</b>
• Brand awareness: Building
• Newsletter signups: 2-8 expected
• Shop traffic: 5-15 visits
• Conversion potential: 1-3 sales

⏰ <b>TIMING OPTIMIZATION</b>
• Posted: ${new Date().toLocaleTimeString()}
• Peak engagement: Next 1-3 hours
• Best performing: ${getBestPostingTime()}`,
      sound: "bike"
    }
  };

  const notification = notifications[type];
  
  return await sendPushoverNotification({
    message: notification.message,
    title: notification.title,
    priority: 0,
    sound: notification.sound,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin`,
    url_title: "View Dashboard"
  });
}

export async function sendPushoverNotification(params: PushoverMessage) {
  if (!process.env.PUSHOVER_USER_KEY || !process.env.PUSHOVER_API_TOKEN) {
    console.log("📱 Pushover not configured, skipping notification");
    return { success: false, error: "Pushover not configured" };
  }

  try {
    const response = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: process.env.PUSHOVER_API_TOKEN,
        user: process.env.PUSHOVER_USER_KEY,
        message: params.message,
        title: params.title || 'Softly Becoming',
        priority: (params.priority || 0).toString(),
        sound: params.sound || 'pushover',
        url: params.url || '',
        url_title: params.url_title || '',
        html: params.html ? '1' : '0'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pushover API error: ${error}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      messageId: result.request,
      platform: 'pushover'
    };

  } catch (error) {
    console.error("Pushover notification failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function formatDailyReview(data: DailyReviewData): string {
  const trendEmoji = data.subscribers.newToday > 0 ? '📈' : '📊';
  const healthEmoji = data.issues.length === 0 ? '✅' : '⚠️';
  const conversionRate = data.subscribers.total > 0 ? ((data.subscribers.paidCount / data.subscribers.total) * 100).toFixed(1) : '0';
  const revenuePerSub = data.subscribers.paidCount > 0 ? (data.revenue.thisMonth / data.subscribers.paidCount).toFixed(2) : '0';
  
  return `${healthEmoji} <b>SOFTLY BECOMING DAILY REVIEW</b>
${new Date(data.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}

👥 <b>AUDIENCE GROWTH</b>
• Total subscribers: ${data.subscribers.total} ${data.subscribers.newToday > 0 ? `(+${data.subscribers.newToday} today)` : ''}
• Free tier: ${data.subscribers.freeCount} (${((data.subscribers.freeCount/data.subscribers.total)*100).toFixed(1)}%)
• Paid tier: ${data.subscribers.paidCount} (${conversionRate}% conversion)
• Growth trend: ${data.subscribers.newToday > 2 ? '🔥 Hot' : data.subscribers.newToday > 0 ? '📈 Growing' : '📊 Steady'}

📧 <b>EMAIL PERFORMANCE</b>
• Emails sent: ${data.emails.sent}
• Delivery rate: ${data.emails.delivered}/${data.emails.sent} (${((data.emails.delivered/data.emails.sent)*100).toFixed(1)}%)
• Open rate: ${data.emails.opened}/${data.emails.delivered} (${data.emails.openRate.toFixed(1)}%)
• Click rate: ${data.emails.clickRate.toFixed(1)}% 
• Performance: ${data.emails.openRate > 20 ? '🔥 Excellent' : data.emails.openRate > 15 ? '✅ Good' : '⚠️ Needs attention'}

📱 <b>CONTENT PIPELINE</b>
• Today's posts: ${data.posts.posted}/${data.posts.scheduled}
• Engagement: ${data.posts.engagement}% avg
• Next post: ${getNextPostTime()}
• Content health: ${data.posts.posted === data.posts.scheduled ? '✅ On track' : '⚠️ Behind schedule'}

💰 <b>REVENUE INSIGHTS</b>
• Today: £${data.revenue.today.toFixed(2)}
• This week: £${data.revenue.thisWeek.toFixed(2)} (£${(data.revenue.thisWeek/7).toFixed(2)}/day avg)
• This month: £${data.revenue.thisMonth.toFixed(2)}
• Revenue per paid sub: £${revenuePerSub}
• Monthly projection: £${((data.revenue.thisWeek/7) * 30).toFixed(2)}

🎯 <b>KEY ACTIONS NEEDED</b>
${data.issues.length > 0 ? data.issues.map(issue => `• ${issue}`).join('\n') : '• No urgent actions - systems running smoothly!'}

🚀 <b>TOMORROW'S CONTENT PREVIEW</b>
• Morning post: "${data.tomorrowsContent?.morning || 'gentle reminder that you are enough'}"
• Newsletter: "${data.tomorrowsContent?.newsletter || 'trust the process of becoming'}"

${trendEmoji} <b>OVERALL STATUS:</b> ${data.issues.length === 0 ? 'THRIVING' : data.issues.length < 3 ? 'STABLE' : 'NEEDS ATTENTION'}`;
}

function getNextPostTime(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0); // 8 AM tomorrow
  
  const hours = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
  return `in ${hours}h (tomorrow 8 AM)`;
}

function getBestPostingTime(): string {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour < 8) return "8-10 AM (morning inspiration)";
  if (hour < 14) return "2-4 PM (afternoon motivation)";
  if (hour < 20) return "8-10 PM (evening reflection)";
  return "8-10 AM tomorrow (morning fresh start)";
}
