// Vergleich neu/alt im selben Ladevorgang (Scratchpad, nur lesen, DOM nur für die Messung umgebaut)
import { starteBrowser, neuerKontext, basisAdresse } from '/home/user/IGMG/_werkstatt/werkzeuge/hilfen.mjs';
const basis = basisAdresse('http://localhost:3200');
const ZEITEN = { tag: '2026-10-12T10:30:00+02:00', abend: '2026-10-12T21:00:00+02:00' };
const SPRACHEN = { de: '/', tr: '/tr', en: '/en' };
const breiten = (process.argv[2] ?? '1440').split(',').map(Number);
const zeitWahl = (process.argv[3] ?? 'abend').split(',');
const sprachWahl = (process.argv[4] ?? 'de').split(',');
const messeLeiste = () => {
  const aside = document.querySelector('aside[aria-label]');
  const breit = aside.firstElementChild;
  const h = () => Math.round(aside.getBoundingClientRect().height);
  const karten = () => [...breit.querySelector('ul').querySelectorAll(':scope > li')];
  const kartenHoehen = () => [...new Set(karten().map((c) => Math.round(c.getBoundingClientRect().height)))];
  const neu = { leiste: h(), links: Math.round(breit.querySelector('.order-1').getBoundingClientRect().width), karten: kartenHoehen(), zeilen: karten().map((c) => c.querySelector('span > span').getClientRects().length) };
  return neu;
};
const umbauAlt = () => {
  const aside = document.querySelector('aside[aria-label]');
  const breit = aside.firstElementChild;
  const block = breit.querySelector('.order-1 div.flex.flex-col.text-16');
  const label = block.querySelector(':scope > span.text-16.text-gruen-100').textContent;
  const grid = block.querySelector(':scope > span.grid.text-20');
  const sichtbar = grid.querySelector('.col-start-1').textContent;
  const namen = [...breit.querySelector('ul').querySelectorAll(':scope > li')].map((li) => li.querySelector('span > span').textContent);
  const uhr = /Uhr$/.test(sichtbar) ? ' Uhr' : '';
  const platz = namen.map((n) => `${label}: ${n} · 88:88${uhr}`);
  grid.className = 'grid font-bold text-weiss';
  grid.innerHTML = '';
  for (const p of platz) { const s = document.createElement('span'); s.className = 'invisible col-start-1 row-start-1'; s.textContent = p; grid.appendChild(s); }
  const v = document.createElement('span'); v.className = 'col-start-1 row-start-1'; v.textContent = `${label}: ${sichtbar}`; grid.appendChild(v);
  block.querySelector(':scope > span.text-16.text-gruen-100').remove();
  // breite Karten wie alt: px-3, Symbol immer sichtbar
  for (const li of karten()) { li.classList.replace('px-2.5', 'px-3'); li.querySelector('svg')?.classList.remove('max-xl:hidden'); }
  function karten() { return [...breit.querySelector('ul').querySelectorAll(':scope > li')]; }
  // Zeitenliste wie alt: Höhe 64, alle Einträge oben, Breite 6rem
  const fig = [...document.querySelectorAll('figure')].find((f) => f.querySelector('svg[role="img"]'));
  return { fig };
};
const messeFigur = (fig) => {
  const ol = fig.querySelector('ol');
  return Math.round(fig.getBoundingClientRect().height);
};
const figurNeu = () => { const fig = [...document.querySelectorAll('figure')].find((f) => f.querySelector('svg[role="img"]')); return { fig: Math.round(fig.getBoundingClientRect().height), zeitenZeilen: [...fig.querySelectorAll('ol > li > span')].map((s) => s.getClientRects().length) }; };
const figurAlt = () => {
  const fig = [...document.querySelectorAll('figure')].find((f) => f.querySelector('svg[role="img"]'));
  const ol = fig.querySelector('ol');
  ol.style.height = '64px';
  for (const li of ol.querySelectorAll(':scope > li')) { li.style.top = '0px'; li.style.maxWidth = '6rem'; }
  return { fig: Math.round(fig.getBoundingClientRect().height), zeitenZeilen: [...fig.querySelectorAll('ol > li > span')].map((s) => s.getClientRects().length) };
};
const browser = await starteBrowser();
const out = [];
try {
  for (const b of breiten) for (const z of zeitWahl) for (const s of sprachWahl) {
    const kontext = await neuerKontext(browser, { viewport: { width: b, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const seite = await kontext.newPage();
    await seite.clock.install({ time: new Date(ZEITEN[z]) });
    await seite.goto(basis + SPRACHEN[s], { waitUntil: 'load', timeout: 60000 });
    await seite.evaluate(() => document.fonts.ready);
    await seite.waitForTimeout(2500);
    const neu = await seite.evaluate(messeLeiste);
    const figN = await seite.evaluate(figurNeu);
    await seite.evaluate(umbauAlt);
    const alt = await seite.evaluate(() => ({ leiste: Math.round(document.querySelector('aside[aria-label]').getBoundingClientRect().height) }));
    const altF = await seite.evaluate(figurAlt);
    out.push({ breite: b, zeit: z, sprache: s, neu: { ...neu, figur: figN.fig, zeitenZeilen: figN.zeitenZeilen }, alt: { leiste: alt.leiste, figur: altF.fig } });
    await kontext.close();
  }
} finally { await browser.close(); }
for (const o of out) console.log(JSON.stringify(o));
