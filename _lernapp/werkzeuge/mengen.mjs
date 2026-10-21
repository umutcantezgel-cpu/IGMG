#!/usr/bin/env node
/**
 * Mengenbericht der Lern-App (L8-03, ABNAHME Z-L01/Z-L02/Z-L03, PLAN §5): zählt Einheiten, Stationen, Lemmata, Sätze,
 * Aufgaben und Übersetzungen je Kurs aus `web/inhalte/lernapp/**` und stellt sie den Zielen aus PLAN §5.1 gegenüber
 * (erfüllt, wenn Ist ≥ Ziel − 5 %). Reproduzierbar: liest nur Dateien (Arbeitsbaum) oder einen Git-Stand (`--rev`), ohne
 * Datenbank, ohne Netz, ohne Zeitstempel des Laufs; gleicher Stand → gleicher Bericht.
 *
 * Aufruf (im Repository):
 *   node _lernapp/werkzeuge/mengen.mjs                         Arbeitsbaum, Bericht auf stdout
 *   node _lernapp/werkzeuge/mengen.mjs --rev <commit|zweig>    Git-Stand (z. B. einen Inhaltszweig), Bericht auf stdout
 *   node _lernapp/werkzeuge/mengen.mjs --rev a --rev b --aus _lernapp/berichte/mengen.md   mehrere Stände in eine Datei
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
const ZIEL = {
  a1: { einheiten: 12, stationen: 96, lemmata: 600, saetze: 2400, dialoge: 24, lesetexte: 6, sprechen: 24, schreiben: 0 },
  a2: { einheiten: 14, stationen: 112, lemmata: 900, saetze: 3600, dialoge: 28, lesetexte: 14, sprechen: 28, schreiben: 14 },
  b1: { einheiten: 16, stationen: 128, lemmata: 1300, saetze: 5200, dialoge: 32, lesetexte: 32, sprechen: 32, schreiben: 16 },
  b2: { einheiten: 16, stationen: 128, lemmata: 1700, saetze: 6800, dialoge: 32, lesetexte: 48, sprechen: 32, schreiben: 32 },
  c1: { einheiten: 14, stationen: 112, lemmata: 2000, saetze: 8000, dialoge: 28, lesetexte: 56, sprechen: 28, schreiben: 28 },
};
const ZIEL_AUFGABEN_JE_SPRACHE = 8000;
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
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a === '--rev') revs.push(process.argv[++i]);
  else if (a === '--aus') aus = process.argv[++i];
  else {
    console.error('Aufruf: node _lernapp/werkzeuge/mengen.mjs [--rev <stand>]… [--aus <datei.md>]');
    process.exit(1);
  }
}

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

function zaehle(q) {
  const sprache = Object.fromEntries(SPRACHEN.map((s) => [s, Object.fromEntries(STUFEN.map((st) => [st, leer()]))]));
  const aufgaben = Object.fromEntries(SPRACHEN.map((s) => [s, 0]));
  const typen = Object.fromEntries(SPRACHEN.map((s) => [s, {}]));
  const status = {};
  const herkunft = { saetze: {}, lemmata: {} };
  const vorkurse = [];
  /** Einheit → Schlüssel ihrer Lemmata und Sätze, Ausgang des Vorkurses */
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
      status[d.status] = (status[d.status] ?? 0) + 1;
      einheiten.set(d.einheit.schluessel, {
        kurs: s,
        nurFuerAusgang: d.einheit.nurFuerAusgang ?? null,
        lemmata: new Set((d.lemmata ?? []).map((l) => l.schluessel)),
        saetze: new Set((d.saetze ?? []).map((x) => x.schluessel)),
      });
      const zahl = (d.lektionen ?? []).reduce((n, l) => n + (l.aufgaben?.length ?? 0), 0);
      if (d.einheit.nurFuerAusgang) {
        vorkurse.push({ kurs: s, ausgang: d.einheit.nurFuerAusgang, lektionen: d.lektionen.length, aufgaben: zahl });
        aufgaben[s] += zahl;
        continue;
      }
      const z = sprache[s][st];
      z.einheiten++;
      z.stationen += d.lektionen.length;
      z.lemmata += d.lemmata?.length ?? 0;
      z.saetze += d.saetze?.length ?? 0;
      for (const x of d.saetze ?? []) herkunft.saetze[art(x.quelle)] = (herkunft.saetze[art(x.quelle)] ?? 0) + 1;
      for (const x of d.lemmata ?? []) herkunft.lemmata[art(x.quelle)] = (herkunft.lemmata[art(x.quelle)] ?? 0) + 1;
      for (const l of d.lektionen) {
        if (l.art === 'sprechen') z.sprechen++;
        if (l.art === 'schreiben') z.schreiben++;
        for (const a of l.aufgaben ?? []) {
          aufgaben[s]++;
          typen[s][a.typ] = (typen[s][a.typ] ?? 0) + 1;
          if (a.typ === 'dialog' || a.typ === 'geschichte') z.dialoge++;
          if (a.typ === 'lesen_fragen') z.lesetexte++;
          if (a.typ === 'sprechen' && l.art !== 'sprechen') z.sprechen++;
          if (a.typ === 'schreiben' && l.art !== 'schreiben') z.schreiben++;
        }
      }
    } else if (teil[0] === 'uebersetzung' && d.format === 'igmg-lernapp-uebersetzung') {
      const r = richtung[d.richtung];
      if (!r) continue;
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

  // Abdeckung je Richtung: Anteil der Zielsätze und Lemmata (Hauptkurs und Vorkurs dieser Ausgangssprache) mit Übersetzung
  const abdeckung = {};
  for (const [name, r] of Object.entries(richtung)) {
    const [ziel, , ausgang] = name.split('-');
    let saetze = 0;
    let lemmata = 0;
    let saetzeUe = 0;
    let lemmataUe = 0;
    for (const e of einheiten.values()) {
      if (e.kurs !== ziel || (e.nurFuerAusgang && e.nurFuerAusgang !== ausgang)) continue;
      saetze += e.saetze.size;
      lemmata += e.lemmata.size;
      for (const k of e.saetze) if (r.bezuege.has(k)) saetzeUe++;
      for (const k of e.lemmata) if (r.bezuege.has(k)) lemmataUe++;
    }
    abdeckung[name] = { saetze, saetzeUe, lemmata, lemmataUe };
  }
  return { sprache, aufgaben, typen, status, herkunft, vorkurse, richtung, abdeckung, wissen, koran, fehler };
}

