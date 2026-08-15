# Design System & UI Spec — Spidey Tracker Replica

**Status:** Draft visual untuk prototipe  
**Referensi perilaku:** [spideytracker.net/intl/id](https://spideytracker.net/intl/id/)  
**Aset awal:** `../assets/`

## 1. Arah visual

Nuansa yang dicari adalah **night operations dashboard bertemu film teaser**: peta gelap sebagai panggung, aksen merah sebagai sinyal bahaya, biru elektrik sebagai teknologi, dan panel kaca sebagai lapisan informasi.

Gunakan visual yang tegas dan kontras, tetapi jangan membuat teks kecil menyatu dengan background. Aksen sinematik datang dari gradien, grain ringan, garis koordinat, dan animasi halus—bukan dari flash atau motion yang terus-menerus.

### Kata kunci

`urban night` · `field report` · `signal red` · `electric blue` · `classified dossier` · `cinematic grid`

## 2. Design tokens

### Warna

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| `--ink-950` | `#080B12` | canvas utama |
| `--ink-900` | `#101522` | panel/navigation |
| `--ink-800` | `#182133` | card dan field |
| `--ink-700` | `#24314A` | border aktif / divider |
| `--paper-100` | `#F4F7FB` | teks utama |
| `--paper-300` | `#AEB9C8` | teks sekunder |
| `--signal-red` | `#EF3D4E` | confirmed, danger, primary CTA |
| `--signal-red-dark` | `#A71930` | hover/pressed merah |
| `--electric-blue` | `#39B9FF` | link, event, focus |
| `--acid-green` | `#B8F26A` | success / live |
| `--amber` | `#F7B955` | rumored / warning |
| `--glass` | `rgba(12, 18, 30, .82)` | panel overlay |
| `--map-line` | `rgba(110, 153, 198, .18)` | grid/contour |

### Tipografi

Gunakan font sans-serif condensed untuk heading dan font sans-serif netral untuk body. Font di bawah adalah fallback prototype; ganti dengan font berlisensi yang sudah disetujui.

- Display: `Arial Narrow`, `Roboto Condensed`, sans-serif; uppercase, tracking `0.08em`.
- Body: `Inter`, `Arial`, sans-serif; line-height 1.45.
- Data/meta: `IBM Plex Mono`, `Consolas`, monospace; tracking `0.04em`.

Skala:

| Token | Ukuran | Penggunaan |
| --- | --- | --- |
| `--text-xs` | 11px | label/status |
| `--text-sm` | 13px | meta dan nav |
| `--text-md` | 15px | body |
| `--text-lg` | 20px | card title |
| `--text-xl` | 28px | panel heading |
| `--text-hero` | clamp(40px, 8vw, 92px) | intro title |

### Spacing dan bentuk

- Base spacing: 4px.
- Spacing umum: 8, 12, 16, 24, 32, 48, 64px.
- Radius card: 12px.
- Radius chip/button: 999px untuk pill, 6px untuk command button.
- Border standar: 1px solid `rgba(244,247,251,.14)`.
- Shadow panel: `0 20px 60px rgba(0,0,0,.42)`.

## 3. Struktur layout

### Desktop ≥ 1024px

```text
┌──────────────────────────────────────────────────────────────┐
│ brand / nav rail                              sound / status  │
├───────────────┬──────────────────────────────┬───────────────┤
│               │                              │               │
│  command rail │          GLOBAL MAP          │ activity/feed  │
│  72–88px      │      markers + map tools     │  320–420px    │
│               │                              │               │
└───────────────┴──────────────────────────────┴───────────────┘
```

- Map mengisi viewport.
- Navigation rail di kiri dapat melebar menjadi label.
- Activity Log bisa menjadi right drawer atau full-width panel.
- Modal detail maksimal 560px.

### Tablet 768–1023px

- Rail kiri berubah menjadi top bar horizontal.
- Activity Log menjadi bottom sheet setinggi 44–72vh.
- Map tetap terlihat saat detail dibuka, kecuali video/full gallery.

### Mobile 360–767px

- Map full bleed di belakang.
- Top bar: logo, signal indicator, sound.
- Bottom nav 5 item: Map, Log, Events, Web Watch, More.
- Drawer detail menjadi bottom sheet dengan drag handle.
- Filter marker menjadi floating button + sheet.
- Hindari panel permanen yang menutup lebih dari 70% viewport.

## 4. Komponen utama

### 4.1 Intro overlay

Elemen:

- brand mark placeholder;
- eyebrow `FIELD NETWORK // ONLINE`;
- headline `Track the signal.`;
- body 1–2 kalimat;
- CTA solid merah `Start tracking`;
- secondary `Skip intro`;
- audio toggle.

Behavior:

- Entrance: opacity + translateY 12px, 400ms.
- CTA menutup overlay dan fokus ke map heading.
- Jika `prefers-reduced-motion`, tampilkan tanpa transform.

### 4.2 Command/navigation rail

Setiap item memiliki icon line 20px, label 11–12px, tooltip, dan active indicator merah 3px.

Urutan:

1. Map / back to map
2. Activity Log
3. Report Sightings
4. Web Watch
5. Videos
6. Events
7. Help
8. Downloads

### 4.3 Map canvas

- Background map: dark navy dengan grid koordinat tipis.
- Overlay: vignette ringan di sudut untuk keterbacaan panel.
- Controls: zoom in, zoom out, center, global reset.
- Map attribution wajib terlihat sesuai lisensi provider.
- Untuk prototype tanpa provider, gunakan `assets/placeholders/map-canvas.svg`.

### 4.4 Marker

| Tipe | Warna | Bentuk | Label |
| --- | --- | --- | --- |
| Confirmed | `--signal-red` | pin lingkaran + crosshair | `CONFIRMED` |
| Rumored | `--amber` | pin lingkaran + `?` | `RUMORED` |
| Event | `--electric-blue` | pin diamond + star | `EVENT` |

Marker default 40×48px desktop, 44×52px mobile. Hit area minimum 44×44px. Marker aktif mendapat ring `0 0 0 4px rgba(57,185,255,.28)`.

### 4.5 Detail drawer

Anatomi:

```text
┌─────────────────────────┐
│ [status]             X   │
│ TITLE                   │
│ city · local date       │
├─────────────────────────┤
│ media / poster          │
├─────────────────────────┤
│ summary                 │
│ source / last updated   │
│ [center map] [share]    │
└─────────────────────────┘
```

- Header sticky ketika konten scroll.
- Status selalu memakai badge + icon + teks.
- CTA utama merah; CTA sekunder outline biru.
- Detail event wajib menampilkan timezone.

### 4.6 Activity Log item

Isi minimum: marker icon, status, title 1–2 baris, city/country, date, thumbnail 48×48px.

States:

- default;
- hover/focus dengan border biru;
- selected dengan background `--ink-800`;
- loading skeleton;
- empty state dengan icon radar.

### 4.7 Filter chip

- Height minimum 36px.
- Default ghost; active memiliki fill transparan warna status + border status.
- Filter tidak boleh hanya dibedakan oleh warna; sertakan label dan icon.

### 4.8 Web Watch card

- Grid desktop 3 kolom, tablet 2, mobile 1.
- Portrait 4:5 dengan duotone gradient.
- Threat level berupa bar kecil + label.
- Hover menampilkan `Open dossier` tanpa menggeser layout.

### 4.9 Download gallery

- Tabs kategori di atas.
- Grid tile 2 kolom mobile, 3–4 desktop.
- Tampilkan format dan ukuran file.
- Preview modal tidak boleh mengunci scroll tanpa tombol close yang jelas.

### 4.10 Video modal

- Poster image sebelum play.
- Mute default.
- Caption track tersedia.
- Tombol `Skip` hanya pada intro, bukan pada konten editorial.
- Jika video unavailable, tampilkan poster, alasan singkat, dan link fallback.

## 5. Motion spec

- UI micro interaction: 150–220ms, ease-out.
- Drawer: 280ms, cubic-bezier(0.22, 1, 0.36, 1).
- Marker pulse: 2.4s loop, opacity tidak boleh turun di bawah 0.55.
- Intro: maksimal 1.2s total; selalu ada skip.
- Loading map: gunakan 3-step signal pulse, bukan spinner besar.
- Reduced motion: hilangkan pulse, parallax, zoom transition, dan autoplay.

## 6. Responsive behavior

| Komponen | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Navigation | left rail | top rail | bottom nav |
| Activity log | right panel | bottom sheet | bottom sheet |
| Filter | inline chips | horizontal scroll | modal sheet |
| Marker detail | side drawer | bottom sheet | bottom sheet |
| Download grid | 3–4 kolom | 2–3 kolom | 2 kolom |
| Video | modal 960px | modal 90vw | full-screen |

## 7. State dan aksesibilitas

Setiap komponen harus memiliki:

- loading state;
- empty state;
- error state;
- focus-visible state;
- disabled state bila relevan.

Checklist:

- Heading hierarchy satu `h1` per view.
- Semua icon button memiliki accessible name.
- Focus tidak hilang saat drawer dibuka/ditutup.
- Escape menutup lapisan teratas.
- Tab order mengikuti urutan visual.
- Peta memiliki alternatif list melalui Activity Log.
- Jangan gunakan flashing lebih dari 3 kali per detik.
- Caption video dan alt text disiapkan sebelum publish.

## 8. Asset specification

### Wajib untuk MVP

| Asset | Ukuran/format | Folder |
| --- | --- | --- |
| Brand mark | SVG, 96×96 viewBox | `assets/brand/` |
| Wordmark | SVG, responsive | `assets/brand/` |
| Marker icons | SVG, 48×56 | `assets/markers/` |
| Map fallback | SVG/PNG, 2400×1400 | `assets/placeholders/` |
| Intro/video poster | WebP/AVIF, 1920×1080 | `assets/placeholders/` |
| Sighting card | WebP/AVIF, 1200×800 | `assets/placeholders/` |
| Event card | WebP/AVIF, 1200×800 | `assets/placeholders/` |
| Villain portrait | WebP/AVIF, 800×1000 | `assets/placeholders/` |
| Wallpaper | PNG/WebP, 1440×2560 dan 2560×1440 | `assets/downloads/` |
| Sticker/emoji | SVG/PNG transparan | `assets/downloads/` |

### Aturan nama file

`<category>-<slug>-<variant>.<ext>`

Contoh: `marker-confirmed-default.svg`, `download-wallpaper-signal-01.svg`.

## 9. Asset inventory placeholder

File di bawah sudah dibuat sebagai kerangka visual dan boleh diganti:

- `assets/brand/spidey-tracker-mark.svg`
- `assets/brand/spidey-tracker-wordmark.svg`
- `assets/markers/marker-confirmed.svg`
- `assets/markers/marker-rumored.svg`
- `assets/markers/marker-event.svg`
- `assets/placeholders/map-canvas.svg`
- `assets/placeholders/intro-poster.svg`
- `assets/placeholders/sighting-card.svg`
- `assets/placeholders/event-card.svg`
- `assets/placeholders/villain-card.svg`
- `assets/downloads/wallpaper-signal-01.svg`
- `assets/downloads/sticker-web-grid.svg`
- `assets/downloads/emoji-spider-eye.svg`

## 10. Content handoff checklist

- [ ] Semua asset punya pemilik dan lisensi.
- [ ] Semua media punya alt text/caption.
- [ ] Semua event punya timezone dan expiry.
- [ ] Semua sighting punya status dan source.
- [ ] Semua external CTA sudah diuji di mobile.
- [ ] Copy Indonesia diperiksa native speaker.
- [ ] Tidak ada placeholder yang lolos ke production tanpa label internal dihapus.
