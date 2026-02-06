import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FRANKFURTER = "https://api.frankfurter.app/latest";

export type CurrenciesRates = {
  USD?: number;
  CAD?: number;
  EUR?: number;
  ARS?: number;
};

async function fetchRate(from: string, to: string): Promise<number | null> {
  try {
    const res = await fetch(`${FRANKFURTER}?from=${from}&to=${to}`, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { rates?: Record<string, number> };
    return data.rates?.[to] ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const [USD, CAD, EUR, ARS] = await Promise.all([
    fetchRate("USD", "MXN"),
    fetchRate("CAD", "MXN"),
    fetchRate("EUR", "MXN"),
    fetchRate("ARS", "MXN"),
  ]);

  const body: CurrenciesRates = {};
  if (USD != null) body.USD = USD;
  if (CAD != null) body.CAD = CAD;
  if (EUR != null) body.EUR = EUR;
  if (ARS != null) body.ARS = ARS;

  return NextResponse.json(body);
}
