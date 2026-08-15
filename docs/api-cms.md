# API & CMS Integration

## Stack

- **Map renderer:** Leaflet 1.9.4.
- **Map tiles default:** OpenStreetMap Standard tiles.
- **CMS/API:** Directus REST API.
- **Runtime config:** `app/config.js`.
- **Adapter:** `app/cms.js`.

Leaflet menangani pan, zoom, geolocation, dan marker berdasarkan latitude/longitude. Attribution OpenStreetMap ditampilkan oleh Leaflet dan tidak boleh disembunyikan. Untuk traffic production besar, ganti tile URL dengan provider komersial/OSM-derived yang memiliki SLA dan tetap pertahankan attribution sesuai lisensinya.

## Menghubungkan Directus

Edit `app/config.js`:

```js
window.SPIDEY_CONFIG = {
  api: {
    provider: "directus",
    baseUrl: "https://cms.example.com",
    publicToken: "PUBLIC_READ_TOKEN_IF_NEEDED",
    allowLocalFallback: true,
    refreshMs: 60000,
    collections: {
      sightings: "sightings",
      events: "events",
      villains: "villains",
      videos: "videos",
      downloads: "downloads"
    }
  }
};
```

Jika `baseUrl` diisi, adapter membaca collection Directus melalui endpoint:

```text
GET /items/sightings?limit=-1&sort=-date_created&filter[status][_eq]=published
GET /items/events?limit=-1&sort=-date_created&filter[status][_eq]=published
GET /items/villains?limit=-1&sort=-date_created&filter[status][_eq]=published
GET /items/videos?limit=-1&sort=-date_created&filter[status][_eq]=published
GET /items/downloads?limit=-1&sort=-date_created&filter[status][_eq]=published
```

Directus perlu mengizinkan role publik membaca item yang sudah `published`. Untuk report pengguna, role/token browser sebaiknya hanya boleh membuat `sightings` dengan status `draft`; moderasi dan publish tetap dilakukan di CMS.

`refreshMs` mengatur polling data. Nilai `60000` berarti marker dan panel di-refresh setiap 60 detik saat tab sedang terlihat. Untuk kebutuhan live yang lebih ketat, tambahkan websocket/subscription di backend dan panggil fungsi hydrate yang sama setelah event masuk.

## Collection minimum

### `sightings`

| Field | Tipe | Catatan |
| --- | --- | --- |
| `id` | integer/UUID | primary key |
| `status` | string | `draft`, `published`, `archived` |
| `type` | string | `confirmed`, `rumored`, `event` |
| `marker_style` | string | `spider-green`, `spider-red`, `spider-white`, `star` |
| `title` | string | judul marker/feed |
| `summary` | text | ringkasan |
| `city` | string | kota |
| `country` | string | negara |
| `latitude` | decimal | latitude WGS84 |
| `longitude` | decimal | longitude WGS84 |
| `occurred_at` | datetime | waktu event/sighting |
| `source_label` | string | label sumber |
| `source_url` | string | URL sumber opsional |
| `image` | file/string | ID file Directus atau URL |

### `events`

Gunakan `title`, `description`, `venue`, `city`, `country`, `latitude`, `longitude`, `starts_at`, `ends_at`, `ticket_url`, `hero_image`, dan `status`.

### `villains`

Gunakan `name`, `threat_level`, `first_seen`, `summary`, `portrait`, dan `status`.

### `videos`

Gunakan `title`, `subtitle`, `duration`, `poster`, `embed_url`, dan `status`. `embed_url` harus berupa URL embed yang diizinkan provider video.

### `downloads`

Gunakan `category` (`wallpapers`, `stickers`, atau `emojis`), `title`, `meta`, `preview_image`, `file_url`, dan `status`.

## Report flow

Panel `Report Sightings` mengirim payload ke `POST /items/sightings` dengan status awal `draft`.

```json
{
  "type": "rumored",
  "marker_style": "spider-white",
  "title": "Sighting in Jakarta",
  "summary": "Short community report",
  "city": "Jakarta",
  "country": "Reported Area",
  "latitude": -6.2,
  "longitude": 106.8,
  "occurred_at": "2026-08-15T12:00:00Z",
  "source_label": "Verified Community Watch",
  "status": "draft"
}
```

Jika CMS gagal atau belum dikonfigurasi, report disimpan sementara di `localStorage` dan diberi status lokal di UI.

## Local development

Tanpa `baseUrl`, adapter membaca `data/sample-sightings.json`, `sample-events.json`, `sample-villains.json`, `sample-videos.json`, dan `sample-downloads.json`.

Jangan masukkan admin token Directus ke `config.js`. Gunakan public read token dengan permission minimum atau proxy endpoint melalui backend milikmu.
