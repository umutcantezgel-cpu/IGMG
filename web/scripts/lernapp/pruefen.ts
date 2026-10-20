// Prüfgerüst der Lern-App-Inhalte (PLAN §6.4, Tor L3 „lernapp:pruefen 0“): Schema und Ablageort je Datei, eindeutige
// Schlüssel, Dubletten (gleicher Text), Herkunft (Quelle, Lizenz aus der erlaubten Liste, Namensnennung), Verweise der
// Übersetzungen. Weitere Prüfer (Wortschatz, Satzlänge, Vokalisierung, Wächter, Lizenzbericht) ergänzt L3-02.
// Aufruf: pnpm lernapp:pruefen [--testkurs]   (Ausgang 1 bei blockierenden Befunden)
import { parseArgs } from 'node:util';
import { testkursQuellen } from '../../drizzle/seeds/lernapp-test';
import { type ImportQuelle, ImportFehler, leseDateien } from '../../src/lib/lernapp/inhalt/import';
import { erwarteterPfad } from '../../src/lib/lernapp/inhalt/schema';
import { inhaltsdateien } from './inhaltsdateien';

const { values } = parseArgs({ options: { testkurs: { type: 'boolean', default: false } } });

export type PruefBericht = { dateien: number; eintraege: number; befunde: string[]; warnungen: string[] };

export function pruefe(quellen: readonly ImportQuelle[], { pfadePruefen = true } = {}): PruefBericht {
  const bericht: PruefBericht = { dateien: quellen.length, eintraege: 0, befunde: [], warnungen: [] };
  let dateien: ReturnType<typeof leseDateien>;
  try {
    dateien = leseDateien(quellen);
  } catch (e) {
    if (e instanceof ImportFehler) {
      bericht.befunde.push(...e.fehler);
      return bericht;
    }
    throw e;
  }
  const zielSchluessel = new Set<string>();
  const texte = new Map<string, string>();
  for (const { pfad, datei } of dateien) {
    if (pfadePruefen && pfad !== erwarteterPfad(datei)) bericht.befunde.push(`${pfad}: gehört nach ${erwarteterPfad(datei)}`);
    if (datei.art !== 'sprache') continue;
    const d = datei.daten;
    for (const x of [
      ...d.lemmata.map((l) => ({ s: l.schluessel, t: l.lemma, art: 'lemma' })),
      ...d.saetze.map((s) => ({ s: s.schluessel, t: s.text, art: 'satz' })),
    ]) {
      zielSchluessel.add(x.s);
      bericht.eintraege++;
      const k = `${d.kurs}|${x.art}|${x.t.normalize('NFC').toLocaleLowerCase()}`;
      const vorher = texte.get(k);
      if (vorher) bericht.befunde.push(`${pfad}: Dublette ${x.s} = ${vorher}`);
      else texte.set(k, x.s);
    }
  }
  for (const { pfad, datei } of dateien) {
    if (datei.art !== 'uebersetzung') continue;
    bericht.eintraege += datei.daten.eintraege.length;
    for (const e of datei.daten.eintraege)
      if (!zielSchluessel.has(e.bezug))
        bericht.warnungen.push(`${pfad}: Bezug ${e.bezug} nicht in den geprüften Dateien (nur in der Datenbank?)`);
  }
  return bericht;
}

if (process.argv[1]?.endsWith('pruefen.ts')) {
  const quellen = values.testkurs ? testkursQuellen() : inhaltsdateien();
  const b = pruefe(quellen, { pfadePruefen: !values.testkurs });
  for (const w of b.warnungen) console.warn(`Warnung: ${w}`);
  for (const f of b.befunde) console.error(`Befund: ${f}`);
  console.log(
    `Lern-App-Prüfung: ${b.dateien} Dateien, ${b.eintraege} Einträge, ${b.befunde.length} Befunde, ${b.warnungen.length} Warnungen; ` +
      `Quelle und Lizenz je Eintrag: ${b.befunde.length ? 'siehe Befunde' : '100 %'}.`,
  );
  process.exit(b.befunde.length ? 1 : 0);
}
