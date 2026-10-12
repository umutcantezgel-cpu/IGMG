#!/usr/bin/env node
// Prüfwerkzeug E0 (E0-PRUEFER-03): Funktionsliste F-01 … F-24 (LAGEBILD §3) gegen einen Stand.
// Aufruf: node funktionsliste.mjs [--basis URL] --protokoll <Pfad ohne Endung> [--bilder <Ordner>]
//         [--nur F-01,F-06] [--zustand <storageState.json>]
//   --basis      Standard http://127.0.0.1:3100 (oder ENV BASIS)
//   --protokoll  schreibt <Pfad>.json und <Pfad>.md
//   --bilder     Ordner für Belegbilder (Standard SCRATCHPAD/bilder/e0-funktionsliste)
//   --zustand    Anmeldezustand (storageState) aus anmeldung.mjs; nur für F-20 und F-21 (Lesepfad)
//   --hinweis    Text, der oben im Protokoll steht (z. B. Ersatzinstanz)
// Befunde sind Daten: Ein Lauf endet mit Exit-Code 0, außer bei technischem Fehler des Werkzeugs.
// Sicherheit: kein Speichern, kein Hochladen, keine Mails. Formulare werden nur bis zur Serverprüfung
// abgeschickt (leer, oder nur Schrittprüfung). Jeder Formular-POST wird gezählt (Feld „posts“).
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  BILDER, GERAETE, basisAdresse, hilfeAusgeben, neuerKontext, oeffne, schreibeProtokoll, starteBrowser, vollerUrl,
} from './hilfen.mjs';

const HILFE = `Aufruf: node funktionsliste.mjs [--basis URL] --protokoll <Pfad ohne Endung> [--bilder Ordner] [--nur F-01,F-06] [--zustand storageState.json]
Beispiel: node funktionsliste.mjs --basis http://127.0.0.1:3100 --protokoll /home/user/IGMG/_werkstatt/protokolle/E0-PRUEFER-03-funktionsliste`;

const { values } = parseArgs({
  options: {
    basis: { type: 'string' },
    protokoll: { type: 'string' },
    bilder: { type: 'string' },
    nur: { type: 'string' },
    zustand: { type: 'string' },
    hinweis: { type: 'string' },
    hilfe: { type: 'boolean', short: 'h', default: false },
  },
});
if (values.hilfe || !values.protokoll) hilfeAusgeben(HILFE);

const basis = basisAdresse(values.basis);
const bildOrdner = values.bilder ?? join(BILDER, 'e0-funktionsliste');
mkdirSync(bildOrdner, { recursive: true });
const nurIds = values.nur ? values.nur.split(',').map((s) => s.trim()) : null;
const zustandDatei = values.zustand ?? null;
const zustand = zustandDatei ? JSON.parse(readFileSync(zustandDatei, 'utf8')) : null;

const KONZEPT_SCHLUESSEL = 'igmg-konzepthinweis-gesehen';
const EVENT = 'freitagsgebet-mit-anschliessendem-vortrag';
const ORGS = ['ana-teskilati', 'kadin-teskilati', 'genclik-teskilati', 'kadin-genclik-teskilati'];
const TREFFER_LINKS = 'main a[href^="/nachrichten/"], main a[href^="/veranstaltungen/"], main a[href^="/bildung/"], main a[href^="/islamisches-wissen/"]';

// ---------- Befunde ----------
class Befunde {
  constructor() {
    this.liste = [];
    this.posts = 0; // Formular-POSTs an den Stand (aus dem Netzwerk gezählt)
    this.belege = [];
  }
  pruefe(name, bedingung, gemessen) {
    this.liste.push({ pruefung: name, ergebnis: bedingung ? 'erfüllt' : 'nicht erfüllt', gemessen });
  }
  nichtPruefbar(name, grund) {
    this.liste.push({ pruefung: name, ergebnis: 'nicht prüfbar', grund });
  }
  messwert(name, gemessen) {
    this.liste.push({ pruefung: name, ergebnis: 'Messwert', gemessen });
  }
  gesamt() {
    const e = this.liste.filter((x) => x.ergebnis !== 'Messwert').map((x) => x.ergebnis);
    if (e.includes('nicht erfüllt')) return 'nicht erfüllt';
    if (e.includes('nicht prüfbar') || e.length === 0) return 'nicht prüfbar';
    return 'erfüllt';
  }
}

// ---------- Seitenhilfen ----------
const sichtbar = (loc) => loc.filter({ visible: true });
const LEISTE = 'aside[aria-label="Aktuelle Gebetszeiten"]';

async function schliesseDialoge(seite) {
  await seite.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
}
async function besuche(seite, pfad, warte = 400) {
  const status = await oeffne(seite, vollerUrl(basis, pfad), { warte });
  await schliesseDialoge(seite);
  return status;
}
/** Zählt sichtbare Elemente innerhalb des Abschnitts (section), dessen Überschrift den Text trägt. */
function zaehleImAbschnitt(seite, titel, selektor) {
  return seite.evaluate(
    ([titel, selektor]) => {
      const h = [...document.querySelectorAll('h1,h2,h3')].find((e) => e.textContent.trim() === titel && e.getClientRects().length > 0);
      if (!h) return -1;
      const abschnitt = h.closest('section') ?? h.parentElement;
      return [...abschnitt.querySelectorAll(selektor)].filter((e) => e.getClientRects().length > 0).length;
    },
    [titel, selektor],
  );
}
/** Schritte eines Assistenten: Anzahl und Index des aktuellen Schritts (aria-current="step"). */
function schritte(seite) {
  return seite.evaluate(() => {
    const aktuell = document.querySelector('li[aria-current="step"]');
    const liste = aktuell?.closest('ol');
    if (!aktuell || !liste) return { anzahl: 0, aktiv: -1 };
    return { anzahl: liste.children.length, aktiv: [...liste.children].indexOf(aktuell) };
  });
}
async function fokusIn(seite, selektor) {
  return seite.evaluate((s) => !!document.activeElement?.closest(s), selektor);
}
/** Formular bis zur Serverprüfung: leer absenden, Fehlerzusammenfassung und Fokus prüfen. */
async function leerAbsenden(seite, b, form, name) {
  const knopf = form.locator('button[type="submit"]').filter({ visible: true }).last();
  const knopfName = (await knopf.textContent().catch(() => '')).trim();
  const alarm = sichtbar(seite.locator('main [role="alert"]'));
  // ALTCHA: Das Widget lädt erst bei einer Interaktion mit dem Formular (focusin). Ein Feld fokussieren (kein Absenden),
  // dann auf „verified“ warten. Ohne Widget (z. B. Schritt ohne ALTCHA) nach 8 s weitermachen.
  const t0 = Date.now();
  await form.locator('input:not([type=hidden]), textarea, select').filter({ visible: true }).first().focus().catch(() => {});
  const altchaZustand = await seite.evaluate(() => new Promise((ok) => {
    let i = 0;
    const t = setInterval(() => {
      const w = document.querySelector('main form altcha-widget');
      const fertig = w?.getState?.() === 'verified' || !!document.querySelector('main form input[name="altcha"]')?.value;
      if (fertig) { clearInterval(t); return ok('geprüft'); }
      if (!w && ++i > 32) { clearInterval(t); return ok('kein ALTCHA-Widget'); }
      if (w && ++i > 120) { clearInterval(t); return ok('nicht geprüft'); }
    }, 250);
  })).catch(() => 'Prüfung fehlgeschlagen');
  const altchaGeloest = altchaZustand === 'kein ALTCHA-Widget' ? altchaZustand : `${altchaZustand} nach ${Math.round((Date.now() - t0) / 100) / 10} s`;
  try {
    await knopf.click();
    await alarm.first().waitFor({ timeout: 10000 });
  } catch {
    b.pruefe(`${name}: Fehlerzusammenfassung nach leerem Absenden („${knopfName}“)`, false, 'kein sichtbarer Alarm in main');
    return;
  }
  await seite.waitForTimeout(400);
  const text = (await alarm.first().innerText()).replace(/\s+/g, ' ').trim();
  const feldLinks = await alarm.first().locator('a[href^="#"]').count();
  b.pruefe(`${name}: Fehlerzusammenfassung nach leerem Absenden („${knopfName}“)`, text.length > 0, { text: text.slice(0, 160), feldLinks, altcha: altchaGeloest });
  b.pruefe(`${name}: Fokus in der Fehlerzusammenfassung`, await fokusIn(seite, 'main [role="alert"]'), 'Fokus');
}
async function foto(seite, id, breite, suffix = '') {
  const datei = join(bildOrdner, `${id}-${breite}${suffix ? '-' + suffix : ''}.jpg`);
  await seite.screenshot({ path: datei, type: 'jpeg', quality: 70 });
  return datei;
}
const h1Text = async (seite) => (await sichtbar(seite.getByRole('heading', { level: 1 })).first().innerText().catch(() => '')).trim();

