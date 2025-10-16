import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { baseStyle, textStyle, getColorForText, getHighlightStyle, preventOrphanedWords, enhanceParagraphSpacing, capitalizeI } from "@/lib/render/og-style";
import React from "react";

export const runtime = "edge";

// Note: Font file not available, using system fonts instead
// const FONT = fetch(new URL("/public/fonts/PlayfairDisplay-Regular.ttf", import.meta.url))
//   .then(res => res.arrayBuffer());

// Load Google Font function (from Vercel guide)
async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
 
  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }
 
  throw new Error('failed to load font data');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawText = searchParams.get("text") ?? "soft rebuild";
  const showBranding = searchParams.get("branding") === "true";
  const capitalizedText = capitalizeI(rawText);
  const spacedText = enhanceParagraphSpacing(capitalizedText);
  const text = preventOrphanedWords(spacedText);
  const colors = getColorForText(rawText);
  
  // Load custom font - try serif font that should work better
  let fontData;
  try {
    fontData = await loadGoogleFont('Crimson+Text:wght@400;600', text);
  } catch (error) {
    console.log('Font loading failed, using system font');
    fontData = null;
  }
  
  // Split text to highlight the last line like your example
  const lines = text.split('\n').filter(line => line.trim());
  const mainText = lines.slice(0, -1).join('\n');
  const highlightText = lines[lines.length - 1] || '';

  return new ImageResponse(
    (
      <div 
        style={{
          width: "1080px",
          height: "1080px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px",
          background: colors.bg,
          color: colors.text,
          position: "relative",
          flexDirection: "column",
          gap: "16px"
        }}
      >
        {/* Main text */}
        {mainText && (
          <div
            style={{
              fontFamily: fontData ? "Crimson Text" : "ui-serif, Georgia, serif",
              fontWeight: "400",
              fontSize: 50,
              lineHeight: 1.3,
              textAlign: "center",
              maxWidth: "700px",
              whiteSpace: "pre-wrap"
            }}
          >
            {mainText}
          </div>
        )}
        
        {/* Highlighted last line - exactly like your example */}
        {highlightText && (
          <div
            style={{
              fontFamily: fontData ? "Crimson Text" : "ui-serif, Georgia, serif",
              fontWeight: "600",
              fontSize: 50,
              lineHeight: 1.3,
              textAlign: "center",
              maxWidth: "700px",
              fontStyle: "italic",
              color: colors.highlight, // Saturated highlight color
              padding: "8px 0"
            }}
          >
            {highlightText}
          </div>
        )}
        
        {/* Subtle branding */}
        {showBranding && (
          <div style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            fontSize: "16px",
            opacity: 0.3,
            fontFamily: "Inter",
            fontStyle: "italic"
          }}>
            softly becoming
          </div>
        )}
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      ...(fontData && {
        fonts: [
          {
            name: 'Crimson Text',
            data: fontData,
            style: 'normal',
          },
        ],
      }),
    }
  );
}
