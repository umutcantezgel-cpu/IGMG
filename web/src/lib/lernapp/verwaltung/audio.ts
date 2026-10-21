import type { AudioFormat } from '@/lib/audio/format';
import type { Sprache } from '../kurse';

/**
 * Audio-Studio der Verwaltung (L3-06, ADR 0039 Nr. 7/8, KERN 4.0 §4). Rein: Ablageschlüssel, Grenzen und die Regel, was
 * vertont werden darf.
 */

/** Höchstgröße einer Aufnahme (ein Wort oder Satz; die Rezitations-Werkstatt erlaubt 60 MB je Sure). */
export const AUFNAHME_MAX_BYTES = 5 * 1024 * 1024;
/** Höchstdauer einer Aufnahme (Sätze bis C1 ≤ 35 Wörter). */
export const AUFNAHME_MAX_MS = 60_000;

const HEX64 = /^[0-9a-f]{64}$/;

/**
 * Privater Speicherschlüssel einer Rohaufnahme unter ihrem Inhalts-Hash: `lernapp/aufnahmen/<sprache>/<textHash16>-<sha16>.<endung>`.
 * Nicht über `/medien` erreichbar (keine Zeile in `medium`), nur über die Route des Audio-Studios.
 */
export function aufnahmeSchluessel(sprache: Sprache, textHash: string, sha256: string, format: Pick<AudioFormat, 'endung'>): string {
  if (!HEX64.test(textHash) || !HEX64.test(sha256)) throw new Error('Hash ungültig');
  if (!/^[a-z0-9]{2,5}$/.test(format.endung)) throw new Error('Endung ungültig');
  return `lernapp/aufnahmen/${sprache}/${textHash.slice(0, 16)}-${sha256.slice(0, 16)}.${format.endung}`;
}

/** Stimme eines Clips: Sprachausgabe, menschliche Aufnahme, Testton (Testkurs) oder unbekannt. */
export function stimmenArt(stimme: string): 'sprachausgabe' | 'mensch' | 'test' | 'unbekannt' {
  if (stimme.startsWith('tts:')) return 'sprachausgabe';
  if (stimme.startsWith('mensch:')) return 'mensch';
  if (stimme.startsWith('test:')) return 'test';
  return 'unbekannt';
}

/**
 * Darf ein Eintrag Audio bekommen? Nur Zieltexte der Sprachkurse ohne Religionsbezug, im Status außer `gesperrt`
 * (KERN 4.0 §4, ADR 0039 Nr. 7). Wissen (`islam`) und Koran-Arabisch (`koran`) nie.
 */
export function vertonbar(e: { kurs: string; religionsbezug: boolean; status: string }): boolean {
  return (e.kurs === 'de' || e.kurs === 'tr' || e.kurs === 'ar') && !e.religionsbezug && e.status !== 'gesperrt';
}

export type ClipLage = 'fehlt' | 'auffaellig' | 'vorhanden';

/**
 * Lage eines vertonbaren Eintrags im Studio: ohne Clip „fehlt“; mit Meldung „Audio“ oder einem Prüfurteil zur Aussprache
 * „auffällig“; sonst „vorhanden“.
 */
export function clipLage(o: { clips: number; meldungen: number; ausspracheBefund: boolean }): ClipLage {
  if (o.clips === 0) return 'fehlt';
  return o.meldungen > 0 || o.ausspracheBefund ? 'auffaellig' : 'vorhanden';
}

/** Gewählte Stimme eines Clips aus Wahl und vorhandenen Stimmen (gleich dem Vorrang im Paketbau, `pakete.ts`). */
export function wirksameStimme(stimmen: readonly string[], wahl: 'sprachausgabe' | 'mensch' | null): string | null {
  const vorrang = ['mensch:', 'tts:', 'test:'];
  const rang = (s: string) => {
    const i = vorrang.findIndex((p) => s.startsWith(p));
    return i < 0 ? vorrang.length : i;
  };
  const moeglich = stimmen.filter((s) => !(wahl === 'sprachausgabe' && s.startsWith('mensch:')));
  return [...moeglich].sort((a, b) => rang(a) - rang(b) || (a < b ? -1 : a > b ? 1 : 0))[0] ?? null;
}
