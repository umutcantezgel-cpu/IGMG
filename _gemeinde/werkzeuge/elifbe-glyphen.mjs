#!/usr/bin/env node
// Elifbe-Glyphen (Paket H-E01, B-17): erzeugt aus der Amiri-Schrift (SIL OFL 1.1) die Umrisse der 29 Buchstaben in der
// Einzelform als SVG-Pfade und schreibt sie nach web/src/lib/elifbe/glyphen.json. Die Mittellinien-Züge (Schreibweg)
// stehen getrennt in web/src/lib/elifbe/zuege.ts und werden von Hand gepflegt (Hoca prüft, MN-07).
//
// Aufruf (Node 24, liest alphabet.ts direkt mit Type-Stripping):
//   node _gemeinde/werkzeuge/elifbe-glyphen.mjs [--schrift <Amiri-Regular.ttf>] [--ziel <glyphen.json>]
// Voraussetzungen außerhalb des Repos:
//   - opentype.js 1.3.4 in $WERKZEUGE_NM (Vorgabe: $SCRATCHPAD/werkzeuge-nm/node_modules), z. B.
//     npm install --prefix $SCRATCHPAD/werkzeuge-nm --no-save opentype.js@1.3.4
//   - Amiri 1.000 aus dem Release von aliftype/amiri (Amiri-1.000.zip, SHA-256 unten), entpackt; Vorgabe:
//     $SCRATCHPAD/amiri-dl/Amiri-1.000/Amiri-Regular.ttf
// Die Schrift selbst kommt nicht ins Repo; die Ausgabe nennt Quelle, Version und Lizenz (OFL-konform).
// Danach im Ordner web: npx prettier --write src/lib/elifbe/glyphen.json (gleiche Formatierung wie im Repo).
//
// Koordinaten: Schrifteinheiten (1000 je Geviert), y nach unten (SVG), Grundlinie bei y = 0, ganze Zahlen.
// Je Buchstabe: `rumpf` (Hauptform samt Innenräumen), `punkte` (Punkte und kleine Zeichen, je eigener Pfad, in der
// Reihenfolge rechts → links), `box` [x1, y1, x2, y2] und `vorschub`.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRATCHPAD =
  process.env.SCRATCHPAD ??
  "/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad";
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const NM =
  process.env.WERKZEUGE_NM ?? join(SCRATCHPAD, "werkzeuge-nm", "node_modules");

const args = process.argv.slice(2);
const arg = (name, vorgabe) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : vorgabe;
};
const schriftPfad = arg(
  "--schrift",
  join(SCRATCHPAD, "amiri-dl", "Amiri-1.000", "Amiri-Regular.ttf"),
);
const zielPfad = arg(
  "--ziel",
  join(WURZEL, "web", "src", "lib", "elifbe", "glyphen.json"),
);

/** Prüfsumme des Release-Archivs Amiri-1.000.zip (Download am 13.10.2026). */
const ZIP_SHA256 =
  "926fe1bd7dfde8e55178281f645258bfced6420c951c6f2fd532fd21691bca30";

const opentype = createRequire(join(NM, "package.json"))("opentype.js");
const { BUCHSTABEN } = await import(
  pathToFileURL(join(WURZEL, "web", "src", "lib", "elifbe", "alphabet.ts")).href
);

const daten = readFileSync(schriftPfad);
const font = opentype.parse(
  daten.buffer.slice(daten.byteOffset, daten.byteOffset + daten.byteLength),
);
const ttfSha = createHash("sha256").update(daten).digest("hex");

/** Teilt die Befehle eines Glyphenpfads in geschlossene Konturen. */
function konturen(befehle) {
  const aus = [];
  let jetzt = [];
  for (const b of befehle) {
    if (b.type === "M" && jetzt.length) {
      aus.push(jetzt);
      jetzt = [];
    }
    jetzt.push(b);
    if (b.type === "Z") {
      aus.push(jetzt);
      jetzt = [];
    }
  }
  if (jetzt.length) aus.push(jetzt);
  return aus;
}

/** Punkte einer Kontur (Stütz- und Kontrollpunkte) – genügt für Umlaufsinn und Rahmen. */
function punkteVon(kontur) {
  const p = [];
  for (const b of kontur) {
    if (b.x1 !== undefined) p.push([b.x1, b.y1]);
    if (b.x2 !== undefined) p.push([b.x2, b.y2]);
    if (b.x !== undefined) p.push([b.x, b.y]);
  }
  return p;
}

