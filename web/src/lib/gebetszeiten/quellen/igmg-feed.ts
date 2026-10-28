import 'server-only';
import { createHash } from 'node:crypto';
import { betriebsart, igmgZugangGueltig, oeffentlicheAdresse, type UmgebungsWerte } from '@/lib/umgebung';
import { lieferungAus } from './normalisieren';
import { QuellenFehler, type Abruf, type GebetszeitenQuelle, type HolAuftrag, type Lieferung } from './typen';

/**
 * Offizieller Zugang der IGMG zum Gebetskalender (ADR 0048): liest NUR die Adresse aus GEBETSZEITEN_IGMG_URL (von der IGMG
 * bereitgestellt, nicht in der Verwaltung änderbar) und schickt GEBETSZEITEN_IGMG_SCHLUESSEL – falls gesetzt – nur als Header.
 * Ausdrücklich nicht: die interne AJAX-Schnittstelle der Website, der PDF-Export, Browser-Nachahmung oder Cookies. Ist die
 * Adresse nicht gesetzt, ist die Quelle nicht bereit und der Abgleich tut nichts.
 *
 * Abruf: `redirect: 'error'`, `cache: 'no-store'`, `credentials: 'omit'`, je Versuch 10 s, höchstens 3 Versuche (Wartezeit
 * 2 s und 8 s, nur bei Netzfehler, Zeitlimit, 429 oder 5xx), Gesamtbudget 30 s, höchstens 1 MB je Antwort, Inhaltstyp JSON
 * oder CSV. Eigener User-Agent mit der Adresse der Gemeinde. Platzhalter {stadt}, {jahr}, {monat} → ein Abruf je Monat
 * (mit {monat}), je Jahr (nur {jahr}) oder einer für alles.
 */
const VERSUCH_MS = 10_000;
const BUDGET_MS = 30_000;
const WARTEN_MS = [2_000, 8_000];
const MAX_BYTES = 1024 * 1024;

const warteStandard = (ms: number) => new Promise<void>((fertig) => setTimeout(fertig, ms));

/** Adresse für die Lieferung: https, oder http nur für localhost außerhalb der Produktion (Testfeed in E2E). */
export function zugangErlaubt(adresse: string, env: UmgebungsWerte): boolean {
  if (igmgZugangGueltig(adresse)) return true;
  try {
    const url = new URL(adresse.replaceAll('{stadt}', '1').replaceAll('{jahr}', '2026').replaceAll('{monat}', '01'));
    return url.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(url.hostname) && betriebsart(env) !== 'produktion';
  } catch {
    return false;
  }
}

/** Abrufadressen für den Zeitraum: je Monat, je Jahr oder eine. */
export function abrufAdressen(vorlage: string, stadtId: string, von: string, bis: string): string[] {
  const monate: string[] = [];
  let [j, m] = von.split('-').map(Number);
  while (`${j}-${String(m).padStart(2, '0')}` <= bis.slice(0, 7)) {
    monate.push(`${j}-${String(m).padStart(2, '0')}`);
    if (m === 12) {
      j++;
      m = 1;
    } else m++;
  }
  const fuelle = (jahr: string, monat: string) =>
    vorlage.replaceAll('{stadt}', encodeURIComponent(stadtId)).replaceAll('{jahr}', jahr).replaceAll('{monat}', monat);
  if (vorlage.includes('{monat}')) return monate.map((jm) => fuelle(jm.slice(0, 4), jm.slice(5)));
  if (vorlage.includes('{jahr}')) return [...new Set(monate.map((jm) => jm.slice(0, 4)))].map((j) => fuelle(j, ''));
  return [fuelle('', '')];
}

/** Antwortkörper mit Obergrenze lesen (bricht beim ersten Byte über 1 MB ab). */
async function liesBegrenzt(antwort: Response): Promise<Uint8Array> {
  const laenge = Number(antwort.headers.get('content-length') ?? '0');
  if (laenge > MAX_BYTES) throw new QuellenFehler('zu_gross');
  if (!antwort.body) return new Uint8Array();
  const leser = antwort.body.getReader();
  const teile: Uint8Array[] = [];
  let summe = 0;
  for (;;) {
    const { done, value } = await leser.read();
    if (done) break;
    summe += value.byteLength;
    if (summe > MAX_BYTES) {
      await leser.cancel();
      throw new QuellenFehler('zu_gross');
    }
    teile.push(value);
  }
  const alles = new Uint8Array(summe);
  let pos = 0;
  for (const t of teile) {
    alles.set(t, pos);
    pos += t.byteLength;
  }
  return alles;
}

