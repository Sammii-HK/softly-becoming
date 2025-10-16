import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getColorForText } from "@/lib/render/og-style";
import React from "react";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const variant = searchParams.get("variant") ?? "default";
  const customColor = searchParams.get("color");
  
  // Use custom color if provided, otherwise use default branding colors
  let colors;
  if (customColor) {
    // Simple validation for hex colors
    const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(customColor);
    if (isValidHex) {
      // Create a light background version of the custom color
      colors = { bg: customColor + "20", text: customColor };
    } else {
      colors = getColorForText("softly-becoming");
    }
  } else {
    colors = getColorForText("softly-becoming");
  }

  // Inspirational quotes for banner formats
  const quotes = [
    "Growth happens in the gentle moments",
    "Every small step is transformation",
    "Becoming is a beautiful process",
    "Change blooms from within",
    "Your journey is your masterpiece",
    "Softly forward, always forward",
    "Gentle progress is still progress",
    "Trust the process of becoming",
    "Small shifts create big changes",
    "You are exactly where you need to be"
  ];
  
  // Use a consistent quote based on the date (changes daily)
  const today = new Date().toDateString();
  const quoteIndex = Math.abs(today.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % quotes.length;
  const dailyQuote = quotes[quoteIndex];

  // Different layouts for different social media platforms
  const getLogoLayout = (variant: string) => {
    switch (variant) {
      case "square":
        return { width: 1080, height: 1080, fontSize: 200, isBanner: false };
      case "twitter":
        return { width: 1200, height: 675, fontSize: 48, isBanner: true };
      case "facebook":
        return { width: 1200, height: 630, fontSize: 48, isBanner: true };
      case "instagram":
        return { width: 1080, height: 1080, fontSize: 200, isBanner: false };
      case "linkedin":
        return { width: 1200, height: 627, fontSize: 48, isBanner: true };
      default:
        return { width: 1080, height: 1080, fontSize: 200, isBanner: false };
    }
  };

  const layout = getLogoLayout(variant);

  return new ImageResponse(
    (
      <div style={{
        width: layout.width,
        height: layout.height,
        background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}E6 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
        position: "relative",
      }}>
        {/* Subtle background pattern */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 30%, ${colors.text}08 0%, transparent 50%), radial-gradient(circle at 70% 70%, ${colors.text}05 0%, transparent 50%)`,
        }} />
        
        {/* Main brand name */}
        <div style={{
          fontFamily: "serif",
          fontSize: layout.fontSize,
          fontWeight: "300",
          color: colors.text,
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          marginBottom: layout.isBanner ? "24px" : "16px",
          zIndex: 1,
        }}>
          softly-becoming
        </div>
        
        {/* Quote for banner formats only */}
        {layout.isBanner && (
          <div style={{
            fontFamily: "serif",
            fontSize: Math.max(layout.fontSize * 0.6, 24),
            fontWeight: "300",
            color: colors.text + "DD",
            textAlign: "center",
            fontStyle: "italic",
            letterSpacing: "0.01em",
            maxWidth: layout.width * 0.8,
            lineHeight: 1.3,
            zIndex: 1,
          }}>
            "{dailyQuote}"
          </div>
        )}
        
        {/* Subtle tagline for profile pictures only */}
        {!layout.isBanner && (
          <div style={{
            fontFamily: "sans-serif",
            fontSize: Math.max(layout.fontSize * 0.15, 18),
            fontWeight: "400",
            color: colors.text + "CC",
            textAlign: "center",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            zIndex: 1,
          }}>
            gentle transformation
          </div>
        )}
        
        {/* Decorative element for profile pictures only */}
        {!layout.isBanner && (
          <div style={{
            width: "120px",
            height: "2px",
            background: `linear-gradient(90deg, transparent 0%, ${colors.text}66 50%, transparent 100%)`,
            marginTop: "24px",
            zIndex: 1,
          }} />
        )}
      </div>
    ),
    {
      width: layout.width,
      height: layout.height,
    }
  );
}
