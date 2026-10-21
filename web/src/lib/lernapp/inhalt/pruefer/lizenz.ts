import { zerlegeRichtung } from '../../kurse';
import { woerter as arabischeWoerter } from '../../waechter/kern.mjs';
import { TATOEBA_AUSSCHLUSS, tatoebaId } from '../tatoeba';
import type { Inhalte } from './dateien';
import { type KaikkiEintrag, ladeKaikki, ladeTatoeba, type TatoebaSatz } from './daten';
import { Befunde } from './typen';

/**
 * Prüfer „Lizenz“ und „Ausschlussliste“ (PLAN §6.4, KERN 4.0 §1, ADR 0045; blockierend). Quelle und Lizenz je Eintrag sind
 * Pflicht (Schema, `ERLAUBTE_LIZENZEN` ohne NC/ND); hier zusätzlich:
 *
 * - **eigene Inhalte** (`ki:`, `redaktion`, `test:`) stehen unter CC BY-SA 4.0 (L0-E02).
 * - **Tatoeba** (`tatoeba:<id>`): Satz im gepinnten Auszug, nicht auf der Ausschlussliste (Koran-/Hadith-4-Gramm), keine negative
 *   Bewertung, kein Wartungs-Tag `@…`, höchstens 12 Wörter (Standardfilter S7-E3), Lizenz wie im Auszug, Namensnennung
 *   „Satz #<id> von <benutzer>“ bzw. „Tatoeba-Mitwirkende“; abweichender Text nur mit Vermerk „bearbeitet“ (arabisch
 *   vokalisiert: „bearbeitet (vokalisiert)“); Religions-Tag nur mit `religionsbezug: true`.
 * - **Wiktionary/kaikki** (`wiktionary:<ausgabe>:<seitentitel>`, `kaikki:`): CC BY-SA 4.0 mit Namensnennung; der Artikel steht im
 *   gepinnten Kernauszug (sonst Warnung: nur im vollen Auszug prüfbar).
 * - **Ausschlussliste:** keine NC-, ND-, Research-only-Lizenzen in Lizenzfeldern (Audio, Bildkarten), keine ausgeschlossenen
 *   Quellen in `quelle`/`namensnennung` (OpenITI, Shamela, Quranic Arabic Corpus und Ableger, QUL, NoorBayan, OpenSubtitles-
 *   Sätze, KELLY, SUBTLEX-DE, DeReWo, Ḥiṣn al-Muslim, Leipzig, TS Corpus, Zargan) und keine Stimmen ohne freie Kette.
 */

export const VERBOTENE_LIZENZ = /\b(?:NC|ND)\b|non-?commercial|no-?deriv|research[\s-]?only|nur (?:für )?(?:die )?Forschung|\bCPML\b/i;

export const AUSGESCHLOSSENE_QUELLEN: readonly { name: string; muster: RegExp }[] = [
  { name: 'OpenITI', muster: /open-?iti/i },
  { name: 'al-Maktaba al-Shamila', muster: /shamela|shamila/i },
  {
    name: 'Quranic Arabic Corpus',
    muster: /corpus\.quran\.com|quranic[\s-]arabic[\s-]corpus|quran-morphology|q-ran\/quran|quran-roots-dictionary|quran-bil-quran/i,
  },
  { name: 'QUL/NoorBayan', muster: /\bqul\b|tarteel|noorbayan/i },
  { name: 'OpenSubtitles-Sätze', muster: /opensubtitles/i },
  { name: 'KELLY', muster: /\bkelly[\s-]list/i },
  { name: 'SUBTLEX-DE', muster: /subtlex/i },
  { name: 'DeReWo', muster: /derewo/i },
  { name: 'Frequency Dictionary of Arabic', muster: /frequency dictionary of arabic/i },
  { name: 'Profile deutsch', muster: /profile deutsch/i },
  { name: 'Hisn al-Muslim', muster: /\bhisn\b|\bḥiṣn\b|hisnul/i },
  { name: 'Leipzig Corpora', muster: /leipzig corpora|wortschatz\.uni-leipzig/i },
  { name: 'TS Corpus', muster: /\bts[\s-]?corpus\b/i },
  { name: 'Zargan', muster: /zargan/i },
];

/** Stimmen ohne freie Kette (ADR 0045 Nr. 11; nur `de_DE-mls-medium` ist von den Piper-Stimmen zulässig). */
export const AUSGESCHLOSSENE_STIMMEN =
  /lessac|\bryan\b|mms-tts|xtts|\bartst\b|kikiri|thorsten-(?:low|medium|high)|thorsten_emotional|kerstin|karlsson|pavoque|dfki|fahrettin|fettah|kareem|eva_k|ramona/i;

const TATOEBA_LIZENZ: Record<string, string> = { 'CC BY 2.0 FR': 'CC-BY-2.0-FR', 'CC0 1.0': 'CC0-1.0' };
const RELIGIONS_TAG = /^(?:religion|religious|islam|muslim|christianity|christian|bible|god|prayer|church|mosque|ramadan|quran|koran)$/i;

