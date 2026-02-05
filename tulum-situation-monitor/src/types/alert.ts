export type AlertSeverity = "severe" | "moderate" | "info";

export interface Alert {
  severity: AlertSeverity;
  title: string;
  desc: string;
  meta?: string;
}
