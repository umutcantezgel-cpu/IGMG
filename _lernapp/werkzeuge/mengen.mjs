#!/usr/bin/env node
/**
 * Mengenbericht der Lern-App (L8-03, ABNAHME Z-L01/Z-L02/Z-L03, PLAN §5): zählt Einheiten, Stationen, Lemmata, Sätze,
 * Aufgaben, Übersetzungen, Schrift-Vorkurse, Einstufungsbank und Tipp-Karten je Kurs aus `web/inhalte/lernapp/**` und stellt
 * sie den Zielen aus PLAN §5.1 gegenüber (erfüllt, wenn Ist ≥ Ziel − 5 %). Bewertet werden nur die gewählten Stufen
 * (`--stufen`, Standard nach L3-E16 A1–B1); die Ziele sind dann die Summe dieser Stufen, Aufgaben, Einstufungsbank und
 * Tipp-Karten anteilig nach Einheiten. Je Zielsprache steht zusätzlich, was davon in Aufgaben verwiesen und was freigegeben
 * bzw. live ist (Stufe C, C-inhalte-gegen.md 1.3). Reproduzierbar: liest nur Dateien (Arbeitsbaum) oder einen Git-Stand
 * (`--rev`), ohne Datenbank, ohne Netz, ohne Zeitstempel des Laufs; gleicher Stand → gleicher Bericht.
 *
 * Aufruf (im Repository):
 *   node _lernapp/werkzeuge/mengen.mjs                         Arbeitsbaum, Bericht auf stdout
 *   node _lernapp/werkzeuge/mengen.mjs --rev <commit|zweig>    Git-Stand (z. B. einen Inhaltszweig), Bericht auf stdout
 *   node _lernapp/werkzeuge/mengen.mjs --rev a --rev b --aus _lernapp/berichte/mengen.md   mehrere Stände in eine Datei
 *   node _lernapp/werkzeuge/mengen.mjs --stufen a1,a2,b1,b2,c1                     Umfang (Standard a1,a2,b1; `alle` = A1–C1)
 *
 * Gibt keine Inhalte aus (keine Sätze, keine Schlüssel), nur Zahlen – also auch keine arabische Schrift (KERN 4.0 §3).
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const INHALT = 'web/inhalte/lernapp';

// ---------------------------------------------------------------- Ziele (PLAN §5.1–§5.3)
const STUFEN = ['a1', 'a2', 'b1', 'b2', 'c1'];
/** Umfang der Sprachkurse nach Nutzerentscheidung L3-E16 (25.10.2026: „Bis B1 reicht erstmal“); B2/C1 offener Ausbau */
const STANDARD_STUFEN = ['a1', 'a2', 'b1'];
const ZIEL = {
  a1: { einheiten: 12, stationen: 96, lemmata: 600, saetze: 2400, dialoge: 24, lesetexte: 6, sprechen: 24, schreiben: 0 },
  a2: { einheiten: 14, stationen: 112, lemmata: 900, saetze: 3600, dialoge: 28, lesetexte: 14, sprechen: 28, schreiben: 14 },
  b1: { einheiten: 16, stationen: 128, lemmata: 1300, saetze: 5200, dialoge: 32, lesetexte: 32, sprechen: 32, schreiben: 16 },
  b2: { einheiten: 16, stationen: 128, lemmata: 1700, saetze: 6800, dialoge: 32, lesetexte: 48, sprechen: 32, schreiben: 32 },
  c1: { einheiten: 14, stationen: 112, lemmata: 2000, saetze: 8000, dialoge: 28, lesetexte: 56, sprechen: 28, schreiben: 28 },
};
const ZIEL_AUFGABEN_JE_SPRACHE = 8000;
/** PLAN §5.1: je Zielsprache ≈ 400 Aufgaben Einstufungsbank, je Richtung (Ausgangssprache) ≈ 300 Tipp-Karten */
const ZIEL_EINSTUFUNG_JE_SPRACHE = 400;
const ZIEL_TIPPS_JE_RICHTUNG = 300;
/**
 * Typen, aus denen der Einstufungstest seine Aufgaben nimmt (`EINSTUFUNG_TYPEN` in `web/src/lib/lernapp/engine/einstufung.ts`;
 * keine eigene Bank, die Kandidaten kommen aus den Lektionen der Einheiten). Der Unit-Test `lernapp/mengen-bericht` hält
 * beide Listen gleich.
 */