type Eintrag = {
  datei: string;
  ort: string;
  quelle: string;
  lizenz: string;
  namensnennung?: string;
  text?: string;
  religionsbezug: boolean;
  sprache: 'de' | 'tr' | 'ar';
};

const TATOEBA_SPRACHE = { de: 'deu', tr: 'tur', ar: 'ara' } as const;

function eintraegeVon(inhalte: Inhalte): Eintrag[] {
  const ergebnis: Eintrag[] = [];
  for (const { pfad, daten: d } of inhalte.sprache)
    for (const x of [...d.lemmata.map((l) => ({ ...l, text: l.lemma })), ...d.saetze])
      ergebnis.push({
        datei: pfad,
        ort: x.schluessel,
        quelle: x.quelle,
        lizenz: x.lizenz,
        ...(x.namensnennung ? { namensnennung: x.namensnennung } : {}),
        text: x.text,
        religionsbezug: x.religionsbezug ?? false,
        sprache: d.kurs,
      });
  for (const { pfad, daten: d } of inhalte.uebersetzung) {
    const { ausgang } = zerlegeRichtung(d.richtung);
    for (const e of d.eintraege)
      ergebnis.push({
        datei: pfad,
        ort: `${e.bezug}@${d.richtung}`,
        quelle: e.quelle,
        lizenz: e.lizenz,
        ...(e.namensnennung ? { namensnennung: e.namensnennung } : {}),
        text: e.text,
        religionsbezug: e.religionsbezug ?? false,
        sprache: ausgang,
      });
  }
  return ergebnis;
}

const eigen = (q: string) => q.startsWith('ki:') || q === 'redaktion' || q.startsWith('test:');
const textGleich = (a: string, b: string) => a.normalize('NFC').trim() === b.normalize('NFC').trim();

function pruefeTatoeba(b: Befunde, e: Eintrag, id: number, satz: TatoebaSatz | undefined): void {
  if (TATOEBA_AUSSCHLUSS.has(id)) {
    b.blockierend(e.datei, `Tatoeba-Satz ${id} ausgeschlossen (Koran- bzw. Hadith-4-Gramm, web/daten/tatoeba/QUELLE.md)`, e.ort);
    return;
  }
  if (!satz) {
    b.blockierend(e.datei, `Tatoeba-Satz ${id} nicht im gepinnten Auszug (web/daten/tatoeba)`, e.ort);
    return;
  }
  if (satz.sprache !== TATOEBA_SPRACHE[e.sprache]) b.blockierend(e.datei, `Tatoeba-Satz ${id} hat die Sprache ${satz.sprache}`, e.ort);
  if (satz.bewNeg > 0) b.blockierend(e.datei, `Tatoeba-Satz ${id} mit negativer Bewertung (Standardfilter)`, e.ort);
  if (satz.tags.some((t) => t.startsWith('@'))) b.blockierend(e.datei, `Tatoeba-Satz ${id} mit Wartungs-Tag (Standardfilter)`, e.ort);
  if (satz.text.trim().split(/\s+/).length > 12)
    b.blockierend(e.datei, `Tatoeba-Satz ${id} mit mehr als 12 Wörtern (Standardfilter)`, e.ort);
  if (satz.tags.some((t) => RELIGIONS_TAG.test(t)) && !e.religionsbezug)
    b.blockierend(e.datei, `Tatoeba-Satz ${id} mit Religions-Tag ohne religionsbezug: true`, e.ort);
  const lizenz = TATOEBA_LIZENZ[satz.lizenz];
  if (!lizenz || lizenz !== e.lizenz) b.blockierend(e.datei, `Lizenz ${e.lizenz} statt ${lizenz ?? satz.lizenz} (Tatoeba-Auszug)`, e.ort);
  const nennung = e.namensnennung ?? '';
  const person = satz.benutzer ?? 'Tatoeba-Mitwirkende';
  if (!nennung.includes(`#${id}`) || !nennung.includes(person))
    b.blockierend(
      e.datei,
      `Namensnennung „Satz #${id} von <${satz.benutzer ? 'Benutzername laut Auszug' : 'Tatoeba-Mitwirkende'}>“ fehlt (ADR 0045 Fortschreibung S7 Nr. 7)`,
      e.ort,
    );
  if (e.text !== undefined && !textGleich(e.text, satz.text)) {
    const vokalisiert = e.sprache === 'ar' && arabischeWoerter(e.text).join(' ') === arabischeWoerter(satz.text).join(' ');
    const vermerk = vokalisiert ? /bearbeitet \(vokalisiert\)/ : /bearbeitet/;
    if (!vermerk.test(nennung))
      b.blockierend(
        e.datei,
        `Text weicht vom Tatoeba-Satz ${id} ab ohne Vermerk „bearbeitet${vokalisiert ? ' (vokalisiert)' : ''}“`,
        e.ort,
      );
  }
}

