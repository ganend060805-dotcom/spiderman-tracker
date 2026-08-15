/* =============================================
   SPIDEY TRACKER — Standalone Application Core
   Self-contained: Runs 100% in file:// and http:// environments
   ============================================= */

(function () {
  "use strict";

  /* ---------- 1. RETRO 8-BIT AUDIO SYNTHESIZER ---------- */
  class RetroAudioSystem {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.volume = 0.25;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    toggleSound() {
      this.enabled = !this.enabled;
      if (this.enabled) {
        this.init();
        this.playChime();
      }
      return this.enabled;
    }

    setSound(state) {
      this.enabled = Boolean(state);
      if (this.enabled) this.init();
    }

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      } catch (_) {}
    }

    playRadarPing() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(this.volume * 0.6, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
      } catch (_) {}
    }

    playAlert() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(780, now + 0.08);
        osc.frequency.setValueAtTime(1040, now + 0.16);
        gain.gain.setValueAtTime(this.volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.28);
      } catch (_) {}
    }

    playSuccess() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const notes = [330, 440, 550, 660, 880];
        const now = this.ctx.currentTime;
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "square";
          osc.frequency.value = freq;
          const startTime = now + i * 0.05;
          const duration = 0.09;
          gain.gain.setValueAtTime(this.volume * 0.4, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      } catch (_) {}
    }

    playError() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.setValueAtTime(90, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(this.volume * 0.6, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
      } catch (_) {}
    }

    playChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [600, 900].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(this.volume * 0.5, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.12);
        });
      } catch (_) {}
    }
  }

  const sound = new RetroAudioSystem();

  /* ---------- 2. STORAGE MANAGER ---------- */
  const STORAGE_KEYS = {
    CUSTOM_SIGHTINGS: "spidey_custom_sightings",
    SOUND_ENABLED: "spidey_sound_enabled",
    INTRO_SEEN: "spidey_intro_seen",
    TERMINAL_HISTORY: "spidey_terminal_history"
  };

  class StorageManager {
    static getCustomSightings() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SIGHTINGS);
        return raw ? JSON.parse(raw) : [];
      } catch (_) {
        return [];
      }
    }
    static saveCustomSighting(sighting) {
      try {
        const current = this.getCustomSightings();
        current.unshift(sighting);
        localStorage.setItem(STORAGE_KEYS.CUSTOM_SIGHTINGS, JSON.stringify(current));
        return true;
      } catch (_) {
        return false;
      }
    }
    static getSoundEnabled() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
        return raw === null ? true : raw === "true";
      } catch (_) {
        return true;
      }
    }
    static setSoundEnabled(enabled) {
      try {
        localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
      } catch (_) {}
    }
    static getIntroSeen() {
      try {
        return sessionStorage.getItem(STORAGE_KEYS.INTRO_SEEN) === "true";
      } catch (_) {
        return false;
      }
    }
    static setIntroSeen() {
      try {
        sessionStorage.setItem(STORAGE_KEYS.INTRO_SEEN, "true");
      } catch (_) {}
    }
    static getTerminalHistory() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.TERMINAL_HISTORY);
        return raw ? JSON.parse(raw) : [];
      } catch (_) {
        return [];
      }
    }
    static pushTerminalHistory(cmd) {
      try {
        if (!cmd || !cmd.trim()) return;
        const history = this.getTerminalHistory();
        history.push(cmd.trim());
        if (history.length > 50) history.shift();
        localStorage.setItem(STORAGE_KEYS.TERMINAL_HISTORY, JSON.stringify(history));
      } catch (_) {}
    }
  }

  /* ---------- 3. ASSET DOWNLOADER & GENERATOR ---------- */
  class AssetDownloader {
    static triggerDownload(url, filename) {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "spidey-asset";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 100);
    }

    static downloadWallpaper(title = "Spidey-Signal-Wallpaper") {
      const canvas = document.createElement("canvas");
      canvas.width = 1440;
      canvas.height = 2560;
      const ctx = canvas.getContext("2d");

      // Gradient background
      const grad = ctx.createRadialGradient(720, 1280, 100, 720, 1280, 1400);
      grad.addColorStop(0, "#094eb8");
      grad.addColorStop(0.5, "#00338a");
      grad.addColorStop(1, "#00133a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1440, 2560);

      // Spider Web Circles
      ctx.strokeStyle = "rgba(88, 196, 216, 0.25)";
      ctx.lineWidth = 4;
      for (let r = 100; r <= 1000; r += 120) {
        ctx.beginPath();
        ctx.arc(720, 1280, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(720, 1280);
        ctx.lineTo(720 + Math.cos(angle) * 1200, 1280 + Math.sin(angle) * 1200);
        ctx.stroke();
      }

      // Center Spidey Head
      ctx.fillStyle = "#e63946";
      ctx.beginPath();
      ctx.arc(720, 1280, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 12;
      ctx.strokeStyle = "#000000";
      ctx.stroke();

      // Eyes
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(670, 1270, 45, 60, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(770, 1270, 45, 60, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 56px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SPIDEY TRACKER // FIELD NETWORK", 720, 1600);

      ctx.fillStyle = "#58c4d8";
      ctx.font = "32px monospace";
      ctx.fillText("GLOBAL SIGNAL RADAR", 720, 1660);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        this.triggerDownload(url, `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }, "image/png");
    }

    static downloadEventCalendar(event) {
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Spidey Tracker//Field Events//EN",
        "BEGIN:VEVENT",
        `SUMMARY:Spider-Man Event: ${event.title}`,
        `DESCRIPTION:${event.description || "Spidey Tracker public signal"}`,
        `LOCATION:${event.venue || ""}, ${event.city || ""}, ${event.country || ""}`,
        `DTSTART:20260912T090000Z`,
        `DTEND:20260912T150000Z`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      this.triggerDownload(url, `spidey-event-${event.id || "invite"}.ics`);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
  }

  /* ---------- 4. APPLICATION STATE & DATA ---------- */
  const customSightings = StorageManager.getCustomSightings();

  const fallbackSightings = [
    ...customSightings,
    { id: "sight-us-west-1", type: "confirmed", markerStyle: "spider-red", title: "West Coast Signal", summary: "Siluet merah terdeteksi berayun melintasi jembatan San Francisco.", city: "San Francisco", country: "United States", location: { lat: 37.7749, lng: -122.4194 }, coordinates: { left: "39.5%", top: "31.5%" }, date: "14 AUG 2026", time: "18:30", source: { label: "Web Net Alpha" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-us-west-star", type: "event", markerStyle: "star", title: "Los Angeles Pop-up Grid", summary: "Pusat aktivitas sinyal utama area pantai barat.", city: "Los Angeles", country: "United States", location: { lat: 34.0522, lng: -118.2437 }, coordinates: { left: "40.2%", top: "34.5%" }, date: "14 AUG 2026", time: "12:00", source: { label: "Official Beacon" }, image: "../assets/placeholders/event-card.svg" },
    { id: "sight-us-east-1", type: "confirmed", markerStyle: "spider-red", title: "New York Rooftop Watch", summary: "Penampakan Spider-Man melintasi Manhattan saat patroli malam.", city: "New York", country: "United States", location: { lat: 40.7128, lng: -74.0060 }, coordinates: { left: "44.8%", top: "31.0%" }, date: "14 AUG 2026", time: "20:15", source: { label: "Daily Bugle Feed" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-us-east-white", type: "rumored", markerStyle: "spider-white", title: "Boston Signal Anomaly", summary: "Frekuensi aneh terekam di menara komunikasi timur.", city: "Boston", country: "United States", location: { lat: 42.3601, lng: -71.0589 }, coordinates: { left: "46.5%", top: "29.5%" }, date: "14 AUG 2026", time: "21:40", source: { label: "Radio Scanner" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-mexico-star", type: "event", markerStyle: "star", title: "Mexico City Web Point", summary: "Hub penghubung jaringan spider Amerika Tengah.", city: "Mexico City", country: "Mexico", location: { lat: 19.4326, lng: -99.1332 }, coordinates: { left: "42.8%", top: "39.0%" }, date: "13 AUG 2026", time: "16:00", source: { label: "Network Node" }, image: "../assets/placeholders/event-card.svg" },
    { id: "sight-us-south-green", type: "confirmed", markerStyle: "spider-green", title: "Miami Coastal Signal", summary: "Jejak jaring terdeteksi di dermaga selatan.", city: "Miami", country: "United States", location: { lat: 25.7617, lng: -80.1918 }, coordinates: { left: "43.2%", top: "34.8%" }, date: "13 AUG 2026", time: "23:10", source: { label: "Field Team" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-colombia-green", type: "confirmed", markerStyle: "spider-green", title: "Bogota High Altitude Trace", summary: "Sinyal spider terverifikasi di kawasan pegunungan Andes.", city: "Bogota", country: "Colombia", location: { lat: 4.7110, lng: -74.0721 }, coordinates: { left: "46.2%", top: "44.5%" }, date: "13 AUG 2026", time: "19:30", source: { label: "Andes Relay" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-brazil-green", type: "confirmed", markerStyle: "spider-green", title: "Sao Paulo Web Trace", summary: "Sensor kota mencatat getaran jaring berkecepatan tinggi.", city: "Sao Paulo", country: "Brazil", location: { lat: -23.5505, lng: -46.6333 }, coordinates: { left: "51.0%", top: "51.5%" }, date: "12 AUG 2026", time: "14:20", source: { label: "South Grid" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-argentina-red", type: "confirmed", markerStyle: "spider-red", title: "Buenos Aires Sighting", summary: "Penampakan kostum merah biru di atas gedung obelisco.", city: "Buenos Aires", country: "Argentina", location: { lat: -34.6037, lng: -58.3816 }, coordinates: { left: "48.8%", top: "56.0%" }, date: "12 AUG 2026", time: "22:00", source: { label: "Field Eye" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-chile-star", type: "event", markerStyle: "star", title: "Santiago Beacon Point", summary: "Stasiun relay sinyal Pasifik Selatan aktif.", city: "Santiago", country: "Chile", location: { lat: -33.4489, lng: -70.6693 }, coordinates: { left: "47.0%", top: "55.0%" }, date: "11 AUG 2026", time: "10:00", source: { label: "Pacific Node" }, image: "../assets/placeholders/event-card.svg" },
    { id: "sight-uk-star", type: "event", markerStyle: "star", title: "London Spider-Base", summary: "Markas spider UK mendeteksi transmisi lintas dimensi.", city: "London", country: "United Kingdom", location: { lat: 51.5074, lng: -0.1278 }, coordinates: { left: "56.8%", top: "24.5%" }, date: "14 AUG 2026", time: "17:00", source: { label: "Euro Grid" }, image: "../assets/placeholders/event-card.svg" },
    { id: "sight-norway-star", type: "event", markerStyle: "star", title: "Oslo Nordic Relay", summary: "Stasiun pengamatan utara memonitor aurora webbing.", city: "Oslo", country: "Norway", location: { lat: 59.9139, lng: 10.7522 }, coordinates: { left: "58.0%", top: "21.5%" }, date: "14 AUG 2026", time: "09:30", source: { label: "Nordic Watch" }, image: "../assets/placeholders/event-card.svg" },
    { id: "sight-france-green", type: "confirmed", markerStyle: "spider-green", title: "Paris Roof Trace", summary: "Pantulan jejak jaring di monumen kota Paris.", city: "Paris", country: "France", location: { lat: 48.8566, lng: 2.3522 }, coordinates: { left: "57.5%", top: "26.5%" }, date: "14 AUG 2026", time: "21:10", source: { label: "Euro Sighting" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-germany-green", type: "confirmed", markerStyle: "spider-green", title: "Berlin Central Pulse", summary: "Pola gelombang spider berulang di menara TV Berlin.", city: "Berlin", country: "Germany", location: { lat: 52.5200, lng: 13.4050 }, coordinates: { left: "59.2%", top: "25.0%" }, date: "14 AUG 2026", time: "19:45", source: { label: "Berlin Hub" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-spain-red", type: "confirmed", markerStyle: "spider-red", title: "Madrid Night Signal", summary: "Sosok pahlawan bertopeng terkonfirmasi membantu warga lokal.", city: "Madrid", country: "Spain", location: { lat: 40.4168, lng: -3.7038 }, coordinates: { left: "56.4%", top: "28.5%" }, date: "13 AUG 2026", time: "23:50", source: { label: "Citizen Post" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-italy-green", type: "confirmed", markerStyle: "spider-green", title: "Rome Web Activity", summary: "Jaring laba-laba elastis ditemukan di atas colosseum.", city: "Rome", country: "Italy", location: { lat: 41.9028, lng: 12.4964 }, coordinates: { left: "59.5%", top: "30.0%" }, date: "13 AUG 2026", time: "20:15", source: { label: "Rome Unit" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-greece-green", type: "confirmed", markerStyle: "spider-green", title: "Athens Acropolis Beacon", summary: "Pancaran sinyal spider kuno aktif kembali.", city: "Athens", country: "Greece", location: { lat: 37.9838, lng: 23.7275 }, coordinates: { left: "62.0%", top: "33.5%" }, date: "12 AUG 2026", time: "18:00", source: { label: "Hellenic Node" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-mideast-star1", type: "event", markerStyle: "star", title: "Arabian Hub Terminal", summary: "Node jaringan pengawasan Timur Tengah.", city: "Riyadh", country: "Saudi Arabia", location: { lat: 24.7136, lng: 46.6753 }, coordinates: { left: "64.2%", top: "36.0%" }, date: "14 AUG 2026", time: "11:00", source: { label: "Desert Node" }, image: "../assets/placeholders/event-card.svg" },
    { id: "sight-mideast-star2", type: "event", markerStyle: "star", title: "Dubai Sky Relay", summary: "Pengujian sensor jaring frekuensi tinggi di gedung tertinggi.", city: "Dubai", country: "UAE", location: { lat: 25.2048, lng: 55.2708 }, coordinates: { left: "65.5%", top: "35.5%" }, date: "14 AUG 2026", time: "14:30", source: { label: "Gulf Beacon" }, image: "../assets/placeholders/event-card.svg" },
    { id: "sight-china-star", type: "event", markerStyle: "star", title: "Shanghai Master Node", summary: "Pusat koordinasi spider-verse regional Asia Timur.", city: "Shanghai", country: "China", location: { lat: 31.2304, lng: 121.4737 }, coordinates: { left: "76.4%", top: "31.5%" }, date: "14 AUG 2026", time: "16:00", source: { label: "East Asia Grid" }, image: "../assets/placeholders/event-card.svg" },
    { id: "sight-tokyo-green", type: "confirmed", markerStyle: "spider-green", title: "Tokyo Neon Swing", summary: "Acrobatic swing Spider-Man di kawasan Shibuya saat hujan neon.", city: "Tokyo", country: "Japan", location: { lat: 35.6762, lng: 139.6503 }, coordinates: { left: "75.2%", top: "34.5%" }, date: "14 AUG 2026", time: "21:00", source: { label: "Tokyo Field Eye" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-hk-star", type: "event", markerStyle: "star", title: "Hong Kong Harbor Station", summary: "Relay maritim untuk transmisi data antar pulau.", city: "Hong Kong", country: "China", location: { lat: 22.3193, lng: 114.1694 }, coordinates: { left: "74.5%", top: "36.8%" }, date: "13 AUG 2026", time: "15:20", source: { label: "Harbor Beacon" }, image: "../assets/placeholders/event-card.svg" },
    { id: "sight-thailand-green", type: "confirmed", markerStyle: "spider-green", title: "Bangkok Night Patrol", summary: "Penyelamatan lalu lintas cepat oleh Spider-Man di jembatan layang.", city: "Bangkok", country: "Thailand", location: { lat: 13.7563, lng: 100.5018 }, coordinates: { left: "75.2%", top: "39.0%" }, date: "13 AUG 2026", time: "20:45", source: { label: "SE Asia Grid" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-jakarta-star", type: "event", markerStyle: "star", title: "Jakarta Central Grid Node", summary: "Stasiun induk Spidey Tracker Indonesia.", city: "Jakarta", country: "Indonesia", location: { lat: -6.2088, lng: 106.8456 }, coordinates: { left: "72.8%", top: "43.5%" }, date: "14 AUG 2026", time: "18:30", source: { label: "Field Network ID" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-surabaya-green", type: "confirmed", markerStyle: "spider-green", title: "Surabaya Night Watch", summary: "Sinyal spider terverifikasi melintas di jembatan Suramadu.", city: "Surabaya", country: "Indonesia", location: { lat: -7.2575, lng: 112.7521 }, coordinates: { left: "73.5%", top: "45.0%" }, date: "12 AUG 2026", time: "16:00", source: { label: "East Java Unit" }, image: "../assets/placeholders/event-card.svg" },
    { id: "sight-australia-red", type: "confirmed", markerStyle: "spider-red", title: "Sydney Harbor Bridge Sighting", summary: "Spider-Man terlihat meluncur di lengkungan jembatan Sydney.", city: "Sydney", country: "Australia", location: { lat: -33.8688, lng: 151.2093 }, coordinates: { left: "25.5%", top: "56.0%" }, date: "13 AUG 2026", time: "17:15", source: { label: "Aussie Grid" }, image: "../assets/placeholders/sighting-card.svg" },
    { id: "sight-nz-star", type: "event", markerStyle: "star", title: "Auckland Southern Base", summary: "Paling selatan dari rangkaian sensor spider global.", city: "Auckland", country: "New Zealand", location: { lat: -36.8485, lng: 174.7633 }, coordinates: { left: "29.8%", top: "55.5%" }, date: "12 AUG 2026", time: "12:00", source: { label: "NZ Relay" }, image: "../assets/placeholders/event-card.svg" }
  ];

  const appState = {
    data: {
      sightings: fallbackSightings,
      events: [
        { id: "event-001", title: "Jakarta Spider-Verse Premiere Pop-up", description: "Experience interaktif dengan photo spot, spider suit replica, dan mini screening.", venue: "Grand Hall", city: "Jakarta", country: "Indonesia", date: "12 SEP 2026 · 16:00–22:00", image: "../assets/placeholders/event-card.svg", coordinates: { left: "72.8%", top: "43.5%" }, location: { lat: -6.2088, lng: 106.8456 } },
        { id: "event-002", title: "London Signal Lab Weekend", description: "Workshop kreatif untuk memecahkan kode transmisi multi-dimensi.", venue: "Creative Block 09", city: "London", country: "United Kingdom", date: "03–04 OCT 2026 · 10:00", image: "../assets/placeholders/event-card.svg", coordinates: { left: "56.8%", top: "24.5%" }, location: { lat: 51.5074, lng: -0.1278 } }
      ],
      villains: [
        { id: "villain-001", name: "The Spot", threatLevel: "high", firstSeen: "04 JUL 2026", summary: "Entitas penjelajah portal multi-dimensi.", image: "../assets/placeholders/villain-card.svg" },
        { id: "villain-002", name: "Green Goblin", threatLevel: "high", firstSeen: "19 JUL 2026", summary: "Ancaman glider udara berteknologi tinggi.", image: "../assets/placeholders/villain-card.svg" },
        { id: "villain-003", name: "The Prowler", threatLevel: "medium", firstSeen: "01 AUG 2026", summary: "Pejuang bayangan dengan sarung tangan bertenaga sonik.", image: "../assets/placeholders/villain-card.svg" }
      ]
    },
    downloadData: {
      wallpapers: [{ title: "Spider-Verse 01", meta: "PNG · 1440×2560", image: "../assets/downloads/wallpaper-signal-01.svg" }],
      stickers: [{ title: "Web Grid Pixel", meta: "SVG · Transparent", image: "../assets/downloads/sticker-web-grid.svg" }],
      emojis: [{ title: "Spidey Eyes", meta: "SVG · 512×512", image: "../assets/downloads/emoji-spider-eye.svg" }]
    },
    currentPanel: null,
    previousPanel: "activity-log",
    activeLogFilter: "all",
    activeDownloadTab: "wallpapers",
    activeMapFilter: "all",
    mapZoom: 2
  };

  const panelMeta = {
    "activity-log": { eyebrow: "FIELD NOTES", title: "Activity Log", hint: "Latest signals, sorted by time." },
    report: { eyebrow: "OPEN CHANNEL", title: "Report Sightings", hint: "Send a field report to the network." },
    "web-watch": { eyebrow: "THREAT ARCHIVE", title: "Web Watch", hint: "Known entities and open cases." },
    videos: { eyebrow: "VIDEO CHANNEL", title: "Videos", hint: "Briefings, trailers, and field footage." },
    events: { eyebrow: "PUBLIC SIGNALS", title: "Events", hint: "Upcoming activity near the network." },
    help: { eyebrow: "ORIENTATION", title: "Help", hint: "A short guide to the tracker." },
    downloads: { eyebrow: "SIGNAL PACK", title: "Downloads", hint: "Original placeholder assets for the prototype." },
    detail: { eyebrow: "SIGNAL DETAIL", title: "Field Detail", hint: "Source record and location context." }
  };

  /* ---------- 5. UI HELPERS & SELECTORS ---------- */
  let toastTimer;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function statusLabel(type) {
    return { confirmed: "CONFIRMED", rumored: "RUMORED", event: "EVENT" }[type] || (type ? type.toUpperCase() : "SIGNAL");
  }

  function markerAsset(markerStyle, type) {
    if (markerStyle === "star") return "../assets/markers/marker-star.svg";
    if (markerStyle === "spider-green") return "../assets/markers/marker-spider-green.svg";
    if (markerStyle === "spider-white") return "../assets/markers/marker-spider-white.svg";
    if (markerStyle === "spider-red") return "../assets/markers/marker-spider-red.svg";
    if (type === "event") return "../assets/markers/marker-star.svg";
    if (type === "rumored") return "../assets/markers/marker-spider-white.svg";
    return "../assets/markers/marker-spider-red.svg";
  }

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
  }

  /* ---------- 6. MAP & MARKER RENDERING ---------- */
  function renderMarkers(filter = "all") {
    appState.activeMapFilter = filter;
    const wrapper = $("#mapMarkers");
    if (!wrapper) return;

    wrapper.innerHTML = appState.data.sightings
      .filter((item) => filter === "all" || item.type === filter ||
        (filter === "confirmed" && item.markerStyle?.includes("green")) ||
        (filter === "rumored" && item.markerStyle?.includes("red")))
      .map((item) => `
        <button class="map-marker ${item.type} ${item.markerStyle || ''}" type="button"
          data-marker-id="${item.id}"
          data-title="${item.title}"
          data-type="${statusLabel(item.type)}"
          data-location="${item.city || item.location?.city || "Unknown"}"
          data-lat="${item.location?.lat || 0}"
          data-lng="${item.location?.lng || 0}"
          style="left:${item.coordinates.left};top:${item.coordinates.top}"
          aria-label="${statusLabel(item.type)}: ${item.title}">
          <span class="marker-pulse" aria-hidden="true"></span>
          <img src="${markerAsset(item.markerStyle, item.type)}" alt="" />
        </button>
      `).join("");
  }

  function updateMapFrame(lat, lng, zoom = appState.mapZoom) {
    const frame = $("#googleMap");
    if (!frame) return;
    appState.mapZoom = Math.max(1, Math.min(9, zoom));
    // Safe standard roadmap embed url
    frame.src = `https://maps.google.com/maps?ll=${lat},${lng}&z=${appState.mapZoom}&t=m&hl=id&output=embed`;
  }

  function centerMap(position = "global signal grid") {
    sound.playRadarPing();
    if (position === "global") updateMapFrame(20, 10, 2);
    showToast(`Peta dipusatkan pada ${position}.`);
  }

  function centerOnRecord(id) {
    const item = appState.data.sightings.find((entry) => entry.id === id) ||
                 appState.data.events.find((entry) => entry.id === id);
    const location = item?.location || item?.coordinates;
    if (location?.lat && location?.lng) {
      updateMapFrame(location.lat, location.lng, 6);
    }
    document.querySelectorAll(".map-marker").forEach((marker) => {
      marker.classList.toggle("selected", marker.dataset.markerId === id);
    });
    sound.playAlert();
    showToast(`Sinyal terpilih: ${item?.title || "selected signal"} (${item?.city || ""}).`);
  }

  function showMarkerTooltip(marker) {
    const tooltip = $("#markerTooltip");
    const stage = $("#mapStage");
    if (!tooltip || !stage) return;
    const markerRect = marker.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    tooltip.innerHTML = `<strong>${marker.dataset.title}</strong><small>${marker.dataset.type} // ${marker.dataset.location}</small>`;
    tooltip.style.left = `${markerRect.left - stageRect.left + markerRect.width / 2}px`;
    tooltip.style.top = `${markerRect.top - stageRect.top - 12}px`;
    tooltip.hidden = false;
  }

  function hideMarkerTooltip() {
    const tooltip = $("#markerTooltip");
    if (tooltip) tooltip.hidden = true;
  }

  function locateUserPosition() {
    sound.playRadarPing();
    showToast("Mencari koordinat lokasimu...");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          updateMapFrame(lat, lng, 6);
          sound.playSuccess();
          showToast(`Lokasi GPS terdeteksi: [${lat.toFixed(2)}, ${lng.toFixed(2)}]`);
        },
        () => {
          const node = appState.data.sightings[0];
          if (node?.location?.lat) {
            updateMapFrame(node.location.lat, node.location.lng, 5);
          }
          sound.playAlert();
          showToast(`GPS tidak aktif. Memusatkan pada Sinyal: ${node.title}`);
        },
        { timeout: 6000 }
      );
    } else {
      const node = appState.data.sightings[0];
      if (node?.location?.lat) {
        updateMapFrame(node.location.lat, node.location.lng, 5);
      }
      showToast(`Memusatkan pada Sinyal: ${node.title}`);
    }
  }

  /* ---------- 7. SIDE PANEL VIEWS & CONTROLLERS ---------- */
  function updatePanelMeta(name) {
    const meta = panelMeta[name] || panelMeta["activity-log"];
    const eyebrow = $("#panelEyebrow");
    const title = $("#panelTitle");
    const hint = $("#panelHint");
    if (eyebrow) eyebrow.textContent = meta.eyebrow;
    if (title) title.textContent = meta.title;
    if (hint) hint.textContent = meta.hint;
  }

  function setPanelView(name) {
    $$("[data-view]").forEach((view) => {
      view.hidden = view.dataset.view !== name;
    });
    updatePanelMeta(name);
  }

  function openPanel(name, updateUrl = true) {
    if (name === "map") return closePanel(false);
    sound.playClick();
    appState.currentPanel = name;
    setPanelView(name);
    const panel = $("#infoPanel");
    const backdrop = $("#panelBackdrop");
    if (panel) panel.hidden = false;
    if (backdrop) backdrop.hidden = false;

    requestAnimationFrame(() => panel?.classList.add("is-open"));
    panel?.setAttribute("aria-hidden", "false");
    if (updateUrl) history.replaceState(null, "", `#${name}`);

    const focusTarget = $(".close-button", panel);
    setTimeout(() => focusTarget?.focus(), 60);

    if (name === "activity-log") renderActivity(appState.activeLogFilter, $("#activitySearch")?.value || "");
    if (name === "web-watch") renderWebWatch();
    if (name === "events") renderEvents();
    if (name === "downloads") renderDownloads(appState.activeDownloadTab);
  }

  function closePanel(updateUrl = true) {
    sound.playClick();
    appState.currentPanel = null;
    const panel = $("#infoPanel");
    const backdrop = $("#panelBackdrop");
    panel?.classList.remove("is-open");
    panel?.setAttribute("aria-hidden", "true");
    if (updateUrl) history.replaceState(null, "", window.location.pathname);
    setTimeout(() => {
      if (!appState.currentPanel) {
        if (panel) panel.hidden = true;
        if (backdrop) backdrop.hidden = true;
      }
    }, 320);
  }

  function renderActivity(filter = "all", query = "") {
    appState.activeLogFilter = filter;
    const normalizedQuery = query.trim().toLowerCase();
    const items = appState.data.sightings.filter((item) => {
      const matchesFilter = filter === "all" || item.type === filter ||
        (filter === "confirmed" && item.markerStyle?.includes("green")) ||
        (filter === "rumored" && item.markerStyle?.includes("red"));
      const haystack = `${item.title} ${item.city} ${item.country} ${item.source?.label || ""}`.toLowerCase();
      return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
    });

    const panelCount = $("#panelCount");
    if (panelCount) panelCount.textContent = `${String(items.length).padStart(2, "0")} ITEMS`;

    const logList = $("#logList");
    if (logList) {
      logList.innerHTML = items.length
        ? items.map((item) => `
            <button class="log-item" type="button" data-marker-id="${item.id}">
              <img class="log-marker" src="${markerAsset(item.markerStyle, item.type)}" alt="" />
              <span class="log-copy"><strong>${item.title}</strong><small>${item.city}, ${item.country}</small></span>
              <span class="log-meta"><span class="status-badge ${item.type}">${statusLabel(item.type)}</span><span>${item.date}</span></span>
            </button>
          `).join("")
        : `<div class="empty-state">Belum ada sinyal pada pencarian/filter ini.</div>`;
    }

    $$("[data-log-filter]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.logFilter === filter);
    });
  }

  function renderWebWatch() {
    const count = $("#panelCount");
    if (count) count.textContent = `${String(appState.data.villains.length).padStart(2, "0")} CASES`;
    const grid = $("#webWatchGrid");
    if (grid) {
      grid.innerHTML = appState.data.villains.map((villain) => `
        <button class="watch-card" type="button" data-villain-id="${villain.id}">
          <img src="${villain.image}" alt="Portrait ${villain.name}" />
          <span class="watch-card-info">
            <strong>${villain.name}</strong>
            <small>${villain.firstSeen} · ${villain.threatLevel.toUpperCase()}</small>
            <span class="threat-bar ${villain.threatLevel}"><span></span></span>
          </span>
        </button>
      `).join("");
    }
  }

  function renderEvents() {
    const count = $("#panelCount");
    if (count) count.textContent = `${String(appState.data.events.length).padStart(2, "0")} EVENTS`;
    const list = $("#eventList");
    if (list) {
      list.innerHTML = appState.data.events.map((event) => `
        <article class="event-card">
          <img src="${event.image}" alt="Artwork ${event.title}" />
          <div class="event-copy">
            <span class="event-date">${event.date}</span>
            <strong>${event.title}</strong>
            <span class="event-location">${event.venue}<br />${event.city}, ${event.country}</span>
            <div style="display:flex;gap:6px;margin-top:6px;">
              <button class="button button-ghost" type="button" data-event-id="${event.id}">Detail ↗</button>
              <button class="button button-primary" type="button" data-calendar-event="${event.id}">📅 .ICS</button>
            </div>
          </div>
        </article>
      `).join("");
    }
  }

  function renderDownloads(category) {
    appState.activeDownloadTab = category;
    const items = appState.downloadData[category] || [];
    const count = $("#panelCount");
    if (count) count.textContent = `${String(items.length).padStart(2, "0")} FILE`;
    const grid = $("#downloadGrid");
    if (grid) {
      grid.innerHTML = items.map((item) => `
        <article class="download-card">
          <button class="download-preview-trigger" type="button"
            data-asset-preview="${item.image}"
            data-asset-title="${item.title}"
            data-asset-meta="${item.meta}"
            aria-label="Preview ${item.title}">
            <img src="${item.image}" alt="${item.title}" />
          </button>
          <div class="download-card-info"><strong>${item.title}</strong><small>${item.meta}</small></div>
          <button class="button button-primary" type="button" data-download-asset="${item.title}">Download ↓</button>
        </article>
      `).join("");
    }

    $$("[data-download-tab]").forEach((tab) => {
      const active = tab.dataset.downloadTab === category;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
  }

  function openSightingDetail(id) {
    const item = appState.data.sightings.find((s) => s.id === id);
    if (!item) return;
    sound.playAlert();
    appState.previousPanel = appState.currentPanel && appState.currentPanel !== "detail" ? appState.currentPanel : "activity-log";
    const count = $("#panelCount");
    if (count) count.textContent = statusLabel(item.type);
    const content = $("#detailContent");
    if (content) {
      content.innerHTML = `
        <img class="detail-media" src="${item.image}" alt="Media ${item.title}" />
        <div class="detail-heading"><h3>${item.title}</h3><span class="status-badge ${item.type}">${statusLabel(item.type)}</span></div>
        <p class="detail-meta">${item.city}, ${item.country}<br />${item.date} · ${item.time || "18:00"} LOCAL</p>
        <p class="detail-summary">${item.summary}</p>
        <span class="detail-source">SOURCE // ${item.source?.label || "Field Report"}</span>
        <button class="button button-primary button-full" type="button" data-center-marker="${item.id}" style="margin-top:14px">Center on map <span aria-hidden="true">◎</span></button>
      `;
    }
    openPanel("detail");
  }

  function openVillainDetail(id) {
    const villain = appState.data.villains.find((v) => v.id === id);
    if (!villain) return;
    sound.playAlert();
    appState.previousPanel = appState.currentPanel && appState.currentPanel !== "detail" ? appState.currentPanel : "web-watch";
    const count = $("#panelCount");
    if (count) count.textContent = villain.threatLevel.toUpperCase();
    const content = $("#detailContent");
    if (content) {
      content.innerHTML = `
        <img class="detail-media" src="${villain.image}" alt="Portrait ${villain.name}" />
        <div class="detail-heading"><h3>${villain.name}</h3><span class="status-badge ${villain.threatLevel === "high" ? "confirmed" : villain.threatLevel === "medium" ? "rumored" : "event"}">${villain.threatLevel.toUpperCase()}</span></div>
        <p class="detail-meta">FIRST SEEN // ${villain.firstSeen}<br />CASE TYPE // THREAT WATCH</p>
        <p class="detail-summary">${villain.summary}</p>
        <span class="detail-source">DOSSIER // Encrypted Multi-Verse Database Record</span>
      `;
    }
    openPanel("detail");
  }

  function openEventDetail(id) {
    const event = appState.data.events.find((e) => e.id === id);
    if (!event) return;
    sound.playClick();
    appState.previousPanel = appState.currentPanel && appState.currentPanel !== "detail" ? appState.currentPanel : "events";
    const count = $("#panelCount");
    if (count) count.textContent = "UPCOMING";
    const content = $("#detailContent");
    if (content) {
      content.innerHTML = `
        <img class="detail-media" src="${event.image}" alt="Artwork ${event.title}" />
        <div class="detail-heading"><h3>${event.title}</h3><span class="status-badge event">EVENT</span></div>
        <p class="detail-meta">${event.date} LOCAL<br />${event.venue} · ${event.city}, ${event.country}</p>
        <p class="detail-summary">${event.description}</p>
        <span class="detail-source">ORGANIZER // Sony Pictures & Marvel Field Team</span>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px;">
          <button class="button button-primary button-full" type="button" data-center-event="${event.id}">Lihat Lokasi di Peta <span aria-hidden="true">◎</span></button>
          <button class="button button-ghost button-full" type="button" data-calendar-event="${event.id}">Simpan ke Kalender (.ics) 📅</button>
        </div>
      `;
    }
    openPanel("detail");
  }

  function handleReportSubmission(e) {
    if (e) e.preventDefault();
    const cityInput = $("#reportCity");
    const descInput = $("#reportText");
    const typeSelect = $("#reportType");

    const city = cityInput?.value.trim() || "Local Grid";
    const desc = descInput?.value.trim() || "Penampakan Spider-Man di area perkotaan.";
    const type = typeSelect?.value || "confirmed";

    const newReport = {
      id: `sight-user-${Date.now()}`,
      type: type,
      markerStyle: type === "confirmed" ? "spider-red" : type === "rumored" ? "spider-white" : "star",
      title: `Sighting in ${city}`,
      summary: desc,
      location: { city: city, country: "Reported Area", lat: 20 + (Math.random() - 0.5) * 20, lng: 10 + (Math.random() - 0.5) * 40 },
      coordinates: { left: `${35 + Math.random() * 40}%`, top: `${30 + Math.random() * 35}%` },
      occurredAt: new Date().toISOString(),
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      source: { label: "Verified Community Watch" },
      image: "../assets/placeholders/sighting-card.svg"
    };

    StorageManager.saveCustomSighting(newReport);
    appState.data.sightings.unshift(newReport);
    renderMarkers(appState.activeMapFilter);

    sound.playSuccess();
    showToast(`Sinyal baru dilaporkan di ${city}! Marker ditambahkan.`);

    if (cityInput) cityInput.value = "";
    if (descInput) descInput.value = "";
    openPanel("activity-log");
    centerOnRecord(newReport.id);
  }

  /* ---------- 8. MODALS (Video, Asset, Terminal, Intro) ---------- */
  function setupVideoModal() {
    const modal = $("#videoModal");
    const title = $("#videoModalTitle");
    const container = $("#videoFrameContainer");

    document.addEventListener("click", (event) => {
      const videoBtn = event.target.closest("[data-video-title]");
      if (!videoBtn) return;
      sound.playClick();
      const vidTitle = videoBtn.dataset.videoTitle || "Spider-Man: Brand New Day";
      if (title) title.textContent = vidTitle;

      if (container) {
        container.innerHTML = `
          <iframe
            class="pixel-video-embed"
            src="https://www.youtube.com/embed/cqGjhVJWtEg?autoplay=1&rel=0"
            title="${vidTitle}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        `;
      }
      if (modal) modal.hidden = false;
      $("#closeVideo")?.focus();
    });

    const closeVideoPlayer = () => {
      sound.playClick();
      if (container) container.innerHTML = "";
      if (modal) modal.hidden = true;
    };

    $("#closeVideo")?.addEventListener("click", closeVideoPlayer);
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeVideoPlayer();
    });
  }

  function openAssetPreview(image, title, meta) {
    const modal = $("#assetModal");
    if (!modal) return;
    sound.playClick();
    const modalImg = $("#assetModalImage");
    const modalTitle = $("#assetModalTitle");
    const modalMeta = $("#assetModalMeta");
    if (modalImg) { modalImg.src = image; modalImg.alt = `${title} preview`; }
    if (modalTitle) modalTitle.textContent = title;
    if (modalMeta) modalMeta.textContent = meta;

    const downloadBtn = $("#assetModalDownload");
    if (downloadBtn) {
      downloadBtn.onclick = (e) => {
        e.preventDefault();
        sound.playSuccess();
        AssetDownloader.downloadWallpaper(title);
        showToast(`Mengunduh asset: ${title}...`);
      };
    }
    modal.hidden = false;
    $("#closeAsset")?.focus();
  }

  function setupAssetModal() {
    const modal = $("#assetModal");
    if (!modal) return;
    $("#closeAsset")?.addEventListener("click", () => {
      sound.playClick();
      modal.hidden = true;
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        sound.playClick();
        modal.hidden = true;
      }
    });
  }

  function setupIntro() {
    const intro = $("#introOverlay");
    if (!intro) return;
    if (StorageManager.getIntroSeen()) return;

    setTimeout(() => {
      intro.hidden = false;
      sound.playChime();
      $("#startTracking")?.focus();
    }, 260);

    const dismiss = () => {
      sound.playSuccess();
      intro.hidden = true;
      StorageManager.setIntroSeen();
      $("#mapMarkers")?.focus?.();
    };

    $("#startTracking")?.addEventListener("click", dismiss);
    $("#skipIntro")?.addEventListener("click", dismiss);
  }

  /* ---------- 9. TERMINAL CONSOLE ---------- */
  class TerminalConsole {
    static init() {
      this.modal = $("#terminalModal");
      this.output = $("#terminalOutput");
      this.input = $("#terminalInput");
      this.closeBtn = $("#closeTerminal");
      this.history = StorageManager.getTerminalHistory();
      this.historyIdx = this.history.length;

      if (!this.input) return;

      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const cmd = this.input.value.trim();
          if (cmd) {
            StorageManager.pushTerminalHistory(cmd);
            this.history = StorageManager.getTerminalHistory();
            this.historyIdx = this.history.length;
            this.execute(cmd);
            this.input.value = "";
          }
        } else if (e.key === "ArrowUp") {
          if (this.historyIdx > 0) {
            this.historyIdx--;
            this.input.value = this.history[this.historyIdx] || "";
          }
        } else if (e.key === "ArrowDown") {
          if (this.historyIdx < this.history.length - 1) {
            this.historyIdx++;
            this.input.value = this.history[this.historyIdx] || "";
          } else {
            this.historyIdx = this.history.length;
            this.input.value = "";
          }
        }
      });

      this.closeBtn?.addEventListener("click", () => this.hide());
    }

    static show() {
      if (!this.modal) return;
      this.modal.hidden = false;
      sound.playClick();
      setTimeout(() => {
        this.input?.focus();
      }, 80);
      this.print("SYSTEM: Spider-Net CLI v2.6.15 connected. Type 'help' for commands.\n");
    }

    static hide() {
      if (!this.modal) return;
      this.modal.hidden = true;
      sound.playClick();
    }

    static print(text, isError = false) {
      if (!this.output) return;
      const line = document.createElement("div");
      line.className = isError ? "term-line error" : "term-line";
      line.textContent = text;
      this.output.appendChild(line);
      this.output.scrollTop = this.output.scrollHeight;
    }

    static execute(rawCmd) {
      this.print(`> ${rawCmd}`);
      const parts = rawCmd.split(" ");
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      switch (command) {
        case "help":
          this.print([
            "AVAILABLE COMMANDS:",
            "  help                  - List commands",
            "  scan                  - Scan active global frequencies",
            "  list                  - List all active signals",
            "  locate <city/id>      - Focus map on city or ID",
            "  filter <confirmed|rumored|event|all> - Filter markers",
            "  report <city> <desc>  - Submit live sighting report",
            "  sound <on|off>        - Toggle 8-bit audio system",
            "  radar                 - Trigger radar sweep ping",
            "  panel <name>          - Open panel (activity-log, report, help, etc.)",
            "  clear                 - Clear terminal screen",
            "  exit / close          - Close terminal console"
          ].join("\n"));
          sound.playClick();
          break;

        case "scan":
          sound.playRadarPing();
          this.print("Scanning global frequency nodes...");
          setTimeout(() => {
            const total = appState.data.sightings.length;
            this.print(`SCAN COMPLETE: ${total} signals detected in field network.`);
            sound.playAlert();
          }, 400);
          break;

        case "list":
          this.print(`=== ACTIVE SIGHTINGS (${appState.data.sightings.length}) ===`);
          appState.data.sightings.forEach((s) => {
            this.print(`[${s.type.toUpperCase()}] ${s.title} (${s.city}, ${s.country})`);
          });
          sound.playClick();
          break;

        case "locate":
          if (!args.length) {
            this.print("Usage: locate <city name or id>", true);
            sound.playError();
            return;
          }
          const query = args.join(" ").toLowerCase();
          const found = appState.data.sightings.find((s) =>
            s.id.toLowerCase().includes(query) ||
            s.city.toLowerCase().includes(query) ||
            s.country.toLowerCase().includes(query)
          );
          if (found) {
            this.print(`Locating: ${found.title} in ${found.city}...`);
            centerOnRecord(found.id);
            sound.playSuccess();
          } else {
            this.print(`Signal '${query}' not found in active database.`, true);
            sound.playError();
          }
          break;

        case "filter":
          const f = (args[0] || "").toLowerCase();
          if (["confirmed", "rumored", "event", "all"].includes(f)) {
            renderMarkers(f);
            this.print(`Map filtered by: ${f.toUpperCase()}`);
            sound.playClick();
          } else {
            this.print("Valid filters: confirmed, rumored, event, all", true);
            sound.playError();
          }
          break;

        case "report":
          if (args.length < 2) {
            this.print("Usage: report <City> <Description>", true);
            sound.playError();
            return;
          }
          const city = args[0];
          const desc = args.slice(1).join(" ");
          const newReport = {
            id: `sight-user-${Date.now()}`,
            type: "confirmed",
            markerStyle: "spider-red",
            title: `Sighting in ${city}`,
            summary: desc,
            location: { city: city, country: "Local Grid", lat: 0, lng: 0 },
            coordinates: { left: `${30 + Math.random() * 45}%`, top: `${30 + Math.random() * 30}%` },
            occurredAt: new Date().toISOString(),
            date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
            time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            source: { label: "Field Terminal Report" },
            image: "../assets/placeholders/sighting-card.svg"
          };
          StorageManager.saveCustomSighting(newReport);
          appState.data.sightings.unshift(newReport);
          renderMarkers(appState.activeMapFilter);
          this.print(`REPORT LOGGED: ${newReport.title} added to global grid.`);
          sound.playSuccess();
          break;

        case "sound":
          const state = (args[0] || "").toLowerCase();
          if (state === "on") {
            sound.setSound(true);
            StorageManager.setSoundEnabled(true);
            this.print("Audio system ENABLED.");
            sound.playChime();
          } else if (state === "off") {
            sound.setSound(false);
            StorageManager.setSoundEnabled(false);
            this.print("Audio system MUTED.");
          } else {
            this.print(`Sound is currently ${sound.enabled ? "ENABLED" : "MUTED"}. Use: sound on | sound off`);
          }
          break;

        case "radar":
          sound.playRadarPing();
          this.print("Radar sonar ping triggered.");
          break;

        case "panel":
          const panelName = args[0];
          if (panelName) {
            openPanel(panelName);
            this.print(`Opening panel: ${panelName}`);
            this.hide();
          } else {
            this.print("Usage: panel <activity-log|report|web-watch|videos|events|help|downloads>", true);
          }
          break;

        case "clear":
          if (this.output) this.output.innerHTML = "";
          break;

        case "exit":
        case "close":
        case "quit":
          this.hide();
          break;

        default:
          this.print(`Unknown command: '${command}'. Type 'help' for command list.`, true);
          sound.playError();
          break;
      }
    }
  }

  /* ---------- 10. GLOBAL EVENT DISPATCHER ---------- */
  function handleGlobalClick(event) {
    // Panel triggers
    const panelButton = event.target.closest("[data-panel]");
    if (panelButton) {
      openPanel(panelButton.dataset.panel);
      return;
    }

    // Map markers
    const markerButton = event.target.closest("[data-marker-id]");
    if (markerButton) {
      openSightingDetail(markerButton.dataset.markerId);
      return;
    }

    // Villain dossier cards
    const villainButton = event.target.closest("[data-villain-id]");
    if (villainButton) {
      openVillainDetail(villainButton.dataset.villainId);
      return;
    }

    // Event items
    const eventButton = event.target.closest("[data-event-id]");
    if (eventButton) {
      openEventDetail(eventButton.dataset.eventId);
      return;
    }

    // Calendar (.ICS) download button
    const calButton = event.target.closest("[data-calendar-event]");
    if (calButton) {
      sound.playSuccess();
      const eventItem = appState.data.events.find((e) => e.id === calButton.dataset.calendarEvent);
      if (eventItem) {
        AssetDownloader.downloadEventCalendar(eventItem);
        showToast(`Mengunduh file kalender .ics untuk: ${eventItem.title}`);
      }
      return;
    }

    // Download asset buttons
    const dlAssetBtn = event.target.closest("[data-download-asset]");
    if (dlAssetBtn) {
      sound.playSuccess();
      const assetTitle = dlAssetBtn.dataset.downloadAsset;
      AssetDownloader.downloadWallpaper(assetTitle);
      showToast(`Mengunduh paket wallpaper: ${assetTitle}...`);
      return;
    }

    // Center on map buttons
    const centerButton = event.target.closest("[data-center-marker]");
    if (centerButton) {
      closePanel();
      centerOnRecord(centerButton.dataset.centerMarker);
      return;
    }

    const centerEventButton = event.target.closest("[data-center-event]");
    if (centerEventButton) {
      closePanel();
      centerOnRecord(centerEventButton.dataset.centerEvent);
      return;
    }

    // Activity log filter chips
    const logFilter = event.target.closest("[data-log-filter]");
    if (logFilter) {
      sound.playClick();
      renderActivity(logFilter.dataset.logFilter, $("#activitySearch")?.value || "");
      return;
    }

    // Download category tabs
    const downloadTab = event.target.closest("[data-download-tab]");
    if (downloadTab) {
      sound.playClick();
      renderDownloads(downloadTab.dataset.downloadTab);
      return;
    }

    // Asset preview trigger
    const assetPreview = event.target.closest("[data-asset-preview]");
    if (assetPreview) {
      openAssetPreview(assetPreview.dataset.assetPreview, assetPreview.dataset.assetTitle, assetPreview.dataset.assetMeta);
      return;
    }

    // Sidebar marker filter buttons
    const sidebarFilter = event.target.closest("[data-filter-map]");
    if (sidebarFilter) {
      sound.playClick();
      const filterValue = sidebarFilter.dataset.filterMap;
      renderMarkers(filterValue);
      $$(".rail-pill-btn, .sidebar-marker-btn").forEach((btn) => btn.classList.toggle("active", btn === sidebarFilter));
      showToast(`${filterValue === "all" ? "Semua" : statusLabel(filterValue)} sinyal ditampilkan.`);
      return;
    }
  }

  function handleShareSighting() {
    sound.playClick();
    const shareData = {
      title: "Spidey Tracker — Live Field Network",
      text: "Lacak sinyal penampakan Spider-Man secara real-time di seluruh dunia! #SpideyTracker",
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      sound.playSuccess();
      showToast("Link Spidey Tracker berhasil disalin ke clipboard!");
    }
  }

  function updateSoundButtonUI(enabled) {
    const icon = $(".pixel-speaker-icon");
    if (icon) icon.textContent = enabled ? "🔊" : "🔇";
  }

  /* ---------- 11. INITIALIZATION ON DOM READY ---------- */
  function initApp() {
    // Sound setting
    const soundEnabled = StorageManager.getSoundEnabled();
    sound.setSound(soundEnabled);
    updateSoundButtonUI(soundEnabled);

    // Global click listener
    document.addEventListener("click", handleGlobalClick);

    // Terminal
    TerminalConsole.init();
    $("#terminalBtn")?.addEventListener("click", () => TerminalConsole.show());

    // Panel controls
    $("#closePanel")?.addEventListener("click", () => closePanel());
    $("#panelBackdrop")?.addEventListener("click", () => closePanel());
    $("#backToLog")?.addEventListener("click", () => openPanel(appState.previousPanel || "activity-log"));

    // Menu buttons
    $("#menuToggle")?.addEventListener("click", () => openPanel("activity-log"));
    $("#helpToggle")?.addEventListener("click", () => openPanel("help"));

    // Title badge radar sync
    $(".center-title-badge")?.addEventListener("click", () => {
      sound.playRadarPing();
      renderMarkers(appState.activeMapFilter);
      showToast("Radar Network Synced // Sinyal diperbarui.");
    });

    // Radar global button
    $("#globalMap")?.addEventListener("click", () => {
      sound.playRadarPing();
      renderMarkers("all");
      $$(".rail-pill-btn, .sidebar-marker-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.filterMap === "all");
      });
      centerMap("global");
    });

    // Audio toggle
    $("#tickerAudioBtn")?.addEventListener("click", () => {
      const isEnabled = sound.toggleSound();
      StorageManager.setSoundEnabled(isEnabled);
      updateSoundButtonUI(isEnabled);
      showToast(isEnabled ? "Audio 8-Bit AKTIF 🔊" : "Audio DIBISUKAN 🔇");
    });

    // Ticker share
    $(".ticker-marquee-track")?.addEventListener("click", () => handleShareSighting());

    // Search
    $("#activitySearch")?.addEventListener("input", (event) => {
      renderActivity(appState.activeLogFilter, event.target.value);
    });

    // Report form
    $("#reportForm")?.addEventListener("submit", handleReportSubmission);
    $("#submitReportBtn")?.addEventListener("click", handleReportSubmission);

    $("#reportText")?.addEventListener("input", (event) => {
      const link = $("#reportLink");
      if (link) {
        link.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(event.target.value)}`;
      }
    });

    // Map controls
    const markers = $("#mapMarkers");
    markers?.addEventListener("pointerover", (event) => {
      const marker = event.target.closest(".map-marker");
      if (marker) {
        sound.playClick();
        showMarkerTooltip(marker);
      }
    });
    markers?.addEventListener("pointerout", (event) => {
      if (event.target.closest(".map-marker")) hideMarkerTooltip();
    });
    markers?.addEventListener("focusin", (event) => {
      const marker = event.target.closest(".map-marker");
      if (marker) showMarkerTooltip(marker);
    });
    markers?.addEventListener("focusout", hideMarkerTooltip);

    $("#zoomIn")?.addEventListener("click", () => {
      sound.playClick();
      appState.mapZoom += 1;
      updateMapFrame(20, 10, appState.mapZoom);
      showToast(`Map zoom: ${appState.mapZoom}x.`);
    });
    $("#zoomOut")?.addEventListener("click", () => {
      sound.playClick();
      appState.mapZoom -= 1;
      updateMapFrame(20, 10, appState.mapZoom);
      showToast(`Map zoom: ${appState.mapZoom}x.`);
    });
    $("#mapReset")?.addEventListener("click", () => {
      sound.playClick();
      renderMarkers("all");
      $$(".rail-pill-btn, .sidebar-marker-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.filterMap === "all");
      });
      centerMap("global");
    });
    $("#mapLocate")?.addEventListener("click", () => locateUserPosition());

    // Modals
    setupVideoModal();
    setupAssetModal();
    setupIntro();

    // Keyboard shortcuts
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (!$("#terminalModal")?.hidden) { TerminalConsole.hide(); }
        else if (!$("#assetModal")?.hidden) { $("#assetModal").hidden = true; }
        else if (!$("#videoModal")?.hidden) {
          $("#videoModal").hidden = true;
          const container = $("#videoFrameContainer");
          if (container) container.innerHTML = "";
        }
        else if (appState.currentPanel) { closePanel(); }
      } else if (event.key === "`" || (event.ctrlKey && event.key === "t")) {
        TerminalConsole.show();
      }
    });

    // Initial render
    renderMarkers();
    $$(".rail-pill-btn, .sidebar-marker-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.filterMap === "all"));
    renderActivity();

    // Deep-link from hash
    const hashPanel = window.location.hash.replace("#", "");
    if (panelMeta[hashPanel]) openPanel(hashPanel, false);
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