// ---------- F-01 … F-24 ----------
const F = {};

/** 12:00 Uhr Berlin am heutigen Tag: feste Browseruhr, damit die Restzeit-Prüfung nicht von der Tageszeit abhängt. */
function mittagBerlin(jetzt = new Date()) {
  const tag = jetzt.toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
  let zeit = Date.parse(`${tag}T12:00:00Z`);
  const teile = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: 'numeric', hourCycle: 'h23' }).formatToParts(new Date(zeit));
  const stunde = Number(teile.find((t) => t.type === 'hour').value);
  return new Date(zeit - (stunde - 12) * 3600e3);
}

F['F-01'] = async (s, b, breite) => {
  await s.clock.setFixedTime(mittagBerlin());
  b.messwert('Browseruhr fest auf 12:00 Berlin (Laufzeit-Uhrzeit Berlin: ' + new Date().toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin' }) + ')', mittagBerlin().toISOString());
  const status = await besuche(s, '/', 300);
  b.pruefe('HTTP 200', status === 200, status);
  await s.waitForTimeout(1200); // Hydrierung abwarten (Restzeit)
  const leiste = s.locator(LEISTE);
  if (breite < 768) await sichtbar(leiste.locator('button[aria-controls="leiste-alle"]')).click();
  const karten = await sichtbar(leiste.locator('ul[aria-label="Gebetszeiten heute"] > li')).count();
  b.pruefe('Leiste: sechs Gebetszeiten sichtbar', karten === 6, karten);
  const text = (await sichtbar(leiste).first().innerText()).replace(/\s+/g, ' ');
  b.pruefe('Leiste: „Nächstes Gebet“ und Restzeit nach Hydrierung', /Nächstes Gebet/.test(text) && /verbleibt: \d/.test(text), text.slice(0, 180));
  const h1 = await h1Text(s);
  b.pruefe('H1 „IGMG Wetzlar“', h1 === 'IGMG Wetzlar', h1);
  const beitreten = await sichtbar(s.getByRole('link', { name: 'Gemeinde beitreten' })).first().getAttribute('href').catch(() => null);
  b.pruefe('„Gemeinde beitreten“ → /mitglied-werden', beitreten === '/mitglied-werden', beitreten);
  const mehr = await sichtbar(s.getByRole('link', { name: 'Mehr erfahren' })).first().getAttribute('href').catch(() => null);
  b.pruefe('„Mehr erfahren“ (Hero) → /ueber-uns', mehr === '/ueber-uns', mehr);
  const ev = await zaehleImAbschnitt(s, 'Unsere Veranstaltungen', 'article');
  b.pruefe('bis zu 6 kommende Veranstaltungen', ev >= 1 && ev <= 6, ev);
  // Code: page.tsx – Aufmacher (variante „gross“) + höchstens 3 weitere („kompakt“): zusammen 4 Artikel
  const news = await zaehleImAbschnitt(s, 'Bleiben Sie informiert', 'article');
  b.pruefe('Aufmacher + 3 Neuigkeiten (4 Artikel)', news === 4, { artikel: news });
  b.belege.push(await foto(s, 'F-01', breite));
};

F['F-02'] = async (s, b, breite) => {
  const seiten = [
    '/', '/veranstaltungen', '/nachrichten', '/ueber-uns', '/projekte', '/vorstand', '/igmg', '/organisationen/ana-teskilati',
    '/bildung/korankurse', '/bildung/voranmeldung', '/kontakt', '/mitglied-werden', '/webseite-fuer-moscheen', '/meldung',
    '/suche?q=Gebet', `/veranstaltungen/${EVENT}`, '/nachrichten/neue-gebetszeiten-fuer-den-winter', '/islamisches-wissen', '/quran',
  ];
  for (const pfad of seiten) {
    const status = await besuche(s, pfad, 250);
    const leiste = s.locator(LEISTE);
    const anzahl = await leiste.count();
    const info = { status, leisten: anzahl };
    let ok = status === 200 && anzahl === 1;
    if (ok && breite < 768) {
      const knopf = s.locator('aside[aria-label="Aktuelle Gebetszeiten"] button[aria-controls="leiste-alle"]');
      info.vorher = await sichtbar(knopf).getAttribute('aria-expanded');
      await sichtbar(knopf).click();
      info.nachher = await sichtbar(knopf).getAttribute('aria-expanded');
      info.href = await sichtbar(leiste.getByRole('link', { name: 'Alle Gebetszeiten' })).first().getAttribute('href').catch(() => null);
      ok = info.vorher === 'false' && info.nachher === 'true' && info.href === '/gebetszeiten';
    } else if (ok) {
      info.href = await sichtbar(leiste.getByRole('link', { name: 'Alle Gebetszeiten' })).first().getAttribute('href').catch(() => null);
      ok = info.href === '/gebetszeiten';
    }
    b.pruefe(`Leiste auf ${pfad}`, ok, info);
  }
  const gz = await besuche(s, '/gebetszeiten', 250);
  b.pruefe('keine Leiste auf /gebetszeiten', gz === 200 && (await s.locator(LEISTE).count()) === 0, { status: gz });
  b.belege.push(await foto(s, 'F-02', breite));
};

