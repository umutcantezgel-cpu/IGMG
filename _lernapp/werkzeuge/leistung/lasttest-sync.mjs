#!/usr/bin/env node
// Lasttest des Abgleichs (L8-02, PLAN §14 L8): N gleichzeitige Konten gegen POST /api/lernapp/sync am lokalen PostgreSQL.
// Nur Wegwerf-Daten in einer Wegwerf-Datenbank (Name endet auf `_e2e`), Platzhalter-Namen in eckigen Klammern, Adressen unter
// `.invalid`. Ohne neue Abhängigkeiten: Node fetch + Promise.all, pg aus web/node_modules.
// 1. Konten anlegen (SQL): Konto mit Kontoart „gemeinde“, Profil, Einwilligung `lernapp` (selbst erteilt, Testdaten) und eine
//    Sitzung; das Sitzungs-Cookie wird wie in Better Auth signiert (HMAC-SHA-256 mit BETTER_AUTH_SECRET aus web/.env).
//    Probe: GET /api/lernapp/sitzung meldet „angemeldet, Einwilligung erteilt“.
// 2. Welle 1: je Konto P Pakete gleichzeitig (je Paket ein eigenes Gerät, E Ereignisse: Bewertungen, Lektion, XP) – alle
//    N × P Anfragen auf einmal.
// 3. Welle 2 (Idempotenz): dieselben Pakete mit denselben Kennungen (Gerät + seq) noch einmal → angenommen 0, keine Dubletten
//    in `lernapp_ereignis`, Ableitungen (`lernapp_karte`, `lernapp_tag`, `lernapp_tag_kurs`) unverändert (Prüfsumme).
// 4. Welle 3: neue Ereignisse derselben Geräte (Folgenummern danach) – Last mit vorhandenem Lernstand.
// 5. Bremse: wenige Konten senden je 40 Anfragen auf einmal – die Bremse (30 je Minute und Konto) muss greifen (429 `bremse`).
// Gemessen: Dauer je Anfrage (p50/p95/p99, max), Fehlerquote, Anteil 429, Durchsatz, Verbindungen zur Datenbank
// (pg_stat_activity alle 200 ms), Last der Maschine.
// Aufruf (im Ordner web/): node ../_lernapp/werkzeuge/leistung/lasttest-sync.mjs [--konten 200] [--pakete 3] [--ereignisse 40]
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import pg from 'pg';
import { BASIS, WEB, last, runde, schreibe } from './gemeinsam.mjs';

const { values } = parseArgs({
  options: {
    konten: { type: 'string', default: '200' },
    pakete: { type: 'string', default: '3' },
    ereignisse: { type: 'string', default: '40' },
    aus: { type: 'string', default: 'lasttest' },
  },
});
const N = Number(values.konten);
const P = Number(values.pakete);
const E = Number(values.ereignisse);

const ziel = process.env.E2E_DATABASE_URL ?? '';
const dbName = /\/([a-z_][a-z0-9_]*_e2e)$/.exec(ziel)?.[1];
if (!dbName) throw new Error('E2E_DATABASE_URL fehlt oder endet nicht auf _e2e (nur Wegwerf-Datenbank)');
if (!process.env.BETTER_AUTH_SECRET && existsSync(join(WEB, '.env'))) process.loadEnvFile(join(WEB, '.env'));
const GEHEIM = process.env.BETTER_AUTH_SECRET;
if (!GEHEIM) throw new Error('BETTER_AUTH_SECRET fehlt (web/.env)');

const praefix = randomBytes(3).toString('hex');
const kennung = (i) => `lasttest-${praefix}-${String(i).padStart(3, '0')}`;
/** Sitzungs-Cookie wie better-call `signCookieValue` (Wert + "." + Base64(HMAC-SHA-256), URL-kodiert), Präfix `igmg`. */
const keks = (token) =>
  `igmg.session_token=${encodeURIComponent(`${token}.${createHmac('sha256', GEHEIM).update(token).digest('base64')}`)}`;

const db = new pg.Client({ connectionString: ziel });
await db.connect();

