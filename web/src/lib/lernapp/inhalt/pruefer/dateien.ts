import type { Sprache } from '../../kurse';
import type { ImportQuelle } from '../import';
import {
  type AudioManifestDatei,
  type AusspracheDatei,
  dateiArtVon,
  erwarteterPfad,
  type IslamEinheitDatei,
  type KoranPfadDatei,
  type Leitfaden,
  pruefeInhaltDatei,
  pruefeWeitereDatei,
  type RahmenDatei,
  type SprachEinheitDatei,
  type SymbolDatei,
  type UebersetzungDatei,
} from '../schema';
import { Befunde } from './typen';

/** Gelesene und nach Schema geprüfte Inhaltsdateien (Pfade relativ zu `web/inhalte/lernapp/`). */
export type Inhalte = {
  sprache: { pfad: string; daten: SprachEinheitDatei }[];
  uebersetzung: { pfad: string; daten: UebersetzungDatei }[];
  rahmen: Map<Sprache, { pfad: string; daten: RahmenDatei }>;
  leitfaden: { pfad: string; daten: Leitfaden } | null;
  islam: { pfad: string; daten: IslamEinheitDatei }[];
  koran: { pfad: string; daten: KoranPfadDatei } | null;
  aussprache: { pfad: string; daten: AusspracheDatei }[];
  audio: { pfad: string; daten: AudioManifestDatei }[];
  symbole: { pfad: string; daten: SymbolDatei } | null;
  /** Vorsilbe der Quellen des Testkurses (`testkurs/`, `PruefOptionen.praefix`); leer bei den echten Inhalten */
  praefix: string;
};

/** Datei des Testkurses (Pfad mit der Vorsilbe `praefix`)? Nur dort sind Testeinheiten und Quellen `test:…` zulässig. */
export const ausTestkurs = (inhalte: Pick<Inhalte, 'praefix'>, pfad: string): boolean =>
  inhalte.praefix !== '' && pfad.startsWith(inhalte.praefix);

export const leereInhalte = (praefix = ''): Inhalte => ({
  sprache: [],
  uebersetzung: [],
  rahmen: new Map(),
  leitfaden: null,
  islam: [],
  koran: null,
  aussprache: [],
  audio: [],
  symbole: null,
  praefix,
});

/**
 * Prüfer „Schema“ (PLAN §6.4: Schema, eindeutige Schlüssel, Ablageort): jede JSON-Datei nach ihrer Art (Pfad, PLAN §6.1)
 * gegen Zod; Schlüssel über alle Sprach- und Wissensdateien eindeutig. `praefix`: Vorsilbe der Quellen (Testkurs
 * `testkurs/`), die vor der Einordnung abgeschnitten wird; `pfadePruefen: false` übergeht den Ablageort.
 */
export function leseInhalte(
  quellen: readonly ImportQuelle[],
  { praefix = '', pfadePruefen = true }: { praefix?: string; pfadePruefen?: boolean } = {},
): { inhalte: Inhalte; befunde: Befunde } {
  const b = new Befunde('schema');
  const inhalte = leereInhalte(praefix);
  for (const q of quellen) {
    const pfad = praefix && q.pfad.startsWith(praefix) ? q.pfad.slice(praefix.length) : q.pfad;
    const art = dateiArtVon(pfad);
    if (art === null) continue;
    let roh: unknown;
    try {
      roh = JSON.parse(q.text);
    } catch {
      b.blockierend(q.pfad, 'kein gültiges JSON');
      continue;
    }
    if (art === 'sprache-einheit' || art === 'uebersetzung') {
      const p = pruefeInhaltDatei(roh);
      if (!p.ok) {
        for (const f of p.fehler) b.blockierend(q.pfad, f);
        continue;
      }
      if (pfadePruefen && pfad !== erwarteterPfad(p.datei)) b.blockierend(q.pfad, `gehört nach ${erwarteterPfad(p.datei)}`);
      if (p.datei.art === 'sprache') inhalte.sprache.push({ pfad: q.pfad, daten: p.datei.daten });
      else inhalte.uebersetzung.push({ pfad: q.pfad, daten: p.datei.daten });
      continue;
    }
    const p = pruefeWeitereDatei(pfad, roh);
    if (!p.ok) {
      for (const f of p.fehler) b.blockierend(q.pfad, f);
      continue;
    }
    const d = p.datei;
    if (d.art === 'rahmen') inhalte.rahmen.set(d.daten.sprache, { pfad: q.pfad, daten: d.daten });
    else if (d.art === 'leitfaden') inhalte.leitfaden = { pfad: q.pfad, daten: d.daten };
    else if (d.art === 'islam') inhalte.islam.push({ pfad: q.pfad, daten: d.daten });
    else if (d.art === 'koran') inhalte.koran = { pfad: q.pfad, daten: d.daten };
    else if (d.art === 'aussprache') inhalte.aussprache.push({ pfad: q.pfad, daten: d.daten });
    else if (d.art === 'audio_manifest') inhalte.audio.push({ pfad: q.pfad, daten: d.daten });
    else inhalte.symbole = { pfad: q.pfad, daten: d.daten };
  }
  pruefeSchluessel(inhalte, b);
  return { inhalte, befunde: b };
}

/** Schlüssel über alle Dateien eindeutig (Einheiten, Lemmata, Sätze, Lektionen, Aufgaben, Aussagen). */
function pruefeSchluessel(inhalte: Inhalte, b: Befunde): void {
  const gesehen = new Map<string, string>();
  const merke = (pfad: string, schluessel: string) => {
    const vorher = gesehen.get(schluessel);
    if (vorher && vorher !== pfad) b.blockierend(pfad, `Schlüssel auch in ${vorher}`, schluessel);
    else gesehen.set(schluessel, pfad);
  };
  for (const { pfad, daten: d } of inhalte.sprache)
    for (const k of [
      d.einheit.schluessel,
      ...d.lemmata.map((x) => x.schluessel),
      ...d.saetze.map((x) => x.schluessel),
      ...d.lektionen.map((x) => x.schluessel),
      ...d.lektionen.flatMap((x) => x.aufgaben.map((a) => a.schluessel)),
    ])
      merke(pfad, k);
  for (const { pfad, daten: d } of inhalte.islam)
    for (const k of [
      d.einheit.schluessel,
      ...d.lektionen.flatMap((l) => [l.schluessel, ...l.aussagen.map((a) => a.schluessel), ...l.aufgaben.map((a) => a.schluessel)]),
    ])
      merke(pfad, k);
  // Übersetzungen: je Richtung und Einheit höchstens eine Datei
  const richtungen = new Map<string, string>();
  for (const { pfad, daten: d } of inhalte.uebersetzung) {
    const k = `${d.richtung}|${d.einheit}`;
    const vorher = richtungen.get(k);
    if (vorher) b.blockierend(pfad, `Übersetzung der Einheit ${d.einheit} (${d.richtung}) auch in ${vorher}`);
    else richtungen.set(k, pfad);
  }
}
