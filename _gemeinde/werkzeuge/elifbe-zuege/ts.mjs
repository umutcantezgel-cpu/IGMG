// Schreibweg (B-17), Schritt 3: schreibt web/src/lib/elifbe/zuege.ts aus $SCRATCHPAD/elifbe-zuege/zuege.json (bauen.mjs).
// Aufruf: node _gemeinde/werkzeuge/elifbe-zuege/ts.mjs, danach npx prettier --write web/src/lib/elifbe/zuege.ts
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const WEB = fileURLToPath(new URL("../../../web", import.meta.url));
const S =
  process.env.SCRATCHPAD ??
  "/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad";
const z = JSON.parse(readFileSync(`${S}/elifbe-zuege/zuege.json`, "utf8"));
const { BUCHSTABEN } = await import(`${WEB}/src/lib/elifbe/alphabet.ts`);

const familien = [...new Set(BUCHSTABEN.map((b) => b.familie))];
const laenge = (q) => {
  // Länge der kubischen Kurve über feine Abtastung der Bézier-Segmente
  const zahlen = q.d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const pkt = [];
  for (let i = 0; i < zahlen.length; i += 2)
    pkt.push([zahlen[i], zahlen[i + 1]]);
  let l = 0;
  if (q.d.includes("L") || pkt.length === 2)
    return Math.round(Math.hypot(pkt[1][0] - pkt[0][0], pkt[1][1] - pkt[0][1]));
  for (let k = 0; k + 3 < pkt.length; k += 3) {
    const [p0, p1, p2, p3] = pkt.slice(k, k + 4);
    let vor = p0;
    for (let t = 0.05; t <= 1.0001; t += 0.05) {
      const u = 1 - t;
      const x =
        u * u * u * p0[0] +
        3 * u * u * t * p1[0] +
        3 * u * t * t * p2[0] +
        t * t * t * p3[0];
      const y =
        u * u * u * p0[1] +
        3 * u * u * t * p1[1] +
        3 * u * t * t * p2[1] +
        t * t * t * p3[1];
      l += Math.hypot(x - vor[0], y - vor[1]);
      vor = [x, y];
    }
  }
  return Math.round(l);
};
const zug = (q) => `{ d: '${q.d}', breite: ${q.breite}, laenge: ${laenge(q)} }`;
const liste = (zs, einzug) =>
  zs.length
    ? `[\n${zs.map((q) => `${einzug}  ${zug(q)},`).join("\n")}\n${einzug}]`
    : "[]";

let ts = `/**
 * Schreibweg (Bewegungsregister B-17): die Mittellinien-Züge je Buchstabe im Koordinatensystem der Glyphen
 * (\`glyphen.json\`: Schrifteinheiten, y nach unten, Grundlinie bei 0). Reihenfolge und Richtung wie im Elifbe-Unterricht
 * üblich – Hauptzug zuerst, von rechts nach links, Punkte und Zeichen zuletzt (rechts vor links).
 *
 * Von Hoca zu prüfen (MENSCHEN MN-07): Reihenfolge, Richtung und Anfangspunkt jedes Zuges. Bis zur Bestätigung gilt
 * der Schreibweg als Vorschlag; die Seite sagt das neben der Grafik.
 *
 * Gezeichnet nach der Mittelachse der Amiri-Umrisse (Wegpunkte auf dem Skelett, geglättet). \`breite\` ist die Breite des
 * Maskenstrichs, der die Glyphe beim Zeichnen aufdeckt: die größte Strichstärke entlang des Zuges plus Zugabe.
 * Buchstaben mit gleichem Rumpf (z. B. Be, Te, Se) teilen ihre Hauptzüge; nur die Punkte unterscheiden sich.
 */
import type { Buchstabe, Familie } from './alphabet';

/** Ein Zug: Pfad, Breite des Maskenstrichs und ungefähre Länge (Schrifteinheiten) für die Zeitverteilung. */
export type Zug = { d: string; breite: number; laenge: number };
export type Schreibweg = { zuege: readonly Zug[]; punkte: readonly Zug[] };

/** Hauptzüge je Grundform. */
const RUMPF: Record<Familie, readonly Zug[]> = {
`;
for (const f of familien) ts += `  ${f}: ${liste(z[f].zuege, "  ")},\n`;
ts += `};

/** Punkte und Zeichen je Buchstabe (Rauten: kurzer Strich von oben rechts nach unten links). */
const PUNKTE: Record<string, readonly Zug[]> = {
`;
for (const b of BUCHSTABEN)
  if (z[b.slug].punktZuege.length)
    ts += `  ${b.slug.includes("-") ? `'${b.slug}'` : b.slug}: ${liste(z[b.slug].punktZuege, "  ")},\n`;
ts += `};

export function schreibweg(b: Pick<Buchstabe, 'slug' | 'familie'>): Schreibweg {
  return { zuege: RUMPF[b.familie], punkte: PUNKTE[b.slug] ?? [] };
}

/** Anfangspunkt eines Zuges (erste Koordinate nach „M“) – für Nummern und Startmarken. */
export function anfang(d: string): [number, number] {
  const m = /^M(-?\\d+(?:\\.\\d+)?)[ ,](-?\\d+(?:\\.\\d+)?)/.exec(d);
  if (!m) throw new Error(\`Zug ohne Anfang: \${d.slice(0, 20)}\`);
  return [Number(m[1]), Number(m[2])];
}
`;
writeFileSync(`${WEB}/src/lib/elifbe/zuege.ts`, ts);
console.log("ok", ts.length);
