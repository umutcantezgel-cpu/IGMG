#!/usr/bin/env node
// axe (WCAG 2.2 AA) auf allen Lern-App-Routen in de/tr/ar × 390/1440 px (KERN 4.0 §8, ABNAHME Z-L06; L8-02). Kopie und
// Anpassung von _gemeinde/werkzeuge/a11y.mjs (dort unverändert):
// - Fehlerseiten auch der Lern-App erkennen (Titel aus messages/lernapp/*.json); eine Fehlerseite statt Inhalt zählt als
//   FEHLER, nicht als 0/0 – außer bei Routen mit `fehlerseite: true`.
// - Client-Inhalt abwarten (`warte`: Selektor der geladenen Insel), Übergänge auslaufen lassen (wie tests/e2e/lernapp/hilfen.ts),
//   optional `antworten`: erste Option wählen und prüfen (Rückmeldeblatt im Prüfumfang).
// - Anmeldung je Route (`zustand`, storageState); POST außerhalb von /_next/ wird dann abgebrochen (nur lesend).
// Aufruf: node a11y.mjs --routen <datei.json> [--breiten 390,1440] [--aus name]
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { BASIS, fehlerseite, fehlerTitel, last, schreibe, starteBrowser } from './gemeinsam.mjs';

const { values } = parseArgs({
  options: {
    routen: { type: 'string' },
    breiten: { type: 'string', default: '390,1440' },
    aus: { type: 'string', default: 'a11y' },
  },
});
const routen = JSON.parse(readFileSync(values.routen, 'utf8'));
const breiten = values.breiten.split(',').map(Number);
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const SCHWEREN = ['critical', 'serious', 'moderate', 'minor'];
const TITEL = fehlerTitel();

const browser = await starteBrowser();
const ergebnis = [];
const lastBeginn = last();
try {
  for (const route of routen)
    for (const breite of breiten) {
      const hoehe = breite >= 1440 ? 900 : 844;
      const kontext = await browser.newContext({
        viewport: { width: breite, height: hoehe },
        reducedMotion: 'no-preference',
        ...(route.zustand ? { storageState: route.zustand } : {}),
      });
      const seite = await kontext.newPage();
      if (route.zustand)
        await seite.route('**/*', (r) => (r.request().method() === 'POST' && !r.request().url().includes('/_next/') ? r.abort() : r.continue()));
      let status = 0;
      let hinweis = '';
      try {
        const antwort = await seite.goto(`${BASIS}${route.pfad}`, { waitUntil: 'load', timeout: 60_000 });
        status = antwort?.status() ?? 0;
        await seite.evaluate(() => document.fonts.ready);
        if (route.warte) await seite.waitForSelector(route.warte, { timeout: 30_000 }).catch(() => (hinweis = `Warten auf ${route.warte} ohne Erfolg`));
        if (route.antworten) {
          await seite.locator('main label').filter({ has: seite.locator('input[type="radio"]') }).first().click();
          await seite.locator('main form button[type="submit"]').last().click();
          await seite.waitForSelector('main p[role="status"].sr-only:not(:empty)', { timeout: 15_000 });
        }
        await seite.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
        await seite.waitForFunction(
          () => document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
          undefined,
          { timeout: 10_000 },
        );
      } catch (e) {
        hinweis = `${hinweis} ${String(e.message ?? e).split('\n')[0]}`.trim();
      }
      const fehlerart = (await fehlerseite(seite, TITEL).catch(() => null)) ?? (status >= 400 || status === 0 ? `HTTP ${status}` : null);
      if (fehlerart && !route.fehlerseite) {
        await kontext.close();
        ergebnis.push({ name: route.name, pfad: route.pfad, breite, http: status, fehler: fehlerart, hinweis });
        console.log(`${route.pfad} ${breite}px: FEHLER ${fehlerart} statt Inhalt`);
        continue;
      }
      const ueberlauf = await seite.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const dir = await seite.evaluate(() => document.documentElement.dir || 'ltr');
      const erg = await new AxeBuilder({ page: seite }).withTags(TAGS).analyze();
      await kontext.close();
      const anzahl = Object.fromEntries(SCHWEREN.map((s) => [s, 0]));
      const regeln = erg.violations.map((v) => {
        if (SCHWEREN.includes(v.impact)) anzahl[v.impact] += 1;
        return {
          id: v.id,
          schwere: v.impact ?? 'unbekannt',
          beschreibung: v.help,
          stellen: v.nodes.length,
          beispiele: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
        };
      });
      ergebnis.push({ name: route.name, pfad: route.pfad, breite, http: status, dir, ueberlauf, anzahl, unklar: erg.incomplete.length, regeln, hinweis });
      console.log(
        `${route.pfad} ${breite}px: kritisch ${anzahl.critical} · ernst ${anzahl.serious} · mittel ${anzahl.moderate} · gering ${anzahl.minor} · Überlauf ${ueberlauf}${hinweis ? ` · ${hinweis}` : ''}`,
      );
    }
} finally {
  await browser.close();
}
const lastEnde = last();
const ernst = ergebnis.filter((e) => !e.fehler && e.anzahl.critical + e.anzahl.serious > 0);
const fehler = ergebnis.filter((e) => e.fehler);
const md = [
  `# axe (WCAG 2.2 AA) · ${BASIS} · Breiten ${breiten.join(', ')} px`,
  '',
  `Prüfungen: ${ergebnis.length} (Routen × Breiten). Ernst/kritisch: ${ernst.length} Prüfungen mit Befund. Fehlerseite statt Inhalt: ${fehler.length}. Last: Beginn ${lastBeginn.l1}, Ende ${lastEnde.l1}.`,
  '',
  '| Route | Breite | dir | kritisch | ernst | mittel | gering | Überlauf px |',
  '|---|---|---|---|---|---|---|---|',
  ...ergebnis.map((e) =>
    e.fehler
      ? `| ${e.pfad} | ${e.breite} | – | **FEHLER: ${e.fehler}** | – | – | – | – |`
      : `| ${e.pfad}${e.name.includes('nach der Antwort') ? ' (nach der Antwort)' : ''} | ${e.breite} | ${e.dir} | ${e.anzahl.critical} | ${e.anzahl.serious} | ${e.anzahl.moderate} | ${e.anzahl.minor} | ${e.ueberlauf} |`,
  ),
  '',
  ...ergebnis
    .filter((e) => !e.fehler && e.regeln.length)
    .flatMap((e) => [`## ${e.pfad} (${e.breite} px)`, '', ...e.regeln.map((r) => `- **${r.schwere}** \`${r.id}\` (${r.stellen}): ${r.beispiele.join(' ; ')}`), '']),
].join('\n');
schreibe(`${values.aus}.md`, md);
schreibe(`${values.aus}.json`, { basis: BASIS, breiten, tags: TAGS, last: { beginn: lastBeginn, ende: lastEnde }, ergebnis });
console.log(`axe: ${ergebnis.length} Prüfungen, ernst/kritisch in ${ernst.length}, Fehlerseiten ${fehler.length}`);
