import { NextRequest, NextResponse } from "next/server";
import { postToSucculent } from "@/lib/scheduler/succulent";

export async function GET(req: NextRequest) {
  const logs: string[] = [];
  const startTime = Date.now();
  
  // Helper function to log with timestamps
  const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    logs.push(logEntry);
    if (data) {
      logs.push(`[${timestamp}] Data: ${JSON.stringify(data, null, 2)}`);
    }
    console.log(logEntry, data || '');
  };

  try {
    log("🧪 Starting Succulent connection test");
    
    // Check environment variables
    log("📋 Checking environment variables");
    const requiredEnvs = {
      SUCCULENT_ACCOUNT_GROUP_ID: process.env.SUCCULENT_ACCOUNT_GROUP_ID,
      SUCCULENT_API_URL: process.env.SUCCULENT_API_URL,
      SUCCULENT_API_KEY: process.env.SUCCULENT_API_KEY ? "***SET***" : undefined,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
    };
    
    log("Environment variables status", requiredEnvs);
    
    // Check for missing required variables
    const missingEnvs = Object.entries(requiredEnvs)
      .filter(([key, value]) => !value && key !== 'SUCCULENT_API_KEY') // API key might be optional
      .map(([key]) => key);
    
    if (missingEnvs.length > 0) {
      log("❌ Missing required environment variables", missingEnvs);
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        missingEnvs,
        logs,
        duration: Date.now() - startTime
      }, { status: 400 });
    }

    // Generate test content and image
    log("🎨 Generating test content and image");
    const testContent = `Test post from soft-rebuild at ${new Date().toISOString()}

This is a test post to verify Succulent Social integration is working correctly.

#softrebuild #test #becoming`;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const testImageUrl = `${baseUrl}/api/og?text=${encodeURIComponent("Succulent Test Post\n\nConnection successful!")}`;
    
    log("Generated test image URL", { testImageUrl });
    
    // Test image generation first
    log("🖼️ Testing image generation");
    try {
      const imageResponse = await fetch(testImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Image generation failed: ${imageResponse.status}`);
      }
      log("✅ Image generation successful", { 
        status: imageResponse.status,
        contentType: imageResponse.headers.get('content-type')
      });
    } catch (imageError) {
      log("❌ Image generation failed", imageError);
      return NextResponse.json({
        success: false,
        error: "Image generation failed",
        imageError: imageError instanceof Error ? imageError.message : String(imageError),
        logs,
        duration: Date.now() - startTime
      }, { status: 500 });
    }

    // Test Succulent API connection
    log("🌸 Testing Succulent API connection");
    const succulentResult = await postToSucculent({
      content: testContent,
      imageUrl: testImageUrl,
      title: "Succulent Integration Test"
    });

    log("📡 Succulent API response received", succulentResult);

    if (succulentResult.success) {
      log("✅ Succulent test post successful!");
      return NextResponse.json({
        success: true,
        message: "Succulent connection test successful!",
        postId: succulentResult.postId,
        succulentResponse: succulentResult,
        testData: {
          content: testContent,
          imageUrl: testImageUrl,
          baseUrl
        },
        logs,
        duration: Date.now() - startTime
      });
    } else {
      log("❌ Succulent test post failed", succulentResult);
      return NextResponse.json({
        success: false,
        error: "Succulent API call failed",
        succulentResponse: succulentResult,
        testData: {
          content: testContent,
          imageUrl: testImageUrl,
          baseUrl
        },
        logs,
        duration: Date.now() - startTime
      }, { status: 500 });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("💥 Unexpected error occurred", { error: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      errorMessage,
      logs,
      duration: Date.now() - startTime
    }, { status: 500 });
  }
}

// Also support POST for manual testing with custom content
export async function POST(req: NextRequest) {
  const logs: string[] = [];
  const startTime = Date.now();
  
  const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    logs.push(logEntry);
    if (data) {
      logs.push(`[${timestamp}] Data: ${JSON.stringify(data, null, 2)}`);
    }
    console.log(logEntry, data || '');
  };

  try {
    const body = await req.json();
    const { content, imageText, title } = body;

    log("🧪 Starting custom Succulent test post");
    log("📝 Received custom parameters", { content: content?.substring(0, 100), imageText, title });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const testImageUrl = `${baseUrl}/api/og?text=${encodeURIComponent(imageText || "Custom Test Post")}`;

    const succulentResult = await postToSucculent({
      content: content || "Custom test post",
      imageUrl: testImageUrl,
      title: title || "Custom Succulent Test"
    });

    log("📡 Custom Succulent API response", succulentResult);

    return NextResponse.json({
      success: succulentResult.success,
      message: succulentResult.success ? "Custom test post successful!" : "Custom test post failed",
      postId: succulentResult.postId,
      succulentResponse: succulentResult,
      logs,
      duration: Date.now() - startTime
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("💥 Error in custom test", errorMessage);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      logs,
      duration: Date.now() - startTime
    }, { status: 500 });
  }
}
