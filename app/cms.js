/* Directus REST adapter + development JSON fallback. */
(function () {
  "use strict";

  const config = window.SPIDEY_CONFIG || {};
  const apiConfig = config.api || {};
  const collections = apiConfig.collections || {};

  function directusUrl(path) {
    return `${String(apiConfig.baseUrl || "").replace(/\/$/, "")}${path}`;
  }

  function assetUrl(value) {
    if (!value) return "../assets/placeholders/sighting-card.svg";
    if (/^(https?:|data:|\.\.?\/|\/)/.test(value)) return value;
    return directusUrl(`/assets/${value}`);
  }

  function formatDate(value) {
    if (!value) return "DATE TBC";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }

  function formatTime(value) {
    if (!value) return "TIME TBC";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "TIME TBC" : date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  function numberOrNull(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function normalizeSighting(item) {
    const location = item.location || {};
    const lat = numberOrNull(item.latitude ?? item.lat ?? location.lat) ?? 0;
    const lng = numberOrNull(item.longitude ?? item.lng ?? location.lng) ?? 0;
    const occurredAt = item.occurred_at || item.occurredAt || item.date;
    return {
      ...item,
      id: String(item.id),
      type: item.type || "confirmed",
      markerStyle: item.marker_style || item.markerStyle || (item.type === "event" ? "star" : item.type === "rumored" ? "spider-white" : "spider-green"),
      title: item.title || "Untitled signal",
      summary: item.summary || item.description || "No field summary available.",
      city: item.city || location.city || "Unknown",
      country: item.country || location.country || "Unknown",
      location: { lat, lng },
      coordinates: item.coordinates || { left: "50%", top: "50%" },
      date: formatDate(occurredAt),
      time: formatTime(occurredAt),
      occurredAt,
      source: typeof item.source === "string" ? { label: item.source } : (item.source || { label: item.source_label || "CMS record" }),
      image: assetUrl(item.image || item.media?.[0]?.src || item.media?.[0]?.image)
    };
  }

  function normalizeEvent(item) {
    const location = item.location || item.coordinates || {};
    const startsAt = item.starts_at || item.startsAt || item.date;
    return {
      ...item,
      id: String(item.id),
      title: item.title || "Untitled event",
      description: item.description || item.summary || "No event description available.",
      venue: item.venue || item.location_name || "Venue TBC",
      city: item.city || "Unknown",
      country: item.country || "Unknown",
      date: item.display_date || `${formatDate(startsAt)} · ${formatTime(startsAt)}`,
      image: assetUrl(item.hero_image || item.heroImage || item.image),
      location: { lat: numberOrNull(item.latitude ?? item.lat ?? location.lat) ?? 0, lng: numberOrNull(item.longitude ?? item.lng ?? location.lng) ?? 0 },
      startsAt,
      ticketUrl: item.ticket_url || item.ticketUrl || ""
    };
  }

  function normalizeVillain(item) {
    return {
      ...item,
      id: String(item.id),
      name: item.name || item.title || "Unknown entity",
      threatLevel: item.threat_level || item.threatLevel || "unknown",
      firstSeen: formatDate(item.first_seen || item.firstSeen),
      summary: item.summary || item.description || "No dossier summary available.",
      image: assetUrl(item.portrait || item.image)
    };
  }

  function normalizeVideo(item) {
    return {
      ...item,
      id: String(item.id),
      title: item.title || "Field video",
      subtitle: item.subtitle || item.description || "Video briefing",
      duration: item.duration || "TBC",
      poster: assetUrl(item.poster || item.thumbnail || "../assets/placeholders/intro-poster.svg"),
      embedUrl: item.embed_url || item.embedUrl || item.video_url || item.videoUrl || ""
    };
  }

  function normalizeDownload(item) {
    return {
      ...item,
      id: String(item.id),
      category: item.category || "wallpapers",
      title: item.title || "Signal asset",
      meta: item.meta || `${String(item.format || "FILE").toUpperCase()} · ${item.size || "TBC"}`,
      image: assetUrl(item.preview_image || item.previewImage || item.image),
      fileUrl: assetUrl(item.file_url || item.fileUrl || item.image)
    };
  }

  async function fetchLocal(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Local data request failed: ${response.status}`);
    return response.json();
  }

  async function fetchDirectus(collection) {
    const url = new URL(directusUrl(`/items/${collection}`));
    url.searchParams.set("limit", "-1");
    url.searchParams.set("sort", "-date_created");
    url.searchParams.set("filter[status][_eq]", "published");
    const headers = { Accept: "application/json" };
    if (apiConfig.publicToken) headers.Authorization = `Bearer ${apiConfig.publicToken}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Directus ${collection} request failed: ${response.status}`);
    const payload = await response.json();
    return Array.isArray(payload) ? payload : (payload.data || []);
  }

  async function loadCollection(key) {
    if (apiConfig.baseUrl) return fetchDirectus(collections[key] || key);
    return fetchLocal(apiConfig.localFallback[key]);
  }

  async function load() {
    const source = apiConfig.baseUrl ? "directus" : "local-json";
    try {
      const [sightings, events, villains, videos, downloads] = await Promise.all([
        loadCollection("sightings"), loadCollection("events"), loadCollection("villains"), loadCollection("videos"), loadCollection("downloads")
      ]);
      const groupedDownloads = { wallpapers: [], stickers: [], emojis: [] };
      downloads.map(normalizeDownload).forEach((item) => { (groupedDownloads[item.category] ||= []).push(item); });
      return {
        source,
        sightings: sightings.map(normalizeSighting),
        events: events.map(normalizeEvent),
        villains: villains.map(normalizeVillain),
        videos: videos.map(normalizeVideo),
        downloads: groupedDownloads
      };
    } catch (error) {
      if (!apiConfig.allowLocalFallback || source === "local-json") throw error;
      const [sightings, events, villains, videos, downloads] = await Promise.all([
        fetchLocal(apiConfig.localFallback.sightings), fetchLocal(apiConfig.localFallback.events), fetchLocal(apiConfig.localFallback.villains), fetchLocal(apiConfig.localFallback.videos), fetchLocal(apiConfig.localFallback.downloads)
      ]);
      const groupedDownloads = { wallpapers: [], stickers: [], emojis: [] };
      downloads.map(normalizeDownload).forEach((item) => { (groupedDownloads[item.category] ||= []).push(item); });
      return { source: "local-fallback", sightings: sightings.map(normalizeSighting), events: events.map(normalizeEvent), villains: villains.map(normalizeVillain), videos: videos.map(normalizeVideo), downloads: groupedDownloads, error };
    }
  }

  async function createSighting(item) {
    if (!apiConfig.baseUrl) return { persisted: false, item };
    const headers = { "Content-Type": "application/json", Accept: "application/json" };
    if (apiConfig.publicToken) headers.Authorization = `Bearer ${apiConfig.publicToken}`;
    const response = await fetch(directusUrl(`/items/${collections.sightings || "sightings"}`), { method: "POST", headers, body: JSON.stringify(item) });
    if (!response.ok) throw new Error(`Directus create sighting failed: ${response.status}`);
    const payload = await response.json();
    return { persisted: true, item: normalizeSighting(payload.data || payload) };
  }

  window.SpideyCMS = { load, createSighting, config };
})();
