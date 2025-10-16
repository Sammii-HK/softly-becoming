import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { baseStyle, textStyle, getColorForText, getHighlightStyle, preventOrphanedWords, enhanceParagraphSpacing, capitalizeI } from "@/lib/render/og-style";
import React from "react";

export const runtime = "edge";

// Note: Font file not available, using system fonts instead
// const FONT = fetch(new URL("/public/fonts/PlayfairDisplay-Regular.ttf", import.meta.url))
//   .then(res => res.arrayBuffer());

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawText = searchParams.get("text") ?? "soft rebuild";
  const showBranding = searchParams.get("branding") === "true";
  
  try {
    // Ultra-simple, bulletproof approach
    const colors = getColorForText(rawText);
    
    // Clean text - remove any problematic characters
    const cleanText = rawText.replace(/[^\w\s\n.,'!?-]/g, '');
    
    // Split into lines, but handle safely
    const allLines = cleanText.split('\n').map(line => line.trim()).filter(Boolean);
    
    // Always ensure we have content
    if (allLines.length === 0) {
      allLines.push("gentle wisdom");
    }
    
    // Format text for display
    const mainLines = allLines.slice(0, -1);
    const lastLine = allLines[allLines.length - 1] || "";

    return new ImageResponse(
      (
        <div 
          style={{
            width: 1080,
            height: 1080,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 120,
            background: colors.bg,
            color: colors.text,
            position: "relative"
          }}
        >
          <div
            style={{
              fontFamily: "serif",
              fontSize: 48,
              lineHeight: 1.4,
              textAlign: "left",
              maxWidth: 600,
              fontWeight: "400",
              display: "flex", // CRITICAL: Required for multiple children
              flexDirection: "column"
            }}
          >
            {/* Render each line as a separate div */}
            {allLines.map((line, index) => (
              <div
                key={index}
                style={{
                  marginBottom: index < allLines.length - 1 ? "16px" : "0",
                  ...(index === allLines.length - 1 ? {
                    fontWeight: "600",
                    fontStyle: "italic",
                    color: colors.highlight
                  } : {})
                }}
              >
                {line}
              </div>
            ))}
          </div>
          
          {/* Branding */}
          {showBranding && (
            <div style={{
              position: "absolute",
              bottom: 40,
              right: 40,
              fontSize: 16,
              opacity: 0.3,
              fontFamily: "serif"
            }}>
              softly becoming
            </div>
          )}
        </div>
      ),
      {
        width: 1080,
        height: 1080
      }
    );
  } catch (error) {
    console.error('OG fallback for:', rawText, error);
    
    // Ultimate fallback - guaranteed to work
    return new ImageResponse(
      (
        <div 
          style={{
            width: 1080,
            height: 1080,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FEFDFF",
            color: "#2A0A3A",
            padding: 120
          }}
        >
          <div
            style={{
              fontFamily: "serif",
              fontSize: 48,
              textAlign: "left",
              maxWidth: 600
            }}
          >
            gentle wisdom
          </div>
        </div>
      ),
      { width: 1080, height: 1080 }
    );
  }
}
