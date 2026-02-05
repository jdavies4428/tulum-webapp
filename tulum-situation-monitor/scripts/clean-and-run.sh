#!/usr/bin/env bash
# Run from repo root (tulum-web) or from tulum-situation-monitor.
set -e
cd "$(dirname "$0")/.."
echo "Cleaning and rebuilding..."
rm -rf .next
npm run build
echo "Build done. Start the app with: npm run start"
echo "Then open http://localhost:3003 and do a HARD REFRESH (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)"
echo "Or run dev with: npm run dev  →  http://localhost:3002"
