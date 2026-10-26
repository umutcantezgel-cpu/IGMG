#!/usr/bin/env node
// Netzprotokoll der Sprechübung (L8-02, KERN 4.0 §9, ABNAHME Z-L07 „Whisper nur nach Klick“, Z-L08): Lektion l04 des
// Testkurses (Oberfläche de, Kurs tr-aus-de) bis zur Sprechaufgabe spielen und dabei jede Anfrage der Seite, ihrer Worker und
// des Service Workers mitschreiben. Belegt wird:
// 1. Bis die Sprechaufgabe sichtbar ist, keine Anfrage unter /lern-app/modelle/ (Worker, ORT-WASM, Whisper-Gewichte).
// 2. Erst der Klick auf „Sprachprüfung laden (≈ … MB)“ lädt sie – nur GET, nur eigener Ursprung; Liste mit Größen.
// 3. Nach „bereit“ (oder Zeitgrenze) keine Anfrage an fremde Ursprünge.
// 4. Jede der 11 Download-Dateien (`DOWNLOAD_PFADE` in web/src/lib/lernapp/sprechen/modell.ts: 7 Modell- und
//    Konfigurationsdateien, ORT `.mjs` und `.wasm`, Worker, seit Stufe C (Z-L17) auch die Drittlizenzen von ORT unter
//    /lern-app/lizenzen/) geht genau einmal über das Netz – keine fehlt (Tokenizer,
//    Prozessor), keine kommt doppelt. „Über das Netz“: Anfrage des Service Workers, oder eine Anfrage der Seite bzw. eines
//    Workers, die nicht der Service Worker beantwortet hat (Playwright zählt sonst jede Datei zweimal).
// 5. (Stufe C N9b, Z-L08 „auch nach dem Laden des Modells; Sprachaufnahmen verlassen das Gerät nie“) Nach „bereit“ nimmt die
//    Übung über das Testmikrofon von Chromium auf (`--use-file-for-fake-audio-capture`, WAV aus den Clips des synthetischen
//    Testbündels `drizzle/seeds/lernapp-testaudio/tr/*.lpa`, mit ffmpeg dekodiert; ohne ffmpeg eine synthetische Tonfolge) und
//    erkennt bis zum Ergebnis. Über die ganze Sitzung (Seite, Worker, Service Worker) stehen alle Anfragen mit Methode und
//    Adresse im Protokoll; erwartet: nur GET an den eigenen Ursprung, 0 fremde Hosts, 0 POST/PUT/PATCH/DELETE – auch während
//    und nach Aufnahme und Erkennung –, keine Cookies. Der Worker muss der echte sein (nicht die E2E-Attrappe).
// Gerät wie die E2E (typen-b.spec.ts `geraet`): 8 GB Arbeitsspeicher, 10 GB frei.
// Aufruf: node whisper-netz.mjs [--aus whisper-netz] [--wav <datei>] [--nachlauf-s 10]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { BASIS, last, lernTexte, schreibe, starteBrowser, WEB } from './gemeinsam.mjs';
// Node 24 entfernt die Typen selbst; modell.ts hat nur Typ-Importe
import { DOWNLOAD_PFADE } from '../../../web/src/lib/lernapp/sprechen/modell.ts';

const { values } = parseArgs({
  options: {
    aus: { type: 'string', default: 'whisper-netz' },
    wav: { type: 'string' },
    'nachlauf-s': { type: 'string', default: '10' },
  },
});
const t = lernTexte('de');
const ursprung = new URL(BASIS).origin;

/** 16-kHz-Mono-WAV aus PCM (s16le). */
function wav(pcm) {
  const b = Buffer.alloc(44);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + pcm.length, 4);
  b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(16_000, 24);
  b.writeUInt32LE(32_000, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([b, pcm]);
}

/**
 * Testaufnahme: die Clips des synthetischen Testbündels (Opus in WebM, Kopf wie src/lib/lernapp/paket/buendel.ts: 4 Bytes
 * Kennung, 4 Bytes Kopflänge, JSON-Kopf mit `clips[].versatz/laenge`) mit ffmpeg zu PCM, je 0,3 s Pause, höchstens 6 s.
 * Ohne ffmpeg: Tonfolge wie tests/e2e/lernapp/ton.ts.
 */
