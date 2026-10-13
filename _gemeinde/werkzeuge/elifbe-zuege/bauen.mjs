// Schreibweg (B-17), Schritt 2 – Züge aus Wegpunkten: rastert Rumpf bzw. Punktformen, bildet Skelett (Zhang-Suen) und Abstandsfeld, rastet
// Wegpunkte auf das Skelett ein, verbindet sie per Breitensuche entlang der Mittelachse, glättet (RDP + Catmull-Rom →
// kubische Bézier) und schreibt Pfade samt Maskenbreite. Punkte ohne Wegpunkte: je Punktform automatisch (k-Mittel bei Paaren).
// Aufruf: node _gemeinde/werkzeuge/elifbe-zuege/bauen.mjs [slug,slug] [--nur-skelett] [--punkte-skelett]
// Liest $SCRATCHPAD/elifbe-zuege/wegpunkte.json, schreibt zuege.json und bei --nur-skelett ein Bild mit Raster und Achse.
// Voraussetzung: Playwright aus web/node_modules, Chromium unter /opt/pw-browsers (oder CHROME_PATH).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const WEB = fileURLToPath(new URL("../../../web", import.meta.url));
const S =
  process.env.SCRATCHPAD ??
  "/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad";
const ARBEIT = `${S}/elifbe-zuege`;
mkdirSync(`${ARBEIT}/bilder`, { recursive: true });
const require = createRequire(`${WEB}/package.json`);
const { chromium } = require("@playwright/test");
const g = JSON.parse(
  readFileSync(`${WEB}/src/lib/elifbe/glyphen.json`, "utf8"),
);
const auswahl = process.argv[2];
const specPfad = `${ARBEIT}/wegpunkte.json`;
const ausPfad = `${ARBEIT}/zuege.json`;
const nurSkelett = process.argv.includes("--nur-skelett");
const punkteSkelett = process.argv.includes("--punkte-skelett");
const spec = nurSkelett ? {} : JSON.parse(readFileSync(specPfad, "utf8"));
const slugs =
  auswahl && !auswahl.startsWith("--")
    ? auswahl.split(",")
    : Object.keys(g.glyphen);

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ??
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.setContent("<!doctype html><body></body>");

