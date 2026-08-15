/* Runtime configuration for the static prototype.
 * Edit this file for a Directus deployment. Keep public read-only tokens only.
 */
window.SPIDEY_CONFIG = {
  api: {
    provider: "directus",
    baseUrl: "",
    publicToken: "",
    allowLocalFallback: true,
    refreshMs: 60000,
    collections: {
      sightings: "sightings",
      events: "events",
      villains: "villains",
      videos: "videos",
      downloads: "downloads"
    },
    localFallback: {
      sightings: "../data/sample-sightings.json",
      events: "../data/sample-events.json",
      villains: "../data/sample-villains.json",
      videos: "../data/sample-videos.json",
      downloads: "../data/sample-downloads.json"
    }
  },
  map: {
    provider: "leaflet-osm",
    tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener noreferrer\">OpenStreetMap contributors</a>",
    defaultCenter: [20, 10],
    defaultZoom: 2,
    minZoom: 1,
    maxZoom: 18
  }
};
