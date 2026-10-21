import type { Sprache } from '@/lib/lernapp/kurse';
import type { SprechErgebnis } from '@/lib/lernapp/sprechen/auswertung';
import {
  type GeraetUmgebung,
  LEERER_STAND,
  liesSprechStand,
  SPRECH_STAND_SCHLUESSEL,
  type SprechStand,
} from '@/lib/lernapp/sprechen/geraet';
import {
  ABTASTRATE,
  type AnArbeiter,
  arbeiterAdresse,
  type ErkennungsSprache,
  GESAMT_BYTES,
  type VomArbeiter,
  VORRAT_MODELLE,
  VORRAT_PFLICHT,
} from '@/lib/lernapp/sprechen/modell';

/**
 * Spracherkennung im Client (ADR 0042 Fortschreibung S2 Nr. 4–7): Gerätecheck (ohne Netz), lokal gemerkter Stand
 * (`localStorage`, nur dieses Gerät), Worker unter `/lern-app/modelle/sprechen/` (eigener Ursprung, CSP der Lern-App).
 * Der Worker wird nach der Übung beendet (`beende`), damit der Arbeitsspeicher frei wird; ein Neustart lädt aus dem Vorrat.
 */

/** Probe auf WebAssembly mit SIMD (kleinstes Modul mit einem v128-Befehl, wie `wasm-feature-detect`). */
const SIMD = new Uint8Array([
  0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
]);

function modulWorker(): boolean {
  if (typeof Worker === 'undefined') return false;
  let kann = false;
  try {
    // Die Option wird vor der Adresse gelesen; die ungültige Adresse verhindert jeden Abruf
    new Worker('blob://', {
      get type() {
        kann = true;
        return 'module' as const;
      },
    }).terminate();
  } catch {
    // erwartet: ungültige Adresse
  }
  return kann;
}

function audio16k(): boolean {
  try {
    const ctx = new AudioContext({ sampleRate: ABTASTRATE });
    void ctx.close();
    return true;
  } catch {
    return false;
  }
}

/** Werte für den Gerätecheck erheben (ohne Netz, ohne Mikrofon-Freigabe). */
export async function erhebeUmgebung(): Promise<GeraetUmgebung> {
  let freiBytes: number | null = null;
  try {
    const s = await navigator.storage?.estimate?.();
    if (s?.quota !== undefined) freiBytes = Math.max(0, s.quota - (s.usage ?? 0));
  } catch {
    freiBytes = null;
  }
  const speicher = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return {
    modulWorker: modulWorker(),
    wasmSimd: typeof WebAssembly !== 'undefined' && WebAssembly.validate(SIMD),
    mikrofon: Boolean(navigator.mediaDevices?.getUserMedia),
    aufnahme: typeof MediaRecorder !== 'undefined',
    audio16k: typeof AudioContext !== 'undefined' && audio16k(),
    vorrat: typeof caches !== 'undefined',
    freiBytes,
    speicherGb: typeof speicher === 'number' ? speicher : null,
    isoliert: Boolean(globalThis.crossOriginIsolated),
  };
}

export function liesStand(): SprechStand {
  try {
    return liesSprechStand(localStorage.getItem(SPRECH_STAND_SCHLUESSEL));
  } catch {
    return LEERER_STAND;
  }
}

export function merkeStand(stand: SprechStand): void {
  try {
    localStorage.setItem(SPRECH_STAND_SCHLUESSEL, JSON.stringify(stand));
  } catch {
    // ohne Speicher (privates Fenster): gilt nur für diese Seite
  }
}

/**
 * Liegt das geladene Modell noch im Vorrat (Encoder, Decoder, ORT-`.wasm`)? Ohne Netz, nur `caches.match`. Bei Fehlern
 * oder ohne Cache Storage: nein – dann bietet die Übung das Laden wieder mit Größe an (ADR 0042 Fortschreibung Nr. 13).
 */
