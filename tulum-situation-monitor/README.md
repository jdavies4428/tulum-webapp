# Tulum Situation Monitor (Next.js)

Real-time beach conditions, weather, and map for Tulum.

## Run the app

**Option 1 – Production (recommended if dev shows 404)**

```bash
cd tulum-situation-monitor
npm run build
npm run start
```

Then open **http://localhost:3003**

**Option 2 – Dev (if you get 404, try increasing file limit first)**

```bash
cd tulum-situation-monitor
ulimit -n 10240
npm run dev
```

Then open **http://localhost:3002**

**Option 3 – Dev with Turbopack**

```bash
cd tulum-situation-monitor
npm run dev:turbo
```

Open **http://localhost:3002**

## Ports

- **Dev:** port **3002**
- **Production (npm run start):** port **3003**

## If you see 404

- Make sure you’re in the `tulum-situation-monitor` folder when running commands.
- **Dev:** use **http://localhost:3002**. **Production:** use **http://localhost:3003**.
- If dev keeps returning 404 (often due to “too many open files” on macOS), use production: `npm run build && npm run start`, then open **http://localhost:3003**.
