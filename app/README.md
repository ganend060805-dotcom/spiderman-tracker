# App Shell Prototype

Shell aplikasi statis untuk Spidey Tracker Replica.

## Cara menjalankan

Dari folder `E:/pemrograman/spidey`, jalankan static server apa pun yang melayani root folder, lalu buka `app/index.html` melalui server tersebut. Contoh:

```text
python -m http.server 4173
```

Kemudian buka `http://localhost:4173/app/`.

Shell juga memiliki fallback data inline, sehingga struktur UI tetap dapat dipreview saat file JSON belum bisa diambil oleh browser.

## Yang sudah tersedia

- Map-first shell dengan fallback map SVG.
- Responsive navigation rail / bottom navigation.
- Hash navigation untuk setiap panel.
- Activity Log dengan filter dan detail marker.
- Report Sightings dengan caption builder dan external share intent.
- Web Watch cards dan detail dossier.
- Video modal placeholder.
- Events list dan detail event.
- Help/legend panel.
- Downloads tabs dan link download ke SVG placeholder.
- Keyboard Escape, focus-visible, reduced-motion, loading fallback data.

## Jalur pengembangan berikutnya

1. Ganti `fallbackData` dengan API/CMS.
2. Tambahkan map adapter untuk provider berlisensi.
3. Pecah `app.js` menjadi modul data, map, panel, dan analytics.
4. Ganti asset placeholder dengan aset final yang sudah melalui review lisensi.
