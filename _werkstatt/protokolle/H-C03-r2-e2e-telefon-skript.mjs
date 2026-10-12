// Scratchpad: spiegelt den geänderten Telefon-Zweig aus tests/e2e/veranstaltungen.spec.ts (390 px, Dev-Server 3200)
import { readFileSync } from 'node:fs';
import { starteBrowser, neuerKontext, basisAdresse, vollerUrl } from '/home/user/IGMG/_werkstatt/werkzeuge/hilfen.mjs';
const de = JSON.parse(readFileSync('/home/user/IGMG/web/messages/de.json', 'utf8'));
const k = de.karten;
const kategorien = [k.kat_gebet, k.kat_bildung, k.kat_gemeinde, k.kat_kultur, k.kat_jugend, k.kat_frauen];
const SCHL = ['gebet', 'bildung', 'gemeinde', 'kultur', 'jugend', 'frauen'];
const browser = await starteBrowser();
const kontext = await neuerKontext(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'de-DE' });
const p = await kontext.newPage();
await p.goto(vollerUrl(basisAdresse('http://localhost:3200'), '/veranstaltungen'));
const karten = p.getByRole('article');
await karten.first().waitFor({ state: 'visible' });
const gesamt = await karten.count();
const filterKnopf = (name) => p.getByRole('group', { name: de.veranstaltungen.kategorie, exact: true }).getByRole('button', { name, exact: true });
let gewaehlt;
let idx = -1;
for (let i = 0; i < kategorien.length; i++) {
  await filterKnopf(kategorien[i]).click();
  const n = await karten.count();
  if (n >= 1 && n < gesamt) {
    gewaehlt = kategorien[i];
    idx = i;
    break;
  }
}
console.log('gesamt', gesamt, 'gewaehlt', gewaehlt, 'sichtbar', await karten.count());
const erwartet = SCHL[idx];
const liKategorien = [];
for (const karte of await karten.all()) {
  liKategorien.push(await karte.locator('xpath=ancestor::li[1]').getAttribute('data-kategorie'));
}
console.log('data-kategorie der umschliessenden li:', JSON.stringify(liKategorien), 'erwartet', erwartet, 'alle gleich:', liKategorien.every((x) => x === erwartet));
let etikett = 0;
for (const karte of await karten.all()) etikett += await karte.getByText(gewaehlt, { exact: true }).count();
console.log('Etikett-Treffer im Telefon (Kompaktzeilen ohne Etikett erwartet 0):', etikett);
await browser.close();
