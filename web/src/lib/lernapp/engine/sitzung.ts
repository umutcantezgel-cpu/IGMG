import { angenommen, bereiteLexikon, type Lexikon, type Urteil } from '../abgleich';
import { bewerte } from '../aufgaben/bewerte';
import { type Antwort, type Aufgabe, type Auswertung, istImplementiert, type Lektion } from '../aufgaben/schema';
import type { EreignisEntwurf } from '../ereignisse/typen';
import { noteAus } from '../bewertung';
import { xpFuer } from './xp';

/**
 * Lektionssitzung als reiner Zustandsautomat (PLAN §4 „Ablauf der Lektion“, Vorbild `lib/elifbe/uebung.ts` und
 * `Uebungen.tsx`): frage → prüfen → Rückmeldung → weiter … → fertig.
 *
 * - Nicht angenommene Aufgaben kommen am Ende noch einmal, ohne Strafe; je Aufgabe höchstens `WEITERE_VERSUCHE`
 *   zusätzliche Versuche, damit niemand festhängt. Keine Zeitgrenze, keine Herzen.
 * - Jede Karte wird nur im ersten Versuch bewertet (richtig → gut, Tippfehler → schwer, falsch → nochmal); das Ereignis
 *   `bewertung` entsteht sofort, damit ein Abbruch nichts verliert.
 * - Am Ende: `lektion` (richtig im ersten Versuch / Zahl der Aufgaben) und `xp` (statisch, engine/xp.ts).
 * - Selbstbewertung (`sprechen`, `schreiben`, ADR 0042 Nr. 6): Die Note der Auswertung (`selbst`) geht unverändert an die
 *   Karten, das Ereignis trägt `selbst: true`.
 * - Ohne Wertung überspringen (`ueberspringe`, KERN 4.0 §8: „Ich kann gerade nicht sprechen/hören“, gelesener Tipp): keine
 *   Bewertung, die Aufgabe zählt nicht in die Quote und kommt nicht wieder.
 * - Die Funktionen geben neue Zustände und die zu speichernden Ereignis-Entwürfe zurück; Gerät, Nummer, Zeit und
 *   Lerntag ergänzt der Ausgang (lokal/ausgang.ts).
 */

export const WEITERE_VERSUCHE = 2;

export type Phase = 'frage' | 'rueckmeldung' | 'fertig';

export type Sitzung = {
  lektion: Lektion;
  /** spielbare Aufgaben (in L1: auswahl, wortbank, paare) in Inhaltsreihenfolge */
  aufgaben: Aufgabe[];
  /** Spielreihenfolge als Indizes in `aufgaben`; wächst um Wiederholungen */
  reihe: number[];
  pos: number;
  phase: Phase;
  versuche: number[];
  /** Urteil im ersten Versuch je Aufgabe */
  erstesUrteil: (Urteil | null)[];
  /** angenommen oder Versuche erschöpft */
  abgeschlossen: boolean[];
  /** ohne Wertung übersprungen (zählt nicht in die Quote) */
  uebersprungen?: boolean[];
  letzte: Auswertung | null;
  lexikon?: Lexikon;
};

export type Schritt = { sitzung: Sitzung; ereignisse: EreignisEntwurf[] };

/** Neue Sitzung; Aufgaben ohne Umsetzung (L2-Typen) werden übersprungen. */
export function starte(lektion: Lektion): Sitzung {
  const aufgaben = lektion.aufgaben.filter((a) => istImplementiert(a.typ));
  const n = aufgaben.length;
  return {
    lektion,
    aufgaben,
    reihe: Array.from({ length: n }, (_, i) => i),
    pos: 0,
    phase: n ? 'frage' : 'fertig',
    versuche: Array<number>(n).fill(0),
    erstesUrteil: Array<Urteil | null>(n).fill(null),
    abgeschlossen: Array<boolean>(n).fill(false),
    letzte: null,
    ...(lektion.lexikon?.length ? { lexikon: bereiteLexikon(lektion.lexikon, lektion.zielsprache) } : {}),
  };
}

/** Aktuelle Aufgabe mit Index; `wiederholung`, wenn sie schon einmal dran war. */
export function aktuell(s: Sitzung): { index: number; aufgabe: Aufgabe; wiederholung: boolean } | null {
  if (s.phase === 'fertig') return null;
  const index = s.reihe[s.pos];
  if (index === undefined) return null;
  const aufgabe = s.aufgaben[index];
  if (!aufgabe) return null;
  return { index, aufgabe, wiederholung: s.reihe.indexOf(index) < s.pos };
}