export async function imVorrat(speicher: CacheStorage | undefined = globalThis.caches): Promise<boolean> {
  try {
    if (!speicher || !(await speicher.has(VORRAT_MODELLE))) return false;
    const vorrat = await speicher.open(VORRAT_MODELLE);
    const treffer = await Promise.all(VORRAT_PFLICHT.map((adresse) => vorrat.match(adresse)));
    return treffer.every(Boolean);
  } catch {
    return false;
  }
}

/** Bau-Kennung der Seite (`data-bau` am `<html>` der Lern-App). */
export const bauDerSeite = (): string => document.documentElement.dataset.bau ?? 'lokal';

/** Automatische Rückmeldung nur für de/tr (Fortschreibung S2 Nr. 1: Arabisch mit whisper-base ohne Rückmeldung). */
export const erkennbar = (s: Sprache): s is ErkennungsSprache => s === 'de' || s === 'tr';

const ZEITGRENZE = { laden: 600_000, probe: 30_000, erkennung: 60_000 } as const;

/** Ein Worker je Sprechübung; Absturz oder Zeitüberschreitung → Fehler (Rückfall in der Übung). */
export class Erkennung {
  private arbeiter: Worker;
  private naechste = 1;
  private warten = new Set<(n: VomArbeiter | null) => void>();

  constructor(bau = bauDerSeite()) {
    this.arbeiter = new Worker(arbeiterAdresse(bau), { type: 'module', name: 'whisper' });
    this.arbeiter.onmessage = (e: MessageEvent<VomArbeiter>) => this.warten.forEach((w) => w(e.data));
    this.arbeiter.onerror = () => this.warten.forEach((w) => w(null));
  }

  private frage<T>(nachricht: AnArbeiter, ms: number, passt: (n: VomArbeiter) => T | undefined, transfer: Transferable[] = []) {
    return new Promise<T>((fertig, fehler) => {
      const uhr = setTimeout(() => ende(null), ms);
      const ende = (n: VomArbeiter | null) => {
        if (n === null) {
          clearTimeout(uhr);
          this.warten.delete(ende);
          fehler(new Error('Worker'));
          return;
        }
        if (n.art === 'fehler') {
          clearTimeout(uhr);
          this.warten.delete(ende);
          fehler(new Error(n.bei));
          return;
        }
        const wert = passt(n);
        if (wert === undefined) return;
        clearTimeout(uhr);
        this.warten.delete(ende);
        fertig(wert);
      };
      this.warten.add(ende);
      this.arbeiter.postMessage(nachricht, transfer);
    });
  }

  /** Modell laden (aus dem Vorrat bzw. vom eigenen Ursprung); `fortschritt` 0…1 nach Bytes. */
  laden(fortschritt: (anteil: number) => void = () => undefined): Promise<void> {
    const je = new Map<string, number>();
    return this.frage({ art: 'laden' }, ZEITGRENZE.laden, (n) => {
      if (n.art === 'fortschritt') {
        je.set(n.datei, n.geladen);
        fortschritt(Math.min(1, [...je.values()].reduce((s, b) => s + b, 0) / GESAMT_BYTES));
        return undefined;
      }
      return n.art === 'bereit' ? true : undefined;
    }).then(() => undefined);
  }

  /** Probelauf mit dem eingebauten Clip; Dauer in ms. */
  probe(): Promise<number> {
    return this.frage({ art: 'probe' }, ZEITGRENZE.probe, (n) => (n.art === 'probe' ? n.ms : undefined));
  }

  /** Aufnahme gegen den Zielsatz prüfen (nur Markierung, keine Abschrift). */
  erkenne(pcm: Float32Array, sprache: ErkennungsSprache, ziel: string): Promise<SprechErgebnis> {
    const id = this.naechste++;
    return this.frage(
      { art: 'erkenne', id, pcm, sprache, ziel },
      ZEITGRENZE.erkennung,
      (n) => (n.art === 'ergebnis' && n.id === id ? n.ergebnis : undefined),
      [pcm.buffer],
    );
  }

  beende(): void {
    this.warten.forEach((w) => w(null));
    this.arbeiter.terminate();
  }
}
