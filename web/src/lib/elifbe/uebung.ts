/**
 * Übungslogik für `/elifbe/ueben` (rein, ohne Abhängigkeiten – läuft in der Lazy-Insel und in Unit-Tests).
 * Die Insel bekommt alle Zeichen fertig vom Server (Codepunkte, Formen, Silben); hier wird nur ausgewählt, gemischt und
 * bewertet. Fortschritt bleibt im Browser (localStorage), ohne Punkte- oder Serienvergleich.
 */

export type UebungsArt = 'erkennen' | 'zuordnen' | 'lesen' | 'nachspuren';
export const UEBUNGS_ARTEN: readonly UebungsArt[] = ['erkennen', 'zuordnen', 'lesen', 'nachspuren'];
export type FormArt = 'anfang' | 'mitte' | 'ende';

export type UebungsBuchstabe = {
  slug: string;
  /** Elifbâ-Name (Antwort beim Erkennen). */
  name: string;
  zeichen: string;
  formen: Record<FormArt, string>;
  /** Hat verbundene Formen, die sich von der Einzelform unterscheiden (alle außer Hamza). */
  verbindet: boolean;
  verbindetLinks: boolean;
  aehnlich: readonly string[];
};

export type UebungsSilbe = { text: string; umschrift: string; buchstabe: string };

export type Option = { wert: string; text: string };

export type Aufgabe =
  | { art: 'erkennen'; ziel: string; zeige: string; optionen: Option[] }
  | { art: 'zuordnen'; ziel: string; form: FormArt; zeige: string; optionen: Option[] }
  | { art: 'lesen'; ziel: string; buchstabe: string; zeige: string; optionen: Option[] }
  | { art: 'nachspuren'; ziel: string };

export type Zufall = () => number;

