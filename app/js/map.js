/* =============================================
   SPIDEY TRACKER — Map Module
   ============================================= */

import { appState } from "./data.js";
import { $, statusLabel, markerAsset, showToast } from "./ui.js";

export function renderMarkers(filter = "all") {
  appState.activeMapFilter = filter;
  const wrapper = $("#mapMarkers");
  if (!wrapper) return;

  wrapper.innerHTML = appState.data.sightings
    .filter((item) => filter === "all" || item.type === filter || (filter === "confirmed" && item.markerStyle?.includes("green")) || (filter === "rumored" && item.markerStyle?.includes("red")))
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

export function updateMapFrame(lat, lng, zoom = appState.mapZoom) {
  const frame = $("#googleMap");
  if (!frame) return;
  appState.mapZoom = Math.max(1, Math.min(9, zoom));
  frame.src = `https://maps.google.com/maps?q=${lat},${lng}&z=${appState.mapZoom}&output=embed&t=m&hl=id&maptype=roadmap`;
}

export function centerMap(position = "global signal grid") {
  if (position === "global") updateMapFrame(0, 0, 2);
  showToast(`Map centered on ${position}.`);
}

export function centerOnRecord(id) {
  const item = appState.data.sightings.find((entry) => entry.id === id) ||
               appState.data.events.find((entry) => entry.id === id);
  const location = item?.location || item?.coordinates;
  if (location?.lat && location?.lng) {
    updateMapFrame(location.lat, location.lng, 6);
  }
  document.querySelectorAll(".map-marker").forEach((marker) => {
    marker.classList.toggle("selected", marker.dataset.markerId === id);
  });
  showToast(`Map centered on ${item?.title || "selected signal"}.`);
}

export function showMarkerTooltip(marker) {
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

export function hideMarkerTooltip() {
  const tooltip = $("#markerTooltip");
  if (tooltip) tooltip.hidden = true;
}

export function setupMapEvents() {
  const markers = $("#mapMarkers");
  markers?.addEventListener("pointerover", (event) => {
    const marker = event.target.closest(".map-marker");
    if (marker) showMarkerTooltip(marker);
  });
  markers?.addEventListener("pointerout", (event) => {
    if (event.target.closest(".map-marker")) hideMarkerTooltip();
  });
  markers?.addEventListener("focusin", (event) => {
    const marker = event.target.closest(".map-marker");
    if (marker) showMarkerTooltip(marker);
  });
  markers?.addEventListener("focusout", hideMarkerTooltip);

  // Zoom controls
  $("#zoomIn")?.addEventListener("click", () => {
    appState.mapZoom += 1;
    updateMapFrame(0, 0, appState.mapZoom);
    showToast(`Map zoom ${appState.mapZoom}x.`);
  });
  $("#zoomOut")?.addEventListener("click", () => {
    appState.mapZoom -= 1;
    updateMapFrame(0, 0, appState.mapZoom);
    showToast(`Map zoom ${appState.mapZoom}x.`);
  });
  $("#mapReset")?.addEventListener("click", () => {
    renderMarkers("all");
    document.querySelectorAll(".sidebar-marker-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filterMap === "all");
    });
    centerMap("global");
  });
  $("#mapLocate")?.addEventListener("click", () => {
    const latest = appState.data.sightings[0];
    if (latest) centerOnRecord(latest.id);
  });
}