const EINSTUFUNG_TYPEN = [
  'auswahl',
  'bild_wort',
  'wortbank',
  'luecke',
  'satzbau',
  'frei',
  'formen',
  'harakat',
  'hoeren_waehlen',
  'hoeren_schreiben',
  'minimalpaare',
];
const ZIEL_WISSEN = { einheiten: 28, lektionen: 170, aussagen: 1400, belege: 2000, quizfragen: 1700 };
const ZIEL_KORAN = { einheiten: 10, lektionen: 60 };
const SPRACHEN = ['de', 'tr', 'ar'];
const RICHTUNGEN = ['tr-aus-de', 'ar-aus-de', 'de-aus-tr', 'ar-aus-tr', 'de-aus-ar', 'tr-aus-ar'];
const SPALTEN = ['einheiten', 'stationen', 'lemmata', 'saetze', 'dialoge', 'lesetexte', 'sprechen', 'schreiben'];
const SPALTEN_NAME = {
  einheiten: 'Einheiten',
  stationen: 'Stationen',
  lemmata: 'Lemmata',
  saetze: 'Sätze',
  dialoge: 'Dialoge + Geschichten',
  lesetexte: 'Lesetexte',
  sprechen: 'Sprechen',
  schreiben: 'Schreiben',
};

// ---------------------------------------------------------------- Argumente
const revs = [];
let aus = null;
let stufenArg = null;
const aufruf = () => {
  console.error('Aufruf: node _lernapp/werkzeuge/mengen.mjs [--rev <stand>]… [--aus <datei.md>] [--stufen a1,a2,b1|alle]');
  process.exit(1);
};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a === '--rev') revs.push(process.argv[++i]);
  else if (a === '--aus') aus = process.argv[++i];
  else if (a === '--stufen') stufenArg = process.argv[++i] ?? '';
  else aufruf();
}
/** Gewählte Stufen in der Reihenfolge von `STUFEN` */
const UMFANG = stufenArg === null ? STANDARD_STUFEN : stufenArg === 'alle' ? STUFEN : stufenArg.toLowerCase().split(',').map((x) => x.trim());
if (!UMFANG.length || UMFANG.some((st) => !STUFEN.includes(st))) aufruf();
UMFANG.sort((a, b) => STUFEN.indexOf(a) - STUFEN.indexOf(b));
const imUmfang = (st) => UMFANG.includes(st);
const STUFEN_NAME = UMFANG.length > 1 && STUFEN.indexOf(UMFANG.at(-1)) - STUFEN.indexOf(UMFANG[0]) === UMFANG.length - 1
  ? `${UMFANG[0].toUpperCase()}–${UMFANG.at(-1).toUpperCase()}`
  : UMFANG.map((st) => st.toUpperCase()).join(', ');
/** Anteil des Umfangs an A1–C1 nach Einheiten (für Ziele, die PLAN §5.1 nur für A1–C1 nennt) */
const summeZiel = (k, stufen) => stufen.reduce((n, st) => n + ZIEL[st][k], 0);
const ANTEIL = summeZiel('einheiten', UMFANG) / summeZiel('einheiten', STUFEN);
const anteilig = (ziel) => Math.round(ziel * ANTEIL);

// ---------------------------------------------------------------- Lesen (Arbeitsbaum oder Git-Stand)
const git = (...a) => execFileSync('git', ['-C', REPO, '-c', 'core.quotepath=off', ...a], { encoding: 'utf8', maxBuffer: 1 << 30 });

function quelle(rev) {
  if (rev) {
    const dateien = git('ls-tree', '-r', '--name-only', rev, '--', INHALT)
      .split('\n')
      .filter((d) => d.endsWith('.json'));
    return {
      name: rev,
      commit: git('rev-parse', '--short=12', `${rev}^{commit}`).trim(),
      datum: git('log', '-1', '--format=%cI', rev).trim(),
      dateien,
      lies: (d) => JSON.parse(git('show', `${rev}:${d}`)),
    };
  }
  const wurzel = join(REPO, INHALT);
  const alle = (o) => readdirSync(o).flatMap((n) => (statSync(join(o, n)).isDirectory() ? alle(join(o, n)) : [join(o, n)]));
  return {
    name: 'Arbeitsbaum',
    commit: git('rev-parse', '--short=12', 'HEAD').trim(),
    datum: git('log', '-1', '--format=%cI', 'HEAD').trim(),
    dateien: alle(wurzel)
      .filter((d) => d.endsWith('.json'))
      .map((d) => relative(REPO, d))
      .sort(),
    lies: (d) => JSON.parse(readFileSync(join(REPO, d), 'utf8')),
  };
}