function testAufnahme() {
  const ordner = mkdtempSync(join(tmpdir(), 'whisper-netz-'));
  const ziel = join(ordner, 'aufnahme.wav');
  const pause = Buffer.alloc(0.3 * 32_000);
  try {
    const verzeichnis = join(WEB, 'drizzle', 'seeds', 'lernapp-testaudio', 'tr');
    const datei = readdirSync(verzeichnis).find((d) => d.endsWith('.lpa'));
    const bytes = readFileSync(join(verzeichnis, datei));
    const n = bytes.readUInt32BE(4);
    const kopf = JSON.parse(bytes.subarray(8, 8 + n).toString('utf8'));
    const teile = [];
    let laenge = 0;
    for (const [i, c] of kopf.clips.entries()) {
      const clip = join(ordner, `clip-${i}.webm`);
      writeFileSync(clip, bytes.subarray(c.versatz, c.versatz + c.laenge));
      const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', clip, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], {
        maxBuffer: 64 * 1024 * 1024,
      });
      teile.push(pcm, pause);
      laenge += pcm.length + pause.length;
      if (laenge > 6 * 32_000) break;
    }
    writeFileSync(ziel, wav(Buffer.concat(teile)));
    return { pfad: ziel, quelle: `Testbündel tr/${datei} (${teile.length / 2} Clips, ffmpeg)`, sekunden: laenge / 32_000 };
  } catch (e) {
    const n = 16_000 * 3;
    const pcm = Buffer.alloc(n * 2);
    for (let i = 0; i < n; i++) {
      const s = i / 16_000;
      const an = Math.floor(s / 0.3) % 2 === 0;
      const f = 180 + 60 * (Math.floor(s / 0.6) % 3);
      pcm.writeInt16LE(an ? Math.round(0.3 * Math.sin(2 * Math.PI * f * s) * 32_767) : 0, i * 2);
    }
    writeFileSync(ziel, wav(pcm));
    return { pfad: ziel, quelle: `synthetische Tonfolge (ohne ffmpeg: ${String(e.message ?? e).split('\n')[0]})`, sekunden: 3 };
  }
}
const aufnahme = values.wav ? { pfad: values.wav, quelle: values.wav, sekunden: null } : testAufnahme();

// der Worker unter /lern-app/modelle/sprechen/ muss der echte sein (Lizenzkopf, ≈ 690 KB), nicht die E2E-Attrappe
const arbeiterText = await (await fetch(`${BASIS}/lern-app/modelle/sprechen/whisper.worker.mjs?v=pruefung`)).text();
const arbeiter = { bytes: Buffer.byteLength(arbeiterText), echt: arbeiterText.startsWith('/*! Sprechuebung der Lern-App') };

