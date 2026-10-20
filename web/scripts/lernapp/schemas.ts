// JSON-Schemas der Lern-App-Inhalte aus Zod erzeugen (PLAN §6.1, L3-02): web/inhalte/lernapp/schemas/<art>.schema.json je
// Dateiart aus `src/lib/lernapp/inhalt/schema.ts` (DATEI_SCHEMAS). Für Inhalts-Agenten und Editoren; maßgeblich bleibt Zod
// (`pnpm lernapp:pruefen`), denn Querprüfungen (superRefine) stehen nicht im JSON-Schema.
// Aufruf: pnpm lernapp:schemas [--pruefen]   (--pruefen: nur vergleichen, Ausgang 1 bei Abweichung; Unit-Test schemas-aktuell)
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { format, resolveConfig } from 'prettier';
import { z } from 'zod';
import { DATEI_SCHEMAS } from '../../src/lib/lernapp/inhalt/schema';
import { INHALT_WURZEL } from './inhaltsdateien';

export const SCHEMA_ORDNER = join(INHALT_WURZEL, 'schemas');

/** Titel je Dateiart (Ablage nach PLAN §6.1). */
const TITEL: Record<keyof typeof DATEI_SCHEMAS, string> = {
  'sprache-einheit': 'Lern-App: Zielinhalt einer Einheit (sprache/<ziel>/<stufe>/<einheit>.json)',
  uebersetzung: 'Lern-App: Übersetzungen, Glossen und Tipps einer Richtung (uebersetzung/<richtung>/<stufe>/<einheit>.json)',
  rahmen: 'Lern-App: Rahmenplan einer Zielsprache (rahmen/<sprache>.rahmen.json)',
  leitfaden: 'Lern-App: Inhaltsleitfaden der Sprachkurse (rahmen/leitfaden.json)',
  'islam-einheit': 'Lern-App: Einheit des Wissenskurses (islam/<bereich>/<einheit>.json)',
  'koran-pfad': 'Lern-App: Koran-Arabisch-Pfad (koran/pfad.json)',
  aussprache: 'Lern-App: Aussprache-Überschreibungen der Sprachausgabe (aussprache/<sprache>.json)',
  'audio-manifest': 'Lern-App: Audio-Manifest (audio-manifest/<sprache>.json)',
  symbole: 'Lern-App: Bildkarten (symbole/symbole.json)',
};

/** Inhalt aller Schema-Dateien (Dateiname → Text, mit Prettier formatiert wie das Repository). */
export async function schemaDateien(): Promise<Record<string, string>> {
  const ergebnis: Record<string, string> = {};
  for (const [name, schema] of Object.entries(DATEI_SCHEMAS) as [keyof typeof DATEI_SCHEMAS, z.ZodType][]) {
    const datei = `${name}.schema.json`;
    const erzeugt = z.toJSONSchema(schema, { io: 'input', target: 'draft-2020-12' });
    const json = {
      $schema: erzeugt.$schema,
      $comment: 'Erzeugt mit `pnpm lernapp:schemas` aus web/src/lib/lernapp/inhalt/schema.ts – nicht von Hand ändern.',
      title: TITEL[name],
      ...erzeugt,
    };
    const pfad = join(SCHEMA_ORDNER, datei);
    const optionen = (await resolveConfig(pfad)) ?? {};
    ergebnis[datei] = await format(JSON.stringify(json), { ...optionen, filepath: pfad });
  }
  return ergebnis;
}

/** Abweichungen zwischen erzeugten und abgelegten Dateien (fehlend, verändert, überzählig). */
export async function abweichungen(): Promise<string[]> {
  const soll = await schemaDateien();
  const ist = existsSync(SCHEMA_ORDNER) ? readdirSync(SCHEMA_ORDNER).filter((d) => d.endsWith('.json')) : [];
  const fehler: string[] = [];
  for (const [datei, text] of Object.entries(soll)) {
    const pfad = join(SCHEMA_ORDNER, datei);
    if (!existsSync(pfad)) fehler.push(`${datei} fehlt`);
    else if (readFileSync(pfad, 'utf8') !== text) fehler.push(`${datei} veraltet`);
  }
  for (const datei of ist) if (!soll[datei]) fehler.push(`${datei} überzählig`);
  return fehler;
}

async function haupt(): Promise<number> {
  const { values } = parseArgs({ options: { pruefen: { type: 'boolean', default: false } } });
  if (values.pruefen) {
    const fehler = await abweichungen();
    for (const f of fehler) console.error(`Schema: ${f} – pnpm lernapp:schemas ausführen`);
    console.log(`Lern-App-Schemas: ${fehler.length ? `${fehler.length} Abweichungen` : 'aktuell'}.`);
    return fehler.length ? 1 : 0;
  }
  const soll = await schemaDateien();
  mkdirSync(SCHEMA_ORDNER, { recursive: true });
  for (const datei of readdirSync(SCHEMA_ORDNER)) if (datei.endsWith('.json') && !soll[datei]) rmSync(join(SCHEMA_ORDNER, datei));
  for (const [datei, text] of Object.entries(soll)) writeFileSync(join(SCHEMA_ORDNER, datei), text);
  console.log(`Lern-App-Schemas: ${Object.keys(soll).length} Dateien in inhalte/lernapp/schemas/ geschrieben.`);
  return 0;
}

if (process.argv[1]?.endsWith('schemas.ts'))
  haupt().then(
    (code) => process.exit(code),
    (e: unknown) => {
      console.error(e);
      process.exit(1);
    },
  );
