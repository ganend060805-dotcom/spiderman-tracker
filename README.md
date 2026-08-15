
# Spidey Tracker Replica — Product Blueprint

Blueprint produk untuk membuat pengalaman web tracker interaktif yang terinspirasi dari pola navigasi dan fitur situs referensi, tanpa menyalin kode, artwork, video, logo, atau materi berlisensi milik pihak lain.

## Isi folder

- `docs/PRD.md` — product requirements document lengkap.
- `docs/design.md` — arahan visual, layout, komponen, interaksi, dan spesifikasi aset.
- `assets/` — aset SVG placeholder yang bisa diganti dengan artwork final.
- `data/` — data contoh untuk sightings, events, dan villain/web-watch cards.
- `app/` — shell aplikasi interaktif, Leaflet map, dan adapter Directus REST.

## Sumber observasi

Halaman referensi yang dianalisis: <https://spideytracker.net/intl/id/>.

Analisis dilakukan pada 15 Agustus 2026. Struktur dokumen ini adalah rancangan independen untuk prototipe internal. Ganti seluruh logo, font berlisensi, footage, foto, dan copy sebelum dipublikasikan.

## Rekomendasi urutan implementasi

1. Bangun shell aplikasi dan navigasi panel.
2. Integrasikan peta dengan provider yang memiliki izin penggunaan.
3. Masukkan data contoh dari `data/`, lalu sambungkan ke CMS/API.
4. Ganti aset placeholder di `assets/` dengan aset final.
5. Uji pengalaman desktop, tablet, mobile, keyboard, dan reduced motion.

## API/CMS

Konfigurasi Directus dan provider tile berada di [app/config.js](E:/pemrograman/spidey/app/config.js). Detail collection, permission, dan payload ada di [docs/api-cms.md](E:/pemrograman/spidey/docs/api-cms.md).