const browser = await starteBrowser({
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${aufnahme.pfad}`],
});
const kontext = await browser.newContext({ baseURL: BASIS, viewport: { width: 1440, height: 900 }, permissions: ['microphone'] });
await kontext.addInitScript(() => {
  Object.defineProperty(navigator, 'deviceMemory', { configurable: true, get: () => 8 });
  if (navigator.storage) navigator.storage.estimate = async () => ({ quota: 10_000_000_000, usage: 0 });
});
const anfragen = [];
let phase = 'vor der Sprechaufgabe';
const merke = (r, quelle) =>
  anfragen.push({ phase, quelle, methode: r.method(), url: r.url(), pfad: new URL(r.url()).pathname, anfrage: r });
// Quelle: Service Worker, Seite (mit Frame) oder Worker der Seite (ohne Frame, z. B. der Sprech-Worker)
const quelleVon = (r) => {
  if (r.serviceWorker()) return 'Service Worker';
  try {
    r.frame();
    return 'Seite';
  } catch {
    return 'Worker';
  }
};
kontext.on('request', (r) => merke(r, quelleVon(r)));
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
let erkennung = null;
try {
  await seite.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l04', { waitUntil: 'load' });
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
  // 5. Aufnahme mit dem Testmikrofon und Erkennung bis zum Ergebnis
  phase = 'Aufnahme';
  await knopf(t.sprechen.aufnehmen).click();
  await knopf(t.sprechen.stopp).waitFor();
  await seite.waitForTimeout(Math.min(4_000, Math.max(2_500, (aufnahme.sekunden ?? 3) * 1000)));
  phase = 'Erkennung';
  const e0 = Date.now();
  await knopf(t.sprechen.stopp).click();
  const ergebnisse = { gut: t.sprechen.gut, teilweise: t.sprechen.teilweise, nichtVerstanden: t.sprechen.nichtVerstanden };
  const status = await Promise.any([
    ...Object.entries(ergebnisse).map(([art, text]) =>
      seite.getByRole('heading', { level: 3, name: text, exact: true }).waitFor({ timeout: 120_000 }).then(() => art),
    ),
    seite.locator('main').getByText(t.sprechen.fehler, { exact: true }).first().waitFor({ state: 'attached', timeout: 120_000 }).then(() => 'fehler'),
    seite.locator('main').getByText(t.sprechen.zuLeise, { exact: true }).first().waitFor({ state: 'attached', timeout: 120_000 }).then(() => 'zuLeise'),
  ]).catch(() => 'zeitgrenze');
  const woerter = await seite
    .getByRole('list', { name: t.sprechen.wortListe })
    .getByRole('listitem')
    .evaluateAll((li) => li.map((x) => (x.textContent?.includes('✓') ? 'erkannt' : 'unsicher')))
    .catch(() => []);
  erkennung = { status, ms: Date.now() - e0, woerter };
  if (!(status in ergebnisse)) throw new Error(`Erkennung ohne Ergebnis: ${status}`);
  // danach: Ruhe abwarten und die Seite noch eine Weile beobachten (verspätete Anfragen)
  phase = 'nach der Erkennung';
  await seite.waitForLoadState('networkidle').catch(() => undefined);
  await seite.waitForTimeout(Number(values['nachlauf-s']) * 1000);
} catch (e) {
  fehler = String(e.message ?? e).split('\n')[0];
}

const cookies = await kontext.cookies();
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
    herkunft: /^(blob|data):/.test(a.url) ? a.url.split(':')[0] : new URL(a.url).origin,
    fremd: !a.url.startsWith(ursprung) && !a.url.startsWith('blob:') && !a.url.startsWith('data:'),
    netz: a.quelle === 'Service Worker' || !vomSw,
    status,
    bytes,
  });
}
await browser.close();

// Dateien der Sprachprüfung: alles unter /lern-app/modelle/ und die übrigen Download-Dateien (Drittlizenzen von ORT)
const modell = (z) => z.pfad.startsWith('/lern-app/modelle/') || DOWNLOAD_PFADE.includes(z.pfad);
const vorher = zeilen.filter((z) => z.phase === 'vor der Sprechaufgabe');
const nachher = zeilen.filter((z) => z.phase !== 'vor der Sprechaufgabe');
// je Download-Datei die Abrufe über das Netz nach dem Klick (Pfad ohne Suchteil)
const netzNachher = nachher.filter((z) => z.netz && modell(z));
const abrufe = Object.fromEntries(DOWNLOAD_PFADE.map((d) => [d, netzNachher.filter((z) => z.pfad === d).length]));
const fehlend = DOWNLOAD_PFADE.filter((d) => abrufe[d] === 0);
const mehrfach = DOWNLOAD_PFADE.filter((d) => abrufe[d] > 1);
const netzBytes = netzNachher.reduce((s, z) => s + (z.bytes ?? 0), 0);
const nichtGet = zeilen.filter((z) => z.methode !== 'GET');
const fremd = zeilen.filter((z) => z.fremd);
const PHASEN = ['vor der Sprechaufgabe', 'nach dem Klick', 'nach „bereit“', 'Aufnahme', 'Erkennung', 'nach der Erkennung'];
const jePhase = PHASEN.map((p) => {
  const z = zeilen.filter((x) => x.phase === p);
  const quellen = {};
  for (const x of z) quellen[x.quelle] = (quellen[x.quelle] ?? 0) + 1;
  return {
    phase: p,
    anfragen: z.length,
    quellen,
    methoden: [...new Set(z.map((x) => x.methode))],
    ursprung: [...new Set(z.map((x) => (x.herkunft === ursprung ? 'eigener Ursprung' : x.herkunft)))],
    nichtGet: z.filter((x) => x.methode !== 'GET').length,
    fremd: z.filter((x) => x.fremd).length,
  };
});
const ergebnis = {
  basis: BASIS,
  erfuellt:
    bereit &&
    !fehler &&
    !fehlend.length &&
    !mehrfach.length &&
    arbeiter.echt &&
    Boolean(erkennung && ['gut', 'teilweise', 'nichtVerstanden'].includes(erkennung.status)) &&
    !nichtGet.length &&
    !fremd.length &&
    !cookies.length,
  arbeiter,
  aufnahme: { quelle: aufnahme.quelle, sekunden: aufnahme.sekunden },
  erkennung,
  cookies: cookies.map((c) => c.name),
  jePhase,
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
  nichtGet: nichtGet.map((z) => `${z.methode} ${z.pfad}`),
  fremd: fremd.map((z) => `${z.methode} ${z.pfad}`),
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
  `Worker: ${arbeiter.echt ? 'echt (transformers.js mit Lizenzkopf)' : 'NICHT der echte Worker (Attrappe?)'}, ${Math.round(arbeiter.bytes / 1000)} KB. Testaufnahme: ${aufnahme.quelle}${aufnahme.sekunden ? `, ${aufnahme.sekunden.toFixed(1)} s` : ''}.`,
  `Erkennung: ${erkennung ? `${erkennung.status} nach ${Math.round(erkennung.ms / 100) / 10} s, Wörter ${erkennung.woerter.join(', ') || '–'}` : '–'}. Cookies im Kontext: ${cookies.length}.`,
  '',
  '| Phase | Anfragen | Quellen | Methoden | Ursprung | nicht GET | fremd |',
  '|---|---|---|---|---|---|---|',
  ...jePhase.map(
    (p) =>
      `| ${p.phase} | ${p.anfragen} | ${Object.entries(p.quellen)
        .map(([q, n]) => `${q} ${n}`)
        .join(', ') || '–'} | ${p.methoden.join(', ') || '–'} | ${p.ursprung.join(', ') || '–'} | ${p.nichtGet} | ${p.fremd} |`,
  ),
  '',
  ...(konsole.length
    ? ['Konsole (Fehler und Warnungen der Seite, alles aus Workern):', '', ...konsole.slice(0, 30).map((k) => `- ${k.quelle} · ${k.typ}: ${k.text}`), '']
    : []),
  '| Datei nach dem Klick | Status | MB | Quelle | über das Netz |',
  '|---|---|---|---|---|',
  ...ergebnis.modellNachKlick.map((z) => `| ${z.pfad} | ${z.status ?? '–'} | ${z.mb ?? '–'} | ${z.quelle} | ${z.netz ? 'ja' : 'nein (vom Service Worker)'} |`),
  '',
  `Alle Anfragen (${zeilen.length}, Methode, Pfad, Quelle, Phase, Status):`,
  '',
  '| # | Phase | Quelle | Methode | Pfad | Status |',
  '|---|---|---|---|---|---|',
  ...zeilen.map((z, i) => `| ${i + 1} | ${z.phase} | ${z.quelle} | ${z.methode} | ${z.fremd ? '**FREMD** ' : ''}${z.pfad} | ${z.status ?? '–'} |`),
].join('\n');
schreibe(`${values.aus}.md`, md);
schreibe(`${values.aus}.json`, ergebnis);
console.log(md);
process.exitCode = ergebnis.erfuellt ? 0 : 1;
