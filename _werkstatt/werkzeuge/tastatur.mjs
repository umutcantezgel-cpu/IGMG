#!/usr/bin/env node
// Prüfwerkzeug Z-07: Tastaturdurchlauf mit sichtbarem Fokus. Je Route: Sprunglink (erstes Tab-Ziel, Enter, Fokus im
// Inhalt), danach Tab bis --max-tabs je Fokusziel: Sichtbarkeit, Lage im Viewport, Fokusindikator (Vergleich der
// Stile im Fokuszustand mit dem Zustand nach blur(); geprüft werden Element, Elternteil, ::before und ::after), Falle.
// Bei 390 px zusätzlich der Menü-Knopf im Kopf (Enter öffnet, Escape schließt, Fokus zurück). Mit --aufgaben die
// Hauptaufgaben nach KERN K-002: a) Gebetszeit, b) Veranstaltung mit Anmeldeformular, c) Kurs-Voranmeldung,
// d) Kontakt, e) Suche (Zusatz). Nichts wird abgeschickt: POST-Anfragen werden abgefangen und gezählt, jede ist ein
// Werkzeugfehler. Befunde sind Daten (Exit 0). Exit 1 bei technischem Fehler, HTTP-Fehler einer Route oder POST.
// Aufruf: node tastatur.mjs --routen datei.json [--breite 390|768|1440] [--basis URL] [--max-tabs 60] [--aufgaben] [--bilder ordner] [--protokoll basisname]
// Beispiel: node tastatur.mjs --routen routen-hauptansichten.json --breite 390 --aufgaben
import { mkdirSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
  basisAdresse,
  GERAETE,
  hilfeAusgeben,
  lesePfade,
  neuerKontext,
  oeffne,
  schreibeProtokoll,
  standardProtokoll,
  starteBrowser,
  vollerUrl,
} from './hilfen.mjs';

const HILFE = `Aufruf: node tastatur.mjs --routen datei.json [--breite 390|768|1440] [--basis URL] [--max-tabs 60] [--aufgaben] [--bilder ordner] [--protokoll basisname]
Beispiel: node tastatur.mjs --routen routen-hauptansichten.json --breite 390 --aufgaben`;

const { values } = parseArgs({
  options: {
    routen: { type: 'string' },
    breite: { type: 'string', default: '390' },
    basis: { type: 'string' },
    'max-tabs': { type: 'string', default: '60' },
    aufgaben: { type: 'boolean', default: false },
    bilder: { type: 'string' },
    protokoll: { type: 'string' },
    hilfe: { type: 'boolean', short: 'h', default: false },
  },
});
if (values.hilfe || !values.routen) hilfeAusgeben(HILFE);

const basis = basisAdresse(values.basis);
const breite = Number(values.breite);
const geraet = GERAETE[breite];
const maxTabs = Number(values['max-tabs']);
if (!geraet || !Number.isInteger(maxTabs) || maxTabs < 1) {
  console.error(`Ungültige Werte: --breite ${values.breite} (390, 768 oder 1440), --max-tabs ${values['max-tabs']}.\n${HILFE}`);
  process.exit(1);
}
// Für die Hauptaufgaben mindestens 150 Tabs: der Weg vom Seitenanfang über Kopf und Leiste zum Formular ist lang.
const aufgabenTabs = Math.max(maxTabs, 150);
const routen = lesePfade(values.routen);
const zeit = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');

