import { angenommen, bereiteLexikon, type Lexikon, type Urteil } from '../abgleich';
import { type Auswertung, type Bewerter, istImplementiert } from '../aufgaben/hilfen';
import type { Antwort, Aufgabe, AufgabenTyp, Lektion } from '../aufgaben/schema';
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
 * - Übersprungen wird ohne Bewertung und ohne Wiederholung (`ueberspringe`): Hörübung ohne Audio („Audio folgt“), „Ich kann
 *   gerade nicht hören“ (dann alle übrigen Hörübungen der Lektion) – keine Sackgasse (KERN 4.0 §4, §8). Mit „Hörübungen
 *   aus“ fallen Hörübungen schon beim Start weg (`starte(…, { ohne })`). Übersprungene Aufgaben zählen nicht mit.
 * - Am Ende: `lektion` (richtig im ersten Versuch / Zahl der gespielten Aufgaben) und `xp` (statisch, engine/xp.ts); ohne
 *   gespielte Aufgabe keine Ereignisse.
 * - Die Funktionen geben neue Zustände und die zu speichernden Ereignis-Entwürfe zurück; Gerät, Nummer, Zeit und
 *   Lerntag ergänzt der Ausgang (lokal/ausgang.ts).
 * - Die Bewertung kommt vom Aufrufer (`pruefe(s, antwort, bewerte)`): der Spieler nimmt die des geladenen Übungs-Chunks,
 *   damit keine Bewertung eines Typs in der Route liegt (KERN 4.0 §9); Tests nehmen `aufgaben/bewerte.ts`.
 */

export const WEITERE_VERSUCHE = 2;

export type Phase = 'frage' | 'rueckmeldung' | 'fertig';

export type Sitzung = {
  lektion: Lektion;
  /** spielbare Aufgaben (implementierte Typen, ohne abgewählte) in Inhaltsreihenfolge */
  aufgaben: Aufgabe[];
  /** Spielreihenfolge als Indizes in `aufgaben`; wächst um Wiederholungen */
  reihe: number[];
  pos: number;
  phase: Phase;
  versuche: number[];
  /** Urteil im ersten Versuch je Aufgabe */
  erstesUrteil: (Urteil | null)[];
  /** angenommen, Versuche erschöpft oder übersprungen */
  abgeschlossen: boolean[];
  /** ohne Bewertung übersprungen (zählt nicht zur Lektion) */
  uebersprungen: boolean[];
  letzte: Auswertung | null;
  lexikon?: Lexikon;
};

export type Schritt = { sitzung: Sitzung; ereignisse: EreignisEntwurf[] };

/** Neue Sitzung; Aufgaben ohne Umsetzung und Typen aus `ohne` (z. B. Hörübungen aus) fallen weg. */
export function starte(lektion: Lektion, { ohne = [] }: { ohne?: readonly AufgabenTyp[] } = {}): Sitzung {
  const aufgaben = lektion.aufgaben.filter((a) => istImplementiert(a.typ) && !ohne.includes(a.typ));
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
    uebersprungen: Array<boolean>(n).fill(false),
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

/** Antwort mit der Bewertung des Übungstyps prüfen (nur in der Phase „frage“). */
export function pruefe(s: Sitzung, antwort: Antwort, bewerte: Bewerter): Schritt {
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
        daten: { karte: k.karte, note: noteAus(k.urteil), kurs: s.lektion.kurs, aufgabe: a.aufgabe.schluessel },
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

/** Gespielte (nicht übersprungene) Aufgaben. */
const gespielte = (s: Sitzung): Aufgabe[] => s.aufgaben.filter((_, i) => !s.uebersprungen[i]);

/** Verschiedene Karten der gespielten Aufgaben (für die XP der Wiederholung). */
const kartenDerSitzung = (s: Sitzung): number =>
  new Set(
    gespielte(s).flatMap((a) => [...(a.karten ?? []), ...(a.typ === 'paare' ? a.paare.flatMap((p) => (p.karte ? [p.karte] : [])) : [])]),
  ).size;

/** XP dieser Lektion (statisch). */
export const xpDerSitzung = (s: Sitzung): number => (gespielte(s).length ? xpFuer(s.lektion.art, kartenDerSitzung(s)) : 0);

/** Nächste Aufgabe an `pos` oder Ende der Lektion mit `lektion` und `xp` (nur mit gespielten Aufgaben). */
function weiterAb(s: Sitzung, pos: number): Schritt {
  if (pos < s.reihe.length) return { sitzung: { ...s, pos, phase: 'frage', letzte: null }, ereignisse: [] };
  const fertig: Sitzung = { ...s, pos, phase: 'fertig', letzte: null };
  const gesamt = gespielte(s).length;
  if (!gesamt) return { sitzung: fertig, ereignisse: [] };
  const ereignisse: EreignisEntwurf[] = [
    {
      art: 'lektion',
      daten: { kurs: s.lektion.kurs, lektion: s.lektion.schluessel, art: s.lektion.art, richtig: richtigImErstenVersuch(s), gesamt },
    },
  ];
  const xp = xpDerSitzung(s);
  if (xp > 0) ereignisse.push({ art: 'xp', daten: { menge: xp, grund: s.lektion.art, bezug: s.lektion.schluessel } });
  return { sitzung: fertig, ereignisse };
}

/** Weiter nach der Rückmeldung; am Ende entstehen `lektion` und `xp`. */
export function weiter(s: Sitzung): Schritt {
  if (s.phase !== 'rueckmeldung') return { sitzung: s, ereignisse: [] };
  return weiterAb(s, s.pos + 1);
}

/**
 * Aktuelle Aufgabe überspringen (nur in der Phase „frage“ und nur vor dem ersten Versuch): ohne Bewertung, ohne
 * Wiederholung. Mit `typen` fallen auch alle späteren, noch offenen Aufgaben dieser Typen weg (z. B. „Ich kann gerade
 * nicht hören“). Am Ende wie `weiter`.
 */
export function ueberspringe(s: Sitzung, { typen = [] }: { typen?: readonly AufgabenTyp[] } = {}): Schritt {
  const a = aktuell(s);
  if (!a || s.phase !== 'frage' || (s.versuche[a.index] ?? 0) > 0) return { sitzung: s, ereignisse: [] };
  const weg = new Set([a.index]);
  for (const i of s.reihe.slice(s.pos + 1)) {
    const x = s.aufgaben[i];
    if (x && typen.includes(x.typ) && !s.abgeschlossen[i] && !(s.versuche[i] ?? 0)) weg.add(i);
  }
  const abgeschlossen = s.abgeschlossen.map((v, i) => v || weg.has(i));
  const uebersprungen = s.uebersprungen.map((v, i) => v || weg.has(i));
  const reihe = [...s.reihe.slice(0, s.pos + 1), ...s.reihe.slice(s.pos + 1).filter((i) => !weg.has(i))];
  return weiterAb({ ...s, abgeschlossen, uebersprungen, reihe }, s.pos + 1);
}

/** Anteil abgeschlossener Aufgaben (0…1) für die Lektionsleiste (B-28). */
export function fortschritt(s: Sitzung): number {
  if (!s.aufgaben.length) return 1;
  return s.abgeschlossen.filter(Boolean).length / s.aufgaben.length;
}

export type Zusammenfassung = { richtig: number; gesamt: number; xp: number };

export const zusammenfassung = (s: Sitzung): Zusammenfassung => ({
  richtig: richtigImErstenVersuch(s),
  gesamt: gespielte(s).length,
  xp: xpDerSitzung(s),
});