function pruefeWiktionary(b: Befunde, e: Eintrag, artikel: Map<string, KaikkiEintrag>): void {
  if (e.lizenz !== 'CC-BY-SA-4.0') b.blockierend(e.datei, `Wiktionary-Daten stehen unter CC BY-SA 4.0 (nicht ${e.lizenz})`, e.ort);
  if (!e.namensnennung)
    b.blockierend(e.datei, 'Namensnennung für Wiktionary-Daten fehlt (Artikel, Lizenz, „gekürzt und umformatiert“)', e.ort);
  const t = e.quelle.match(/^wiktionary:(en|de|tr):(.+)$/);
  if (t && !artikel.has(`${t[1]}|${t[2]!.normalize('NFC')}`))
    b.warnung(e.datei, `Wiktionary-Artikel nicht im gepinnten Kernauszug (Ausgabe ${t[1]}) – nur im vollen Auszug prüfbar`, e.ort);
}

export function pruefeLizenzen(inhalte: Inhalte, daten: string): { lizenz: Befunde; ausschluss: Befunde } {
  const lizenz = new Befunde('lizenz');
  const ausschluss = new Befunde('ausschluss');
  const eintraege = eintraegeVon(inhalte);
  const brauchtTatoeba = eintraege.some((e) => e.quelle.startsWith('tatoeba:'));
  const tatoeba = brauchtTatoeba ? ladeTatoeba(daten) : new Map<number, TatoebaSatz>();
  const artikel = new Map<string, KaikkiEintrag>();
  if (eintraege.some((e) => e.quelle.startsWith('wiktionary:')))
    for (const s of ['de', 'tr', 'ar'] as const) for (const k of ladeKaikki(s, daten)) artikel.set(`${k.q}|${k.w.normalize('NFC')}`, k);

  const quelleGeprueft = (datei: string, ort: string, ...felder: (string | undefined)[]) => {
    for (const f of felder)
      for (const q of AUSGESCHLOSSENE_QUELLEN)
        if (f && q.muster.test(f))
          ausschluss.blockierend(datei, `ausgeschlossene Quelle: ${q.name} (KERN 4.0 §1, ADR 0045 Nr. 10, 12, 13)`, ort);
  };

  for (const e of eintraege) {
    if (eigen(e.quelle) && e.lizenz !== 'CC-BY-SA-4.0')
      lizenz.blockierend(e.datei, `eigene Inhalte stehen unter CC BY-SA 4.0 (nicht ${e.lizenz}, L0-E02)`, e.ort);
    const id = tatoebaId(e.quelle);
    if (id !== null) pruefeTatoeba(lizenz, e, id, tatoeba.get(id));
    else quelleGeprueft(e.datei, e.ort, e.quelle, e.namensnennung);
    if (e.quelle.startsWith('wiktionary:') || e.quelle.startsWith('kaikki:')) pruefeWiktionary(lizenz, e, artikel);
  }
  for (const { pfad, daten: d } of inhalte.uebersetzung)
    for (const t of d.tipps) if (t.quelle) quelleGeprueft(pfad, t.schluessel, t.quelle);
  for (const [, { pfad, daten: r }] of inhalte.rahmen) quelleGeprueft(pfad, 'quelle', r.quelle);
  for (const { pfad, daten: d } of inhalte.aussprache)
    d.eintraege.forEach((e, i) => quelleGeprueft(pfad, `eintraege.${i}`, e.quelle, ...(e.stimmen ?? [])));
  for (const { pfad, daten: d } of inhalte.audio)
    d.stimmen.forEach((s, i) => {
      const ort = `stimmen.${i}`;
      for (const f of [s.modellLizenz, s.datenLizenz])
        if (f && VERBOTENE_LIZENZ.test(f)) ausschluss.blockierend(pfad, `Lizenz ${f} nicht zulässig (kein NC, ND, Research-only)`, ort);
      if ([s.id, s.bezeichnung, s.engine, s.namensnennung].some((f) => f && AUSGESCHLOSSENE_STIMMEN.test(f)))
        ausschluss.blockierend(pfad, 'Stimme ohne freie Kette (ADR 0045 Nr. 11)', ort);
      quelleGeprueft(pfad, ort, s.namensnennung);
    });
  if (inhalte.symbole)
    inhalte.symbole.daten.symbole.forEach((s, i) => {
      if (VERBOTENE_LIZENZ.test(s.lizenz))
        ausschluss.blockierend(inhalte.symbole!.pfad, `Lizenz ${s.lizenz} nicht zulässig`, `symbole.${i}`);
      quelleGeprueft(inhalte.symbole!.pfad, `symbole.${i}`, s.quelle, s.namensnennung);
    });
  for (const { pfad, daten: d } of inhalte.islam)
    for (const l of d.lektionen) for (const a of l.aussagen) quelleGeprueft(pfad, a.schluessel, a.quelle);
  return { lizenz, ausschluss };
}