function artVon(inhaltstyp: string | null): 'json' | 'csv' | null {
  const t = (inhaltstyp ?? '').split(';')[0].trim().toLowerCase();
  if (t === 'application/json' || t.endsWith('+json')) return 'json';
  if (t === 'text/csv' || t === 'text/plain' || t === 'application/csv') return 'csv';
  return null;
}

export function feedQuelle(
  o: { env?: UmgebungsWerte; abruf?: Abruf; warte?: (ms: number) => Promise<void>; jetzt?: () => number } = {},
): GebetszeitenQuelle {
  const env = o.env ?? process.env;
  const abruf: Abruf = o.abruf ?? ((adresse, init) => fetch(adresse, init));
  const warte = o.warte ?? warteStandard;
  const jetzt = o.jetzt ?? Date.now;
  const vorlage = env.GEBETSZEITEN_IGMG_URL?.trim() ?? '';
  const schluessel = env.GEBETSZEITEN_IGMG_SCHLUESSEL?.trim() ?? '';

  async function holeEine(adresse: string, frist: number, signal?: AbortSignal): Promise<{ bytes: Uint8Array; art: 'json' | 'csv' }> {
    let letzter: QuellenFehler = new QuellenFehler('netz');
    for (let versuch = 0; versuch < 3; versuch++) {
      if (versuch > 0) {
        const pause = WARTEN_MS[versuch - 1];
        if (jetzt() + pause + VERSUCH_MS > frist) break;
        await warte(pause);
      }
      const zeitlimit = AbortSignal.timeout(Math.max(1, Math.min(VERSUCH_MS, frist - jetzt())));
      let antwort: Response;
      try {
        antwort = await abruf(adresse, {
          method: 'GET',
          redirect: 'error',
          cache: 'no-store',
          credentials: 'omit',
          signal: signal ? AbortSignal.any([zeitlimit, signal]) : zeitlimit,
          headers: {
            accept: 'application/json, text/csv;q=0.9',
            'user-agent': `IGMG-Wetzlar-Website/1.0 (+${oeffentlicheAdresse(env)}/kontakt)`,
            ...(schluessel ? { authorization: `Bearer ${schluessel}` } : {}),
          },
        });
      } catch {
        letzter = new QuellenFehler(zeitlimit.aborted ? 'zeitlimit' : 'netz');
        continue;
      }
      if (!antwort.ok) {
        await antwort.body?.cancel().catch(() => undefined);
        letzter = new QuellenFehler('status', antwort.status);
        // Nur vorübergehende Fehler wiederholen (Überlast, Serverfehler); andere Antworten bleiben, wie sie sind
        if (antwort.status === 429 || antwort.status >= 500) continue;
        throw letzter;
      }
      const art = artVon(antwort.headers.get('content-type'));
      if (!art) {
        await antwort.body?.cancel().catch(() => undefined);
        throw new QuellenFehler('inhaltstyp');
      }
      try {
        return { bytes: await liesBegrenzt(antwort), art };
      } catch (fehler) {
        if (fehler instanceof QuellenFehler) throw fehler;
        letzter = new QuellenFehler(zeitlimit.aborted ? 'zeitlimit' : 'netz');
      }
    }
    throw letzter;
  }

  return {
    id: 'igmg-feed',
    bereit: () => vorlage !== '' && zugangErlaubt(vorlage, env),
    async hole({ von, bis, stadtId, signal }: HolAuftrag): Promise<Lieferung> {
      if (!vorlage) throw new QuellenFehler('nicht_eingerichtet');
      if (!zugangErlaubt(vorlage, env)) throw new QuellenFehler('adresse');
      const frist = jetzt() + BUDGET_MS;
      const hash = createHash('sha256');
      const ergebnis: Lieferung = { tage: [], stand: null, ort: { id: null, name: null }, sha256: '' };
      for (const adresse of abrufAdressen(vorlage, stadtId, von, bis)) {
        const { bytes, art } = await holeEine(adresse, frist, signal);
        hash.update(bytes);
        const teil = lieferungAus(new TextDecoder('utf-8', { fatal: false }).decode(bytes), art);
        if (!teil.ok) throw new QuellenFehler('format');
        ergebnis.tage.push(...teil.tage);
        ergebnis.stand ??= teil.stand;
        ergebnis.ort = { id: ergebnis.ort.id ?? teil.ort.id, name: ergebnis.ort.name ?? teil.ort.name };
      }
      ergebnis.sha256 = hash.digest('hex');
      return ergebnis;
    },
  };
}
