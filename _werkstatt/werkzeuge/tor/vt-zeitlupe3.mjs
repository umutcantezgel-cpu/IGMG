// E3-TOR-PRUEFER: Seitenwechsel B-05 in Zeitlupe (CDP Animation.setPlaybackRate 0,1 auf der Dokumentzeitleiste), damit
// Überblendung und Morph gemeinsamer Elemente (Karte → Detail) zwischen Bildern sichtbar werden. Der Klick auf den
// Kartenlink erfolgt im Browser (ohne Scrollen). Je Bild: Adresse, Zähler startViewTransition, laufende Animationen
// (Name, Pseudo-Element, Zeitstand). Ende: Ziel erreicht und Übergang vorüber, oder nach 40 s.
// Umgebung: BASIS, OUT (Bilderordner), VON (Startpfad), SELEKTOR (Linkselektor, z. B. a[href*="…"]),
//           ZIEL (Pfad der Zielseite, zur Erkennung), RATE (Standard 0,1), BILDER (Standard 5), SCHRITT (ms, Standard 800),
//           PROTOKOLL (Basisname für .json), BREITE (Standard 1440).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { basisAdresse, neuerKontext, oeffne, starteBrowser } from '/home/user/IGMG/_werkstatt/werkzeuge/hilfen.mjs';

const BASIS = basisAdresse(process.env.BASIS ?? 'http://127.0.0.1:3400');
const OUT = process.env.OUT;
const PROTOKOLL = process.env.PROTOKOLL;
const VON = process.env.VON ?? '/nachrichten';
const SELEKTOR = process.env.SELEKTOR;
const ZIEL = process.env.ZIEL;
const RATE = Number(process.env.RATE ?? 0.1);
const BILDER = Number(process.env.BILDER ?? 5);
const SCHRITT = Number(process.env.SCHRITT ?? 800);
const BREITE = Number(process.env.BREITE ?? 1440);
const HOEHE = BREITE > 500 ? 900 : 844;
if (!OUT || !SELEKTOR || !ZIEL) throw new Error('OUT, SELEKTOR und ZIEL sind Pflicht');
mkdirSync(OUT, { recursive: true });

const browser = await starteBrowser();
const ergebnis = { werkzeug: 'vt-zeitlupe3', basis: BASIS, von: VON, ziel: ZIEL, selektor: SELEKTOR, rate: RATE, breite: BREITE, bilder: [] };
try {
  const kontext = await neuerKontext(browser, { viewport: { width: BREITE, height: HOEHE }, reducedMotion: 'no-preference' });
  await kontext.addInitScript(() => {
    window.__vt = 0;
    const orig = Document.prototype.startViewTransition;
    Document.prototype.startViewTransition = function (...a) {
      window.__vt++;
      return orig.apply(this, a);
    };
  });
  const seite = await kontext.newPage();
  await oeffne(seite, BASIS + VON, { warte: 2000 });
  await seite.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  await seite.evaluate(() => window.scrollTo(0, 0));
  await seite.waitForTimeout(300);

  const cdp = await kontext.newCDPSession(seite);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: RATE });
  ergebnis.kopfVorKlick = await seite.evaluate(() => Math.round(document.querySelector('header')?.getBoundingClientRect().top ?? -1));

  const start = Date.now();
  const geklickt = await seite.evaluate((sel) => {
    const a = [...document.querySelectorAll(sel)].find((x) => x.offsetParent !== null);
    if (!a) return false;
    a.click();
    return true;
  }, SELEKTOR);
  if (!geklickt) throw new Error(`Kein sichtbarer Link für ${SELEKTOR}`);

  let nr = 0;
  let zielErreicht = false;
  let nachZiel = 0;
  while (nr < BILDER && Date.now() - start < 40000) {
    const info = await seite.evaluate(() => {
      const laufende = document.getAnimations().filter((a) => a.playState === 'running');
      return {
        adresse: location.pathname,
        vt: window.__vt,
        kopfTop: Math.round(document.querySelector('header')?.getBoundingClientRect().top ?? -1),
        laufend: laufende.length,
        animationen: laufende.slice(0, 10).map((a) => ({
          name: a.animationName || a.transitionProperty || '(sonst)',
          pseudo: a.effect?.pseudoElement ?? null,
          ziel: String(a.effect?.target?.getAttribute?.('style') ?? '').slice(0, 0) || (a.effect?.target?.tagName ?? '?'),
          zeitstandMs: a.currentTime === null ? null : Math.round(a.currentTime),
        })),
      };
    });
    nr += 1;
    const bild = join(OUT, `zeitlupe-${String(nr).padStart(2, '0')}.jpg`);
    await seite.screenshot({ path: bild, type: 'jpeg', quality: 70 });
    ergebnis.bilder.push({ nr, msNachKlick: Date.now() - start, ...info, bild });
    if (info.adresse === ZIEL) {
      zielErreicht = true;
      nachZiel += 1;
    }
    await seite.waitForTimeout(SCHRITT);
  }
  // Ende: Übergang abwarten (Zeitlupe), dann Ziel prüfen
  await seite.waitForTimeout(1500);
  ergebnis.endeAdresse = await seite.evaluate(() => location.pathname);
  ergebnis.endeVt = await seite.evaluate(() => window.__vt);
  ergebnis.zielErreicht = zielErreicht && ergebnis.endeAdresse === ZIEL;
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 }).catch(() => {});
  await kontext.close();
} finally {
  await browser.close();
}
const text = `${JSON.stringify(ergebnis, null, 2)}\n`;
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'ergebnis.json'), text);
if (PROTOKOLL) {
  mkdirSync(dirname(PROTOKOLL), { recursive: true });
  writeFileSync(`${PROTOKOLL}.json`, text);
}
for (const b of ergebnis.bilder) {
  console.log(`Bild ${b.nr}: ${b.msNachKlick} ms · ${b.adresse} · vt ${b.vt} · Kopf ${b.kopfTop} · laufend ${b.laufend} · ${b.animationen.map((a) => `${a.name}${a.pseudo ? ` ${a.pseudo}` : ''}@${a.zeitstandMs}`).join(', ')}`);
}
console.log(`Ziel erreicht: ${ergebnis.zielErreicht} · Ende ${ergebnis.endeAdresse} · vt ${ergebnis.endeVt} · Kopf vor Klick ${ergebnis.kopfVorKlick}`);