F['F-03'] = async (s, b, breite) => {
  const status = await besuche(s, '/gebetszeiten', 300);
  b.pruefe('HTTP 200', status === 200, status);
  b.pruefe('keine Leiste auf /gebetszeiten', (await s.locator(LEISTE).count()) === 0, 'aside-Zahl 0');
  const tabs = s.getByRole('tab');
  const namen = await tabs.allInnerTexts();
  b.pruefe('vier Tabs', namen.length === 4, namen);
  const aktive = () => s.evaluate(() => [...document.querySelectorAll('[role=tab]')].filter((t) => t.getAttribute('aria-selected') === 'true').map((t) => t.textContent.trim()));
  await s.getByRole('tab', { name: 'Heute' }).focus();
  await s.keyboard.press('ArrowRight');
  const nachPfeil = await aktive();
  await s.keyboard.press('End');
  const nachEnde = await aktive();
  await s.keyboard.press('Home');
  const nachPos1 = await aktive();
  b.pruefe('Tabs per Tastatur (Pfeil rechts, Ende, Pos1)', nachPfeil[0] === 'Monatlich' && nachEnde[0] === 'Einstellungen' && nachPos1[0] === 'Heute', { nachPfeil, nachEnde, nachPos1 });
  await s.getByRole('tab', { name: 'Monatlich' }).click();
  const captions = await s.evaluate(() => [...document.querySelectorAll('table caption')].filter((c) => c.getClientRects().length > 0).map((c) => c.textContent.trim()));
  b.messwert('Monatlich: sichtbare Tabellenüberschriften', captions);
  b.pruefe('Monatstabelle mit Überschrift „Gebetszeiten“', captions.length >= 1 && /Gebetszeiten/.test(captions[0]), captions[0] ?? 'keine');
  b.nichtPruefbar('Monat wechselt', 'Im Bestand gibt es kein Bedienelement für einen Monatswechsel; die Tabelle zeigt den laufenden Monat (Messwert oben). OFFENE FRAGE: Was „Monat wechselt“ genau prüfen soll.');
  b.belege.push(await foto(s, 'F-03-monat', breite));
  await s.getByRole('tab', { name: 'Qibla' }).click();
  const kompass = await sichtbar(s.locator('main [role="img"]')).count();
  b.pruefe('Qibla-Kompass sichtbar', kompass >= 1, kompass);
  b.belege.push(await foto(s, 'F-03-qibla', breite));
};

F['F-04'] = async (s, b, breite) => {
  const status = await oeffne(s, vollerUrl(basis, '/gebetszeiten/anzeige'), { warte: 500 });
  b.pruefe('HTTP 200', status === 200, status);
  const titel = async () => (await sichtbar(s.locator('h2')).first().innerText().catch(() => '')).trim();
  const t0 = await titel();
  b.pruefe('Vollbild mit Überschrift', t0.length > 0, t0);
  const schliessen = sichtbar(s.getByLabel('Vollbild schließen'));
  b.pruefe('Knopf „Vollbild schließen“', (await schliessen.count()) === 1, await schliessen.count());
  b.belege.push(await foto(s, 'F-04', breite));
  await s.waitForTimeout(10800);
  const t1 = await titel();
  b.pruefe('Sprache wechselt nach ~10 s', t1.length > 0 && t1 !== t0, { vorher: t0, nachher: t1 });
  await Promise.all([s.waitForURL((u) => !u.pathname.includes('/anzeige'), { timeout: 10000 }), schliessen.click()]);
  b.pruefe('X schließt → /gebetszeiten', new URL(s.url()).pathname === '/gebetszeiten', new URL(s.url()).pathname);
  await oeffne(s, vollerUrl(basis, '/gebetszeiten/anzeige'), { warte: 300 });
  await Promise.all([s.waitForURL((u) => !u.pathname.includes('/anzeige'), { timeout: 10000 }), s.keyboard.press('Escape')]);
  b.pruefe('Esc schließt → /gebetszeiten', new URL(s.url()).pathname === '/gebetszeiten', new URL(s.url()).pathname);
};

F['F-05'] = async (s, b, breite) => {
  const status = await besuche(s, '/veranstaltungen', 300);
  b.pruefe('HTTP 200', status === 200, status);
  const karten = () => sichtbar(s.locator('main li[data-kategorie]')).count();
  const gesamt = await karten();
  const gruppe = s.getByRole('group', { name: 'Kategorie' });
  const chips = gruppe.getByRole('button');
  const n = await chips.count();
  let gewaehlt = null;
  for (let i = 1; i < n && !gewaehlt; i++) {
    await chips.nth(i).click();
    await s.waitForTimeout(250);
    const anzahl = await karten();
    const kats = await s.evaluate(() => [...new Set([...document.querySelectorAll('main li[data-kategorie]')].filter((e) => e.getClientRects().length > 0).map((e) => e.dataset.kategorie))]);
    if (anzahl > 0 && anzahl < gesamt) gewaehlt = { chip: (await chips.nth(i).textContent()).trim(), anzahl, kategorien: kats };
  }
  b.messwert('Karten gesamt', gesamt);
  b.pruefe('Kategoriefilter blendet andere Karten aus', gewaehlt !== null && gewaehlt.kategorien.length === 1, gewaehlt ?? 'kein Filter mit Teilmenge');
  b.belege.push(await foto(s, 'F-05-filter', breite));
  await gruppe.getByRole('button', { name: 'Alle', exact: true }).click();
  await s.waitForTimeout(250);
  const zurueck = await karten();
  b.pruefe('„Alle“ zeigt wieder alle Karten', zurueck === gesamt, { gesamt, nachAlle: zurueck });
};

F['F-06'] = async (s, b, breite) => {
  const status = await besuche(s, `/veranstaltungen/${EVENT}`, 300);
  b.pruefe('Detailseite HTTP 200', status === 200, status);
  const formular = sichtbar(s.locator('form'));
  if ((await formular.count()) === 0) {
    const geschlossen = await s.getByText('Anmeldung geschlossen').count();
    b.nichtPruefbar('Anmeldeformular: Pflichtfehler und Fokus', `kein Formular gerendert (Anzeige „Anmeldung geschlossen“: ${geschlossen > 0 ? 'ja' : 'nein'}); der einzige Termin mit anmeldungAktiv ist vergangen (beginn 2024-01-26)`);
  } else {
    const felder = await formular.first().evaluate((f) => [...f.querySelectorAll('input:not([type=hidden]),select,textarea')].map((e) => e.name || e.type));
    b.messwert('Formularfelder', felder);
    await leerAbsenden(s, b, formular.first(), 'Anmeldung');
  }
  const ics = await sichtbar(s.locator('a[href*="/api/ical/"]')).first().getAttribute('href');
  const antwort = await s.request.get(new URL(ics, basis).toString());
  const inhalt = await antwort.text();
  const typ = antwort.headers()['content-type'] ?? '';
  b.pruefe('iCal-Download: text/calendar mit TZID Europe/Berlin', antwort.status() === 200 && /text\/calendar/.test(typ) && /TZID=Europe\/Berlin/.test(inhalt), { status: antwort.status(), typ });
  b.belege.push(await foto(s, 'F-06', breite));
};

