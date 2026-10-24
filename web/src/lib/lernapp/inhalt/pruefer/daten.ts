import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Befunde } from './typen';

/**
 * Gepinnte Sprachdaten (ADR 0025, ADR 0045 Nr. 3 und Fortschreibung S7 Nr. 1–2): `web/daten/{tatoeba,kaikki,haeufigkeit}`.
 * Vor jedem Lauf von `pnpm lernapp:pruefen` werden Bytes und SHA-256 jeder Auszugsdatei gegen die Tabelle „Dateien“ in
 * `QUELLE.md` geprüft; bei Abweichung bricht der Lauf ab. Dazu: kein Schlüssel `examples` oder `ref` in `web/daten/kaikki`
 * (ADR 0045 Fortschreibung S7 Nr. 4, Z-L18). Die Ordner fehlen im Vercel-Upload (`.vercelignore`); der Bau braucht sie nicht.
 */

export const AUSZUG_ORDNER = ['tatoeba', 'kaikki', 'haeufigkeit'] as const;
export type AuszugOrdner = (typeof AUSZUG_ORDNER)[number];

/** Standardort `web/daten` (Skripte laufen in `web/`). */
export const standardDaten = () => join(process.cwd(), 'daten');

export type AuszugsDatei = { datei: string; bytes: number; sha256: string };

/**
 * Tabelle unter der Überschrift „## Dateien…“ einer `QUELLE.md`: Spalten `Datei`, `Bytes` und `SHA-256` (weitere Spalten
 * werden übergangen). Dateinamen stehen in Backticks.
 */
