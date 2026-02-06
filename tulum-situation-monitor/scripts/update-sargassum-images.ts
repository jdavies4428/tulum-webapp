/**
 * Fetches latest sargassum satellite images from USF and saves to public/data/sargassum/
 * Run: npx tsx scripts/update-sargassum-images.ts
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { getUsf1DayUrl, getUsf7DayUrl } from "../src/lib/sargassum-usf";

const OUT_DIR = join(process.cwd(), "public", "data", "sargassum");

async function fetchImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) return null;
    return buf;
  } catch {
    return null;
  }
}

async function fetchLatest1Day(): Promise<Buffer | null> {
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const url = getUsf1DayUrl(d);
    console.log(`  Trying 1-day: ${url}`);
    const buf = await fetchImage(url);
    if (buf) return buf;
  }
  return null;
}

async function fetchLatest7Day(): Promise<Buffer | null> {
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const url = getUsf7DayUrl(d);
    console.log(`  Trying 7-day: ${url}`);
    const buf = await fetchImage(url);
    if (buf) return buf;
  }
  return null;
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log("Fetching sargassum satellite images from USF...\n");

  console.log("1-day image:");
  const img1 = await fetchLatest1Day();
  if (img1) {
    writeFileSync(join(OUT_DIR, "latest_1day.png"), img1);
    console.log(`  ✓ Saved latest_1day.png (${(img1.length / 1024).toFixed(1)} KB)\n`);
  } else {
    console.log("  ✗ No 1-day image available (USF may not have today's data yet)\n");
  }

  console.log("7-day image:");
  const img7 = await fetchLatest7Day();
  if (img7) {
    writeFileSync(join(OUT_DIR, "latest_7day.png"), img7);
    console.log(`  ✓ Saved latest_7day.png (${(img7.length / 1024).toFixed(1)} KB)\n`);
  } else {
    console.log("  ✗ No 7-day image available (USF may not have today's data yet)\n");
  }

  if (img1 || img7) {
    console.log("Done. Local fallback images updated.");
  } else {
    console.log("Warning: Could not fetch any images. USF server may be down or format changed.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
