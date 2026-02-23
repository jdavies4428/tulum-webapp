import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const MAX_SIZE_KB = 500;

export async function GET() {
  try {
    const imagePath = path.join(process.cwd(), "public", "data", "webcam", "latest.jpg");

    if (!fs.existsSync(imagePath)) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const buffer = await sharp(imagePath)
      .resize(OG_WIDTH, OG_HEIGHT, { fit: "cover" })
      .jpeg({ quality: 75 })
      .toBuffer();

    // If still too large, compress further
    const finalBuffer = buffer.length > MAX_SIZE_KB * 1024
      ? await sharp(buffer).jpeg({ quality: 60 }).toBuffer()
      : buffer;

    return new NextResponse(finalBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch {
    return new NextResponse("Failed to generate image", { status: 500 });
  }
}
