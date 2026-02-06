/**
 * Opens the Casa Malca webcam page, takes a screenshot, and saves to public/data/webcam/latest.jpg.
 * Used for link preview (og:image) when sharing the app.
 *
 * Run: npm run update:webcam
 * Requires: puppeteer (installs Chromium)
 */

import { mkdirSync, existsSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "public", "data", "webcam");
const OUT_FILE = join(OUT_DIR, "latest.jpg");

// Same URL as in WebcamModal (Casa Malca Tulum)
const WEBCAM_URL = "https://g3.ipcamlive.com/player/player.php?alias=08a1898ad840";

async function main() {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  // Dynamic import so devs without Puppeteer can still run other scripts
  const puppeteer = await import("puppeteer");

  console.log("Opening webcam page...");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(WEBCAM_URL, { waitUntil: "domcontentloaded", timeout: 25000 });
    // Give the video stream time to render a frame
    await new Promise((r) => setTimeout(r, 6000));
    await page.screenshot({
      path: OUT_FILE,
      type: "jpeg",
      quality: 88,
    });
    console.log(`  ✓ Saved latest.jpg`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
