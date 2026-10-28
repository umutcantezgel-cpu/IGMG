import 'server-only';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LieferTag } from '../abgleich-diff';
import type { Tageszeiten } from '../typen';
import { lieferungAus } from './normalisieren';
import { QuellenFehler, type GebetszeitenQuelle, type HolAuftrag, type Lieferung } from './typen';

/**
 * Jahresdatei der IGMG im Repository (ADR 0048, ADR 0025): `web/daten/igmg-gebetskalender/<stadt-id>-<jahr>.csv` mit den
 * Köpfen des IGMG-Kalenders. Kommt nur mit schriftlicher Erlaubnis der IGMG ins Repository (MENSCHEN M-099, M-100). Daneben
 * `QUELLE.md` mit Herkunft, Datum der Erlaubnis, Abrufdatum und je Datei einer Tabellenzeile mit dem Dateinamen in
 * Backticks und ihrer SHA-256 (64 Hex-Zeichen) – stimmt die Prüfsumme nicht, gilt die Datei nicht (Fehler `pruefsumme`).
 *
 * Doppelt genutzt: als Quelle des Abgleichs (schreibt `quelle 'igmg'` in die Datenbank) und von den Ladern als Ebene 3
 * des Vorrangs (`vorrang.ts`) – etwa im Beispielmodus ohne Datenbank. Heute liegt keine Datei vor.
 */
export const DATEI_ORDNER = join(process.cwd(), 'daten', 'igmg-gebetskalender');

const dateiname = (stadtId: string, jahr: number) => `${stadtId}-${jahr}.csv`;
const zwischenspeicher = new Map<string, { tage: LieferTag[]; sha256: string; stand: string | null } | null>();

/** Angaben aus `QUELLE.md`: SHA-256 der Datei laut Tabelle und Stand (Zeile „Abrufdatum …“), sonst null. */
function quellAngaben(ordner: string, datei: string): { sha256: string | null; stand: string | null } {
  const pfad = join(ordner, 'QUELLE.md');
  if (!existsSync(pfad)) return { sha256: null, stand: null };
  const text = readFileSync(pfad, 'utf8');
  const zeile = text.split('\n').find((z) => z.includes(`\`${datei}\``));
  const stand = /Abrufdatum[^\d]*(\d{4}-\d{2}-\d{2})/.exec(text)?.[1] ?? null;
  return { sha256: zeile ? (/\b[0-9a-f]{64}\b/.exec(zeile)?.[0] ?? null) : null, stand };
}

/**
 * Tage einer Jahresdatei; `null`, wenn keine Datei vorliegt. Wirft `QuellenFehler('pruefsumme')`, wenn die Prüfsumme fehlt
 * oder nicht stimmt, und `QuellenFehler('format')` bei unlesbarem Inhalt.
 */
export function leseJahresdatei(
  stadtId: string,
  jahr: number,
  ordner = DATEI_ORDNER,
): { tage: LieferTag[]; sha256: string; stand: string | null } | null {
  const schluessel = `${ordner}|${stadtId}|${jahr}`;
  if (zwischenspeicher.has(schluessel)) return zwischenspeicher.get(schluessel)!;
  const datei = dateiname(stadtId, jahr);
  const pfad = join(ordner, datei);
  if (!existsSync(pfad)) {
    zwischenspeicher.set(schluessel, null);
    return null;
  }
  const bytes = readFileSync(pfad);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const angaben = quellAngaben(ordner, datei);
  if (angaben.sha256 !== sha256) throw new QuellenFehler('pruefsumme');
  const gelesen = lieferungAus(bytes.toString('utf8'), 'csv');
  if (!gelesen.ok) throw new QuellenFehler('format');
  const ergebnis = { tage: gelesen.tage, sha256, stand: angaben.stand };
  zwischenspeicher.set(schluessel, ergebnis);
  return ergebnis;
}

/**
 * Tage aus Jahresdateien für einen Zeitraum (Lader, Ebene 3): nie ein Fehler – ohne Datei oder mit ungültiger Datei leer
 * (das Startklar-Cockpit meldet ungültige Dateien).
 */
export function jahresdateiTage(
  stadtId: string,
  von: string,
  bis: string,
  ordner = DATEI_ORDNER,
): { tage: Map<string, Tageszeiten>; stand: string | null } {
  const tage = new Map<string, Tageszeiten>();
  let stand: string | null = null;
  for (let jahr = Number(von.slice(0, 4)); jahr <= Number(bis.slice(0, 4)); jahr++) {
    let datei: ReturnType<typeof leseJahresdatei> = null;
    try {
      datei = leseJahresdatei(stadtId, jahr, ordner);
    } catch {
      datei = null;
    }
    stand ??= datei?.stand ?? null;
    for (const t of datei?.tage ?? []) if (t.datum >= von && t.datum <= bis) tage.set(t.datum, t);
  }
  return { tage, stand };
}

/** Letzter Tag, den die Jahresdateien abdecken (Startklar: Warnung, wenn er in weniger als 60 Tagen liegt), sonst null. */
export function jahresdateiEnde(stadtId: string, abJahr: number, ordner = DATEI_ORDNER): string | null {
  let ende: string | null = null;
  for (let jahr = abJahr; jahr <= abJahr + 2; jahr++) {
    try {
      const d = leseJahresdatei(stadtId, jahr, ordner);
      if (d?.tage.length)
        ende =
          d.tage
            .map((t) => t.datum)
            .sort()
            .at(-1) ?? ende;
    } catch {
      // ungültige Datei zählt nicht
    }
  }
  return ende;
}

export function dateiQuelle(o: { stadtId: string; ordner?: string; jetzt?: () => Date }): GebetszeitenQuelle {
  const ordner = o.ordner ?? DATEI_ORDNER;
  const jahr = () => (o.jetzt ?? (() => new Date()))().getUTCFullYear();
  return {
    id: 'igmg-datei',
    bereit: () => [jahr(), jahr() + 1].some((j) => existsSync(join(ordner, dateiname(o.stadtId, j)))),
    async hole({ von, bis, stadtId }: HolAuftrag): Promise<Lieferung> {
      const tage: LieferTag[] = [];
      const hash = createHash('sha256');
      let stand: string | null = null;
      for (let j = Number(von.slice(0, 4)); j <= Number(bis.slice(0, 4)); j++) {
        const d = leseJahresdatei(stadtId, j, ordner);
        if (!d) continue;
        hash.update(d.sha256);
        stand ??= d.stand;
        tage.push(...d.tage.filter((t) => t.datum >= von && t.datum <= bis));
      }
      if (tage.length === 0) throw new QuellenFehler('nicht_eingerichtet');
      return { tage, stand, ort: { id: stadtId, name: null }, sha256: hash.digest('hex') };
    },
  };
}