const ergebnis = {};
const bilder = [];
for (const slug of slugs) {
  const gl = g.glyphen[slug];
  const s = spec[slug] ?? { zuege: [] };
  const res = await page.evaluate(
    ({ gl, s, nurSkelett, punkteSkelett }) => {
      const SK = 0.5;
      const pad = 30;
      const [x1, y1, x2, y2] = gl.box;
      const w = Math.ceil((x2 - x1) * SK) + 2 * pad;
      const h = Math.ceil((y2 - y1) * SK) + 2 * pad;
      const zuPx = ([x, y]) => [
        Math.round((x - x1) * SK + pad),
        Math.round((y - y1) * SK + pad),
      ];
      const zuEh = ([px, py]) => [(px - pad) / SK + x1, (py - pad) / SK + y1];
      const raster = (d) => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        ctx.setTransform(SK, 0, 0, SK, pad - x1 * SK, pad - y1 * SK);
        ctx.fill(new Path2D(d));
        const daten = ctx.getImageData(0, 0, w, h).data;
        const m = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) m[i] = daten[i * 4 + 3] > 127 ? 1 : 0;
        return m;
      };
      function analyse(form) {
        const dist = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) dist[i] = form[i] ? 1e9 : 0;
        const D = (x, y) =>
          x < 0 || y < 0 || x >= w || y >= h ? 0 : dist[y * w + x];
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++) {
            const i = y * w + x;
            if (dist[i])
              dist[i] = Math.min(
                dist[i],
                D(x - 1, y) + 1,
                D(x, y - 1) + 1,
                D(x - 1, y - 1) + 1.4142,
                D(x + 1, y - 1) + 1.4142,
              );
          }
        for (let y = h - 1; y >= 0; y--)
          for (let x = w - 1; x >= 0; x--) {
            const i = y * w + x;
            if (dist[i])
              dist[i] = Math.min(
                dist[i],
                D(x + 1, y) + 1,
                D(x, y + 1) + 1,
                D(x + 1, y + 1) + 1.4142,
                D(x - 1, y + 1) + 1.4142,
              );
          }
        const sk = form.slice();
        const at = (x, y) =>
          x < 0 || y < 0 || x >= w || y >= h ? 0 : sk[y * w + x];
        let geaendert = true;
        while (geaendert) {
          geaendert = false;
          for (const schritt of [0, 1]) {
            const weg = [];
            for (let y = 1; y < h - 1; y++)
              for (let x = 1; x < w - 1; x++) {
                if (!at(x, y)) continue;
                const p = [
                  at(x, y - 1),
                  at(x + 1, y - 1),
                  at(x + 1, y),
                  at(x + 1, y + 1),
                  at(x, y + 1),
                  at(x - 1, y + 1),
                  at(x - 1, y),
                  at(x - 1, y - 1),
                ];
                const B = p.reduce((a, v) => a + v, 0);
                if (B < 2 || B > 6) continue;
                let A = 0;
                for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) A++;
                if (A !== 1) continue;
                if (
                  schritt === 0
                    ? p[0] * p[2] * p[4] || p[2] * p[4] * p[6]
                    : p[0] * p[2] * p[6] || p[0] * p[4] * p[6]
                )
                  continue;
                weg.push(y * w + x);
              }
            for (const i of weg) sk[i] = 0;
            if (weg.length) geaendert = true;
          }
        }
        const skPunkte = [];
        for (let i = 0; i < w * h; i++) if (sk[i]) skPunkte.push(i);
        return { dist, at, skPunkte };
      }
      const rumpf = analyse(raster(gl.rumpf));
      const punkte = gl.punkte.length
        ? analyse(raster(gl.punkte.join("")))
        : null;
      const zeige = punkteSkelett && punkte ? punkte : rumpf;
      const skelettEh = zeige.skPunkte.map((i) =>
        zuEh([i % w, Math.floor(i / w)]).map(Math.round),
      );
      if (nurSkelett) return { skelett: skelettEh };

      const naechster = (A, pt) => {
        const [px, py] = zuPx(pt);
        let best = -1;
        let bd = Infinity;
        for (const i of A.skPunkte) {
          const d = ((i % w) - px) ** 2 + (Math.floor(i / w) - py) ** 2;
          if (d < bd) {
            bd = d;
            best = i;
          }
        }
        return best;
      };
      const bfs = (A, a, z) => {
        const vor = new Map([[a, -1]]);
        const q = [a];
        let k = 0;
        while (k < q.length) {
          const i = q[k++];
          if (i === z) break;
          const x = i % w;
          const y = (i - x) / w;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              const j = (y + dy) * w + x + dx;
              if (A.at(x + dx, y + dy) && !vor.has(j)) {
                vor.set(j, i);
                q.push(j);
              }
            }
        }
        if (!vor.has(z)) return null;
        const weg = [];
        for (let i = z; i !== -1; i = vor.get(i)) weg.push(i);
        return weg.reverse();
      };
      const rdp = (pts, eps) => {
        if (pts.length < 3) return pts;
        const [a, b2] = [pts[0], pts.at(-1)];
        const dx = b2[0] - a[0];
        const dy = b2[1] - a[1];
        const len = Math.hypot(dx, dy) || 1;
        let maxD = 0;
        let idx = 0;
        for (let i = 1; i < pts.length - 1; i++) {
          const d =
            Math.abs(
              dy * pts[i][0] - dx * pts[i][1] + b2[0] * a[1] - b2[1] * a[0],
            ) / len;
          if (d > maxD) {
            maxD = d;
            idx = i;
          }
        }
        return maxD > eps
          ? [
              ...rdp(pts.slice(0, idx + 1), eps).slice(0, -1),
              ...rdp(pts.slice(idx), eps),
            ]
          : [a, b2];
      };
      const r = (v) => Math.round(v);
      const glatt = (pts) => {
        if (pts.length === 2)
          return `M${r(pts[0][0])} ${r(pts[0][1])}L${r(pts[1][0])} ${r(pts[1][1])}`;
        let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[Math.max(0, i - 1)];
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const p3 = pts[Math.min(pts.length - 1, i + 2)];
          const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
          const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
          d += `C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(p2[0])} ${r(p2[1])}`;
        }
        return d;
      };
      // Wegpunkte: [x, y] rastet ein; [x, y, 'frei'] bleibt; zwischen zwei eingerasteten folgt der Weg dem Skelett
      const zug = (A, wp, zusatz) => {
        const kette = [];
        let dicke = 0;
        for (let k = 0; k < wp.length; k++) {
          const p = wp[k];
          if (p[2] === "frei") {
            kette.push([p[0], p[1]]);
            continue;
          }
          const i = naechster(A, p);
          const vorher =
            k > 0 && wp[k - 1][2] !== "frei" ? naechster(A, wp[k - 1]) : null;
          const weg =
            vorher !== null ? (bfs(A, vorher, i) ?? []).slice(1) : [i];
          for (const j of weg) {
            kette.push(zuEh([j % w, Math.floor(j / w)]));
            dicke = Math.max(dicke, A.dist[j] / SK);
          }
        }
        const pts = rdp(kette, s.eps ?? 6);
        return {
          d: glatt(pts),
          breite: Math.round(dicke * 2 + zusatz),
          punkte: pts.map((q) => q.map(Math.round)),
        };
      };
      const zuege = s.zuege.map((wp) => zug(rumpf, wp, s.zusatz ?? 24));
      const punktZuege = [];
      if (s.punktZuege)
        for (const wp of s.punktZuege)
          punktZuege.push(zug(punkte, wp, s.punktZusatz ?? 20));
      else
        gl.punkte.forEach((d, k) => {
          const m = raster(d);
          const px = [];
          for (let i = 0; i < w * h; i++)
            if (m[i]) px.push([i % w, Math.floor(i / w)]);
          const anzahl = (s.punktAnzahl ?? [])[k] ?? 1;
          let zentren = [
            px.reduce(
              (a, p) => [a[0] + p[0] / px.length, a[1] + p[1] / px.length],
              [0, 0],
            ),
          ];
          if (anzahl === 2) {
            const xs = px.map((p) => p[0]);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            zentren = [maxX - (maxX - minX) / 4, minX + (maxX - minX) / 4].map(
              (x) => [x, zentren[0][1]],
            );
            for (let it = 0; it < 20; it++) {
              const summen = zentren.map(() => [0, 0, 0]);
              for (const p of px) {
                const j =
                  (p[0] - zentren[0][0]) ** 2 + (p[1] - zentren[0][1]) ** 2 <=
                  (p[0] - zentren[1][0]) ** 2 + (p[1] - zentren[1][1]) ** 2
                    ? 0
                    : 1;
                summen[j][0] += p[0];
                summen[j][1] += p[1];
                summen[j][2]++;
              }
              zentren = summen.map((sm) => [sm[0] / sm[2], sm[1] / sm[2]]);
            }
          }
          for (const z of zentren) {
            const [cx, cy] = zuEh(z);
            // Rauten-Punkt: kurzer Strich von oben rechts nach unten links, Maske 112 deckt die Raute
            punktZuege.push({
              d: `M${r(cx + 14)} ${r(cy - 26)}L${r(cx - 14)} ${r(cy + 26)}`,
              breite: 112,
              punkte: [[r(cx + 14), r(cy - 26)]],
            });
          }
        });
      return { zuege, punktZuege, skelett: skelettEh };
    },
    { gl, s, nurSkelett, punkteSkelett },
  );
  ergebnis[slug] = res;
  const [x1, y1, x2, y2] = gl.box;
  const pad = 60;
  const vb = [x1 - pad, y1 - pad, x2 - x1 + 2 * pad, y2 - y1 + 2 * pad];
  let raster = "";
  for (let x = Math.ceil((x1 - pad) / 25) * 25; x <= x2 + pad; x += 25)
    raster += `<line x1="${x}" y1="${vb[1]}" x2="${x}" y2="${vb[1] + vb[3]}" stroke="${x % 100 ? (x % 50 ? "#f6f6f6" : "#e4e4e4") : "#aaa"}" stroke-width="2"/>${x % 100 ? "" : `<text x="${x + 3}" y="${vb[1] + 24}" font-size="22" fill="#333">${x}</text>`}`;
  for (let y = Math.ceil((y1 - pad) / 25) * 25; y <= y2 + pad; y += 25)
    raster += `<line x1="${vb[0]}" y1="${y}" x2="${vb[0] + vb[2]}" y2="${y}" stroke="${y % 100 ? (y % 50 ? "#f6f6f6" : "#e4e4e4") : "#aaa"}" stroke-width="2"/>${y % 100 ? "" : `<text x="${vb[0] + 3}" y="${y - 3}" font-size="22" fill="#333">${y}</text>`}`;
  const skel = res.skelett
    .map(
      ([x, y]) =>
        `<rect x="${x - 1}" y="${y - 1}" width="3" height="3" fill="#06c"/>`,
    )
    .join("");
  bilder.push(
    `<figure><figcaption>${slug}</figcaption><svg viewBox="${vb.join(" ")}" width="${Math.round(Math.min(1300, vb[2] * 1.2))}">${raster}<path d="${gl.rumpf}" fill="#ccc" opacity=".8"/>${gl.punkte.map((p) => `<path d="${p}" fill="#f9b" opacity=".8"/>`).join("")}${skel}</svg></figure>`,
  );
}
await page.setContent(
  `<!doctype html><body style="margin:0;font:18px sans-serif;display:flex;flex-wrap:wrap;gap:8px;padding:8px;background:#fff"><style>figure{margin:0;border:1px solid #ccc}figcaption{padding:2px 6px;font-weight:bold}svg{display:block;height:auto}</style>${bilder.join("")}</body>`,
);
if (nurSkelett) {
  const bild = `${ARBEIT}/bilder/skelett-${slugs.join("-").slice(0, 60)}.png`;
  await page.screenshot({ path: bild, fullPage: true });
  console.log("Bild", bild);
}
await browser.close();
if (!nurSkelett) {
  let alt = {};
  try {
    alt = JSON.parse(readFileSync(ausPfad, "utf8"));
  } catch {}
  for (const [slug, r] of Object.entries(ergebnis))
    alt[slug] = { zuege: r.zuege, punktZuege: r.punktZuege };
  writeFileSync(ausPfad, JSON.stringify(alt, null, 1));
  for (const [slug, r] of Object.entries(ergebnis))
    console.log(
      `${slug}: ${r.zuege.map((z) => `${z.breite}/${z.d.length}`).join(" ")} · Punkte ${r.punktZuege.length}`,
    );
}