F['F-07'] = async (s, b, breite) => {
  const status = await besuche(s, '/nachrichten', 300);
  b.pruefe('HTTP 200', status === 200, status);
  const artikel = () => sichtbar(s.locator('main article')).count();
  const gesamt = await artikel();
  const gruppe = s.getByRole('group', { name: 'Kategorie' });
  const chips = gruppe.getByRole('button');
  const n = await chips.count();
  let gewaehlt = null;
  for (let i = 1; i < n && !gewaehlt; i++) {
    await chips.nth(i).click();
    await s.waitForTimeout(250);
    const anzahl = await artikel();
    if (anzahl !== gesamt) gewaehlt = { chip: (await chips.nth(i).textContent()).trim(), anzahl, gedrückt: await chips.nth(i).getAttribute('aria-pressed') };
  }
  b.messwert('Artikel gesamt', gesamt);
  b.pruefe('Kategoriefilter wirkt (Liste ändert sich)', gewaehlt !== null && gewaehlt.gedrückt === 'true', gewaehlt ?? 'keine Kategorie ändert die Liste');
  await gruppe.getByRole('button', { name: /^Alle/ }).first().click();
  await s.waitForTimeout(250);
  b.pruefe('„Alle“ stellt die Liste wieder her', (await artikel()) === gesamt, await artikel());
  const ankuendigungen = await s.getByRole('heading', { name: 'Ankündigungen' }).count();
  if (ankuendigungen === 0) b.nichtPruefbar('Ankündigungen', 'kein Abschnitt „Ankündigungen“: im Bestand ist keine Ankündigung veröffentlicht; der Abschnitt wird dann nicht gerendert');
  else b.pruefe('Ankündigungen sichtbar', true, ankuendigungen);
  b.belege.push(await foto(s, 'F-07-liste', breite));
  const detail = await besuche(s, '/nachrichten/neue-gebetszeiten-fuer-den-winter', 300);
  b.pruefe('Detail HTTP 200', detail === 200, detail);
  const aehnlich = await zaehleImAbschnitt(s, 'Ähnliche Artikel', 'a[href^="/nachrichten/"]');
  b.pruefe('Detail mit ähnlichen Artikeln', aehnlich >= 1, aehnlich);
  b.belege.push(await foto(s, 'F-07-detail', breite));
};

F['F-08'] = async (s, b, breite) => {
  const seiten = [
    ['/ueber-uns', 'Über uns'],
    // H-B11 (Sichtabnahme E3) hat die deutsche Schreibweise des Titels berichtigt; beide Fassungen gelten als erfüllt
    ['/projekte', ['Gemeinsam Glauben, Gemeinsam Wachsen', 'Gemeinsam glauben, gemeinsam wachsen']],
    ['/vorstand', 'Unser Vorstand'],
    ['/igmg', 'IGMG - Islamische Gemeinschaft Millî Görüş'],
  ];
  for (const [pfad, erwartet] of seiten) {
    const status = await besuche(s, pfad, 250);
    const h1 = await h1Text(s);
    const zeichen = await s.evaluate(() => document.querySelector('main')?.innerText.length ?? 0);
    const passt = Array.isArray(erwartet) ? erwartet.includes(h1) : h1 === erwartet;
    b.pruefe(`${pfad}: 200, H1, Inhalt`, status === 200 && passt && zeichen > 200, { status, h1, zeichen });
  }
  await besuche(s, '/igmg', 250);
  const tabs = s.getByRole('tab');
  const n = await tabs.count();
  const laengen = [];
  for (let i = 0; i < n; i++) {
    await tabs.nth(i).click();
    await s.waitForTimeout(150);
    laengen.push(await s.evaluate(() => (document.querySelector('[role=tabpanel]:not([hidden])')?.innerText ?? '').trim().length));
  }
  b.pruefe('/igmg: Tabs zeigen Inhalt', n >= 2 && laengen.every((l) => l > 40), { tabs: n, zeichen: laengen });
  b.belege.push(await foto(s, 'F-08-igmg', breite));
};

F['F-09'] = async (s, b, breite) => {
  const namen = { 'ana-teskilati': 'Ana Teşkilatı', 'kadin-teskilati': 'Kadın Teşkilatı', 'genclik-teskilati': 'Gençlik Teşkilatı', 'kadin-genclik-teskilati': 'Kadın Gençlik Teşkilatı' };
  const kuerzel = { 'ana-teskilati': 'at', 'kadin-teskilati': 'kt', 'genclik-teskilati': 'gt', 'kadin-genclik-teskilati': 'kgt' };
  for (const slug of ORGS) {
    const status = await besuche(s, `/organisationen/${slug}`, 250);
    const h1 = await h1Text(s);
    const akzent = await s.evaluate((kz) => {
      const probe = document.createElement('span');
      probe.style.color = `var(--color-org-${kz})`;
      document.body.appendChild(probe);
      const erwartet = getComputedStyle(probe).color;
      probe.remove();
      const re = new RegExp(`(border|bg|text|fill)-org-${kz}(?![\\w-])`);
      const el = [...document.querySelectorAll('[class]')].find((e) => re.test(e.getAttribute('class') ?? '') && e.getClientRects().length > 0);
      if (!el) return { erwartet, gefunden: false };
      const klasse = (el.getAttribute('class') ?? '').split(/\s+/).find((c) => re.test(c));
      const cs = getComputedStyle(el);
      const wert = klasse.startsWith('border') ? cs.borderTopColor : klasse.startsWith('bg') ? cs.backgroundColor : klasse.startsWith('fill') ? cs.fill : cs.color;
      return { erwartet, gefunden: true, klasse, wert };
    }, kuerzel[slug]);
    const termine = await zaehleImAbschnitt(s, 'Kommende Veranstaltungen', 'a[href^="/veranstaltungen/"]');
    b.pruefe(`${slug}: 200, Name, Akzentfarbe, Termine`, status === 200 && h1 === namen[slug] && akzent.gefunden && akzent.wert === akzent.erwartet && termine >= 1, { status, h1, akzent, termine });
  }
  b.belege.push(await foto(s, 'F-09', breite));
};

F['F-10'] = async (s, b, breite) => {
  const status = await besuche(s, '/bildung/korankurse', 300);
  b.pruefe('HTTP 200', status === 200, status);
  const kurse = await s.evaluate(() =>
    [...document.querySelectorAll('main article')].filter((a) => a.getClientRects().length > 0).map((a) => ({
      text: a.innerText.replace(/\s+/g, ' ').slice(0, 90),
      links: [...a.querySelectorAll('a[href]')].map((l) => ({ text: l.textContent.trim(), href: l.getAttribute('href') })),
    })),
  );
  const reg = kurse.find((k) => /Voranmeldung erforderlich/.test(k.text));
  const join = kurse.find((k) => /Keine Anmeldung erforderlich/.test(k.text));
  const closed = kurse.find((k) => /Geschlossen/.test(k.text));
  b.pruefe('„register“ → Voranmeldung', !!reg && reg.links.some((l) => l.href === '/bildung/voranmeldung'), reg?.links ?? 'Kurs fehlt');
  b.pruefe('„join“ → /kontakt#karte', !!join && join.links.some((l) => l.href === '/kontakt#karte'), join?.links ?? 'Kurs fehlt');
  b.pruefe('„closed“ ohne Aktion', !!closed && closed.links.length === 0, closed?.links ?? 'Kurs fehlt');
  b.messwert('Kurskarten', kurse.length);
  b.belege.push(await foto(s, 'F-10', breite));
};

