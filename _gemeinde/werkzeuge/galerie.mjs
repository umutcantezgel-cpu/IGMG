// Galerie (AUFTRAG Abschluss): eigenständige Vorher-Nachher-Seite `_gemeinde/bilder/galerie.html`.
// Je Hauptansicht und Gerät zwei Spalten (vorher E0 · nachher Abschluss), Bildschirm für Bildschirm; dazu optionale
// Zusatzstreifen (große Momente, Seitenwechsel) aus dem Abschlussordner. Ohne Skript, ohne fremde Quellen, Bilder lazy.
// Aufruf: node galerie.mjs [--vorher bilder/e0] [--nachher bilder/abschluss] [--aus bilder/galerie.html]
//         [--routen werkzeuge/routen-hauptansichten.json] [--titel "…"]
// Pfade relativ zu _gemeinde; die Seite verweist relativ auf die Bilder (liegt im selben Ordner `bilder/`).
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const WERKSTATT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { values: a } = parseArgs({
  options: {
    vorher: { type: 'string', default: 'bilder/e0' },
    nachher: { type: 'string', default: 'bilder/abschluss' },
    aus: { type: 'string', default: 'bilder/galerie.html' },
    routen: { type: 'string', default: 'werkzeuge/routen-hauptansichten.json' },
    titel: { type: 'string', default: 'IGMG Wetzlar · Vorher und nachher' },
  },
});
const abs = (p) => (p.startsWith('/') ? p : join(WERKSTATT, p));
const AUS = abs(a.aus);
const rel = (p) => relative(dirname(AUS), p).split('/').map(encodeURIComponent).join('/');
const GERAETE = [
  ['390x844', 'Telefon 390'],
  ['768x1024', 'Tablet 768'],
  ['1440x900', 'Desktop 1440'],
];
const ordnerName = (pfad) => pfad.replace(/^\/+|\/+$/g, '').replace(/\//g, '_') || 'start';
const bilderIn = (ordner) =>
  existsSync(ordner) ? readdirSync(ordner).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort() : [];
const esc = (s) => String(s).replace(/[&<>"]/g, (z) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[z]);

const routen = JSON.parse(readFileSync(abs(a.routen), 'utf8'));
let fehlend = 0;
const abschnitte = routen.map((r, i) => {
  const name = ordnerName(r.pfad);
  const geraete = GERAETE.map(([g, label], j) => {
    const v = bilderIn(join(abs(a.vorher), name, g));
    const n = bilderIn(join(abs(a.nachher), name, g));
    if (!n.length) fehlend++;
    const zeilen = Math.max(v.length, n.length);
    const zellen = Array.from({ length: zeilen }, (_, k) => {
      const zelle = (ordner, liste) =>
        liste[k]
          ? `<img loading="lazy" decoding="async" src="${rel(join(abs(ordner), name, g, liste[k]))}" alt="${esc(r.name)}, ${label}, Bildschirm ${k + 1}">`
          : '<div class="leer">–</div>';
      return `<div class="paar">${zelle(a.vorher, v)}${zelle(a.nachher, n)}</div>`;
    }).join('');
    const id = `r${i}g${j}`;
    return `<input type="radio" name="r${i}" id="${id}" ${j === 0 ? 'checked' : ''}><label for="${id}">${label}</label>
      <div class="geraet g-${g}"><div class="kopfzeile"><span>Vorher (E0)</span><span>Nachher (Abschluss)</span></div>${zellen}</div>`;
  }).join('');
  return `<section id="${esc(name)}"><h2>${esc(r.name)} <code>${esc(r.pfad)}</code></h2><div class="reiter">${geraete}</div></section>`;
});

// Zusatzstreifen: jeder Unterordner von <nachher>/momente bzw. /seitenwechsel als Bildreihe
const streifen = ['momente', 'seitenwechsel', 'verwaltung']
  .map((art) => {
    const basis = join(abs(a.nachher), art);
    if (!existsSync(basis)) return '';
    const reihen = readdirSync(basis)
      .filter((d) => statSync(join(basis, d)).isDirectory())
      .sort()
      .map((d) => {
        const b = bilderIn(join(basis, d));
        return b.length
          ? `<figure class="reihe"><figcaption>${esc(d)}</figcaption><div class="band">${b
              .map((f) => `<img loading="lazy" decoding="async" src="${rel(join(basis, d, f))}" alt="${esc(art)} ${esc(d)} ${esc(f)}">`)
              .join('')}</div></figure>`
          : '';
      })
      .join('');
    const lose = bilderIn(basis);
    const loseHtml = lose.length
      ? `<div class="band">${lose.map((f) => `<img loading="lazy" decoding="async" src="${rel(join(basis, f))}" alt="${esc(art)} ${esc(f)}">`).join('')}</div>`
      : '';
    return reihen || loseHtml ? `<section id="${art}"><h2>${{ momente: 'Große Momente', seitenwechsel: 'Seitenwechsel', verwaltung: 'Verwaltung und Startklar-Cockpit' }[art]}</h2>${reihen}${loseHtml}</section>` : '';
  })
  .join('');

const nav = routen.map((r) => `<a href="#${esc(ordnerName(r.pfad))}">${esc(r.name)}</a>`).join('');
const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Galerie vorher nachher</title>
<style>
:root{--papier:#faf7f0;--weiss:#fff;--tinte:#1c2420;--tinte-2:#4a544f;--linie:#e3ddd0;--gruen:#1f5c3d}
*{box-sizing:border-box}body{margin:0;background:var(--papier);color:var(--tinte);font:16px/1.6 system-ui,sans-serif}
header{padding:24px 16px;border-bottom:1px solid var(--linie);background:var(--weiss)}h1{margin:0 0 4px;font-size:28px;line-height:1.2}
header p{margin:0;color:var(--tinte-2);max-width:70ch}nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
nav a{color:var(--gruen);font-weight:700;padding:4px 10px;border:1px solid var(--linie);border-radius:999px;text-decoration:none;background:var(--papier)}
main{max-width:1600px;margin:0 auto;padding:16px}section{margin:40px 0}h2{font-size:22px;margin:0 0 12px}h2 code{font-size:14px;color:var(--tinte-2);font-weight:400}
.reiter{display:flex;flex-wrap:wrap;gap:8px}.reiter input{position:absolute;opacity:0}.reiter label{order:0;cursor:pointer;padding:6px 14px;border-radius:999px;border:1px solid var(--linie);background:var(--weiss);font-weight:700}
.reiter input:checked+label{background:var(--gruen);color:var(--weiss);border-color:var(--gruen)}.reiter input:focus-visible+label{outline:3px solid var(--gruen);outline-offset:2px}
.geraet{order:1;display:none;width:100%;margin-top:8px}.reiter input:checked+label+.geraet{display:block}
.kopfzeile,.paar{display:grid;grid-template-columns:1fr 1fr;gap:16px}.kopfzeile{position:sticky;top:0;background:var(--papier);padding:8px 0;font-weight:700;z-index:1}
.paar{margin-bottom:16px}.paar img{width:100%;height:auto;display:block;border:1px solid var(--linie);border-radius:8px;background:var(--weiss)}
.g-390x844 .kopfzeile,.g-390x844 .paar{max-width:820px}.g-768x1024 .kopfzeile,.g-768x1024 .paar{max-width:1200px}
.leer{display:grid;place-items:center;min-height:120px;border:1px dashed var(--linie);border-radius:8px;color:var(--tinte-2)}
.reihe{margin:0 0 20px}.reihe figcaption{font-weight:700;margin-bottom:6px}.band{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px}.band img{height:320px;width:auto;border:1px solid var(--linie);border-radius:8px}
@media (max-width:700px){.kopfzeile,.paar{gap:8px}.band img{height:220px}}
</style></head><body>
<header><h1>${esc(a.titel)}</h1><p>Links der Ausgangsstand vom Laufbeginn (E0, Commit 9ebb4bc), rechts der Abschluss. Gleiche Inhalte, gleiche Gerätegrößen, Bildschirm für Bildschirm von oben nach unten. Die Reiter wechseln das Gerät.</p><nav>${nav}<a href="#momente">Momente</a><a href="#seitenwechsel">Seitenwechsel</a></nav></header>
<main>${abschnitte.join('')}${streifen}</main></body></html>`;
writeFileSync(AUS, html);
console.log(`galerie: ${AUS} · ${routen.length} Ansichten · ${fehlend} Gerätesätze ohne Nachher-Bilder`);
