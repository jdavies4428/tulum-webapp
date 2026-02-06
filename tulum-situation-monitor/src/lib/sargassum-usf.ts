/**
 * USF Optics Marine Lab Sargassum satellite image URLs
 * https://optics.marine.usf.edu/cgi-bin/optics_data?roi=YUCATAN&comp=1
 *
 * Direct PNG URLs (for browser <img> and fetch):
 * https://optics.marine.usf.edu/subscription/multi_sensor_fusion/YUCATAN/{yyyy}/comp/{doy}/{filename}.200.png
 *
 * The ge?file= endpoint returns KML for Google Earth, not PNG - do not use for images.
 */

const USF_IMG_BASE = "https://optics.marine.usf.edu/subscription/multi_sensor_fusion/YUCATAN";

function getDOY(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  return days; // 1–366
}

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

/** Legacy: ge?file= URL (returns KML, used by update script - Node fetch may get PNG in some cases) */
export function getUsfImageUrl(filename: string): string {
  return `https://optics.marine.usf.edu/cgi-bin/ge?file=${filename}`;
}

/**
 * Returns the USF 1-day FAD image URL for a given date (direct PNG).
 * Example: .../2026/comp/035/c20260352026035.1KM.YUCATAN.1DAY.L3D.FAD.200.png
 */
export function getUsf1DayUrl(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const doy = getDOY(date);
  const doyStr = pad3(doy);
  const filename = `c${yyyy}${doyStr}${yyyy}${doyStr}.1KM.YUCATAN.1DAY.L3D.FAD.200.png`;
  return `${USF_IMG_BASE}/${yyyy}/comp/${doyStr}/${filename}`;
}

/**
 * Returns the USF 7-day FAD image URL for a given end date (direct PNG).
 * Start is 6 days before end (7 days inclusive).
 * Example: .../2026/comp/035/c20260292026035.1KM.YUCATAN.7DAY.L3D.FAD.200.png
 */
export function getUsf7DayUrl(endDate: Date = new Date()): string {
  const end = new Date(endDate);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);

  const startYyyy = start.getFullYear();
  const startDoy = pad3(getDOY(start));
  const endYyyy = end.getFullYear();
  const endDoy = pad3(getDOY(end));

  const filename = `c${startYyyy}${startDoy}${endYyyy}${endDoy}.1KM.YUCATAN.7DAY.L3D.FAD.200.png`;
  return `${USF_IMG_BASE}/${endYyyy}/comp/${endDoy}/${filename}`;
}
