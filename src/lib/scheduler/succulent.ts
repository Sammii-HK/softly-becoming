interface SucculentMedia {
  type: "image" | "video";
  url: string;
  alt: string;
  filename: string;
}

interface SucculentPostRequest {
  accountGroupId: string;
  content: string;
  platforms: string[];
  title?: string;
  scheduledDate?: string;
  media?: SucculentMedia[];
  publishImmediately?: boolean;
  saveAsDraft?: boolean;
  profileKey?: string;
}

interface SucculentPostResponse {
  success: boolean;
  postId?: string;
  message?: string;
  error?: string;
}

export async function postToSucculent({
  content,
  imageUrl,
  scheduledDate,
  title
}: {
  content: string;
  imageUrl: string;
  scheduledDate?: string;
  title?: string;
}): Promise<SucculentPostResponse> {
  const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;
  const apiUrl = process.env.SUCCULENT_API_URL || "https://app.succulent.social";
  
  if (!accountGroupId) {
    throw new Error("SUCCULENT_ACCOUNT_GROUP_ID environment variable is required");
  }

  // Target platforms: X, Instagram, Pinterest & Bluesky
  const platforms = ["x", "instagram", "pinterest", "bluesky"];
  
  // Create media object for the OG image
  const media: SucculentMedia[] = [{
    type: "image",
    url: imageUrl,
    alt: content.length > 100 ? content.substring(0, 100) + "..." : content,
    filename: `quote-${Date.now()}.png`
  }];

  const payload: SucculentPostRequest = {
    accountGroupId,
    content,
    platforms,
    media,
    title: title || "Soft Rebuild Quote",
    publishImmediately: !scheduledDate, // If no scheduled date, publish immediately
    saveAsDraft: false,
    ...(scheduledDate && { scheduledDate })
  };

  try {
    console.log(`🌸 Posting to Succulent Social:`, {
      platforms,
      content: content.substring(0, 50) + "...",
      imageUrl: imageUrl.substring(0, 50) + "...",
      scheduledDate: scheduledDate || "immediate"
    });

    const response = await fetch(`${apiUrl}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any auth headers if needed
        ...(process.env.SUCCULENT_API_KEY && {
          "Authorization": `Bearer ${process.env.SUCCULENT_API_KEY}`
        })
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Succulent Social API error:", data);
      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`
      };
    }

    console.log("✅ Successfully posted to Succulent Social:", data);
    
    return {
      success: true,
      postId: data.postId || data.id,
      message: data.message || "Posted successfully"
    };

  } catch (error) {
    console.error("❌ Error posting to Succulent Social:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