/** Läuft in der Seite (addInitScript): Hilfen für Fokus, Name, Sichtbarkeit und den Fokusvergleich. Stellt window.__tast bereit. */
function fokusHelfer() {
  const STIL = ['outline-style', 'outline-width', 'outline-color', 'box-shadow', 'border-color', 'background-color', 'text-decoration-line'];
  const ROLLEN = { checkbox: 'checkbox', radio: 'radio', submit: 'button', button: 'button', reset: 'button', image: 'button', file: 'button', color: 'button', range: 'slider', search: 'searchbox', number: 'spinbutton' };
  const KLASSEN = ['el', 'eltern', 'vor', 'nach'];
  const ids = new WeakMap();
  let zaehler = 0;
  const norm = (s) => (s ?? '').replace(/\s+/g, ' ').trim();

  // Wartet auf endliche Animationen von Element und Elternteil (Übergänge des Fokusrings), höchstens 700 ms.
  const ruhe = (el) => {
    const warten = document
      .getAnimations()
      .filter((a) => {
        const ziel = a.effect?.target;
        if (!ziel || (ziel !== el && ziel !== el.parentElement)) return false;
        return a.effect.getComputedTiming?.().iterations !== Infinity;
      })
      .map((a) => a.finished.catch(() => undefined));
    return Promise.race([Promise.all(warten), new Promise((r) => setTimeout(r, 700))]);
  };

  // Sichtbar: Größe über 1 px (sr-only-Elemente sind 1 px), keine unsichtbaren Vorfahren, nicht vollständig abgeschnitten.
  const sichtbar = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false;
    if (typeof el.checkVisibility === 'function' && !el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) return false;
    for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (/hidden|clip|auto|scroll/.test(`${s.overflowX} ${s.overflowY}`)) {
        const q = p.getBoundingClientRect();
        const ix = Math.min(r.right, q.right) - Math.max(r.left, q.left);
        const iy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
        if (ix <= 0 || iy <= 0) return false;
      }
    }
    return true;
  };

  const imViewport = (r) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  const stil = (el, pseudo) => {
    const s = getComputedStyle(el, pseudo ?? null);
    return Object.fromEntries(STIL.map((p) => [p, s.getPropertyValue(p)]));
  };
  const hatKasten = (el, pseudo) => {
    const c = getComputedStyle(el, pseudo).content;
    return c !== 'none' && c !== 'normal';
  };
  const messe = (el) => ({
    el: stil(el),
    eltern: el.parentElement ? stil(el.parentElement) : null,
    vor: hatKasten(el, '::before') ? stil(el, '::before') : null,
    nach: hatKasten(el, '::after') ? stil(el, '::after') : null,
  });

  // Fokusindikator: Stile im Fokuszustand gegen den Zustand nach blur(). Stark ist ein Wechsel, wenn im Fokuszustand
  // der Umriss sichtbar ist (style auto oder Breite ab 2 px), ein Schatten gesetzt ist, oder Hintergrund/Rahmen wechseln.
  const pruefe = async (el) => {
    await ruhe(el);
    const fokus = messe(el);
    el.blur();
    await ruhe(el);
    const blur = messe(el);
    el.focus({ preventScroll: true });
    const treffer = [];
    let quelle = null;
    for (const k of KLASSEN) {
      const f = fokus[k];
      const b = blur[k];
      if (!f || !b) continue;
      const diff = STIL.filter((p) => f[p] !== b[p]);
      if (!diff.length) continue;
      const umriss = f['outline-style'] !== 'none' && (f['outline-style'] === 'auto' || parseFloat(f['outline-width']) >= 2);
      const stark = umriss || f['box-shadow'] !== 'none' || diff.includes('background-color') || diff.includes('border-color');
      treffer.push({ klasse: k, diff, stark });
      if (stark && !quelle) quelle = k;
    }
    return { quelle, treffer, fokus: fokus.el, blur: blur.el, wiederhergestellt: document.activeElement === el };
  };

  const T = {};
  T.id = (el) => {
    if (!el) return null;
    if (!ids.has(el)) ids.set(el, ++zaehler);
    return ids.get(el);
  };
  T.name = (el) => {
    const al = norm(el.getAttribute('aria-label'));
    if (al) return al.slice(0, 60);
    const lb = el.getAttribute('aria-labelledby');
    if (lb) {
      const t = norm(lb.split(/\s+/).map((i) => document.getElementById(i)?.innerText ?? '').join(' '));
      if (t) return t.slice(0, 60);
    }
    let t = norm(el.innerText);
    if (!t && el.labels?.length) t = norm(el.labels[0].innerText);
    if (!t && el.tagName === 'INPUT' && ['submit', 'button', 'reset'].includes(el.type)) t = norm(el.value);
    if (!t) t = norm(el.getAttribute('title') || el.getAttribute('placeholder') || el.getAttribute('alt') || el.querySelector('img[alt]')?.getAttribute('alt') || '');
    return t.slice(0, 60);
  };
  T.rolle = (el) => {
    const r = el.getAttribute('role');
    if (r) return r.split(/\s+/)[0];
    switch (el.tagName) {
      case 'A':
        return el.hasAttribute('href') ? 'link' : null;
      case 'BUTTON':
        return 'button';
      case 'SELECT':
        return el.multiple || el.size > 1 ? 'listbox' : 'combobox';
      case 'TEXTAREA':
        return 'textbox';
      case 'INPUT':
        return ROLLEN[el.type] ?? 'textbox';
      case 'SUMMARY':
        return 'button';
      default:
        return null;
    }
  };
  T.istSende = (el) => {
    if (el.tagName === 'BUTTON') return (el.getAttribute('type') ?? 'submit').toLowerCase() === 'submit';
    return el.tagName === 'INPUT' && el.type === 'submit';
  };
  T.inMain = () => {
    const m = document.querySelector('main#inhalt');
    const a = document.activeElement;
    return Boolean(m && a && (m === a || m.contains(a)));
  };
  T.sichtbar = sichtbar;
  T.pruefe = pruefe;
  T.pruefeAktiv = async () => {
    const el = document.activeElement;
    if (!el || el === document.body || el === document.documentElement) return { ende: true };
    const istSichtbar = sichtbar(el);
    let r = el.getBoundingClientRect();
    let imVp = imViewport(r);
    if (!imVp && istSichtbar) {
      await new Promise((res) => setTimeout(res, 500));
      r = el.getBoundingClientRect();
      imVp = imViewport(r);
    }
    let verdeckt = null;
    if (imVp && istSichtbar) {
      const x = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
      const y = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
      const oben = document.elementFromPoint(x, y);
      verdeckt = Boolean(oben) && oben !== el && !el.contains(oben) && !oben.contains(el);
    }
    const href = el.getAttribute('href');
    const sprungKandidat = el.tagName === 'A' && href !== null && (href.endsWith('#inhalt') || (href.startsWith('#') && document.getElementById(href.slice(1))?.tagName === 'MAIN'));
    const fokusSichtbar = el.matches(':focus-visible');
    const pruefung = await pruefe(el);
    return {
      ende: false,
      id: T.id(el),
      tag: el.tagName.toLowerCase(),
      rolle: T.rolle(el),
      name: T.name(el),
      href: href === null ? null : href.slice(0, 120),
      sprungKandidat,
      sichtbar: istSichtbar,
      imViewport: imVp,
      verdeckt,
      fokusSichtbar,
      dialog: Boolean(document.querySelector('dialog[open]')),
      typ: el.tagName === 'INPUT' ? el.type : null,
      rect: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
      zustand: { expanded: el.getAttribute('aria-expanded'), pressed: el.getAttribute('aria-pressed'), selected: el.getAttribute('aria-selected'), current: el.getAttribute('aria-current') },
      pruefung,
    };
  };
  window.__tast = T;
}

