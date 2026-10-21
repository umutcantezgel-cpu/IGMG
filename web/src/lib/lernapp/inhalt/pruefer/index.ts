import { join } from 'node:path';
import type { ImportQuelle } from '../import';
import { ladeWaechter, pruefeReligion, type Waechter } from '../religion';
import type { InhaltDatei } from '../schema';
import { hatTrenner, lexikonTreffer, vierGrammStrom, vierGrammTreffer, woerter } from '../../waechter/kern.mjs';
import { type AbdeckungZeile, pruefeAbdeckung } from './abdeckung';
import { pruefeAbgleich } from './abgleich';
import { pruefeAudio } from './audio';
import { pruefeAusschluesse } from './ausschluss';
import { type Inhalte, leseInhalte } from './dateien';
import { pruefeAuszuege, pruefeKaikkiOhneBeispiele, standardDaten } from './daten';
import { pruefeDubletten } from './dubletten';
import { pruefeKinder } from './kinder';
import { pruefeLizenzen } from './lizenz';
import { pruefeReligionsbezug } from './religionsbezug';
import { vergleichsform } from './sprache';
import { pruefeSymbole } from './symbole';
import { baueTabuLexikon, pruefeTabu } from './tabu';
import { sammleTexte } from './texte';
import { type Befund, Befunde, PRUEFER } from './typen';
import { pruefeVokalisierung } from './vokalisierung';
import { pruefeWortschatz } from './wortschatz';

export { befundZeile, ohneArabisch } from './typen';
export type { Befund, PrueferName, Schwere } from './typen';
export type { AbdeckungZeile } from './abdeckung';

/**
 * `pnpm lernapp:pruefen` (PLAN §6.4, Tor L3 „0 Fehler“): alle automatischen Prüfer über die Inhaltsdateien unter
 * `web/inhalte/lernapp/`. Reihenfolge: Auszugs-Prüfsummen (Abbruch bei Abweichung, ADR 0045 Fortschreibung S7 Nr. 1) →
 * Schema → Religionswächter → übrige Prüfer. Ergebnis ohne arabische Schrift und ohne Wörter des Tabu-Lexikons.
 */

export type PruefOptionen = {
  /** `web/daten` (Standard: `<cwd>/daten`) */
  daten?: string;
  /** `web/` für die Ausschlussprüfung über das Repository (Standard: `<cwd>`); `null` überspringt sie */
  web?: string | null;
  /** Vorsilbe der Quellpfade (Testkurs: `testkurs/`) */
  praefix?: string;
  pfadePruefen?: boolean;
  /** Prüfsummen der Auszüge vor dem Lauf (Standard: ja) */
  auszuegePruefen?: boolean;
  /** Ab hier zusätzliche Dateien (Rahmenplan, Leitfaden), z. B. beim Testkurs aus `web/inhalte/lernapp/rahmen` */
  zusatz?: readonly ImportQuelle[];
  waechter?: Waechter;
};

export type PruefBericht = {
  dateien: number;
  eintraege: number;
  befunde: Befund[];
  abdeckung: AbdeckungZeile[];
  /** Abbruch vor den Inhaltsprüfungen (Auszüge verändert) */
  abgebrochen: boolean;
  dauerMs: number;
};

export const blockierende = (b: PruefBericht) => b.befunde.filter((x) => x.schwere === 'blockierend');
export const menschlich = (b: PruefBericht) => b.befunde.filter((x) => x.schwere === 'mensch');
export const warnungen = (b: PruefBericht) => b.befunde.filter((x) => x.schwere === 'warnung');

/** Namen aus dem Leitfaden (de/tr in Vergleichsform) – zählen nicht als Wortschatz. */
function namenAus(inhalte: Inhalte): Set<string> {
  const l = inhalte.leitfaden?.daten;
  const namen = new Set<string>();
  if (!l) return namen;
  for (const s of ['de', 'tr'] as const) {
    const v = l.namen.vornamen[s];
    for (const n of [...v.weiblich, ...v.maennlich, ...l.namen.familiennamen[s]])
      for (const teil of n.split(/[\s-]+/)) namen.add(vergleichsform(teil, s));
  }
  return namen;
}

