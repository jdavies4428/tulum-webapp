"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { BottomNav } from "@/components/layout/BottomNav";

type FlightDirection = "arrival" | "departure";

interface Flight {
  carrier: string;
  flightNumber: string;
  direction: FlightDirection;
  city: string;
  airport: string;
  scheduledTime: string;
}

// Representative daily schedule for Tulum (TQO). Times are approximate; check airline for current schedule.
const TULUM_FLIGHTS: Flight[] = [
  { carrier: "American", flightNumber: "AA 342", direction: "arrival" as const, city: "Miami", airport: "MIA", scheduledTime: "13:15" },
  { carrier: "American", flightNumber: "AA 342", direction: "departure" as const, city: "Miami", airport: "MIA", scheduledTime: "14:15" },
  { carrier: "American", flightNumber: "AA 1248", direction: "arrival" as const, city: "Dallas", airport: "DFW", scheduledTime: "14:25" },
  { carrier: "American", flightNumber: "AA 1248", direction: "departure" as const, city: "Dallas", airport: "DFW", scheduledTime: "15:25" },
  { carrier: "American", flightNumber: "AA 2428", direction: "arrival" as const, city: "Charlotte", airport: "CLT", scheduledTime: "13:20" },
  { carrier: "American", flightNumber: "AA 2428", direction: "departure" as const, city: "Charlotte", airport: "CLT", scheduledTime: "14:20" },
  { carrier: "United", flightNumber: "UA 1234", direction: "arrival" as const, city: "Houston", airport: "IAH", scheduledTime: "12:45" },
  { carrier: "United", flightNumber: "UA 1234", direction: "departure" as const, city: "Houston", airport: "IAH", scheduledTime: "13:45" },
  { carrier: "Volaris", flightNumber: "Y4 123", direction: "arrival" as const, city: "Mexico City", airport: "MEX", scheduledTime: "11:30" },
  { carrier: "Volaris", flightNumber: "Y4 123", direction: "departure" as const, city: "Mexico City", airport: "MEX", scheduledTime: "12:30" },
  { carrier: "Volaris", flightNumber: "Y4 456", direction: "arrival" as const, city: "Guadalajara", airport: "GDL", scheduledTime: "15:00" },
  { carrier: "Volaris", flightNumber: "Y4 456", direction: "departure" as const, city: "Guadalajara", airport: "GDL", scheduledTime: "16:00" },
  { carrier: "Viva Aerobus", flightNumber: "VB 789", direction: "arrival" as const, city: "Monterrey", airport: "MTY", scheduledTime: "10:45" },
  { carrier: "Viva Aerobus", flightNumber: "VB 789", direction: "departure" as const, city: "Monterrey", airport: "MTY", scheduledTime: "11:45" },
  { carrier: "Delta", flightNumber: "DL 567", direction: "arrival" as const, city: "Atlanta", airport: "ATL", scheduledTime: "14:00" },
  { carrier: "Delta", flightNumber: "DL 567", direction: "departure" as const, city: "Atlanta", airport: "ATL", scheduledTime: "15:00" },
].sort((a, b) => {
  const t = (x: Flight) => x.scheduledTime.replace(":", "");
  return parseInt(t(a), 10) - parseInt(t(b), 10);
});

const ADO_URL = "https://www.ado.com.mx";

const INDRIVE = {
  scheme: "indrive://",
  ios: "https://apps.apple.com/app/indrive-taxi-rides-platform/id780125801",
  android: "https://play.google.com/store/apps/details?id=sinet.startup.inDriver",
};

const EIBY = {
  scheme: "eiby://",
  ios: "https://apps.apple.com/us/app/eiby-taxi-cliente/id1254888887",
  android: "https://play.google.com/store/apps/details?id=mx.eiby.eibyusuario",
};

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

function openAppOrStore(scheme: string, iosStore: string, androidStore: string) {
  const storeUrl = isIOS() ? iosStore : isAndroid() ? androidStore : iosStore;
  window.location.href = scheme;
  setTimeout(() => {
    window.location.href = storeUrl;
  }, 1500);
}

const linkStyle = {
  display: "flex" as const,
  alignItems: "center" as const,
  gap: "16px",
  padding: "16px 20px",
  background: "var(--card-bg)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "16px",
  color: "var(--text-primary)",
  textDecoration: "none" as const,
  fontWeight: 600 as const,
  fontSize: "16px",
  transition: "background 0.2s, border-color 0.2s",
};

const buttonStyle = {
  ...linkStyle,
  width: "100%" as const,
  cursor: "pointer" as const,
  fontFamily: "inherit",
};

