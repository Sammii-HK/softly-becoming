import { generateQuotes } from "@/lib/generator/builder";
import { postToSucculent } from "@/lib/scheduler/succulent";
import { guardQuote } from "@/lib/quality/contentGuard";
import { buildCaption } from "@/lib/quality/caption";

interface SchedulePostsOptions {
  count: number;
  startDate: Date;
  intervalHours: number;
  seed?: number;
  theme?: string;
}

export async function schedulePosts(options: SchedulePostsOptions) {
  console.log(`🗓️ Scheduling ${options.count} posts starting from ${options.startDate.toISOString()}`);
  
  // Generate quotes
  const quotes = generateQuotes({ 
    count: options.count * 2, // Generate extra to account for filtering
    seed: options.seed ?? Date.now(),
    recentWindow: 1000,
    ...(options.theme && { themeBias: { [options.theme]: 2 } })
  });

  const successfulPosts: any[] = [];
  const failedPosts: any[] = [];
  let scheduledCount = 0;

  for (const quote of quotes) {
    if (scheduledCount >= options.count) break;

    // Apply quality guard
    const guarded = guardQuote(quote.lines);
    if (!guarded.ok) continue;

    // Calculate scheduled time
    const scheduledDate = new Date(options.startDate);
    scheduledDate.setHours(scheduledDate.getHours() + (scheduledCount * options.intervalHours));

    // Create image URL
    const text = encodeURIComponent(guarded.lines.join("\n"));
    const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?text=${text}`;

    // Build caption
    const caption = buildCaption(guarded.lines[0]);

    try {
      const result = await postToSucculent({
        content: caption,
        imageUrl,
        scheduledDate: scheduledDate.toISOString(),
        title: `${quote.theme} - ${quote.tone} quote - ${scheduledDate.toLocaleDateString()}`
      });

      if (result.success) {
        successfulPosts.push({
          quote: { ...quote, lines: guarded.lines },
          scheduledDate: scheduledDate.toISOString(),
          postId: result.postId,
          imageUrl
        });
        scheduledCount++;
        console.log(`✅ Scheduled post ${scheduledCount}/${options.count} for ${scheduledDate.toLocaleString()}`);
      } else {
        failedPosts.push({
          quote: { ...quote, lines: guarded.lines },
          error: result.error,
          scheduledDate: scheduledDate.toISOString()
        });
        console.error(`❌ Failed to schedule post: ${result.error}`);
      }

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`❌ Error scheduling post:`, error);
      failedPosts.push({
        quote: { ...quote, lines: guarded.lines },
        error: error instanceof Error ? error.message : "Unknown error",
        scheduledDate: scheduledDate.toISOString()
      });
    }
  }

  return {
    success: successfulPosts.length > 0,
    scheduled: successfulPosts.length,
    failed: failedPosts.length,
    successfulPosts,
    failedPosts
  };
}
