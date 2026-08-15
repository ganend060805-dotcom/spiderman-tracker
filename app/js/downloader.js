/* =============================================
   SPIDEY TRACKER — Asset Downloader & Generator
   ============================================= */

export class AssetDownloader {
  // Trigger generic file download
  static triggerDownload(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "spidey-asset";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  }

  // Generate a dynamic high-resolution pixel wallpaper as PNG
  static downloadWallpaper(title = "Spidey-Signal-Wallpaper") {
    const canvas = document.createElement("canvas");
    canvas.width = 1440;
    canvas.height = 2560;
    const ctx = canvas.getContext("2d");

    // Deep blue galaxy background
    const grad = ctx.createRadialGradient(720, 1280, 100, 720, 1280, 1400);
    grad.addColorStop(0, "#094eb8");
    grad.addColorStop(0.5, "#00338a");
    grad.addColorStop(1, "#00133a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1440, 2560);

    // Spider-Web Grid
    ctx.strokeStyle = "rgba(88, 196, 216, 0.25)";
    ctx.lineWidth = 4;
    for (let r = 100; r <= 1000; r += 120) {
      ctx.beginPath();
      ctx.arc(720, 1280, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
      ctx.beginPath();
      ctx.moveTo(720, 1280);
      ctx.lineTo(720 + Math.cos(angle) * 1200, 1280 + Math.sin(angle) * 1200);
      ctx.stroke();
    }

    // Centered Spider Logo Symbol
    ctx.fillStyle = "#e63946";
    ctx.beginPath();
    ctx.arc(720, 1280, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 12;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    // Spidey Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(670, 1270, 45, 60, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(770, 1270, 45, 60, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Title text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px monospace";
    ctx.textAlign = "center";
    ctx.fillText("SPIDEY TRACKER // FIELD NETWORK", 720, 1600);

    ctx.fillStyle = "#58c4d8";
    ctx.font = "32px monospace";
    ctx.fillText("GLOBAL SIGNAL RADAR", 720, 1660);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      this.triggerDownload(url, `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png");
  }

  // Generate .ics Calendar invite for upcoming events
  static downloadEventCalendar(event) {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Spidey Tracker//Field Events//EN",
      "BEGIN:VEVENT",
      `SUMMARY:Spider-Man Event: ${event.title}`,
      `DESCRIPTION:${event.description || "Spidey Tracker public signal"}`,
      `LOCATION:${event.venue || ""}, ${event.city || ""}, ${event.country || ""}`,
      `DTSTART:20260912T090000Z`,
      `DTEND:20260912T150000Z`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, `spidey-event-${event.id || "invite"}.ics`);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}