// ——— 1. Konten ———
const konten = [];
await db.query('begin');
for (let i = 1; i <= N; i++) {
  const id = kennung(i);
  const token = randomBytes(24).toString('base64url');
  const name = `[Lasttest ${i}]`;
  await db.query(`insert into "user" (id, name, email, email_verified) values ($1, $2, $3, true)`, [
    id,
    name,
    `lasttest.${praefix}.${i}@beispiel.invalid`,
  ]);
  await db.query(`insert into gemeinde_rolle (benutzer_id, rolle) values ($1, 'gemeinde')`, [id]);
  await db.query(`insert into konto_profil (benutzer_id, anzeigename, sprache) values ($1, $2, 'de')`, [id, name]);
  await db.query(
    `insert into konto_einwilligung (benutzer_id, art, text_version, erteilt_von) values ($1, 'lernapp', 'lasttest-testdaten', $1)`,
    [id],
  );
  await db.query(
    `insert into session (id, token, user_id, expires_at, created_at, updated_at) values ($1, $2, $3, now() + interval '1 day', now(), now())`,
    [randomUUID(), token, id],
  );
  konten.push({ id, cookie: keks(token), geraete: Array.from({ length: P }, () => randomUUID()) });
}
await db.query('commit');

const KOPF = (k) => ({ 'Content-Type': 'application/json', Cookie: k.cookie, Origin: BASIS });
const probe = await fetch(`${BASIS}/api/lernapp/sitzung`, { headers: { Cookie: konten[0].cookie } });
const probeText = await probe.text();
if (!probe.ok || !probeText.includes('"angemeldet":true') || !probeText.includes('"erteilt"'))
  throw new Error(`Sitzungsprobe fehlgeschlagen: HTTP ${probe.status} ${probeText.slice(0, 120)}`);

// ——— Ereignisse ———
const heute = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
const KARTEN = ['w001', 'w002', 'w003', 'w004'].map((w) => `tr-aus-de:tr.a1.e01.${w}`);
function paket(konto, p, ab) {
  const geraet = konto.geraete[p];
  const am = new Date().toISOString();
  const ereignisse = [];
  for (let s = ab; s < ab + E; s++) {
    const n = s - ab;
    if (n === E - 2)
      ereignisse.push({
        geraet,
        seq: s,
        am,
        tag: heute,
        art: 'lektion',
        daten: { kurs: 'tr-aus-de', lektion: 'tr-aus-de.a1.e01.l01', art: 'lektion', richtig: 4, gesamt: 4 },
      });
    else if (n === E - 1)
      ereignisse.push({ geraet, seq: s, am, tag: heute, art: 'xp', daten: { menge: 10, grund: 'lektion', bezug: 'tr-aus-de.a1.e01.l01' } });
    else
      ereignisse.push({
        geraet,
        seq: s,
        am,
        tag: heute,
        art: 'bewertung',
        daten: { karte: KARTEN[n % KARTEN.length], note: n % 3 ? 'gut' : 'schwer', kurs: 'tr-aus-de' },
      });
  }
  return JSON.stringify({ konto: konto.id, geraet, cursor: null, ereignisse });
}

// ——— Verbindungen zur Datenbank (Stichprobe alle 200 ms) ———
const beobachter = new pg.Client({ connectionString: ziel });
await beobachter.connect();
let verbindungen = [];
let stichprobe = null;
function beobachte() {
  verbindungen = [];
  let laeuft = true;
  const lauf = (async () => {
    while (laeuft) {
      const { rows } = await beobachter.query(
        `select count(*)::int as gesamt, count(*) filter (where state = 'active')::int as aktiv,
                count(*) filter (where wait_event_type = 'Lock')::int as wartend
           from pg_stat_activity where datname = $1 and pid <> pg_backend_pid()`,
        [dbName],
      );
      verbindungen.push(rows[0]);
      await new Promise((r) => setTimeout(r, 200));
    }
  })();
  stichprobe = async () => {
    laeuft = false;
    await lauf;
    return {
      gesamtMax: Math.max(0, ...verbindungen.map((v) => v.gesamt)),
      aktivMax: Math.max(0, ...verbindungen.map((v) => v.aktiv)),
      sperreWartendMax: Math.max(0, ...verbindungen.map((v) => v.wartend)),
      proben: verbindungen.length,
    };
  };
}