/** Prädikate für die Aufgaben: laufen in der Seite und prüfen das aktive Element. */
const PRAED = {
  gebet: () => {
    const el = document.activeElement;
    try {
      return el?.tagName === 'A' && /\/gebetszeiten\/?$/.test(new URL(el.href).pathname);
    } catch {
      return false;
    }
  },
  karte: () => {
    const el = document.activeElement;
    try {
      return el?.tagName === 'A' && Boolean(el.closest('main')) && /\/veranstaltungen\/[^/]+\/?$/.test(new URL(el.href).pathname);
    } catch {
      return false;
    }
  },
  kurs: () => {
    const el = document.activeElement;
    return el?.tagName === 'A' && (el.getAttribute('href') ?? '').includes('/bildung/voranmeldung');
  },
  feld: () => {
    const el = document.activeElement;
    if (!el || el.disabled) return false;
    const textfeld = el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && !['hidden', 'checkbox', 'radio', 'submit', 'button', 'reset', 'image', 'file', 'range', 'color'].includes(el.type));
    if (!textfeld || !el.form || !el.closest('main') || el.form.matches('[role=search]')) return false;
    window.__tast.form = el.form;
    return true;
  },
  weiter: () => {
    const el = document.activeElement;
    if (!el || el.form !== window.__tast.form) return false;
    return window.__tast.istSende(el) || /weiter|senden|absenden|anmelden|next/i.test(window.__tast.name(el));
  },
  knopfFeld: () => {
    const el = document.activeElement;
    return Boolean(el && el.form === window.__tast.form && window.__tast.istSende(el));
  },
  knopfMain: () => {
    const el = document.activeElement;
    return Boolean(el && el.form && el.form.closest('main') && !el.form.matches('[role=search]') && window.__tast.istSende(el));
  },
  suche: () => {
    const el = document.activeElement;
    return Boolean(el && el.tagName === 'INPUT' && (el.type === 'search' || el.getAttribute('role') === 'searchbox' || el.name === 'q') && el.closest('main'));
  },
};

const DETAIL = {
  'ziel unsichtbar': (t) => `fokussierbar, aber Größe ${t.rect.w}×${t.rect.h} px oder abgeschnitten`,
  'fokus unsichtbar': () => 'im Fokuszustand kein Wechsel von Umriss, Schatten, Hintergrund oder Rahmen (Element, Elternteil, ::before/::after)',
  'fokus schwach': (t) => `nur schwacher Wechsel: ${t.pruefung.treffer.map((x) => `${x.klasse} (${x.diff.join(', ')})`).join('; ')}`,
  ausserhalb: (t) => `nach dem Fokussieren außerhalb des Viewports (${t.rect.x}, ${t.rect.y})`,
};

const befunde = [];
const post = [];
const browser = await starteBrowser();
let bildZaehler = 0;

/** Kontext mit Fokus-Hilfen, reducedMotion „reduce“, ohne Maus. POST-Anfragen werden abgebrochen und gezählt. */
async function kontextMitSperre(label) {
  const kontext = await neuerKontext(browser, { viewport: { width: breite, height: geraet.hoehe }, reducedMotion: 'reduce' });
  await kontext.addInitScript(fokusHelfer);
  await kontext.route('**/*', (route) => (route.request().method() === 'POST' ? route.abort() : route.continue()));
  kontext.on('request', (anfrage) => {
    if (anfrage.method() === 'POST') post.push({ lauf: label, url: anfrage.url().slice(0, 200) });
  });
  return kontext;
}

/** Wartet auf den Netzwerkstillstand, höchstens 2,5 s. */
async function ruhe(seite) {
  await Promise.race([seite.waitForLoadState('networkidle').catch(() => undefined), seite.waitForTimeout(2500)]);
}

/** Datumsfelder (Tag, Monat, Jahr) haben innere Stopps: Tab bleibt im selben Element, ohne Messung. */
const SEGMENTIERT = ['date', 'time', 'datetime-local', 'month', 'week'];

