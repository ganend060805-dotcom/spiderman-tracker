/* =============================================
   SPIDEY TRACKER — UI Utilities Module
   ============================================= */

let toastTimer;

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function statusLabel(type) {
  return { confirmed: "CONFIRMED", rumored: "RUMORED", event: "EVENT" }[type] || type.toUpperCase();
}

export function markerAsset(markerStyle, type) {
  if (markerStyle === "star") return "../assets/markers/marker-star.svg";
  if (markerStyle === "spider-green") return "../assets/markers/marker-spider-green.svg";
  if (markerStyle === "spider-white") return "../assets/markers/marker-spider-white.svg";
  if (markerStyle === "spider-red") return "../assets/markers/marker-spider-red.svg";

  if (type === "event") return "../assets/markers/marker-star.svg";
  if (type === "rumored") return "../assets/markers/marker-spider-white.svg";
  return "../assets/markers/marker-spider-red.svg";
}

export function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}