/** Antwort prüfen (nur in der Phase „frage“). */
export function pruefe(s: Sitzung, antwort: Antwort): Schritt {
  const a = aktuell(s);
  if (!a || s.phase !== 'frage') return { sitzung: s, ereignisse: [] };
  const auswertung = bewerte(a.aufgabe, antwort, { lexikon: s.lexikon });
  const versuche = [...s.versuche];
  versuche[a.index] = (versuche[a.index] ?? 0) + 1;
  const erster = versuche[a.index] === 1;
  const erstesUrteil = [...s.erstesUrteil];
  const ereignisse: EreignisEntwurf[] = [];
  if (erster) {
    erstesUrteil[a.index] = auswertung.urteil;
    for (const k of auswertung.karten)
      ereignisse.push({
        art: 'bewertung',
        daten: {
          karte: k.karte,
          note: auswertung.selbst ?? noteAus(k.urteil),
          kurs: s.lektion.kurs,
          aufgabe: a.aufgabe.schluessel,
          ...(auswertung.selbst ? { selbst: true as const } : {}),
        },
      });
  }
  const abgeschlossen = [...s.abgeschlossen];
  const reihe = [...s.reihe];
  if (angenommen(auswertung) || (versuche[a.index] ?? 0) > WEITERE_VERSUCHE) abgeschlossen[a.index] = true;
  else reihe.push(a.index);
  return { sitzung: { ...s, versuche, erstesUrteil, abgeschlossen, reihe, phase: 'rueckmeldung', letzte: auswertung }, ereignisse };
}

/** Zahl der Aufgaben, die im ersten Versuch angenommen wurden. */
export const richtigImErstenVersuch = (s: Sitzung): number => s.erstesUrteil.filter((u) => u === 'richtig' || u === 'tippfehler').length;

/** Gewertete Aufgaben: alle außer denen, die ohne Versuch übersprungen wurden. */
export const gewertet = (s: Sitzung): number => s.aufgaben.filter((_, i) => !(s.uebersprungen?.[i] && s.erstesUrteil[i] == null)).length;

/** Verschiedene Karten der Sitzung (für die XP der Wiederholung). */
const kartenDerSitzung = (s: Sitzung): number =>
  new Set(
    s.aufgaben.flatMap((a) => [
      ...(a.karten ?? []),
      ...(a.typ === 'paare' ? a.paare.flatMap((p) => (p.karte ? [p.karte] : [])) : []),
      ...(a.typ === 'geschichte' ? a.fragen.flatMap((f) => (f.karte ? [f.karte] : [])) : []),
    ]),
  ).size;

/** XP dieser Lektion (statisch). */
export const xpDerSitzung = (s: Sitzung): number => (s.aufgaben.length ? xpFuer(s.lektion.art, kartenDerSitzung(s)) : 0);

/** Weiter nach der Rückmeldung; am Ende entstehen `lektion` und `xp`. */
export function weiter(s: Sitzung): Schritt {
  if (s.phase !== 'rueckmeldung') return { sitzung: s, ereignisse: [] };
  const pos = s.pos + 1;
  if (pos < s.reihe.length) return { sitzung: { ...s, pos, phase: 'frage', letzte: null }, ereignisse: [] };
  const fertig: Sitzung = { ...s, pos, phase: 'fertig', letzte: null };
  // das Ereignis verlangt gesamt ≥ 1: wurde alles übersprungen, gilt die Lektion als ohne Fehler durchlaufen
  const gesamt = gewertet(s);
  const ereignisse: EreignisEntwurf[] = [
    {
      art: 'lektion',
      daten: {
        kurs: s.lektion.kurs,
        lektion: s.lektion.schluessel,
        art: s.lektion.art,
        richtig: gesamt ? richtigImErstenVersuch(s) : 1,
        gesamt: Math.max(1, gesamt),
      },
    },
  ];
  const xp = xpDerSitzung(s);
  if (xp > 0) ereignisse.push({ art: 'xp', daten: { menge: xp, grund: s.lektion.art, bezug: s.lektion.schluessel } });
  return { sitzung: fertig, ereignisse };
}

/**
 * Aktuelle Aufgabe ohne Wertung überspringen (KERN 4.0 §8: „Ich kann gerade nicht sprechen/hören“, „Sprechübungen aus“,
 * gelesener Grammatik-Tipp): keine Bewertung, keine Wiederholung; danach direkt die nächste Aufgabe (bzw. das Ende mit
 * `lektion` und `xp`).
 */
export function ueberspringe(s: Sitzung): Schritt {
  const a = aktuell(s);
  if (!a || s.phase !== 'frage') return { sitzung: s, ereignisse: [] };
  const abgeschlossen = [...s.abgeschlossen];
  abgeschlossen[a.index] = true;
  const uebersprungen = s.aufgaben.map((_, i) => Boolean(s.uebersprungen?.[i]) || i === a.index);
  // eine schon gewertete Aufgabe (Wiederholung am Ende) bleibt gewertet; nur die offene Wiederholung entfällt
  return weiter({ ...s, abgeschlossen, uebersprungen, phase: 'rueckmeldung', letzte: null });
}

/** Anteil abgeschlossener Aufgaben (0…1) für die Lektionsleiste (B-28). */
export function fortschritt(s: Sitzung): number {
  if (!s.aufgaben.length) return 1;
  return s.abgeschlossen.filter(Boolean).length / s.aufgaben.length;
}

export type Zusammenfassung = { richtig: number; gesamt: number; xp: number };

export const zusammenfassung = (s: Sitzung): Zusammenfassung => ({
  richtig: richtigImErstenVersuch(s),
  gesamt: gewertet(s),
  xp: xpDerSitzung(s),
});