// ---------------------------------------------------------------- Bericht
const zahl = (n) => n.toLocaleString('de-DE');
const anteil = (a, b) => (b ? `${((100 * a) / b).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %` : '–');
const bewertung = (ist, ziel) => (ziel === 0 ? '–' : ist >= 0.95 * ziel ? 'erfüllt' : 'offen');

function bericht(q, m) {
  const z = [];
  z.push(`## Stand: ${q.name} (Commit \`${q.commit}\`, ${q.datum})`, '');
  z.push(`Gelesen: ${zahl(q.dateien.length)} JSON-Dateien unter \`${INHALT}/\`.${m.fehler.length ? ` Nicht lesbar: ${m.fehler.length}.` : ''}`, '');
  const status = Object.entries(m.status).sort();
  z.push(`Status der Spracheinheiten: ${status.length ? status.map(([s, n]) => `${s} ${zahl(n)}`).join(', ') : 'keine'}.`, '');

  z.push('### Sprachkurse je Zielsprache und Stufe (Ist / Ziel PLAN §5.1)', '');
  z.push(`| Ziel | Stufe | ${SPALTEN.map((s) => SPALTEN_NAME[s]).join(' | ')} |`);
  z.push(`|---|---|${SPALTEN.map(() => '---:').join('|')}|`);
  for (const s of SPRACHEN) {
    const summe = leer();
    for (const st of STUFEN) {
      const ist = m.sprache[s][st];
      for (const k of SPALTEN) summe[k] += ist[k];
      z.push(`| ${s} | ${st.toUpperCase()} | ${SPALTEN.map((k) => `${zahl(ist[k])} / ${zahl(ZIEL[st][k])}`).join(' | ')} |`);
    }
    const zielSumme = Object.fromEntries(SPALTEN.map((k) => [k, STUFEN.reduce((n, st) => n + ZIEL[st][k], 0)]));
    z.push(`| **${s}** | **Σ** | ${SPALTEN.map((k) => `**${zahl(summe[k])} / ${zahl(zielSumme[k])}**`).join(' | ')} |`);
  }
  z.push('');
  z.push('Zählweise: Einheiten und Stationen ohne Schrift-Vorkurse (`nurFuerAusgang`); Stationen = Lektionen aller Arten;');
  z.push('Dialoge + Geschichten = Aufgaben `dialog` (je eine kurze Wechselrede) und `geschichte`; Lesetexte = Aufgaben');
  z.push('`lesen_fragen`; Sprechen und Schreiben = Lektionen dieser Art bzw. Aufgaben `sprechen`/`schreiben` in anderen Lektionen.');
  z.push('Die Abnahme Z-L01 bewertet nur Einheiten, Stationen, Lemmata, Sätze (je Zielsprache) und die Übersetzungen je Richtung.', '');

  z.push('### Bewertung Z-L01 je Zielsprache (Σ A1–C1, erfüllt ab Ziel − 5 %)', '');
  z.push('| Ziel | Einheiten | Stationen | Lemmata | Sätze | Aufgaben (Ziel ≈ 8.000) |');
  z.push('|---|---|---|---|---|---|');
  for (const s of SPRACHEN) {
    const summe = (k) => STUFEN.reduce((n, st) => n + m.sprache[s][st][k], 0);
    const ziel = (k) => STUFEN.reduce((n, st) => n + ZIEL[st][k], 0);
    const zelle = (k) => `${zahl(summe(k))} (${anteil(summe(k), ziel(k))}) – ${bewertung(summe(k), ziel(k))}`;
    z.push(
      `| ${s} | ${zelle('einheiten')} | ${zelle('stationen')} | ${zelle('lemmata')} | ${zelle('saetze')} | ${zahl(m.aufgaben[s])} (${anteil(m.aufgaben[s], ZIEL_AUFGABEN_JE_SPRACHE)}) – ${bewertung(m.aufgaben[s], ZIEL_AUFGABEN_JE_SPRACHE)} |`,
    );
  }
  z.push('');

  z.push('### Übersetzungen je Richtung', '');
  z.push('| Richtung | Dateien | Einträge | Alternativen | Tipps | Zielsätze übersetzt | Lemmata übersetzt |');
  z.push('|---|---:|---:|---:|---:|---|---|');
  for (const r of RICHTUNGEN) {
    const x = m.richtung[r];
    const a = m.abdeckung[r];
    z.push(
      `| ${r} | ${zahl(x.dateien)} | ${zahl(x.eintraege)} | ${zahl(x.alternativen)} | ${zahl(x.tipps)} | ${zahl(a.saetzeUe)} / ${zahl(a.saetze)} (${anteil(a.saetzeUe, a.saetze)}) | ${zahl(a.lemmataUe)} / ${zahl(a.lemmata)} (${anteil(a.lemmataUe, a.lemmata)}) |`,
    );
  }
  z.push('', 'Ziel (PLAN §5.1, Z-L01): je Richtung Übersetzungen für 100 % der Zielsätze; ≈ 3 Alternativen je Satz; ≈ 300 Tipps.', '');

  z.push('### Schrift-Vorkurse', '');
  if (m.vorkurse.length) {
    z.push('| Ziel | für Ausgang | Lektionen | Aufgaben |', '|---|---|---:|---:|');
    for (const v of m.vorkurse.sort((a, b) => `${a.kurs}${a.ausgang}`.localeCompare(`${b.kurs}${b.ausgang}`)))
      z.push(`| ${v.kurs} | ${v.ausgang} | ${zahl(v.lektionen)} | ${zahl(v.aufgaben)} |`);
  } else z.push('Keine.');
  z.push('', 'Ziel (PLAN §5.1): 8 Lektionen Arabisch-Schrift, 6 Latein, 2 Türkisch.', '');

  z.push('### Aufgaben je Typ (Sprachkurse, mit Vorkursen in der Summe oben)', '');
  const alleTypen = [...new Set(SPRACHEN.flatMap((s) => Object.keys(m.typen[s])))].sort();
  if (alleTypen.length) {
    z.push(`| Typ | ${SPRACHEN.join(' | ')} |`, `|---|${SPRACHEN.map(() => '---:').join('|')}|`);
    for (const t of alleTypen) z.push(`| \`${t}\` | ${SPRACHEN.map((s) => zahl(m.typen[s][t] ?? 0)).join(' | ')} |`);
  } else z.push('Keine.');
  z.push('');

  z.push('### Herkunft (Sprachkurse ohne Vorkurse)', '');
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
  'Erzeugt mit `node _lernapp/werkzeuge/mengen.mjs' + revs.map((r) => ` --rev ${r}`).join('') + (aus ? ` --aus ${aus}` : '') + '` (L8-03).',
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
