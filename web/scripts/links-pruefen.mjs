// Linkprüfung externer Verweise (Marktstart Welle 3, MENSCHEN M-107 „Linkpflege“). Nicht Teil des Baus.
// Aufruf: pnpm links:pruefen [basis] [--quellen] [--max <n>]
// - Standard: Crawl der eigenen Seiten aus <basis>/sitemap.xml (Standard http://localhost:3100, z. B. Standalone-Server oder
//   die Live-Adresse), dabei alle externen Links (href) einsammeln. --max begrenzt die Zahl der gecrawlten Seiten.
// - --quellen: statisch aus dem Code – src/lib/dachverband/netzwerk.ts, messages/**, drizzle/seeds/**,
//   src/app/[locale]/(website)/quellen/verzeichnis.ts (ohne Server).
// Je Adresse: HEAD (bei 403/405 GET), Weiterleitungen von Hand (höchstens 5), 4 parallel, 15 s Zeitgrenze, eigener
// User-Agent; bei Zeitüberschreitung, Netzfehler oder 5xx ein zweiter Versuch. HTML-Seiten mit 200 werden zusätzlich per GET
// (erste 64 kB) auf einen Soft-404-Titel geprüft. Einstufung: `stufeEin()` (rein, Unit-Test tests/unit/links-pruefen.test.ts).
// Bericht: _lauf/belege/links/<zeit>.md; Exit 1 bei mindestens einem Fehler.
// Proxy: Node-fetch nutzt HTTPS_PROXY nicht von selbst. Hinter einem Pflicht-Proxy mit NODE_USE_ENV_PROXY=1 starten
// (Node ≥ 22.21, eingebauter EnvHttpProxyAgent, kein zusätzliches Paket); ohne Proxy ist nichts zu tun.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKRIPT_DATEI = fileURLToPath(import.meta.url);
const WEB = join(import.meta.dirname, '..');
const WURZEL = join(WEB, '..');
export const USER_AGENT = 'IGMG-Wetzlar-Linkpruefung/1.0 (+https://igmg-wetzlar.de; Pflege der Verweise)';
const ZEITGRENZE_MS = 15_000;
const PARALLEL = 4;
export const MAX_WEITERLEITUNGEN = 5;