F['F-11'] = async (s, b, breite, kontext) => {
  // Ohne JavaScript: Formular mit Aktion und Absenden-Knopf vorhanden. Nicht ausgelöst.
  const ohne = await kontext.browser().newContext({ viewport: { width: breite, height: GERAETE[breite].hoehe }, javaScriptEnabled: false });
  const sOhne = await ohne.newPage();
  await oeffne(sOhne, vollerUrl(basis, '/bildung/voranmeldung'), { warte: 200 });
  const ohneJs = await sOhne.evaluate(() => {
    const f = document.querySelector('main form');
    const k = f ? [...f.querySelectorAll('button[type=submit]')].find((e) => e.textContent.trim() === 'Weiter') : null;
    return { formular: !!f, aktion: f?.getAttribute('action') ?? null, methode: f?.getAttribute('method') ?? null, knopf: !!k };
  });
  b.pruefe('ohne JavaScript: Formular mit POST und Weiter-Knopf (nicht ausgelöst)', ohneJs.formular && ohneJs.knopf && (ohneJs.methode ?? '').toLowerCase() === 'post', ohneJs);
  await ohne.close();

  const status = await besuche(s, '/bildung/voranmeldung', 300);
  b.pruefe('HTTP 200', status === 200, status);
  const s0 = await schritte(s);
  b.pruefe('vier Schritte, Schritt 1 aktiv', s0.anzahl === 4 && s0.aktiv === 0, s0);
  const form = s.locator('main form');
  const weiter = () => sichtbar(form.getByRole('button', { name: 'Weiter', exact: true }));
  await weiter().click();
  await s.waitForTimeout(500);
  const s1 = await schritte(s);
  const alarm1 = await sichtbar(s.locator('main [role="alert"]')).count();
  b.pruefe('Weiter ohne Eingaben: Pflichtprüfung, Schritt bleibt', s1.aktiv === 0 && alarm1 >= 1, { ...s1, alarm: alarm1 });
  // Pflichtfelder des sichtbaren Schritts mit offensichtlichen Testwerten füllen (keine echten Daten)
  const pflicht = await s.evaluate(() =>
    [...document.querySelectorAll('main form input[required], main form select[required], main form textarea[required]')]
      .filter((e) => e.getClientRects().length > 0 && !e.disabled)
      .map((e) => ({ tag: e.tagName, type: e.type, name: e.name })),
  );
  const radios = await s.evaluate(() => [...new Set([...document.querySelectorAll('main form input[type=radio]')].filter((e) => e.getClientRects().length > 0).map((e) => e.name))]);
  for (const name of radios) {
    await s.locator(`main form input[type=radio][name="${name}"]`).first().check({ force: true });
  }
  for (const f of pflicht) {
    if (f.type === 'radio') continue;
    const loc = s.locator(`main form [name="${f.name}"]`).filter({ visible: true }).first();
    if (f.tag === 'SELECT') await loc.selectOption({ index: 1 });
    else if (f.type === 'checkbox') await loc.check();
    else if (f.type === 'radio') await loc.check();
    else if (f.type === 'email') await loc.fill('pruefer@example.test');
    else if (f.type === 'tel') await loc.fill('0000000');
    else if (f.type === 'date') await loc.fill('2010-01-01');
    else if (f.type === 'number') await loc.fill('1');
    else await loc.fill('Prüfung');
  }
  await weiter().click();
  await s.waitForTimeout(600);
  const s2 = await schritte(s);
  b.pruefe('Weiter mit Testwerten: Schritt 2', s2.aktiv === 1, { ...s2, pflichtfelder: pflicht.length });
  if (s2.aktiv === 1) {
    await sichtbar(form.getByRole('button', { name: 'Zurück' })).click();
    await s.waitForTimeout(500);
    const s3 = await schritte(s);
    b.pruefe('Zurück: Schritt 1', s3.aktiv === 0, s3);
  } else {
    b.nichtPruefbar('Zurück', 'Schritt 2 nicht erreicht: Testwerte erfüllen die Pflichtprüfung von Schritt 1 nicht (Messwert oben)');
  }
  b.belege.push(await foto(s, 'F-11', breite));
};

F['F-12'] = async (s, b, breite) => {
  let osm = 0;
  s.on('request', (r) => { if (/openstreetmap/.test(r.url())) osm += 1; });
  const status = await besuche(s, '/kontakt', 300);
  b.pruefe('HTTP 200', status === 200, status);
  const formular = sichtbar(s.locator('main form')).first();
  b.messwert('Formularfelder (Pflicht mit *)', await formular.evaluate((f) => [...f.querySelectorAll('input:not([type=hidden]),textarea,select')].filter((e) => e.name !== 'website').map((e) => e.name + (e.required ? '*' : ''))));
  await leerAbsenden(s, b, formular, 'Kontakt');
  const iframes = await s.locator('iframe').count();
  const kartenKnopf = await sichtbar(s.locator('#karte button')).count();
  b.messwert('Karte vor Klick', { iframes, osmAnfragen: osm, kartenKnopf });
  if (kartenKnopf === 0) b.nichtPruefbar('Karte lädt erst nach Klick (OpenStreetMap)', `Bestand ohne Koordinaten: keine Kartenschaltfläche. Gemessen vor Klick: ${iframes} iframe(s), ${osm} OSM-Anfragen.`);
  else b.pruefe('Karte lädt erst nach Klick', iframes === 0 && osm === 0, { iframes, osm });
  b.belege.push(await foto(s, 'F-12', breite));
};

F['F-13'] = async (s, b, breite) => {
  const ziele = [
    ['/mitglied-werden', 'Mitgliedsantrag', true],
    ['/webseite-fuer-moscheen', 'Moschee-Anfrage', true],
    ['/meldung', 'Meldung', false],
  ];
  for (const [pfad, name, wizard] of ziele) {
    const status = await besuche(s, pfad, 300);
    const formular = sichtbar(s.locator('main form')).first();
    b.pruefe(`${name}: HTTP 200 mit Formular`, status === 200 && (await formular.count()) === 1, status);
    const vorher = wizard ? await schritte(s) : null;
    await leerAbsenden(s, b, formular, name);
    if (wizard) {
      const nachher = await schritte(s);
      b.pruefe(`${name}: Schritt bleibt nach leerem „Weiter“`, nachher.aktiv === vorher.aktiv && nachher.aktiv === 0, { vorher, nachher });
    }
  }
  b.belege.push(await foto(s, 'F-13', breite));
};

F['F-14'] = async (s, b, breite) => {
  const status = await oeffne(s, vollerUrl(basis, '/suche?q=Gebet'), { warte: 300 });
  b.pruefe('HTTP 200', status === 200, status);
  const robots = await s.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '');
  b.pruefe('noindex', /noindex/.test(robots), robots);
  const hinweis = (await sichtbar(s.locator('main h2')).first().innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  const treffer = await s.evaluate((sel) => document.querySelectorAll(sel).length, TREFFER_LINKS);
  b.pruefe('Ergebnisse zu „Gebet“', treffer > 0, { treffer, hinweis: hinweis.slice(0, 90) });
  b.belege.push(await foto(s, 'F-14', breite));
  for (const q of ['Freitagsgebet', 'Ramadan']) {
    await oeffne(s, vollerUrl(basis, `/suche?q=${encodeURIComponent(q)}`), { warte: 200 });
    const n = await s.evaluate((sel) => document.querySelectorAll(sel).length, TREFFER_LINKS);
    b.messwert(`Gegenprobe „${q}“: Trefferlinks`, n);
  }
};

F['F-15'] = async (s, b, breite) => {
  await besuche(s, '/ueber-uns', 300);
  const h1De = await h1Text(s);
  if (breite >= 1240) {
    await sichtbar(s.locator('[aria-controls="sprachwahl-liste"]')).click();
    await sichtbar(s.locator('#sprachwahl-liste a[hreflang="tr"]')).click();
  } else {
    await sichtbar(s.getByRole('button', { name: 'Menü öffnen' })).click();
    await sichtbar(s.locator('dialog[open] a[hreflang="tr"]')).click();
  }
  await s.waitForURL(/\/tr\/hakkimizda$/, { timeout: 10000 }).catch(() => {});
  const lang = await s.evaluate(() => document.documentElement.lang);
  const h1Tr = await h1Text(s);
  const pfad = new URL(s.url()).pathname;
  b.pruefe('Deutsch → Türkisch: gleiche Seite, lokaler Pfad', pfad === '/tr/hakkimizda' && lang === 'tr' && h1Tr !== h1De, { pfad, lang, h1De, h1Tr });
  b.belege.push(await foto(s, 'F-15-tr', breite));
  if (breite >= 1240) {
    await sichtbar(s.locator('[aria-controls="sprachwahl-liste"]')).click();
    await sichtbar(s.locator('#sprachwahl-liste a[hreflang="en"]')).click();
    await s.waitForURL(/\/en\/about-us$/, { timeout: 10000 }).catch(() => {});
    const langEn = await s.evaluate(() => document.documentElement.lang);
    b.pruefe('Türkisch → Englisch: lokaler Pfad', new URL(s.url()).pathname === '/en/about-us' && langEn === 'en', { pfad: new URL(s.url()).pathname, lang: langEn });
  }
};

