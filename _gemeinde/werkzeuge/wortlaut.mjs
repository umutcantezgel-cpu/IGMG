#!/usr/bin/env node
/**
 * wortlaut.mjs – Wortlaut-Vergleich der Rechts- und Einwilligungstexte
 * (Lauf „Gestaltung aufwerten und Vercel-startklar machen“, Kriterium Z-12, Rolle H-R01).
 *
 * Aufruf:
 *   node /home/user/IGMG/_gemeinde/werkzeuge/wortlaut.mjs --basis 9ebb4bc --stand HEAD \
 *     --protokoll /home/user/IGMG/_gemeinde/protokolle/H-R01-wortlaut
 * Schreibt nur <protokoll>.json und <protokoll>.md. Liest ausschließlich (git show, ls-tree, ls-files, grep;
 * Dateien im Arbeitsbaum nur bei --stand ARBEITSSTAND).
 * Exitcode 0: kein offener Befund „hoch“. Exitcode 2: mindestens ein offener Befund „hoch“.
 *
 * Verfahren
 *  - Sprachdateien (alle JSON-Dateien unter web/messages): je Schlüssel (Pfad) ein SHA-256 des Werts (exakt). Ein Wert, der unter
 *    anderem Schlüssel wieder auftaucht, gilt als „verschoben“.
 *  - Code (TS/TSX) und Rechtsdokumente (Markdown): je Textliteral, JSX-Text bzw. Absatz ein SHA-256 des auf
 *    Einzelleerzeichen normalisierten Textes. Gleicher Text = „gleich“. Verschwindet ein Text und erscheint ein
 *    anderer mit Wortähnlichkeit ≥ 0,5, gilt das als „geändert“; übrige sind „entfernt“ bzw. „neu“.
 *  - Rechtsbezug: Quellen „rein“ (Seed, Rechtsseiten, Rechtskomponenten, Mail-Vorlagen, Rechtsdokumente) gelten
 *    ganz; gemischte Quellen (Keyword-Fund in web/src) nur, wenn der Text einen Rechtsbegriff enthält.
 *  - Befund: Änderung, Entfernung oder Neuaufnahme eines Rechtstextes = „hoch“, außer er ist in AUSNAHMEN mit
 *    Grund eingetragen. Nicht-Rechtstexte werden nur zur Kontrolle aufgeführt.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const REPO = '/home/user/IGMG';
const WERKZEUG = 'wortlaut.mjs';
const VERSION = '1.0';
// Der TypeScript-Compiler des Projekts wird nur gelesen (devDependency), keine Abhängigkeit wird hinzugefügt.
const requireWeb = createRequire(path.join(REPO, 'web', 'package.json'));
const ts = requireWeb('typescript');

// ---------------------------------------------------------------- Argumente
const AUFRUF = 'node wortlaut.mjs --basis 9ebb4bc --stand HEAD --protokoll /absoluter/pfad/ohne-endung';
const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i] ?? '';
  if (!k.startsWith('--') || process.argv[i + 1] === undefined) {
    console.error(`Aufruf: ${AUFRUF}`);
    process.exit(1);
  }
  args[k.slice(2)] = process.argv[i + 1];
}
const BASIS = args.basis ?? '9ebb4bc';
const STAND = args.stand ?? 'HEAD';
const PROTOKOLL = args.protokoll;
if (!PROTOKOLL || !path.isAbsolute(PROTOKOLL)) {
  console.error(`Aufruf: ${AUFRUF}`);
  process.exit(1);
}
const ARBEITSSTAND = STAND === 'ARBEITSSTAND';

// ---------------------------------------------------------------- Git und Dateien (nur lesend)
// stderr wird aufgefangen: „fatal“-Meldungen zu Dateien, die es bei der Basis nicht gibt, sind erwartet.
const git = (a) =>
  execFileSync('git', ['-C', REPO, '-c', 'core.quotepath=off', ...a], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
const gitListe = (a) => git(a).split('\n').filter(Boolean);
const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
const kurzHash = (h) => (h ? h.slice(0, 12) : '—');
const normal = (s) => s.replace(/\s+/g, ' ').trim();
const kurzText = (t, n = 90) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);

/** Arbeitsbaum als Stand (ARBEITSSTAND) oder Git-Revision; nur der Stand darf den Arbeitsbaum lesen. */
const istArbeitsbaum = (rev) => rev === 'ARBEITSSTAND';

function commitVon(rev) {
  return istArbeitsbaum(rev) ? git(['rev-parse', 'HEAD']).trim() : git(['rev-parse', '--verify', `${rev}^{commit}`]).trim();
}

/** Dateien unterhalb eines Verzeichnisses bei einem Revisionsstand (Arbeitsbaum: versionierte und neue Dateien). */
function dateienIn(rev, verzeichnis) {
  if (istArbeitsbaum(rev)) {
    const alle = [
      ...gitListe(['ls-files', '--', verzeichnis]),
      ...gitListe(['ls-files', '-o', '--exclude-standard', '--', verzeichnis]),
    ];
    return [...new Set(alle)].sort();
  }
  return gitListe(['ls-tree', '-r', '--name-only', rev, '--', verzeichnis]).sort();
}

/** Inhalt einer Datei bei einem Revisionsstand, null wenn es die Datei dort nicht gibt. */
function lesen(rev, datei) {
  if (istArbeitsbaum(rev)) {
    const p = path.join(REPO, datei);
    return existsSync(p) ? readFileSync(p, 'utf8') : null;
  }
  // cat-file statt show: git show liefert für fehlende Pfade mit Klammern eine leere Ausgabe ohne Fehler
  try {
    return git(['cat-file', 'blob', `${rev}:${datei}`]);
  } catch {
    return null;
  }
}

/** Dateiliste aus Dateien und Verzeichnissen (Verzeichnisse werden je Revision aufgelöst). */
function dateiliste(rev, eintraege, filter) {
  const out = new Set();
  for (const e of eintraege) {
    if (/\.[a-z]+$/i.test(e)) out.add(e);
    else for (const f of dateienIn(rev, e)) out.add(f);
  }
  return [...out].filter(filter ?? (() => true)).sort();
}

/** Stellen im Quellcode, an denen ein Rechtsbegriff vorkommt (Auswahl gemischter Quellen). */
const BEGRIFFE_SUCHE =
  'einwillig|zustimm|einverst|datenschutz|impressum|rechtlich|widerruf|auftragsverarb|drittland|personenbezogen|konzept|haftung|hosting|verantwort|cookie';
