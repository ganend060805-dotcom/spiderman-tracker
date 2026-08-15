/* =============================================
   SPIDEY TRACKER — App Logic
   ============================================= */

const fallbackData = {
  sightings: [
    { id: "sight-001", type: "confirmed", title: "Jejak merah di jembatan kota", summary: "Siluet terlihat melintas saat matahari terbenam.", city: "Jakarta", country: "Indonesia", date: "14 AUG 2026", time: "18:30", coordinates: { left: "55%", top: "59%" }, image: "../assets/placeholders/sighting-card.svg", source: "Field report" },
    { id: "sight-002", type: "rumored", title: "Sinyal aneh di atas gedung tua", summary: "Beberapa saksi mendengar suara kabel dan melihat bayangan bergerak.", city: "Bandung", country: "Indonesia", date: "13 AUG 2026", time: "22:10", coordinates: { left: "43%", top: "42%" }, image: "../assets/placeholders/sighting-card.svg", source: "Community watch" },
    { id: "sight-003", type: "event", title: "Night Watch Pop-up", summary: "Experience interaktif, photo spot, dan mini screening.", city: "Surabaya", country: "Indonesia", date: "12 SEP 2026", time: "16:00", coordinates: { left: "72%", top: "66%" }, image: "../assets/placeholders/event-card.svg", source: "Official event listing" }
  ],
  events: [
    { id: "event-001", title: "Night Watch Pop-up", description: "Experience interaktif dengan photo spot dan mini screening.", venue: "Rooftop Hall", city: "Jakarta", country: "Indonesia", date: "12 SEP 2026 · 16:00–22:00", image: "../assets/placeholders/event-card.svg", coordinates: { left: "55%", top: "59%" } },
    { id: "event-002", title: "Signal Lab Weekend", description: "Workshop kreatif untuk memecahkan kode dan menemukan jejak tersembunyi.", venue: "Creative Block 09", city: "Yogyakarta", country: "Indonesia", date: "03–04 OCT 2026 · 10:00", image: "../assets/placeholders/event-card.svg", coordinates: { left: "62%", top: "64%" } }
  ],
  villains: [
    { id: "villain-001", name: "The Coil", threatLevel: "high", firstSeen: "04 JUL 2026", summary: "Pengguna kabel magnetik yang mengacaukan jaringan kota.", image: "../assets/placeholders/villain-card.svg" },
    { id: "villain-002", name: "Glass Mantis", threatLevel: "medium", firstSeen: "19 JUL 2026", summary: "Sosok lincah dengan armor transparan yang sulit dilacak kamera.", image: "../assets/placeholders/villain-card.svg" },
    { id: "villain-003", name: "Unknown Signal", threatLevel: "unknown", firstSeen: "01 AUG 2026", summary: "Rumor tentang operator misterius yang meninggalkan pola frekuensi.", image: "../assets/placeholders/villain-card.svg" }
  ]
};

