import { StorageManager } from "./storage.js";

const customSightings = StorageManager.getCustomSightings();

export const fallbackData = {
  sightings: [
    ...customSightings,
    {
      id: "sight-us-west-1",
      type: "confirmed",
      markerStyle: "spider-red",
      title: "West Coast Signal",
      summary: "Siluet merah terdeteksi berayun melintasi jembatan San Francisco.",
      location: { city: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 },
      coordinates: { left: "39.5%", top: "31.5%" },
      occurredAt: "2026-08-14T18:30:00-07:00",
      source: { label: "Web Net Alpha" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-us-west-star",
      type: "event",
      markerStyle: "star",
      title: "Los Angeles Pop-up Grid",
      summary: "Pusat aktivitas sinyal utama area pantai barat.",
      location: { city: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437 },
      coordinates: { left: "40.2%", top: "34.5%" },
      occurredAt: "2026-08-14T12:00:00-07:00",
      source: { label: "Official Beacon" },
      image: "../assets/placeholders/event-card.svg"
    },
    {
      id: "sight-us-east-1",
      type: "confirmed",
      markerStyle: "spider-red",
      title: "New York Rooftop Watch",
      summary: "Penampakan Spider-Man melintasi Manhattan saat patroli malam.",
      location: { city: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
      coordinates: { left: "44.8%", top: "31.0%" },
      occurredAt: "2026-08-14T20:15:00-04:00",
      source: { label: "Daily Bugle Feed" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-us-east-white",
      type: "rumored",
      markerStyle: "spider-white",
      title: "Boston Signal Anomaly",
      summary: "Frekuensi aneh terekam di menara komunikasi timur.",
      location: { city: "Boston", country: "United States", lat: 42.3601, lng: -71.0589 },
      coordinates: { left: "46.5%", top: "29.5%" },
      occurredAt: "2026-08-14T21:40:00-04:00",
      source: { label: "Radio Scanner" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-mexico-star",
      type: "event",
      markerStyle: "star",
      title: "Mexico City Web Point",
      summary: "Hub penghubung jaringan spider Amerika Tengah.",
      location: { city: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
      coordinates: { left: "42.8%", top: "39.0%" },
      occurredAt: "2026-08-13T16:00:00-06:00",
      source: { label: "Network Node" },
      image: "../assets/placeholders/event-card.svg"
    },
    {
      id: "sight-us-south-green",
      type: "confirmed",
      markerStyle: "spider-green",
      title: "Miami Coastal Signal",
      summary: "Jejak jaring terdeteksi di dermaga selatan.",
      location: { city: "Miami", country: "United States", lat: 25.7617, lng: -80.1918 },
      coordinates: { left: "43.2%", top: "34.8%" },
      occurredAt: "2026-08-13T23:10:00-04:00",
      source: { label: "Field Team" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-colombia-green",
      type: "confirmed",
      markerStyle: "spider-green",
      title: "Bogota High Altitude Trace",
      summary: "Sinyal spider terverifikasi di kawasan pegunungan Andes.",
      location: { city: "Bogota", country: "Colombia", lat: 4.7110, lng: -74.0721 },
      coordinates: { left: "46.2%", top: "44.5%" },
      occurredAt: "2026-08-13T19:30:00-05:00",
      source: { label: "Andes Relay" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-brazil-green",
      type: "confirmed",
      markerStyle: "spider-green",
      title: "Sao Paulo Web Trace",
      summary: "Sensor kota mencatat getaran jaring berkecepatan tinggi.",
      location: { city: "Sao Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
      coordinates: { left: "51.0%", top: "51.5%" },
      occurredAt: "2026-08-12T14:20:00-03:00",
      source: { label: "South Grid" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-argentina-red",
      type: "confirmed",
      markerStyle: "spider-red",
      title: "Buenos Aires Sighting",
      summary: "Penampakan kostum merah biru di atas gedung obelisco.",
      location: { city: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
      coordinates: { left: "48.8%", top: "56.0%" },
      occurredAt: "2026-08-12T22:00:00-03:00",
      source: { label: "Field Eye" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-chile-star",
      type: "event",
      markerStyle: "star",
      title: "Santiago Beacon Point",
      summary: "Stasiun relay sinyal Pasifik Selatan aktif.",
      location: { city: "Santiago", country: "Chile", lat: -33.4489, lng: -70.6693 },
      coordinates: { left: "47.0%", top: "55.0%" },
      occurredAt: "2026-08-11T10:00:00-04:00",
      source: { label: "Pacific Node" },
      image: "../assets/placeholders/event-card.svg"
    },
    {
      id: "sight-uk-star",
      type: "event",
      markerStyle: "star",
      title: "London Spider-Base",
      summary: "Markas spider UK mendeteksi transmisi lintas dimensi.",
      location: { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
      coordinates: { left: "56.8%", top: "24.5%" },
      occurredAt: "2026-08-14T17:00:00+01:00",
      source: { label: "Euro Grid" },
      image: "../assets/placeholders/event-card.svg"
    },
    {
      id: "sight-norway-star",
      type: "event",
      markerStyle: "star",
      title: "Oslo Nordic Relay",
      summary: "Stasiun pengamatan utara memonitor aurora webbing.",
      location: { city: "Oslo", country: "Norway", lat: 59.9139, lng: 10.7522 },
      coordinates: { left: "58.0%", top: "21.5%" },
      occurredAt: "2026-08-14T09:30:00+02:00",
      source: { label: "Nordic Watch" },
      image: "../assets/placeholders/event-card.svg"
    },
    {
      id: "sight-france-green",
      type: "confirmed",
      markerStyle: "spider-green",
      title: "Paris Roof Trace",
      summary: "Pantulan jejak jaring di monumen kota Paris.",
      location: { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
      coordinates: { left: "57.5%", top: "26.5%" },
      occurredAt: "2026-08-14T21:10:00+02:00",
      source: { label: "Euro Sighting" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-germany-green",
      type: "confirmed",
      markerStyle: "spider-green",
      title: "Berlin Central Pulse",
      summary: "Pola gelombang spider berulang di menara TV Berlin.",
      location: { city: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050 },
      coordinates: { left: "59.2%", top: "25.0%" },
      occurredAt: "2026-08-14T19:45:00+02:00",
      source: { label: "Berlin Hub" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-spain-red",
      type: "confirmed",
      markerStyle: "spider-red",
      title: "Madrid Night Signal",
      summary: "Sosok pahlawan bertopeng terkonfirmasi membantu warga lokal.",
      location: { city: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
      coordinates: { left: "56.4%", top: "28.5%" },
      occurredAt: "2026-08-13T23:50:00+02:00",
      source: { label: "Citizen Post" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-italy-green",
      type: "confirmed",
      markerStyle: "spider-green",
      title: "Rome Web Activity",
      summary: "Jaring laba-laba elastis ditemukan di atas colosseum.",
      location: { city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
      coordinates: { left: "59.5%", top: "30.0%" },
      occurredAt: "2026-08-13T20:15:00+02:00",
      source: { label: "Rome Unit" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-greece-green",
      "type": "confirmed",
      markerStyle: "spider-green",
      title: "Athens Acropolis Beacon",
      summary: "Pancaran sinyal spider kuno aktif kembali.",
      location: { city: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275 },
      coordinates: { left: "62.0%", top: "33.5%" },
      occurredAt: "2026-08-12T18:00:00+03:00",
      source: { label: "Hellenic Node" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-mideast-star1",
      type: "event",
      markerStyle: "star",
      title: "Arabian Hub Terminal",
      summary: "Node jaringan pengawasan Timur Tengah.",
      location: { city: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753 },
      coordinates: { left: "64.2%", top: "36.0%" },
      occurredAt: "2026-08-14T11:00:00+03:00",
      source: { label: "Desert Node" },
      image: "../assets/placeholders/event-card.svg"
    },
    {
      id: "sight-mideast-star2",
      type: "event",
      markerStyle: "star",
      title: "Dubai Sky Relay",
      summary: "Pengujian sensor jaring frekuensi tinggi di gedung tertinggi.",
      location: { city: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
      coordinates: { left: "65.5%", top: "35.5%" },
      occurredAt: "2026-08-14T14:30:00+04:00",
      source: { label: "Gulf Beacon" },
      image: "../assets/placeholders/event-card.svg"
    },
    {
      id: "sight-china-star",
      type: "event",
      markerStyle: "star",
      title: "Shanghai Master Node",
      summary: "Pusat koordinasi spider-verse regional Asia Timur.",
      location: { city: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737 },
      coordinates: { left: "76.4%", top: "31.5%" },
      occurredAt: "2026-08-14T16:00:00+08:00",
      source: { label: "East Asia Grid" },
      image: "../assets/placeholders/event-card.svg"
    },
    {
      id: "sight-tokyo-green",
      type: "confirmed",
      markerStyle: "spider-green",
      title: "Tokyo Neon Swing",
      summary: "Acrobatic swing Spider-Man di kawasan Shibuya saat hujan neon.",
      location: { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
      coordinates: { left: "75.2%", top: "34.5%" },
      occurredAt: "2026-08-14T21:00:00+09:00",
      source: { label: "Tokyo Field Eye" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-hk-star",
      type: "event",
      markerStyle: "star",
      title: "Hong Kong Harbor Station",
      summary: "Relay maritim untuk transmisi data antar pulau.",
      location: { city: "Hong Kong", country: "China", lat: 22.3193, lng: 114.1694 },
      coordinates: { left: "74.5%", top: "36.8%" },
      occurredAt: "2026-08-13T15:20:00+08:00",
      source: { label: "Harbor Beacon" },
      image: "../assets/placeholders/event-card.svg"
    },
    {
      id: "sight-thailand-green",
      type: "confirmed",
      markerStyle: "spider-green",
      title: "Bangkok Night Patrol",
      summary: "Penyelamatan lalu lintas cepat oleh Spider-Man di jembatan layang.",
      location: { city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
      coordinates: { left: "75.2%", top: "39.0%" },
      occurredAt: "2026-08-13T20:45:00+07:00",
      source: { label: "SE Asia Grid" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-jakarta-star",
      type: "event",
      markerStyle: "star",
      title: "Jakarta Central Grid Node",
      summary: "Stasiun induk Spidey Tracker Indonesia.",
      location: { city: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456 },
      coordinates: { left: "72.8%", top: "43.5%" },
      occurredAt: "2026-08-14T18:30:00+07:00",
      source: { label: "Field Network ID" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-surabaya-green",
      type: "confirmed",
      markerStyle: "spider-green",
      title: "Surabaya Night Watch",
      summary: "Sinyal spider terverifikasi melintas di jembatan Suramadu.",
      location: { city: "Surabaya", country: "Indonesia", lat: -7.2575, lng: 112.7521 },
      coordinates: { left: "73.5%", top: "45.0%" },
      occurredAt: "2026-08-12T16:00:00+07:00",
      source: { label: "East Java Unit" },
      image: "../assets/placeholders/event-card.svg"
    },
    {
      id: "sight-australia-red",
      type: "confirmed",
      markerStyle: "spider-red",
      title: "Sydney Harbor Bridge Sighting",
      summary: "Spider-Man terlihat meluncur di lengkungan jembatan Sydney.",
      location: { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
      coordinates: { left: "25.5%", top: "56.0%" },
      occurredAt: "2026-08-13T17:15:00+10:00",
      source: { label: "Aussie Grid" },
      image: "../assets/placeholders/sighting-card.svg"
    },
    {
      id: "sight-nz-star",
      type: "event",
      markerStyle: "star",
      title: "Auckland Southern Base",
      summary: "Paling selatan dari rangkaian sensor spider global.",
      location: { city: "Auckland", country: "New Zealand", lat: -36.8485, lng: 174.7633 },
      coordinates: { left: "29.8%", top: "55.5%" },
      occurredAt: "2026-08-12T12:00:00+12:00",
      source: { label: "NZ Relay" },
      image: "../assets/placeholders/event-card.svg"
    }
  ],
  events: [
    {
      id: "event-001",
      title: "Jakarta Spider-Verse Premiere Pop-up",
      description: "Experience interaktif dengan photo spot, spider suit replica, dan mini screening.",
      venue: "Grand Hall",
      city: "Jakarta",
      country: "Indonesia",
      date: "12 SEP 2026 · 16:00–22:00",
      image: "../assets/placeholders/event-card.svg",
      coordinates: { left: "72.8%", top: "43.5%" },
      location: { lat: -6.2088, lng: 106.8456 }
    },
    {
      id: "event-002",
      title: "London Signal Lab Weekend",
      description: "Workshop kreatif untuk memecahkan kode transmisi multi-dimensi.",
      venue: "Creative Block 09",
      city: "London",
      country: "United Kingdom",
      date: "03–04 OCT 2026 · 10:00",
      image: "../assets/placeholders/event-card.svg",
      coordinates: { left: "56.8%", top: "24.5%" },
      location: { lat: 51.5074, lng: -0.1278 }
    }
  ],
  villains: [
    { id: "villain-001", name: "The Spot", threatLevel: "high", firstSeen: "04 JUL 2026", summary: "Entitas penjelajah portal multi-dimensi.", image: "../assets/placeholders/villain-card.svg" },
    { id: "villain-002", name: "Green Goblin", threatLevel: "high", firstSeen: "19 JUL 2026", summary: "Ancaman glider udara berteknologi tinggi.", image: "../assets/placeholders/villain-card.svg" },
    { id: "villain-003", name: "The Prowler", threatLevel: "medium", firstSeen: "01 AUG 2026", summary: "Pejuang bayangan dengan sarung tangan bertenaga sonik.", image: "../assets/placeholders/villain-card.svg" }
  ]
};

export const downloadData = {
  wallpapers: [{ title: "Spider-Verse 01", meta: "PNG · 1440×2560", image: "../assets/downloads/wallpaper-signal-01.svg" }],
  stickers: [{ title: "Web Grid Pixel", meta: "SVG · Transparent", image: "../assets/downloads/sticker-web-grid.svg" }],
  emojis: [{ title: "Spidey Eyes", meta: "SVG · 512×512", image: "../assets/downloads/emoji-spider-eye.svg" }]
};

export const panelMeta = {
  "activity-log": { eyebrow: "FIELD NOTES", title: "Activity Log", hint: "Latest signals, sorted by time." },
  report: { eyebrow: "OPEN CHANNEL", title: "Report Sightings", hint: "Send a field report to the network." },
  "web-watch": { eyebrow: "THREAT ARCHIVE", title: "Web Watch", hint: "Known entities and open cases." },
  videos: { eyebrow: "VIDEO CHANNEL", title: "Videos", hint: "Briefings, trailers, and field footage." },
  events: { eyebrow: "PUBLIC SIGNALS", title: "Events", hint: "Upcoming activity near the network." },
  help: { eyebrow: "ORIENTATION", title: "Help", hint: "A short guide to the tracker." },
  downloads: { eyebrow: "SIGNAL PACK", title: "Downloads", hint: "Original placeholder assets for the prototype." },
  detail: { eyebrow: "SIGNAL DETAIL", title: "Field Detail", hint: "Source record and location context." }
};

export const appState = {
  data: { ...fallbackData },
  currentPanel: null,
  previousPanel: "activity-log",
  activeLogFilter: "all",
  activeDownloadTab: "wallpapers",
  activeMapFilter: "all",
  mapZoom: 2
};

export function loadExternalData() {
  return Promise.allSettled([
    fetch("../data/sample-sightings.json").then((r) => r.json()),
    fetch("../data/sample-events.json").then((r) => r.json()),
    fetch("../data/sample-villains.json").then((r) => r.json())
  ]).then((results) => {
    const [sightings, events, villains] = results;
    if (sightings.status === "fulfilled") {
      appState.data.sightings = sightings.value.map((item, index) => ({
        ...item,
        city: item.location?.city || item.city || "Unknown",
        country: item.location?.country || item.country || "",
        date: new Date(item.occurredAt || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
        time: new Date(item.occurredAt || Date.now()).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        coordinates: item.coordinates || fallbackData.sightings[index]?.coordinates || { left: "50%", top: "50%" },
        markerStyle: item.markerStyle || (item.type === "event" ? "star" : item.type === "rumored" ? "spider-white" : "spider-red"),
        location: item.location || { lat: 0, lng: 0 },
        image: item.media?.[0]?.src || "../assets/placeholders/sighting-card.svg",
        source: item.source?.label || "Field report"
      }));
    }
    if (events.status === "fulfilled") {
      appState.data.events = events.value.map((item, index) => ({
        ...item,
        date: item.date || `${new Date(item.startsAt || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()} · 18:00`,
        image: item.heroImage || "../assets/placeholders/event-card.svg",
        coordinates: fallbackData.events[index]?.coordinates || { left: "50%", top: "50%" },
        location: item.location || { lat: 0, lng: 0 }
      }));
    }
    if (villains.status === "fulfilled") {
      appState.data.villains = villains.value.map((item) => ({
        ...item,
        firstSeen: new Date(item.firstSeen || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
        image: item.portrait || "../assets/placeholders/villain-card.svg"
      }));
    }
  });
}
