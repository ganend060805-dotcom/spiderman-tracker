/* =============================================
   SPIDEY TRACKER — Modals & Overlay Module
   ============================================= */

import { $, showToast } from "./ui.js";
import { sound } from "./audio.js";
import { StorageManager } from "./storage.js";
import { AssetDownloader } from "./downloader.js";

export function setupVideoModal() {
  const modal = $("#videoModal");
  const title = $("#videoModalTitle");
  const container = $("#videoFrameContainer");

  document.addEventListener("click", (event) => {
    const videoBtn = event.target.closest("[data-video-title]");
    if (!videoBtn) return;
    sound.playClick();
    const vidTitle = videoBtn.dataset.videoTitle || "Spider-Man: Brand New Day";
    if (title) title.textContent = vidTitle;

    // Load actual working video player
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

    modal.hidden = false;
    $("#closeVideo")?.focus();
  });

  const closeVideoPlayer = () => {
    sound.playClick();
    if (container) container.innerHTML = "";
    modal.hidden = true;
  };

  $("#closeVideo")?.addEventListener("click", closeVideoPlayer);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeVideoPlayer();
  });
}

export function openAssetPreview(image, title, meta) {
  const modal = $("#assetModal");
  if (!modal) return;
  sound.playClick();
  $("#assetModalImage").src = image;
  $("#assetModalImage").alt = `${title} preview`;
  $("#assetModalTitle").textContent = title;
  $("#assetModalMeta").textContent = meta;

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

export function setupAssetModal() {
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

export function setupIntro() {
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
