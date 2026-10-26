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
//    erkennt bis zum Ergebnis. Der Worker muss der echte sein (Lizenzkopf), nicht die E2E-Attrappe.
// 6. Zwei unabhängige Mitschriften über die ganze Sitzung, je Anfrage Methode und URL:
//    a) Playwright: Seite und ihre Worker (Playwright ordnet Anfragen eines Workers der Seite zu) und der Service Worker; Status
//       und „vom Service Worker beantwortet“ werden beim Eintreffen festgehalten (ein späteres `request.response()` liefert in
//       Playwright 1.64 für ältere Anfragen `null`).
//    b) Am Draht: Chromium schickt jede Anfrage über einen Proxy in diesem Werkzeug (Playwright setzt `<-loopback>`, also auch
//       die an localhost). Er leitet nur an den eigenen Ursprung weiter und lehnt alles andere ab (403, CONNECT ebenso) – was
//       hier fehlt, hat das Gerät nicht verlassen. Daraus kommen „genau einmal über das Netz“ (Nr. 4) und die Bytes.
//    Erwartet: nur GET an den eigenen Ursprung, 0 fremde Hosts, 0 POST/PUT/PATCH/DELETE – auch während und nach Aufnahme und
//    Erkennung –, keine Cookies (Kontext, Cookie-Kopf der Anfragen, Set-Cookie der Antworten).
// Gerät wie die E2E (typen-b.spec.ts `geraet`): 8 GB Arbeitsspeicher, 10 GB frei.
// Aufruf: node whisper-netz.mjs [--aus whisper-netz] [--wav <datei>] [--nachlauf-s 10] [--beleg <datei.md>]
//   --beleg schreibt das Protokoll zusätzlich dorthin (z. B. _lernapp/belege/…); arabische Schrift wird dabei ersetzt.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { BASIS, last, lernTexte, schreibe, starteBrowser, WEB } from './gemeinsam.mjs';
// Node 24 entfernt die Typen selbst; modell.ts hat nur Typ-Importe
import { DOWNLOAD_PFADE } from '../../../web/src/lib/lernapp/sprechen/modell.ts';

