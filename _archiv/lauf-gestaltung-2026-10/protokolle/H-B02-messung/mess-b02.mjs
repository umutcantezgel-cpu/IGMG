// Messung H-B02 (Scratchpad, nur lesen): Zeitenliste, Tagesbogen-Punkte, Leiste je Zeit, Breite und Sprache.
import { starteBrowser, neuerKontext, basisAdresse } from '/home/user/IGMG/_werkstatt/werkzeuge/hilfen.mjs';

const basis = basisAdresse('http://localhost:3200');
const ZEITEN = {
  nacht: '2026-10-12T00:30:00+02:00',
  tag: '2026-10-12T10:30:00+02:00',
  abend: '2026-10-12T21:00:00+02:00',
};
const SPRACHEN = { de: '/', tr: '/tr', en: '/en' };
const args = process.argv.slice(2);
const breiten = (args[0] ?? '1440').split(',').map(Number);
const zeitWahl = (args[1] ?? 'tag,abend').split(',');
const sprachWahl = (args[2] ?? 'de').split(',');
const ergebnisse = [];

// In der Seite: alles messen, was H-B02 betrifft
const messe = () => {
  const r = (el) => (el ? el.getBoundingClientRect() : null);
  const out = {};
  const fig = [...document.querySelectorAll('figure')].find((f) => f.querySelector('svg[role="img"]'));
  if (fig) {
    const box = r(fig);
    out.figHoehe = Math.round(box.height);
    const ol = fig.querySelector('ol');
    const lis = [...ol.querySelectorAll(':scope > li')];
    const container = fig.querySelector('div.relative');
    const cb = r(container);
    out.zeitenAbstand = [];
    const rects = lis.map((li) => {
      const b = r(li);
      const pct = parseFloat(li.style.getPropertyValue('--links'));
      const erwartet = cb.left + (pct / 100) * cb.width;
      return {
        name: li.querySelector('span')?.textContent,
        l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height,
        mitte: b.left + b.width / 2, erwartet,
        ueberNameZeilen: li.querySelector('span')?.getClientRects().length,
        nameHoehe: li.querySelector('span')?.getBoundingClientRect().height,
      };
    });
    out.olHoehe = Math.round(r(ol).height);
    out.li = rects.map((x) => ({ n: x.name, mitteAbweichung: +(x.mitte - x.erwartet).toFixed(1), t: Math.round(x.t - cb.top), b: Math.round(x.b - cb.top), w: Math.round(x.w), nameHoehe: Math.round(x.nameHoehe) }));
    let minH = Infinity, minV = Infinity, kollision = false;
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j];
      const vOv = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      const hOv = Math.min(a.r, b.r) - Math.max(a.l, b.l);
      if (vOv > 0 && hOv > 0) kollision = true;
      if (vOv > 0) minH = Math.min(minH, hOv < 0 ? -hOv : (Math.max(a.l, b.l) - Math.min(a.r, b.r)));
      if (hOv > 0) minV = Math.min(minV, vOv < 0 ? -vOv : (Math.max(a.t, b.t) - Math.min(a.b, b.b)));
    }
    out.kollision = kollision;
    out.paare = [];
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j];
      const vOv = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      const hOv = Math.min(a.r, b.r) - Math.max(a.l, b.l);
      if (vOv > 0 || hOv > 0) {
        const gap = vOv > 0 ? Math.max(a.l, b.l) - Math.min(a.r, b.r) : Math.max(a.t, b.t) - Math.min(a.b, b.b);
        if (gap < 16) out.paare.push([a.name, b.name, Math.round(gap)]);
      }
    }
    out.minHorizontalLuecke = minH === Infinity ? null : Math.round(minH);
    out.minVertikalLuecke = minV === Infinity ? null : Math.round(minV);
    // Zeilenbrüche innerhalb der Namen (Mitte eines Wortes?)
    window.brueche = (el) => {
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node, prevTop = null, sawSpace = false, mitten = 0, zeilen = new Set();
      while ((node = w.nextNode())) {
        for (let i = 0; i < node.length; i++) {
          const ch = node.data[i];
          if (/\s/.test(ch)) { sawSpace = true; continue; }
          const rg = document.createRange(); rg.setStart(node, i); rg.setEnd(node, i + 1);
          const rc = rg.getClientRects()[0];
          if (!rc) continue;
          const top = Math.round(rc.top);
          zeilen.add(top);
          if (prevTop !== null && Math.abs(top - prevTop) > 4 && !sawSpace) mitten++;
          prevTop = top; sawSpace = false;
        }
      }
      return { zeilen: zeilen.size, mitten };
    };
    out.namenZeilen = lis.map((li) => window.brueche(li.querySelector('span')));
    out.mehrzeilig = lis.map((li) => li.querySelector('span').textContent).filter((_, i) => out.namenZeilen[i].zeilen > 1);
    out.punkteErreicht = fig.querySelectorAll('.bogen-punkt-erreicht').length;
    out.punkteHohl = fig.querySelectorAll('span.size-3.rounded-pill').length - out.punkteErreicht;
    out.sterne = fig.querySelectorAll('span.size-9').length;
    out.sterneBlendet = fig.querySelectorAll('span.size-9.blendet-ein').length;
    out.sterneTritt = fig.querySelectorAll('span.size-9.marke-tritt-hervor').length;
    out.sonne = fig.querySelectorAll('span.size-4.rounded-pill').length;
    out.enthuellt = fig.querySelectorAll('.bogen-enthuellt').length;
    const stern = fig.querySelector('span.size-9');
    if (stern && cb) {
      const sb = r(stern);
      out.sternX = Math.round(((sb.left + sb.width / 2) - cb.left) / cb.width * 640);
    }
  }
  const aside = document.querySelector('aside[aria-label]');
  if (aside) {
    const breit = aside.firstElementChild;
    const bb = breit.getBoundingClientRect();
    const sichtbar = getComputedStyle(breit).display !== 'none';
    out.leisteHoehe = Math.round(aside.getBoundingClientRect().height);
    if (sichtbar) {
      const links = breit.querySelector('.order-1');
      out.leisteLinksBreite = Math.round(links.getBoundingClientRect().width);
      const ul = breit.querySelector('ul');
      const cards = [...ul.querySelectorAll(':scope > li')];
      out.leisteKartenHoehen = [...new Set(cards.map((c) => Math.round(c.getBoundingClientRect().height)))];
      out.leisteKartenNamenZeilen = cards.map((c) => window.brueche(c.querySelector('span')));
      out.leisteIconSichtbar = cards.map((c) => getComputedStyle(c.querySelector('svg')).display !== 'none');
      const nachst = breit.querySelector('.order-1 span.text-20');
      out.leisteNaechstesText = nachst ? nachst.textContent : null;
      out.leisteNaechstesZeilen = nachst ? nachst.getClientRects().length : null;
      out.leisteNaechstesLabel = breit.querySelector('.order-1 span.text-16.text-gruen-100')?.textContent ?? null;
      out.leisteNaechstesBreite = nachst ? Math.round(nachst.getBoundingClientRect().width) : null;
      out.leisteSichtbareBreite = Math.round(bb.width);
    }
  }
  out.seitenBreite = document.documentElement.scrollWidth;
  out.fensterBreite = window.innerWidth;
  return out;
};

const browser = await starteBrowser();
try {
  for (const b of breiten) for (const z of zeitWahl) for (const s of sprachWahl) {
    const kontext = await neuerKontext(browser, { viewport: { width: b, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const seite = await kontext.newPage();
    await seite.clock.install({ time: new Date(ZEITEN[z]) });
    const url = basis + SPRACHEN[s];
    await seite.goto(url, { waitUntil: 'load', timeout: 60000 });
    await seite.evaluate(() => document.fonts.ready);
    await seite.waitForTimeout(2500);
    const m = await seite.evaluate(messe);
    ergebnisse.push({ breite: b, zeit: z, sprache: s, ...m });
    await kontext.close();
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify(ergebnisse, null, 1));