F['F-16'] = async (s, b, breite) => {
  const status = await oeffne(s, vollerUrl(basis, '/nicht-vorhanden-xyz'), { warte: 300 });
  b.pruefe('HTTP 404', status === 404, status);
  const h1 = await h1Text(s);
  b.pruefe('Seite „nicht gefunden“ mit H1', h1 === 'Seite nicht gefunden', h1);
  const robots = await s.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '');
  b.pruefe('noindex', /noindex/.test(robots), robots);
  const weg = await sichtbar(s.getByRole('link', { name: 'Zur Startseite' })).first().getAttribute('href').catch(() => null);
  b.pruefe('Weg zurück: „Zur Startseite“ → /', weg === '/', weg);
  b.belege.push(await foto(s, 'F-16', breite));
};

F['F-17'] = async (s, b, breite) => {
  const offline = await s.request.get(vollerUrl(basis, '/offline'));
  b.pruefe('/offline HTTP 200', offline.status() === 200, offline.status());
  const sw = await s.request.get(vollerUrl(basis, '/sw.js'));
  const quelle = await sw.text();
  b.pruefe('sw.js hält Gebetszeiten und Startseite vor (Quelltext)', sw.status() === 200 && quelle.includes('gebetszeiten') && quelle.includes('(tr|en)?\\/?$'), { status: sw.status(), zeichen: quelle.length });
  // Live: Dienst aktivieren, Gebetszeiten und Startseite vorhalten, dann offline laden
  await oeffne(s, vollerUrl(basis, '/'), { warte: 200 });
  // Ohne registrierten Dienst (z. B. next dev) löst „ready“ nie aus: nach 5 s abbrechen statt hängen
  const bereit = await s.evaluate(() => Promise.race([
    navigator.serviceWorker.ready.then(() => true).catch(() => false),
    new Promise((ok) => setTimeout(() => ok(false), 5000)),
  ])).catch(() => false);
  for (const p of ['/gebetszeiten', '/', '/gebetszeiten']) await oeffne(s, vollerUrl(basis, p), { warte: 300 });
  const gesteuert = await s.evaluate(() => !!navigator.serviceWorker.controller);
  b.messwert('Dienst bereit / steuert Seite', { bereit, gesteuert });
  await s.context().setOffline(true);
  try {
    await s.goto(vollerUrl(basis, '/gebetszeiten'), { waitUntil: 'load', timeout: 15000 });
    const hG = await h1Text(s);
    b.pruefe('offline: Gebetszeiten aus dem Vorrat', hG === 'Gebetszeiten', hG);
    await s.goto(vollerUrl(basis, '/'), { waitUntil: 'load', timeout: 15000 });
    const hS = await h1Text(s);
    b.pruefe('offline: Startseite aus dem Vorrat', hS === 'IGMG Wetzlar', hS);
  } finally {
    await s.context().setOffline(false);
  }
  b.belege.push(await foto(s, 'F-17', breite));
};

F['F-18'] = async (s, b, breite) => {
  const status = await besuche(s, '/', 300);
  b.pruefe('HTTP 200', status === 200, status);
  await sichtbar(s.getByRole('button', { name: 'Menü öffnen' })).click();
  await s.waitForTimeout(300);
  const offen = await s.evaluate(() => document.querySelectorAll('dialog[open]').length);
  b.pruefe('Mobilmenü öffnet', offen === 1, offen);
  b.pruefe('Fokus im Menü nach Öffnen', await fokusIn(s, 'dialog[open]'), 'Fokus');
  for (let i = 0; i < 12; i++) await s.keyboard.press('Tab');
  b.pruefe('Fokus bleibt nach 12 Tab-Drücken im Menü', await fokusIn(s, 'dialog[open]'), 'Fokus');
  b.belege.push(await foto(s, 'F-18-offen', breite));
  await s.keyboard.press('Escape');
  await s.waitForTimeout(300);
  const nachEsc = await s.evaluate(() => document.querySelectorAll('dialog[open]').length);
  b.pruefe('Esc schließt das Menü', nachEsc === 0, nachEsc);
  const fokus = await s.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent?.trim());
  b.pruefe('Fokus zurück auf den Menüknopf', fokus === 'Menü öffnen', fokus);
};

