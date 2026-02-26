import type { LocalEvent } from "@/hooks/useLocalEvents";

export const SAMPLE_EVENTS: LocalEvent[] = [
  {
    id: "sample-thu-26-night",
    author_id: "sample",
    author_name: "Insider Picks",
    author_handle: "@insiderstulum",
    author_avatar: "📍",
    content: "Tulum After Dark",
    image_url: null,
    metadata: {
      card_style: "jungle-night",
      likes_count: 0,
      replies_count: 0,
      venues: [
        { name: "Bacab", time: "7:30pm", desc: "Artery: Apoteosis de un retrato × Luis Trujillo" },
        { name: "Vagalume", time: "8pm", desc: "Kintar & Paige × Summerians" },
        { name: "Nomade", time: "7:30pm", desc: "Origins × Forbidden Fruit y juicifer" },
        { name: "Ziggy Beach", time: "7pm", desc: "La bombonera band" },
        { name: "Veleta Market", time: "9pm", desc: "Flamenco en vivo" },
        { name: "Bipolar", time: "5pm", desc: "Games & negronis · $200mxn" },
      ],
    },
    created_at: "2026-02-26T19:00:00Z",
    updated_at: "2026-02-26T19:00:00Z",
  },
  {
    id: "sample-fri-27-day",
    author_id: "sample",
    author_name: "Insider Picks",
    author_handle: "@insiderstulum",
    author_avatar: "📍",
    content: "Sunrise & Soul",
    image_url: null,
    metadata: {
      card_style: "sunrise-beach",
      likes_count: 0,
      replies_count: 0,
      venues: [
        { name: "Arena", time: "5:30am", desc: "Sadhana · Strength flow con Handpan · Kundalini fit 11am" },
        { name: "Ikal", time: "8:30am", desc: "Hatha Yoga · Ashtanga · Vibrational Sound journey 5pm" },
        { name: "Panamera", time: "5:30pm", desc: "@Roof Beats by Mada mada" },
        { name: "Azulik Mirador", time: "Sunset", desc: "Drinks con DJ live" },
        { name: "Neek", time: "All day", desc: "Lagoon day & temazcal" },
        { name: "Veleta Market", time: "9pm", desc: "Somos collective" },
      ],
    },
    created_at: "2026-02-27T05:30:00Z",
    updated_at: "2026-02-27T05:30:00Z",
  },
  {
    id: "sample-fri-27-night",
    author_id: "sample",
    author_name: "Insider Picks",
    author_handle: "@insiderstulum",
    author_avatar: "📍",
    content: "Cenote Nights",
    image_url: null,
    metadata: {
      card_style: "cenote-night",
      likes_count: 0,
      replies_count: 0,
      venues: [
        { name: "Naum", time: "7pm", desc: "Cenote concert: Reka Fodor + Lumbrero + Toygun" },
        { name: "Vagalume", time: "7pm", desc: "Ten ibiza × Oriol Calvo" },
        { name: "Ziggy Beach", time: "7pm", desc: "La Cocoson · salsa night" },
        { name: "Gitano Jungle", time: "8pm", desc: "Gypsy night" },
        { name: "Xieltun", time: "5:30pm", desc: "Soundhealing × nectar de estrellas" },
        { name: "La Pizzine", time: "10pm", desc: "Dancing seguro" },
      ],
    },
    created_at: "2026-02-27T19:00:00Z",
    updated_at: "2026-02-27T19:00:00Z",
  },
  {
    id: "sample-sat-28-day",
    author_id: "sample",
    author_name: "Insider Picks",
    author_handle: "@insiderstulum",
    author_avatar: "📍",
    content: "Jungle Flow",
    image_url: null,
    metadata: {
      card_style: "tropical-day",
      likes_count: 0,
      replies_count: 0,
      venues: [
        { name: "Arena", time: "8:30am", desc: "Heart of yoga · Balance flow 10:30am" },
        { name: "Ikal", time: "8:30am", desc: "Yoga · Astrology readings · Cacao gathering 6pm" },
        { name: "Umi Tulum", time: "12pm", desc: "Torneo de volleyball" },
        { name: "Melimeli", time: "9:30am", desc: "Taller de muralismo" },
        { name: "Bacab", time: "9am", desc: "Open yoga kundalini" },
        { name: "Neek Lagoon", time: "12pm", desc: "Mom & Friends" },
      ],
    },
    created_at: "2026-02-28T08:30:00Z",
    updated_at: "2026-02-28T08:30:00Z",
  },
  {
    id: "sample-sat-28-night",
    author_id: "sample",
    author_name: "Insider Picks",
    author_handle: "@insiderstulum",
    author_avatar: "📍",
    content: "Under the Full Moon",
    image_url: null,
    metadata: {
      card_style: "full-moon",
      likes_count: 0,
      replies_count: 0,
      venues: [
        { name: "Gitano Beach", time: "3pm", desc: "Full moon × Paige, Prah y the versa" },
        { name: "Arena", time: "3–11pm", desc: "Music under the Stars: 1.am.näda, Dànte, Shane carling" },
        { name: "Chiringuito", time: "1pm", desc: "Ciaobelli takeover · Tantakuy en vivo & Yaku" },
        { name: "Panamera", time: "5:30pm", desc: "Rooftop × Oechler" },
        { name: "Sfer Ik", time: "11am", desc: "Taller de observación y arte botánico" },
        { name: "Dinner", time: "Eve", desc: "Vaiven · La serpiente · Piaggia · Wildflour" },
      ],
    },
    created_at: "2026-02-28T15:00:00Z",
    updated_at: "2026-02-28T15:00:00Z",
  },
];

export function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}
