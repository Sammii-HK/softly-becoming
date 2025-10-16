import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getColorForText, preventOrphanedWords, enhanceParagraphSpacing, capitalizeI } from "@/lib/render/og-style";
import React from "react";

export const runtime = "edge";

// Note: Font file not available, using system fonts instead
// const FONT = fetch(new URL("/public/fonts/PlayfairDisplay-Regular.ttf", import.meta.url))
//   .then(r => r.arrayBuffer());

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawText = (searchParams.get("text") ?? "soft rebuild").replace(/\\n/g, "\n");
  
  try {
    // Simplified text processing
    let text = capitalizeI(rawText);
    const colors = getColorForText(rawText);
    
    // Split text for highlighting
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) {
      lines.push("soft rebuild");
    }

    return new ImageResponse(
      (
        <div style={{
          width: 1080, 
          height: 1920, 
          background: colors.bg,
          color: colors.text,
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: 160,
          position: "relative"
        }}>
          <div style={{
            fontFamily: "serif",
            fontSize: 52,
            lineHeight: 1.4, 
            letterSpacing: "-0.005em",
            maxWidth: 600,
            textAlign: "left",
            fontWeight: "400",
            display: "flex", // CRITICAL: Required for multiple children
            flexDirection: "column"
          }}>
            {lines.map((line, index) => (
              <div 
                key={index}
                style={{
                  marginBottom: index < lines.length - 1 ? "16px" : "0",
                  ...(index === lines.length - 1 ? {
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
        </div>
      ),
      { 
        width: 1080, 
        height: 1920
      }
    );
  } catch (error) {
    console.error('OG Portrait generation error for text:', rawText, error);
    
    // Fallback for portrait
    return new ImageResponse(
      (
        <div style={{
          width: 1080, 
          height: 1920, 
          background: "#FEFDFF",
          color: "#2A0A3A",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: 160
        }}>
          <div style={{
            fontFamily: "serif",
            fontSize: 50,
            lineHeight: 1.4,
            textAlign: "left",
            maxWidth: 600
          }}>
            {rawText || "gentle wisdom"}
          </div>
        </div>
      ),
      { 
        width: 1080, 
        height: 1920
      }
    );
  }
}
