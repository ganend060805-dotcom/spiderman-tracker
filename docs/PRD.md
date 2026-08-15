# PRD — Spidey Tracker Replica

**Status:** Draft untuk prototipe internal  
**Tanggal:** 15 Agustus 2026  
**Bahasa utama:** Bahasa Indonesia  
**Platform:** Web responsif, desktop-first tetapi mobile-ready  
**Rujukan perilaku:** [Spidey Tracker — Indonesia](https://spideytracker.net/intl/id/)

> Dokumen ini memodelkan struktur pengalaman dan pola interaksi dari situs rujukan. Jangan menyalin source code, logo, ilustrasi, foto, video, musik, metadata, atau copy berhak cipta. Gunakan aset original atau aset yang memiliki izin.

## 1. Ringkasan produk

Spidey Tracker Replica adalah pengalaman web sinematik yang memungkinkan pengunjung mengikuti jejak penampakan karakter pahlawan fiksi di berbagai lokasi, membaca kronologi aktivitas, menemukan event, melihat arsip musuh, menonton video, dan mengunduh konten digital.

Pengalaman utama berpusat pada **peta global interaktif**. Peta menjadi sumber konteks, sementara panel dan modal menjadi lapisan informasi yang dapat dibuka tanpa meninggalkan halaman utama.

### Prinsip produk

1. **Map first:** pengguna selalu dapat kembali ke peta.
2. **Progressive disclosure:** informasi ringkas muncul pada marker; detail lengkap muncul di drawer/modal.
3. **Cinematic but usable:** nuansa teaser film tetap kuat tanpa mengorbankan keterbacaan dan aksesibilitas.
4. **Real-time feeling:** aktivitas terbaru tampil sebagai feed berurutan.
5. **Localizable:** copy, tanggal, zona waktu, format alamat, dan CTA siap dilokalkan.

## 2. Masalah yang ingin diselesaikan

Penggemar biasanya menerima informasi event, rumor, video, dan materi promosi dari banyak kanal yang terpisah. Mereka memerlukan satu pengalaman visual yang:

- menunjukkan **di mana** aktivitas terjadi;
- menjelaskan **apa yang terjadi** dan seberapa kuat status informasinya;
- membantu menemukan event yang dapat dihadiri;
- menyajikan konten tambahan tanpa membuat halaman terasa seperti katalog statis.

## 3. Tujuan dan metrik keberhasilan

### Tujuan MVP

- Pengunjung memahami tujuan situs dalam 10 detik pertama.
- Pengunjung dapat menemukan penampakan di lokasi tertentu dalam maksimal 3 interaksi.
- Pengunjung dapat membedakan status **Confirmed**, **Rumored**, dan **Event** tanpa membaca panduan panjang.
- Pengunjung dapat membuka detail event dan menekan CTA eksternal.
- Pengunjung dapat menemukan villain dan mengunduh minimal satu aset digital.

### Metrik awal

| Metrik | Target prototipe | Cara ukur |
| --- | --- | --- |
| Map engagement rate | ≥ 60% sesi | klik/zoom/pan/filter pada peta |
| Marker detail open rate | ≥ 35% sesi | detail marker dibuka |
| Activity log open rate | ≥ 25% sesi | panel activity log dibuka |
| Event CTA click-through | ≥ 10% pengunjung event | klik `Lihat detail`/`Dapatkan tiket` |
| Download conversion | ≥ 8% sesi | unduhan wallpaper/sticker/emoji |
| First meaningful paint | ≤ 2,5 detik di koneksi 4G | RUM/Lighthouse |
| Accessibility | WCAG 2.2 AA untuk shell dan modal | audit keyboard/kontras/screen reader |

## 4. Target pengguna

### Persona A — Tracker fan

Penggemar yang ingin mengecek update terbaru dengan cepat. Ia lebih tertarik pada marker, tanggal, dan feed daripada artikel panjang.

**Kebutuhan:** peta mudah dipahami, filter status, activity log, update terbaru.  
**Risiko:** terlalu banyak marker dan animasi membuatnya kehilangan orientasi.

### Persona B — Event seeker

Pengunjung yang ingin datang ke event atau fan activity.

**Kebutuhan:** tanggal, lokasi, status event, detail venue, CTA tiket/peta.  
**Risiko:** informasi zona waktu dan ketersediaan tiket tidak jelas.

### Persona C — Casual visitor

Pengunjung dari kampanye sosial yang hanya punya waktu 1–2 menit.

**Kebutuhan:** intro singkat, visual kuat, trailer, satu CTA jelas.  
**Risiko:** loading map terlalu lama atau intro otomatis terasa menghambat.

### Persona D — Content admin

Tim internal yang mengelola sighting, event, villain, video, dan asset download.

**Kebutuhan:** schema data konsisten, status publish, lokalitas, media fallback, audit perubahan.

## 5. Ruang lingkup

### In scope — MVP

- Landing shell dengan intro dan peta.
- Peta global interaktif dengan pan, zoom, reset center, dan layer kontrol.
- Marker untuk confirmed sighting, rumored sighting, dan event.
- Panel **Activity Log** dengan daftar kronologis dan filter tipe.
- Panel **Report Sightings** yang mengarahkan pengguna ke kanal eksternal (misalnya X) dengan caption terisi.
- Panel **Events** dengan kartu event, detail lokasi, tanggal, status, dan CTA.
- Panel **Web Watch** berisi daftar villain dengan foto/ilustrasi, deskripsi, dan status.
- Panel **Videos** dengan trailer/clip dan modal video.
- Panel **Help** berisi legenda marker dan cara navigasi.
- Panel **Samsung Exclusives/Downloads** sebagai katalog aset: wallpaper, sticker, emoji.
- Kontrol sound on/off, mute video, skip intro, dan `prefers-reduced-motion`.
- Lokalisasi Bahasa Indonesia sebagai baseline.
- Data dummy JSON yang dapat diganti API/CMS.

### Out of scope — MVP

- Login dan profil pengguna.
- Verifikasi crowdsourced yang benar-benar real-time.
- Moderasi laporan otomatis.
- Pembelian tiket di dalam aplikasi.
- AR camera mode.
- Peta 3D atau street view.
- Sistem komentar, like, atau follow.
- Integrasi akun sosial selain link/intent share.

## 6. Arsitektur pengalaman

```text
Landing / Intro
        │
        ▼
Peta global ──────── Activity Log
   │   │   │              │
   │   │   └──────────────┘
   │   ├── Marker detail drawer
   │   └── Map filters / legend
   │
   ├── Report Sightings → external social intent
   ├── Events → event detail drawer → map/external ticket CTA
   ├── Web Watch → villain detail drawer
   ├── Videos → video modal
   ├── Downloads → asset gallery → download
   └── Help → onboarding / legend
```

## 7. User journeys

### Journey 1 — Melihat sighting terbaru

1. Pengguna masuk ke landing.
2. Intro singkat menampilkan logo placeholder, copy, dan tombol `Mulai tracking`.
3. Peta selesai diinisialisasi; marker tampil sesuai default filter.
4. Pengguna memilih marker.
5. Drawer menampilkan status, judul, waktu, lokasi, sumber, dan media.
6. Pengguna menutup drawer atau memilih `Lihat di activity log`.

**Empty state:** bila tidak ada marker pada viewport, tampilkan `Belum ada laporan di area ini` dan CTA `Reset ke global`.

### Journey 2 — Menemukan event

1. Pengguna memilih tab `Events` atau filter `Event`.
2. Panel event menampilkan kartu terurut berdasarkan waktu terdekat.
3. Pengguna membuka detail event.
4. Detail menampilkan tanggal lokal + zona waktu, alamat, status tiket, image/video, dan CTA.
5. CTA `Buka peta` memusatkan map pada koordinat event.

### Journey 3 — Melaporkan sighting

1. Pengguna klik `Report sightings`.
2. Modal memberi konteks singkat dan menampilkan template caption.
3. Pengguna memilih `Post on X`.
4. Situs membuka intent URL di tab baru.
5. Setelah kembali, tampilkan toast `Laporan siap dibagikan`.

### Journey 4 — Menjelajah Web Watch

1. Pengguna memilih `Web Watch`.
2. Grid villain menampilkan nama, level ancaman, dan ringkasan.
3. Pengguna membuka kartu.
4. Drawer menampilkan detail, first seen, kemampuan, dan sighting terkait.

### Journey 5 — Mengunduh aset

1. Pengguna membuka `Downloads`.
2. Tab `Wallpapers`, `Stickers`, dan `Emojis` ditampilkan.
3. Pengguna memilih item.
4. Modal menampilkan preview, ukuran, dan CTA `Download`.
5. Jika perangkat mobile, tampilkan instruksi singkat untuk menyimpan gambar.

## 8. Kebutuhan fungsional

### 8.1 Shell dan navigasi

- F-001: Sistem harus menampilkan top navigation atau navigation rail dengan item `Activity Log`, `Report Sightings`, `Web Watch`, `Videos`, `Events`, `Help`, dan `Downloads`.
- F-002: Setiap item navigasi harus membuka panel/modal tanpa full page reload.
- F-003: Semua panel harus memiliki tombol close, dukungan `Escape`, focus trap, dan kembali ke peta.
- F-004: Logo harus berfungsi sebagai shortcut `Back to map`.
- F-005: URL hash/deep link minimal tersedia untuk panel utama, misalnya `#events` dan `#web-watch`.

### 8.2 Intro dan audio

- F-006: Tampilkan intro hanya pada sesi pertama atau ketika pengguna memilih `Replay intro`.
- F-007: Audio default harus muted kecuali pengguna memberikan consent/aksi eksplisit.
- F-008: Sediakan kontrol `Sound on`, `Sound off`, `Tap to unmute`, dan `Skip`.
- F-009: Jika video gagal dimuat, tampilkan poster dan copy fallback.

### 8.3 Peta

- F-010: Peta mendukung pan, zoom in, zoom out, reset global, dan center ke lokasi pengguna bila izin diberikan.
- F-011: Marker harus memiliki tiga tipe: confirmed, rumored, event.
- F-012: Marker memiliki hover/focus state, label singkat, dan detail drawer.
- F-013: Marker yang bertumpuk harus dikelompokkan pada zoom rendah.
- F-014: Filter map dapat mengaktifkan/menonaktifkan tiga tipe marker.
- F-015: Peta harus memiliki fallback statis jika provider map gagal.
- F-016: Setiap marker menyimpan koordinat, timezone, status, tanggal, title, summary, source URL, dan media opsional.

### 8.4 Activity Log

- F-017: Feed menampilkan item terbaru di atas.
- F-018: Feed mendukung filter tipe, pencarian judul, dan pagination/infinite scroll.
- F-019: Item feed menunjukkan badge status, title, location, date, dan thumbnail opsional.
- F-020: Klik item memusatkan peta dan membuka detail yang sama dengan marker.

### 8.5 Reports

- F-021: Tampilkan instruksi singkat untuk format laporan yang baik.
- F-022: Sediakan template caption dengan hashtag dan mention yang dapat diedit.
- F-023: Link sosial harus dikonfigurasi dari CMS/env, bukan hardcode tersebar.
- F-024: Jangan menyimpan data pribadi pelapor tanpa consent eksplisit.

### 8.6 Events

- F-025: Kartu event menampilkan status `Upcoming`, `Live`, atau `Past`.
- F-026: Detail event mendukung beberapa timezone dengan default berdasarkan locale.
- F-027: CTA tiket/registrasi boleh mengarah ke domain pihak ketiga di tab baru.
- F-028: Event dapat difilter berdasarkan negara/kota dan tanggal.

### 8.7 Web Watch

- F-029: Tampilkan villain cards dengan nama, threat level, first seen, dan summary.
- F-030: Detail villain dapat menghubungkan ke sightings terkait.
- F-031: Jika media tidak ada, gunakan placeholder yang jelas dan tidak memalsukan foto.

### 8.8 Downloads dan media

- F-032: Asset gallery mendukung kategori, preview, ukuran, format, dan download.
- F-033: Video mendukung poster image, captions/subtitles, play/pause, mute, dan close.
- F-034: Semua media memiliki alt text atau label aksesibel.

## 9. Data model minimum

### Sighting

```json
{
  "id": "sight-001",
  "type": "confirmed",
  "title": "Jejak merah di jembatan kota",
  "summary": "Siluet terlihat melintas saat matahari terbenam.",
  "location": { "city": "Jakarta", "country": "Indonesia", "lat": -6.2088, "lng": 106.8456 },
  "timezone": "Asia/Jakarta",
  "occurredAt": "2026-08-14T18:30:00+07:00",
  "source": { "label": "Field report", "url": "https://example.com/report" },
  "media": [{ "kind": "image", "src": "/assets/placeholders/sighting-card.svg", "alt": "Placeholder sighting" }],
  "status": "published"
}
```

### Event

```json
{
  "id": "event-001",
  "title": "Night Watch Pop-up",
  "description": "Experience interaktif dengan photo spot dan mini screening.",
  "venue": "Rooftop Hall",
  "city": "Jakarta",
  "country": "Indonesia",
  "timezone": "Asia/Jakarta",
  "startsAt": "2026-09-12T16:00:00+07:00",
  "endsAt": "2026-09-12T22:00:00+07:00",
  "status": "upcoming",
  "coordinates": { "lat": -6.1754, "lng": 106.8272 },
  "ticketUrl": "https://example.com/tickets",
  "heroImage": "/assets/placeholders/event-card.svg"
}
```

### Villain / Web Watch entry

```json
{
  "id": "villain-001",
  "name": "The Coil",
  "threatLevel": "high",
  "firstSeen": "2026-07-04",
  "summary": "Pengguna kabel magnetik yang mengacaukan jaringan kota.",
  "abilities": ["Magnetic tether", "Vertical traversal"],
  "portrait": "/assets/placeholders/villain-card.svg",
  "relatedSightingIds": ["sight-001"]
}
```

## 10. Aturan konten dan lokalisasi

- Gunakan Bahasa Indonesia yang ringkas, aktif, dan terasa seperti catatan lapangan.
- Pertahankan istilah UI yang mudah dikenali: `Activity Log`, `Events`, `Web Watch`, `Downloads`.
- Tanggal utama harus menggunakan format lokal, contoh `14 Agu 2026`, tetapi simpan ISO 8601 di data.
- Tampilkan timezone pada detail event, bukan hanya tanggal.
- Semua label status wajib memiliki teks dan warna/icon; jangan mengandalkan warna saja.
- Copy rumor harus memakai penanda ketidakpastian seperti `Belum terkonfirmasi`.
- Sediakan fallback bahasa Inggris untuk konten yang belum diterjemahkan.

## 11. Non-functional requirements

- NFR-001: Layout responsif pada 360px, 768px, 1024px, dan 1440px.
- NFR-002: Target Lighthouse Performance ≥ 80 pada halaman shell setelah media dimuat secara lazy.
- NFR-003: Semua panel dapat dinavigasi dengan keyboard.
- NFR-004: Kontras teks normal minimal 4.5:1.
- NFR-005: Hindari autoplay video bersuara; hormati reduced motion.
- NFR-006: Peta harus memiliki akses alternatif melalui Activity Log.
- NFR-007: Error API, image, video, dan map memiliki empty/error state yang dapat dipahami.
- NFR-008: Jangan mengumpulkan lokasi pengguna sebelum meminta izin.
- NFR-009: External links menggunakan `noopener` dan indikator external link.
- NFR-010: Asset besar menggunakan AVIF/WebP dengan SVG untuk icon/marker.

## 12. Analytics yang disarankan

Event analytics minimal:

- `intro_started`, `intro_skipped`, `audio_toggled`;
- `map_loaded`, `map_control_used`, `map_filter_changed`;
- `marker_opened`, `marker_shared`, `activity_log_opened`;
- `report_flow_started`, `report_external_clicked`;
- `event_opened`, `event_cta_clicked`;
- `web_watch_opened`, `villain_opened`;
- `video_started`, `video_completed`;
- `download_previewed`, `download_started`.

Jangan kirim koordinat presisi pengguna, data pribadi, atau isi laporan tanpa consent.

## 13. Acceptance criteria MVP

- [ ] Pengguna dapat masuk dari landing ke map tanpa dead end.
- [ ] Tiga tipe marker terlihat berbeda dan memiliki legenda.
- [ ] Klik marker membuka detail yang dapat ditutup dengan `Escape`.
- [ ] Activity Log menampilkan data yang sama dengan marker.
- [ ] Filter mengubah marker dan feed secara konsisten.
- [ ] Event detail memiliki tanggal, lokasi, timezone, status, dan CTA.
- [ ] Report flow membuka kanal eksternal dengan template caption.
- [ ] Web Watch memiliki minimal 6 kartu villain placeholder.
- [ ] Downloads memiliki tiga kategori dan tombol download yang berfungsi pada aset dummy.
- [ ] Intro dapat di-skip dan audio dapat dimute.
- [ ] Semua fungsi utama dapat dipakai tanpa mouse.
- [ ] Fallback tampil saat map, image, atau video gagal.
- [ ] Copy dan data contoh tidak mengklaim sebagai informasi resmi.

## 14. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Ketergantungan provider peta | Peta gagal/biaya membengkak | abstraksikan map adapter, sediakan static fallback |
| Terlalu banyak marker | Peta membingungkan | clustering, filter default, viewport-based loading |
| Media berat | Loading lambat | poster, lazy load, responsive source, CDN |
| Rumor dianggap fakta | Risiko reputasi | badge status, source label, disclaimer |
| Materi berlisensi dipakai tanpa izin | Risiko legal | gunakan placeholder original, asset inventory, review legal |
| Audio/video mengganggu | Bounce rate dan aksesibilitas | muted by default, skip, reduced motion |
| Data event cepat usang | Pengguna kecewa | `last updated`, expiry date, owner content |

## 15. Backlog tahap berikutnya

### P1 — setelah MVP

- CMS editorial untuk sightings/events/villains.
- Import CSV/JSON dan validasi koordinat.
- Multi-language Indonesia/English/Japanese/Korean.
- Shareable deep link untuk marker dan event.
- Moderation queue untuk laporan pengguna.

### P2 — eksplorasi

- Timeline replay berdasarkan tanggal.
- Weather/time-of-day layer.
- WebSocket live updates.
- Gamified badges untuk eksplorasi.
- PWA offline shell dengan cache marker terakhir.

## 16. Definition of done

Fitur dianggap selesai bila acceptance criteria terpenuhi, memiliki loading/empty/error state, lolos keyboard smoke test, memiliki event analytics yang disepakati, dan copy/asset sudah ditandai status lisensinya.
