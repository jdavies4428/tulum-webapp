import type { LocalEvent } from "@/hooks/useLocalEvents";

export const SAMPLE_EVENTS: LocalEvent[] = [
  {
    id: "sample-1",
    author_id: "sample",
    author_name: "Arena & Ikal",
    author_handle: "@arenatulum",
    author_avatar: "\u{1F9D8}",
    content: "Morning Yoga & Wellness \u2014 Path to Nirvana 9am, Kundalini Yoga 10:30am at Arena. Hatha Yoga 8:30am & Yoga Flow 10:30am at Ikal. Start your day aligned.",
    image_url: "https://cdn.prod.website-files.com/649b2bff2df9b454e452d2fd/68ddd65863a64c05b47b5fab_0T9A6219.webp",
    metadata: { likes_count: 24, replies_count: 3 },
    created_at: "2026-02-18T08:30:00Z",
    updated_at: "2026-02-18T08:30:00Z",
  },
  {
    id: "sample-2",
    author_id: "sample",
    author_name: "Ikal Tulum",
    author_handle: "@ikaltulum",
    author_avatar: "\u{1F64F}",
    content: "LOSAR \u2014 Celebra el Tibetan New Year. Cantando mantras x Ani Zofia 3:30pm. A sacred ceremony of meditation, mantras & community. All are welcome.",
    image_url: "https://photos.hotelbeds.com/giata/original/81/810579/810579a_hb_w_052.jpg",
    metadata: { likes_count: 41, replies_count: 7 },
    created_at: "2026-02-18T15:30:00Z",
    updated_at: "2026-02-18T15:30:00Z",
  },
  {
    id: "sample-3",
    author_id: "sample",
    author_name: "Panamera Tulum",
    author_handle: "@panameratulum",
    author_avatar: "\u{1F305}",
    content: "Sunset & Tarot on the Rooftop \u2014 Sunset & tarot 6pm. Movie night: Match Point 7pm. Golden hour vibes at Panamera rooftop.",
    image_url: "https://images.squarespace-cdn.com/content/v1/66e9f9f5a2ee6441631be8b4/6fae467c-5f02-4ae6-b0ab-b7936717ebda/rooftop.png?format=1500w",
    metadata: { likes_count: 56, replies_count: 12 },
    created_at: "2026-02-18T18:00:00Z",
    updated_at: "2026-02-18T18:00:00Z",
  },
  {
    id: "sample-4",
    author_id: "sample",
    author_name: "Tulum Live",
    author_handle: "@tulumnights",
    author_avatar: "\u{1F3B6}",
    content: "Live Music Night \u2014 Vagalume: Rythmia X Los Cabra 7pm. Ziggy Beach: Sax & Jazz 7:15pm. Veleta Market: Blues 8pm. Ciao Belli: Tango y pasta 8pm.",
    image_url: "https://vagalume-tulum.mx/assets/img/3.jpg",
    metadata: { likes_count: 89, replies_count: 15 },
    created_at: "2026-02-18T19:00:00Z",
    updated_at: "2026-02-18T19:00:00Z",
  },
  {
    id: "sample-5",
    author_id: "sample",
    author_name: "Nomade Tulum",
    author_handle: "@nomadetulum",
    author_avatar: "\u{1F52E}",
    content: "Breathwork & Sound Journey \u2014 Biodinamic breathwork 11:30am & sound journey 6pm at Nomade. La magia del tarot workshop 5pm at Crudo. Heal, breathe, transform.",
    image_url: "https://i2.wp.com/bellaworldtravels.com/wp-content/uploads/2021/01/DSC3350.jpg?ssl=1",
    metadata: { likes_count: 37, replies_count: 5 },
    created_at: "2026-02-19T11:30:00Z",
    updated_at: "2026-02-19T11:30:00Z",
  },
  {
    id: "sample-6",
    author_id: "sample",
    author_name: "Mamazul",
    author_handle: "@mamazultulum",
    author_avatar: "\u{1F3B5}",
    content: "Musica en Vivo & Mezcal \u2014 Live music at Mamazul 8pm. Mezcal, good vibes, and the best live sounds in Tulum. Come as you are.",
    image_url: "https://mezcaleriamamazul.com/wp-content/uploads/2025/03/mezcaleria.jpg",
    metadata: { likes_count: 63, replies_count: 9 },
    created_at: "2026-02-19T20:00:00Z",
    updated_at: "2026-02-19T20:00:00Z",
  },
];

export function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}