/** Ein Tab-Druck und die Messung des neuen Fokusziels (150 ms Wartezeit für das Scrollen). Liegt der Fokus noch im
 *  selben Datumsfeld wie zuvor (vorigeId), liefert er nur { segment: true }: eine Messung würde den Fokus zurücksetzen. */
async function schritt(seite, vorigeId = null) {
  await seite.keyboard.press('Tab');
  await seite.waitForTimeout(150);
  const innen = await seite.evaluate(
    ([vorige, typen]) => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const id = window.__tast.id(el);
      return el.tagName === 'INPUT' && typen.includes(el.type) && id === vorige ? { segment: true, id } : null;
    },
    [vorigeId, SEGMENTIERT],
  );
  if (innen) return innen;
  return seite.evaluate(() => window.__tast.pruefeAktiv());
}

function arten(t) {
  if (t.ende) return [];
  if (!t.sichtbar) return ['ziel unsichtbar'];
  const liste = [];
  if (!t.pruefung.quelle) liste.push(t.pruefung.treffer.length ? 'fokus schwach' : 'fokus unsichtbar');
  if (t.imViewport === false) liste.push('ausserhalb');
  return liste;
}

async function bildZiel(seite, t, name) {
  if (!values.bilder || !name || bildZaehler >= 60 || !t.rect) return null;
  mkdirSync(values.bilder, { recursive: true });
  const rand = 60;
  const x = Math.max(0, t.rect.x - rand);
  const y = Math.max(0, t.rect.y - rand);
  const datei = `${values.bilder}/${name.replace(/[^\w.-]+/g, '_')}.jpg`;
  await seite.screenshot({
    path: datei,
    type: 'jpeg',
    quality: 70,
    clip: { x, y, width: Math.max(1, Math.min(t.rect.w + 2 * rand, breite - x)), height: Math.max(1, Math.min(t.rect.h + 2 * rand, geraet.hoehe - y)) },
  });
  bildZaehler += 1;
  return datei;
}

/** Schreibt die Befunde eines Fokusziels in die Befundliste; liefert die Arten. */
async function erfasse(seite, bereich, t, nr, dateiName) {
  const liste = arten(t);
  const bild = liste.some((a) => a !== 'ausserhalb') ? await bildZiel(seite, t, dateiName) : null;
  for (const art of liste) {
    befunde.push({ bereich, art, nr, tag: t.tag, name: t.name, rolle: t.rolle, detail: DETAIL[art](t), bild });
  }
  return liste;
}

async function sprunglink(seite) {
  const erstes = await schritt(seite);
  const ergebnis = { ergebnis: 'fehlt', ziel: erstes.ende ? null : { tag: erstes.tag, name: erstes.name, href: erstes.href }, nachEnter: null, folgeTab: null };
  if (erstes.ende || !erstes.sprungKandidat) return ergebnis;
  await seite.keyboard.press('Enter');
  await seite.waitForTimeout(300);
  ergebnis.nachEnter = await seite.evaluate(() => window.__tast.inMain());
  if (!ergebnis.nachEnter) {
    await seite.keyboard.press('Tab');
    await seite.waitForTimeout(150);
    ergebnis.folgeTab = await seite.evaluate(() => window.__tast.inMain());
  }
  ergebnis.ergebnis = ergebnis.nachEnter || ergebnis.folgeTab ? 'ok' : 'wirkungslos';
  return ergebnis;
}

/** Menü-Knopf im Kopf per Tab suchen, mit Enter öffnen, Fokus im Dialog, Escape, Fokus zurück. */
async function menuePruefung(url) {
  const m = { gefunden: false, tabs: 0, name: null, dialogOffen: false, fokusImDialog: false, geschlossen: false, fokusZurueck: false, befunde: [] };
  const kontext = await kontextMitSperre('Menü (390)');
  try {
    const seite = await kontext.newPage();
    await oeffne(seite, url, { warte: 0 });
    await ruhe(seite);
    let knopf = null;
    for (let nr = 1; nr <= maxTabs && !m.gefunden; nr += 1) {
      await seite.keyboard.press('Tab');
      m.tabs = nr;
      knopf = await seite.evaluate(() => {
        const el = document.activeElement;
        const dialogKnopf = el?.getAttribute('aria-haspopup') === 'dialog' || (el?.hasAttribute('aria-controls') && el?.hasAttribute('aria-expanded'));
        if (!el || !dialogKnopf || !/men[üu]/i.test(window.__tast.name(el))) return null;
        return window.__tast.id(el);
      });
      if (knopf !== null) {
        m.gefunden = true;
        m.name = await seite.evaluate(() => window.__tast.name(document.activeElement));
      }
    }
    if (m.gefunden) {
      await seite.keyboard.press('Enter');
      await seite.waitForTimeout(900);
      m.dialogOffen = (await seite.locator('dialog[open]').count()) === 1;
      m.fokusImDialog = await seite.evaluate(() => Boolean(document.activeElement?.closest('dialog[open]')));
      await seite.keyboard.press('Escape');
      await seite.waitForTimeout(400);
      m.geschlossen = (await seite.locator('dialog[open]').count()) === 0;
      m.fokusZurueck = await seite.evaluate((id) => window.__tast.id(document.activeElement) === id, knopf);
    }
  } finally {
    await kontext.close();
  }
  if (!m.gefunden) m.befunde.push('Menü-Knopf im Kopf nicht im Tab-Ablauf erreicht');
  if (m.gefunden && !m.dialogOffen) m.befunde.push('Enter öffnet das Menü nicht (kein offener Dialog)');
  if (m.dialogOffen && !m.fokusImDialog) m.befunde.push('Fokus liegt nach dem Öffnen nicht im Dialog');
  if (m.dialogOffen && !m.geschlossen) m.befunde.push('Escape schließt den Dialog nicht');
  if (m.geschlossen && !m.fokusZurueck) m.befunde.push('Fokus liegt nach Escape nicht am Menü-Knopf');
  return m;
}

