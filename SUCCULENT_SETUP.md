# Succulent Social Integration Setup 🌸

Your quote system now integrates with [Succulent Social](https://app.succulent.social/) for multi-platform posting!

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Succulent Social Configuration
SUCCULENT_ACCOUNT_GROUP_ID="your-account-group-id"
SUCCULENT_API_URL="https://app.succulent.social"
SUCCULENT_API_KEY="your-api-key-if-needed"

# Your existing variables
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
CRON_SHARED_SECRET="your-cron-secret"
```

## Target Platforms

Your quotes will automatically post to:
- ✅ **X (Twitter)**
- ✅ **Instagram** 
- ✅ **Pinterest**
- ✅ **Bluesky**

## How It Works

### 🔄 **Automatic Daily Posts**
Your existing cron jobs now use Succulent Social:
- **Morning** (8:00 UTC): Posts immediately
- **Afternoon** (8:00 UTC + offset): Posts immediately  
- **Evening** (8:00 UTC + offset): Posts immediately

### 📅 **Batch Scheduling**
New endpoint for scheduling multiple posts:

```bash
POST /api/posts/schedule-batch
```

**Example request:**
```json
{
  "count": 10,
  "startDate": "2024-01-15T10:30:00Z",
  "intervalHours": 8,
  "theme": "soft_strength",
  "seed": 12345
}
```

This schedules 10 posts starting from the date, with 8 hours between each post.

## Features

### 🎨 **Beautiful OG Images**
- Automatically generates images with your 20 pastel colors
- Perfect typography with anti-orphan technology
- Proper "I" capitalization
- Optimal spacing and line breaks

### 📱 **Multi-Platform Ready**
- **Square images** (1080x1080) for Instagram/X posts
- **Portrait images** (1080x1920) for Instagram stories
- Automatic alt-text generation
- Professional filename conventions

### 🛡️ **Quality Control**
- Content safety filtering
- Readability checks
- Duplicate prevention
- Error handling and retry logic

## API Response Format

**Success:**
```json
{
  "success": true,
  "scheduled": 10,
  "failed": 0,
  "posts": [
    {
      "quote": { "lines": [...], "theme": "soft_strength" },
      "scheduledDate": "2024-01-15T10:30:00Z",
      "postId": "post_123",
      "imageUrl": "https://yoursite.com/api/og?text=..."
    }
  ]
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error info"
}
```

## Testing

1. **Set environment variables**
2. **Test immediate posting:**
   ```bash
   curl -X GET "http://localhost:3000/api/cron/morning" \
     -H "X-Internal: your-cron-secret"
   ```

3. **Test batch scheduling:**
   ```bash
   curl -X POST "http://localhost:3000/api/posts/schedule-batch" \
     -H "Content-Type: application/json" \
     -H "X-Internal: your-cron-secret" \
     -d '{
       "count": 3,
       "startDate": "2024-01-15T10:30:00Z",
       "intervalHours": 4
     }'
   ```

## Migration Notes

- ✅ **Replaced Ayrshare** with Succulent Social
- ✅ **Same quote generation** system
- ✅ **Same quality controls** 
- ✅ **Same cron schedule**
- ✅ **Enhanced with scheduling** capabilities

Your existing cron jobs will continue working - they now just use the new API! 🚀

---

*Need help? Check the console logs for detailed posting information.* 📝
