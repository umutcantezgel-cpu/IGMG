#!/usr/bin/env node
// Netzprotokoll der Sprechübung (L8-02, KERN 4.0 §9, ABNAHME Z-L07 „Whisper nur nach Klick“, Z-L08): Lektion l04 des
// Testkurses (Oberfläche de, Kurs tr-aus-de) bis zur Sprechaufgabe spielen und dabei jede Anfrage der Seite, ihrer Worker und
// des Service Workers mitschreiben. Belegt wird:
// 1. Bis die Sprechaufgabe sichtbar ist, keine Anfrage unter /lern-app/modelle/ (Worker, ORT-WASM, Whisper-Gewichte).
// 2. Erst der Klick auf „Sprachprüfung laden (≈ … MB)“ lädt sie – nur GET, nur eigener Ursprung; Liste mit Größen.
// 3. Nach „bereit“ (oder Zeitgrenze) keine Anfrage an fremde Ursprünge.
// 4. Jede der 10 Download-Dateien (`DOWNLOAD_PFADE` in web/src/lib/lernapp/sprechen/modell.ts: 7 Modell- und
//    Konfigurationsdateien, ORT `.mjs` und `.wasm`, Worker) geht genau einmal über das Netz – keine fehlt (Tokenizer,
//    Prozessor), keine kommt doppelt. „Über das Netz“: Anfrage des Service Workers, oder eine Anfrage der Seite bzw. eines
//    Workers, die nicht der Service Worker beantwortet hat (Playwright zählt sonst jede Datei zweimal).
// Gerät wie die E2E (typen-b.spec.ts `geraet`): 8 GB Arbeitsspeicher, 10 GB frei; Mikrofon als Attrappe von Chromium.
// Aufruf: node whisper-netz.mjs [--aus whisper-netz]
import { parseArgs } from 'node:util';
import { BASIS, last, lernTexte, schreibe, starteBrowser } from './gemeinsam.mjs';
// Node 24 entfernt die Typen selbst; modell.ts hat nur Typ-Importe
import { DOWNLOAD_PFADE } from '../../../web/src/lib/lernapp/sprechen/modell.ts';

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
// Diagnose (L8-02): Konsole von Seite und Workern, Seitenfehler; Endzustand der Sprachprüfung (bereit, Rückfall, Fehler)
const konsole = [];
const notiere = (quelle, typ, text) => konsole.length < 200 && konsole.push({ quelle, typ, text: String(text).slice(0, 300) });
seite.on('console', (m) => ['error', 'warning'].includes(m.type()) && notiere('Seite', m.type(), m.text()));
seite.on('pageerror', (e) => notiere('Seite', 'pageerror', e.message));
seite.on('worker', (w) => w.on('console', (m) => notiere(`Worker ${new URL(w.url()).pathname}`, m.type(), m.text())));
let endzustand = null;

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
  // Ende bei „bereit“ oder beim Rückfall bzw. Fehler (die App fällt auf eigene Aufnahme zurück); Text irgendwo in main
  const ende = { bereit: t.sprechen.bereit, rueckfall: t.sprechen.rueckfall, fehler: t.sprechen.fehler };
  endzustand = await Promise.any(
    Object.entries(ende).map(([art, text]) =>
      seite.locator('main').getByText(text, { exact: true }).first().waitFor({ state: 'attached', timeout: 600_000 }).then(() => art),
    ),
  ).catch(() => 'zeitgrenze');
  if (endzustand !== 'bereit') throw new Error(`Endzustand der Sprachprüfung: ${endzustand}`);
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
  let vomSw = false;
  try {
    const antwort = await a.anfrage.response();
    status = antwort?.status() ?? null;
    vomSw = antwort?.fromServiceWorker() ?? false;
    const laenge = antwort?.headers()['content-length'];
    // ohne Content-Length (gepackte Antworten): übertragene Größe des Körpers
    bytes = laenge ? Number(laenge) : ((await a.anfrage.sizes().catch(() => null))?.responseBodySize ?? null);
  } catch {
    /* ohne Antwort */
  }
  zeilen.push({
    phase: a.phase,
    quelle: a.quelle,
    methode: a.methode,
    pfad: a.pfad,
    fremd: !a.url.startsWith(ursprung) && !a.url.startsWith('blob:') && !a.url.startsWith('data:'),
    netz: a.quelle === 'Service Worker' || !vomSw,
    status,
    bytes,
  });
}
await browser.close();

