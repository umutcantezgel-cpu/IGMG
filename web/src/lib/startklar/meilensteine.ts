/**
 * Meilensteine der Seite „Projekte“ für das Startklar-Cockpit (AUFTRAG 3.9, E0-K05 Abschnitt 5): Ein Meilenstein ist
 * „vergangen, aber offen“, wenn sein (deutsches) Datum vorbei und er nicht erledigt ist. Das Datum ist freier Text der
 * Redaktion; gelesen werden „15.03.2024“, „15. März 2024“, „März 2024“ und „2024“. Platzhalter wie
 * „[Datum – von der Gemeinde]“ oder unlesbare Angaben gelten als ohne Datum (dafür gibt es die Platzhalter-Prüfung).
 */
const MONATE: Record<string, number> = {
  januar: 1,
  jänner: 1,
  februar: 2,
  märz: 3,
  maerz: 3,
  april: 4,
  mai: 5,
  juni: 6,
  juli: 7,
  august: 8,
  september: 9,
  oktober: 10,
  november: 11,
  dezember: 12,
};

/** Erster Zeitpunkt nach dem genannten Zeitraum (Tag, Monat oder Jahr, UTC) oder null, wenn kein Datum lesbar ist. */
export function meilensteinFrist(text: string): Date | null {
  const t = text.trim().toLowerCase();
  let m = /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/.exec(t);
  if (m) return tagNach(Number(m[3]), Number(m[2]), Number(m[1]));
  m = /^(\d{1,2})\.\s*([a-zäö]+)\s+(\d{4})$/.exec(t);
  if (m && MONATE[m[2]]) return tagNach(Number(m[3]), MONATE[m[2]], Number(m[1]));
  m = /^([a-zäö]+)\s+(\d{4})$/.exec(t);
  if (m && MONATE[m[1]]) return new Date(Date.UTC(Number(m[2]), MONATE[m[1]], 1));
  m = /^(\d{4})$/.exec(t);
  if (m) return new Date(Date.UTC(Number(m[1]) + 1, 0, 1));
  return null;
}

function tagNach(jahr: number, monat: number, tag: number): Date | null {
  const d = new Date(Date.UTC(jahr, monat - 1, tag));
  if (d.getUTCMonth() !== monat - 1 || d.getUTCDate() !== tag) return null;
  return new Date(Date.UTC(jahr, monat - 1, tag + 1));
}

type Meilenstein = { titel: { de: string }; datum: { de: string }; erledigt: boolean };

/** Titel und Datum (deutsch) aller offenen Meilensteine, deren Zeitraum vor `jetzt` endet. */
export function vergangeneOffene(liste: readonly Meilenstein[], jetzt: Date): { titel: string; datum: string }[] {
  return liste
    .filter((m) => {
      if (m.erledigt) return false;
      const frist = meilensteinFrist(m.datum.de);
      return frist !== null && frist.getTime() <= jetzt.getTime();
    })
    .map((m) => ({ titel: m.titel.de, datum: m.datum.de }));
}
