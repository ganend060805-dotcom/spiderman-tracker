# SPIDEY TRACKER

> Interactive world-signal dashboard with a retro pixel control room, live map, GPS radar, and CMS-ready data layer.

Spidey Tracker adalah prototipe dashboard eksplorasi peta yang terinspirasi dari nuansa tracker arcade dan sci-fi interface. Proyek ini dibuat sebagai implementasi independen: struktur, kode, aset placeholder, dan data lokal dapat dikembangkan tanpa bergantung pada materi berlisensi dari situs referensi.

## Quick start

Pastikan Python tersedia, lalu jalankan static server dari root project:

```powershell
cd E:\pemrograman\spidey
python -m http.server 4173
```

Buka [http://localhost:4173/app/](http://localhost:4173/app/).

> Jangan menjalankan server dari folder `app` dan jangan membuka `index.html` dengan double-click. Aplikasi perlu membaca file JSON melalui HTTP agar asset dan data lokal bekerja dengan benar.

## Apa yang bisa dilakukan

### Global signal map

- Peta dunia interaktif berbasis Leaflet dan OpenStreetMap.
- Marker untuk confirmed signal, rumored signal, dan event.
- Tooltip, selection state, zoom, reset view, dan center-on-record.
- Palet navy/teal dengan scanline dan penggaris pixel di sekitar map.

### GPS Radar

- Scan radius interaktif dari 10 sampai 100 km.
- Mengikuti perubahan lokasi melalui browser Geolocation API.
- Menggambar lingkaran radius dan titik posisi pengguna.
- Menyaring sinyal terdekat; jika radius kosong, marker global tetap ditampilkan sebagai fallback.
- Menampilkan estimasi akurasi GPS dan jumlah sinyal di dalam radius.

### Interactive control room

- Intro briefing dengan radar animasi dan tab `SCAN`, `FILTER`, `REPORT`.
- Navigation rail untuk filter sinyal dan membuka panel.
- Activity Log dengan pencarian, filter, tooltip, dan detail record.
- Report Sightings untuk membuat laporan lapangan.
- Web Watch, Videos, Events, Help, dan Downloads.
- Pixel mascot dengan animasi bob dan blinking eyes.
- Keyboard-friendly modal flow dan dukungan reduced motion.

## Struktur project

```text
spidey/
├─ app/
│  ├─ index.html       # application shell dan panel UI
│  ├─ app.js           # state, interaksi, map, GPS, dan rendering
│  ├─ cms.js           # adapter Directus + local JSON fallback
│  ├─ config.js        # konfigurasi API, map tile, dan collection
│  ├─ styles.css       # entry point stylesheet
│  └─ styles/          # style modular: map, panel, ticker, modal, responsive
├─ assets/
│  ├─ brand/           # logo, mask, dan pixel mascot
│  ├─ markers/         # marker map
│  ├─ downloads/       # placeholder wallpaper/sticker/icon
│  └─ placeholders/    # poster dan card fallback
├─ data/               # JSON development data
├─ docs/
│  ├─ PRD.md           # product requirements
│  ├─ design.md        # visual system dan interaction direction
│  └─ api-cms.md       # schema Directus dan integrasi REST
└─ README.md
```

## API dan CMS

Secara default aplikasi menggunakan data JSON lokal agar dapat langsung dicoba. Untuk menghubungkan Directus, isi nilai berikut di [app/config.js](app/config.js):

```js
api: {
  provider: "directus",
  baseUrl: "https://cms.example.com",
  publicToken: "YOUR_PUBLIC_TOKEN"
}
```

Collection utama:

| Collection | Kegunaan |
| --- | --- |
| `sightings` | laporan penampakan dan marker map |
| `events` | event publik atau node aktivitas |
| `villains` | dossier Web Watch |
| `videos` | video briefing dan footage |
| `downloads` | wallpaper, sticker, dan asset pack |

Detail field, permission, dan payload tersedia di [docs/api-cms.md](docs/api-cms.md).

## Catatan GPS

GPS browser hanya dapat digunakan setelah user memberikan permission. Untuk development, gunakan `localhost`; untuk deployment, gunakan HTTPS. Perilaku GPS dapat berbeda berdasarkan browser, device, akurasi sensor, dan kondisi indoor/outdoor.

## Catatan lisensi dan production

- Tile provider harus mengikuti attribution dan terms of use masing-masing.
- Ganti seluruh placeholder artwork, logo, footage, dan copy dengan aset yang sudah memiliki izin sebelum production.
- Gunakan provider map berlisensi jika traffic production membutuhkan SLA atau kuota lebih tinggi.
- Tambahkan autentikasi dan validasi server-side sebelum menerima laporan publik secara nyata.

## Roadmap singkat

1. Sambungkan Directus production dan validasi schema.
2. Tambahkan auth untuk moderator laporan.
3. Tambahkan clustering marker dan historical playback.
4. Tambahkan telemetry GPS yang opt-in dan privacy-safe.
5. Ganti placeholder dengan asset final dan lakukan audit responsive/accessibility.

## Referensi desain

Konsep UI dianalisis dari [Spidey Tracker](https://spideytracker.net/intl/id/) pada 15 Agustus 2026. Implementasi ini adalah blueprint independen untuk pembelajaran dan prototyping.
