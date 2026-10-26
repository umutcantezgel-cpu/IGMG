import type { Lektion } from '../aufgaben/schema';
import type { Oberflaeche, Sprache, Stufe } from '../kurse';
import type { Verzeichnis, VerzeichnisEinheit, WissensLektionVermerk } from '../paket/typen';

/**
 * Lernpfad aus dem Kursverzeichnis (PLAN §3.1, §3.10; ADR 0039): Abschnitte (Stufen) → Einheiten (Stationen) → Lektionen.
 * Rein, auch im Client nutzbar; geladen wird mit `lokal/pakete.ts` (Verzeichnis Netz zuerst, Pakete Vorrat zuerst).
 *
 * Schlüssel (paket/bauen.ts): Einheit `tr.a1.e01`, Lektion im Paket `tr-aus-de.a1.e01.l01` (Richtung statt Kurs vorn),
 * Wissen und Koran mit eigenem Kurs-Slug (`islam.grund.e01.l01`).
 */

/** Präfix der Lektionen einer Einheit im Paket: `tr.a1.e01` → `tr-aus-de.a1.e01.`. */
export function lektionsPraefix(v: Pick<Verzeichnis, 'kurs' | 'kursId'>, einheit: string): string {
  return `${v.kurs}${einheit.slice(v.kursId.length)}.`;
}

/** Einheit einer Lektion im Paket (`tr-aus-de.a1.e01.l01` → `tr.a1.e01`); `null`, wenn sie nicht zum Kurs gehört. */
export function einheitDerLektion(v: Pick<Verzeichnis, 'kurs' | 'kursId'>, lektion: string): string | null {
  if (!lektion.startsWith(`${v.kurs}.`)) return null;
  const rest = lektion.slice(v.kurs.length).split('.').slice(0, -1).join('.');
  return rest ? `${v.kursId}${rest}` : null;
}

/** Thema einer Einheit in der Oberflächensprache, sonst Ausgangssprache, sonst Deutsch oder Türkisch (mit Sprache für `lang`). */
export function themaVon(
  e: Pick<VerzeichnisEinheit, 'thema'>,
  ui: Oberflaeche,
  ausgang: Sprache | null,
): { text: string; sprache: Sprache } | null {
  for (const s of [ui, ausgang, 'de', 'tr', 'ar'] as const) {
    const text = s ? e.thema[s] : undefined;
    if (s && text) return { text, sprache: s };
  }
  return null;
}

/** Prüfvermerk einer Lektion des Wissenskurses (Datum der Freigabe, „für Kinder geeignet“, enthält ein strittiges Thema). */
export type LektionsVermerk = Pick<WissensLektionVermerk, 'geprueftAm' | 'kinderGeeignet'> & { strittig?: true };

/** Was der Lernpfad aus einem Paket liest (volles `Paket` oder nur sein Kopf aus `lokal/vorrat.ts`). */
export type PaketInhalt = {
  lektionen: readonly Pick<Lektion, 'schluessel' | 'titel' | 'art'>[];
  tipps: readonly unknown[];
  /** nur Wissenskurs: Prüfvermerk je Lektion (mit den Aussagen, soweit „strittig“ gebraucht wird) */
  wissen?: Readonly<Record<string, LektionsVermerk & { aussagen?: readonly { strittig?: boolean }[] }>>;
};

export type LektionsEintrag = Pick<Lektion, 'schluessel' | 'titel' | 'art'> & { erledigt: boolean; vermerk?: LektionsVermerk };

export type Station = {
  einheit: VerzeichnisEinheit;
  /** Nummer der Station im Kurs (ab 1) */
  nummer: number;
  /** geschaffte Lektionen der Einheit */
  erledigt: number;
  /** Lektionen aus dem Paket, falls es auf dem Gerät liegt */
  lektionen: LektionsEintrag[] | null;
  /** die erste Einheit mit offenen Lektionen („hier geht es weiter“) */
  aktuell: boolean;
  /** Grammatik-Tipps im Paket */
  tipps: boolean;
};

export type Abschnitt = { stufe: Stufe; stationen: Station[] };