export function mische<T>(liste: readonly T[], z: Zufall): T[] {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(z() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

const waehle = <T>(liste: readonly T[], z: Zufall): T => liste[Math.floor(z() * liste.length)] as T;

/** Vier Antworten mit eindeutigem Text: das Ziel, bevorzugte Ablenker (z. B. ähnliche Buchstaben), dann zufällige. */
export function optionen(ziel: Option, bevorzugt: readonly Option[], rest: readonly Option[], z: Zufall, anzahl = 4): Option[] {
  const gewaehlt: Option[] = [ziel];
  const texte = new Set([ziel.text]);
  for (const o of [...mische(bevorzugt, z).slice(0, 1), ...mische(rest, z)]) {
    if (gewaehlt.length >= anzahl) break;
    if (texte.has(o.text) || o.wert === ziel.wert) continue;
    texte.add(o.text);
    gewaehlt.push(o);
  }
  return mische(gewaehlt, z);
}

export type UebungsDaten = {
  buchstaben: readonly UebungsBuchstabe[];
  silben: readonly UebungsSilbe[];
  /** Buchstaben, deren Züge zum Nachspuren mitgeliefert werden. */
  spurBuchstaben: readonly string[];
};

export function aufgabe(art: UebungsArt, d: UebungsDaten, z: Zufall): Aufgabe {
  switch (art) {
    case 'erkennen': {
      const b = waehle(d.buchstaben, z);
      const als = (x: UebungsBuchstabe): Option => ({ wert: x.slug, text: x.name });
      const aehnlich = d.buchstaben.filter((x) => b.aehnlich.includes(x.slug)).map(als);
      return { art, ziel: b.slug, zeige: b.zeichen, optionen: optionen(als(b), aehnlich, d.buchstaben.map(als), z) };
    }
    case 'zuordnen': {
      const kandidaten = d.buchstaben.filter((x) => x.verbindet);
      const b = waehle(kandidaten, z);
      const form: FormArt = b.verbindetLinks ? waehle<FormArt>(['anfang', 'mitte', 'ende'], z) : 'ende';
      const als = (x: UebungsBuchstabe): Option => ({ wert: x.slug, text: x.zeichen });
      const aehnlich = d.buchstaben.filter((x) => b.aehnlich.includes(x.slug)).map(als);
      return { art, ziel: b.slug, form, zeige: b.formen[form], optionen: optionen(als(b), aehnlich, d.buchstaben.map(als), z) };
    }
    case 'lesen': {
      const s = waehle(d.silben, z);
      const als = (x: UebungsSilbe): Option => ({ wert: x.umschrift, text: x.umschrift });
      const gleicherBuchstabe = d.silben.filter((x) => x.buchstabe === s.buchstabe).map(als);
      return {
        art,
        ziel: s.umschrift,
        buchstabe: s.buchstabe,
        zeige: s.text,
        optionen: optionen(als(s), gleicherBuchstabe, d.silben.map(als), z),
      };
    }
    case 'nachspuren':
      return { art, ziel: waehle(d.spurBuchstaben, z) };
  }
}

/** Eine Runde mit `anzahl` Aufgaben; bei mehreren Arten abwechselnd, kein Ziel zweimal direkt hintereinander. */
export function runde(arten: readonly UebungsArt[], d: UebungsDaten, z: Zufall, anzahl = 8): Aufgabe[] {
  const liste: Aufgabe[] = [];
  for (let i = 0; liste.length < anzahl && i < anzahl * 10; i++) {
    const a = aufgabe(arten[liste.length % arten.length] as UebungsArt, d, z);
    const vorige = liste.at(-1);
    if (vorige && vorige.ziel === a.ziel) continue;
    liste.push(a);
  }
  return liste;
}

export function istRichtig(a: Aufgabe, wahl: string): boolean {
  return a.ziel === wahl;
}

/** Der geübte Buchstabe einer Aufgabe (für den Fortschritt). */
export function buchstabeVon(a: Aufgabe): string {
  return a.art === 'lesen' ? a.buchstabe : a.ziel;
}

type Punkt = readonly [number, number];

/**
 * Nachspuren, tolerant: Die Spur deckt den Zug ab, wenn mindestens `anteil` seiner Abtastpunkte näher als `toleranz`
 * an der Spur liegen, und sie läuft in Schreibrichtung (Anfang nahe am Zuganfang, Ende weiter hinten als der Anfang).
 */
export function bewerteSpur(
  spur: readonly Punkt[],
  zug: readonly Punkt[],
  toleranz: number,
  anteil = 0.7,
): { ok: boolean; abdeckung: number; richtung: boolean } {
  if (spur.length < 2 || zug.length < 2) return { ok: false, abdeckung: 0, richtung: false };
  const t2 = toleranz * toleranz;
  const abstand2 = (a: Punkt, b: Punkt) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  const gedeckt = zug.filter((p) => spur.some((s) => abstand2(p, s) <= t2)).length;
  const abdeckung = gedeckt / zug.length;
  const index = (s: Punkt) => {
    let best = 0;
    let bd = Infinity;
    zug.forEach((p, i) => {
      const d = abstand2(p, s);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  };
  const fuenftel = Math.max(1, Math.floor(spur.length / 5));
  const mittel = (teil: readonly Punkt[]) => teil.reduce((s, p) => s + index(p), 0) / teil.length;
  const anfang = mittel(spur.slice(0, fuenftel));
  const schluss = mittel(spur.slice(-fuenftel));
  const richtung = schluss > anfang && index(spur[0] as Punkt) <= zug.length * 0.35;
  return { ok: abdeckung >= anteil && richtung, abdeckung, richtung };
}

/** Lokaler Fortschritt: je Buchstabe die Zahl richtiger Antworten (keine Ranglisten, keine Serien). */
export type Fortschritt = { version: 1; buchstaben: Record<string, number> };
export const FORTSCHRITT_SCHLUESSEL = 'igmg-elifbe-fortschritt';

export function leseFortschritt(roh: string | null): Fortschritt {
  try {
    const f = JSON.parse(roh ?? '') as Partial<Fortschritt>;
    if (f && f.version === 1 && f.buchstaben && typeof f.buchstaben === 'object') {
      const buchstaben: Record<string, number> = {};
      for (const [k, v] of Object.entries(f.buchstaben))
        if (typeof v === 'number' && v > 0 && /^[a-z]+$/.test(k)) buchstaben[k] = Math.floor(v);
      return { version: 1, buchstaben };
    }
  } catch {
    // ungültig oder leer: frisch beginnen
  }
  return { version: 1, buchstaben: {} };
}

export function trageEin(f: Fortschritt, slug: string): Fortschritt {
  return { version: 1, buchstaben: { ...f.buchstaben, [slug]: (f.buchstaben[slug] ?? 0) + 1 } };
}