const downloadData = {
  wallpapers: [{ title: "Signal / 01", meta: "PNG · 1440×2560", image: "../assets/downloads/wallpaper-signal-01.svg" }],
  stickers: [{ title: "Web Grid", meta: "SVG · Transparent", image: "../assets/downloads/sticker-web-grid.svg" }],
  emojis: [{ title: "Signal Eye", meta: "SVG · 512×512", image: "../assets/downloads/emoji-spider-eye.svg" }]
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

let data = fallbackData;
let currentPanel = null;
let activeLogFilter = "all";
let activeDownloadTab = "wallpapers";
let toastTimer;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const panel = $("#infoPanel");
const backdrop = $("#panelBackdrop");

function statusLabel(type) {
  return { confirmed: "CONFIRMED", rumored: "RUMORED", event: "EVENT" }[type] || type.toUpperCase();
}

function markerAsset(type) {
  return `../assets/markers/marker-${type}.svg`;
}

function updatePanelMeta(name) {
  const meta = panelMeta[name] || panelMeta["activity-log"];
  $("#panelEyebrow").textContent = meta.eyebrow;
  $("#panelTitle").textContent = meta.title;
  $("#panelHint").textContent = meta.hint;
}

function setPanelView(name) {
  $$("[data-view]").forEach((view) => { view.hidden = view.dataset.view !== name; });
  updatePanelMeta(name);
}

function openPanel(name, updateUrl = true) {
  if (name === "map") return closePanel(false);
  currentPanel = name;
  setPanelView(name);
  panel.hidden = false;
  backdrop.hidden = false;
  requestAnimationFrame(() => panel.classList.add("is-open"));
  panel.setAttribute("aria-hidden", "false");
  if (updateUrl) history.replaceState(null, "", `#${name}`);
  const focusTarget = $(".close-button", panel);
  setTimeout(() => focusTarget?.focus(), 60);
  if (name === "activity-log") renderActivity(activeLogFilter);
  if (name === "web-watch") renderWebWatch();
  if (name === "events") renderEvents();
  if (name === "downloads") renderDownloads(activeDownloadTab);
}

function closePanel(updateUrl = true) {
  currentPanel = null;
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  if (updateUrl) history.replaceState(null, "", window.location.pathname);
  setTimeout(() => { if (!currentPanel) { panel.hidden = true; backdrop.hidden = true; } }, 320);
}

function renderMarkers(filter = "all") {
  const wrapper = $("#mapMarkers");
  wrapper.innerHTML = data.sightings
    .filter((item) => filter === "all" || item.type === filter)
    .map((item) => `
      <button class="map-marker ${item.type}" type="button" data-marker-id="${item.id}" style="left:${item.coordinates.left};top:${item.coordinates.top}" aria-label="${statusLabel(item.type)}: ${item.title}">
        <span class="marker-pulse" aria-hidden="true"></span>
        <img src="${markerAsset(item.type)}" alt="" />
      </button>
    `).join("");
}

function renderActivity(filter = "all") {
  activeLogFilter = filter;
  const items = data.sightings.filter((item) => filter === "all" || item.type === filter);
  $("#panelCount").textContent = `${String(items.length).padStart(2, "0")} ITEMS`;
  $("#logList").innerHTML = items.length
    ? items.map((item) => `
        <button class="log-item" type="button" data-marker-id="${item.id}">
          <img class="log-marker" src="${markerAsset(item.type)}" alt="" />
          <span class="log-copy"><strong>${item.title}</strong><small>${item.city}, ${item.country}</small></span>
          <span class="log-meta"><span class="status-badge ${item.type}">${statusLabel(item.type)}</span><span>${item.date}</span></span>
        </button>
      `).join("")
    : `<div class="empty-state">Belum ada signal pada filter ini.</div>`;
  $$("[data-log-filter]").forEach((btn) => btn.classList.toggle("active", btn.dataset.logFilter === filter));
}

function renderWebWatch() {
  $("#panelCount").textContent = `${String(data.villains.length).padStart(2, "0")} CASES`;
  $("#webWatchGrid").innerHTML = data.villains.map((villain) => `
    <button class="watch-card" type="button" data-villain-id="${villain.id}">
      <img src="${villain.image}" alt="Placeholder portrait ${villain.name}" />
      <span class="watch-card-info">
        <strong>${villain.name}</strong>
        <small>${villain.firstSeen} · ${villain.threatLevel.toUpperCase()}</small>
        <span class="threat-bar ${villain.threatLevel}"><span></span></span>
      </span>
    </button>
  `).join("");
}

function renderEvents() {
  $("#panelCount").textContent = `${String(data.events.length).padStart(2, "0")} EVENTS`;
  $("#eventList").innerHTML = data.events.map((event) => `
    <article class="event-card">
      <img src="${event.image}" alt="Placeholder artwork ${event.title}" />
      <div class="event-copy">
        <span class="event-date">${event.date}</span>
        <strong>${event.title}</strong>
        <span class="event-location">${event.venue}<br />${event.city}, ${event.country}</span>
        <button class="button button-ghost" type="button" data-event-id="${event.id}">Open detail ↗</button>
      </div>
    </article>
  `).join("");
}

function renderDownloads(category) {
  activeDownloadTab = category;
  const items = downloadData[category] || [];
  $("#panelCount").textContent = `${String(items.length).padStart(2, "0")} FILE`;
  $("#downloadGrid").innerHTML = items.map((item) => `
    <article class="download-card">
      <img src="${item.image}" alt="${item.title} placeholder" />
      <div class="download-card-info"><strong>${item.title}</strong><small>${item.meta}</small></div>
      <a class="button button-primary" href="${item.image}" download>Download ↓</a>
    </article>
  `).join("");
  $$("[data-download-tab]").forEach((tab) => {
    const active = tab.dataset.downloadTab === category;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function openSightingDetail(id) {
  const item = data.sightings.find((s) => s.id === id);
  if (!item) return;
  $("#panelCount").textContent = statusLabel(item.type);
  $("#detailContent").innerHTML = `
    <img class="detail-media" src="${item.image}" alt="Placeholder media ${item.title}" />
    <div class="detail-heading"><h3>${item.title}</h3><span class="status-badge ${item.type}">${statusLabel(item.type)}</span></div>
    <p class="detail-meta">${item.city}, ${item.country}<br />${item.date} · ${item.time} LOCAL</p>
    <p class="detail-summary">${item.summary}</p>
    <span class="detail-source">SOURCE // ${item.source}</span>
    <button class="button button-primary button-full" type="button" data-center-marker="${item.id}" style="margin-top:14px">Center on map <span aria-hidden="true">◎</span></button>
  `;
  openPanel("detail");
}

function openVillainDetail(id) {
  const villain = data.villains.find((v) => v.id === id);
  if (!villain) return;
  $("#panelCount").textContent = villain.threatLevel.toUpperCase();
  $("#detailContent").innerHTML = `
    <img class="detail-media" src="${villain.image}" alt="Placeholder portrait ${villain.name}" />
    <div class="detail-heading"><h3>${villain.name}</h3><span class="status-badge ${villain.threatLevel === "high" ? "confirmed" : villain.threatLevel === "medium" ? "rumored" : "event"}">${villain.threatLevel.toUpperCase()}</span></div>
    <p class="detail-meta">FIRST SEEN // ${villain.firstSeen}<br />CASE TYPE // WEB WATCH</p>
    <p class="detail-summary">${villain.summary}</p>
    <span class="detail-source">DOSSIER // Placeholder content for internal prototyping.</span>
  `;
  openPanel("detail");
}

function openEventDetail(id) {
  const event = data.events.find((e) => e.id === id);
  if (!event) return;
  $("#panelCount").textContent = "UPCOMING";
  $("#detailContent").innerHTML = `
    <img class="detail-media" src="${event.image}" alt="Placeholder artwork ${event.title}" />
    <div class="detail-heading"><h3>${event.title}</h3><span class="status-badge event">EVENT</span></div>
    <p class="detail-meta">${event.date} LOCAL<br />${event.venue} · ${event.city}, ${event.country}</p>
    <p class="detail-summary">${event.description}</p>
    <span class="detail-source">TIMEZONE // Asia/Jakarta · TICKETS // External link placeholder</span>
    <button class="button button-primary button-full" type="button" data-center-event="${event.id}" style="margin-top:14px">Open location on map <span aria-hidden="true">◎</span></button>
  `;
  openPanel("detail");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function centerMap(position) {
  showToast(`Map centered on ${position || "global signal grid"}.`);
}

function handleGlobalClick(event) {
  // Panel / navigation triggers
  const panelButton = event.target.closest("[data-panel]");
  if (panelButton) { openPanel(panelButton.dataset.panel); return; }

  // Map markers
  const markerButton = event.target.closest("[data-marker-id]");
  if (markerButton) { openSightingDetail(markerButton.dataset.markerId); return; }

  // Villain cards
  const villainButton = event.target.closest("[data-villain-id]");
  if (villainButton) { openVillainDetail(villainButton.dataset.villainId); return; }

  // Event items
  const eventButton = event.target.closest("[data-event-id]");
  if (eventButton) { openEventDetail(eventButton.dataset.eventId); return; }

  // Center on map actions
  const centerButton = event.target.closest("[data-center-marker]");
  if (centerButton) { closePanel(); centerMap(centerButton.dataset.centerMarker); return; }

  const centerEventButton = event.target.closest("[data-center-event]");
  if (centerEventButton) { closePanel(); centerMap(centerEventButton.dataset.centerEvent); return; }

  // Activity log filter chips
  const logFilter = event.target.closest("[data-log-filter]");
  if (logFilter) { renderActivity(logFilter.dataset.logFilter); return; }

  // Download tabs
  const downloadTab = event.target.closest("[data-download-tab]");
  if (downloadTab) { renderDownloads(downloadTab.dataset.downloadTab); return; }

  // Sidebar marker filter buttons
  const sidebarFilter = event.target.closest("[data-filter-map]");
  if (sidebarFilter) {
    const filterValue = sidebarFilter.dataset.filterMap;
    renderMarkers(filterValue);
    $$(".sidebar-marker-btn").forEach((btn) => btn.classList.toggle("active", btn === sidebarFilter));
    showToast(`${filterValue === "all" ? "All" : statusLabel(filterValue)} signals shown.`);
    return;
  }
}

function setupVideoModal() {
  const modal = $("#videoModal");
  const title = $("#videoModalTitle");

  document.addEventListener("click", (event) => {
    const video = event.target.closest("[data-video-title]");
    if (!video) return;
    title.textContent = video.dataset.videoTitle;
    modal.hidden = false;
    $("#closeVideo").focus();
  });

  $("#closeVideo").addEventListener("click", () => { modal.hidden = true; });
  $("#fakePlay").addEventListener("click", () => {
    showToast("Video placeholder — connect footage for production.");
    modal.hidden = true;
  });
}

function loadData() {
  return Promise.allSettled([
    fetch("../data/sample-sightings.json").then((r) => r.json()),
    fetch("../data/sample-events.json").then((r) => r.json()),
    fetch("../data/sample-villains.json").then((r) => r.json())
  ]).then((results) => {
    const [sightings, events, villains] = results;
    if (sightings.status === "fulfilled") {
      data.sightings = sightings.value.map((item, index) => ({
        ...item,
        city: item.location?.city || item.city || "Unknown",
        country: item.location?.country || item.country || "",
        date: new Date(item.occurredAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
        time: new Date(item.occurredAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        coordinates: fallbackData.sightings[index]?.coordinates || { left: "50%", top: "50%" },
        image: item.media?.[0]?.src || "../assets/placeholders/sighting-card.svg",
        source: item.source?.label || "Field report"
      }));
    }
    if (events.status === "fulfilled") {
      data.events = events.value.map((item, index) => ({
        ...item,
        date: `${new Date(item.startsAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()} · ${new Date(item.startsAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
        image: item.heroImage || "../assets/placeholders/event-card.svg",
        coordinates: fallbackData.events[index]?.coordinates || { left: "50%", top: "50%" }
      }));
    }
    if (villains.status === "fulfilled") {
      data.villains = villains.value.map((item) => ({
        ...item,
        firstSeen: new Date(item.firstSeen).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
        image: item.portrait || "../assets/placeholders/villain-card.svg"
      }));
    }
  });
}

function setup() {
  // Global click delegation
  document.addEventListener("click", handleGlobalClick);

  // Close panel
  $("#closePanel").addEventListener("click", () => closePanel());
  backdrop.addEventListener("click", () => closePanel());
  $("#backToLog").addEventListener("click", () => openPanel("activity-log"));

  // Zoom (visual only — affects map filter styling)
  $("#zoomIn").addEventListener("click", () => showToast("Zoom in — connect Google Maps API for live zoom."));
  $("#zoomOut").addEventListener("click", () => showToast("Zoom out — connect Google Maps API for live zoom."));

  // Global map radar button
  const globalBtn = $("#globalMap");
  if (globalBtn) {
    globalBtn.addEventListener("click", () => {
      renderMarkers();
      $$(".sidebar-marker-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.filterMap === "all");
      });
      centerMap("global");
    });
  }

  // Ticker toggle
  const tickerToggle = $("#tickerToggle");
  if (tickerToggle) {
    tickerToggle.addEventListener("change", () => {
      showToast(tickerToggle.checked ? "Live feed enabled." : "Live feed paused.");
    });
  }

  // Watch Trailer button
  const trailerBtn = $("#watchTrailerBtn");
  if (trailerBtn) {
    trailerBtn.addEventListener("click", () => {
      $("#videoModalTitle").textContent = "Spider-Man: Beyond the Spider-Verse";
      $("#videoModal").hidden = false;
    });
  }

  // Terminal button
  const termBtn = $("#terminalBtn");
  if (termBtn) {
    termBtn.addEventListener("click", () => showToast("> SPIDEY TRACKER CONSOLE // v2.6.15 // ONLINE"));
  }

  // Help / spider icon
  const helpBtn = $("#helpToggle");
  if (helpBtn) {
    helpBtn.addEventListener("click", () => openPanel("help"));
  }

  // Hamburger / menu
  const menuBtn = $("#menuToggle");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => openPanel("activity-log"));
  }

  // Report textarea -> update tweet link
  const reportText = $("#reportText");
  if (reportText) {
    reportText.addEventListener("input", (event) => {
      const link = $("#reportLink");
      if (link) link.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(event.target.value)}`;
    });
  }

  // Video modal
  setupVideoModal();

  // Keyboard shortcuts
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!$("#videoModal").hidden) { $("#videoModal").hidden = true; }
      else if (currentPanel) { closePanel(); }
    }
  });

  // Hash-based deep-link
  const hashPanel = window.location.hash.replace("#", "");

  // Initial render
  renderMarkers();
  renderActivity();
  if (panelMeta[hashPanel]) openPanel(hashPanel, false);

  // Load external data and re-render
  loadData().then(() => {
    renderMarkers();
    renderActivity(activeLogFilter);
    if (currentPanel === "events") renderEvents();
    if (currentPanel === "web-watch") renderWebWatch();
  });
}

document.addEventListener("DOMContentLoaded", setup);