/** Stationen nach Stufen; `erledigt` sind die geschafften Lektionen (Speicher `lektionen`), `pakete` die geladenen Pakete. */
export function abschnitte(v: Verzeichnis, erledigt: ReadonlySet<string>, pakete: ReadonlyMap<string, PaketInhalt>): Abschnitt[] {
  let aktuellGesetzt = false;
  const liste: Abschnitt[] = [];
  v.einheiten.forEach((einheit, i) => {
    const praefix = lektionsPraefix(v, einheit.schluessel);
    const paket = pakete.get(einheit.schluessel);
    const lektionen = paket
      ? paket.lektionen.map((l) => {
          // Prüfvermerk nur in gültiger Form (der Kopf aus dem Vorrat ist nicht voll geprüft); „strittig“, wenn eine Aussage
          // der Lektion zu einem strittigen Thema gehört (ADR 0040 Nr. 4)
          const roh = paket.wissen?.[l.schluessel];
          const gueltig = roh && /^\d{4}-\d{2}-\d{2}$/.test(String(roh.geprueftAm)) && typeof roh.kinderGeeignet === 'boolean';
          const strittig = gueltig && Array.isArray(roh.aussagen) && roh.aussagen.some((a) => a?.strittig === true);
          return {
            schluessel: l.schluessel,
            art: l.art,
            ...(l.titel ? { titel: l.titel } : {}),
            erledigt: erledigt.has(l.schluessel),
            ...(gueltig
              ? {
                  vermerk: {
                    geprueftAm: roh.geprueftAm,
                    kinderGeeignet: roh.kinderGeeignet,
                    ...(strittig ? { strittig: true as const } : {}),
                  },
                }
              : {}),
          };
        })
      : null;
    const geschafft = lektionen ? lektionen.filter((l) => l.erledigt).length : [...erledigt].filter((l) => l.startsWith(praefix)).length;
    const aktuell = !aktuellGesetzt && geschafft < einheit.lektionen;
    if (aktuell) aktuellGesetzt = true;
    const station: Station = { einheit, nummer: i + 1, erledigt: geschafft, lektionen, aktuell, tipps: Boolean(paket?.tipps.length) };
    const letzter = liste.at(-1);
    if (letzter?.stufe === einheit.stufe) letzter.stationen.push(station);
    else liste.push({ stufe: einheit.stufe, stationen: [station] });
  });
  return liste;
}

/** Die aktuelle und die nächste Einheit (werden automatisch gespeichert, ADR 0039 Nr. 12). */
export function aktuelleUndNaechste(v: Verzeichnis, erledigt: ReadonlySet<string>): VerzeichnisEinheit[] {
  const i = v.einheiten.findIndex((e) => [...erledigt].filter((l) => l.startsWith(lektionsPraefix(v, e.schluessel))).length < e.lektionen);
  const start = i < 0 ? Math.max(0, v.einheiten.length - 1) : i;
  return v.einheiten.slice(start, start + 2);
}

/** Die Lektion nach `lektion` in ihrer Einheit, sonst die erste der nächsten Einheit (falls deren Paket bekannt ist). */
export function naechsteLektion(
  paket: Pick<PaketInhalt, 'lektionen'>,
  lektion: string,
  naechstesPaket: Pick<PaketInhalt, 'lektionen'> | null,
): Pick<Lektion, 'schluessel' | 'titel'> | null {
  const i = paket.lektionen.findIndex((l) => l.schluessel === lektion);
  const nach = i >= 0 ? paket.lektionen[i + 1] : undefined;
  const ziel = nach ?? naechstesPaket?.lektionen[0];
  return ziel ? { schluessel: ziel.schluessel, ...(ziel.titel ? { titel: ziel.titel } : {}) } : null;
}

/** Einheit nach `einheit` im Verzeichnis. */
export function naechsteEinheit(v: Verzeichnis, einheit: string): VerzeichnisEinheit | null {
  const i = v.einheiten.findIndex((e) => e.schluessel === einheit);
  return i >= 0 ? (v.einheiten[i + 1] ?? null) : null;
}
