/**
 * Leser für die Korantext-Datei des Tanzil Project im XML-Format (ADR 0009, G-06). Texte werden **unverändert**
 * übernommen: nur XML-Entitäten werden aufgelöst, nichts normalisiert, gekürzt oder umgebrochen.
 *
 * Erwartete Form (Tanzil „XML“): `<quran><sura index="1" name="…"><aya index="1" text="…" …/>…</sura>…</quran>`.
 * Das Attribut `bismillah` (erster Vers der Suren 2–114 außer 9) wird unverändert als `basmala` übernommen.
 * Keine Abhängigkeit: Die Datei ist flach (Elemente mit Attributen, ohne gemischten Inhalt); unbekannte Formen werden
 * mit einer Fehlermeldung abgelehnt statt geraten.
 */
export type TanzilSure = { nr: number; nameAr: string; verse: { nr: number; textAr: string }[]; basmala?: string };

export class TanzilFehler extends Error {}

const ENTITAETEN: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function entitaeten(wert: string): string {
  return wert.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (ganz, name: string) => {
    if (name.startsWith('#x') || name.startsWith('#X')) return String.fromCodePoint(parseInt(name.slice(2), 16));
    if (name.startsWith('#')) return String.fromCodePoint(Number(name.slice(1)));
    const zeichen = ENTITAETEN[name.toLowerCase()];
    if (zeichen === undefined) throw new TanzilFehler(`Unbekannte XML-Entität ${ganz}`);
    return zeichen;
  });
}

function attribute(tag: string): Record<string, string> {
  const werte: Record<string, string> = {};
  for (const t of tag.matchAll(/([A-Za-z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')/g)) werte[t[1]] = entitaeten(t[3] ?? t[4] ?? '');
  return werte;
}

function ganzzahl(wert: string | undefined, was: string): number {
  if (!wert || !/^\d+$/.test(wert)) throw new TanzilFehler(`${was}: keine gültige Nummer (${wert ?? 'fehlt'})`);
  return Number(wert);
}

/** XML → Suren mit Versen, geprüft auf lückenlose Nummern ab 1. */
export function leseTanzil(xml: string): TanzilSure[] {
  const ohneKommentare = xml.replace(/<!--[\s\S]*?-->/g, '');
  if (!/<quran[\s>]/.test(ohneKommentare)) throw new TanzilFehler('Kein <quran>-Element – ist das die Tanzil-XML-Datei?');
  const suren: TanzilSure[] = [];
  for (const s of ohneKommentare.matchAll(/<sura\b([^>]*)>([\s\S]*?)<\/sura>/g)) {
    const sa = attribute(s[1]);
    const sure: TanzilSure = { nr: ganzzahl(sa.index, 'Sure'), nameAr: sa.name ?? '', verse: [] };
    if (!sure.nameAr) throw new TanzilFehler(`Sure ${sure.nr}: Name fehlt`);
    for (const a of s[2].matchAll(/<aya\b([^>]*?)\/?>/g)) {
      const aa = attribute(a[1]);
      const nr = ganzzahl(aa.index, `Sure ${sure.nr}, Vers`);
      if (aa.text === undefined || aa.text === '') throw new TanzilFehler(`Sure ${sure.nr}, Vers ${nr}: Text fehlt`);
      if (nr === 1 && aa.bismillah) sure.basmala = aa.bismillah;
      sure.verse.push({ nr, textAr: aa.text });
    }
    sure.verse.forEach((v, i) => {
      if (v.nr !== i + 1) throw new TanzilFehler(`Sure ${sure.nr}: Verse nicht lückenlos (erwartet ${i + 1}, gefunden ${v.nr})`);
    });
    if (!sure.verse.length) throw new TanzilFehler(`Sure ${sure.nr}: keine Verse`);
    suren.push(sure);
  }
  if (!suren.length) throw new TanzilFehler('Keine Suren gefunden');
  suren.forEach((s, i) => {
    if (s.nr !== i + 1) throw new TanzilFehler(`Suren nicht lückenlos (erwartet ${i + 1}, gefunden ${s.nr})`);
  });
  return suren;
}
