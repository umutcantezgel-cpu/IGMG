import type { Mehrsprachig, MehrsprachigRich } from '@/lib/db/schema/typen';
import type { BesondereArt, BesondererSchluessel, BesondererTagVorschlag } from './besondere-tage';

/**
 * Abgleich der berechneten Vorschläge (`besondereTage`) mit den Einträgen der Tabelle `besonderer_tag` (AUFTRAG 3.10,
 * MN-15, ADR 0030). Die Tabelle kennt nur die Art (z. B. „kandil“), nicht den Vorschlag – ein Eintrag deckt deshalb den
 * Vorschlag derselben Art, der ihm am nächsten liegt (höchstens {@link HOECHSTER_ABSTAND} Tage; der Imam korrigiert
 * berechnete Daten meist um einen Tag). Die Reihenfolge je Art bleibt erhalten, damit z. B. Arefe und Kurban Bayramı
 * (aufeinanderfolgende Tage, beide „bayram“) ihren eigenen Eintrag behalten. Reine Funktionen.
 */
export const HOECHSTER_ABSTAND = 3;

export type TagEintrag = {
  id: string;
  art: BesondereArt | 'sonstiges';
  datum: string;
  titel: Mehrsprachig;
  beschreibung: MehrsprachigRich | null;
};

/** Ein Eintrag des öffentlichen Kalenders: bestätigt (aus der Tabelle, geprüft) oder vorläufig (berechnet). */
export type KalenderTag = {
  /** stabil je Eintrag: „t-<uuid>“ (Tabelle) bzw. „v-<schlüssel>-<datum>“ (Vorschlag) – auch UID im iCal */
  id: string;
  art: BesondereArt | 'sonstiges';
  datum: string;
  /** Dauer in Kalendertagen (Bayram 3 bzw. 4 Tage) */
  tage: number;
  /** Vorschlagsschlüssel: Titel kommt dann aus den Sprachdateien (`kalender.tage.<schlüssel>`) */
  schluessel: BesondererSchluessel | null;
  /** Titel aus der Tabelle (bestätigte Einträge) */
  titel: Mehrsprachig | null;
  beschreibung: MehrsprachigRich | null;
  vorlaeufig: boolean;
};

function abstand(a: string, b: string): number {
  return Math.abs(Date.parse(`${a}T12:00:00Z`) - Date.parse(`${b}T12:00:00Z`)) / 86_400_000;
}

/**
 * Paare (Vorschlag ↔ Eintrag) derselben Art bis {@link HOECHSTER_ABSTAND} Tage, je Vorschlag und Eintrag höchstens
 * eines. Je Art bleibt die Reihenfolge erhalten (der frühere Eintrag gehört zum früheren Vorschlag – Arefe vor Bayram,
 * auch wenn beide verschoben sind); gewählt wird die Zuordnung mit den meisten Paaren, bei Gleichstand mit dem
 * kleinsten Gesamtabstand. Rückgabe: Index des Vorschlags → Eintrag.
 */
export function ordneZu<E extends Pick<TagEintrag, 'art' | 'datum'>>(
  vorschlaege: readonly BesondererTagVorschlag[],
  eintraege: readonly E[],
): Map<number, E> {
  const paare = new Map<number, E>();
  const arten = new Set(vorschlaege.map((v) => v.art));
  for (const art of arten) {
    const vs = vorschlaege
      .map((v, i) => ({ v, i }))
      .filter((x) => x.v.art === art)
      .sort((a, b) => a.v.datum.localeCompare(b.v.datum));
    const es = eintraege.filter((e) => e.art === art).sort((a, b) => a.datum.localeCompare(b.datum));
    // Ausrichtung zweier Folgen (dynamische Programmierung): Wert = [Paare, −Abstand], größer ist besser
    const n = vs.length;
    const m = es.length;
    const wert: [number, number][][] = Array.from({ length: n + 1 }, () => Array.from({ length: m + 1 }, () => [0, 0] as [number, number]));
    const besser = (a: [number, number], b: [number, number]) => a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);
    for (let i = 1; i <= n; i++)
      for (let j = 1; j <= m; j++) {
        let best = besser(wert[i - 1][j], wert[i][j - 1]) ? wert[i - 1][j] : wert[i][j - 1];
        const d = abstand(vs[i - 1].v.datum, es[j - 1].datum);
        if (d <= HOECHSTER_ABSTAND) {
          const mit: [number, number] = [wert[i - 1][j - 1][0] + 1, wert[i - 1][j - 1][1] - d];
          if (besser(mit, best)) best = mit;
        }
        wert[i][j] = best;
      }
    // Rückverfolgung
    for (let i = n, j = m; i > 0 && j > 0;) {
      const d = abstand(vs[i - 1].v.datum, es[j - 1].datum);
      const vorher = wert[i - 1][j - 1];
      if (d <= HOECHSTER_ABSTAND && wert[i][j][0] === vorher[0] + 1 && wert[i][j][1] === vorher[1] - d) {
        paare.set(vs[i - 1].i, es[j - 1]);
        i--;
        j--;
      } else if (wert[i][j][0] === wert[i - 1][j][0] && wert[i][j][1] === wert[i - 1][j][1]) i--;
      else j--;
    }
  }
  return paare;
}

/** Vorschläge, die noch keinen Eintrag in der Tabelle haben (Verwaltung: „Vorschläge übernehmen“, idempotent). */
export function fehlendeVorschlaege(
  vorschlaege: readonly BesondererTagVorschlag[],
  eintraege: readonly Pick<TagEintrag, 'art' | 'datum'>[],
): BesondererTagVorschlag[] {
  const paare = ordneZu(vorschlaege, eintraege);
  return vorschlaege.filter((_, i) => !paare.has(i));
}

/**
 * Öffentlicher Kalender: alle geprüften Einträge (bestätigt) und die Vorschläge, die kein geprüfter Eintrag deckt
 * (vorläufig). Ungeprüfte Einträge bleiben unsichtbar – an ihrer Stelle steht weiter der vorläufige Vorschlag.
 * Ein bestätigter Eintrag übernimmt die Dauer seines Vorschlags. Sortiert nach Datum.
 */
export function oeffentlicheTage(vorschlaege: readonly BesondererTagVorschlag[], geprueft: readonly TagEintrag[]): KalenderTag[] {
  const paare = ordneZu(vorschlaege, geprueft);
  const dauer = new Map<string, number>();
  const aus: KalenderTag[] = [];
  vorschlaege.forEach((v, i) => {
    const e = paare.get(i);
    if (e) {
      dauer.set(e.id, v.tage);
      return;
    }
    aus.push({
      id: `v-${v.schluessel}-${v.datum}`,
      art: v.art,
      datum: v.datum,
      tage: v.tage,
      schluessel: v.schluessel,
      titel: null,
      beschreibung: null,
      vorlaeufig: true,
    });
  });
  for (const e of geprueft)
    aus.push({
      id: `t-${e.id}`,
      art: e.art,
      datum: e.datum,
      tage: dauer.get(e.id) ?? 1,
      schluessel: null,
      titel: e.titel,
      beschreibung: e.beschreibung,
      vorlaeufig: false,
    });
  return aus.sort((a, b) => a.datum.localeCompare(b.datum) || a.id.localeCompare(b.id));
}

/** Liegt `datum` innerhalb des Eintrags (Beginn bis Beginn + Dauer − 1)? */
export function deckt(tag: Pick<KalenderTag, 'datum' | 'tage'>, datum: string): boolean {
  if (datum < tag.datum) return false;
  return abstand(tag.datum, datum) < tag.tage;
}
