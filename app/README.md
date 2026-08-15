# App Shell Prototype

Shell aplikasi statis untuk Spidey Tracker Replica dengan adapter API/CMS.

## Cara menjalankan

Dari folder `E:/pemrograman/spidey`, jalankan static server apa pun yang melayani root folder, lalu buka `app/index.html` melalui server tersebut. Contoh:

```text
python -m http.server 4173
```

Kemudian buka `http://localhost:4173/app/`.

Penting: jalankan server dari `E:/pemrograman/spidey`, bukan dari folder `app`. Jika dibuka di `http://localhost:4173/`, asset seperti logo dan marker akan tampil sebagai ikon rusak karena folder `assets/` dan `data/` berada satu tingkat di atas `app/`.

Jangan membuka `app/index.html` dengan double-click (`file://`). Browser akan memblokir `fetch()` ke JSON lokal dan request CMS karena aturan CORS. Gunakan static server, VS Code Live Server, atau host web development lain.

Jika sebelumnya server terlanjur berjalan dari folder `app`, hentikan server itu, pindah ke `E:/pemrograman/spidey`, jalankan ulang server pada port yang sama, lalu buka `http://localhost:4173/app/`.

`app/config.js` mengatur endpoint Directus, collection, tile URL, dan attribution. `app/cms.js` memuat data dari Directus REST atau JSON development jika CMS belum diisi.

### GPS radius scan

Pada peta, panel `GPS RADAR` dapat digunakan untuk memilih radius 10–100 km. Tekan `START GPS SCAN`, izinkan akses lokasi browser, lalu aplikasi akan:

- mengikuti perubahan posisi perangkat dengan `watchPosition`;
- menggambar lingkaran radius pada peta Leaflet;
- hanya menampilkan sinyal yang berada di dalam radius aktif;
- memperbarui jumlah sinyal saat radius digeser atau posisi berubah.

GPS browser membutuhkan izin lokasi dan biasanya hanya berjalan pada `localhost` atau HTTPS. Tombol GPS di kontrol peta juga menjalankan dan menghentikan scan yang sama.

## Yang sudah tersedia

- Map-first shell dengan Leaflet + OpenStreetMap dan fallback Google embed.
- Intro briefing yang bisa di-skip dan disimpan per sesi browser.
- Responsive navigation rail / bottom navigation.
- Hash navigation untuk setiap panel.
- Activity Log dengan filter dan detail marker.
- Search Activity Log berdasarkan judul, kota, negara, atau sumber.
- Report Sightings dengan caption builder dan external share intent.
- Web Watch cards dan detail dossier.
- Video modal placeholder.
- Video cards dapat dirender dari collection CMS.
- Events list dan detail event.
- Help/legend panel.
- Downloads tabs, preview modal, dan link download ke SVG placeholder.
- Downloads dapat dirender dari collection CMS dengan `file_url` dan `preview_image`.
- Tooltip marker, marker selection state, live map center, dan zoom controls.
- Attribution OpenStreetMap tampil di map.
- Keyboard Escape, focus-visible, reduced-motion, loading fallback data.

## Jalur pengembangan berikutnya

1. Isi `api.baseUrl` di `app/config.js` dengan URL Directus.
2. Buat collections sesuai [docs/api-cms.md](../docs/api-cms.md).
3. Ganti tile URL OSM default dengan provider berlisensi jika traffic production besar.
4. Ganti asset placeholder dengan aset final yang sudah melalui review lisensi.
