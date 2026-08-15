/* =============================================
   SPIDEY TRACKER — Main Application Entry
   Modular Architecture
   ============================================= */

import { appState, panelMeta, loadExternalData } from "./js/data.js";
import { $, $$, statusLabel, showToast } from "./js/ui.js";
import { renderMarkers, centerMap, centerOnRecord, setupMapEvents } from "./js/map.js";
import {
  openPanel,
  closePanel,
  renderActivity,
  renderEvents,
  renderWebWatch,
  renderDownloads,
  openSightingDetail,
  openVillainDetail,
  openEventDetail
} from "./js/panel.js";
import { setupVideoModal, setupAssetModal, openAssetPreview, setupIntro } from "./js/modals.js";

// Global Click Delegation Handler
function handleGlobalClick(event) {
  // Panel triggers
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

  // Center on map buttons
  const centerButton = event.target.closest("[data-center-marker]");
  if (centerButton) { closePanel(); centerOnRecord(centerButton.dataset.centerMarker); return; }

  const centerEventButton = event.target.closest("[data-center-event]");
  if (centerEventButton) { closePanel(); centerOnRecord(centerEventButton.dataset.centerEvent); return; }

  // Activity log filter chips
  const logFilter = event.target.closest("[data-log-filter]");
  if (logFilter) { renderActivity(logFilter.dataset.logFilter, $("#activitySearch")?.value || ""); return; }

  // Download tabs
  const downloadTab = event.target.closest("[data-download-tab]");
  if (downloadTab) { renderDownloads(downloadTab.dataset.downloadTab); return; }

  // Asset preview trigger
  const assetPreview = event.target.closest("[data-asset-preview]");
  if (assetPreview) {
    openAssetPreview(assetPreview.dataset.assetPreview, assetPreview.dataset.assetTitle, assetPreview.dataset.assetMeta);
    return;
  }

  // Sidebar marker filter buttons
  const sidebarFilter = event.target.closest("[data-filter-map]");
  if (sidebarFilter) {
    const filterValue = sidebarFilter.dataset.filterMap;
    renderMarkers(filterValue);
    $$(".rail-pill-btn, .sidebar-marker-btn").forEach((btn) => btn.classList.toggle("active", btn === sidebarFilter));
    showToast(`${filterValue === "all" ? "All" : statusLabel(filterValue)} signals shown.`);
    return;
  }
}

// App Setup & Initializations
function initApp() {
  // Global click delegation
  document.addEventListener("click", handleGlobalClick);

  // Panel close & back navigation
  $("#closePanel")?.addEventListener("click", () => closePanel());
  $("#panelBackdrop")?.addEventListener("click", () => closePanel());
  $("#backToLog")?.addEventListener("click", () => openPanel(appState.previousPanel || "activity-log"));

  // Topbar / Menu triggers
  $("#menuToggle")?.addEventListener("click", () => openPanel("activity-log"));
  $("#helpToggle")?.addEventListener("click", () => openPanel("help"));

  // Global map radar button
  $("#globalMap")?.addEventListener("click", () => {
    renderMarkers("all");
    $$(".rail-pill-btn, .sidebar-marker-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filterMap === "all");
    });
    centerMap("global");
  });

  // Ticker Audio Button
  $("#tickerAudioBtn")?.addEventListener("click", () => {
    showToast("Live tracker audio frequency connected.");
  });

  // Search input in activity panel
  $("#activitySearch")?.addEventListener("input", (event) => {
    renderActivity(appState.activeLogFilter, event.target.value);
  });

  // Watch Trailer button
  $("#watchTrailerBtn")?.addEventListener("click", () => {
    $("#videoModalTitle").textContent = "Spider-Man: Brand New Day";
    $("#videoModal").hidden = false;
  });

  // Terminal button
  $("#terminalBtn")?.addEventListener("click", () => {
    showToast("> SPIDEY TRACKER CONSOLE // v2.6.15 // ONLINE");
  });

  // Report tweet generator
  $("#reportText")?.addEventListener("input", (event) => {
    const link = $("#reportLink");
    if (link) link.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(event.target.value)}`;
  });

  // Map controls & tooltips
  setupMapEvents();

  // Modals & Intro setup
  setupVideoModal();
  setupAssetModal();
  setupIntro();

  // Keyboard navigation (Escape key)
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!$("#assetModal")?.hidden) { $("#assetModal").hidden = true; }
      else if (!$("#videoModal")?.hidden) { $("#videoModal").hidden = true; }
      else if (appState.currentPanel) { closePanel(); }
    }
  });

  // Initial render
  renderMarkers();
  $$(".rail-pill-btn, .sidebar-marker-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.filterMap === "all"));
  renderActivity();

  // Deep-link panel from hash (#activity-log, #help, etc.)
  const hashPanel = window.location.hash.replace("#", "");
  if (panelMeta[hashPanel]) openPanel(hashPanel, false);

  // Load external data
  loadExternalData().then(() => {
    renderMarkers(appState.activeMapFilter);
    renderActivity(appState.activeLogFilter, $("#activitySearch")?.value || "");
    if (appState.currentPanel === "events") renderEvents();
    if (appState.currentPanel === "web-watch") renderWebWatch();
  });
}

document.addEventListener("DOMContentLoaded", initApp);