/** Titel, die auf eine Fehlerseite mit Status 200 hindeuten (Soft-404), de/tr/en. */
export const SOFT_404 = /\b404\b|nicht gefunden|seite existiert nicht|not found|page (?:does not|doesn['’]t) exist|bulunamad[ıi]/i;
/**
 * Beispiel- und Testadressen in Quellen, keine echten Verweise: Beispieldomains, Testhosts, die eigene Domain und die
 * Platzhalter im Formular „Moschee-Anfrage“ (Feld „aktuelle Webseite“, de/tr/en).
 */
const BEISPIEL_HOST =
  /(^|\.)(example\.(com|org|net)|beispiel\.de|localhost|[a-z0-9-]+\.test|igmg-wetzlar\.de|ihre-aktuelle-webseite\.de|mevcut-siteniz\.de|your-current-website\.de)$/i;
/** Kommentarzeilen in Code-Dateien (Verweise dort sind Notizen, keine Links der Website). */
const KOMMENTAR = /^\s*(\/\/|\/?\*)/;

/** Pfad ohne abschließenden Schrägstrich (für den Vergleich „umgezogen“). */
function pfadVon(adresse) {
  try {
    const u = new URL(adresse);
    return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '') || '/'}`;
  } catch {
    return adresse;
  }
}

/**
 * Einstufung eines Prüfergebnisses (rein, ohne Netz).
 * Eingabe: `{ url, kette: [{ url, status }], fehler?, titel? }` – `kette` sind alle Antworten in Reihenfolge (die letzte ist das
 * Ziel); `fehler` ist der Grund, wenn auch der zweite Versuch ohne Antwort blieb (Zeitüberschreitung, Netzfehler).
 * Ergebnis: `{ stufe: 'ok' | 'warnung' | 'fehler', grund }`.
 * - `http://` (am Anfang oder als Ziel einer Weiterleitung) → Fehler
 * - 404/410 → Fehler; mehr als 5 Weiterleitungen → Fehler
 * - 5xx oder keine Antwort nach dem zweiten Versuch → Warnung
 * - 301/308 auf einen anderen Pfad → Warnung „umgezogen“ (Verweis aktualisieren)
 * - 401/403/429 und übrige 4xx → Warnung (Bot-Schutz oder Sperre, von Hand prüfen)
 * - 200 mit Soft-404-Titel → Warnung; 200 (auch nach vorübergehender Weiterleitung 302/303/307) → ok
 */
export function stufeEin({ url, kette = [], fehler, titel }) {
  if (url.startsWith('http://')) return { stufe: 'fehler', grund: 'unverschlüsselt (http://) – auf https umstellen' };
  if (fehler) return { stufe: 'warnung', grund: `keine Antwort nach zweitem Versuch (${fehler})` };
  const letzte = kette.at(-1);
  if (!letzte) return { stufe: 'warnung', grund: 'keine Antwort' };
  if (letzte.status >= 300 && letzte.status < 400)
    return kette.length > MAX_WEITERLEITUNGEN
      ? { stufe: 'fehler', grund: `mehr als ${MAX_WEITERLEITUNGEN} Weiterleitungen` }
      : { stufe: 'warnung', grund: `Weiterleitung (${letzte.status}) ohne Ziel` };
  if (letzte.url.startsWith('http://')) return { stufe: 'fehler', grund: `Weiterleitung auf unverschlüsseltes Ziel ${letzte.url}` };
  if (letzte.status === 404 || letzte.status === 410) return { stufe: 'fehler', grund: `nicht gefunden (${letzte.status})` };
  if (letzte.status >= 500) return { stufe: 'warnung', grund: `Serverfehler (${letzte.status}) auch im zweiten Versuch` };
  if (letzte.status === 401 || letzte.status === 403)
    return { stufe: 'warnung', grund: `Zugriff verweigert (${letzte.status}) – Bot-Schutz? Von Hand prüfen` };
  if (letzte.status >= 400) return { stufe: 'warnung', grund: `Antwort ${letzte.status} – von Hand prüfen` };
  const dauerhaft = kette.slice(0, -1).some((s) => s.status === 301 || s.status === 308);
  if (dauerhaft && pfadVon(letzte.url) !== pfadVon(url)) return { stufe: 'warnung', grund: `umgezogen → ${letzte.url}` };
  if (titel && SOFT_404.test(titel)) return { stufe: 'warnung', grund: `Soft-404 (Titel „${titel.slice(0, 80)}“)` };
  return { stufe: 'ok', grund: letzte.status === 200 ? 'erreichbar' : `Antwort ${letzte.status}` };
}

/** Externe Adressen aus einem Text (Quelldatei oder HTML); Satzzeichen am Ende und HTML-Entitäten bereinigt. */
export function adressenAus(text) {
  const treffer = text.match(/https?:\/\/[^\s"'`<>()\\{}|^[\]]+/g) ?? [];
  return treffer
    .map((t) => t.replace(/&amp;/g, '&').replace(/[.,;:!?’”]+$/, ''))
    .filter((t) => {
      try {
        const u = new URL(t);
        return !BEISPIEL_HOST.test(u.hostname) && u.hostname.includes('.');
      } catch {
        return false;
      }
    });
}

async function mitZeitgrenze(url, methode) {
  const steuerung = new AbortController();
  const uhr = setTimeout(() => steuerung.abort(), ZEITGRENZE_MS);
  try {
    const antwort = await fetch(url, {
      method: methode,
      redirect: 'manual',
      signal: steuerung.signal,
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8' },
    });
    let titel;
    if (methode === 'GET') {
      const typ = antwort.headers.get('content-type') ?? '';
      if (antwort.status === 200 && typ.includes('html')) {
        // Nur der Anfang (Titel steht im Kopf); danach abbrechen
        const leser = antwort.body?.getReader();
        let html = '';
        while (leser && html.length < 65_536) {
          const { done, value } = await leser.read();
          if (done) break;
          html += new TextDecoder().decode(value);
        }
        await leser?.cancel().catch(() => {});
        titel = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]?.trim();
      } else await antwort.body?.cancel().catch(() => {});
    }
    return { status: antwort.status, ort: antwort.headers.get('location'), typ: antwort.headers.get('content-type') ?? '', titel };
  } finally {
    clearTimeout(uhr);
  }
}

/** Ein Versuch: Kette der Antworten (HEAD, bei 403/405 GET; Weiterleitungen von Hand). */
async function versuch(url) {
  const kette = [];
  let aktuell = url;
  let titel;
  for (let schritt = 0; schritt <= MAX_WEITERLEITUNGEN; schritt++) {
    let a = await mitZeitgrenze(aktuell, 'HEAD');
    if (a.status === 403 || a.status === 405 || a.status === 501) a = await mitZeitgrenze(aktuell, 'GET');
    else if (a.status === 200 && a.typ.includes('html')) a = await mitZeitgrenze(aktuell, 'GET');
    kette.push({ url: aktuell, status: a.status });
    titel = a.titel;
    if (a.status >= 300 && a.status < 400 && a.ort) {
      aktuell = new URL(a.ort, aktuell).href;
      continue;
    }
    break;
  }
  return { kette, titel };
}

/** Prüft eine Adresse; bei Netzfehler, Zeitüberschreitung oder 5xx ein zweiter Versuch. */
export async function pruefeAdresse(url) {
  if (url.startsWith('http://')) return { url, kette: [] };
  let letzterFehler;
  for (let n = 1; n <= 2; n++) {
    try {
      const { kette, titel } = await versuch(url);
      if ((kette.at(-1)?.status ?? 0) >= 500 && n === 1) continue;
      return { url, kette, titel };
    } catch (e) {
      // undici meldet manche Abbrüche mit code 0 – deshalb || statt ??
      letzterFehler = e?.name === 'AbortError' ? 'Zeitüberschreitung 15 s' : String(e?.cause?.code || e?.cause?.message || e?.message || e);
    }
  }
  return { url, kette: [], fehler: letzterFehler };
}

/** Führt `arbeit` für alle Einträge aus, höchstens `PARALLEL` gleichzeitig. */
async function parallel(eintraege, arbeit) {
  const ergebnisse = new Array(eintraege.length);
  let naechster = 0;
  await Promise.all(
    Array.from({ length: Math.min(PARALLEL, eintraege.length) }, async () => {
      while (naechster < eintraege.length) {
        const i = naechster++;
        ergebnisse[i] = await arbeit(eintraege[i], i);
      }
    }),
  );
  return ergebnisse;
}

function dateienUnter(ordner, endungen) {
  const liste = [];
  for (const name of readdirSync(ordner)) {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) liste.push(...dateienUnter(pfad, endungen));
    else if (endungen.some((e) => name.endsWith(e))) liste.push(pfad);
  }
  return liste;
}

/** --quellen: Adressen aus Netzwerk, Texten, Seeds und Quellenverzeichnis, je mit Fundstellen (Datei). */
function sammleAusQuellen() {
  const dateien = [
    join(WEB, 'src/lib/dachverband/netzwerk.ts'),
    join(WEB, 'src/app/[locale]/(website)/quellen/verzeichnis.ts'),
    ...dateienUnter(join(WEB, 'messages'), ['.json']),
    ...dateienUnter(join(WEB, 'drizzle/seeds'), ['.ts', '.json']),
  ];
  const fund = new Map();
  for (const datei of dateien) {
    const text = readFileSync(datei, 'utf8');
    const ohneKommentare = datei.endsWith('.json')
      ? text
      : text
          .split('\n')
          .filter((z) => !KOMMENTAR.test(z))
          .join('\n');
    for (const url of adressenAus(ohneKommentare)) {
      if (url.includes('${')) continue;
      const stellen = fund.get(url) ?? new Set();
      stellen.add(relative(WEB, datei));
      fund.set(url, stellen);
    }
  }
  return { fund, seiten: dateien.length };
}

/** Standard: eigene Seiten aus der Sitemap crawlen, externe Links (href) einsammeln. */
async function sammleAusSeiten(basis, max) {
  const antwort = await fetch(new URL('/sitemap.xml', basis), { headers: { 'user-agent': USER_AGENT } });
  if (!antwort.ok) throw new Error(`${basis}/sitemap.xml antwortet mit ${antwort.status}`);
  const eigene = new Set([new URL(basis).host]);
  const seiten = [...(await antwort.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((t) => {
    const u = new URL(t[1].replace(/&amp;/g, '&'));
    eigene.add(u.host);
    return new URL(u.pathname + u.search, basis).href;
  });
  const auswahl = [...new Set(seiten)].slice(0, max ?? Infinity);
  const fund = new Map();
  await parallel(auswahl, async (seite) => {
    try {
      const html = await (await fetch(seite, { headers: { 'user-agent': USER_AGENT } })).text();
      for (const t of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
        const url = t[1].replace(/&amp;/g, '&');
        if (eigene.has(new URL(url).host) || adressenAus(url).length === 0) continue;
        const stellen = fund.get(url) ?? new Set();
        stellen.add(new URL(seite).pathname);
        fund.set(url, stellen);
      }
    } catch (e) {
      console.warn(`[links] Seite nicht lesbar: ${seite} (${e?.message ?? e})`);
    }
  });
  return { fund, seiten: auswahl.length };
}

function zelle(text) {
  return String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function bericht({ modus, basis, seiten, ergebnisse, beginn }) {
  const zahl = (stufe) => ergebnisse.filter((e) => e.stufe === stufe).length;
  const zeilen = [
    `# Linkprüfung ${beginn.toISOString().slice(0, 16).replace('T', ' ')} UTC`,
    '',
    `- Modus: ${modus === 'quellen' ? '`--quellen` (statisch aus dem Code)' : `Crawl über ${basis}/sitemap.xml`}`,
    `- ${modus === 'quellen' ? 'Quelldateien' : 'Seiten'}: ${seiten}; geprüfte Adressen: ${ergebnisse.length}`,
    `- Ergebnis: ${zahl('fehler')} Fehler, ${zahl('warnung')} Warnungen, ${zahl('ok')} ok`,
    `- Proxy: ${process.env.HTTPS_PROXY ? `HTTPS_PROXY gesetzt, NODE_USE_ENV_PROXY=${process.env.NODE_USE_ENV_PROXY ?? 'nicht gesetzt'}` : 'keiner'}`,
    `- Regeln: HEAD (bei 403/405 GET), höchstens ${MAX_WEITERLEITUNGEN} Weiterleitungen, 15 s Zeitgrenze, zweiter Versuch bei 5xx/Zeitüberschreitung; User-Agent „${USER_AGENT}“`,
    '',
  ];
  for (const [stufe, titel] of [
    ['fehler', 'Fehler'],
    ['warnung', 'Warnungen'],
    ['ok', 'In Ordnung'],
  ]) {
    const liste = ergebnisse.filter((e) => e.stufe === stufe);
    zeilen.push(`## ${titel} (${liste.length})`, '');
    if (!liste.length) {
      zeilen.push('Keine.', '');
      continue;
    }
    zeilen.push('| Adresse | Status | Befund | Fundstellen |', '|---|---|---|---|');
    for (const e of liste) {
      const status = e.kette.map((k) => k.status).join(' → ') || '–';
      const stellen = [...e.stellen];
      const fund = stellen.slice(0, 3).join(', ') + (stellen.length > 3 ? ` (+${stellen.length - 3})` : '');
      zeilen.push(`| ${zelle(e.url)} | ${status} | ${zelle(e.grund)} | ${zelle(fund)} |`);
    }
    zeilen.push('');
  }
  return zeilen.join('\n');
}

async function haupt() {
  const argumente = process.argv.slice(2);
  const modus = argumente.includes('--quellen') ? 'quellen' : 'crawl';
  const maxIndex = argumente.indexOf('--max');
  const max = maxIndex >= 0 ? Number(argumente[maxIndex + 1]) : undefined;
  const basis = (argumente.find((a, i) => !a.startsWith('--') && argumente[i - 1] !== '--max') ?? 'http://localhost:3100').replace(
    /\/+$/,
    '',
  );
  const beginn = new Date();
  if (process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY)
    console.warn('[links] HTTPS_PROXY ist gesetzt: Node-fetch nutzt ihn nur mit NODE_USE_ENV_PROXY=1 (Node ≥ 22.21).');
  const { fund, seiten } = modus === 'quellen' ? sammleAusQuellen() : await sammleAusSeiten(basis, max);
  const adressen = [...fund.keys()].sort();
  console.log(`[links] ${adressen.length} Adressen aus ${seiten} ${modus === 'quellen' ? 'Quelldateien' : 'Seiten'} – prüfe …`);
  const ergebnisse = await parallel(adressen, async (url) => {
    const pruefung = await pruefeAdresse(url);
    const { stufe, grund } = stufeEin(pruefung);
    if (stufe !== 'ok') console.log(`[links] ${stufe.toUpperCase()} ${url}: ${grund}`);
    return { ...pruefung, stufe, grund, stellen: fund.get(url) };
  });
  const ordner = join(WURZEL, '_lauf', 'belege', 'links');
  mkdirSync(ordner, { recursive: true });
  const datei = join(ordner, `${beginn.toISOString().slice(0, 16).replace(/[:T]/g, '-')}${modus === 'quellen' ? '-quellen' : ''}.md`);
  writeFileSync(datei, bericht({ modus, basis, seiten, ergebnisse, beginn }) + '\n');
  const fehler = ergebnisse.filter((e) => e.stufe === 'fehler').length;
  const warnungen = ergebnisse.filter((e) => e.stufe === 'warnung').length;
  console.log(
    `[links] ${fehler} Fehler, ${warnungen} Warnungen, ${ergebnisse.length - fehler - warnungen} ok – Bericht: ${relative(WURZEL, datei)}`,
  );
  process.exit(fehler ? 1 : 0);
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === SKRIPT_DATEI) {
  haupt().catch((e) => {
    console.error('[links] Abbruch:', e instanceof Error ? e.message : e);
    process.exit(2);
  });
}
