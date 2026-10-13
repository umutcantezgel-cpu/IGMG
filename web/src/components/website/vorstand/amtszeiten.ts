/** Eine Amtszeit, wie sie der Seiteninhalt „vorstand“ führt (Jahre als Text, `bis` leer = laufend). */
export type AmtszeitQuelle = { von: string; bis: string; aktuell: boolean };

export type AmtszeitAbschnitt = {
  von: number;
  bis: number;
  /** Lage auf der Linie (0…1) */
  anfang: number;
  laenge: number;
  aktuell: boolean;
};

export type AmtszeitenLinie = {
  start: number;
  ende: number;
  abschnitte: AmtszeitAbschnitt[];
  /** volle Jahrzehnte zwischen Start und Ende mit ihrer Lage (0…1) */
  jahrzehnte: { jahr: number; lage: number }[];
};

const JAHR = /^\d{4}$/;

/**
 * Verbindungslinie der Vorsitzenden (AUFTRAG 4, Vorstand): Die Amtszeiten liegen als Abschnitte einer Linie vom ersten
 * Amtsbeginn bis heute, jede so lang wie ihre Jahre (mindestens ein halbes Jahr, damit kurze Amtszeiten sichtbar
 * bleiben). Eine laufende Amtszeit reicht bis `heuteJahr`. Nur mit lesbaren Jahreszahlen (vierstellig) und
 * mindestens zwei Amtszeiten – sonst `null`, und die Seite zeigt nur die Karten.
 */
export function amtszeitenLinie(liste: readonly AmtszeitQuelle[], heuteJahr: number): AmtszeitenLinie | null {
  if (liste.length < 2) return null;
  const roh: { von: number; bis: number; aktuell: boolean }[] = [];
  for (const a of liste) {
    if (!JAHR.test(a.von) || (a.bis && !JAHR.test(a.bis))) return null;
    const von = Number(a.von);
    const bis = a.bis ? Number(a.bis) : a.aktuell ? Math.max(heuteJahr, von) : von;
    if (bis < von) return null;
    roh.push({ von, bis, aktuell: a.aktuell && !a.bis });
  }
  roh.sort((a, b) => a.von - b.von);
  const start = roh[0].von;
  const ende = Math.max(...roh.map((a) => Math.max(a.bis, a.von + 0.5)));
  if (ende <= start) return null;
  const spanne = ende - start;
  const abschnitte = roh.map((a) => ({
    ...a,
    anfang: (a.von - start) / spanne,
    laenge: (Math.max(a.bis, a.von + 0.5) - a.von) / spanne,
  }));
  const jahrzehnte: { jahr: number; lage: number }[] = [];
  for (let j = Math.ceil((start + 1) / 10) * 10; j < ende; j += 10) jahrzehnte.push({ jahr: j, lage: (j - start) / spanne });
  return { start, ende, abschnitte, jahrzehnte };
}
