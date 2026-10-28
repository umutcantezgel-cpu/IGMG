// Kalibrierung der Näherung „IGMG (angenähert)“ (ADR 0048): passt Winkel und Temkin an IGMG-Tabellen an und schreibt einen
// Bericht mit Parametervorschlag und Drift (gespeicherte Näherung und Methode gegen die IGMG-Zeiten). Schreibt NIE die
// Einstellung – übernommen wird in der Verwaltung („Vorschlag übernehmen“, mit Vorschau und Audit).
// Aufruf: pnpm gebetszeiten:kalibrieren [--datei <pfad> --breite <grad> --laenge <grad> [--basis <text>]]
//                                       [--pglite <verzeichnis>] [--ausgabe <pfad> | --nur-ausgabe]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { db, holeDb } from '@/lib/db';
import { berechneTag } from '@/lib/gebetszeiten/berechnung';
import { leseEingefuegt, leseTabelle } from '@/lib/gebetszeiten/import';
import { bewerte, kalibriere, type Guete, type KalibrierTag, type Kalibrierung } from '@/lib/gebetszeiten/kalibrierung';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { jahresdateiTage } from '@/lib/gebetszeiten/quellen/datei';
import { GEBETE, STANDARD_EINSTELLUNGEN, type Gebet, type Naeherung } from '@/lib/gebetszeiten/typen';
import { nurZeiten } from '@/lib/gebetszeiten/vorrang';
import { gebetszeitenEinstellung, type GebetszeitenEinstellung } from '@/lib/validierung/einstellungen';

type Optionen = {
  datei?: string;
  breite?: number;
  laenge?: number;
  basis?: string;
  pglite?: string;
  ausgabe?: string;
  nurAusgabe: boolean;
  hilfe: boolean;
};

class Aufruffehler extends Error {}

const HILFE = `Aufruf: pnpm gebetszeiten:kalibrieren [Optionen]

  --datei <pfad>          IGMG-Tabelle (CSV/JSON mit den Köpfen des Kalenders oder eine aus igmg.org kopierte Tabelle)
  --breite, --laenge      Koordinaten des Ortes dieser Tabelle in Grad (Pflicht mit --datei)
  --basis <text>          Bezeichnung der Daten im Bericht (z. B. „IGMG Aachen, Oktober 2026“)
  --pglite <verzeichnis>  lokale PGlite-Datenbank statt DATABASE_URL (nur ohne --datei)
  --ausgabe <pfad>        Bericht hierhin schreiben (Standard: docs/berichte/gebetszeiten-kalibrierung-<datum>.md)
  --nur-ausgabe           Bericht nur ausgeben, keine Datei schreiben
  --hilfe                 diese Hilfe

Ohne --datei: IGMG-Tage aus der Datenbank (quelle 'igmg') und Jahresdateien unter daten/igmg-gebetskalender/, mit den
Koordinaten aus der Einstellung. Die Einstellung wird nie geändert.`;

function liesOptionen(argv: readonly string[]): Optionen {
  const o: Optionen = { nurAusgabe: false, hilfe: false };
  for (let i = 0; i < argv.length; i++) {
    const name = argv[i];
    if (name === '--') continue;
    const wert = (): string => {
      const naechster = argv[i + 1];
      if (naechster === undefined || naechster.startsWith('--')) throw new Aufruffehler(`${name} braucht einen Wert.`);
      i++;
      return naechster;
    };
    const grad = (text: string) => {
      const zahl = Number(text.replace(',', '.'));
      if (!Number.isFinite(zahl)) throw new Aufruffehler(`${name} erwartet eine Zahl.`);
      return zahl;
    };
    if (name === '--hilfe' || name === '-h') o.hilfe = true;
    else if (name === '--nur-ausgabe') o.nurAusgabe = true;
    else if (name === '--datei') o.datei = wert();
    else if (name === '--breite') o.breite = grad(wert());
    else if (name === '--laenge') o.laenge = grad(wert());
    else if (name === '--basis') o.basis = wert();
    else if (name === '--pglite') o.pglite = wert();
    else if (name === '--ausgabe') o.ausgabe = wert();
    else throw new Aufruffehler(`Unbekannte Option ${name}.`);
  }
  if (o.datei && (o.breite === undefined || o.laenge === undefined)) throw new Aufruffehler('--datei braucht --breite und --laenge.');
  return o;
}