const quantil = (s, q) => (s.length ? s[Math.min(s.length - 1, Math.ceil(q * s.length) - 1)] : NaN);
async function welle(name, anfragen) {
  const lastVorher = last();
  beobachte();
  const t0 = performance.now();
  const ergebnisse = await Promise.all(
    anfragen.map(async ({ konto, koerper }) => {
      const a = performance.now();
      try {
        const r = await fetch(`${BASIS}/api/lernapp/sync`, { method: 'POST', headers: KOPF(konto), body: koerper });
        const text = await r.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          /* kein JSON */
        }
        return { ms: performance.now() - a, status: r.status, json };
      } catch (e) {
        return { ms: performance.now() - a, status: 0, fehler: String(e.cause?.code ?? e.message ?? e) };
      }
    }),
  );
  const dauer = performance.now() - t0;
  const db = await stichprobe();
  const ms = ergebnisse.map((e) => e.ms).sort((a, b) => a - b);
  const status = {};
  for (const e of ergebnisse) status[e.status] = (status[e.status] ?? 0) + 1;
  const ok = ergebnisse.filter((e) => e.status === 200);
  const w = {
    name,
    anfragen: ergebnisse.length,
    dauerS: runde(dauer / 1000, 2),
    jeSekunde: runde(ergebnisse.length / (dauer / 1000), 1),
    p50Ms: Math.round(quantil(ms, 0.5)),
    p95Ms: Math.round(quantil(ms, 0.95)),
    p99Ms: Math.round(quantil(ms, 0.99)),
    maxMs: Math.round(ms.at(-1) ?? NaN),
    status,
    fehlerquote: runde(((ergebnisse.length - ok.length - (status[429] ?? 0)) / ergebnisse.length) * 100, 2),
    anteil429: runde(((status[429] ?? 0) / ergebnisse.length) * 100, 2),
    fehler429: [...new Set(ergebnisse.filter((e) => e.status === 429).map((e) => e.json?.fehler))],
    netzfehler: [...new Set(ergebnisse.filter((e) => e.status === 0).map((e) => e.fehler))],
    angenommen: ok.reduce((s, e) => s + (e.json?.angenommen ?? 0), 0),
    doppelt: ok.reduce((s, e) => s + (e.json?.doppelt ?? 0), 0),
    abgelehnt: ok.reduce((s, e) => s + (e.json?.abgelehnt?.length ?? 0), 0),
    datenbank: db,
    last: { vorher: lastVorher, nachher: last() },
  };
  console.log(
    `${name}: ${w.anfragen} Anfragen in ${w.dauerS} s · p50 ${w.p50Ms} · p95 ${w.p95Ms} · p99 ${w.p99Ms} · max ${w.maxMs} ms · Status ${JSON.stringify(status)} · angenommen ${w.angenommen} · doppelt ${w.doppelt} · Verbindungen max ${db.gesamtMax} (aktiv ${db.aktivMax}) · Last ${w.last.vorher.l1}→${w.last.nachher.l1}`,
  );
  return w;
}

const MUSTER = `lasttest-${praefix}-%`;
async function stand() {
  const zahl = async (sql) => (await db.query(sql, [MUSTER])).rows[0];
  return {
    ereignisse: (await zahl('select count(*)::int as n from lernapp_ereignis where benutzer_id like $1')).n,
    dubletten: (
      await zahl(
        'select count(*)::int as n from (select 1 from lernapp_ereignis where benutzer_id like $1 group by benutzer_id, geraet, seq having count(*) > 1) d',
      )
    ).n,
    karten: await zahl(
      `select count(*)::int as n, md5(coalesce(string_agg(k::text, '|' order by k.benutzer_id, k.karte), '')) as summe from lernapp_karte k where benutzer_id like $1`,
    ),
    tage: await zahl(
      `select count(*)::int as n, md5(coalesce(string_agg(t::text, '|' order by t.benutzer_id, t.tag), '')) as summe from lernapp_tag t where benutzer_id like $1`,
    ),
    tageKurs: await zahl(
      `select count(*)::int as n, md5(coalesce(string_agg(t::text, '|' order by t.benutzer_id, t.tag, t.kurs), '')) as summe from lernapp_tag_kurs t where benutzer_id like $1`,
    ),
  };
}