F['F-19'] = async (s, b, breite) => {
  const status = await besuche(s, '/', 300);
  b.pruefe('HTTP 200', status === 200, status);
  await s.keyboard.press('Tab');
  const erster = await s.evaluate(() => ({ text: document.activeElement?.textContent?.trim() ?? '', href: document.activeElement?.getAttribute('href') ?? '' }));
  b.pruefe('erster Tab-Halt: „Zum Inhalt springen“', erster.text === 'Zum Inhalt springen' && erster.href === '#inhalt', erster);
  await Promise.all([s.waitForURL(/#inhalt$/, { timeout: 5000 }).catch(() => {}), s.keyboard.press('Enter')]);
  await s.waitForTimeout(200);
  const ziel = await s.evaluate(() => ({ hash: location.hash, fokusImInhalt: !!document.activeElement?.closest('#inhalt') || document.activeElement?.id === 'inhalt' }));
  b.pruefe('Enter springt zu #inhalt, Fokus im Inhalt', ziel.hash === '#inhalt' && ziel.fokusImInhalt, ziel);
  b.belege.push(await foto(s, 'F-19', breite));
};

F['F-20'] = async (s, b, breite) => {
  if (!zustand) {
    b.nichtPruefbar('Einladung, Passwort, TOTP, Anmeldung, Dashboard', `Der Prüfserver ${basis} darf nicht gestoppt werden; die Einladung braucht aber den gestoppten Server (anmeldung.mjs einladen). Ersatz: Prüfkopie auf eigenem Port, siehe Protokoll „…-kopie“.`);
    return;
  }
  const status = await oeffne(s, vollerUrl(basis, '/verwaltung'), { warte: 500 });
  const pfad = new URL(s.url()).pathname;
  b.pruefe('Dashboard mit Anmeldezustand (nicht Anmeldeseite)', status === 200 && !/anmelden/.test(pfad), { status, pfad });
  const h1 = await h1Text(s);
  b.pruefe('Dashboard-Überschrift sichtbar', h1.length > 0, h1);
  b.belege.push(await foto(s, 'F-20', breite));
};

F['F-21'] = async (s, b, breite) => {
  if (!zustand) {
    b.nichtPruefbar('Veranstaltung anlegen/bearbeiten, Medien hochladen', 'nur lesend erlaubt: ohne Anmeldezustand kein Lesepfad; Speichern und Hochladen nicht ausgeführt');
    return;
  }
  const liste = await oeffne(s, vollerUrl(basis, '/verwaltung/veranstaltungen'), { warte: 300 });
  b.messwert('Veranstaltungsliste: HTTP', liste);
  const neu = await oeffne(s, vollerUrl(basis, '/verwaltung/veranstaltungen/neu'), { warte: 300 });
  const felder = await s.evaluate(() => document.querySelectorAll('main input:not([type=hidden]),main textarea,main select').length);
  b.messwert('Formular „neu“ (lesend): HTTP / Felder', { status: neu, felder });
  const medien = await oeffne(s, vollerUrl(basis, '/verwaltung/medien'), { warte: 300 });
  const dateifelder = await s.locator('input[type=file]').count();
  b.messwert('Medien (lesend): HTTP / Dateifelder', { status: medien, dateifelder });
  b.nichtPruefbar('Veranstaltung speichern, Medien hochladen (< 4 MB)', 'nur lesend erlaubt: Speichern und Hochladen nicht ausgeführt; gemessen wurden nur die Lesepfade (Messwerte oben)');
  b.belege.push(await foto(s, 'F-21', breite));
};

F['F-22'] = async (s, b) => {
  const antwort = await s.request.get(vollerUrl(basis, '/api/health'));
  const json = await antwort.json().catch(() => null);
  b.pruefe('/api/health HTTP 200 und Status ok', antwort.status() === 200 && json?.status === 'ok', { status: antwort.status(), antwort: json });
};

F['F-23'] = async (s, b, breite) => {
  const feeds = ['/api/ical/de/veranstaltungen', ...ORGS.map((o) => `/api/ical/de/organisation/${o}`)];
  for (const pfad of feeds) {
    const r = await s.request.get(vollerUrl(basis, pfad));
    const t = await r.text();
    const gueltig = r.status() === 200 && /text\/calendar/.test(r.headers()['content-type'] ?? '') && /BEGIN:VCALENDAR/.test(t) && /END:VCALENDAR/.test(t);
    b.pruefe(`Kalender ${pfad}: gültig`, gueltig, { status: r.status(), ereignisse: (t.match(/BEGIN:VEVENT/g) ?? []).length });
  }
  // Zeitvergleich: Startzeit auf der Seite gegen DTSTART im Kalender desselben Termins
  await besuche(s, `/veranstaltungen/${EVENT}`, 200);
  const seite = await s.evaluate(() => document.querySelector('main')?.innerText.match(/(\d{1,2}:\d{2})–\d{1,2}:\d{2} Uhr/)?.[1] ?? null);
  const r = await s.request.get(vollerUrl(basis, `/api/ical/de/veranstaltung/${EVENT}`));
  const t = await r.text();
  const dt = t.match(/DTSTART;TZID=Europe\/Berlin:\d{8}T(\d{2})(\d{2})/);
  const kalender = dt ? `${dt[1]}:${dt[2]}` : null;
  b.pruefe('Startzeit im Kalender = Startzeit auf der Seite (Europe/Berlin)', seite !== null && kalender === seite, { seite, kalender, zeile: dt?.[0] ?? null });
  b.belege.push(await foto(s, 'F-23', breite));
};

F['F-24'] = async (s, b, breite) => {
  // Der Kontext der Schleife hat keine Vormerkung: der Hinweis muss beim ersten Besuch erscheinen.
  await oeffne(s, vollerUrl(basis, '/'), { warte: 500 });
  const offen = await s.evaluate(() => document.getElementById('konzepthinweis')?.open === true);
  b.pruefe('erster Besuch: Hinweis offen', offen, offen);
  b.belege.push(await foto(s, 'F-24-offen', breite));
  await s.getByRole('button', { name: /Verstanden/ }).click();
  await s.waitForTimeout(300);
  const zu = await s.evaluate(() => document.getElementById('konzepthinweis')?.open === false);
  const merker = await s.evaluate((k) => localStorage.getItem(k), KONZEPT_SCHLUESSEL);
  b.pruefe('Schließen über „Verstanden“ und Merker im Gerät', zu && merker === '1', { zu, merker });
  await s.reload({ waitUntil: 'load' });
  await s.waitForTimeout(500);
  const nochmal = await s.evaluate(() => document.getElementById('konzepthinweis')?.open === true);
  b.pruefe('nach Neuladen nicht wieder offen', nochmal === false, nochmal);
  // Zweiter Weg ohne Vormerkung (kein neuerKontext: der setzt den Merker vor)
  const k2 = await s.context().browser().newContext({ viewport: { width: breite, height: GERAETE[breite].hoehe }, deviceScaleFactor: 1 });
  const p2 = await k2.newPage();
  await oeffne(p2, vollerUrl(basis, '/'), { warte: 400 });
  await p2.keyboard.press('Escape');
  await p2.waitForTimeout(300);
  b.pruefe('Esc schließt den Hinweis', (await p2.evaluate(() => document.getElementById('konzepthinweis')?.open === false)) === true, 'open');
  await k2.close();
};

// ---------- Ablauf ----------
const FUNKTIONEN = [
  { id: 'F-01', titel: 'Startseite: Leiste, H1, Knöpfe, Veranstaltungen, Neuigkeiten', ablauf: '`/` öffnen', breiten: [390, 1440] },
  { id: 'F-02', titel: 'Leiste auf jeder Seite außer Gebetszeiten', ablauf: 'Leiste auf 19 Seiten; Telefon: aufklappen', breiten: [390, 1440] },
  { id: 'F-03', titel: '/gebetszeiten: Tabs, Tastatur, Monatstabelle, Qibla', ablauf: 'Tabs per Tastatur; Monat; Kompass', breiten: [390, 1440] },
  { id: 'F-04', titel: 'Gebetszeiten-Anzeige: Vollbild, Schließen, Sprachwechsel', ablauf: '/gebetszeiten/anzeige; X und Esc; 11 s warten', breiten: [390, 1440] },
  { id: 'F-05', titel: 'Veranstaltungen: Kategoriefilter', ablauf: 'Kategorie wählen; „Alle“', breiten: [390, 1440] },
  { id: 'F-06', titel: 'Veranstaltungsdetail: Anmeldung, Pflichtfehler, iCal', ablauf: 'Detail mit anmeldungAktiv; leer absenden; .ics', breiten: [390, 1440] },
  { id: 'F-07', titel: 'Nachrichten: Filter, Ankündigungen, Detail mit ähnlichen Artikeln', ablauf: 'Filter; Detail', breiten: [390, 1440] },
  { id: 'F-08', titel: 'Über uns, Projekte, Vorstand, IGMG (Tabs)', ablauf: 'vier Seiten; Tabs', breiten: [390, 1440] },
  { id: 'F-09', titel: 'Organisationen (vier): Name, Akzentfarbe, Termine', ablauf: 'vier Seiten', breiten: [390, 1440] },
  { id: 'F-10', titel: 'Korankurse: Kurskarten und Aktionen', ablauf: 'Karten; register / join / closed', breiten: [390, 1440] },
  { id: 'F-11', titel: 'Voranmeldung: vier Schritte, Weiter/Zurück, ohne JS sendbar', ablauf: 'Schritte; leer Weiter; Testwerte; Zurück', breiten: [390, 1440] },
  { id: 'F-12', titel: 'Kontakt: Pflichtprüfung, Karte nach Klick', ablauf: 'leer absenden; Karte', breiten: [390, 1440] },
  { id: 'F-13', titel: 'Mitglied werden, Moschee-Anfrage, Meldung: Pflichtprüfung', ablauf: 'leer Weiter bzw. Senden', breiten: [390, 1440] },
  { id: 'F-14', titel: 'Suche: Ergebnisse, noindex', ablauf: '/suche?q=Gebet', breiten: [390, 1440] },
  { id: 'F-15', titel: 'Sprachwahl de → tr → en, lokalisierter Pfad', ablauf: 'Sprachwahl bzw. Menü', breiten: [390, 1440] },
  { id: 'F-16', titel: 'Unbekannte Adresse: 404 mit Weg zurück', ablauf: '/nicht-vorhanden-xyz', breiten: [390, 1440] },
  { id: 'F-17', titel: 'Offline-Seite und Service Worker', ablauf: '/offline; sw.js; offline laden', breiten: [390, 1440] },
  { id: 'F-18', titel: 'Mobilmenü (390): öffnen, Fokus, Esc', ablauf: 'Menü öffnen; Tab; Esc', breiten: [390] },
  { id: 'F-19', titel: 'Sprunglink „Zum Inhalt“', ablauf: 'erster Tab-Halt; Enter', breiten: [390, 1440] },
  { id: 'F-20', titel: 'Verwaltung: Einladung, Passwort, TOTP, Anmeldung, Dashboard', ablauf: 'Anmeldezustand (anmeldung.mjs)', breiten: [1440] },
  { id: 'F-21', titel: 'Verwaltung: Veranstaltung anlegen/bearbeiten, Medien hochladen', ablauf: 'nur lesend (Speichern verboten)', breiten: [1440] },
  { id: 'F-22', titel: '/api/health', ablauf: 'GET /api/health', breiten: [390, 1440] },
  { id: 'F-23', titel: 'iCal-Abo je Organisation: gültiger Kalender, Zeiten', ablauf: '/api/ical/…', breiten: [390, 1440] },
  { id: 'F-24', titel: 'Konzept-Hinweis: erster Besuch, schließen, nicht wieder', ablauf: 'frischer Kontext; schließen; neu laden', breiten: [390, 1440] },
];

const browser = await starteBrowser();
const lauf = { werkzeug: 'funktionsliste.mjs', basis, zeit: new Date().toISOString(), browser: browser.version(), bilder: bildOrdner, zustand: zustandDatei ? 'ja' : 'nein' };
const ergebnisse = [];
let technisch = 0;

for (const f of FUNKTIONEN) {
  if (nurIds && !nurIds.includes(f.id)) continue;
  const proBreite = {};
  for (const breite of [390, 1440]) {
    if (!f.breiten.includes(breite)) {
      proBreite[breite] = { status: '–', grund: `nicht vorgesehen (Erwartung: ${f.breiten.join(' / ')} px)` };
      continue;
    }
    const b = new Befunde();
    // F-24 braucht einen Kontext ohne Vormerkung des Konzept-Hinweises
    const kontext = f.id === 'F-24'
      ? await browser.newContext({ viewport: { width: breite, height: GERAETE[breite].hoehe }, deviceScaleFactor: 1 })
      : await neuerKontext(browser, { viewport: { width: breite, height: GERAETE[breite].hoehe }, deviceScaleFactor: 1, ...(zustand ? { storageState: zustand } : {}) });
    // Eigene Absenderadresse aus dem Testnetz je Kontext (Einsendungsgrenze je IP; PROXY_VERTRAUEN=1, wie anmeldung.mjs)
    await kontext.setExtraHTTPHeaders({ 'x-forwarded-for': `198.18.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}` });
    const seite = await kontext.newPage();
    seite.setDefaultTimeout(10000);
    const fehlerAntworten = [];
    seite.on('request', (r) => { if (r.method() === 'POST' && r.url().startsWith(basis)) b.posts += 1; });
    seite.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(basis)) fehlerAntworten.push(`${r.status()} ${new URL(r.url()).pathname}`); });
    try {
      await F[f.id](seite, b, breite, kontext);
    } catch (fehler) {
      technisch += 1;
      b.liste.push({ pruefung: 'Werkzeug-Lauf', ergebnis: 'nicht prüfbar', grund: `technischer Fehler im Werkzeug (bitte prüfen): ${String(fehler.message ?? fehler).split('\n')[0].slice(0, 240)}` });
    }
    const endbild = await foto(seite, f.id, breite, 'ende').catch(() => null);
    proBreite[breite] = { status: b.gesamt(), befunde: b.liste, posts: b.posts, http4xx: fehlerAntworten.slice(0, 8), bilder: [...b.belege, endbild].filter(Boolean) };
    await kontext.close();
    process.stdout.write(`${f.id} ${breite}: ${proBreite[breite].status}\n`);
  }
  ergebnisse.push({ id: f.id, titel: f.titel, ablauf: f.ablauf, ...proBreite });
}
await browser.close();

