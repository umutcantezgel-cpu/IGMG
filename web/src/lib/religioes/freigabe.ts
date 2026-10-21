/**
 * Religiöse Freigabe (ADR 0030, KERN 3.0): Entwurf → zur Prüfung → geprüft. Reine Funktionen ohne Datenbank für die
 * Verwaltung „Koran & Hadith“ (Wortbedeutungen, Tajwid-Texte, Hadith-Übersetzungen) und die Ausgaben-Freigabe.
 * Unit-Test: `tests/unit/religioese-freigabe.test.ts`.
 */
export const FREIGABE_STATUS = ['entwurf', 'zur_pruefung', 'geprueft'] as const;
export type FreigabeStatus = (typeof FREIGABE_STATUS)[number];

/** Inhaltsarten mit eigener Freigabespalte, die dieses Modul pflegt (Bezeichner wie im Freigabe-Verlauf `freigabe`). */
export const RELIGIOESE_ARTEN = ['quran_wortbedeutung', 'quran_wortbedeutung_ort', 'tajwid_regel', 'hadith_uebersetzung'] as const;
export type ReligioeseArt = (typeof RELIGIOESE_ARTEN)[number];

/**
 * Status nach dem Speichern eines Inhalts. Jede inhaltliche Änderung an einem geprüften Eintrag setzt ihn auf
 * „zur Prüfung“ zurück; ein Eintrag in Prüfung bleibt dort; ein Entwurf bleibt Entwurf, bis er eingereicht wird.
 * `alt = null`: neuer Eintrag.
 */
export function statusNachSpeichern(alt: FreigabeStatus | null, geaendert: boolean, einreichen: boolean): FreigabeStatus {
  if (alt === null) return einreichen ? 'zur_pruefung' : 'entwurf';
  if (!geaendert) return einreichen && alt === 'entwurf' ? 'zur_pruefung' : alt;
  if (alt === 'entwurf') return einreichen ? 'zur_pruefung' : 'entwurf';
  return 'zur_pruefung';
}

/** Schritt im Freigabe-Ablauf und welches Recht er braucht. */
export type Uebergang = 'einreichen' | 'freigeben' | 'zurueckweisen';

/**
 * Erlaubte Statuswechsel ohne inhaltliche Änderung: einreichen (Entwurf → zur Prüfung, Recht zum Bearbeiten),
 * freigeben (zur Prüfung → geprüft, `religioes.freigeben`), zurückweisen bzw. Freigabe aufheben (zur Prüfung oder
 * geprüft → Entwurf, `religioes.freigeben`, mit Grund). Alles andere: null.
 */
export function uebergang(alt: FreigabeStatus, neu: FreigabeStatus): Uebergang | null {
  if (alt === 'entwurf' && neu === 'zur_pruefung') return 'einreichen';
  if (alt === 'zur_pruefung' && neu === 'geprueft') return 'freigeben';
  if ((alt === 'zur_pruefung' || alt === 'geprueft') && neu === 'entwurf') return 'zurueckweisen';
  return null;
}

/**
 * Vier-Augen-Prinzip: Wer einen Inhalt zuletzt verfasst oder geändert hat, gibt ihn nicht selbst frei.
 * Ohne bekannte verfassende Person (z. B. Altbestand) darf jede prüfende Person freigeben.
 */
export function vierAugenErfuellt(verfasstVon: string | null, pruefendeId: string): boolean {
  return verfasstVon === null || verfasstVon !== pruefendeId;
}

/**
 * Ändert sich, was öffentlich sichtbar ist? Nur dann müssen die Cache-Tags erneuert werden (öffentlich ist nur
 * „geprüft“). `geaendert = false`: Inhalt unverändert gespeichert – dann zählt nur ein Statuswechsel.
 */
export function betrifftOeffentlich(alt: FreigabeStatus | null, neu: FreigabeStatus | null, geaendert = true): boolean {
  if (!geaendert && alt === neu) return false;
  return alt === 'geprueft' || neu === 'geprueft';
}

/** QuranEnc-Pflegepflicht (ADR 0025): nach 90 Tagen ist der Abruf zu prüfen. */
export const PFLEGE_TAGE = 90;
const TAG_MS = 86_400_000;

/** Tage seit dem Abruf (abgerundet, nie negativ). */
export function tageSeit(abgerufenAm: Date, jetzt: Date): number {
  return Math.max(0, Math.floor((jetzt.getTime() - abgerufenAm.getTime()) / TAG_MS));
}

/** Abruf älter als {@link PFLEGE_TAGE} Tage? */
export function abrufVeraltet(abgerufenAm: Date, jetzt: Date): boolean {
  return jetzt.getTime() - abgerufenAm.getTime() > PFLEGE_TAGE * TAG_MS;
}

/** Fortschritt in ganzen Prozent (0 bei leerer Menge, 100 nur bei vollständig). */
export function prozent(teil: number, gesamt: number): number {
  if (gesamt <= 0 || teil <= 0) return 0;
  if (teil >= gesamt) return 100;
  return Math.min(99, Math.floor((teil / gesamt) * 100));
}

/**
 * Kuratierte Liste neu ordnen: Eintrag `nummer` eine Stelle nach oben oder unten. Unbekannte Nummer oder Rand: die
 * Liste bleibt unverändert. Ergebnis immer als neue Liste.
 */
export function verschiebe<T>(liste: readonly T[], eintrag: T, richtung: 'hoch' | 'runter'): T[] {
  const neu = [...liste];
  const i = neu.indexOf(eintrag);
  const j = richtung === 'hoch' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= neu.length) return neu;
  [neu[i], neu[j]] = [neu[j], neu[i]];
  return neu;
}