const ergebnis = { basis: BASIS, datenbank: dbName, konten: N, paketeJeKonto: P, ereignisseJePaket: E, wellen: [] };
try {
  const welle1 = konten.flatMap((k) => k.geraete.map((_, p) => ({ konto: k, koerper: paket(k, p, 0) })));
  ergebnis.wellen.push(await welle(`Welle 1: ${N} Konten × ${P} Pakete gleichzeitig (neu)`, welle1));
  const nachWelle1 = await stand();
  // Idempotenz: wörtlich dieselben Körper (gleiche Geräte, Folgenummern und Zeiten)
  ergebnis.wellen.push(await welle('Welle 2: dieselben Pakete noch einmal (Idempotenz)', welle1));
  const nachWelle2 = await stand();
  ergebnis.idempotenz = {
    nachWelle1,
    nachWelle2,
    erwartetEreignisse: N * P * E,
    gleich:
      nachWelle1.ereignisse === nachWelle2.ereignisse &&
      nachWelle2.dubletten === 0 &&
      nachWelle1.karten.summe === nachWelle2.karten.summe &&
      nachWelle1.tage.summe === nachWelle2.tage.summe &&
      nachWelle1.tageKurs.summe === nachWelle2.tageKurs.summe &&
      ergebnis.wellen[1].angenommen === 0,
  };
  const welle3 = konten.flatMap((k) => k.geraete.map((_, p) => ({ konto: k, koerper: paket(k, p, E) })));
  ergebnis.wellen.push(await welle(`Welle 3: ${N} Konten × ${P} Pakete gleichzeitig (Folgeereignisse)`, welle3));
  ergebnis.nachWelle3 = await stand();
  // Bremse: 5 Konten senden je 40 leere Abgleiche gleichzeitig (zusätzlich zu ihren 9 Anfragen der Wellen in dieser Minute)
  const bremse = konten.slice(0, 5).flatMap((k) =>
    Array.from({ length: 40 }, () => ({
      konto: k,
      koerper: JSON.stringify({ konto: k.id, geraet: k.geraete[0], cursor: null, ereignisse: [] }),
    })),
  );
  ergebnis.wellen.push(await welle('Bremse: 5 Konten × 40 Anfragen gleichzeitig', bremse));
} finally {
  await beobachter.end().catch(() => undefined);
  await db.end();
}

const i = ergebnis.idempotenz;
const md = [
  `# Lasttest Abgleich · ${BASIS} · Datenbank ${dbName}`,
  '',
  `${N} Konten (Platzhalter, Einwilligung und Sitzung per SQL), je ${P} Pakete à ${E} Ereignisse. Server: Pool von node-postgres mit höchstens 10 Verbindungen (src/lib/db/index.ts).`,
  '',
  '| Welle | Anfragen | Dauer s | je s | p50 ms | p95 ms | p99 ms | max ms | Status | Fehler % | 429 % | angenommen | doppelt | Verbindungen max (aktiv) | Last vorher → nachher |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...ergebnis.wellen.map(
    (w) =>
      `| ${w.name} | ${w.anfragen} | ${w.dauerS} | ${w.jeSekunde} | ${w.p50Ms} | ${w.p95Ms} | ${w.p99Ms} | ${w.maxMs} | ${Object.entries(
        w.status,
      )
        .map(([s, n]) => `${s}: ${n}`)
        .join(
          ', ',
        )} | ${w.fehlerquote} | ${w.anteil429}${w.fehler429.length ? ` (${w.fehler429.join(', ')})` : ''} | ${w.angenommen} | ${w.doppelt} | ${w.datenbank.gesamtMax} (${w.datenbank.aktivMax}) | ${w.last.vorher.l1} → ${w.last.nachher.l1} |`,
  ),
  '',
  `Idempotenz: ${i.gleich ? 'erfüllt' : 'VERLETZT'} – Ereignisse nach Welle 1 ${i.nachWelle1.ereignisse} (erwartet ${i.erwartetEreignisse}), nach Welle 2 ${i.nachWelle2.ereignisse}, Dubletten ${i.nachWelle2.dubletten}; Karten ${i.nachWelle1.karten.n}/${i.nachWelle2.karten.n} (Prüfsumme ${i.nachWelle1.karten.summe === i.nachWelle2.karten.summe ? 'gleich' : 'verschieden'}), Tage ${i.nachWelle1.tage.n}/${i.nachWelle2.tage.n} (${i.nachWelle1.tage.summe === i.nachWelle2.tage.summe ? 'gleich' : 'verschieden'}), Tage je Kurs ${i.nachWelle1.tageKurs.n}/${i.nachWelle2.tageKurs.n} (${i.nachWelle1.tageKurs.summe === i.nachWelle2.tageKurs.summe ? 'gleich' : 'verschieden'}).`,
  `Nach Welle 3: ${ergebnis.nachWelle3.ereignisse} Ereignisse (erwartet ${2 * N * P * E}), Dubletten ${ergebnis.nachWelle3.dubletten}.`,
].join('\n');
schreibe(`${values.aus}.md`, md);
schreibe(`${values.aus}.json`, ergebnis);
console.log(md);