// ---------- Protokoll ----------
const md = [];
md.push(`# E0-PRUEFER-03 · Funktionsliste F-01 … F-24 · Stand ${basis}`);
md.push('');
if (values.hinweis) { md.push(`> ${values.hinweis}`); md.push(''); }
md.push(`Zeitpunkt: ${lauf.zeit} · Browser: Chromium ${lauf.browser} · Breiten: 390 und 1440, sofern nicht anders vorgesehen · Konzept-Hinweis: vorgemerkt (außer F-24) · Belegbilder: \`${bildOrdner}\` · Verwaltungszustand: ${lauf.zustand}.`);
md.push('');
md.push('Ergebnis je Zeile: erfüllt, nicht erfüllt oder nicht prüfbar (mit Grund). Einzelprüfungen stehen unter „Einzelbefunde“. Messwerte zählen nicht zum Ergebnis. Formular-POSTs sind aus dem Netzwerk gezählt.');
md.push('');
md.push('| ID | Funktion | Ablauf | 390 | 1440 |');
md.push('|---|---|---|---|---|');
for (const e of ergebnisse) md.push(`| ${e.id} | ${e.titel} | ${e.ablauf} | ${e['390'].status} | ${e['1440'].status} |`);
md.push('');
md.push('## Einzelbefunde');
for (const e of ergebnisse) {
  md.push('');
  md.push(`### ${e.id} · ${e.titel}`);
  for (const br of [390, 1440]) {
    const r = e[br];
    if (r.status === '–') { md.push(`- ${br} px: ${r.grund}`); continue; }
    md.push(`- ${br} px: **${r.status}** · Formular-POSTs: ${r.posts} · HTTP ≥ 400: ${r.http4xx.length ? r.http4xx.join('; ') : 'keine'}`);
    for (const x of r.befunde) {
      const detail = x.grund ?? (x.gemessen !== undefined ? JSON.stringify(x.gemessen) : '');
      md.push(`  - ${x.ergebnis} · ${x.pruefung}${detail ? ' · ' + detail : ''}`);
    }
    if (r.bilder.length) md.push(`  - Bilder: ${r.bilder.map((p) => '`' + p + '`').join(', ')}`);
  }
}
md.push('');
md.push(`Technische Fehler des Werkzeugs: ${technisch}.`);

const pfade = schreibeProtokoll(values.protokoll, { json: { lauf, ergebnisse }, md: md.join('\n') });
console.log(`Protokoll: ${pfade.join(' · ')}`);
console.log(`Funktionen: ${ergebnisse.length} · technische Fehler: ${technisch}`);
process.exitCode = technisch > 0 ? 1 : 0;
