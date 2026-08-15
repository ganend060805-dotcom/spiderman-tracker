/* =============================================
   SPIDEY TRACKER — Modals & Intro Overlay Module
   ============================================= */

import { $, showToast } from "./ui.js";

export function setupVideoModal() {
  const modal = $("#videoModal");
  const title = $("#videoModalTitle");

  document.addEventListener("click", (event) => {
    const video = event.target.closest("[data-video-title]");
    if (!video) return;
    title.textContent = video.dataset.videoTitle;
    modal.hidden = false;
    $("#closeVideo").focus();
  });

  $("#closeVideo")?.addEventListener("click", () => { modal.hidden = true; });
  $("#fakePlay")?.addEventListener("click", () => {
    showToast("Video placeholder — connect footage for production.");
    modal.hidden = true;
  });
}

export function openAssetPreview(image, title, meta) {
  const modal = $("#assetModal");
  if (!modal) return;
  $("#assetModalImage").src = image;
  $("#assetModalImage").alt = `${title} preview`;
  $("#assetModalTitle").textContent = title;
  $("#assetModalMeta").textContent = meta;
  $("#assetModalDownload").href = image;
  modal.hidden = false;
  $("#closeAsset")?.focus();
}

export function setupAssetModal() {
  const modal = $("#assetModal");
  if (!modal) return;
  $("#closeAsset")?.addEventListener("click", () => { modal.hidden = true; });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.hidden = true;
  });
}

export function setupIntro() {
  const intro = $("#introOverlay");
  if (!intro) return;

  let alreadySeen = false;
  try {
    alreadySeen = sessionStorage.getItem("spidey-intro-seen") === "true";
  } catch (_) {
    alreadySeen = false;
  }
  if (alreadySeen) return;

  setTimeout(() => {
    intro.hidden = false;
    $("#startTracking")?.focus();
  }, 260);

  const dismiss = () => {
    intro.hidden = true;
    try {
      sessionStorage.setItem("spidey-intro-seen", "true");
    } catch (_) {
      /* storage optional */
    }
    $("#mapMarkers")?.focus?.();
  };

  $("#startTracking")?.addEventListener("click", dismiss);
  $("#skipIntro")?.addEventListener("click", dismiss);
}
