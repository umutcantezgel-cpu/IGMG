import type { Ereignis } from './typen';

/**
 * Serie „Lerntage in Folge“ (ADR 0043 Nr. 3), Lerntag und Uhrzeit-Klemme (ADR 0038 Nr. 6) – reine Funktionen.
 *
 * - Gerechnet wird nur mit dem Lerntag `JJJJ-MM-TT` in Ortszeit des Geräts, nie mit Uhrzeiten: Tages- und
 *   Sommerzeitgrenzen spielen so keine Rolle (Kalenderrechnung in UTC auf reinen Daten).
 * - Je Kalenderwoche (Montag bis Sonntag) gelten bis zu `pausetage` Tage ohne Lernen automatisch als Pause (Standard 2,
 *   einstellbar 0–3). Dazu kommen bis zu 30 Ruhetage je Kalenderjahr aus `pause`-Ereignissen.
 * - Heute ohne Lernen beendet nichts („heute“ ist noch offen). Die Serie zählt nur Lerntage, Pausen tragen sie weiter.
 * - Die Serie endet still; es gibt nie „Serie verloren“ (Wortlaut-Test der Texte, ADR 0043 Nr. 10).
 */

const TAG_MS = 86_400_000;

const alsDatum = (tag: string): number => {
  const [j, m, t] = tag.split('-').map(Number) as [number, number, number];
  return Date.UTC(j, m - 1, t);
};
const alsTag = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/** Tag plus `n` Kalendertage. */
export const addiereTage = (tag: string, n: number): string => alsTag(alsDatum(tag) + n * TAG_MS);

/** Wochentag 0 = Montag … 6 = Sonntag. */
export const wochentag = (tag: string): number => (new Date(alsDatum(tag)).getUTCDay() + 6) % 7;

/** Montag der Kalenderwoche des Tages. */
export const wochenbeginn = (tag: string): string => addiereTage(tag, -wochentag(tag));

/** Abstand in Tagen (b − a). */
export const tageZwischen = (a: string, b: string): number => Math.round((alsDatum(b) - alsDatum(a)) / TAG_MS);

/**
 * Lerntag eines Zeitpunkts in einer Zeitzone (Standard: Zeitzone des Geräts). `Intl` kennt die Sommerzeit; ein Zeitpunkt
 * kurz nach Mitternacht Ortszeit gehört zum neuen Tag.
 */
export function lerntagVon(datum: Date, zeitzone?: string): string {
  const teile = new Intl.DateTimeFormat('en-CA', { timeZone: zeitzone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(
    datum,
  );
  const wert = (typ: string) => teile.find((t) => t.type === typ)?.value ?? '';
  return `${wert('year')}-${wert('month')}-${wert('day')}`;
}

/** Ruhetage aus Pausen-Zeiträumen: je Kalenderjahr höchstens `jeJahr` Tage, die frühesten zählen. */
export function ruhetageAus(pausen: readonly { von: string; bis: string }[], jeJahr = 30): Set<string> {
  const alle = new Set<string>();
  for (const p of pausen) for (let t = p.von; t <= p.bis; t = addiereTage(t, 1)) alle.add(t);
  const jeJahrGezaehlt = new Map<string, number>();
  const ergebnis = new Set<string>();
  for (const t of [...alle].sort()) {
    const jahr = t.slice(0, 4);
    const n = jeJahrGezaehlt.get(jahr) ?? 0;
    if (n >= jeJahr) continue;
    jeJahrGezaehlt.set(jahr, n + 1);
    ergebnis.add(t);
  }
  return ergebnis;
}

export type WochenTag = { tag: string; art: 'gelernt' | 'ruhe' | 'pause' | 'heute' | 'zukunft' };

export type SerienStand = {
  /** Lerntage in Folge (Pausen- und Ruhetage tragen die Serie, zählen aber nicht mit). */
  laenge: number;
  heuteGelernt: boolean;
  /** Montag bis Sonntag der laufenden Woche (Wochenband, B-33). */
  woche: WochenTag[];
  /** In der laufenden Woche schon als Pause gezählte Tage. */
  pausenDieseWoche: number;
};

export type SerienOptionen = { pausetage?: number };

export function berechneSerie(
  lerntage: ReadonlySet<string>,
  ruhetage: ReadonlySet<string>,
  heute: string,
  { pausetage = 2 }: SerienOptionen = {},
): SerienStand {
  const erlaubt = Math.max(0, Math.min(3, Math.floor(pausetage)));
  const vergangen = [...lerntage].filter((t) => t <= heute).sort();
  const fruehester = vergangen[0];
  const heuteGelernt = lerntage.has(heute);
  const genutzt = new Map<string, number>();
  let laenge = heuteGelernt ? 1 : 0;
  if (fruehester !== undefined) {
    for (let d = addiereTage(heute, -1); d >= fruehester; d = addiereTage(d, -1)) {
      if (lerntage.has(d)) laenge++;
      else if (!ruhetage.has(d)) {
        const w = wochenbeginn(d);
        const n = genutzt.get(w) ?? 0;
        if (n >= erlaubt) break;
        genutzt.set(w, n + 1);
      }
    }
  }
  const montag = wochenbeginn(heute);
  const woche: WochenTag[] = Array.from({ length: 7 }, (_, i) => {
    const tag = addiereTage(montag, i);
    const art: WochenTag['art'] =
      lerntage.has(tag) && tag <= heute
        ? 'gelernt'
        : tag > heute
          ? 'zukunft'
          : ruhetage.has(tag)
            ? 'ruhe'
            : tag === heute
              ? 'heute'
              : 'pause';
    return { tag, art };
  });
  const pausenDieseWoche = woche.filter((t) => t.art === 'pause').length;
  return { laenge, heuteGelernt, woche, pausenDieseWoche };
}

/** Spielraum der Uhrzeit-Klemme (ADR 0038 Nr. 6). */
export const KLEMME_MS = 5 * 60_000;

/** `am` auf höchstens Empfang + 5 min klemmen (Server); unveränderte Zeit, wenn sie davor liegt. */
export function klemmeZeit(am: string, empfang: Date, spielraum = KLEMME_MS): string {
  const grenze = empfang.getTime() + spielraum;
  return Date.parse(am) > grenze ? new Date(grenze).toISOString() : am;
}

/**
 * Ereignis klemmen: `am` nach `klemmeZeit`; der Lerntag darf nicht hinter dem spätesten Kalendertag liegen, der beim
 * Empfang irgendwo auf der Erde gilt (UTC + 14 h). So verschiebt eine vorgestellte Geräteuhr weder Serie noch Tagesziel.
 */
export function klemmeEreignis<E extends Pick<Ereignis, 'am' | 'tag'>>(e: E, empfang: Date, spielraum = KLEMME_MS): E {
  const am = klemmeZeit(e.am, empfang, spielraum);
  const spaetesterTag = alsTag(empfang.getTime() + 14 * 3_600_000);
  const tag = e.tag > spaetesterTag ? spaetesterTag : e.tag;
  return am === e.am && tag === e.tag ? e : { ...e, am, tag };
}
