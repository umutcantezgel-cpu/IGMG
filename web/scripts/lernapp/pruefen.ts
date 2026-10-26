// Automatische Prüfer der Lern-App-Inhalte (PLAN §6.4, Tor L3 „lernapp:pruefen 0“; Module in src/lib/lernapp/inhalt/pruefer/):
// Auszugs-Prüfsummen (Abbruch bei Abweichung), Schema und Ablage, eindeutige Schlüssel, Dubletten, Lizenz und Herkunft,
// Ausschlüsse, Übersetzungen (Kopie des Zieltexts, falsche Schrift), Paketbau-Probe (Aufgaben, die der Paketbau verwerfen
// würde), Stufen-Wortschatz, Satzlänge, Lemma-Budget, Abdeckung des Rahmenplans, Vokalisierung (ar), kindgeeignet,
// Bildkarten, Religionswächter, Religionsbezug und Inhaltsleitfaden (Tabu-Lexikon → menschlich_klaeren).
// Ausgaben ohne arabische Schrift und ohne Wörter des Tabu-Lexikons (nur Kategorie-IDs).
// Aufruf: pnpm lernapp:pruefen [--testkurs] [--json <datei>] [--alle-warnungen]
//   --testkurs   prüft den festen Testkurs (drizzle/seeds/lernapp-test.ts) zusammen mit Rahmenplänen, Leitfaden und dem
//                Register der Bildkarten (symbole/symbole.json)
//   --json       schreibt den vollständigen Bericht (für die Workflows, L3-03)
// Ausgang 1 bei blockierenden Befunden; Befunde für Menschen und Warnungen blockieren nicht.
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { testkursQuellen } from '../../drizzle/seeds/lernapp-test';
import { befundZeile, blockierende, menschlich, type PruefBericht, pruefeInhalte, warnungen } from '../../src/lib/lernapp/inhalt/pruefer';
import { PRUEFER } from '../../src/lib/lernapp/inhalt/pruefer/typen';
import { alleInhaltsdateien, inhaltsdateien, INHALT_WURZEL } from './inhaltsdateien';

/** Bericht als Textzeilen (ohne arabische Schrift). */
export function berichtZeilen(b: PruefBericht, { alleWarnungen = false } = {}): string[] {
  const zeilen: string[] = [];
  const block = blockierende(b);
  const mensch = menschlich(b);
  const warn = warnungen(b);
  for (const x of block) zeilen.push(`BEFUND [${x.pruefer}] ${befundZeile(x)}`);
  for (const x of mensch) zeilen.push(`MENSCH [${x.pruefer}] ${befundZeile(x)}`);
  for (const x of alleWarnungen ? warn : warn.slice(0, 50)) zeilen.push(`Warnung [${x.pruefer}] ${befundZeile(x)}`);
  if (!alleWarnungen && warn.length > 50) zeilen.push(`… ${warn.length - 50} weitere Warnungen (--alle-warnungen)`);
  for (const a of b.abdeckung)
    zeilen.push(
      `Abdeckung ${a.kurs}.${a.stufe}: Einheiten ${a.einheiten}/${a.einheitenRahmen}, Lemmata ${a.lemmata}/${a.budget} (${(100 * a.anteil).toFixed(1)} %)${a.vollstaendig ? '' : ', Stufe unvollständig'}`,
    );
  const jePruefer = PRUEFER.map((p) => {
    const n = (s: string) => b.befunde.filter((x) => x.pruefer === p && x.schwere === s).length;
    return `${p} ${n('blockierend')}/${n('mensch')}/${n('warnung')}`;
  });
  zeilen.push(`Prüfer (blockierend/Mensch/Warnung): ${jePruefer.join(', ')}`);
  zeilen.push(
    `Lern-App-Prüfung${b.abgebrochen ? ' ABGEBROCHEN (Auszüge verändert)' : ''}: ${b.dateien} Dateien, ${b.eintraege} Einträge, ` +
      `${block.length} blockierend, ${mensch.length} menschlich_klaeren, ${warn.length} Warnungen, ${(b.dauerMs / 1000).toFixed(1)} s; ` +
      `Quelle und Lizenz je Eintrag: ${block.some((x) => x.pruefer === 'lizenz' || x.pruefer === 'schema') ? 'siehe Befunde' : '100 %'}.`,
  );
  return zeilen;
}

if (process.argv[1]?.endsWith('pruefen.ts')) {
  const { values } = parseArgs({
    options: {
      testkurs: { type: 'boolean', default: false },
      json: { type: 'string' },
      'alle-warnungen': { type: 'boolean', default: false },
    },
  });
  const bericht = values.testkurs
    ? pruefeInhalte(testkursQuellen(), {
        praefix: 'testkurs/',
        pfadePruefen: false,
        zusatz: inhaltsdateien(INHALT_WURZEL, ['rahmen', 'symbole']),
      })
    : pruefeInhalte(alleInhaltsdateien());
  if (values.json) writeFileSync(values.json, `${JSON.stringify(bericht, null, 2)}\n`);
  for (const z of berichtZeilen(bericht, { alleWarnungen: values['alle-warnungen'] })) console.log(z);
  process.exit(blockierende(bericht).length ? 1 : 0);
}