const modell = (z) => z.pfad.startsWith('/lern-app/modelle/');
const vorher = zeilen.filter((z) => z.phase === 'vor der Sprechaufgabe');
const nachher = zeilen.filter((z) => z.phase !== 'vor der Sprechaufgabe');
// je Download-Datei die Abrufe über das Netz nach dem Klick (Pfad ohne Suchteil)
const netzNachher = nachher.filter((z) => z.netz && modell(z));
const abrufe = Object.fromEntries(DOWNLOAD_PFADE.map((d) => [d, netzNachher.filter((z) => z.pfad === d).length]));
const fehlend = DOWNLOAD_PFADE.filter((d) => abrufe[d] === 0);
const mehrfach = DOWNLOAD_PFADE.filter((d) => abrufe[d] > 1);
const netzBytes = netzNachher.reduce((s, z) => s + (z.bytes ?? 0), 0);
const ergebnis = {
  basis: BASIS,
  erfuellt: bereit && !fehler && !fehlend.length && !mehrfach.length,
  abrufe,
  fehlend,
  mehrfach,
  netzMb: Math.round(netzBytes / 1e5) / 10,
  fehler,
  bereit,
  endzustand,
  ladenMs,
  konsole,
  last: { beginn: lastBeginn, ende: last() },
  anfragenVorKlick: vorher.length,
  modellVorKlick: vorher.filter(modell).map((z) => z.pfad),
  modellNachKlick: nachher.filter(modell).map((z) => ({
    pfad: z.pfad,
    status: z.status,
    mb: z.bytes ? Math.round((z.bytes / 1e6) * 10) / 10 : null,
    quelle: z.quelle,
    netz: z.netz,
  })),
  nichtGet: zeilen.filter((z) => z.methode !== 'GET').map((z) => `${z.methode} ${z.pfad}`),
  fremd: zeilen.filter((z) => z.fremd).map((z) => `${z.methode} ${z.pfad}`),
  anfragen: zeilen,
};
const md = [
  `# Netzprotokoll Sprechübung (Whisper nur nach Klick) · ${BASIS}`,
  '',
  `Lektion l04 (de, tr-aus-de) bis zur Sprechaufgabe: ${vorher.length} Anfragen, davon unter /lern-app/modelle/: ${ergebnis.modellVorKlick.length}${ergebnis.modellVorKlick.length ? ` (${ergebnis.modellVorKlick.join(', ')})` : ''}.`,
  `Nach dem Klick: ${ergebnis.modellNachKlick.length} Anfragen unter /lern-app/modelle/, davon ${netzNachher.length} über das Netz (≈ ${ergebnis.netzMb} MB), „bereit“: ${bereit ? `ja, nach ${Math.round(ladenMs / 1000)} s` : 'nein'}${fehler ? ` · Fehler: ${fehler}` : ''}.`,
  `Download-Dateien (${DOWNLOAD_PFADE.length}) je genau einmal über das Netz: ${!fehlend.length && !mehrfach.length ? 'ja' : 'nein'}${fehlend.length ? ` · fehlend: ${fehlend.join(', ')}` : ''}${mehrfach.length ? ` · mehrfach: ${mehrfach.map((d) => `${d} (${abrufe[d]})`).join(', ')}` : ''}. Ergebnis: ${ergebnis.erfuellt ? 'erfüllt' : 'NICHT erfüllt'}.`,
  `Andere Methoden als GET: ${ergebnis.nichtGet.length ? ergebnis.nichtGet.join(', ') : 'keine'} · fremde Ursprünge: ${ergebnis.fremd.length ? ergebnis.fremd.join(', ') : 'keine'}.`,
  `Last: Beginn ${ergebnis.last.beginn.l1}, Ende ${ergebnis.last.ende.l1}. Endzustand: ${endzustand ?? '–'}.`,
  '',
  ...(konsole.length
    ? ['Konsole (Fehler und Warnungen der Seite, alles aus Workern):', '', ...konsole.slice(0, 30).map((k) => `- ${k.quelle} · ${k.typ}: ${k.text}`), '']
    : []),
  '| Datei nach dem Klick | Status | MB | Quelle | über das Netz |',
  '|---|---|---|---|---|',
  ...ergebnis.modellNachKlick.map((z) => `| ${z.pfad} | ${z.status ?? '–'} | ${z.mb ?? '–'} | ${z.quelle} | ${z.netz ? 'ja' : 'nein (vom Service Worker)'} |`),
].join('\n');
schreibe(`${values.aus}.md`, md);
schreibe(`${values.aus}.json`, ergebnis);
console.log(md);
process.exitCode = ergebnis.erfuellt ? 0 : 1;