function fundstellen(rev) {
  const suchargs = istArbeitsbaum(rev) ? [] : [rev];
  let ausgabe = '';
  try {
    ausgabe = git(['grep', '-l', '-i', '-E', BEGRIFFE_SUCHE, ...suchargs, '--', 'web/src', 'web/drizzle/seeds']);
  } catch (e) {
    ausgabe = typeof e.stdout === 'string' ? e.stdout : '';
  }
  return ausgabe
    .split('\n')
    .filter(Boolean)
    .map((z) => (istArbeitsbaum(rev) ? z : z.slice(rev.length + 1)));
}

// ---------------------------------------------------------------- Quellen
const RECHTS_SEED = ['web/drizzle/seeds/bereiche/rechtliches.ts'];
const RECHTS_KOMPONENTEN = [
  'web/src/components/website/rechtliches',
  'web/src/components/website/KonzeptHinweis.tsx',
  'web/src/app/[locale]/(website)/impressum/page.tsx',
  'web/src/app/[locale]/(website)/datenschutz/page.tsx',
  'web/src/lib/validierung/seiteninhalte/impressum.ts',
  'web/src/lib/validierung/seiteninhalte/datenschutz.ts',
];
const MAIL_VORLAGEN = ['web/src/lib/mail/vorlagen'];
const SPRACHDATEIEN = ['web/messages'];
const RECHTSDOKUMENTE = ['web/docs/recht'];
/** Liegt die Datei in einer Rechtsquelle (als Datei oder innerhalb eines Verzeichnisses)? */
const RECHTS_QUELLEN_EINTRAEGE = [...RECHTS_SEED, ...RECHTS_KOMPONENTEN, ...MAIL_VORLAGEN];
const inRechtsquelle = (f) => RECHTS_QUELLEN_EINTRAEGE.some((q) => f === q || f.startsWith(`${q}/`));

/** Gemischte Quellen: nur Texte mit Rechtsbegriff zählen als Rechtstext. */
const RECHT_TERME =
  /einwillig|zustimm|einverst|datenschutz|personenbezog|daten|verarbeit|speicher|widerruf|impressum|rechtlich|recht|haftung|hoster|hosting|verantwort|anbieter|weitergab|lösch|frist|cookie|tracking|dritt|auftrag|aufbewahr|verbindungsdaten|protokoll|konzept|hinweis|kontakt|mail/i;

/** Rechtsschlüssel in Sprachdateien: ganze Namensräume plus Muster in der Schlüsselbezeichnung. */
const RECHT_NAMENSRAEUME = new Set(['rechtliches', 'hinweis', 'mails', 'fehlergrenze', 'fuss']);
const RECHT_MUSTER =
  /einwillig|zustimm|einverst|datenschutz|impressum|rechtlich|rechtstext|widerruf|verantwort|entwurf|hosting|haftung|dsgvo|verarbeit|nurdeutsch|konzept|hinweis|personenbezog|cookie|weitergab|aufbewahr|auftragsverarb|drittland|speicher|verbindungsdaten/i;

function rechtSchluessel(schluessel) {
  const teile = schluessel.split('.');
  const ohneSprache = ['de', 'tr', 'en'].includes(teile[0]) ? teile.slice(1) : teile;
  return RECHT_NAMENSRAEUME.has(ohneSprache[0]) || RECHT_MUSTER.test(schluessel);
}

// ---------------------------------------------------------------- Textauszug aus Code (TS/TSX)
/** Klassen-Token von Tailwind-artigen Zeichenketten (flex-col, gap-3, p-5, [&>x] …). */
function istKlasse(wort) {
  return /^[a-z0-9]+(-[a-z0-9]+)+$/.test(wort) || /[:[\]/%!_]|\d/.test(wort);
}

/** Prosa-Filter für Komponenten: echte Sätze und Beschriftungen, keine Klassen, Schlüssel oder Pfade. */
function istText(t) {
  if (!/\p{L}{3,}/u.test(t)) return false;
  const woerter = t.split(' ').filter(Boolean);
  if (woerter.length === 1 && (t.includes('.') || !/^\p{Lu}/u.test(t) || istKlasse(t))) return false;
  const klassen = woerter.filter(istKlasse).length;
  return klassen / woerter.length < 0.5;
}

/** Bezeichner wie 'absatz' oder 'titelDe' sind keine Texte (Seed-Modus „alle“). */
const istBezeichner = (t) => /^[a-z][A-Za-z0-9_]*$/.test(t);

/** Schlüsselnamen (Eigenschaftsnamen, Importe, Literaltypen) sind keine Texte. */
function istSchluesselName(k) {
  const p = k.parent;
  if (!p) return false;
  if (ts.isPropertyAssignment(p) && p.name === k) return true;
  if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isExternalModuleReference(p)) return true;
  if (ts.isLiteralTypeNode(p)) return true;
  // Direktiven ('use client', 'use server', 'use cache') sind Anweisungen an den Bau, kein Text (Fehlalarm K-14)
  if (ts.isExpressionStatement(p) && /^use [a-z: ]+$/.test(k.text)) return true;
  return false;
}

function textteile(datei, quelltext, modus) {
  const art = datei.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(datei, quelltext, ts.ScriptTarget.Latest, true, art);
  const roh = [];
  const besuche = (k) => {
    if (ts.isStringLiteral(k) || ts.isNoSubstitutionTemplateLiteral(k)) {
      if (!istSchluesselName(k)) roh.push(k.text);
    } else if (ts.isJsxText(k)) {
      roh.push(k.text);
    }
    k.forEachChild(besuche);
  };
  besuche(sf);
  return roh
    .map(normal)
    .filter((t) => t.length > 0 && (modus === 'alle' ? !istBezeichner(t) : istText(t)));
}

/** Absätze eines Markdown-Dokuments (durch Leerzeilen getrennt). */
const absaetze = (text) =>
  text
    .split(/\n\s*\n/)
    .map(normal)
    .filter((t) => t.length > 0);

// ---------------------------------------------------------------- Vergleich
function aehnlich(a, b) {
  const wa = new Set(a.toLowerCase().match(/\p{L}{2,}/gu) ?? []);
  const wb = new Set(b.toLowerCase().match(/\p{L}{2,}/gu) ?? []);
  if (!wa.size || !wb.size) return 0;
  let schnitt = 0;
  for (const w of wa) if (wb.has(w)) schnitt += 1;
  return schnitt / (wa.size + wb.size - schnitt);
}

