/* =============================================
   SPIDEY TRACKER — Map Module
   ============================================= */

import { appState } from "./data.js";
import { $, statusLabel, markerAsset, showToast } from "./ui.js";
import { sound } from "./audio.js";

export function renderMarkers(filter = "all") {
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

export function updateMapFrame(lat, lng, zoom = appState.mapZoom) {
  const frame = $("#googleMap");
  if (!frame) return;
  appState.mapZoom = Math.max(1, Math.min(9, zoom));
  frame.src = `https://maps.google.com/maps?q=${lat},${lng}&z=${appState.mapZoom}&output=embed&t=m&hl=id&maptype=roadmap`;
}

export function centerMap(position = "global signal grid") {
  sound.playRadarPing();
  if (position === "global") updateMapFrame(10, 20, 2);
  showToast(`Peta dipusatkan pada ${position}.`);
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
  sound.playAlert();
  showToast(`Sinyal terpilih: ${item?.title || "selected signal"} (${item?.city || ""}).`);
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

export function locateUserPosition() {
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
        // Fallback to nearest major node (Jakarta/London/NYC)
        const node = appState.data.sightings[0];
        if (node?.location?.lat) {
          updateMapFrame(node.location.lat, node.location.lng, 5);
        }
        sound.playAlert();
        showToast(`GPS tidak aktif. Memusatkan pada Sinyal Utama: ${node.title}`);
      },
      { timeout: 6000 }
    );
  } else {
    const node = appState.data.sightings[0];
    if (node?.location?.lat) {
      updateMapFrame(node.location.lat, node.location.lng, 5);
    }
    showToast(`Memusatkan pada Sinyal Utama: ${node.title}`);
  }
}

export function setupMapEvents() {
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

  // Zoom controls
  $("#zoomIn")?.addEventListener("click", () => {
    sound.playClick();
    appState.mapZoom += 1;
    updateMapFrame(10, 20, appState.mapZoom);
    showToast(`Map zoom: ${appState.mapZoom}x.`);
  });
  $("#zoomOut")?.addEventListener("click", () => {
    sound.playClick();
    appState.mapZoom -= 1;
    updateMapFrame(10, 20, appState.mapZoom);
    showToast(`Map zoom: ${appState.mapZoom}x.`);
  });
  $("#mapReset")?.addEventListener("click", () => {
    sound.playClick();
    renderMarkers("all");
    document.querySelectorAll(".rail-pill-btn, .sidebar-marker-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filterMap === "all");
    });
    centerMap("global");
  });
  $("#mapLocate")?.addEventListener("click", () => {
    locateUserPosition();
  });
}
