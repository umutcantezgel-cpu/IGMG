#!/usr/bin/env node
// Netzprotokoll der Sprechübung (L8-02, KERN 4.0 §9, ABNAHME Z-L07 „Whisper nur nach Klick“, Z-L08): Lektion l04 des
// Testkurses (Oberfläche de, Kurs tr-aus-de) bis zur Sprechaufgabe spielen und dabei jede Anfrage der Seite, ihrer Worker und
// des Service Workers mitschreiben. Belegt wird:
// 1. Bis die Sprechaufgabe sichtbar ist, keine Anfrage unter /lern-app/modelle/ (Worker, ORT-WASM, Whisper-Gewichte).
// 2. Erst der Klick auf „Sprachprüfung laden (≈ … MB)“ lädt sie – nur GET, nur eigener Ursprung; Liste mit Größen.
// 3. Nach „bereit“ (oder Zeitgrenze) keine Anfrage an fremde Ursprünge.
// Gerät wie die E2E (typen-b.spec.ts `geraet`): 8 GB Arbeitsspeicher, 10 GB frei; Mikrofon als Attrappe von Chromium.
// Aufruf: node whisper-netz.mjs [--aus whisper-netz]
import { parseArgs } from 'node:util';
import { BASIS, last, lernTexte, schreibe, starteBrowser } from './gemeinsam.mjs';

const { values } = parseArgs({ options: { aus: { type: 'string', default: 'whisper-netz' } } });
const t = lernTexte('de');
const ursprung = new URL(BASIS).origin;

