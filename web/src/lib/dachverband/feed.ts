import { freitagAb } from './auswahl';
import { ohneZitat, SCHLUESSEL_MUSTER, ZITATZEICHEN } from '@/lib/validierung/seiteninhalte/dachverband';

/**
 * RSS-Feed der Freitagspredigten (Hutba) der IGMG (Plan Marktstart P3, E-044 Nr. 2, ADR 0046). Ein Maschinen-Endpunkt,
 * kein Linkziel – deshalb nicht im IGMG-Netzwerk. Abgerufen wird nur serverseitig aus dem Cron bzw. der Verwaltung, nie
 * beim Seitenaufruf (K-14).
 *
 * Der Parser kommt ohne neues Paket aus und liest je `<item>` NUR `title`, `link` und `pubDate`. `description` und
 * `content:encoded` werden vorher entfernt und nie gelesen: Die Predigten zitieren Koran und Hadith (G-06), auf der Website
 * erscheinen nur Titel, Datum und Link.
 */
export const HUTBA_FEED = 'https://www.igmg.org/category/irschad/freitagspredigt/feed/';

/** Einziger Host, dessen Links übernommen werden. */
export const FEED_HOST = 'www.igmg.org';

const USER_AGENT = 'IGMG-Wetzlar-Website (Dachverband-Abgleich)';
const VERSUCH_MS = 10_000;
const VERSUCHE = 2;
const WARTEN_MS = 2_000;
const MAX_BYTES = 2 * 1024 * 1024;

/** Abruf wie `fetch` (in Tests eingesetzt). */
export type Abruf = (adresse: string, init: RequestInit) => Promise<Response>;

export type FeedFehlerCode = 'netz' | 'zeitlimit' | 'status' | 'inhaltstyp' | 'zu_gross' | 'format';

export class FeedFehler extends Error {
  constructor(
    readonly code: FeedFehlerCode,
    readonly status?: number,
  ) {
    super(`FEED_${code.toUpperCase()}`);
    this.name = 'FeedFehler';
  }
}

/** Ein Eintrag aus dem Feed: Kennung aus dem Adressteil, Titel, Link, Freitag der Woche und Zeitpunkt der Veröffentlichung. */
export type FeedEintrag = { schluessel: string; titel: string; url: string; datum: string; veroeffentlicht: string };

export type FeedErgebnis = { eintraege: FeedEintrag[]; abgewiesen: number };

const BENANNT: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  sbquo: '‚',
  ldquo: '“',
  rdquo: '”',
  bdquo: '„',
  laquo: '«',
  raquo: '»',
};

/** HTML-Entities dekodieren (benannt, dezimal, hexadezimal); unbekannte bleiben stehen. */
export function dekodiereEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (ganz, kern: string) => {
    if (kern[0] === '#') {
      const zahl = kern[1] === 'x' || kern[1] === 'X' ? Number.parseInt(kern.slice(2), 16) : Number.parseInt(kern.slice(1), 10);
      return Number.isInteger(zahl) && zahl > 0 && zahl <= 0x10ffff ? String.fromCodePoint(zahl) : ganz;
    }
    return BENANNT[kern.toLowerCase()] ?? ganz;
  });
}

/** Inhalt eines Elements: CDATA wörtlich, sonst mit dekodierten Entities. */
function elementText(roh: string): string {
  const cdata = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(roh);
  return cdata ? cdata[1] : dekodiereEntities(roh);
}

function erstesElement(item: string, name: string): string | null {
  const treffer = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i').exec(item);
  return treffer ? elementText(treffer[1]) : null;
}