/** Tage aus einer Datei: zuerst als kopierte Tabelle, sonst als CSV/JSON. */
function tageAusDatei(pfad: string): KalibrierTag[] {
  const text = readFileSync(pfad, 'utf8');
  const eingefuegt = leseEingefuegt(text);
  const ergebnis = eingefuegt.ok ? eingefuegt : leseTabelle(text, pfad.toLowerCase().endsWith('.json') ? 'json' : 'csv', 'igmg');
  if (!ergebnis.ok) throw new Aufruffehler(`${pfad}: unlesbar (${ergebnis.fehler.map((f) => `${f.fehler}@${f.zeile}`).join(', ')}).`);
  return ergebnis.tage.map((t) => ({ datum: t.datum, ...nurZeiten(t) }));
}

async function einstellungLesen(): Promise<GebetszeitenEinstellung> {
  const { eq } = await import('drizzle-orm');
  const { schema } = await import('@/lib/db');
  const [z] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, 'gebetszeiten'))
    .limit(1);
  const p = gebetszeitenEinstellung.safeParse(z?.wert ?? {});
  return p.success ? p.data : gebetszeitenEinstellung.parse({});
}

async function tageAusDatenbank(einstellung: GebetszeitenEinstellung): Promise<KalibrierTag[]> {
  const { eq } = await import('drizzle-orm');
  const { schema } = await import('@/lib/db');
  const zeilen = await db.select().from(schema.gebetszeitTag).where(eq(schema.gebetszeitTag.quelle, 'igmg'));
  const aus = new Map(zeilen.map((z) => [z.datum, { datum: z.datum, ...nurZeiten(z) }]));
  // Jahresdateien der IGMG ergänzen Tage, die (noch) nicht in der Datenbank stehen
  const jahr = new Date().getUTCFullYear();
  const datei = jahresdateiTage(einstellung.abgleich.stadtId, `${jahr - 1}-01-01`, `${jahr + 1}-12-31`);
  for (const [datum, z] of datei.tage) if (!aus.has(datum)) aus.set(datum, { datum, ...z });
  return [...aus.values()].sort((a, b) => a.datum.localeCompare(b.datum));
}

const minuten = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** Drift der Methode (wie eingestellt, sonst Turkey) gegen die IGMG-Zeiten – zum Vergleich mit der Näherung. */
function driftMethode(
  tage: readonly KalibrierTag[],
  ort: { breite: number; laenge: number },
  e: GebetszeitenEinstellung,
): Record<Gebet, Guete> {
  return Object.fromEntries(
    GEBETE.map((g) => {
      const fehler = tage.map((t) => Math.abs(minuten(berechneTag(t.datum, { ...e, ...ort, rueckfall: 'methode' })[g]) - minuten(t[g])));
      return [
        g,
        {
          tage: fehler.length,
          exakt: fehler.filter((f) => f === 0).length,
          maxFehlerMin: Math.max(0, ...fehler),
          mittelFehlerMin: fehler.length ? Math.round((fehler.reduce((a, b) => a + b, 0) / fehler.length) * 100) / 100 : 0,
        },
      ];
    }),
  ) as Record<Gebet, Guete>;
}

function gueteTabelle(titel: string, g: Record<Gebet, Guete>): string[] {
  return [
    `### ${titel}`,
    '',
    '| Gebet | Tage | exakt | größte Abweichung (Min.) | mittlere Abweichung (Min.) |',
    '|---|---|---|---|---|',
    ...GEBETE.map((x) => `| ${x} | ${g[x].tage} | ${g[x].exakt} | ${g[x].maxFehlerMin} | ${g[x].mittelFehlerMin} |`),
    '',
  ];
}