const browser = await starteBrowser({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
const kontext = await browser.newContext({ baseURL: BASIS, viewport: { width: 1440, height: 900 }, permissions: ['microphone'] });
await kontext.addInitScript(() => {
  Object.defineProperty(navigator, 'deviceMemory', { configurable: true, get: () => 8 });
  if (navigator.storage) navigator.storage.estimate = async () => ({ quota: 10_000_000_000, usage: 0 });
});
const anfragen = [];
let phase = 'vor der Sprechaufgabe';
const merke = (r, quelle) =>
  anfragen.push({ phase, quelle, methode: r.method(), url: r.url(), pfad: new URL(r.url()).pathname, anfrage: r });
kontext.on('request', (r) => merke(r, r.serviceWorker() ? 'Service Worker' : 'Seite/Worker'));
const seite = await kontext.newPage();
seite.setDefaultTimeout(60_000);

const knopf = (name) => seite.getByRole('button', { name, exact: true });
const radio = (name) => seite.locator('main label').filter({ has: seite.getByRole('radio', { name, exact: true }) });
const ueberschrift = (text) => seite.getByRole('heading', { level: 2, name: text, exact: true }).waitFor();
async function pruefenWeiter() {
  await knopf(t.spieler.pruefen).click();
  await knopf(t.spieler.weiter).click();
}

const lastBeginn = last();
let fehler = null;
let bereit = false;
let ladenMs = null;
try {
  await seite.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.e01.l04', { waitUntil: 'load' });
  // dialog
  await ueberschrift(t.aufgaben2.dialog.anweisung);
  await radio('İyiyim, teşekkürler.').click();
  await pruefenWeiter();
  // geschichte
  await ueberschrift(t.aufgaben2.geschichte.anweisung);
  await knopf(t.aufgaben2.geschichte.weiterLesen).click();
  await knopf(t.ansichten.geschichte.bisZurFrage).click();
  await radio('kitap').click();
  await knopf(t.aufgaben2.geschichte.fragePruefen).click();
  await knopf(t.aufgaben2.geschichte.abschliessen).click();
  await knopf(t.spieler.weiter).click();
  // lesen_fragen
  await ueberschrift(t.aufgaben2.lesenFragen.anweisung);
  await radio(t.aufgaben2.lesenFragen.rfn.richtig).click();
  await radio('kitap').click();
  await pruefenWeiter();
  // grammatik_tipp
  await ueberschrift(t.aufgaben2.grammatikTipp.anweisung);
  await knopf(t.aufgaben2.grammatikTipp.verstanden).click();
  // schrift_tr
  await ueberschrift(t.aufgaben2.schriftWahl.grossKlein);
  await radio('Ş').click();
  await pruefenWeiter();
  // sprechen: Angebot sichtbar, noch nichts geladen
  await ueberschrift(t.sprechen.anweisung);
  await seite.getByText(t.sprechen.ladenText, { exact: true }).waitFor();
  await seite.waitForLoadState('networkidle').catch(() => undefined);
  phase = 'nach dem Klick';
  const t0 = Date.now();
  await seite.getByRole('button', { name: /^Sprachprüfung laden/ }).click();
  await seite.locator('main p[role="status"].sr-only').first().filter({ hasText: t.sprechen.bereit }).waitFor({ timeout: 600_000 });
  bereit = true;
  ladenMs = Date.now() - t0;
  phase = 'nach „bereit“';
  await seite.waitForLoadState('networkidle').catch(() => undefined);
} catch (e) {
  fehler = String(e.message ?? e).split('\n')[0];
}

// Größen der Antworten (Content-Length bzw. Länge des Körpers)
const zeilen = [];
for (const a of anfragen) {
  let bytes = null;
  let status = null;
  try {
    const antwort = await a.anfrage.response();
    status = antwort?.status() ?? null;
    const laenge = antwort?.headers()['content-length'];
    bytes = laenge ? Number(laenge) : null;
  } catch {
    /* ohne Antwort */
  }
  zeilen.push({
    phase: a.phase,
    quelle: a.quelle,
    methode: a.methode,
    pfad: a.pfad,
    fremd: !a.url.startsWith(ursprung) && !a.url.startsWith('blob:') && !a.url.startsWith('data:'),
    status,
    bytes,
  });
}
await browser.close();

const modell = (z) => z.pfad.startsWith('/lern-app/modelle/');
const vorher = zeilen.filter((z) => z.phase === 'vor der Sprechaufgabe');
const nachher = zeilen.filter((z) => z.phase !== 'vor der Sprechaufgabe');
const ergebnis = {
  basis: BASIS,
  fehler,
  bereit,
  ladenMs,
  last: { beginn: lastBeginn, ende: last() },
  anfragenVorKlick: vorher.length,
  modellVorKlick: vorher.filter(modell).map((z) => z.pfad),
  modellNachKlick: nachher
    .filter(modell)
    .map((z) => ({ pfad: z.pfad, status: z.status, mb: z.bytes ? Math.round((z.bytes / 1048576) * 10) / 10 : null, quelle: z.quelle })),
  nichtGet: zeilen.filter((z) => z.methode !== 'GET').map((z) => `${z.methode} ${z.pfad}`),
  fremd: zeilen.filter((z) => z.fremd).map((z) => `${z.methode} ${z.pfad}`),
  anfragen: zeilen,
};
const summeMb = ergebnis.modellNachKlick.reduce((s, z) => s + (z.mb ?? 0), 0);
const md = [
  `# Netzprotokoll Sprechübung (Whisper nur nach Klick) · ${BASIS}`,
  '',
  `Lektion l04 (de, tr-aus-de) bis zur Sprechaufgabe: ${vorher.length} Anfragen, davon unter /lern-app/modelle/: ${ergebnis.modellVorKlick.length}${ergebnis.modellVorKlick.length ? ` (${ergebnis.modellVorKlick.join(', ')})` : ''}.`,
  `Nach dem Klick: ${ergebnis.modellNachKlick.length} Dateien unter /lern-app/modelle/ (≈ ${Math.round(summeMb)} MB laut Content-Length), „bereit“: ${bereit ? `ja, nach ${Math.round(ladenMs / 1000)} s` : 'nein'}${fehler ? ` · Fehler: ${fehler}` : ''}.`,
  `Andere Methoden als GET: ${ergebnis.nichtGet.length ? ergebnis.nichtGet.join(', ') : 'keine'} · fremde Ursprünge: ${ergebnis.fremd.length ? ergebnis.fremd.join(', ') : 'keine'}.`,
  `Last: Beginn ${ergebnis.last.beginn.l1}, Ende ${ergebnis.last.ende.l1}.`,
  '',
  '| Datei nach dem Klick | Status | MB | Quelle |',
  '|---|---|---|---|',
  ...ergebnis.modellNachKlick.map((z) => `| ${z.pfad} | ${z.status ?? '–'} | ${z.mb ?? '–'} | ${z.quelle} |`),
].join('\n');
schreibe(`${values.aus}.md`, md);
schreibe(`${values.aus}.json`, ergebnis);
console.log(md);