function flaeche(p) {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const [x1, y1] = p[i];
    const [x2, y2] = p[(i + 1) % p.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

function rahmen(p) {
  const xs = p.map((q) => q[0]);
  const ys = p.map((q) => q[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

const r = (v) => Math.round(v);
/** SVG-Pfad einer Kontur, y gespiegelt (SVG), ganze Zahlen. */
function svg(kontur) {
  return kontur
    .map((b) => {
      switch (b.type) {
        case "M":
          return `M${r(b.x)} ${r(-b.y)}`;
        case "L":
          return `L${r(b.x)} ${r(-b.y)}`;
        case "Q":
          return `Q${r(b.x1)} ${r(-b.y1)} ${r(b.x)} ${r(-b.y)}`;
        case "C":
          return `C${r(b.x1)} ${r(-b.y1)} ${r(b.x2)} ${r(-b.y2)} ${r(b.x)} ${r(-b.y)}`;
        case "Z":
          return "Z";
        default:
          throw new Error(`Unbekannter Pfadbefehl ${b.type}`);
      }
    })
    .join("");
}

const innen = (a, b) =>
  a[0] >= b[0] && a[1] >= b[1] && a[2] <= b[2] && a[3] <= b[3];

/**
 * Eigene Konturen mit dem Umlaufsinn der Hauptform und weniger als 40 % ihrer Fläche sind Punkte oder kleine Zeichen
 * (Amiri setzt zwei Punkte als eine Kontur; das Zeichen im Kef ist eine eigene Kontur). Konturen mit Gegensinn sind
 * Innenräume und gehören zu der Kontur, in deren Rahmen sie liegen.
 */
const PUNKT_ANTEIL = 0.4;

const glyphen = {};
for (const b of BUCHSTABEN) {
  const glyph = font.charToGlyph(String.fromCodePoint(b.codepunkt));
  if (!glyph || glyph.index === 0)
    throw new Error(`Keine Glyphe für ${b.slug}`);
  const teile = konturen(glyph.path.commands).map((k) => {
    const p = punkteVon(k);
    return { k, a: flaeche(p), box: rahmen(p) };
  });
  const haupt = teile.reduce((m, t) => (Math.abs(t.a) > Math.abs(m.a) ? t : m));
  const sinn = Math.sign(haupt.a);
  const aussen = teile.filter((t) => Math.sign(t.a) === sinn);
  const loecher = teile.filter((t) => Math.sign(t.a) !== sinn);
  const groesse = (t) => Math.max(t.box[2] - t.box[0], t.box[3] - t.box[1]);
  if (process.env.DETAIL) {
    for (const t of teile)
      console.log(
        `   ${b.slug} Fläche ${Math.round(t.a)} · Rahmen ${t.box.map(Math.round).join(" ")} · Größe ${Math.round(groesse(t))}`,
      );
  }
  const punkte = aussen.filter(
    (t) => t !== haupt && Math.abs(t.a) < PUNKT_ANTEIL * Math.abs(haupt.a),
  );
  const rumpfAussen = aussen.filter((t) => !punkte.includes(t));
  // Innenräume gehören zur Kontur, in deren Rahmen sie liegen (gleicher Pfad wegen nonzero-Füllregel)
  const rumpfLoecher = loecher.filter((l) =>
    rumpfAussen.some((a) => innen(l.box, a.box)),
  );
  const punktLoecher = loecher.filter((l) => !rumpfLoecher.includes(l));
  const rumpf = [...rumpfAussen, ...rumpfLoecher].map((t) => svg(t.k)).join("");
  const punktPfade = punkte
    .sort((p, q) => q.box[2] - p.box[2])
    .map((p) =>
      [p, ...punktLoecher.filter((l) => innen(l.box, p.box))]
        .map((t) => svg(t.k))
        .join(""),
    );
  const alle = rahmen(
    teile.flatMap((t) => [
      [t.box[0], t.box[1]],
      [t.box[2], t.box[3]],
    ]),
  );
  glyphen[b.slug] = {
    rumpf,
    punkte: punktPfade,
    box: [r(alle[0]), r(-alle[3]), r(alle[2]), r(-alle[1])],
    vorschub: r(glyph.advanceWidth),
  };
  console.log(
    `${b.slug.padEnd(6)} Konturen ${teile.length} · Punktformen ${punktPfade.length} (Punkte laut Alphabet ${b.punkte.anzahl}) · Rahmen ${glyphen[b.slug].box.join(" ")}`,
  );
}

const ausgabe = {
  quelle: {
    schrift: "Amiri Regular",
    version: font.tables.name?.version?.en ?? "1.000",
    lizenz: "SIL Open Font License 1.1",
    urheber: "Khaled Hosny (Amiri Project Authors)",
    adresse: "https://www.amirifont.org/",
    archivSha256: ZIP_SHA256,
    schriftSha256: ttfSha,
    hinweis:
      "Umrisse der Einzelformen, erzeugt mit _gemeinde/werkzeuge/elifbe-glyphen.mjs; nicht von Hand ändern.",
  },
  einheitenProGeviert: font.unitsPerEm,
  aufstieg: r(font.ascender),
  abstieg: r(font.descender),
  glyphen,
};
writeFileSync(zielPfad, `${JSON.stringify(ausgabe, null, 2)}\n`);
console.log(
  `geschrieben: ${zielPfad} (${(JSON.stringify(ausgabe).length / 1024).toFixed(1)} KB)`,
);
