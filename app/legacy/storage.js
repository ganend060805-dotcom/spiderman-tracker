/* =============================================
   SPIDEY TRACKER — Storage & Persistence Manager
   ============================================= */

const STORAGE_KEYS = {
  CUSTOM_SIGHTINGS: "spidey_custom_sightings",
  SOUND_ENABLED: "spidey_sound_enabled",
  INTRO_SEEN: "spidey_intro_seen",
  SAVED_FILTER: "spidey_saved_filter",
  TERMINAL_HISTORY: "spidey_terminal_history"
};

export class StorageManager {
  static getCustomSightings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SIGHTINGS);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  static saveCustomSighting(sighting) {
    try {
      const current = this.getCustomSightings();
      current.unshift(sighting);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SIGHTINGS, JSON.stringify(current));
      return true;
    } catch (_) {
      return false;
    }
  }

  static deleteCustomSighting(id) {
    try {
      const current = this.getCustomSightings().filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SIGHTINGS, JSON.stringify(current));
      return true;
    } catch (_) {
      return false;
    }
  }

  static getSoundEnabled() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      return raw === null ? true : raw === "true";
    } catch (_) {
      return true;
    }
  }

  static setSoundEnabled(enabled) {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
    } catch (_) {}
  }

  static getIntroSeen() {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.INTRO_SEEN) === "true";
    } catch (_) {
      return false;
    }
  }

  static setIntroSeen() {
    try {
      sessionStorage.setItem(STORAGE_KEYS.INTRO_SEEN, "true");
    } catch (_) {}
  }

  static getTerminalHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TERMINAL_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  static pushTerminalHistory(cmd) {
    try {
      if (!cmd || !cmd.trim()) return;
      const history = this.getTerminalHistory();
      history.push(cmd.trim());
      if (history.length > 50) history.shift();
      localStorage.setItem(STORAGE_KEYS.TERMINAL_HISTORY, JSON.stringify(history));
    } catch (_) {}
  }
}
