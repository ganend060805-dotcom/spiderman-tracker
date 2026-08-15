/* =============================================
   SPIDEY TRACKER — Panel Module
   ============================================= */

import { appState, downloadData, panelMeta } from "./data.js";
import { $, $$, statusLabel, markerAsset } from "./ui.js";

const panel = $("#infoPanel");
const backdrop = $("#panelBackdrop");

export function updatePanelMeta(name) {
  const meta = panelMeta[name] || panelMeta["activity-log"];
  $("#panelEyebrow").textContent = meta.eyebrow;
  $("#panelTitle").textContent = meta.title;
  $("#panelHint").textContent = meta.hint;
}

export function setPanelView(name) {
  $$("[data-view]").forEach((view) => {
    view.hidden = view.dataset.view !== name;
  });
  updatePanelMeta(name);
}

export function openPanel(name, updateUrl = true) {
  if (name === "map") return closePanel(false);
  appState.currentPanel = name;
  setPanelView(name);
  panel.hidden = false;
  backdrop.hidden = false;
  requestAnimationFrame(() => panel.classList.add("is-open"));
  panel.setAttribute("aria-hidden", "false");
  if (updateUrl) history.replaceState(null, "", `#${name}`);

  const focusTarget = $(".close-button", panel);
  setTimeout(() => focusTarget?.focus(), 60);

  if (name === "activity-log") renderActivity(appState.activeLogFilter, $("#activitySearch")?.value || "");
  if (name === "web-watch") renderWebWatch();
  if (name === "events") renderEvents();
  if (name === "downloads") renderDownloads(appState.activeDownloadTab);
}

export function closePanel(updateUrl = true) {
  appState.currentPanel = null;
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  if (updateUrl) history.replaceState(null, "", window.location.pathname);
  setTimeout(() => {
    if (!appState.currentPanel) {
      panel.hidden = true;
      backdrop.hidden = true;
    }
  }, 320);
}

export function renderActivity(filter = "all", query = "") {
  appState.activeLogFilter = filter;
  const normalizedQuery = query.trim().toLowerCase();
  const items = appState.data.sightings.filter((item) => {
    const matchesFilter = filter === "all" || item.type === filter;
    const haystack = `${item.title} ${item.city} ${item.country} ${item.source}`.toLowerCase();
    return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
  });

  $("#panelCount").textContent = `${String(items.length).padStart(2, "0")} ITEMS`;
  $("#logList").innerHTML = items.length
    ? items.map((item) => `
        <button class="log-item" type="button" data-marker-id="${item.id}">
          <img class="log-marker" src="${markerAsset(item.markerStyle, item.type)}" alt="" />
          <span class="log-copy"><strong>${item.title}</strong><small>${item.city}, ${item.country}</small></span>
          <span class="log-meta"><span class="status-badge ${item.type}">${statusLabel(item.type)}</span><span>${item.date}</span></span>
        </button>
      `).join("")
    : `<div class="empty-state">Belum ada signal pada filter ini.</div>`;

  $$("[data-log-filter]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.logFilter === filter);
  });
}

export function renderWebWatch() {
  $("#panelCount").textContent = `${String(appState.data.villains.length).padStart(2, "0")} CASES`;
  $("#webWatchGrid").innerHTML = appState.data.villains.map((villain) => `
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

export function renderEvents() {
  $("#panelCount").textContent = `${String(appState.data.events.length).padStart(2, "0")} EVENTS`;
  $("#eventList").innerHTML = appState.data.events.map((event) => `
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

export function renderDownloads(category) {
  appState.activeDownloadTab = category;
  const items = downloadData[category] || [];
  $("#panelCount").textContent = `${String(items.length).padStart(2, "0")} FILE`;
  $("#downloadGrid").innerHTML = items.map((item) => `
    <article class="download-card">
      <button class="download-preview-trigger" type="button"
        data-asset-preview="${item.image}"
        data-asset-title="${item.title}"
        data-asset-meta="${item.meta}"
        aria-label="Preview ${item.title}">
        <img src="${item.image}" alt="${item.title} placeholder" />
      </button>
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

export function openSightingDetail(id) {
  const item = appState.data.sightings.find((s) => s.id === id);
  if (!item) return;
  appState.previousPanel = appState.currentPanel && appState.currentPanel !== "detail" ? appState.currentPanel : "activity-log";
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

export function openVillainDetail(id) {
  const villain = appState.data.villains.find((v) => v.id === id);
  if (!villain) return;
  appState.previousPanel = appState.currentPanel && appState.currentPanel !== "detail" ? appState.currentPanel : "web-watch";
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

export function openEventDetail(id) {
  const event = appState.data.events.find((e) => e.id === id);
  if (!event) return;
  appState.previousPanel = appState.currentPanel && appState.currentPanel !== "detail" ? appState.currentPanel : "events";
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
