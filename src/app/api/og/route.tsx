import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { baseStyle, textStyle } from "@/lib/render/og-style";
import React from "react";

export const runtime = "edge";

// Note: Font file not available, using system fonts instead
// const FONT = fetch(new URL("/public/fonts/PlayfairDisplay-Regular.ttf", import.meta.url))
//   .then(res => res.arrayBuffer());

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text") ?? "soft rebuild";
  // const fontData = await FONT;

  return new ImageResponse(
    (
      <div style={baseStyle as any}>
        <div
          style={{
            ...textStyle,
            fontFamily: "serif",
            maxWidth: 880,
            textAlign: "left",
          }}
        >
          {text}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080
      // fonts: [{ name: "Playfair", data: fontData, style: "normal" }],
    }
  );
}