function eintrag(o) {
  return {
    gruppe: o.gruppe,
    datei: o.datei,
    schluessel: o.schluessel,
    sprache: o.sprache ?? '—',
    status: o.status,
    hash_vorher: o.hv ?? null,
    hash_jetzt: o.hj ?? null,
    text_vorher: o.tv ?? null,
    text_jetzt: o.tj ?? null,
    recht: !!o.recht,
    rein: !!o.rein,
    aehnlichkeit: o.sim ?? null,
    anzahl: o.anzahl ?? null,
  };
}

/** Textweiser Vergleich (Code und Absätze). */
function vergleicheTexte({ gruppe, datei, rein, rechtFn }, basis, stand, sammler) {
  const zaehle = (liste) => {
    const m = new Map();
    for (const t of liste) {
      const h = sha(t);
      if (!m.has(h)) m.set(h, { h, t, n: 0 });
      m.get(h).n += 1;
    }
    return m;
  };
  const mb = zaehle(basis);
  const ms = zaehle(stand);
  const restB = [];
  const restS = [];
  for (const [h, b] of mb) {
    const s = ms.get(h);
    const gl = s ? Math.min(b.n, s.n) : 0;
    if (gl > 0) {
      sammler.push(
        eintrag({
          gruppe, datei, schluessel: `Text: ${kurzText(b.t)}`, status: 'gleich', hv: h, hj: h,
          tv: b.t, tj: b.t, recht: rechtFn(b.t), rein, anzahl: gl,
        }),
      );
    }
    for (let i = 0; i < b.n - gl; i += 1) restB.push(b);
  }
  for (const [h, s] of ms) {
    const bn = mb.get(h)?.n ?? 0;
    for (let i = 0; i < s.n - bn; i += 1) restS.push({ ...s, verwendet: false });
  }
  for (const b of restB) {
    let idx = -1;
    let best = 0;
    restS.forEach((s, i) => {
      if (s.verwendet) return;
      const sim = aehnlich(b.t, s.t);
      if (sim > best) {
        best = sim;
        idx = i;
      }
    });
    if (idx >= 0 && best >= 0.5) {
      const s = restS[idx];
      s.verwendet = true;
      sammler.push(
        eintrag({
          gruppe, datei, schluessel: `Text: ${kurzText(s.t)}`, status: 'geaendert', hv: b.h, hj: s.h,
          tv: b.t, tj: s.t, recht: rechtFn(b.t) || rechtFn(s.t), rein, sim: Math.round(best * 100) / 100,
        }),
      );
    } else {
      sammler.push(
        eintrag({
          gruppe, datei, schluessel: `Text: ${kurzText(b.t)}`, status: 'entfernt', hv: b.h, hj: null,
          tv: b.t, tj: null, recht: rechtFn(b.t), rein,
        }),
      );
    }
  }
  for (const s of restS) {
    if (s.verwendet) continue;
    sammler.push(
      eintrag({
        gruppe, datei, schluessel: `Text: ${kurzText(s.t)}`, status: 'neu', hv: null, hj: s.h,
        tv: null, tj: s.t, recht: rechtFn(s.t), rein,
      }),
    );
  }
}

/** Sprachdatei: je Schlüssel exakter Vergleich; Entfernte und Neue werden für „verschoben“ gesammelt. */
function vergleicheSprachdatei(datei, basisRoh, standRoh, sammler, pool) {
  const basis = new Map();
  const stand = new Map();
  if (basisRoh) for (const e of flatten(JSON.parse(basisRoh))) basis.set(e.schluessel, e.wert);
  if (standRoh) for (const e of flatten(JSON.parse(standRoh))) stand.set(e.schluessel, e.wert);
  const meta = datei.endsWith('neu-uebersetzt.json');
  const sprachVon = (schl) => {
    const erstes = schl.split('.')[0].replace(/\[.*$/, '');
    if (['de', 'tr', 'en'].includes(erstes)) return erstes;
    return datei.match(/\/(de|tr|en)\.json$/)?.[1] ?? '—';
  };
  const alle = [...new Set([...basis.keys(), ...stand.keys()])].sort();
  for (const schl of alle) {
    const bv = basis.get(schl);
    const sv = stand.get(schl);
    const recht = !meta && rechtSchluessel(schl);
    const basisfelder = { gruppe: 'M', datei, schluessel: schl, sprache: sprachVon(schl), recht, rein: false };
    if (bv !== undefined && sv !== undefined) {
      const hv = sha(bv);
      const hj = sha(sv);
      sammler.push(
        eintrag({
          ...basisfelder,
          status: hv === hj ? 'gleich' : 'geaendert',
          hv, hj, tv: bv, tj: sv,
        }),
      );
    } else if (bv !== undefined) {
      pool.entfernt.push({ ...basisfelder, hv: sha(bv), tv: bv });
    } else {
      pool.neu.push({ ...basisfelder, hj: sha(sv), tj: sv });
    }
  }
}

/** Ein Wert, der anderswo wieder auftaucht, ist „verschoben“; der Rest bleibt „entfernt“ bzw. „neu“. */
function verschiebe(pool, sammler) {
  const neuNachWert = new Map();
  for (const n of pool.neu) {
    if (!neuNachWert.has(n.hj)) neuNachWert.set(n.hj, []);
    neuNachWert.get(n.hj).push(n);
  }
  const verbraucht = new Set();
  for (const e of pool.entfernt) {
    const kandidaten = neuNachWert.get(e.hv)?.find((n) => !verbraucht.has(n));
    if (kandidaten) {
      verbraucht.add(kandidaten);
      sammler.push(
        eintrag({
          ...e,
          status: 'verschoben',
          hj: e.hv,
          tj: e.tv,
          schluessel: `${e.schluessel} → ${kandidaten.datei.replace(/^web\//, '')}: ${kandidaten.schluessel}`,
        }),
      );
    } else {
      sammler.push(eintrag({ ...e, status: 'entfernt' }));
    }
  }
  for (const n of pool.neu) {
    if (!verbraucht.has(n)) sammler.push(eintrag({ ...n, status: 'neu' }));
  }
}

function flatten(obj, pfad = [], out = []) {
  if (typeof obj === 'string') {
    out.push({ schluessel: pfad.join('.'), wert: obj });
    return out;
  }
  if (Array.isArray(obj)) {
    if (obj.length && obj.every((x) => typeof x === 'string')) {
      // Listen von Schlüsselnamen (neu-uebersetzt.json): Identität über den Namen selbst
      for (const x of obj) out.push({ schluessel: `${pfad.join('.')}[${x}]`, wert: x });
      return out;
    }
    obj.forEach((x, i) => flatten(x, [...pfad, String(i)], out));
    return out;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) flatten(v, [...pfad, k], out);
  }
  return out;
}

