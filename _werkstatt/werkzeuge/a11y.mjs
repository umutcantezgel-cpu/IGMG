#!/usr/bin/env node
// Prüfwerkzeug c: automatische Zugänglichkeitsprüfung (axe-core) nach WCAG 2.2 AA je Route.
// Tags: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa. Zählung je Route nach Schwere (critical, serious, moderate, minor).
// Aufruf: node a11y.mjs --routen datei.json [--breite 390|768|1440] [--basis URL] [--warte ms] [--zustand storageState.json] [--protokoll basisname]
// Beispiel: node a11y.mjs --routen routen-hauptansichten.json --breite 1440
// Befunde sind Daten, kein Fehlerabbruch: Exit-Code 0, außer bei technischen Fehlern.
import AxeBuilder from '@axe-core/playwright';
import { parseArgs } from 'node:util';
import {
  basisAdresse,
  hilfeAusgeben,
  lesePfade,
  neuerKontext,
  oeffne,
  schreibeProtokoll,
  standardProtokoll,
  starteBrowser,
  vollerUrl,
} from './hilfen.mjs';

const HILFE = `Aufruf: node a11y.mjs --routen datei.json [--breite 390|768|1440] [--basis URL] [--warte ms] [--zustand storageState.json] [--protokoll basisname]
Beispiel: node a11y.mjs --routen routen-hauptansichten.json --breite 1440`;

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const SCHWEREN = ['critical', 'serious', 'moderate', 'minor'];

const { values } = parseArgs({
  options: {
    routen: { type: 'string' },
    breite: { type: 'string', default: '390' },
    basis: { type: 'string' },
    warte: { type: 'string', default: '800' },
    zustand: { type: 'string' },
    protokoll: { type: 'string' },
    hilfe: { type: 'boolean', short: 'h', default: false },
  },
});
if (values.hilfe || !values.routen) hilfeAusgeben(HILFE);

const basis = basisAdresse(values.basis);
const breite = Number(values.breite);
const hoehe = breite === 1440 ? 900 : breite === 768 ? 1024 : 844;
const routen = lesePfade(values.routen);
const zeit = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');

const browser = await starteBrowser();
const ergebnis = [];
try {
  for (const route of routen) {
    const kontext = await neuerKontext(browser, { viewport: { width: breite, height: hoehe }, reducedMotion: 'no-preference', ...(values.zustand ? { storageState: values.zustand } : {}) });
    const seite = await kontext.newPage();
    // Mit Anmeldestand nur lesend: POST außerhalb von /_next/ wird abgebrochen
    if (values.zustand) await seite.route('**/*', (r) => (r.request().method() === 'POST' && !r.request().url().includes('/_next/') ? r.abort() : r.continue()));
    const status = await oeffne(seite, vollerUrl(basis, route.pfad), { warte: Number(values.warte) });
    const erg = await new AxeBuilder({ page: seite }).withTags(TAGS).analyze();
    await kontext.close();
    const anzahl = Object.fromEntries(SCHWEREN.map((s) => [s, 0]));
    anzahl.unbekannt = 0;
    const regeln = erg.violations.map((v) => {
      const schwere = SCHWEREN.includes(v.impact) ? v.impact : 'unbekannt';
      anzahl[schwere] += 1;
      return {
        id: v.id,
        schwere: v.impact ?? 'unbekannt',
        beschreibung: v.help,
        wcag: v.tags.filter((t) => /^wcag\d/.test(t)),
        hilfe: v.helpUrl,
        knoten: v.nodes.length,
        beispiele: v.nodes.slice(0, 3).map((n) => ({ ziel: n.target.join(' '), zusammenfassung: (n.failureSummary ?? '').split('\n').slice(0, 2).join(' ') })),
      };
    });
    regeln.sort((a, b) => SCHWEREN.indexOf(a.schwere) - SCHWEREN.indexOf(b.schwere));
    ergebnis.push({ name: route.name, pfad: route.pfad, http: status, anzahl, unklar: erg.incomplete.length, regeln });
    const summe = SCHWEREN.reduce((s, k) => s + anzahl[k], 0);
    console.log(
      `${route.pfad}: HTTP ${status} · kritisch ${anzahl.critical} · ernst ${anzahl.serious} · mittel ${anzahl.moderate} · gering ${anzahl.minor} · Regeln ${summe} · unklar ${erg.incomplete.length}`,
    );
  }
} finally {
  await browser.close();
}

const md = [
  `# Zugänglichkeitsprüfung (axe, WCAG 2.2 AA) · ${zeit} · ${basis} · ${breite}×${hoehe}`,
  '',
  `Prüfumfang: ${TAGS.join(', ')}. Zahlen = Anzahl verletzter Regeln je Schwere (nicht Anzahl der Stellen). „unklar“ = von axe nicht eindeutig entschieden.`,
  '',
  '| Route | HTTP | kritisch | ernst | mittel | gering | unklar |',
  '|---|---|---|---|---|---|---|',
  ...ergebnis.map((e) => `| ${e.pfad} | ${e.http} | ${e.anzahl.critical} | ${e.anzahl.serious} | ${e.anzahl.moderate} | ${e.anzahl.minor} | ${e.unklar} |`),
  '',
  ...ergebnis.flatMap((e) =>
    e.regeln.length
      ? [
          `## ${e.pfad}`,
          '',
          ...e.regeln.flatMap((r) => [
            `- **${r.schwere}** \`${r.id}\` – ${r.beschreibung} (${r.knoten} Stelle${r.knoten === 1 ? '' : 'n'}, ${r.wcag.join(', ')})`,
            ...r.beispiele.map((b) => `  - ${b.ziel}`),
          ]),
          '',
        ]
      : [`## ${e.pfad}`, '', 'Keine Verletzungen.', ''],
  ),
].join('\n');
const protokoll = values.protokoll ?? standardProtokoll('a11y');
const dateien = schreibeProtokoll(protokoll, { json: { werkzeug: 'a11y', zeit, basis, breite, tags: TAGS, routen: ergebnis }, md });
console.log(`Protokoll: ${dateien.join(', ')}`);