/** Tab bis das Prädikat auf das aktive Element zutrifft; alle Zwischenziele werden erfasst. */
async function tabBis(seite, bericht, praedikat, budget, bereich) {
  const passiert = [];
  let vorige = null;
  for (let i = 0; i < budget; i += 1) {
    const t = await schritt(seite, vorige);
    bericht.tabs += 1;
    if (t.ende) return { t: null, passiert, grund: 'Fokus fiel auf body' };
    if (t.segment) continue;
    vorige = t.id;
    passiert.push(t);
    bericht.ziele.push({ nr: bericht.tabs, ...t });
    await erfasse(seite, bereich, t, bericht.tabs, `aufgabe-${bericht.id}-${bericht.tabs}`);
    if (await seite.evaluate(praedikat)) return { t, passiert, grund: null };
  }
  return { t: null, passiert, grund: `nicht innerhalb von ${budget} Tabs erreicht` };
}

const zielFokus = (t) => {
  if (t.imViewport === false) return 'außerhalb des Viewports';
  if (!t.sichtbar) return 'Ziel nicht sichtbar';
  if (!t.pruefung.quelle) return 'kein sichtbarer Fokusindikator';
  return null;
};

async function gebetszeit(seite, bericht, bereich) {
  const link = await tabBis(seite, bericht, PRAED.gebet, aufgabenTabs, bereich);
  if (!link.t) return { ok: false, grund: `Link zu /gebetszeiten: ${link.grund}` };
  const mangel = zielFokus(link.t);
  await Promise.all([seite.waitForURL(/\/gebetszeiten\/?([?#]|$)/, { timeout: 15000 }).catch(() => null), seite.keyboard.press('Enter')]);
  await ruhe(seite);
  const pfad = new URL(seite.url()).pathname;
  if (!/\/gebetszeiten\/?$/.test(pfad)) return { ok: false, grund: `nach Enter ist die URL ${pfad}` };
  const naechste = await seite.evaluate(() => {
    const markiert = [...document.querySelectorAll('main [aria-current]')].find((e) => e.getAttribute('aria-current') !== 'false' && window.__tast.sichtbar(e));
    const ueberschrift = [...document.querySelectorAll('main h1, main h2')].find((h) => window.__tast.sichtbar(h));
    return { markiert: markiert ? window.__tast.name(markiert) : null, ueberschrift: ueberschrift ? window.__tast.name(ueberschrift) : null };
  });
  const teil = naechste.markiert
    ? `nächste Gebetszeit markiert: „${naechste.markiert}“`
    : naechste.ueberschrift
      ? `keine markierte Zeile, sichtbare Überschrift „${naechste.ueberschrift}“`
      : null;
  if (!teil) return { ok: false, grund: `URL ${pfad}, aber weder markierte nächste Gebetszeit noch Überschrift sichtbar` };
  return { ok: !mangel, grund: `Link „${link.t.name}“ mit ${mangel ?? 'sichtbarem Fokus'}; URL ${pfad}; ${teil}` };
}

async function veranstaltung(seite, bericht, bereich) {
  const karte = await tabBis(seite, bericht, PRAED.karte, aufgabenTabs, bereich);
  if (!karte.t) return { ok: false, grund: `Kartenlink zu /veranstaltungen/<slug>: ${karte.grund}` };
  const mangelKarte = zielFokus(karte.t);
  await Promise.all([seite.waitForURL(/\/veranstaltungen\/[^/]+\/?$/, { timeout: 15000 }).catch(() => null), seite.keyboard.press('Enter')]);
  await ruhe(seite);
  const pfad = new URL(seite.url()).pathname;
  if (!/\/veranstaltungen\/[^/]+\/?$/.test(pfad)) return { ok: false, grund: `nach Enter ist die URL ${pfad}` };
  const hatFormular = await seite.evaluate(() => Boolean(document.querySelector('main form:not([role=search])')));
  if (!hatFormular) {
    const hinweis = await seite.evaluate(() => [...document.querySelectorAll('main p, main span, main div')].map((e) => (e.childElementCount === 0 ? e.textContent.trim() : '')).find((t) => /keine Anmeldung/i.test(t)) ?? null);
    return { ok: !mangelKarte, grund: `Kartenlink ${mangelKarte ?? 'mit sichtbarem Fokus'}; Detailseite ${pfad}: kein Anmeldeformular${hinweis ? `; Seite: „${hinweis.slice(0, 80)}“` : ''} (notiert)` };
  }
  // Nach der Navigation per Enter beginnt Tab an der alten Position: die Zielseite wird neu geladen, damit Tab oben beginnt.
  await seite.goto(seite.url(), { waitUntil: 'load', timeout: 60000 });
  await ruhe(seite);
  const knopf = await tabBis(seite, bericht, PRAED.knopfMain, aufgabenTabs, bereich);
  if (!knopf.t) return { ok: false, grund: `Absendeknopf des Anmeldeformulars: ${knopf.grund}` };
  const mangel = zielFokus(knopf.t);
  return {
    ok: !mangel,
    grund: `Detailseite ${pfad}; Absendeknopf „${knopf.t.name}“ erreicht, ${mangel ?? 'sichtbarer Fokus'}; nicht gedrückt`,
  };
}

async function kurs(seite, bericht, bereich) {
  const link = await tabBis(seite, bericht, PRAED.kurs, aufgabenTabs, bereich);
  if (!link.t) return { ok: false, grund: `Link zur Voranmeldung: ${link.grund}` };
  const mangelLink = zielFokus(link.t);
  await Promise.all([seite.waitForURL(/\/bildung\/voranmeldung\/?([?#]|$)/, { timeout: 15000 }).catch(() => null), seite.keyboard.press('Enter')]);
  await ruhe(seite);
  const pfad = new URL(seite.url()).pathname;
  if (!/\/bildung\/voranmeldung/.test(pfad)) return { ok: false, grund: `nach Enter ist die URL ${pfad}` };
  // Nach der Navigation per Enter beginnt Tab an der alten Position: die Zielseite wird neu geladen, damit Tab oben beginnt.
  await seite.goto(seite.url(), { waitUntil: 'load', timeout: 60000 });
  await ruhe(seite);
  const feld = await tabBis(seite, bericht, PRAED.feld, aufgabenTabs, bereich);
  if (!feld.t) return { ok: false, grund: `erstes Feld des Formulars: ${feld.grund}` };
  const weiter = await tabBis(seite, bericht, PRAED.weiter, aufgabenTabs, bereich);
  if (!weiter.t) return { ok: false, grund: `Weiter- oder Absendeknopf: ${weiter.grund}` };
  const mangel = zielFokus(weiter.t);
  return {
    ok: !mangel && !mangelLink,
    grund: `Link ${mangelLink ?? 'mit sichtbarem Fokus'}; Voranmeldung ${pfad}; „${weiter.t.name}“ nach ${weiter.passiert.length} Zielen erreicht, ${mangel ?? 'sichtbarer Fokus'}; nicht gedrückt`,
  };
}

async function kontakt(seite, bericht, bereich) {
  const feld = await tabBis(seite, bericht, PRAED.feld, aufgabenTabs, bereich);
  if (!feld.t) return { ok: false, grund: `Textfeld im Formular: ${feld.grund}` };
  await seite.keyboard.type('Probe');
  const knopf = await tabBis(seite, bericht, PRAED.knopfFeld, aufgabenTabs, bereich);
  if (!knopf.t) return { ok: false, grund: `Absendeknopf: ${knopf.grund}` };
  const mangel = zielFokus(knopf.t);
  return { ok: !mangel, grund: `Absendeknopf „${knopf.t.name}“ nach ${knopf.passiert.length} Zielen erreicht, ${mangel ?? 'sichtbarer Fokus'}; nicht gedrückt` };
}

async function suche(seite, bericht, bereich) {
  const vorher = await seite.evaluate(() => [...document.querySelectorAll('main h2, main h3')].filter((h) => window.__tast.sichtbar(h)).map((h) => window.__tast.name(h)));
  const feld = await tabBis(seite, bericht, PRAED.suche, aufgabenTabs, bereich);
  if (!feld.t) return { ok: false, grund: `Suchfeld: ${feld.grund}` };
  const mangel = zielFokus(feld.t);
  await seite.keyboard.type('gebet');
  await Promise.all([seite.waitForURL(/[?&]q=gebet(&|$)/, { timeout: 15000 }).catch(() => null), seite.keyboard.press('Enter')]);
  await seite.waitForTimeout(800);
  await ruhe(seite);
  const adresse = new URL(seite.url());
  const nachher = await seite.evaluate(() => [...document.querySelectorAll('main h2, main h3')].filter((h) => window.__tast.sichtbar(h)).map((h) => window.__tast.name(h)));
  if (adresse.searchParams.get('q') !== 'gebet') return { ok: false, grund: `URL ohne q=gebet (${adresse.pathname}${adresse.search})` };
  const neu = nachher.find((h) => !vorher.includes(h));
  const ueberschrift = neu ?? nachher.find((h) => /gebet/i.test(h));
  if (!ueberschrift) return { ok: false, grund: 'keine neue Überschrift mit Ergebnissen oder Leerzustand' };
  return { ok: !mangel, grund: `Suchfeld ${mangel ?? 'mit sichtbarem Fokus'}; URL ${adresse.pathname}?q=gebet; Überschrift „${ueberschrift}“` };
}

/** Eine Hauptaufgabe in eigenem Kontext. POST-Anfragen während der Aufgabe machen sie zum Werkzeugfehler. */
async function aufgabe(id, titel, pfad, ablauf) {
  const bericht = { id, titel, pfad, ok: false, grund: '', tabs: 0, post: 0, ziele: [] };
  const postVorher = post.length;
  const kontext = await kontextMitSperre(`Aufgabe ${id}`);
  try {
    const seite = await kontext.newPage();
    await oeffne(seite, vollerUrl(basis, pfad), { warte: 0 });
    await ruhe(seite);
    const ergebnis = await ablauf(seite, bericht, `Aufgabe ${id}`);
    bericht.ok = ergebnis.ok;
    bericht.grund = ergebnis.grund;
  } catch (fehler) {
    bericht.ok = false;
    bericht.grund = `Ausnahme: ${String(fehler.message).split('\n')[0]}`;
  } finally {
    await kontext.close();
  }
  bericht.post = post.length - postVorher;
  if (bericht.post > 0) {
    bericht.ok = false;
    bericht.grund += `; ${bericht.post} POST-Anfrage(n) abgefangen (Werkzeugfehler)`;
  }
  return bericht;
}

const routenErgebnis = [];
const aufgaben = [];
let menue = null;
let technisch = false;
try {
  for (const [index, route] of routen.entries()) {
    const url = vollerUrl(basis, route.pfad);
    const bericht = { name: route.name, pfad: route.pfad, http: 0, sprunglink: null, ziele: [], abbruch: null, post: 0 };
    const postVorher = post.length;
    const kontext = await kontextMitSperre(`Route ${route.pfad}`);
    try {
      const seite = await kontext.newPage();
      bericht.http = await oeffne(seite, url, { warte: 0 });
      await ruhe(seite);
      bericht.sprunglink = await sprunglink(seite);
      if (bericht.sprunglink.ergebnis !== 'ok') {
        befunde.push({
          bereich: route.pfad,
          art: `sprunglink ${bericht.sprunglink.ergebnis}`,
          nr: 0,
          tag: bericht.sprunglink.ziel?.tag ?? '–',
          name: bericht.sprunglink.ziel?.name ?? '–',
          rolle: null,
          detail: bericht.sprunglink.ergebnis === 'fehlt' ? 'erstes Tab-Ziel ist kein Link zum Inhalt (#inhalt)' : 'Enter auf dem Sprunglink setzt den Fokus nicht in main#inhalt',
          bild: null,
        });
      }
      await oeffne(seite, url, { warte: 0 });
      await ruhe(seite);
      let erster = null;
      let vorige = null;
      let gleich = 0;
      for (let nr = 1; nr <= maxTabs; nr += 1) {
        const t = await schritt(seite, vorige);
        if (t.ende) {
          bericht.abbruch = 'Fokus auf body';
          break;
        }
        if (t.segment) continue;
        if (erster === null) erster = t.id;
        else if (t.id === erster) {
          bericht.abbruch = 'zum ersten Ziel zurückgekehrt';
          break;
        }
        gleich = t.id === vorige ? gleich + 1 : 0;
        vorige = t.id;
        const liste = await erfasse(seite, route.pfad, t, nr, `r${index + 1}-${nr}-${t.tag}`);
        bericht.ziele.push({ nr, ...t, befunde: liste });
        if (gleich >= 3 && !t.dialog) {
          befunde.push({ bereich: route.pfad, art: 'falle', nr, tag: t.tag, name: t.name, rolle: t.rolle, detail: 'drei Tab-Drücke ohne Wechsel des Fokus, kein Dialog offen', bild: null });
          bericht.abbruch = 'falle';
          break;
        }
      }
      if (!bericht.abbruch) bericht.abbruch = `max-tabs (${maxTabs}) erreicht`;
    } catch (fehler) {
      technisch = true;
      bericht.abbruch = `Ausnahme: ${String(fehler.message).split('\n')[0]}`;
    } finally {
      await kontext.close();
    }
    bericht.post = post.length - postVorher;
    if (bericht.http >= 400 || bericht.http === 0) technisch = true;
    if (index === 0 && breite === 390) {
      menue = await menuePruefung(url);
      for (const text of menue.befunde) befunde.push({ bereich: `${route.pfad} (Menü, 390 px)`, art: 'menü', nr: 0, tag: 'button', name: menue.name ?? '–', rolle: 'button', detail: text, bild: null });
    }
    routenErgebnis.push(bericht);
    const zaehl = befunde.filter((b) => b.bereich === route.pfad).length;
    console.log(`${route.pfad}: HTTP ${bericht.http} · Ziele ${bericht.ziele.length} · Sprunglink ${bericht.sprunglink?.ergebnis ?? '–'} · Befunde ${zaehl} · Abbruch: ${bericht.abbruch}`);
  }

  if (values.aufgaben) {
    aufgaben.push(await aufgabe('a', 'Gebetszeit (nächste Gebetszeit sehen)', '/', gebetszeit));
    aufgaben.push(await aufgabe('b', 'Veranstaltung finden und anmelden (bis zum Absendeknopf)', '/veranstaltungen', veranstaltung));
    aufgaben.push(await aufgabe('c', 'Kurs finden und Schüler voranmelden (bis zum Weiter-Knopf)', '/bildung/korankurse', kurs));
    aufgaben.push(await aufgabe('d', 'Kontakt aufnehmen (bis zum Absendeknopf, nicht gesendet)', '/kontakt', kontakt));
    aufgaben.push(await aufgabe('e', 'Suche (Zusatz, GET)', '/suche', suche));
    for (const a of aufgaben) {
      if (a.post > 0) technisch = true;
    }
  }

  const md = [
    `# Tastaturdurchlauf (Z-07) · ${zeit} · ${basis} · ${breite}×${geraet.hoehe}`,
    '',
    `Prüfumfang: Sprunglink, dann Tab bis ${maxTabs} Ziele je Route (Aufgaben bis ${aufgabenTabs}). „Fokus unsichtbar“: kein Wechsel von Umriss, Schatten, Hintergrund oder Rahmen beim Fokus (Element, Elternteil, ::before/::after). „Fokus schwach“: nur ein Wechsel ohne starken Indikator (Umriss unter 2 px, nur Unterstreichung o. ä.). „verdeckt (Hinweis)“ ist keine Befundart, sondern zählt Ziele, deren Mitte von einem anderen Element überdeckt wird.`,
    '',
    '| Route | HTTP | Ziele | Sprunglink | ziel unsichtbar | fokus unsichtbar | fokus schwach | ausserhalb | falle | verdeckt (Hinweis) | Abbruch |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...routenErgebnis.map((r) => {
      const zaehl = (art) => befunde.filter((b) => b.bereich === r.pfad && b.art === art).length;
      const verdeckt = r.ziele.filter((z) => z.verdeckt === true).length;
      return `| ${r.pfad} | ${r.http} | ${r.ziele.length} | ${r.sprunglink?.ergebnis ?? '–'} | ${zaehl('ziel unsichtbar')} | ${zaehl('fokus unsichtbar')} | ${zaehl('fokus schwach')} | ${zaehl('ausserhalb')} | ${zaehl('falle')} | ${verdeckt} | ${r.abbruch ?? '–'} |`;
    }),
    '',
    '## Befunde',
    '',
    ...(befunde.length
      ? befunde.map((b) => `- **${b.art}** · ${b.bereich} · \`${b.tag}\` „${b.name}“ (${b.rolle ?? 'ohne Rolle'}${b.nr ? `, Tab ${b.nr}` : ''}) – ${b.detail}${b.bild ? ` · Bild: ${b.bild}` : ''}`)
      : ['Keine Befunde.']),
    '',
  ];
  if (menue) {
    md.push('## Menü (390 px, erste Route)', '');
    md.push(
      `Knopf ${menue.gefunden ? `„${menue.name}“ nach ${menue.tabs} Tabs gefunden` : 'nicht gefunden'} · Dialog offen: ${menue.dialogOffen ? 'ja' : 'nein'} · Fokus im Dialog: ${menue.fokusImDialog ? 'ja' : 'nein'} · Escape schließt: ${menue.geschlossen ? 'ja' : 'nein'} · Fokus zurück am Knopf: ${menue.fokusZurueck ? 'ja' : 'nein'}`,
      '',
    );
  }
  if (values.aufgaben) {
    md.push('## Hauptaufgaben (KERN K-002)', '', '| Aufgabe | Ergebnis | Tabs | POST | Grund |', '|---|---|---|---|---|');
    for (const a of aufgaben) md.push(`| ${a.id}) ${a.titel} | ${a.ok ? 'ok' : 'fehler'} | ${a.tabs} | ${a.post} | ${a.grund} |`);
    md.push('');
  }
  md.push('## POST-Anfragen (Werkzeugfehler)', '');
  md.push(...(post.length ? post.map((p) => `- ${p.lauf}: ${p.url}`) : ['Keine. Alle POST-Anfragen wären abgebrochen worden.']), '');

  const protokoll = values.protokoll ?? standardProtokoll('tastatur');
  const dateien = schreibeProtokoll(protokoll, {
    json: { werkzeug: 'tastatur', zeit, basis, breite, hoehe: geraet.hoehe, maxTabs, aufgabenTabs, routen: routenErgebnis, menue, aufgaben, post, befunde },
    md: md.join('\n'),
  });
  console.log(`Befunde gesamt: ${befunde.length} · POST-Anfragen: ${post.length}`);
  console.log(`Protokoll: ${dateien.join(', ')}`);
} catch (fehler) {
  console.error(`Technischer Fehler: ${fehler.stack ?? fehler.message}`);
  technisch = true;
} finally {
  await browser.close();
}
process.exit(technisch ? 1 : 0);
