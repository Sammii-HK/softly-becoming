import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import React from "react";

export const runtime = "edge";

// Note: Font file not available, using system fonts instead
// const FONT = fetch(new URL("/public/fonts/PlayfairDisplay-Regular.ttf", import.meta.url))
//   .then(r => r.arrayBuffer());

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = (searchParams.get("text") ?? "soft rebuild").replace(/\\n/g, "\n");
  // const fontData = await FONT;

  return new ImageResponse(
    (
      <div style={{
        width: 1080, 
        height: 1920, 
        background: "#FAF9F7", 
        color: "#3A3A3A",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: 96
      }}>
        <div style={{
          fontFamily: "serif", 
          fontSize: 88, 
          lineHeight: 1.25, 
          letterSpacing: "-0.01em",
          whiteSpace: "pre-wrap", 
          maxWidth: 840, 
          textAlign: "left"
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
