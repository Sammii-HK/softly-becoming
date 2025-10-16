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
  const capitalizedText = capitalizeI(rawText);
  const spacedText = enhanceParagraphSpacing(capitalizedText);
  const text = preventOrphanedWords(spacedText);
  const colors = getColorForText(rawText);
  // const fontData = await FONT;

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
        padding: 160 // More breathing room for portrait
      }}>
        <div style={{
          fontFamily: "ui-serif, Georgia, Cambria, serif",
          fontSize: 52,
          lineHeight: 1.4, 
          letterSpacing: "-0.005em",
          whiteSpace: "pre-wrap", 
          maxWidth: 600,
          textAlign: "center",
          fontWeight: "300",
          orphans: 2,
          widows: 2,
          wordSpacing: "0.1em"
        }}>
          {text}
        </div>
      </div>
    ),
    { 
      width: 1080, 
      height: 1920
      // fonts: [{ name: "Playfair", data: fontData }] 
    }
  );
}
