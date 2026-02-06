/**
 * USF Optics Marine Lab Sargassum satellite image URLs
 * https://optics.marine.usf.edu/cgi-bin/optics_data?roi=YUCATAN&comp=1
 *
 * Filename format: c{startYYYY}{startDOY}{endYYYY}{endDOY}.1KM.YUCATAN.{1DAY|7DAY}.L3D.FAD.png
 * - 1-day: start and end are the same date
 * - 7-day: start is 6 days before end (7 days inclusive)
 */

const USF_BASE = "https://optics.marine.usf.edu/cgi-bin";

function getDOY(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  return days; // 1–366
}

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

/**
 * Returns the USF 1-day FAD image URL for a given date.
 * Example: c20260352026035.1KM.YUCATAN.1DAY.L3D.FAD.png
 */
export function getUsf1DayUrl(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const doy = getDOY(date);
  const doyStr = pad3(doy);
  const filename = `c${yyyy}${doyStr}${yyyy}${doyStr}.1KM.YUCATAN.1DAY.L3D.FAD.png`;
  return `${USF_BASE}/${filename}`;
}

/**
 * Returns the USF 7-day FAD image URL for a given end date.
 * Start is 6 days before end (7 days inclusive).
 * Example: c20260292026035.1KM.YUCATAN.7DAY.L3D.FAD.png
 */
export function getUsf7DayUrl(endDate: Date = new Date()): string {
  const end = new Date(endDate);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);

  const startYyyy = start.getFullYear();
  const startDoy = pad3(getDOY(start));
  const endYyyy = end.getFullYear();
  const endDoy = pad3(getDOY(end));

  const filename = `c${startYyyy}${startDoy}${endYyyy}${endDoy}.1KM.YUCATAN.7DAY.L3D.FAD.png`;
  return `${USF_BASE}/${filename}`;
}
