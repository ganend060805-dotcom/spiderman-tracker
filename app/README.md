# Spidey Tracker App

Panduan singkat untuk menjalankan shell aplikasi, map Leaflet, GPS Radar, dan koneksi Directus.

## Jalankan aplikasi

```powershell
cd E:\pemrograman\spidey
python backend/server.py
```

Kemudian buka:

[http://localhost:4173/app/](http://localhost:4173/app/)

### Jika asset tampil rusak

Server harus dijalankan dari `E:\pemrograman\spidey`, bukan dari `E:\pemrograman\spidey\app`. Folder `assets/` dan `data/` berada satu tingkat di atas `app/`.

Jangan membuka file dengan format `file://`. Browser dapat memblokir `fetch()` JSON lokal dan request CMS.

server.py juga menyediakan API presence realtime. Jika dijalankan melalui static server biasa, aplikasi tetap mencoba fallback antar-tab pada origin yang sama.

Schema PostgreSQL untuk deployment production tersedia di [../database/presence-schema.sql](../database/presence-schema.sql). Browser tidak boleh mengakses database secara langsung; gunakan backend dengan DATABASE_URL privat.

`legacy/` berisi modul modular lama yang dipertahankan sebagai referensi; shell aktif saat ini menggunakan `app.js`, `cms.js`, dan `config.js`.

## Kontrol utama

| Kontrol | Fungsi |
| --- | --- |
| Rail kiri | Filter confirmed, rumored, atau semua signal |
| `+` / `-` | Zoom map |
| `GPS` | Memulai atau menghentikan GPS scan |
| `RESET` | Kembali ke global signal grid |
| GPS Radar slider | Memilih radius 10-100 km |
| Klik marker | Membuka detail signal |
| `Escape` | Menutup panel atau modal |

## GPS Radar

1. Pilih radius antara 10 dan 100 km.
2. Tekan `START GPS SCAN`.
3. Izinkan lokasi pada browser.
4. Peta menggambar lingkaran area dan mengikuti posisi perangkat.
5. Signal terdekat akan diprioritaskan. Jika belum ada signal di radius tersebut, grid global tetap ditampilkan sebagai fallback.

GPS membutuhkan `localhost` atau HTTPS. Akurasi dapat berubah jika device berada di dalam ruangan atau permission lokasi dibatasi.

## Konfigurasi CMS

Edit [config.js](config.js):

```js
api: {
  provider: "directus",
  baseUrl: "https://cms.example.com",
  publicToken: "YOUR_PUBLIC_TOKEN",
  allowLocalFallback: true
}
```

`cms.js` akan mencoba Directus terlebih dahulu. Jika `baseUrl` kosong atau request gagal dan `allowLocalFallback` aktif, aplikasi menggunakan JSON di folder `data/`.

Collection yang digunakan:

- `sightings`
- `events`
- `villains`
- `videos`
- `downloads`

Schema lengkap tersedia di [../docs/api-cms.md](../docs/api-cms.md).

## File penting

```text
index.html   shell layout, modal, intro, dan map controls
app.js       state UI, Leaflet, GPS, event handler, dan rendering
cms.js       Directus REST adapter dan normalizer
config.js    endpoint API, collection, dan map tile
styles/      stylesheet modular
```

## Troubleshooting cepat

- **Logo/marker rusak:** server dijalankan dari folder yang salah; gunakan URL `/app/`.
- **Map tidak tampil:** cek koneksi tile provider dan buka DevTools Network.
- **GPS ditolak:** izinkan lokasi dan gunakan localhost atau HTTPS.
- **Intro tidak muncul:** hapus localStorage key `spidey_intro_seen_v2` untuk mengulang briefing.
- **CMS tidak terbaca:** cek `baseUrl`, CORS, public permission, dan nama collection.
- **Presence tidak muncul lintas device:** jalankan python backend/server.py dari root project, pastikan port dapat diakses, dan gunakan HTTPS saat deployment.