/** Kennung einer Wortbedeutung an einer Stelle bzw. einer Hadith-Übersetzung im Freigabe-Verlauf (wie Modul „Freigaben“). */
export function ortKennung(o: { sure: number; vers: number; pos: number; sprache: string }): string {
  return `${o.sure}|${o.vers}|${o.pos}|${o.sprache}`;
}

export function hadithKennung(h: { sammlungId: string; nummer: string; sprache: string }): string {
  return `${h.sammlungId}|${h.nummer}|${h.sprache}`;
}

/** Gleicher Inhalt ohne Rücksicht auf die Reihenfolge der Schlüssel (jsonb ordnet Schlüssel um); `undefined` gilt wie `null`. */
export function gleicherInhalt(a: unknown, b: unknown): boolean {
  return stabil(a) === stabil(b);
}

function stabil(wert: unknown): string {
  if (wert === undefined || wert === null) return 'null';
  if (Array.isArray(wert)) return `[${wert.map(stabil).join(',')}]`;
  if (typeof wert === 'object') {
    const eintraege = Object.entries(wert as Record<string, unknown>)
      .filter(([, v]) => v !== undefined && v !== null)
      .sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0));
    return `{${eintraege.map(([k, v]) => `${JSON.stringify(k)}:${stabil(v)}`).join(',')}}`;
  }
  return JSON.stringify(wert);
}

/** Zerlegt eine Kennung `a|b|c|…` in genau `teile` nichtleere Teile, sonst null. */
export function zerlegeKennung(kennung: string, teile: number): string[] | null {
  const stuecke = kennung.split('|');
  return stuecke.length === teile && stuecke.every((s) => s.length > 0 && s.length <= 40) ? stuecke : null;
}

/**
 * KI-Regel 2 im Werkzeug (ADR 0040 Nr. 3, KERN 4.0 §2.2 Nr. 2, L3-E09): Diese Inhaltsarten bleiben menschlich – Koran-
 * Wortbedeutungen (auch an einer Stelle und im Lern-App-Pfad), die Koran-Wurzeltabelle (nur Werkzeugvorschlag + Lehrkraft),
 * Tajwid-Texte, Übersetzungen von Versen und Hadithen sowie Bittgebete. Import, Speichern und Freigeben verweigern sie, wenn
 * die Herkunft auf eine KI zeigt (Verfasser `ki:<lauf>` nach ADR 0040 Nr. 7 oder eine ausdrückliche Angabe in Quelle bzw.
 * Übersetzer). Der Wissenskurs (`aussage`, `aufgabe`, `lektion`) darf KI-Entwürfe haben – mit zwei Freigaben.
 */
export const NUR_MENSCHLICH = [
  'quran_wortbedeutung',
  'quran_wortbedeutung_ort',
  'koran_bedeutung',
  'wurzel',
  'tajwid_regel',
  'quran_uebersetzung',
  'hadith_uebersetzung',
  'bittgebet',
] as const;
export type NurMenschlich = (typeof NUR_MENSCHLICH)[number];

export function nurMenschlich(art: string): art is NurMenschlich {
  return (NUR_MENSCHLICH as readonly string[]).includes(art);
}

/** Maschinenlesbare KI-Herkunft (`ki:<lauf>/<modell>/<promptVersion>`, ADR 0040 Nr. 7; ebenso `ai:`). */
const KI_KENNUNG = /^\s*(?:ki|ai)\s*:/i;
/** Ausdrückliche Angaben in Freitext (Quelle, Übersetzer): Abkürzungen nur großgeschrieben, sonst ohne Rücksicht auf Groß/Klein. */
const KI_ABKUERZUNG = /(?:^|[^\p{L}\p{N}])(?:KI|AI|LLM)(?:$|[^\p{L}\p{N}])/u;
const KI_ANGABE =
  /künstliche[rn]? intelligenz|artificial intelligence|yapay zek[aâ]|chat-?gpt|\bgpt-?\d|sprachmodell|language model|dil modeli|maschinelle[rn]? übersetzung|machine translation|makine çevirisi|\bdeepl\b|google translate/iu;

/** Zeigt die Herkunftsangabe (Verfasser, Quelle, Übersetzer) auf eine KI? */
export function istKiHerkunft(wert: string | null | undefined): boolean {
  if (!wert) return false;
  const w = wert.normalize('NFC');
  return KI_KENNUNG.test(w) || KI_ABKUERZUNG.test(w) || KI_ANGABE.test(w);
}

/** Verstößt dieser Inhalt gegen KI-Regel 2? Nur für {@link NUR_MENSCHLICH}; jede Herkunftsangabe zählt. */
export function kiHerkunftVerboten(art: string, herkunft: readonly (string | null | undefined)[]): boolean {
  return nurMenschlich(art) && herkunft.some(istKiHerkunft);
}

/** Fehler des Imports bzw. Werkzeugs bei {@link kiHerkunftVerboten} (ohne Inhalt, nur Art und Kennung). */
export class KiHerkunftVerboten extends Error {
  constructor(
    readonly art: NurMenschlich,
    readonly kennung: string,
  ) {
    super(`KI-Regel 2 (ADR 0040 Nr. 3): ${art} ${kennung} stammt nach der Herkunftsangabe von einer KI – nur Menschen verfassen das.`);
    this.name = 'KiHerkunftVerboten';
  }
}

/** Bricht ab, wenn der Inhalt gegen KI-Regel 2 verstößt (Import, Werkzeuge). */
export function verlangeMenschlicheHerkunft(art: string, kennung: string, herkunft: readonly (string | null | undefined)[]): void {
  if (kiHerkunftVerboten(art, herkunft)) throw new KiHerkunftVerboten(art as NurMenschlich, kennung);
}