/** Religionswächter (KERN 4.0 §3): Sprache und Übersetzung mit Kennzeichen; Aussprache ohne Formeln und 4-Gramme. */
function pruefeReligionAlle(inhalte: Inhalte, w: Waechter): Befunde {
  const b = new Befunde('religion');
  const dateien: { pfad: string; datei: InhaltDatei }[] = [
    ...inhalte.sprache.map((x) => ({ pfad: x.pfad, datei: { art: 'sprache' as const, daten: x.daten } })),
    ...inhalte.uebersetzung.map((x) => ({ pfad: x.pfad, datei: { art: 'uebersetzung' as const, daten: x.daten } })),
  ];
  for (const zeile of pruefeReligion(dateien, w)) {
    const [datei, ort, ...rest] = zeile.split(': ');
    b.blockierend(datei!, rest.join(': '), ort);
  }
  for (const { pfad, daten: d } of inhalte.aussprache) {
    const strom: [string, string][] = [];
    d.eintraege.forEach((e, i) => {
      const ort = `eintraege.${i}`;
      for (const text of [e.text, ...(e.ersatz ? [e.ersatz] : [])]) {
        const t = lexikonTreffer(text, w.lexikon) as { name: string } | null;
        if (t) b.blockierend(pfad, `Formel-Lexikon (${t.name}): keine Sprachausgabe für Religionsbezug`, ort);
        for (const wort of woerter(text)) strom.push([wort, ort]);
        if (hatTrenner(text) && vierGrammTreffer(text, w.index)) b.blockierend(pfad, 'Koran- bzw. Hadith-4-Gramm', ort);
      }
    });
    const gemeldet = new Set<string>();
    for (const t of vierGrammStrom(strom, w.index) as { korpus: 'koran' | 'hadith'; stelle: string; ort: string }[])
      if (!gemeldet.has(t.ort)) {
        gemeldet.add(t.ort);
        b.blockierend(pfad, `${t.korpus === 'koran' ? 'Koran' : 'Hadith'}-4-Gramm (${t.stelle})`, t.ort);
      }
  }
  return b;
}

export function pruefeInhalte(quellen: readonly ImportQuelle[], optionen: PruefOptionen = {}): PruefBericht {
  const beginn = Date.now();
  const daten = optionen.daten ?? standardDaten();
  const web = optionen.web === undefined ? process.cwd() : optionen.web;
  const befunde: Befund[] = [];
  const bericht = (abgebrochen: boolean, eintraege = 0, abdeckung: AbdeckungZeile[] = []): PruefBericht => ({
    dateien: quellen.length + (optionen.zusatz?.length ?? 0),
    eintraege,
    befunde: befunde.sort((a, b) => PRUEFER.indexOf(a.pruefer) - PRUEFER.indexOf(b.pruefer)),
    abdeckung,
    abgebrochen,
    dauerMs: Date.now() - beginn,
  });

  // 1. Gepinnte Auszüge unverändert? Sonst Abbruch (ADR 0025 Nr. 2).
  if (optionen.auszuegePruefen !== false) {
    const auszug = pruefeAuszuege(daten);
    befunde.push(...auszug.liste);
    if (auszug.liste.length) return bericht(true);
    befunde.push(...pruefeKaikkiOhneBeispiele(daten).liste);
  }

  // 2. Schema, Ablageort, eindeutige Schlüssel
  const { inhalte, befunde: schema } = leseInhalte([...quellen, ...(optionen.zusatz ?? [])], {
    praefix: optionen.praefix ?? '',
    pfadePruefen: optionen.pfadePruefen ?? true,
  });
  befunde.push(...schema.liste);
  const texte = sammleTexte(inhalte);

  // 3. Religionswächter, Lizenz und Ausschlüsse
  befunde.push(...pruefeReligionAlle(inhalte, optionen.waechter ?? ladeWaechter(daten)).liste);
  const { lizenz, ausschluss } = pruefeLizenzen(inhalte, daten);
  befunde.push(...lizenz.liste, ...ausschluss.liste);
  if (web) befunde.push(...pruefeAusschluesse(web).liste);
  // Audio-Manifeste: nie vertont (Religionsbezug, Wissen, Koran-Pfad), nur die freigegebene Stimme je Sprache
  befunde.push(...pruefeAudio(inhalte).liste);

  // 4. Sprache: Dubletten, Wortschatz, Satzlänge, Budget, Vokalisierung, Abdeckung, Kinder, Bildkarten
  befunde.push(...pruefeDubletten(inhalte).liste, ...pruefeAbgleich(inhalte).liste);
  const w = pruefeWortschatz(inhalte, { daten, namen: namenAus(inhalte) });
  befunde.push(...w.wortschatz.liste, ...w.satzlaenge.liste, ...w.lemmabudget.liste);
  befunde.push(...pruefeVokalisierung(inhalte).liste);
  const abdeckung = pruefeAbdeckung(inhalte);
  befunde.push(...abdeckung.befunde.liste);
  befunde.push(...pruefeKinder(inhalte).liste);
  befunde.push(...pruefeSymbole(inhalte).liste);

  // 5. Inhaltsleitfaden: Tabu-Lexikon und Religionsbezug-Kandidaten (an Menschen)
  if (inhalte.leitfaden) befunde.push(...pruefeTabu(texte, baueTabuLexikon(inhalte.leitfaden.daten, daten)).liste);
  befunde.push(...pruefeReligionsbezug(inhalte, texte, daten).liste);

  const eintraege =
    inhalte.sprache.reduce((s, x) => s + x.daten.lemmata.length + x.daten.saetze.length, 0) +
    inhalte.uebersetzung.reduce((s, x) => s + x.daten.eintraege.length, 0) +
    inhalte.islam.reduce((s, x) => s + x.daten.lektionen.reduce((t, l) => t + l.aussagen.length + l.aufgaben.length, 0), 0);
  return bericht(false, eintraege, abdeckung.zeilen);
}

/** Pfad der Inhalte relativ zum Arbeitsverzeichnis `web/`. */
export const inhaltWurzel = (web = process.cwd()) => join(web, 'inhalte', 'lernapp');