export function auszugsTabelle(quelleMd: string): AuszugsDatei[] {
  const zeilen = quelleMd.split('\n');
  const start = zeilen.findIndex((z) => /^##\s+Dateien\b/.test(z));
  if (start < 0) return [];
  let kopf: string[] | null = null;
  const ergebnis: AuszugsDatei[] = [];
  for (const zeile of zeilen.slice(start + 1)) {
    if (/^##\s/.test(zeile)) break;
    if (!zeile.trim().startsWith('|')) {
      if (kopf && ergebnis.length) break;
      continue;
    }
    const zellen = zeile
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((z) => z.trim());
    if (!kopf) {
      kopf = zellen;
      continue;
    }
    if (zellen.every((z) => /^:?-+:?$/.test(z))) continue;
    const i = { datei: kopf.indexOf('Datei'), bytes: kopf.indexOf('Bytes'), sha: kopf.indexOf('SHA-256') };
    if (i.datei < 0 || i.bytes < 0 || i.sha < 0) return [];
    ergebnis.push({
      datei: zellen[i.datei]!.replace(/`/g, ''),
      bytes: Number(zellen[i.bytes]!.replace(/[^\d]/g, '')),
      sha256: zellen[i.sha]!.replace(/`/g, ''),
    });
  }
  return ergebnis;
}

export function sha256Datei(pfad: string): string {
  return createHash('sha256').update(readFileSync(pfad)).digest('hex');
}

/** Prüfsummen der Auszüge gegen `QUELLE.md` (blockierend). Ergebnis leer = alle Auszüge unverändert. */
export function pruefeAuszuege(daten = standardDaten(), ordner: readonly AuszugOrdner[] = AUSZUG_ORDNER): Befunde {
  const b = new Befunde('daten');
  for (const o of ordner) {
    const verzeichnis = join(daten, o);
    const pfadQuelle = join(verzeichnis, 'QUELLE.md');
    const anzeige = `web/daten/${o}/QUELLE.md`;
    if (!existsSync(pfadQuelle)) {
      b.blockierend(anzeige, 'fehlt (Auszüge nur gepinnt mit QUELLE.md, ADR 0025)');
      continue;
    }
    const tabelle = auszugsTabelle(readFileSync(pfadQuelle, 'utf8'));
    if (!tabelle.length) {
      b.blockierend(anzeige, 'keine Tabelle „Dateien“ mit Datei, Bytes und SHA-256');
      continue;
    }
    const gelistet = new Set(tabelle.map((t) => t.datei));
    for (const t of tabelle) {
      const pfad = join(verzeichnis, t.datei);
      const ort = `web/daten/${o}/${t.datei}`;
      if (!existsSync(pfad)) b.blockierend(ort, 'fehlt, steht aber in QUELLE.md');
      else if (statSync(pfad).size !== t.bytes) b.blockierend(ort, `Bytes ${statSync(pfad).size} statt ${t.bytes} (QUELLE.md)`);
      else if (sha256Datei(pfad) !== t.sha256) b.blockierend(ort, 'SHA-256 weicht von QUELLE.md ab – Auszug verändert?');
    }
    for (const datei of readdirSync(verzeichnis))
      if (datei !== 'QUELLE.md' && !gelistet.has(datei)) b.blockierend(`web/daten/${o}/${datei}`, 'nicht in QUELLE.md gepinnt');
  }
  return b;
}

/** Schlüssel, die in `web/daten/kaikki` nie vorkommen dürfen (Beispiele und Zitate, ADR 0045 Fortschreibung S7 Nr. 4). */
export const KAIKKI_VERBOTENE_SCHLUESSEL = ['examples', 'ref'] as const;

function verboteneSchluessel(wert: unknown, gefunden: Set<string>): void {
  if (Array.isArray(wert)) for (const x of wert) verboteneSchluessel(x, gefunden);
  else if (wert && typeof wert === 'object')
    for (const [k, v] of Object.entries(wert)) {
      if ((KAIKKI_VERBOTENE_SCHLUESSEL as readonly string[]).includes(k)) gefunden.add(k);
      verboteneSchluessel(v, gefunden);
    }
}

/** Kein `examples`/`ref` in den kaikki-Auszügen (blockierend), je Datei mit der ersten Zeile. */
export function pruefeKaikkiOhneBeispiele(daten = standardDaten()): Befunde {
  const b = new Befunde('daten');
  const verzeichnis = join(daten, 'kaikki');
  if (!existsSync(verzeichnis)) return b;
  for (const datei of readdirSync(verzeichnis).filter((d) => d.endsWith('.jsonl') || d.endsWith('.json'))) {
    const zeilen = readFileSync(join(verzeichnis, datei), 'utf8').split('\n');
    for (let i = 0; i < zeilen.length; i++) {
      const zeile = zeilen[i]!;
      if (!zeile.trim() || !/"(?:examples|ref)"/.test(zeile)) continue;
      const gefunden = new Set<string>();
      try {
        verboteneSchluessel(JSON.parse(zeile), gefunden);
      } catch {
        b.blockierend(`web/daten/kaikki/${datei}`, 'kein gültiges JSON', `Zeile ${i + 1}`);
        continue;
      }
      if (gefunden.size)
        b.blockierend(
          `web/daten/kaikki/${datei}`,
          `Schlüssel ${[...gefunden].join(', ')} (Beispiele/Zitate nie übernehmen)`,
          `Zeile ${i + 1}`,
        );
    }
  }
  return b;
}

// ——— Lesezugriff (einmal je Prozess) ———

export type TatoebaSatz = {
  id: number;
  sprache: 'deu' | 'tur' | 'ara';
  text: string;
  benutzer: string | null;
  lizenz: string;
  bewNeg: number;
  tags: string[];
};

const cache = new Map<string, unknown>();
function einmal<T>(schluessel: string, laden: () => T): T {
  if (!cache.has(schluessel)) cache.set(schluessel, laden());
  return cache.get(schluessel) as T;
}

/** Sätze des Tatoeba-Auszugs (alle drei Sprachen) nach ID. */
export function ladeTatoeba(daten = standardDaten()): Map<number, TatoebaSatz> {
  return einmal(`tatoeba:${daten}`, () => {
    const saetze = new Map<number, TatoebaSatz>();
    for (const l of ['deu', 'tur', 'ara'] as const) {
      const pfad = join(daten, 'tatoeba', `saetze_${l}.tsv`);
      if (!existsSync(pfad)) continue;
      for (const zeile of readFileSync(pfad, 'utf8').split('\n').slice(1)) {
        if (!zeile) continue;
        const z = zeile.split('\t');
        saetze.set(Number(z[0]), {
          id: Number(z[0]),
          sprache: l,
          text: z[2]!,
          benutzer: z[3] === '\\N' ? null : z[3]!,
          lizenz: z[4]!,
          bewNeg: Number(z[8] || 0),
          tags: z[9] && z[9] !== '\\N' ? z[9].split('|') : [],
        });
      }
    }
    return saetze;
  });
}

export type KaikkiEintrag = {
  w: string;
  l: 'de' | 'tr' | 'ar';
  q: 'en' | 'de' | 'tr';
  pos?: string;
  kanon?: string;
  rom?: string;
  pl?: string[];
  kf?: [string, string][];
  gl?: [string, string][];
  /** Übersetzungen: Sprache, Wort, Bedeutung */
  ue?: [string, string, string][];
  mk?: string[];
};

/** Einträge des kaikki-Kernauszugs einer Sprache. */
export function ladeKaikki(sprache: 'de' | 'tr' | 'ar', daten = standardDaten()): KaikkiEintrag[] {
  return einmal(`kaikki:${sprache}:${daten}`, () => {
    const pfad = join(daten, 'kaikki', `kaikki-kern-${sprache}-top20000.jsonl`);
    if (!existsSync(pfad)) return [];
    return readFileSync(pfad, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((z) => JSON.parse(z) as KaikkiEintrag);
  });
}

/** Rangliste (Wort → Rang, kleinster Rang gewinnt): wordfreq je Sprache, für ar zusätzlich CAMeL MSA. */
export function ladeHaeufigkeit(sprache: 'de' | 'tr' | 'ar', daten = standardDaten()): Map<string, number> {
  return einmal(`haeufigkeit:${sprache}:${daten}`, () => {
    const raenge = new Map<string, number>();
    const dateien = [`wordfreq-3.1.1_${sprache}_top50k.tsv`, ...(sprache === 'ar' ? ['camel-msa-1.0_top50k.tsv'] : [])];
    for (const datei of dateien) {
      const pfad = join(daten, 'haeufigkeit', datei);
      if (!existsSync(pfad)) continue;
      for (const zeile of readFileSync(pfad, 'utf8').split('\n').slice(1)) {
        const [rang, wort] = zeile.split('\t');
        if (!wort) continue;
        const r = Number(rang);
        if (!raenge.has(wort) || raenge.get(wort)! > r) raenge.set(wort, r);
      }
    }
    return raenge;
  });
}