// ---------------------------------------------------------------- Zählen
const leer = () => Object.fromEntries(SPALTEN.map((s) => [s, 0]));

/** Schlüssel der Lemmata und Sätze, auf die eine Aufgabe verweist: jede Zeichenkette der Aufgabe, die ein Eintrag des Kurses ist. */
function verweiseIn(wert, bekannt, menge = new Set()) {
  if (typeof wert === 'string') {
    if (bekannt.has(wert)) menge.add(wert);
  } else if (Array.isArray(wert)) for (const x of wert) verweiseIn(x, bekannt, menge);
  else if (wert && typeof wert === 'object') for (const x of Object.values(wert)) verweiseIn(x, bekannt, menge);
  return menge;
}

/** Freigegeben nach L3-E15: jeder Status außer `entwurf` (in den Dateien `automatisch_geprueft`). */
const frei = (status) => status !== 'entwurf';

function zaehle(q) {
  const jeStufe = (f) => Object.fromEntries(SPRACHEN.map((s) => [s, Object.fromEntries(STUFEN.map((st) => [st, f()]))]));
  /** alle Stufen (die Tabelle zeigt den Umfang, die übrigen stehen als offener Ausbau darunter) */
  const sprache = jeStufe(leer);
  /** nur Einheiten mit Status ≠ entwurf */
  const freigegeben = jeStufe(leer);
  // Aufgaben, Typen, Herkunft, Vorkurse und Übersetzungen nur im Umfang
  const aufgaben = Object.fromEntries(SPRACHEN.map((s) => [s, 0]));
  const typen = Object.fromEntries(SPRACHEN.map((s) => [s, {}]));
  /** Kandidaten der Einstufung je Zielsprache und Stufe (ohne Vorkurse) */
  const einstufung = jeStufe(() => 0);
  const status = {};
  const statusAusser = {};
  const herkunft = { saetze: {}, lemmata: {} };
  const vorkurse = [];
  /** Einheit → Kurs, Stufe, Status, Schlüssel ihrer Lemmata und Sätze (mit Religionsbezug), Aufgaben, Ausgang des Vorkurses */
  const einheiten = new Map();
  const richtung = Object.fromEntries(
    RICHTUNGEN.map((r) => [r, { dateien: 0, eintraege: 0, alternativen: 0, tipps: 0, saetze: 0, lemmata: 0, bezuege: new Set() }]),
  );
  const wissen = { einheiten: 0, lektionen: 0, aussagen: 0, belege: 0, quizfragen: 0, kinder: 0 };
  const koran = { einheiten: 0, lektionen: 0, wortformen: 0, aufgaben: 0 };
  const fehler = [];
  const art = (q2) => (q2 ?? '').split(':')[0] || 'ohne';

  for (const datei of q.dateien) {
    const teil = datei.slice(INHALT.length + 1).split('/');
    let d;
    try {
      d = q.lies(datei);
    } catch (e) {
      fehler.push(`${datei}: ${e.message}`);
      continue;
    }
    if (teil[0] === 'sprache' && d.format === 'igmg-lernapp-sprache') {
      const s = d.kurs;
      const st = d.stufe;
      const drin = imUmfang(st);
      const liste = drin ? status : statusAusser;
      liste[d.status] = (liste[d.status] ?? 0) + 1;
      einheiten.set(d.einheit.schluessel, {
        kurs: s,
        stufe: st,
        status: d.status,
        nurFuerAusgang: d.einheit.nurFuerAusgang ?? null,
        lemmata: new Set((d.lemmata ?? []).map((l) => l.schluessel)),
        saetze: new Set((d.saetze ?? []).map((x) => x.schluessel)),
        religion: new Set([...(d.lemmata ?? []), ...(d.saetze ?? [])].filter((x) => x.religionsbezug).map((x) => x.schluessel)),
        aufgaben: (d.lektionen ?? []).flatMap((l) => l.aufgaben ?? []),
      });
      const zahl = (d.lektionen ?? []).reduce((n, l) => n + (l.aufgaben?.length ?? 0), 0);
      if (d.einheit.nurFuerAusgang) {
        if (drin) {
          vorkurse.push({ kurs: s, ausgang: d.einheit.nurFuerAusgang, lektionen: d.lektionen.length, aufgaben: zahl });
          aufgaben[s] += zahl;
        }
        continue;
      }
      const z = sprache[s][st];
      z.einheiten++;
      z.stationen += d.lektionen.length;
      z.lemmata += d.lemmata?.length ?? 0;
      z.saetze += d.saetze?.length ?? 0;
      if (frei(d.status)) {
        const f = freigegeben[s][st];
        f.einheiten++;
        f.stationen += d.lektionen.length;
        f.lemmata += d.lemmata?.length ?? 0;
        f.saetze += d.saetze?.length ?? 0;
      }
      if (drin) {
        for (const x of d.saetze ?? []) herkunft.saetze[art(x.quelle)] = (herkunft.saetze[art(x.quelle)] ?? 0) + 1;
        for (const x of d.lemmata ?? []) herkunft.lemmata[art(x.quelle)] = (herkunft.lemmata[art(x.quelle)] ?? 0) + 1;
      }
      for (const l of d.lektionen) {
        if (l.art === 'sprechen') z.sprechen++;
        if (l.art === 'schreiben') z.schreiben++;
        for (const a of l.aufgaben ?? []) {
          if (drin) {
            aufgaben[s]++;
            typen[s][a.typ] = (typen[s][a.typ] ?? 0) + 1;
          }
          if (EINSTUFUNG_TYPEN.includes(a.typ)) einstufung[s][st]++;
          if (a.typ === 'dialog' || a.typ === 'geschichte') z.dialoge++;
          if (a.typ === 'lesen_fragen') z.lesetexte++;
          if (a.typ === 'sprechen' && l.art !== 'sprechen') z.sprechen++;
          if (a.typ === 'schreiben' && l.art !== 'schreiben') z.schreiben++;
        }
      }
    } else if (teil[0] === 'uebersetzung' && d.format === 'igmg-lernapp-uebersetzung') {
      const r = richtung[d.richtung];
      if (!r || !imUmfang(String(d.einheit).split('.')[1])) continue;
      r.dateien++;
      r.eintraege += d.eintraege.length;
      r.tipps += d.tipps?.length ?? 0;
      for (const e of d.eintraege) {
        r.alternativen += e.alternativen?.length ?? 0;
        r.bezuege.add(e.bezug);
      }
    } else if (teil[0] === 'islam' && d.format?.includes('islam')) {
      wissen.einheiten++;
      for (const l of d.lektionen ?? []) {
        wissen.lektionen++;
        if (l.kinderGeeignet) wissen.kinder++;
        wissen.aussagen += l.aussagen?.length ?? 0;
        wissen.belege += (l.aussagen ?? []).reduce((n, a) => n + (a.belege?.length ?? 0), 0);
        wissen.quizfragen += l.aufgaben?.length ?? 0;
      }
    } else if (teil[0] === 'koran' && d.kurs === 'koran') {
      for (const e of d.einheiten ?? []) {
        koran.einheiten++;
        for (const l of e.lektionen ?? []) {
          koran.lektionen++;
          koran.wortformen += l.wortformen?.length ?? 0;
          koran.aufgaben += l.aufgaben?.length ?? 0;
        }
      }
    }
  }

  // Verwiesen und live: Lemmata und Sätze, auf die eine Aufgabe verweist (Vorrat ohne Aufgabe erreicht kein Gerät, der
  // Paketbau übernimmt nur verwiesene Einträge); live = Verweis aus einer freigegebenen Einheit auf einen Eintrag einer
  // freigegebenen Einheit ohne Kennzeichen `religionsbezug` (der braucht zwei Freigaben in der Datenbank)
  const eintragVon = new Map();
  const bekannt = Object.fromEntries(SPRACHEN.map((s) => [s, new Set()]));
  for (const e of einheiten.values())
    for (const k of [...e.lemmata, ...e.saetze]) {
      eintragVon.set(k, e);
      bekannt[e.kurs]?.add(k);
    }
  const verwiesen = new Set();
  const live = new Set();
  for (const e of einheiten.values())
    for (const a of e.aufgaben)
      for (const k of verweiseIn(a, bekannt[e.kurs] ?? new Set())) {
        verwiesen.add(k);
        const ziel = eintragVon.get(k);
        if (frei(e.status) && frei(ziel.status) && !ziel.religion.has(k)) live.add(k);
      }
  const nutzung = Object.fromEntries(
    SPRACHEN.map((s) => [s, { saetze: 0, saetzeVerwiesen: 0, saetzeLive: 0, lemmata: 0, lemmataVerwiesen: 0, lemmataLive: 0 }]),
  );
  for (const e of einheiten.values()) {
    if (e.nurFuerAusgang || !imUmfang(e.stufe) || !nutzung[e.kurs]) continue;
    const n = nutzung[e.kurs];
    for (const [art2, keys] of [
      ['saetze', e.saetze],
      ['lemmata', e.lemmata],
    ])
      for (const k of keys) {
        n[art2]++;
        if (verwiesen.has(k)) n[`${art2}Verwiesen`]++;
        if (live.has(k)) n[`${art2}Live`]++;
      }
  }

  // Abdeckung je Richtung: Anteil der Zielsätze und Lemmata (Hauptkurs und Vorkurs dieser Ausgangssprache) mit Übersetzung
  const abdeckung = {};
  for (const [name, r] of Object.entries(richtung)) {
    const [ziel, , ausgang] = name.split('-');
    let saetze = 0;
    let lemmata = 0;
    let saetzeUe = 0;
    let lemmataUe = 0;
    for (const e of einheiten.values()) {
      if (e.kurs !== ziel || !imUmfang(e.stufe) || (e.nurFuerAusgang && e.nurFuerAusgang !== ausgang)) continue;
      saetze += e.saetze.size;
      lemmata += e.lemmata.size;
      for (const k of e.saetze) if (r.bezuege.has(k)) saetzeUe++;
      for (const k of e.lemmata) if (r.bezuege.has(k)) lemmataUe++;
    }
    abdeckung[name] = { saetze, saetzeUe, lemmata, lemmataUe };
  }
  return {
    sprache,
    freigegeben,
    nutzung,
    aufgaben,
    typen,
    einstufung,
    status,
    statusAusser,
    herkunft,
    vorkurse,
    richtung,
    abdeckung,
    wissen,
    koran,
    fehler,
  };
}