function FlightsModal({
  open,
  onClose,
  flights,
  tAny,
}: {
  open: boolean;
  onClose: () => void;
  flights: Flight[];
  tAny: Record<string, string>;
}) {
  if (!open) return null;
  const arrivals = flights.filter((f) => f.direction === "arrival");
  const departures = flights.filter((f) => f.direction === "departure");
  const arrLabel = tAny.tulumFlightsArrivals ?? "Arrivals";
  const depLabel = tAny.tulumFlightsDepartures ?? "Departures";
  const note = tAny.tulumFlightsNote ?? "Schedules may vary. Check airline for current times.";
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
        aria-hidden
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "85vh",
          overflow: "auto",
          background: "var(--card-bg)",
          borderRadius: "20px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          border: "1px solid var(--border-subtle)",
        }}
        className="hide-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
            ✈️ {tAny.tulumFlights ?? "Tulum Flights"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              border: "none",
              background: "var(--button-secondary)",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "16px 24px 24px" }}>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              margin: "0 0 16px 0",
            }}
          >
            {note}
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-emphasis)" }}>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: "600" }}>{tAny.tulumFlightsCarrier ?? "Carrier"}</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: "600" }}>{tAny.tulumFlightsFlight ?? "Flight"}</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: "600" }}>{tAny.tulumFlightsRoute ?? "Route"}</th>
                <th style={{ textAlign: "right", padding: "10px 8px", fontWeight: "600" }}>{tAny.tulumFlightsTime ?? "Time"}</th>
              </tr>
            </thead>
            <tbody>
              {arrivals.length > 0 && (
                <>
                  <tr>
                    <td colSpan={4} style={{ padding: "12px 8px 4px", fontWeight: "600", color: "var(--tulum-ocean)" }}>
                      {arrLabel}
                    </td>
                  </tr>
                  {arrivals.map((f, i) => (
                    <tr key={`a-${i}`} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "10px 8px" }}>{f.carrier}</td>
                      <td style={{ padding: "10px 8px" }}>{f.flightNumber}</td>
                      <td style={{ padding: "10px 8px" }}>{f.city} ({f.airport}) → TQO</td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>{f.scheduledTime}</td>
                    </tr>
                  ))}
                </>
              )}
              {departures.length > 0 && (
                <>
                  <tr>
                    <td colSpan={4} style={{ padding: "12px 8px 4px", fontWeight: "600", color: "var(--tulum-ocean)" }}>
                      {depLabel}
                    </td>
                  </tr>
                  {departures.map((f, i) => (
                    <tr key={`d-${i}`} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "10px 8px" }}>{f.carrier}</td>
                      <td style={{ padding: "10px 8px" }}>{f.flightNumber}</td>
                      <td style={{ padding: "10px 8px" }}>TQO → {f.city} ({f.airport})</td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>{f.scheduledTime}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function TransportationPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const [flightsOpen, setFlightsOpen] = useState(false);
  const t = translations[lang];
  const tAny = t as Record<string, string>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        padding: "24px",
        paddingTop: "max(24px, env(safe-area-inset-top))",
        paddingBottom: "100px",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "16px",
        }}
      >
        <Link
          href={`/discover?lang=${lang}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "var(--button-secondary)",
            border: "1px solid var(--border-emphasis)",
            color: "var(--text-primary)",
            fontSize: "20px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          ←
        </Link>
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
          🚗 {tAny.transportation ?? "Transportation"}
        </h1>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => setFlightsOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--card-hover)";
            e.currentTarget.style.borderColor = "var(--border-emphasis)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--card-bg)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <span style={{ fontSize: "28px" }}>✈️</span>
          <span>{tAny.tulumFlights ?? "Tulum Flights"}</span>
        </button>

        <a
          href={ADO_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--card-hover)";
            e.currentTarget.style.borderColor = "var(--border-emphasis)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--card-bg)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <span style={{ fontSize: "28px" }}>🚌</span>
          <span>ADO</span>
        </a>

        <button
          type="button"
          style={buttonStyle}
          onClick={() => openAppOrStore(INDRIVE.scheme, INDRIVE.ios, INDRIVE.android)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--card-hover)";
            e.currentTarget.style.borderColor = "var(--border-emphasis)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--card-bg)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <span style={{ fontSize: "28px" }}>🚗</span>
          <span>InDrive</span>
        </button>

        <button
          type="button"
          style={buttonStyle}
          onClick={() => openAppOrStore(EIBY.scheme, EIBY.ios, EIBY.android)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--card-hover)";
            e.currentTarget.style.borderColor = "var(--border-emphasis)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--card-bg)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <span style={{ fontSize: "28px" }}>🚕</span>
          <span>Eiby</span>
        </button>
      </div>

      <FlightsModal
        open={flightsOpen}
        onClose={() => setFlightsOpen(false)}
        flights={TULUM_FLIGHTS}
        tAny={tAny}
      />

      <BottomNav lang={lang} />
    </div>
  );
}
