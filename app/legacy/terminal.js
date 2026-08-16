/* =============================================
   SPIDEY TRACKER — Terminal Console Controller
   Interactive CLI with functional commands
   ============================================= */

import { appState } from "./data.js";
import { sound } from "./audio.js";
import { showToast, $ } from "./ui.js";
import { centerOnRecord, centerMap, updateMapFrame, renderMarkers } from "./map.js";
import { openPanel } from "./panel.js";
import { StorageManager } from "./storage.js";

export class TerminalConsole {
  static init() {
    this.modal = $("#terminalModal");
    this.output = $("#terminalOutput");
    this.input = $("#terminalInput");
    this.closeBtn = $("#closeTerminal");
    this.history = StorageManager.getTerminalHistory();
    this.historyIdx = this.history.length;

    if (!this.input) return;

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cmd = this.input.value.trim();
        if (cmd) {
          StorageManager.pushTerminalHistory(cmd);
          this.history = StorageManager.getTerminalHistory();
          this.historyIdx = this.history.length;
          this.execute(cmd);
          this.input.value = "";
        }
      } else if (e.key === "ArrowUp") {
        if (this.historyIdx > 0) {
          this.historyIdx--;
          this.input.value = this.history[this.historyIdx] || "";
        }
      } else if (e.key === "ArrowDown") {
        if (this.historyIdx < this.history.length - 1) {
          this.historyIdx++;
          this.input.value = this.history[this.historyIdx] || "";
        } else {
          this.historyIdx = this.history.length;
          this.input.value = "";
        }
      }
    });

    this.closeBtn?.addEventListener("click", () => this.hide());
  }

  static show() {
    if (!this.modal) return;
    this.modal.hidden = false;
    sound.playClick();
    setTimeout(() => {
      this.input?.focus();
    }, 80);
    this.print("SYSTEM: Spider-Net CLI v2.6.15 connected. Type 'help' for commands.\n");
  }

  static hide() {
    if (!this.modal) return;
    this.modal.hidden = true;
    sound.playClick();
  }

  static print(text, isError = false) {
    if (!this.output) return;
    const line = document.createElement("div");
    line.className = isError ? "term-line error" : "term-line";
    line.textContent = text;
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  static execute(rawCmd) {
    this.print(`> ${rawCmd}`);
    const parts = rawCmd.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
        this.print([
          "AVAILABLE COMMANDS:",
          "  help                  - List commands",
          "  scan                  - Scan active global frequencies",
          "  list                  - List all active signals",
          "  locate <city/id>      - Focus map on city or ID",
          "  filter <confirmed|rumored|event|all> - Filter markers",
          "  report <city> <desc>  - Submit live sighting report",
          "  sound <on|off>        - Toggle 8-bit audio system",
          "  radar                 - Trigger radar sweep ping",
          "  panel <name>          - Open panel (activity-log, report, help, etc.)",
          "  clear                 - Clear terminal screen",
          "  exit / close          - Close terminal console"
        ].join("\n"));
        sound.playClick();
        break;

      case "scan":
        sound.playRadarPing();
        this.print("Scanning global frequency nodes...");
        setTimeout(() => {
          const total = appState.data.sightings.length;
          this.print(`SCAN COMPLETE: ${total} signals detected in field network.`);
          sound.playAlert();
        }, 400);
        break;

      case "list":
        this.print(`=== ACTIVE SIGHTINGS (${appState.data.sightings.length}) ===`);
        appState.data.sightings.forEach((s) => {
          this.print(`[${s.type.toUpperCase()}] ${s.title} (${s.city}, ${s.country})`);
        });
        sound.playClick();
        break;

      case "locate":
        if (!args.length) {
          this.print("Usage: locate <city name or id>", true);
          sound.playError();
          return;
        }
        const query = args.join(" ").toLowerCase();
        const found = appState.data.sightings.find((s) =>
          s.id.toLowerCase().includes(query) ||
          s.city.toLowerCase().includes(query) ||
          s.country.toLowerCase().includes(query)
        );
        if (found) {
          this.print(`Locating: ${found.title} in ${found.city}...`);
          centerOnRecord(found.id);
          sound.playSuccess();
        } else {
          this.print(`Signal '${query}' not found in active database.`, true);
          sound.playError();
        }
        break;

      case "filter":
        const f = (args[0] || "").toLowerCase();
        if (["confirmed", "rumored", "event", "all"].includes(f)) {
          renderMarkers(f);
          this.print(`Map filtered by: ${f.toUpperCase()}`);
          sound.playClick();
        } else {
          this.print("Valid filters: confirmed, rumored, event, all", true);
          sound.playError();
        }
        break;

      case "report":
        if (args.length < 2) {
          this.print("Usage: report <City> <Description>", true);
          sound.playError();
          return;
        }
        const city = args[0];
        const desc = args.slice(1).join(" ");
        const newReport = {
          id: `sight-user-${Date.now()}`,
          type: "confirmed",
          markerStyle: "spider-red",
          title: `Sighting in ${city}`,
          summary: desc,
          location: { city: city, country: "Local Grid", lat: 0, lng: 0 },
          coordinates: { left: `${30 + Math.random() * 45}%`, top: `${30 + Math.random() * 30}%` },
          occurredAt: new Date().toISOString(),
          source: { label: "Field Terminal Report" },
          image: "../assets/placeholders/sighting-card.svg"
        };
        StorageManager.saveCustomSighting(newReport);
        appState.data.sightings.unshift(newReport);
        renderMarkers(appState.activeMapFilter);
        this.print(`REPORT LOGGED: ${newReport.title} added to global grid.`);
        sound.playSuccess();
        break;

      case "sound":
        const state = (args[0] || "").toLowerCase();
        if (state === "on") {
          sound.setSound(true);
          StorageManager.setSoundEnabled(true);
          this.print("Audio system ENABLED.");
          sound.playChime();
        } else if (state === "off") {
          sound.setSound(false);
          StorageManager.setSoundEnabled(false);
          this.print("Audio system MUTED.");
        } else {
          this.print(`Sound is currently ${sound.enabled ? "ENABLED" : "MUTED"}. Use: sound on | sound off`);
        }
        break;

      case "radar":
        sound.playRadarPing();
        this.print("Radar sonar ping triggered.");
        break;

      case "panel":
        const panelName = args[0];
        if (panelName) {
          openPanel(panelName);
          this.print(`Opening panel: ${panelName}`);
          this.hide();
        } else {
          this.print("Usage: panel <activity-log|report|web-watch|videos|events|help|downloads>", true);
        }
        break;

      case "clear":
        if (this.output) this.output.innerHTML = "";
        break;

      case "exit":
      case "close":
      case "quit":
        this.hide();
        break;

      default:
        this.print(`Unknown command: '${command}'. Type 'help' for command list.`, true);
        sound.playError();
        break;
    }
  }
}
