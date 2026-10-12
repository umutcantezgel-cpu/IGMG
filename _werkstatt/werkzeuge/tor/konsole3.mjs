// E3-TOR-PRUEFER: Konsole je Route bei 390×844 (ein Ladevorgang, 2,5 s warten). Erfasst Konsolenfehler und -warnungen,
// Seitenfehler (pageerror), fehlgeschlagene Anfragen (requestfailed) und jede Antwort mit HTTP ≥ 400 (Seite und Ressourcen).
// Aufruf: BASIS=URL node konsole3.mjs --routen datei.json [--protokoll basisname]. Ausgabe: JSON auf stdout.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { basisAdresse, lesePfade, neuerKontext, oeffne, starteBrowser, vollerUrl } from '/home/user/IGMG/_werkstatt/werkzeuge/hilfen.mjs';

const { values } = parseArgs({ options: { routen: { type: 'string' }, basis: { type: 'string' }, protokoll: { type: 'string' } } });
const BASIS = basisAdresse(values.basis ?? process.env.BASIS ?? 'http://127.0.0.1:3400');
const routen = lesePfade(values.routen);

const browser = await starteBrowser();
const ausgabe = [];
try {
  for (const r of routen) {
    const kontext = await neuerKontext(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const seite = await kontext.newPage();
    const meldungen = [];
    seite.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') {
        meldungen.push({ art: `konsole-${m.type()}`, text: m.text().slice(0, 300), ort: m.location()?.url ?? '' });
      }
    });
    seite.on('pageerror', (e) => meldungen.push({ art: 'seitenfehler', text: String(e.message ?? e).slice(0, 300), ort: '' }));
    seite.on('requestfailed', (q) => meldungen.push({ art: 'anfrage-fehlgeschlagen', text: q.failure()?.errorText ?? '', ort: q.url() }));
    seite.on('response', (a) => {
      if (a.status() >= 400) meldungen.push({ art: `http-${a.status()}`, text: a.request().method(), ort: a.url() });
    });
    const status = await oeffne(seite, vollerUrl(BASIS, r.pfad), { warte: 2500 });
    await kontext.close();
    ausgabe.push({ name: r.name, pfad: r.pfad, http: status, anzahl: meldungen.length, meldungen });
    console.error(`${r.pfad}: HTTP ${status} · Meldungen ${meldungen.length}`);
  }
} finally {
  await browser.close();
}
const json = { werkzeug: 'konsole3', basis: BASIS, breite: 390, zeit: new Date().toISOString(), ergebnis: ausgabe };
const text = `${JSON.stringify(json, null, 2)}\n`;
if (values.protokoll) {
  mkdirSync(dirname(values.protokoll), { recursive: true });
  writeFileSync(`${values.protokoll}.json`, text);
}
process.stdout.write(text);