// ---------------------------------------------------------------- Ausnahmen (mit Grund)
/** Prüft, ob die Auszüge der Rechtsdokumente bereits in den Quellen stehen (Entwurf = nicht eingespielt). */
function pruefeNichtEingespielt(absatzListe, quellenKompakt) {
  const kompakt = (s) => s.replace(/[\s#*_>|`"'„“”\\\-–—:;,.!?()[\]{}]/g, '').toLowerCase();
  const treffer = absatzListe.filter((p) => {
    const k = kompakt(p).slice(0, 50);
    return k.length >= 30 && quellenKompakt.includes(k);
  });
  return treffer.length;
}

const V2_DATEI = 'web/docs/recht/datenschutz-hosting-v2.md';
const VERZEICHNIS_DATEI = 'web/docs/recht/VERARBEITUNGSVERZEICHNIS.md';

// ---------------------------------------------------------------- Lauf
const commitBasis = commitVon(BASIS);
const commitStand = commitVon(STAND);

// Quellenlisten je Revision (Vereinigung: Dateien, die nur auf einer Seite existieren, werden ebenfalls geprüft)
const gruppenDef = [
  { id: 'M', titel: 'Sprachdateien', eintraege: SPRACHDATEIEN, filter: (f) => f.endsWith('.json') },
  { id: 'S', titel: 'Seed Impressum/Datenschutz', eintraege: RECHTS_SEED, filter: () => true, modus: 'alle', rein: true },
  { id: 'C', titel: 'Rechtskomponenten und Rechtsseiten', eintraege: RECHTS_KOMPONENTEN, filter: (f) => f.endsWith('.ts') || f.endsWith('.tsx'), modus: 'prosa', rein: true },
  { id: 'V', titel: 'Mail-Vorlagen', eintraege: MAIL_VORLAGEN, filter: (f) => f.endsWith('.ts') || f.endsWith('.tsx'), modus: 'prosa', rein: true },
  { id: 'D', titel: 'Rechtsdokumente', eintraege: RECHTSDOKUMENTE, filter: (f) => f.endsWith('.md'), rein: true },
];

const dateiGruppen = []; // { gruppe, datei, modus, rein }
const sammler = [];
const pool = { neu: [], entfernt: [] };
const quellen = [];

const fundBasis = fundstellen(BASIS);
const fundStand = fundstellen(STAND);
const gFundstellen = [...new Set([...fundBasis, ...fundStand])]
  .filter((f) => !inRechtsquelle(f))
  .filter((f) => !f.startsWith('web/tests/'))
  .sort();

for (const g of gruppenDef) {
  const dateien = [
    ...new Set([
      ...dateiliste(BASIS, g.eintraege, g.filter),
      ...dateiliste(STAND, g.eintraege, g.filter),
    ]),
  ].sort();
  for (const d of dateien) {
    const modus = g.id === 'M' ? 'schluessel' : g.id === 'D' ? 'absatz' : (g.modus ?? 'prosa');
    dateiGruppen.push({ gruppe: g.id, datei: d, modus, rein: g.rein });
  }
}
for (const d of gFundstellen) dateiGruppen.push({ gruppe: 'G', datei: d, modus: 'prosa', rein: false });

// Dateien einlesen und vergleichen
for (const { gruppe, datei, modus, rein } of dateiGruppen) {
  const rb = lesen(BASIS, datei);
  const rs = lesen(STAND, datei);
  if (rb === null && rs === null) continue;
  quellen.push({
    gruppe,
    datei,
    modus,
    rein,
    vorhanden_basis: rb !== null,
    vorhanden_stand: rs !== null,
    dateihash_basis: rb === null ? null : sha(rb),
    dateihash_stand: rs === null ? null : sha(rs),
    identisch: rb === rs,
  });
  if (gruppe === 'M') {
    vergleicheSprachdatei(datei, rb, rs, sammler, pool);
    continue;
  }
  if (gruppe === 'D') {
    const basisAbs = rb ? absaetze(rb) : [];
    const standAbs = rs ? absaetze(rs) : [];
    vergleicheTexte(
      { gruppe, datei, rein: true, rechtFn: () => true },
      basisAbs,
      standAbs,
      sammler,
    );
    continue;
  }
  const rechtFn = rein ? () => true : (t) => RECHT_TERME.test(t);
  const basisTexte = rb ? textteile(datei, rb, modus) : [];
  const standTexte = rs ? textteile(datei, rs, modus) : [];
  vergleicheTexte({ gruppe, datei, rein, rechtFn }, basisTexte, standTexte, sammler);
}
verschiebe(pool, sammler);

// Automatische Prüfung: Ist der Hosting-Entwurf v2 bereits in einer Quelle eingespielt?
const v2Rohtext = lesen(STAND, V2_DATEI) ?? '';
const v2Absaetze = absaetze(v2Rohtext);
const quellenBlob = [];
for (const verz of ['web/src', 'web/messages', 'web/drizzle/seeds']) {
  for (const f of dateienIn(STAND, verz)) {
    if (!/\.(tsx?|json|mjs)$/.test(f)) continue;
    quellenBlob.push(lesen(STAND, f) ?? '');
  }
}
const kompaktBlob = quellenBlob
  .join('\n')
  .replace(/[\s#*_>|`"'„“”\\\-–—:;,.!?()[\]{}]/g, '')
  .toLowerCase();
const v2Eingespielt = pruefeNichtEingespielt(v2Absaetze, kompaktBlob);

const AUSNAHMEN = [
  {
    id: 'A-01',
    grund: `AUFTRAG-Ausnahme (einzige erlaubte Abweichung): versionierter Hosting-Baustein v2 als Entwurf. Automatische Prüfung: ${v2Absaetze.length} Absätze, davon ${v2Eingespielt} in den Quellen (web/src, web/messages, web/drizzle/seeds) bei ${STAND} gefunden; 0 bedeutet nicht eingespielt.`,
    passt: (e) => e.datei === V2_DATEI,
  },
  {
    id: 'A-02',
    grund: 'Neue Cockpit-Texte der Verwaltung (Startklar-Cockpit, V-13/Z-12). Sie beschreiben Prüfungen und Rechtsangaben, sind aber keine Texte für Besucherinnen und Besucher.',
    passt: (e) => e.gruppe === 'M' && e.datei.endsWith('verwaltung/startklar.json') && e.status === 'neu',
  },
  {
    id: 'A-03',
    grund: 'Neue Cockpit-Prüftexte und Cockpit-Oberfläche (Verwaltung, V-13/Z-12). Sie beschreiben die Prüfungen, sind aber keine Texte für Besucherinnen und Besucher.',
    passt: (e) => e.status === 'neu' && e.gruppe === 'G' && e.datei.includes('startklar'),
  },
  { id: 'A-04', grund: 'Neue Abschnittsüberschriften „meldung.gruppe.*“ (Legenden der Fieldsets im Meldeformular, K-12, z. B. „Einwilligung“). Der Einwilligungstext selbst ist unverändert. Neuer Schlüssel, kein geänderter Wortlaut (Bedienelement).', passt: (e) => e.gruppe === 'M' && e.status === 'neu' && /(^|\.)meldung\.gruppe\.(person|anliegen|rueckmeldung|einwilligung)$/.test(e.schluessel) },
  { id: 'A-05', grund: 'Neuer Schlüssel „rechtliches.inhaltsverzeichnis“ („Inhalt“, Name der Navigation im Inhaltsverzeichnis der Rechtsseiten, K-14). Neuer Schlüssel, kein geänderter Wortlaut (Bedienelement).', passt: (e) => e.gruppe === 'M' && e.status === 'neu' && /(^|\.)rechtliches\.inhaltsverzeichnis$/.test(e.schluessel) },
  { id: 'A-06', grund: 'Neues internes Verarbeitungsverzeichnis `web/docs/recht/VERARBEITUNGSVERZEICHNIS.md` nach AUFTRAG V-11 (Vorlage für Vorstand und Rechtsberatung, MENSCHEN ML-12). Es wird nicht ausgeliefert und ändert keinen Wortlaut eines bestehenden Rechts- oder Einwilligungstextes; neue Datei, kein geänderter Wortlaut.', passt: (e) => e.status === 'neu' && String(e.datei).endsWith('docs/recht/VERARBEITUNGSVERZEICHNIS.md') },
  { id: 'A-07', grund: 'Schriftangabe der Mail-Vorlage (`font-family` in `web/src/lib/mail/vorlagen/Rahmen.tsx`, H-W01): „Georgia, serif“ → „Georgia, \'Times New Roman\', serif“. Gestaltungswert ohne Wortlaut, kein Rechtstext.', passt: (e) => String(e.datei).endsWith('lib/mail/vorlagen/Rahmen.tsx') && /^Text: Georgia,( 'Times New Roman',)? serif$/.test(e.schluessel) },
  // Lauf „Gemeinde-Plattform“ (PLAN §5): neue Texte für neue Funktionen; kein bestehender Wortlaut ändert sich
  {
    id: 'G-01',
    grund: 'Rechtsentwürfe der Gemeinde-Plattform in `web/docs/recht/entwuerfe/` (Datenschutz v2, Einwilligungen, DSFA, Schutzkonzept, Löschkonzept, Nutzungsbedingungen, Vereinbarung Rezitation, Verarbeitungsverzeichnis-Ergänzung). Als Entwurf markiert, nicht ausgeliefert; Prüfung durch DSB/Recht (MENSCHEN MN-11).',
    passt: (e) => e.status === 'neu' && String(e.datei).startsWith('web/docs/recht/entwuerfe/'),
  },
  {
    id: 'G-02',
    grund: 'Nur Tabellenschreibweise (Prettier, Commit 58a3344): Zellen auf Spaltenbreite aufgefüllt, Trennzeile mit Strichen. Ohne Leerzeichen, Striche und Spaltenstriche ist der Text gleich (geprüft je Eintrag).',
    passt: (e) => {
      const kern = (t) => String(t ?? '').replace(/[\s|\-]/g, '');
      return e.status === 'geaendert' && String(e.datei).endsWith('docs/recht/VERARBEITUNGSVERZEICHNIS.md') && kern(e.text_vorher) === kern(e.text_jetzt) && kern(e.text_jetzt) !== '';
    },
  },
  {
    id: 'G-03',
    grund: 'Neue Schlüssel der Gemeinde-Plattform für neue Funktionen (Konten, Mein Bereich, Push-Einwilligung, Chat, Mein Ort, Koran, Hadith, Elifbe, Lernen, Quellen, Barrierefreiheit): Einwilligungs- und Datenschutzhinweise der neuen Funktionen, versioniert über den Text-Hash (src/lib/konto/einwilligung.ts). Kein bestehender Text geändert; die Funktionen sind in der Produktion aus, bis MN-11 freigibt.',
    passt: (e) =>
      e.gruppe === 'M' &&
      e.status === 'neu' &&
      /messages\/bereiche\/(konto|mein-bereich|benachrichtigungen|chat|chat-fenster|kinder|unterricht|mein-ort|quran|hadith|elifbe|lernen|quellen|barrierefreiheit|hatim|kalender|ramadan|spenden|newsletter)\.json$/.test(String(e.datei)),
  },
  {
    id: 'G-04',
    grund: 'K-29: neue Verwaltungstexte zur Zustimmung bei Personenfotos (`messages/verwaltung/medien.json`, nur Verwaltung, neue Schlüssel).',
    passt: (e) => e.gruppe === 'M' && e.status === 'neu' && String(e.datei).endsWith('messages/verwaltung/medien.json') && /^medien\.(fehler\.einwilligungFehlt|hochladen\.(einwilligung|personenHinweis))$/.test(e.schluessel),
  },
  {
    id: 'G-05',
    grund: 'Neue technische Bezeichnungen der Konten (Betreff des Löschantrags-Tickets, Titel des Datenexports nach Art. 15/20) und ein Quellenkommentar im Seed der Eröffnungsnachricht – keine Texte bestehender Rechtsseiten.',
    passt: (e) =>
      e.status === 'neu' &&
      (String(e.datei).endsWith('src/server/actions/mein-bereich.ts') ||
        String(e.datei).endsWith('src/server/queries/konto.ts') ||
        (String(e.datei).endsWith('drizzle/seeds/daten/nachrichten.ts') && String(e.text_jetzt ?? '').startsWith('AUFTRAG 3.9'))),
  },
  // Nacharbeit Stufe C (N3, Z-12): neue Hinweistexte der neuen Module nach Tor E2; Liste aus
  // _gemeinde/protokolle/C-k2-protokoll-k2.md (Z-12) und C-k2-wortlaut-b702c7c-75cad0a.md. Kein bestehender Text geändert.
  {
    id: 'G-06',
    grund:
      'Neue Schlüssel der neuen Verwaltungsmodule (Lernen, Seiten, Anzeige, Koran, Rezitationen, Menüs, Hatim, Besondere Tage, Newsletter, Spenden, Weiterleitungen, Freigaben, Kinderschutz, Gemeinde im Blick, Sicherheitsmails an Verwaltungskonten; Audit-Bezeichnungen; Hinweis zur Benachrichtigung bei Ankündigungen). Feldhinweise, Statusnamen und Rückmeldungen der nur deutschen Verwaltung (ADR 0016); das Werkzeug greift sie wegen Wörtern wie „Hinweis“, „Entwurf“, „speichern“ oder „Einwilligung“ auf. Sie sind keine Rechts- oder Einwilligungstexte für Besucherinnen und Besucher; die Einwilligungstexte der Plattform stehen in den Bereichsdateien (G-03) und in docs/recht/entwuerfe (G-01).',
    passt: (e) =>
      e.gruppe === 'M' &&
      e.status === 'neu' &&
      (/messages\/verwaltung\/(lernen|seiten|anzeige|koran|rezitationen|menues|hatim|besondereTage|newsletter|spenden|weiterleitungen|freigaben|kinderschutz|gemeindeImBlick|sicherheit)\.json$/.test(String(e.datei)) ||
        (String(e.datei).endsWith('messages/verwaltung/audit.json') && /^audit\.aktion\./.test(e.schluessel)) ||
        (String(e.datei).endsWith('messages/verwaltung/ankuendigungen.json') && e.schluessel === 'ankuendigungen.formular.statusHinweis')),
  },
  {
    id: 'G-07',
    grund:
      'Neue Beschriftungen öffentlicher Funktionen ohne Rechtsinhalt: „bloecke.nurDeutsch“ der CMS-Seiten (wortgleich mit dem Bestandstext „allgemein.nurDeutsch“), „start.fasten.vorschauHinweis“ (Vorschau des Fastenbogens auf der Startseite) und die interne Grundangabe „Konto gelöscht“ im Moderationsprotokoll (src/lib/konto/loeschen.ts).',
    passt: (e) =>
      e.status === 'neu' &&
      ((e.gruppe === 'M' && String(e.datei).endsWith('messages/bereiche/seiten.json') && /^(de|tr|en)\.bloecke\.nurDeutsch$/.test(e.schluessel)) ||
        (e.gruppe === 'M' && /messages\/(de|tr|en)\.json$/.test(String(e.datei)) && e.schluessel === 'start.fasten.vorschauHinweis') ||
        (String(e.datei).endsWith('src/lib/konto/loeschen.ts') && e.text_jetzt === 'Konto gelöscht')),
  },
  {
    id: 'G-08',
    grund:
      'Verarbeitungsverzeichnis, Abschnitt Mailanbieter: nur Tabellenschreibweise (wie G-02) und der Verweis auf die archivierte MENSCHEN-Datei (`_werkstatt/MENSCHEN.md` → `_archiv/lauf-gestaltung-2026-10/MENSCHEN.md`, Archivierung 14.10.2026). Ohne Leerzeichen, Striche und Spaltenstriche und mit dem neuen Pfad ist der Text gleich (geprüft je Eintrag).',
    passt: (e) => {
      const kern = (t) => String(t ?? '').replace(/[\s|\-]/g, '');
      const umgezogen = String(e.text_vorher ?? '').replaceAll('_werkstatt/MENSCHEN.md', '_archiv/lauf-gestaltung-2026-10/MENSCHEN.md');
      return e.status === 'geaendert' && String(e.datei).endsWith('docs/recht/VERARBEITUNGSVERZEICHNIS.md') && kern(umgezogen) === kern(e.text_jetzt) && kern(e.text_jetzt) !== '';
    },
  },
];

/** Bekannte erlaubte Schlüssel ohne Rechtsbezug (Vorgabe der Koordination): kennzeichnen, ohne Befund. */
const BEKANNT_NICHT_RECHT = [
  { id: 'N-01', grund: 'Bekannte Ausnahme (Vorgabe): neuer Schlüssel „karten.ganztaegig“ (Kartenbeschriftung „ganztägig“), kein Rechtstext.', passt: (e) => e.gruppe === 'M' && e.status === 'neu' && /(^|\.)karten\.ganztaegig$/.test(e.schluessel) },
  { id: 'N-02', grund: 'Bekannte Ausnahme (Vorgabe): Platzhalter „[Text fehlt: organisation.news.leer]“ durch den Leerzustand-Text ersetzt (Organisationsseite, O-12), kein Rechtstext.', passt: (e) => e.gruppe === 'M' && e.status === 'geaendert' && /(^|\.)organisation\.news\.leer$/.test(e.schluessel) },
  { id: 'N-03', grund: 'Bekannte Ausnahme (Vorgabe): neuer Schlüssel „projekte.meilenstein.stand“ (Fortschritt der Meilensteine), kein Rechtstext.', passt: (e) => e.gruppe === 'M' && e.status === 'neu' && /(^|\.)projekte\.meilenstein\.stand$/.test(e.schluessel) },
  { id: 'N-04', grund: 'Neue Schlüssel „start.bogenTitel“ und „start.bogenBeschreibung“ (Tagesbogen auf der Startseite, B-06), kein Rechtstext.', passt: (e) => e.gruppe === 'M' && e.status === 'neu' && /(^|\.)start\.bogen(Titel|Beschreibung)$/.test(e.schluessel) },
];

/** Befund je Eintrag. */
const HINWEIS_DATEI = {
  [VERZEICHNIS_DATEI]:
    'Neues internes Verzeichnis nach V-11 (Verarbeitungsverzeichnis). Kein Wortlaut eines bestehenden Textes wurde geändert. Die AUFTRAG-Ausnahme nennt nur den Hosting-Baustein v2. Einordnung als Rechtstext: OFFENE FRAGE an den Orchestrator.',
};

function begruendungStandard(e) {
  if (e.status === 'gleich') return 'identisch (SHA-256 gleich)';
  if (e.status === 'verschoben') return `Wert identisch, Schlüssel verschoben (${e.datei})`;
  if (!e.recht) return e.status === 'geaendert' ? 'kein Rechtsbezug (Kontrolle)' : 'kein Rechtsbezug (Kontrolle)';
  if (e.status === 'neu') return 'Neuer Rechtstext ohne Vergleichswert bei der Basis. Begründung offen.';
  if (e.status === 'geaendert') return 'Wortlaut verändert (Hash vorher ≠ jetzt). Begründung offen.';
  return 'Wortlaut bei Stand nicht mehr vorhanden. Begründung offen.';
}

for (const e of sammler) {
  // Ausnahmen gelten nur für Rechtstexte; Nicht-Rechtstexte bleiben im Kontrollabschnitt
  const aus = e.recht ? AUSNAHMEN.find((a) => a.passt(e)) : undefined;
  const bekannt = !e.recht ? BEKANNT_NICHT_RECHT.find((a) => a.passt(e)) : undefined;
  e.ausnahme = aus ? aus.id : bekannt ? bekannt.id : null;
  e.begruendung = HINWEIS_DATEI[e.datei] && e.recht && e.status !== 'gleich'
    ? HINWEIS_DATEI[e.datei]
    : aus
      ? aus.grund
      : bekannt
        ? bekannt.grund
        : begruendungStandard(e);
  if (e.status === 'gleich' || e.status === 'verschoben') e.befund = 'keiner';
  else if (!e.recht) e.befund = 'keiner';
  else if (aus) e.befund = 'ausnahme';
  else e.befund = 'hoch';
  // Einheit für die Zählung: neue Rechtsdokumente zählen als eine Datei, nicht als Absatzliste
  e.einheit = e.gruppe === 'D' && e.status === 'neu' ? `D|${e.datei}` : `${e.gruppe}|${e.datei}|${e.schluessel}`;
}

for (const a of [...AUSNAHMEN, ...BEKANNT_NICHT_RECHT]) a.treffer = sammler.filter((e) => e.ausnahme === a.id).length;

sammler.sort((x, y) =>
  x.gruppe.localeCompare(y.gruppe) ||
  x.datei.localeCompare(y.datei) ||
  x.schluessel.localeCompare(y.schluessel) ||
  x.status.localeCompare(y.status),
);

const zaehleEinheiten = (filter) => new Set(sammler.filter(filter).map((e) => e.einheit)).size;
const zusammenfassung = {
  recht_eintraege: sammler.filter((e) => e.recht).length,
  recht: Object.fromEntries(
    ['gleich', 'verschoben', 'geaendert', 'neu', 'entfernt'].map((s) => [
      s,
      sammler.filter((e) => e.recht && e.status === s).length,
    ]),
  ),
  befund_hoch_offen_einheiten: zaehleEinheiten((e) => e.befund === 'hoch'),
  befund_ausnahme_einheiten: zaehleEinheiten((e) => e.befund === 'ausnahme'),
  nicht_recht_veraendert: sammler.filter((e) => !e.recht && ['geaendert', 'neu', 'entfernt'].includes(e.status)).length,
  nicht_recht_gleich: sammler.filter((e) => !e.recht && e.status === 'gleich').length,
  eintraege_gesamt: sammler.length,
};

const ergebnisHash = sha(
  JSON.stringify(
    sammler.map((e) => [e.gruppe, e.datei, e.schluessel, e.status, e.hash_vorher, e.hash_jetzt, e.befund, e.ausnahme]),
  ),
);

const unversioniert = gitListe(['ls-files', '-o', '--exclude-standard', '--', 'web']).length;
const webAbweichung = (() => {
  try {
    git(['diff', '--quiet', 'HEAD', '--', 'web']);
    return false;
  } catch {
    return true;
  }
})();

const protokoll = {
  werkzeug: { name: WERKZEUG, version: VERSION, aufruf: `node ${WERKZEUG} --basis ${BASIS} --stand ${STAND} --protokoll ${PROTOKOLL}` },
  basis: { rev: BASIS, commit: commitBasis },
  stand: {
    rev: STAND,
    commit: commitStand,
    web_arbeitsbaum_abweichend_von_head: webAbweichung,
    unversionierte_dateien_unter_web: unversioniert,
  },
  erstellt: new Date().toISOString(),
  ausnahmen: [...AUSNAHMEN, ...BEKANNT_NICHT_RECHT].map((a) => ({ id: a.id, grund: a.grund, treffer: a.treffer })),
  quellen,
  zusammenfassung,
  ergebnis_hash: ergebnisHash,
  eintraege: sammler.map((e) => ({
    gruppe: e.gruppe,
    datei: e.datei,
    schluessel: e.schluessel,
    sprache: e.sprache,
    status: e.status,
    recht: e.recht,
    hash_vorher: e.hash_vorher,
    hash_jetzt: e.hash_jetzt,
    text_vorher: e.recht || e.status !== 'gleich' ? e.text_vorher : undefined,
    text_jetzt: e.recht || e.status !== 'gleich' ? e.text_jetzt : undefined,
    aehnlichkeit: e.aehnlichkeit,
    anzahl: e.anzahl,
    ausnahme: e.ausnahme,
    befund: e.befund,
    begruendung: e.begruendung,
  })),
};

writeFileSync(`${PROTOKOLL}.json`, `${JSON.stringify(protokoll, null, 2)}\n`, 'utf8');

// ---------------------------------------------------------------- Markdown
const zelle = (v) => String(v ?? '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const zeile = (cells) => `| ${cells.map(zelle).join(' | ')} |`;
const ergebnisWort = {
  gleich: 'gleich',
  verschoben: 'verschoben',
  geaendert: 'geändert',
  neu: 'neu',
  entfernt: 'entfernt',
};
const quelleKurz = (e) => `${e.gruppe} ${e.datei.replace(/^web\//, '')}`;

const zeilenRecht = [];
const dRows = new Set();
for (const e of sammler) {
  if (!e.recht) continue;
  if (e.gruppe === 'D' && e.status === 'neu') {
    if (dRows.has(e.datei)) continue;
    dRows.add(e.datei);
    const n = sammler.filter((x) => x.gruppe === 'D' && x.datei === e.datei && x.status === 'neu').length;
    zeilenRecht.push(
      zeile([
        quelleKurz(e),
        `neue Datei, ${n} Absätze`,
        '—',
        kurzHash(sha(lesen(STAND, e.datei) ?? '')),
        'neu',
        e.befund,
        e.begruendung,
      ]),
    );
    continue;
  }
  zeilenRecht.push(
    zeile([
      quelleKurz(e),
      e.schluessel,
      kurzHash(e.hash_vorher),
      kurzHash(e.hash_jetzt),
      ergebnisWort[e.status],
      e.befund,
      e.begruendung,
    ]),
  );
}

const zeilenNichtRecht = sammler
  .filter((e) => !e.recht && e.status !== 'gleich')
  .map((e) =>
    zeile([quelleKurz(e), e.schluessel, kurzHash(e.hash_vorher), kurzHash(e.hash_jetzt), ergebnisWort[e.status], e.befund, e.begruendung]),
  );

const auszuege = sammler
  .filter((e) => e.recht && e.status !== 'gleich' && !(e.gruppe === 'D' && e.status === 'neu' && e.datei !== '' && sammler.findIndex((x) => x.einheit === e.einheit) !== sammler.indexOf(e)))
  .map((e) => {
    if (e.einheit.startsWith('D|')) {
      const n = sammler.filter((x) => x.einheit === e.einheit).length;
      return `- **neu** · ${quelleKurz(e)} · neue Datei mit ${n} Absätzen (Einzelabsätze in der JSON-Datei)`;
    }
    const vorher = e.text_vorher ? `„${kurzText(e.text_vorher, 220)}“` : '—';
    const jetzt = e.text_jetzt ? `„${kurzText(e.text_jetzt, 220)}“` : '—';
    return `- **${ergebnisWort[e.status]}** · ${quelleKurz(e)} · ${e.schluessel}\n  - vorher: ${vorher}\n  - jetzt: ${jetzt}`;
  });

const hochListe = [...new Map(sammler.filter((e) => e.befund === 'hoch').map((e) => [e.einheit, e])).values()].map((e) =>
  e.einheit.startsWith('D|')
    ? `- ${quelleKurz(e)} · neue Datei, ${sammler.filter((x) => x.einheit === e.einheit).length} Absätze · neu · Begründung: ${e.begruendung}`
    : `- ${quelleKurz(e)} · ${e.schluessel} · ${ergebnisWort[e.status]}`,
);

const ausnahmenZeilen = [...AUSNAHMEN, ...BEKANNT_NICHT_RECHT].map((a) => `- **${a.id}** (${a.treffer} Einträge) · ${a.grund}`);

const md = `# H-R01 · Wortlaut der Rechts- und Einwilligungstexte

Stand des Protokolls: ${protokoll.erstellt} · Werkzeug: \`_gemeinde/werkzeuge/wortlaut.mjs\` (Version ${VERSION})
Basis: \`${BASIS}\` (${commitBasis.slice(0, 9)}) · Stand: \`${STAND}\` (${commitStand.slice(0, 9)})
Arbeitsbaum unter web/ weicht von HEAD ab: ${webAbweichung ? 'JA' : 'nein'} · unversionierte Dateien unter web/: ${unversioniert}
Wiederholbarkeit: Ergebnis-Hash \`${ergebnisHash.slice(0, 16)}\` (Vollwert in der JSON-Datei)

## Ergebnis

- Rechts- und Einwilligungs-Einträge: ${zusammenfassung.recht_eintraege} · gleich ${zusammenfassung.recht.gleich} · verschoben ${zusammenfassung.recht.verschoben} · geändert ${zusammenfassung.recht.geaendert} · neu ${zusammenfassung.recht.neu} · entfernt ${zusammenfassung.recht.entfernt}
- Befunde „hoch“ offen (Einheiten): **${zusammenfassung.befund_hoch_offen_einheiten}** · durch Ausnahme gedeckt: ${zusammenfassung.befund_ausnahme_einheiten}
- Nicht-Rechtstexte: ${zusammenfassung.nicht_recht_veraendert} geändert, neu oder entfernt (Kontrolltabelle unten); ${zusammenfassung.nicht_recht_gleich} gleich

## Quellen

| Gruppe | Datei | Modus | Datei-Hash vorher | Datei-Hash jetzt | Dateien identisch |
|---|---|---|---|---|---|
${quellen.map((q) => zeile([q.gruppe, q.datei.replace(/^web\//, ''), q.modus === 'alle' ? 'alle Literale' : q.modus === 'schluessel' ? 'Schlüssel (exakt)' : q.modus === 'absatz' ? 'Absätze' : q.rein ? 'Prosa (Rechtsquelle)' : 'Prosa + Rechtsbegriff', kurzHash(q.dateihash_basis), kurzHash(q.dateihash_stand), q.identisch ? 'ja' : 'nein'])).join('\n')}

Gruppen: M Sprachdateien · S Seed Impressum/Datenschutz · C Rechtskomponenten und Rechtsseiten · V Mail-Vorlagen · D Rechtsdokumente · G gemischte Quellen (Keyword-Fund; nur Texte mit Rechtsbegriff zählen). Testdateien (web/tests) und Skripte (web/scripts) sind keine Besuchertexte und nicht erfasst.

## Tabelle: Rechts- und Einwilligungstexte

| Quelle | Schlüssel | Hash vorher | Hash jetzt | Ergebnis | Befund | Begründung |
|---|---|---|---|---|---|---|
${zeilenRecht.join('\n')}

## Ausnahmen (AUFTRAG und Grund)

${ausnahmenZeilen.join('\n')}

## Befunde „hoch“ (offen)

${hochListe.length ? hochListe.join('\n') : 'keine'}

## Wortlaut-Abweichungen (Auszug, nur Rechtstexte)

${auszuege.length ? auszuege.join('\n') : 'keine'}

## Kontrolle: Nicht-Rechtstexte mit Änderung

| Quelle | Schlüssel | Hash vorher | Hash jetzt | Ergebnis | Befund | Begründung |
|---|---|---|---|---|---|---|
${zeilenNichtRecht.join('\n')}
`;

writeFileSync(`${PROTOKOLL}.md`, md, 'utf8');

console.log(
  JSON.stringify(
    {
      protokoll: { json: `${PROTOKOLL}.json`, md: `${PROTOKOLL}.md` },
      ergebnis_hash: ergebnisHash,
      zusammenfassung,
      v2_absaetze: v2Absaetze.length,
      v2_eingespielt: v2Eingespielt,
    },
    null,
    2,
  ),
);
process.exit(zusammenfassung.befund_hoch_offen_einheiten > 0 ? 2 : 0);