const { values } = parseArgs({
  options: {
    aus: { type: 'string', default: 'whisper-netz' },
    wav: { type: 'string' },
    'nachlauf-s': { type: 'string', default: '10' },
    beleg: { type: 'string' },
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

let phase = 'vor der Sprechaufgabe';

// 6b. Mitschrift am Draht: Proxy, der nur an den eigenen Ursprung weiterleitet
const draht = [];
const proxy = http.createServer((anfrage, antwort) => {
  const eintrag = {
    phase,
    methode: anfrage.method,
    url: anfrage.url,
    cookie: Boolean(anfrage.headers.cookie),
    status: null,
    bytes: 0,
    setCookie: false,
  };
  draht.push(eintrag);
  let ziel = null;
  try {
    ziel = new URL(anfrage.url);
  } catch {
    /* keine absolute Adresse */
  }
  if (!ziel || ziel.origin !== ursprung) {
    eintrag.status = 'abgelehnt';
    antwort.writeHead(403).end();
    return;
  }
  const kopf = { ...anfrage.headers };
  delete kopf['proxy-connection'];
  const weiter = http.request(
    { hostname: ziel.hostname, port: ziel.port, method: anfrage.method, path: ziel.pathname + ziel.search, headers: kopf },
    (ant) => {
      eintrag.status = ant.statusCode;
      eintrag.setCookie = Boolean(ant.headers['set-cookie']);
      ant.on('data', (stueck) => (eintrag.bytes += stueck.length));
      antwort.writeHead(ant.statusCode, ant.headers);
      ant.pipe(antwort);
    },
  );
  weiter.on('error', (e) => {
    eintrag.status = `Fehler ${e.code ?? e.message}`;
    antwort.destroy();
  });
  anfrage.pipe(weiter);
});
proxy.on('connect', (anfrage, sockel) => {
  draht.push({ phase, methode: 'CONNECT', url: anfrage.url, cookie: false, status: 'abgelehnt', bytes: 0, setCookie: false });
  sockel.end('HTTP/1.1 403 Forbidden\r\n\r\n');
});
await new Promise((fertig) => proxy.listen(0, '127.0.0.1', fertig));
const proxyAdresse = `http://127.0.0.1:${proxy.address().port}`;

const browser = await starteBrowser({
  // <-loopback>: auch die Anfragen an localhost laufen über den Proxy (Chromium nimmt sie sonst aus)
  proxy: { server: proxyAdresse, bypass: '<-loopback>' },
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${aufnahme.pfad}`],
});
const kontext = await browser.newContext({ baseURL: BASIS, viewport: { width: 1440, height: 900 }, permissions: ['microphone'] });
await kontext.addInitScript(() => {
  Object.defineProperty(navigator, 'deviceMemory', { configurable: true, get: () => 8 });
  if (navigator.storage) navigator.storage.estimate = async () => ({ quota: 10_000_000_000, usage: 0 });
});
// 6a. Mitschrift in Playwright; Antwortdaten beim Eintreffen
const anfragen = [];
const jeAnfrage = new Map();
// Quelle: Service Worker oder Seite (mit ihren Workern – Playwright ordnet deren Anfragen der Seite zu)
const quelleVon = (r) => (r.serviceWorker() ? 'Service Worker' : 'Seite/Worker');
kontext.on('request', (r) => {
  const a = { phase, quelle: quelleVon(r), methode: r.method(), url: r.url(), status: null, vomSw: false, fehler: null };
  anfragen.push(a);
  jeAnfrage.set(r, a);
});
kontext.on('response', (antwort) => {
  const a = jeAnfrage.get(antwort.request());
  if (!a) return;
  a.status = antwort.status();
  a.vomSw = antwort.fromServiceWorker();
});
kontext.on('requestfailed', (r) => {
  const a = jeAnfrage.get(r);
  if (a) a.fehler = r.failure()?.errorText ?? 'fehlgeschlagen';
});
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
      seite
        .locator('main')
        .getByText(text, { exact: true })
        .first()
        .waitFor({ state: 'attached', timeout: 600_000 })
        .then(() => art),
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
      seite
        .getByRole('heading', { level: 3, name: text, exact: true })
        .waitFor({ timeout: 120_000 })
        .then(() => art),
    ),
    seite
      .locator('main')
      .getByText(t.sprechen.fehler, { exact: true })
      .first()
      .waitFor({ state: 'attached', timeout: 120_000 })
      .then(() => 'fehler'),
    seite
      .locator('main')
      .getByText(t.sprechen.zuLeise, { exact: true })
      .first()
      .waitFor({ state: 'attached', timeout: 120_000 })
      .then(() => 'zuLeise'),
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
await browser.close();
await new Promise((fertig) => proxy.close(fertig));

// Adresse für das Protokoll: eigener Ursprung als Pfad mit Suchteil, blob:/data: als lokale Adresse, sonst die volle URL
const herkunftVon = (url) => (/^(blob|data):/.test(url) ? url.split(':')[0] : new URL(url).origin);
const lokal = (url) => /^(blob|data):/.test(url);
const zeigeUrl = (url) => {
  if (lokal(url)) return `${url.split(':')[0]}: (im Browser, kein Netz)`;
  const u = new URL(url);
  return u.origin === ursprung ? u.pathname + u.search : url;
};
const pfadVon = (url) => (lokal(url) ? url : new URL(url).pathname);

// 6a. Playwright: Seite/Worker und Service Worker
const zeilen = anfragen.map((a) => ({
  phase: a.phase,
  quelle: a.quelle,
  methode: a.methode,
  url: zeigeUrl(a.url),
  pfad: pfadVon(a.url),
  herkunft: herkunftVon(a.url),
  fremd: !lokal(a.url) && herkunftVon(a.url) !== ursprung,
  status: a.status,
  vomSw: a.vomSw,
  fehler: a.fehler,
}));
// 6b. am Draht (Proxy)
const leitung = draht.map((d) => {
  let herkunft = d.methode === 'CONNECT' ? `CONNECT ${d.url}` : d.url;
  try {
    herkunft = new URL(d.url).origin;
  } catch {
    /* CONNECT host:port */
  }
  return {
    ...d,
    herkunft,
    fremd: herkunft !== ursprung,
    anzeige: herkunft === ursprung ? zeigeUrl(d.url) : d.url,
    pfad: herkunft === ursprung ? new URL(d.url).pathname : d.url,
  };
});

// Dateien der Sprachprüfung: alles unter /lern-app/modelle/ und die übrigen Download-Dateien (Drittlizenzen von ORT)
const modell = (z) => z.pfad.startsWith('/lern-app/modelle/') || DOWNLOAD_PFADE.includes(z.pfad);
const VOR = 'vor der Sprechaufgabe';
const vorher = zeilen.filter((z) => z.phase === VOR);
// je Download-Datei die Abrufe am Draht nach dem Klick (Pfad ohne Suchteil)
const drahtNachher = leitung.filter((d) => d.phase !== VOR && !d.fremd && modell(d));
const abrufe = Object.fromEntries(DOWNLOAD_PFADE.map((d) => [d, drahtNachher.filter((z) => z.pfad === d).length]));
const fehlend = DOWNLOAD_PFADE.filter((d) => abrufe[d] === 0);
const mehrfach = DOWNLOAD_PFADE.filter((d) => abrufe[d] > 1);
const netzBytes = drahtNachher.reduce((s, z) => s + z.bytes, 0);
const drahtVorModell = leitung.filter((d) => d.phase === VOR && !d.fremd && modell(d)).map((d) => d.pfad);
const nichtGet = [...zeilen, ...leitung].filter((z) => z.methode !== 'GET');
const fremd = [...zeilen.filter((z) => z.fremd), ...leitung.filter((d) => d.fremd)];
const cookieKopf = leitung.filter((d) => d.cookie).length;
const setCookie = leitung.filter((d) => d.setCookie).length;
// Der Proxy muss die Seite selbst gesehen haben, sonst lief Chromium an ihm vorbei
const dokument = leitung.some((d) => d.methode === 'GET' && d.pfad === '/lern-app/de/tr-aus-de/ueben');
const PHASEN = [VOR, 'nach dem Klick', 'nach „bereit“', 'Aufnahme', 'Erkennung', 'nach der Erkennung'];
const jePhase = PHASEN.map((p) => {
  const z = zeilen.filter((x) => x.phase === p);
  const d = leitung.filter((x) => x.phase === p);
  const quellen = {};
  for (const x of z) quellen[x.quelle] = (quellen[x.quelle] ?? 0) + 1;
  const ursprungText = (h) => (h === ursprung ? 'eigener Ursprung' : h);
  return {
    phase: p,
    anfragen: z.length,
    quellen,
    vomSw: z.filter((x) => x.vomSw).length,
    draht: d.length,
    drahtKb: Math.round(d.reduce((s, x) => s + x.bytes, 0) / 1000),
    methoden: [...new Set([...z, ...d].map((x) => x.methode))],
    ursprung: [...new Set([...z.map((x) => x.herkunft), ...d.map((x) => x.herkunft)].map(ursprungText))],
    nichtGet: [...z, ...d].filter((x) => x.methode !== 'GET').length,
    fremd: [...z, ...d].filter((x) => x.fremd).length,
  };
});
const erkannt = Boolean(erkennung && ['gut', 'teilweise', 'nichtVerstanden'].includes(erkennung.status));
const ergebnis = {
  basis: BASIS,
  erfuellt:
    bereit &&
    !fehler &&
    dokument &&
    !drahtVorModell.length &&
    !fehlend.length &&
    !mehrfach.length &&
    arbeiter.echt &&
    erkannt &&
    !nichtGet.length &&
    !fremd.length &&
    !cookies.length &&
    !cookieKopf &&
    !setCookie,
  arbeiter,
  aufnahme: { quelle: aufnahme.quelle, sekunden: aufnahme.sekunden },
  erkennung,
  cookies: cookies.map((c) => c.name),
  cookieKopf,
  setCookie,
  proxySahSeite: dokument,
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
  modellVorKlick: [...new Set([...vorher.filter(modell).map((z) => z.pfad), ...drahtVorModell])],
  nichtGet: nichtGet.map((z) => `${z.methode} ${z.url}`),
  fremd: fremd.map((z) => `${z.methode} ${z.url}`),
  anfragen: zeilen,
  draht: leitung.map(({ anzeige, ...d }) => ({ ...d, url: anzeige })),
};
const mb = (b) => Math.round(b / 1e5) / 10;
const md = [
  `# Netzprotokoll Sprechübung: Whisper nur nach Klick, Aufnahme und Erkennung · ${BASIS}`,
  '',
  `Ergebnis: **${ergebnis.erfuellt ? 'erfüllt' : 'NICHT erfüllt'}**${fehler ? ` · Fehler: ${fehler}` : ''}.`,
  '',
  `- Worker: ${arbeiter.echt ? 'echt (transformers.js mit Lizenzkopf)' : 'NICHT der echte Worker (Attrappe?)'}, ${Math.round(arbeiter.bytes / 1000)} KB.`,
  `- Lektion l04 (de, tr-aus-de) bis zur Sprechaufgabe: ${vorher.length} Anfragen (Playwright), davon unter /lern-app/modelle/: ${ergebnis.modellVorKlick.length}${ergebnis.modellVorKlick.length ? ` (${ergebnis.modellVorKlick.join(', ')})` : ''}.`,
  `- Nach dem Klick „Sprachprüfung laden“: ${drahtNachher.length} Abrufe der Sprachprüfung am Draht (≈ ${ergebnis.netzMb} MB), „bereit“: ${bereit ? `ja, nach ${Math.round(ladenMs / 1000)} s` : 'nein'} (Endzustand ${endzustand ?? '–'}).`,
  `- Download-Dateien (${DOWNLOAD_PFADE.length}) je genau einmal über das Netz: ${!fehlend.length && !mehrfach.length ? 'ja' : 'nein'}${fehlend.length ? ` · fehlend: ${fehlend.join(', ')}` : ''}${mehrfach.length ? ` · mehrfach: ${mehrfach.map((d) => `${d} (${abrufe[d]})`).join(', ')}` : ''}.`,
  `- Testaufnahme: ${aufnahme.quelle}${aufnahme.sekunden ? `, ${aufnahme.sekunden.toFixed(1)} s` : ''}. Erkennung: ${erkennung ? `${erkennung.status} nach ${Math.round(erkennung.ms / 100) / 10} s, Wörter ${erkennung.woerter.join(', ') || '–'}` : '–'}.`,
  `- Andere Methoden als GET: ${ergebnis.nichtGet.length ? ergebnis.nichtGet.join(', ') : 'keine'} · fremde Ursprünge oder Hosts: ${ergebnis.fremd.length ? ergebnis.fremd.join(', ') : 'keine'}.`,
  `- Cookies: im Kontext ${cookies.length}, Anfragen mit Cookie-Kopf ${cookieKopf}, Antworten mit Set-Cookie ${setCookie}.`,
  `- Mitschriften: Playwright ${zeilen.length} Anfragen (Seite/Worker ${zeilen.filter((z) => z.quelle !== 'Service Worker').length}, davon ${zeilen.filter((z) => z.vomSw).length} vom Service Worker beantwortet; Service Worker ${zeilen.filter((z) => z.quelle === 'Service Worker').length}); am Draht ${leitung.length} Anfragen, ${mb(leitung.reduce((s, d) => s + d.bytes, 0))} MB; der Proxy sah die Seite selbst: ${dokument ? 'ja' : 'NEIN'}.`,
  `- Last: Beginn ${ergebnis.last.beginn.l1}, Ende ${ergebnis.last.ende.l1}.`,
  '',
  '| Phase | Playwright | Quellen | vom SW beantwortet | am Draht | KB am Draht | Methoden | Ursprung | nicht GET | fremd |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...jePhase.map(
    (p) =>
      `| ${p.phase} | ${p.anfragen} | ${
        Object.entries(p.quellen)
          .map(([q, n]) => `${q} ${n}`)
          .join(', ') || '–'
      } | ${p.vomSw} | ${p.draht} | ${p.drahtKb} | ${p.methoden.join(', ') || '–'} | ${p.ursprung.join(', ') || '–'} | ${p.nichtGet} | ${p.fremd} |`,
  ),
  '',
  ...(konsole.length
    ? [
        'Konsole (Fehler und Warnungen der Seite, alles aus Workern):',
        '',
        ...konsole.slice(0, 30).map((k) => `- ${k.quelle} · ${k.typ}: ${k.text}`),
        '',
      ]
    : ['Konsole von Seite und Workern: leer.', '']),
  '| Download-Datei | Abrufe am Draht nach dem Klick | MB am Draht | Status |',
  '|---|---|---|---|',
  ...DOWNLOAD_PFADE.map((d) => {
    const z = drahtNachher.filter((x) => x.pfad === d);
    return `| ${d} | ${z.length} | ${mb(z.reduce((s, x) => s + x.bytes, 0))} | ${[...new Set(z.map((x) => x.status))].join(', ') || '–'} |`;
  }),
  '',
  `## Alle Anfragen in Playwright (${zeilen.length}: Seite mit ihren Workern und Service Worker)`,
  '',
  '| # | Phase | Quelle | Methode | URL | Status | vom SW |',
  '|---|---|---|---|---|---|---|',
  ...zeilen.map(
    (z, i) =>
      `| ${i + 1} | ${z.phase} | ${z.quelle} | ${z.methode} | ${z.fremd ? '**FREMD** ' : ''}${z.url} | ${z.status ?? z.fehler ?? '–'} | ${z.vomSw ? 'ja' : ''} |`,
  ),
  '',
  `## Alle Anfragen am Draht (${leitung.length}, Proxy; nur hier verlässt eine Anfrage den Browser)`,
  '',
  '| # | Phase | Methode | URL | Status | KB | Cookie | Set-Cookie |',
  '|---|---|---|---|---|---|---|---|',
  ...leitung.map(
    (d, i) =>
      `| ${i + 1} | ${d.phase} | ${d.methode} | ${d.fremd ? '**FREMD** ' : ''}${d.anzeige} | ${d.status ?? '–'} | ${Math.round(d.bytes / 100) / 10} | ${d.cookie ? '**ja**' : ''} | ${d.setCookie ? '**ja**' : ''} |`,
  ),
].join('\n');
schreibe(`${values.aus}.md`, md);
schreibe(`${values.aus}.json`, ergebnis);
if (values.beleg) {
  // Belege ohne arabische Schrift (KI-Regel 2); Adressen und Meldungen sind ASCII, das ist nur die Sicherung
  const beleg = resolve(values.beleg);
  mkdirSync(dirname(beleg), { recursive: true });
  writeFileSync(beleg, `${md.replace(/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+/g, '[ar]')}\n`);
}
console.log(md.split('\n## ')[0]);
process.exitCode = ergebnis.erfuellt ? 0 : 1;
