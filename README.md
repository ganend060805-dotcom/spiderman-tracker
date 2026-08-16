# SPIDEY TRACKER

> Interactive world-signal dashboard with a retro pixel control room, live map, GPS radar, and CMS-ready data layer.

Spidey Tracker adalah prototipe dashboard eksplorasi peta yang terinspirasi dari nuansa tracker arcade dan sci-fi interface. Proyek ini dibuat sebagai implementasi independen: struktur, kode, aset placeholder, dan data lokal dapat dikembangkan tanpa bergantung pada materi berlisensi dari situs referensi.

## Quick start

Untuk mengaktifkan tracking operator lintas tab/device dan notifikasi realtime, gunakan server Python bawaan:

```powershell
cd E:\pemrograman\spidey
pip install -r backend/requirements.txt
python backend/server.py
```

Buka [http://localhost:4173/app/](http://localhost:4173/app/).

Jika hanya ingin melihat UI tanpa backend presence, python -m http.server 4173 tetap dapat digunakan. Aplikasi akan otomatis memakai fallback lokal antar-tab pada origin yang sama.

Jangan membuka index.html dengan double-click. Aplikasi perlu membaca file JSON melalui HTTP agar asset, data lokal, dan presence bekerja dengan benar.

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

Folder tambahan: `backend/` berisi server presence dan konektor MySQL, sedangkan `database/` berisi schema MySQL production.

```text
spidey/
â”œâ”€ app/
â”‚  â”œâ”€ index.html       # application shell dan panel UI
â”‚  â”œâ”€ app.js           # state, interaksi, map, GPS, dan rendering
â”‚  â”œâ”€ cms.js           # adapter Directus + local JSON fallback
â”‚  â”œâ”€ config.js        # konfigurasi API, map tile, dan collection
â”‚  â”œâ”€ styles.css       # entry point stylesheet
â”‚  â””â”€ styles/          # style modular: map, panel, ticker, modal, responsive
â”œâ”€ assets/
â”‚  â”œâ”€ brand/           # logo, mask, dan pixel mascot
â”‚  â”œâ”€ markers/         # marker map
â”‚  â”œâ”€ downloads/       # placeholder wallpaper/sticker/icon
â”‚  â””â”€ placeholders/    # poster dan card fallback
â”œâ”€ data/               # JSON development data
â”œâ”€ docs/
â”‚  â”œâ”€ PRD.md           # product requirements
â”‚  â”œâ”€ design.md        # visual system dan interaction direction
â”‚  â””â”€ api-cms.md       # schema Directus dan integrasi REST
â””â”€ README.md
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

### Live operator presence

- Masukkan username saat pertama kali membuka aplikasi.
- Izinkan lokasi browser untuk menampilkan mark operator di peta.
- Operator lain yang masuk akan memunculkan notifikasi NEW VARIANT APPEARANCE.
- Presence online dan riwayat appearance sekarang disimpan di MySQL. Backend membersihkan sesi timeout setiap 15 detik.
- Untuk deployment lintas-device, jalankan python backend/server.py di server HTTPS dan arahkan presence.baseUrl di app/config.js bila API berada di origin berbeda.
- Struktur MySQL production tersedia di [database/presence-schema.sql](database/presence-schema.sql).

### MySQL setup

1. Jalankan database/presence-schema.sql melalui phpMyAdmin.
2. Install connector Python dengan pip install -r backend/requirements.txt.
3. Isi environment DB_* berdasarkan backend/env.example.
4. Jalankan python backend/server.py dari root project.

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
