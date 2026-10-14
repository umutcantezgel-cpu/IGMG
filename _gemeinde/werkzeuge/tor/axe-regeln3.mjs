// E3-TOR-PRUEFER: axe WCAG 2.2 AA (Tags wie a11y.mjs) mit Regel-IDs der Verstöße und der „unklar“-Befunde je Route.
// Ergänzt a11y.mjs, das nur Zahlen schreibt. Aufruf:
//   node axe-regeln3.mjs --routen datei.json --breite 390|1440 --basis URL [--protokoll basisname]
// Ausgabe: JSON auf stdout (und in basisname.json). Befunde sind Daten, Exit-Code 1 nur bei technischem Fehler.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { GERAETE, basisAdresse, lesePfade, neuerKontext, oeffne, starteBrowser, vollerUrl } from '/home/user/IGMG/_gemeinde/werkzeuge/hilfen.mjs';

const req = createRequire('/home/user/IGMG/_gemeinde/werkzeuge/package.json');
const { default: AxeBuilder } = await import(req.resolve('@axe-core/playwright'));

const { values } = parseArgs({
  options: {
    routen: { type: 'string' },
    breite: { type: 'string', default: '390' },
    basis: { type: 'string' },
    protokoll: { type: 'string' },
  },
});
if (!values.routen) {
  console.error('Aufruf: node axe-regeln3.mjs --routen datei.json --breite 390|1440 --basis URL [--protokoll basisname]');
  process.exit(2);
}
const basis = basisAdresse(values.basis ?? 'http://127.0.0.1:3400');
const breite = Number(values.breite);
const hoehe = GERAETE[breite]?.hoehe ?? 844;
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const routen = lesePfade(values.routen);

const browser = await starteBrowser();
const ergebnis = [];
try {
  for (const r of routen) {
    const kontext = await neuerKontext(browser, { viewport: { width: breite, height: hoehe }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const seite = await kontext.newPage();
    const http = await oeffne(seite, vollerUrl(basis, r.pfad), { warte: 800 });
    const erg = await new AxeBuilder({ page: seite }).withTags(TAGS).analyze();
    await kontext.close();
    const knotenBeschreibung = (n) => ({
      ziel: n.target.join(' '),
      meldung: (n.failureSummary ?? n.any?.[0]?.message ?? n.none?.[0]?.message ?? '').replace(/\s+/g, ' ').slice(0, 300),
    });
    ergebnis.push({
      name: r.name,
      pfad: r.pfad,
      http,
      verstoesse: erg.violations.map((v) => ({
        id: v.id,
        schwere: v.impact ?? 'unbekannt',
        knoten: v.nodes.length,
        beschreibung: v.help,
        wcag: v.tags.filter((t) => /^wcag\d/.test(t)),
        beispiele: v.nodes.slice(0, 3).map(knotenBeschreibung),
      })),
      unklar: erg.incomplete.map((v) => ({
        id: v.id,
        schwere: v.impact ?? 'unbekannt',
        knoten: v.nodes.length,
        beschreibung: v.help,
        beispiele: v.nodes.slice(0, 6).map(knotenBeschreibung),
      })),
    });
    const z = ergebnis.at(-1);
    console.error(
      `${r.pfad} ${breite}: HTTP ${http} · Verstöße ${z.verstoesse.length} (${z.verstoesse.map((v) => `${v.id}×${v.knoten}`).join(', ') || '–'}) · unklar ${z.unklar.length} (${z.unklar.map((v) => `${v.id}×${v.knoten}`).join(', ') || '–'})`,
    );
  }
} finally {
  await browser.close();
}

const json = { werkzeug: 'axe-regeln3', basis, breite, hoehe, tags: TAGS, zeit: new Date().toISOString(), routen: ergebnis };
const text = `${JSON.stringify(json, null, 2)}\n`;
if (values.protokoll) {
  mkdirSync(dirname(values.protokoll), { recursive: true });
  writeFileSync(`${values.protokoll}.json`, text);
}
process.stdout.write(text);