/** Titel: Tags und Anführungszeichen entfernen, Leerraum zusammenfassen. */
function bereinigeTitel(roh: string): string {
  return roh
    .replace(/<[^>]*>/g, ' ')
    .replace(new RegExp(ZITATZEICHEN.source, 'g'), '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Kennung aus dem letzten Adressteil („/infak-barmherzig-wirtschaften/“ → „infak-barmherzig-wirtschaften“). */
export function schluesselAus(url: URL): string | null {
  const teil = url.pathname.split('/').filter(Boolean).at(-1) ?? '';
  let lesbar = teil;
  try {
    lesbar = decodeURIComponent(teil);
  } catch {
    // Ungültige Prozentkodierung: wie geliefert weiterverarbeiten
  }
  const schluessel = lesbar
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
  return SCHLUESSEL_MUSTER.test(schluessel) ? schluessel : null;
}

/** Kalendertag (JJJJ-MM-TT) eines Zeitpunkts in Europe/Berlin. */
export function berlinerTag(zeitpunkt: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    zeitpunkt,
  );
}

/**
 * Datum der Predigt: der Freitag am oder nach der Veröffentlichung, gerechnet in Europe/Berlin (die IGMG veröffentlicht
 * meist donnerstags; der Kalendertag folgt der Sommerzeitregel, z. B. Umstellung am 25.10.2026).
 */
export function freitagDerWoche(zeitpunkt: Date): string {
  return freitagAb(berlinerTag(zeitpunkt));
}

/** Link übernehmen? Nur https mit Host www.igmg.org (ohne Zugangsdaten, ohne Port). */
function igmgLink(roh: string): URL | null {
  try {
    const url = new URL(roh.trim());
    if (url.protocol !== 'https:' || url.hostname !== FEED_HOST || url.port || url.username || url.password) return null;
    url.hash = '';
    return url;
  } catch {
    return null;
  }
}

/**
 * RSS 2.0 lesen. Wirft `FeedFehler('format')`, wenn kein RSS-Kanal erkennbar ist. Einträge ohne gültigen Titel, Link oder
 * Datum, mit fremdem Host, mit Versangabe im Titel oder doppelter Kennung zählen als `abgewiesen`.
 */
export function leseFeed(xml: string): FeedErgebnis {
  if (!/<rss[\s>]/i.test(xml) || !/<channel[\s>]/i.test(xml)) throw new FeedFehler('format');
  // Beschreibung und Volltext vor allem anderen entfernen (G-06): CDATA endet am ersten „]]>“, danach das Element ohne CDATA
  const ohneInhalt = xml
    .replace(/<(description|content:encoded)(?:\s[^>]*)?>\s*<!\[CDATA\[[\s\S]*?\]\]>\s*<\/\1>/gi, '')
    .replace(/<(description|content:encoded)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(description|content:encoded)(?:\s[^>]*)?\/>/gi, '');
  const eintraege: FeedEintrag[] = [];
  const gesehen = new Set<string>();
  let abgewiesen = 0;
  for (const [, item] of ohneInhalt.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)) {
    const titel = bereinigeTitel(erstesElement(item, 'title') ?? '');
    const url = igmgLink(erstesElement(item, 'link') ?? '');
    const pubDate = new Date((erstesElement(item, 'pubDate') ?? '').trim());
    const schluessel = url ? schluesselAus(url) : null;
    if (
      !titel ||
      titel.length > 200 ||
      !ohneZitat(titel) ||
      !url ||
      !schluessel ||
      Number.isNaN(pubDate.getTime()) ||
      gesehen.has(schluessel)
    ) {
      abgewiesen++;
      continue;
    }
    gesehen.add(schluessel);
    eintraege.push({ schluessel, titel, url: url.toString(), datum: freitagDerWoche(pubDate), veroeffentlicht: pubDate.toISOString() });
  }
  return { eintraege, abgewiesen };
}

/** Antwortkörper mit Obergrenze lesen (bricht beim ersten Byte über 2 MB ab). */
async function liesBegrenzt(antwort: Response): Promise<string> {
  const laenge = Number(antwort.headers.get('content-length') ?? '0');
  if (laenge > MAX_BYTES) throw new FeedFehler('zu_gross');
  if (!antwort.body) return '';
  const leser = antwort.body.getReader();
  const teile: Uint8Array[] = [];
  let summe = 0;
  for (;;) {
    const { done, value } = await leser.read();
    if (done) break;
    summe += value.byteLength;
    if (summe > MAX_BYTES) {
      await leser.cancel();
      throw new FeedFehler('zu_gross');
    }
    teile.push(value);
  }
  const alles = new Uint8Array(summe);
  let pos = 0;
  for (const t of teile) {
    alles.set(t, pos);
    pos += t.byteLength;
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(alles);
}

const XML_TYP = /^(application\/(rss\+xml|xml|atom\+xml)|text\/xml)$/;

/**
 * Feed abrufen und lesen: eigener User-Agent (keine Browser-Nachahmung), `redirect: 'error'`, `credentials: 'omit'`,
 * `cache: 'no-store'`, je Versuch 10 s, höchstens 2 Versuche (Wiederholung nur bei Netzfehler, Zeitlimit, 429 und 5xx),
 * höchstens 2 MB, Inhaltstyp XML.
 */
export async function holeFeed(
  o: { abruf?: Abruf; warte?: (ms: number) => Promise<void>; signal?: AbortSignal; adresse?: string } = {},
): Promise<FeedErgebnis> {
  const abruf: Abruf = o.abruf ?? ((adresse, init) => fetch(adresse, init));
  const warte = o.warte ?? ((ms: number) => new Promise<void>((fertig) => setTimeout(fertig, ms)));
  const adresse = o.adresse ?? HUTBA_FEED;
  let letzter = new FeedFehler('netz');
  for (let versuch = 0; versuch < VERSUCHE; versuch++) {
    if (versuch > 0) await warte(WARTEN_MS);
    const zeitlimit = AbortSignal.timeout(VERSUCH_MS);
    let antwort: Response;
    try {
      antwort = await abruf(adresse, {
        method: 'GET',
        redirect: 'error',
        cache: 'no-store',
        credentials: 'omit',
        signal: o.signal ? AbortSignal.any([zeitlimit, o.signal]) : zeitlimit,
        headers: { accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8', 'user-agent': USER_AGENT },
      });
    } catch {
      letzter = new FeedFehler(zeitlimit.aborted ? 'zeitlimit' : 'netz');
      continue;
    }
    if (!antwort.ok) {
      await antwort.body?.cancel().catch(() => undefined);
      letzter = new FeedFehler('status', antwort.status);
      if (antwort.status === 429 || antwort.status >= 500) continue;
      throw letzter;
    }
    const typ = (antwort.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (!XML_TYP.test(typ)) {
      await antwort.body?.cancel().catch(() => undefined);
      throw new FeedFehler('inhaltstyp');
    }
    let text: string;
    try {
      text = await liesBegrenzt(antwort);
    } catch (fehler) {
      if (fehler instanceof FeedFehler) throw fehler;
      letzter = new FeedFehler(zeitlimit.aborted ? 'zeitlimit' : 'netz');
      continue;
    }
    return leseFeed(text);
  }
  throw letzter;
}
