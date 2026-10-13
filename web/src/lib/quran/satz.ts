/**
 * Satz des Koran-Lesers (ADR 0025, 0030): baut aus Verstext, Wortzerlegung und Tajwid-Segmenten das HTML eines Verses.
 * Reine Funktionen ohne Abhängigkeit vom Server. Arabisch entsteht nie im Code: Der Text kommt aus der Datenbank, das
 * Versende-Zeichen und die Ziffern aus Unicode-Codepunkten.
 *
 * Kompakt, weil Al-Baqara (286 Verse, 6.141 Wörter) als statisches HTML klein bleiben muss: Wörter als
 * `<span data-w="n">`, Tajwid-Abschnitte als `<b class="tj tj-familie">`, Pausen- und Sajda-Zeichen als bloßer Text
 * zwischen den Wörtern (sie hängen am Leerzeichen davor).
 */
import { abschnitte, type TajwidSegment } from './tajwid';
import { zerlege } from './woerter';

/** Ende eines Verses (ARABIC END OF AYAH, U+06DD); steht vor der Versnummer und umschließt sie in der Koranschrift. */
export const VERSENDE = String.fromCodePoint(0x06dd);

/** Zahl in arabisch-indischen Ziffern (U+0660 … U+0669). */
export function arabischeZahl(n: number): string {
  return String(Math.trunc(Math.abs(n)))
    .split('')
    .map((z) => String.fromCodePoint(0x0660 + Number(z)))
    .join('');
}

/** Teil eines Verses mit Versatz in Codepunkten: Wort (`pos` ≥ 1) oder Zeichen ohne Wortnummer (`pos` null). */
export type SatzTeil = { text: string; pos: number | null; versatz: number };

/** Zerlegt einen Vers in Teile mit Versatz (Codepunkte ab Versanfang; Teile sind durch genau ein Leerzeichen getrennt). */
export function teileMitVersatz(text: string): SatzTeil[] {
  let versatz = 0;
  return zerlege(text).map((t) => {
    const teil = { text: t.text, pos: t.pos, versatz };
    versatz += Array.from(t.text).length + 1;
    return teil;
  });
}

const ZEICHEN: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Text für HTML maskieren. */
export function maskiere(text: string): string {
  return text.replace(/[&<>"']/g, (z) => ZEICHEN[z] ?? z);
}

/** HTML eines Worts: Tajwid-Abschnitte (an Graphem-Grenzen bereinigt) als <b>, ungefärbte Abschnitte als Text. */
export function wortHtml(text: string, tajwid: readonly TajwidSegment[], versatz: number): string {
  return abschnitte(text, tajwid, versatz)
    .map((a) => (a.familie ? `<b class="tj tj-${a.familie}">${maskiere(a.text)}</b>` : maskiere(a.text)))
    .join('');
}

/**
 * HTML des arabischen Verses: Wörter als `<span data-w="pos">`, dazwischen Zeichen als Text. `teile` stammen aus
 * `quran_wort` (Positionen) und dem Verstext (Versatz); fehlt `tajwid`, bleibt der Vers ungefärbt (lieber ungefärbt
 * als falsch). Das Versende mit Nummer setzt in Listen das CSS (Zähler `vers`, `quran.css`), sonst `versEndeHtml`.
 */
export function versHtml(teile: readonly SatzTeil[], tajwid: readonly TajwidSegment[] | null): string {
  const segmente = tajwid ?? [];
  return teile
    .map((t) => (t.pos === null ? maskiere(t.text) : `<span data-w="${t.pos}">${wortHtml(t.text, segmente, t.versatz)}</span>`))
    .join(' ');
}

/** Versende als Text (außerhalb der Verslisten, z. B. Beispielvers der Tajwid-Seite). */
export function versEndeHtml(versNr: number): string {
  return `<span class="versende">${VERSENDE}${arabischeZahl(versNr)}</span>`;
}

/** Anker eines Verses: auf der Surenseite `v7`, im Cüz mit Sure `v2-142` (über Surengrenzen eindeutig). */
export function versAnker(sure: number, vers: number, mitSure: boolean): string {
  return mitSure ? `v${sure}-${vers}` : `v${vers}`;
}

/** Vers mit allem, was der Satz braucht (Auszug aus `VersDaten` der Queries). */
export type SatzVers = { nr: number; teile: readonly SatzTeil[]; tajwid: readonly TajwidSegment[]; uebersetzung: string | null };

/**
 * Grenze für den vollen Satz im HTML (Codepunkte des arabischen Texts einer Liste). Die Seite trägt ihren Inhalt
 * zweimal (HTML und Daten der Hydrierung); mit Wort-Spans und Tajwid-<b> bliebe Al-Baqara (56.220 Codepunkte) nicht
 * unter 150 KB gzip. Darüber steht der Vers als schlichter Text (`data-roh`), voll lesbar auch ohne JavaScript; die
 * Insel setzt Wörter und Tajwid nach dem Laden aus der Wort-Route ein (`anreichern.ts`). Betrifft nur Sure 2;
 * die nächstlängste Sure (4) hat 34.550, ein Cüz höchstens rund 26.000.
 */
export const VOLLSATZ_GRENZE = 40_000;

/** Länge des arabischen Texts in Codepunkten (Teile plus Leerzeichen). */
export function satzLaenge(verse: readonly SatzVers[]): number {
  let n = 0;
  for (const v of verse) for (const t of v.teile) n += Array.from(t.text).length + 1;
  return n;
}

/**
 * Listeneinträge einer Sure (oder eines Teils davon) als ein HTML-Text: je Vers ein `<li class="vers">` mit Anker,
 * dem arabischen Vers (`lang="ar" dir="rtl"`) und darunter der Übersetzung. Versende und Versnummern setzt das CSS
 * (Zähler), damit jedes Byte zählt: Ein einziger Text statt tausender Elemente hält die Seite klein.
 * `voll`: Wörter und Tajwid im HTML; sonst schlichter Text mit `data-roh` (siehe `VOLLSATZ_GRENZE`).
 */
export function versListeHtml(sure: number, verse: readonly SatzVers[], mitSure: boolean, voll = true): string {
  return verse
    .map((v) => {
      const ar = voll ? `<p class="vers-ar" lang="ar" dir="rtl">${versHtml(v.teile, v.tajwid)}</p>` : `<p class="vers-ar" lang="ar" dir="rtl" data-roh>${maskiere(v.teile.map((t) => t.text).join(' '))}</p>`;
      const ue = v.uebersetzung === null ? '' : `<p class="vers-ue">${maskiere(v.uebersetzung)}</p>`;
      return `<li class="vers" id="${versAnker(sure, v.nr, mitSure)}" data-v="${v.nr}">${ar}${ue}</li>`;
    })
    .join('');
}
