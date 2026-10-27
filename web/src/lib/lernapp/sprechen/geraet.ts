import { bewerteProbe, MODELL, type ProbeErgebnis } from './modell';

/**
 * Gerätecheck vor dem Download (ADR 0042 Fortschreibung S2 Nr. 7, Beleg S2 §5), rein: Die Werte erhebt die Sprechübung
 * im Browser (`components/lernapp/sprechen/erkennung.ts`), hier wird nur entschieden. Kein Netz.
 *
 * - Fehlt etwas Nötiges (Modul-Worker, WebAssembly mit SIMD, Mikrofon, MediaRecorder, AudioContext mit 16 kHz, Cache
 *   Storage), ist zu wenig Platz frei (< 200 MB) oder meldet das Gerät weniger als 4 GB Arbeitsspeicher, gibt es keinen
 *   Download: Rückfall „eigene Aufnahme anhören, selbst bewerten“ (ADR 0042 Nr. 8).
 * - Unbekannter Arbeitsspeicher (Safari, Firefox) ist erlaubt, mit Hinweis; ohne `crossOriginIsolated` läuft ORT mit nur
 *   einem Thread (Hinweis).
 */

export const MIN_FREI_BYTES = 200 * 1024 * 1024;
export const MIN_SPEICHER_GB = 4;

export type GeraetUmgebung = {
  modulWorker: boolean;
  wasmSimd: boolean;
  mikrofon: boolean;
  aufnahme: boolean;
  audio16k: boolean;
  vorrat: boolean;
  /** freier Platz laut `storage.estimate()`, `null` = unbekannt */
  freiBytes: number | null;
  /** `navigator.deviceMemory` (GB), `null` = unbekannt */
  speicherGb: number | null;
  isoliert: boolean;
};

export type GeraetMangel = 'worker' | 'wasm' | 'mikrofon' | 'aufnahme' | 'audio' | 'vorrat' | 'platz' | 'speicher';
export type GeraetHinweis = 'speicherUnbekannt' | 'ohneThreads';
export type GeraetBefund = { ok: boolean; maengel: GeraetMangel[]; hinweise: GeraetHinweis[] };

export function pruefeGeraet(u: GeraetUmgebung): GeraetBefund {
  const maengel: GeraetMangel[] = [];
  if (!u.modulWorker) maengel.push('worker');
  if (!u.wasmSimd) maengel.push('wasm');
  if (!u.mikrofon) maengel.push('mikrofon');
  if (!u.aufnahme) maengel.push('aufnahme');
  if (!u.audio16k) maengel.push('audio');
  if (!u.vorrat) maengel.push('vorrat');
  if (u.freiBytes !== null && u.freiBytes < MIN_FREI_BYTES) maengel.push('platz');
  if (u.speicherGb !== null && u.speicherGb < MIN_SPEICHER_GB) maengel.push('speicher');
  const hinweise: GeraetHinweis[] = [];
  if (u.speicherGb === null) hinweise.push('speicherUnbekannt');
  if (!u.isoliert) hinweise.push('ohneThreads');
  return { ok: maengel.length === 0, maengel, hinweise };
}

/** Lokal gemerkter Stand der Sprachprüfung auf diesem Gerät (nur hier, nicht im Ereignisprotokoll – das wird abgeglichen). */
export type SprechStand = {
  modell: string;
  /** Modell vollständig im Vorrat */
  geladen: boolean;
  /** Ergebnis des Probelaufs; `rueckfall` bleibt gemerkt, kein automatischer neuer Versuch (nur nach einem Probelauf, `standNachLaden`) */
  probe: { ergebnis: ProbeErgebnis; ms: number | null } | null;
};

export const SPRECH_STAND_SCHLUESSEL = 'igmg-lernapp-sprechen';
export const LEERER_STAND: SprechStand = { modell: MODELL.name, geladen: false, probe: null };

/** Gemerkten Stand lesen; anderes Modell oder Unlesbares → leer. */
export function liesSprechStand(roh: string | null): SprechStand {
  try {
    const s = JSON.parse(roh ?? '') as Partial<SprechStand>;
    if (s && s.modell === MODELL.name && typeof s.geladen === 'boolean') {
      const p = s.probe;
      const probe =
        p && (p.ergebnis === 'normal' || p.ergebnis === 'langsam' || p.ergebnis === 'rueckfall')
          ? { ergebnis: p.ergebnis, ms: typeof p.ms === 'number' && Number.isFinite(p.ms) ? p.ms : null }
          : null;
      return { modell: MODELL.name, geladen: s.geladen, probe };
    }
  } catch {
    // leer oder unlesbar
  }
  return LEERER_STAND;
}

/**
 * Ausgang eines Ladeversuchs auf Tipp (Mängelrunde 1 zu L3-E23: kein dauerhafter Rückfall ohne Probelauf, ADR 0042 Nr. 7):
 * - `abgebrochen`: Die Übung wurde verlassen, während die Sprachprüfung lud oder probte („Ich kann gerade nicht sprechen“,
 *   nächste Aufgabe, andere Seite; das Aufräumen beendet den Worker) – nichts merken, nichts ansagen;
 * - `ladefehler`: Download oder Aufbau gescheitert (Status ≠ 200 wie 429 der Ratenregel LM-40, Netzabbruch, Zeitgrenze) –
 *   nur diese Übung ohne Sprachprüfung; die nächste Sprechübung bietet das Laden wieder an, schon geladene Dateien bleiben
 *   im Vorrat (`fuelleVorrat` holt nur die fehlenden);
 * - `probe`: Der Probelauf lief (`ms` null = gescheitert, auch Absturz der Erkennung) – erst jetzt gilt das Modell als
 *   geladen, und das Urteil wird gemerkt, `rueckfall` dauerhaft auf diesem Gerät.
 */
export type LadeAusgang = { art: 'abgebrochen' } | { art: 'ladefehler' } | { art: 'probe'; ms: number | null };

/** Gemerkter Stand nach einem Ladeversuch (rein; die Sprechübung schreibt ihn nur bei `ladefehler` und `probe`). */
export function standNachLaden(stand: SprechStand, ausgang: LadeAusgang): SprechStand {
  if (ausgang.art === 'abgebrochen') return stand;
  if (ausgang.art === 'ladefehler') return { ...stand, geladen: false };
  return { ...stand, geladen: true, probe: { ergebnis: bewerteProbe(ausgang.ms), ms: ausgang.ms } };
}