function bericht(o: {
  basis: string;
  ort: { breite: number; laenge: number };
  tage: readonly KalibrierTag[];
  k: Kalibrierung;
  gespeichert: Naeherung;
  einstellung: GebetszeitenEinstellung;
  heute: string;
}): string {
  const { k } = o;
  const monate = k.monate.map((m) => {
    const teil = o.tage.filter((t) => t.datum.startsWith(m));
    return { monat: m, g: bewerte(teil, o.ort, k.naeherung) };
  });
  return [
    `# Kalibrierung „IGMG (angenähert)“ – ${o.heute}`,
    '',
    `Erzeugt mit \`pnpm gebetszeiten:kalibrieren\` (ADR 0048). Grundlage: ${o.basis}; ${o.tage.length} Tage (${k.monate.join(', ')}),`,
    `Koordinaten ${o.ort.breite} N, ${o.ort.laenge} E. Die Einstellung wurde nicht geändert; übernommen wird in der Verwaltung.`,
    '',
    '## Vorschlag',
    '',
    '```json',
    JSON.stringify(k.naeherung, null, 2),
    '```',
    '',
    k.warnungen.length ? `Warnungen: ${k.warnungen.join(', ')}.` : 'Keine Warnungen.',
    '',
    ...gueteTabelle('Güte des Vorschlags', k.guete),
    ...(k.kreuzprobe
      ? [
          '### Kreuzprobe (je Monat ausgelassen, angepasst und geprüft)',
          '',
          '| Gebet | Tage | abweichende Tage | größte Abweichung (Min.) |',
          '|---|---|---|---|',
          ...GEBETE.map((x) => `| ${x} | ${k.kreuzprobe![x].tage} | ${k.kreuzprobe![x].fehltage} | ${k.kreuzprobe![x].maxFehlerMin} |`),
          '',
        ]
      : ['Kreuzprobe entfällt (nur ein Monat).', '']),
    ...monate.flatMap((m) => gueteTabelle(`Vorschlag im Monat ${m.monat}`, m.g)),
    '## Drift',
    '',
    ...gueteTabelle('Gespeicherte Näherung', bewerte(o.tage, o.ort, o.gespeichert)),
    ...gueteTabelle(`Methode ${o.einstellung.methode} (${o.einstellung.hoheBreite})`, driftMethode(o.tage, o.ort, o.einstellung)),
  ].join('\n');
}

async function main(): Promise<number> {
  let optionen: Optionen;
  try {
    optionen = liesOptionen(process.argv.slice(2));
  } catch (fehler) {
    process.stderr.write(`${(fehler as Error).message}\n`);
    return 1;
  }
  if (optionen.hilfe) {
    process.stdout.write(`${HILFE}\n`);
    return 0;
  }
  if (optionen.pglite !== undefined) {
    process.env.PGLITE_VERZEICHNIS = optionen.pglite;
    delete process.env.DATABASE_URL;
  }
  const mitDatenbank = !optionen.datei;
  try {
    const einstellung = mitDatenbank ? await einstellungLesen() : gebetszeitenEinstellung.parse({});
    const ort = optionen.datei
      ? { breite: optionen.breite!, laenge: optionen.laenge! }
      : { breite: einstellung.breite ?? STANDARD_EINSTELLUNGEN.breite, laenge: einstellung.laenge ?? STANDARD_EINSTELLUNGEN.laenge };
    const tage = optionen.datei ? tageAusDatei(optionen.datei) : await tageAusDatenbank(einstellung);
    if (tage.length === 0) throw new Aufruffehler('Keine IGMG-Tage gefunden (Datenbank leer und keine Jahresdatei).');
    const k = kalibriere(tage, ort);
    const heute = berlinerDatum(new Date());
    const text = bericht({
      basis: optionen.basis ?? (optionen.datei ? optionen.datei : 'IGMG-Tage der Datenbank und Jahresdateien'),
      ort,
      tage,
      k,
      gespeichert: einstellung.naeherung,
      einstellung,
      heute,
    });
    process.stdout.write(`${text}\n`);
    if (!optionen.nurAusgabe) {
      const ziel = optionen.ausgabe ?? join('docs', 'berichte', `gebetszeiten-kalibrierung-${heute}.md`);
      mkdirSync(dirname(ziel), { recursive: true });
      writeFileSync(ziel, `${text}\n`);
      process.stderr.write(`Bericht geschrieben: ${ziel}\n`);
    }
    return 0;
  } catch (fehler) {
    process.stderr.write(`${fehler instanceof Error ? fehler.message : String(fehler)}\n`);
    return 1;
  } finally {
    if (mitDatenbank) {
      try {
        const client = (holeDb() as unknown as { $client?: { end?: () => Promise<void>; close?: () => Promise<void> } }).$client;
        if (client?.end) await client.end();
        else if (client?.close) await client.close();
      } catch {
        // keine Verbindung offen
      }
    }
  }
}

main().then((code) => {
  process.exitCode = code;
});