// ---------------------------------------------------------------- Bericht
const zahl = (n) => n.toLocaleString('de-DE');
const anteil = (a, b) => (b ? `${((100 * a) / b).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %` : '–');
const bewertung = (ist, ziel) => (ziel === 0 ? '–' : ist >= 0.95 * ziel ? 'erfüllt' : 'offen');

function bericht(q, m) {
  const z = [];
  z.push(`## Stand: ${q.name} (Commit \`${q.commit}\`, ${q.datum})`, '');
  z.push(`Gelesen: ${zahl(q.dateien.length)} JSON-Dateien unter \`${INHALT}/\`.${m.fehler.length ? ` Nicht lesbar: ${m.fehler.length}.` : ''}`, '');
  const liste = (o) => {
    const e = Object.entries(o).sort();
    return e.length ? e.map(([s, n]) => `${s} ${zahl(n)}`).join(', ') : 'keine';
  };
  const standard = UMFANG.join() === STANDARD_STUFEN.join();
  z.push(
    `Umfang: ${STUFEN_NAME}${standard ? ' (Standard nach L3-E16 „Bis B1 reicht erstmal“; B2/C1 offener Ausbau, nicht bewertet)' : ''}. ` +
      (ANTEIL < 1
        ? `Ziele: Summe dieser Stufen aus PLAN §5.1; Aufgaben, Einstufungsbank und Tipp-Karten anteilig nach Einheiten (${zahl(summeZiel('einheiten', UMFANG))} von ${zahl(summeZiel('einheiten', STUFEN))}).`
        : 'Ziele aus PLAN §5.1 (A1–C1).'),
    '',
  );
  z.push(`Status der Spracheinheiten im Umfang: ${liste(m.status)}; außerhalb: ${liste(m.statusAusser)}.`, '');

  z.push('### Sprachkurse je Zielsprache und Stufe (Ist / Ziel PLAN §5.1)', '');
  z.push(`| Ziel | Stufe | ${SPALTEN.map((s) => SPALTEN_NAME[s]).join(' | ')} |`);
  z.push(`|---|---|${SPALTEN.map(() => '---:').join('|')}|`);
  for (const s of SPRACHEN) {
    const summe = leer();
    for (const st of UMFANG) {
      const ist = m.sprache[s][st];
      for (const k of SPALTEN) summe[k] += ist[k];
      z.push(`| ${s} | ${st.toUpperCase()} | ${SPALTEN.map((k) => `${zahl(ist[k])} / ${zahl(ZIEL[st][k])}`).join(' | ')} |`);
    }
    z.push(`| **${s}** | **Σ** | ${SPALTEN.map((k) => `**${zahl(summe[k])} / ${zahl(summeZiel(k, UMFANG))}**`).join(' | ')} |`);
  }
  z.push('');
  const ausser = SPRACHEN.flatMap((s) =>
    STUFEN.filter((st) => !imUmfang(st) && m.sprache[s][st].einheiten > 0).map((st) => {
      const x = m.sprache[s][st];
      return `${s} ${st.toUpperCase()} ${zahl(x.einheiten)} Einheiten (davon freigegeben ${zahl(m.freigegeben[s][st].einheiten)}), ${zahl(x.lemmata)} Lemmata, ${zahl(x.saetze)} Sätze`;
    }),
  );
  if (UMFANG.length < STUFEN.length)
    z.push(`Außerhalb des Umfangs (offener Ausbau, nicht bewertet): ${ausser.length ? ausser.join('; ') : 'keine Einheiten'}.`, '');
  z.push('Zählweise: Einheiten und Stationen ohne Schrift-Vorkurse (`nurFuerAusgang`); Stationen = Lektionen aller Arten;');
  z.push('Dialoge + Geschichten = Aufgaben `dialog` (je eine kurze Wechselrede) und `geschichte`; Lesetexte = Aufgaben');
  z.push('`lesen_fragen`; Sprechen und Schreiben = Lektionen dieser Art bzw. Aufgaben `sprechen`/`schreiben` in anderen Lektionen.');
  z.push('Die Abnahme Z-L01 bewertet Einheiten, Stationen, Lemmata, Sätze (je Zielsprache), die Übersetzungen je Richtung, die');
  z.push('Schrift-Vorkurse und die Einstufungsbank; die Tipp-Karten je Ausgangssprache stehen zum Vergleich mit PLAN §5.1 dabei.', '');

  const zielAufgaben = anteilig(ZIEL_AUFGABEN_JE_SPRACHE);
  z.push(`### Bewertung Z-L01 je Zielsprache (Σ ${STUFEN_NAME}, erfüllt ab Ziel − 5 %)`, '');
  z.push(`| Ziel | Einheiten | Stationen | Lemmata | Sätze | Aufgaben (Ziel ≈ ${zahl(zielAufgaben)}${ANTEIL < 1 ? ', anteilig' : ''}) |`);
  z.push('|---|---|---|---|---|---|');
  const summeIn = (je, s, k) => UMFANG.reduce((n, st) => n + je[s][st][k], 0);
  for (const s of SPRACHEN) {
    const zelle = (k) => `${zahl(summeIn(m.sprache, s, k))} (${anteil(summeIn(m.sprache, s, k), summeZiel(k, UMFANG))}) – ${bewertung(summeIn(m.sprache, s, k), summeZiel(k, UMFANG))}`;
    z.push(
      `| ${s} | ${zelle('einheiten')} | ${zelle('stationen')} | ${zelle('lemmata')} | ${zelle('saetze')} | ${zahl(m.aufgaben[s])} (${anteil(m.aufgaben[s], zielAufgaben)}) – ${bewertung(m.aufgaben[s], zielAufgaben)} |`,
    );
  }
  z.push('');

  z.push(`### Freigegeben, in Aufgaben verwiesen und live (Σ ${STUFEN_NAME})`, '');
  z.push('| Ziel | Einheiten frei | Stationen frei | Lemmata frei | Sätze frei | Sätze in Aufgaben verwiesen | Sätze live | Lemmata in Aufgaben verwiesen | Lemmata live |');
  z.push('|---|---|---|---|---|---:|---:|---:|---:|');
  for (const s of SPRACHEN) {
    const zelle = (k) => `${zahl(summeIn(m.freigegeben, s, k))} (${anteil(summeIn(m.freigegeben, s, k), summeZiel(k, UMFANG))}) – ${bewertung(summeIn(m.freigegeben, s, k), summeZiel(k, UMFANG))}`;
    const n = m.nutzung[s];
    z.push(
      `| ${s} | ${zelle('einheiten')} | ${zelle('stationen')} | ${zelle('lemmata')} | ${zelle('saetze')} | ${zahl(n.saetzeVerwiesen)} / ${zahl(n.saetze)} (${anteil(n.saetzeVerwiesen, n.saetze)}) | ${zahl(n.saetzeLive)} (${anteil(n.saetzeLive, summeZiel('saetze', UMFANG))} des Ziels) | ${zahl(n.lemmataVerwiesen)} / ${zahl(n.lemmata)} (${anteil(n.lemmataVerwiesen, n.lemmata)}) | ${zahl(n.lemmataLive)} (${anteil(n.lemmataLive, summeZiel('lemmata', UMFANG))} des Ziels) |`,
    );
  }
  z.push('');
  z.push('Freigegeben = Einheiten mit Status ≠ `entwurf` (L3-E15: `automatisch_geprueft`, live mit Hinweis), Prozent vom Ziel.');
  z.push('In Aufgaben verwiesen = Lemmata und Sätze des Umfangs, auf die irgendeine Aufgabe verweist; der übrige Korpus ist Vorrat');
  z.push('(Handbuch §5) und erreicht kein Gerät, denn der Paketbau übernimmt nur verwiesene Einträge. Live = verwiesen von einer');
  z.push('freigegebenen Einheit, selbst in einer freigegebenen Einheit und ohne Kennzeichen `religionsbezug` (der braucht zwei');
  z.push('Freigaben in der Datenbank); eine Obergrenze, denn Formel-Kandidaten und Sichtbarkeit je Richtung zählt der Bericht nicht.', '');

  z.push(`### Übersetzungen je Richtung (${STUFEN_NAME})`, '');
  z.push('| Richtung | Dateien | Einträge | Alternativen | Tipps | Zielsätze übersetzt | Lemmata übersetzt |');
  z.push('|---|---:|---:|---:|---:|---|---|');
  for (const r of RICHTUNGEN) {
    const x = m.richtung[r];
    const a = m.abdeckung[r];
    z.push(
      `| ${r} | ${zahl(x.dateien)} | ${zahl(x.eintraege)} | ${zahl(x.alternativen)} | ${zahl(x.tipps)} | ${zahl(a.saetzeUe)} / ${zahl(a.saetze)} (${anteil(a.saetzeUe, a.saetze)}) | ${zahl(a.lemmataUe)} / ${zahl(a.lemmata)} (${anteil(a.lemmataUe, a.lemmata)}) |`,
    );
  }
  z.push('', 'Ziel (PLAN §5.1, Z-L01): je Richtung Übersetzungen für 100 % der Zielsätze; ≈ 3 Alternativen je Satz; Tipps unten.', '');

  z.push('### Einstufungsbank und Tipp-Karten (Z-L01, PLAN §5.1)', '');
  const zielEinstufung = anteilig(ZIEL_EINSTUFUNG_JE_SPRACHE);
  z.push(`| Ziel | ${UMFANG.map((st) => st.toUpperCase()).join(' | ')} | Σ (Ziel ≈ ${zahl(zielEinstufung)}${ANTEIL < 1 ? ', anteilig' : ''}) | vorhanden |`);
  z.push(`|---|${UMFANG.map(() => '---:').join('|')}|---|---|`);
  for (const s of SPRACHEN) {
    const je = m.einstufung[s];
    const summe = UMFANG.reduce((n, st) => n + je[st], 0);
    // „vorhanden“: jede Stufe mit Einheiten bietet mindestens zwei Kandidaten (EINSTUFUNG_MINDESTENS)
    const mitEinheiten = UMFANG.filter((st) => m.sprache[s][st].einheiten > 0);
    const vorhanden = mitEinheiten.length > 0 && mitEinheiten.every((st) => je[st] >= 2);
    z.push(
      `| ${s} | ${UMFANG.map((st) => zahl(je[st])).join(' | ')} | ${zahl(summe)} (${anteil(summe, zielEinstufung)}) – ${bewertung(summe, zielEinstufung)} | ${vorhanden ? 'ja' : 'nein'} |`,
    );
  }
  z.push('');
  z.push('Einstufungsbank = Aufgaben der Typen aus `EINSTUFUNG_TYPEN` in den Lektionen der Einheiten (ohne Vorkurse), aus denen');
  z.push('der Einstufungstest auf dem Gerät wählt; Hörtypen zählen hier ohne Prüfung des Audios. „vorhanden“: jede Stufe mit');
  z.push('Einheiten bietet mindestens zwei Kandidaten.', '');
  const zielTipps = anteilig(ZIEL_TIPPS_JE_RICHTUNG);
  z.push(`| Richtung | Tipp-Karten (Ziel ≈ ${zahl(zielTipps)} je Ausgangssprache${ANTEIL < 1 ? ', anteilig' : ''}) |`, '|---|---|');
  for (const r of RICHTUNGEN) {
    const n = m.richtung[r].tipps;
    z.push(`| ${r} | ${zahl(n)} (${anteil(n, zielTipps)}) – ${bewertung(n, zielTipps)} |`);
  }
  z.push('', 'Tipp-Karten = Tipps der Übersetzungsdateien je Richtung (kontrastiv, in der Ausgangssprache; Seite „Tipps“ je Einheit).', '');

  z.push('### Schrift-Vorkurse', '');
  if (m.vorkurse.length) {
    z.push('| Ziel | für Ausgang | Lektionen | Aufgaben |', '|---|---|---:|---:|');
    for (const v of m.vorkurse.sort((a, b) => `${a.kurs}${a.ausgang}`.localeCompare(`${b.kurs}${b.ausgang}`)))
      z.push(`| ${v.kurs} | ${v.ausgang} | ${zahl(v.lektionen)} | ${zahl(v.aufgaben)} |`);
  } else z.push('Keine.');
  z.push('', 'Ziel (PLAN §5.1): 8 Lektionen Arabisch-Schrift, 6 Latein, 2 Türkisch.', '');

  z.push(`### Aufgaben je Typ (Sprachkurse ${STUFEN_NAME} ohne Vorkurse; die Summe oben zählt die Vorkurse mit)`, '');
  const alleTypen = [...new Set(SPRACHEN.flatMap((s) => Object.keys(m.typen[s])))].sort();
  if (alleTypen.length) {
    z.push(`| Typ | ${SPRACHEN.join(' | ')} |`, `|---|${SPRACHEN.map(() => '---:').join('|')}|`);
    for (const t of alleTypen) z.push(`| \`${t}\` | ${SPRACHEN.map((s) => zahl(m.typen[s][t] ?? 0)).join(' | ')} |`);
  } else z.push('Keine.');
  z.push('');

  z.push(`### Herkunft (Sprachkurse ${STUFEN_NAME} ohne Vorkurse)`, '');
  const herkunft = (o) => (Object.keys(o).length ? Object.entries(o).sort().map(([k, n]) => `\`${k}\` ${zahl(n)}`).join(', ') : 'keine');
  z.push(`- Sätze: ${herkunft(m.herkunft.saetze)}`, `- Lemmata: ${herkunft(m.herkunft.lemmata)}`, '');

  z.push('### Wissenskurs und Koran-Arabisch', '');
  z.push('| Kurs | Ist | Ziel (PLAN §5.2/§5.3) |', '|---|---|---|');
  z.push(
    `| Wissen | ${zahl(m.wissen.einheiten)} Einheiten, ${zahl(m.wissen.lektionen)} Lektionen (davon ${zahl(m.wissen.kinder)} für Kinder geeignet), ${zahl(m.wissen.aussagen)} Aussagen, ${zahl(m.wissen.belege)} Belege, ${zahl(m.wissen.quizfragen)} Quizfragen | ${ZIEL_WISSEN.einheiten} Einheiten, ≈ ${ZIEL_WISSEN.lektionen} Lektionen, ≈ ${zahl(ZIEL_WISSEN.aussagen)} Aussagen, ≈ ${zahl(ZIEL_WISSEN.belege)} Belege, ≈ ${zahl(ZIEL_WISSEN.quizfragen)} Quizfragen |`,
  );
  z.push(
    `| Koran-Arabisch | ${zahl(m.koran.einheiten)} Einheiten, ${zahl(m.koran.lektionen)} Lektionen, ${zahl(m.koran.wortformen)} Wortformen-Verweise, ${zahl(m.koran.aufgaben)} Aufgaben | ≈ ${ZIEL_KORAN.einheiten} Einheiten, ≈ ${ZIEL_KORAN.lektionen} Lektionen, 500–1.000 Wortformen |`,
  );
  z.push('', 'Sichtbarkeit (zwei Freigaben, Z-L02/Z-L03) zählt dieser Bericht nicht; sie steht in der Datenbank (Verwaltung → Lern-App).', '');
  return z.join('\n');
}

// ---------------------------------------------------------------- Ausgabe
const staende = revs.length ? revs : [null];
const teile = [
  '# Mengenbericht Lern-App',
  '',
  'Erzeugt mit `node _lernapp/werkzeuge/mengen.mjs' +
    revs.map((r) => ` --rev ${r}`).join('') +
    (stufenArg !== null ? ` --stufen ${stufenArg}` : '') +
    (aus ? ` --aus ${aus}` : '') +
    '` (L8-03, Stufenauswahl N7).',
  'Liest nur `web/inhalte/lernapp/**` des jeweiligen Stands (ohne Datenbank, ohne Netz); gleicher Stand → gleicher Bericht.',
  'Ziele: `_lernapp/PLAN.md` §5.1–§5.3; Abnahme `_lernapp/ABNAHME.md` Z-L01 (erfüllt ab Ziel − 5 %), Z-L02, Z-L03.',
  '',
];
for (const rev of staende) {
  const q = quelle(rev);
  teile.push(bericht(q, zaehle(q)));
}
const text = `${teile.join('\n').trimEnd()}\n`;
if (aus) writeFileSync(resolve(REPO, aus), text);
else process.stdout.write(text);
