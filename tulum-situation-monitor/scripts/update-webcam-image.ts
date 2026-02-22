/**
 * Opens the Casa Malca webcam page, takes a screenshot, and saves to public/data/webcam/latest.jpg.
 * Used for link preview (og:image) when sharing the app.
 *
 * Run: npm run update:webcam
 * Requires: puppeteer (installs Chromium)
 */

import { mkdirSync, existsSync, statSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "public", "data", "webcam");
const OUT_FILE = join(OUT_DIR, "latest.jpg");

// Same URL as in WebcamModal (Casa Malca Tulum)
const WEBCAM_URL = "https://g3.ipcamlive.com/player/player.php?alias=08a1898ad840&autoplay=1";

async function main() {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  // Dynamic import so devs without Puppeteer can still run other scripts
  const puppeteer = await import("puppeteer");

  console.log("Opening webcam page...");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--autoplay-policy=no-user-gesture-required",
      "--use-fake-ui-for-media-stream",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Grant camera/mic permissions so WebRTC stream can initialize
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(new URL(WEBCAM_URL).origin, [
      "camera",
      "microphone",
    ]);

    await page.goto(WEBCAM_URL, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for the video element to appear and have a non-zero size,
    // or fall back to a generous timeout if the selector isn't found
    console.log("  Waiting for video stream to render...");
    try {
      await page.waitForFunction(
        () => {
          const video = document.querySelector("video");
          if (video && video.readyState >= 2 && video.videoWidth > 0) return true;
          // Also check for canvas-based players
          const canvas = document.querySelector("canvas");
          if (canvas && canvas.width > 100) return true;
          return false;
        },
        { timeout: 20000 }
      );
      // Extra buffer for the stream to stabilize
      await new Promise((r) => setTimeout(r, 3000));
    } catch {
      // If no video element found within timeout, wait a flat 15 seconds as fallback
      console.log("  Video element not detected, using fallback wait...");
      await new Promise((r) => setTimeout(r, 15000));
    }

    await page.screenshot({
      path: OUT_FILE,
      type: "jpeg",
      quality: 88,
    });

    const size = statSync(OUT_FILE).size;
    console.log(`  ✓ Saved latest.jpg (${(size / 1024).toFixed(1)} KB)`);

    // Basic sanity check — a mostly-black image from a failed stream is usually < 15 KB
    if (size < 15000) {
      console.warn("  ⚠ Image is very small — webcam stream may not have loaded.");
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error("Webcam capture failed:", e);
  process.exit(1);
});
