// Schreibweg (B-17), Prüfung: Glyphe rot, darüber dieselbe Glyphe durch die Zug-Maske (dunkel). Rot sichtbar = Lücke.
// Zusätzlich die Mittellinien mit Pfeil und Nummer. Aufruf: node _gemeinde/werkzeuge/elifbe-zuege/abdeckung.mjs [slugs|alle]
// Liest $SCRATCHPAD/elifbe-zuege/zuege.json, Bild nach $SCRATCHPAD/elifbe-zuege/bilder/. Bild ansehen, bevor ts.mjs läuft.
import { mkdirSync, readFileSync } from "node:fs";
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
const z = JSON.parse(readFileSync(`${ARBEIT}/zuege.json`, "utf8"));
const slugs =
  !process.argv[2] || process.argv[2] === "alle"
    ? Object.keys(g.glyphen)
    : process.argv[2].split(",");
const breiteSpalte = 440;

const zellen = slugs
  .map((slug) => {
    const gl = g.glyphen[slug];
    const zz = z[slug];
    const [x1, y1, x2, y2] = gl.box;
    const pad = 70;
    const vb = [x1 - pad, y1 - pad, x2 - x1 + 2 * pad, y2 - y1 + 2 * pad];
    const maske = zz.zuege
      .map((q) => `<path d="${q.d}" stroke-width="${q.breite}"/>`)
      .join("");
    const pmaske = zz.punktZuege
      .map((q) => `<path d="${q.d}" stroke-width="${q.breite}"/>`)
      .join("");
    const linien = zz.zuege
      .map(
        (q, i) =>
          `<path d="${q.d}" fill="none" stroke="#0a7" stroke-width="8" stroke-linecap="round" marker-end="url(#pf)"/><text x="${q.punkte[0][0] + 10}" y="${q.punkte[0][1] - 10}" font-size="48" font-weight="bold" fill="#0a7">${i + 1}</text>`,
      )
      .join("");
    const plinien = zz.punktZuege
      .map(
        (q) =>
          `<path d="${q.d}" fill="none" stroke="#06c" stroke-width="8" stroke-linecap="round" marker-end="url(#pf)"/>`,
      )
      .join("");
    return `<figure><figcaption>${slug}</figcaption><svg viewBox="${vb.join(" ")}" width="${breiteSpalte}">
<defs><mask id="m-${slug}" maskUnits="userSpaceOnUse" x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">${maske}</g></mask>
<mask id="p-${slug}" maskUnits="userSpaceOnUse" x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">${pmaske}</g></mask></defs>
<path d="${gl.rumpf}" fill="#e00"/>${gl.punkte.map((p) => `<path d="${p}" fill="#e00"/>`).join("")}
<path d="${gl.rumpf}" fill="#444" mask="url(#m-${slug})"/>${gl.punkte.map((p) => `<path d="${p}" fill="#444" mask="url(#p-${slug})"/>`).join("")}
${linien}${plinien}</svg></figure>`;
  })
  .join("");
const html = `<!doctype html><body style="margin:0;font:18px sans-serif;display:flex;flex-wrap:wrap;gap:6px;padding:6px;background:#fff"><svg width="0" height="0"><defs><marker id="pf" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.5" markerHeight="3.5" orient="auto"><path d="M0 0 10 5 0 10z" fill="#000"/></marker></defs></svg><style>figure{margin:0;border:1px solid #ccc}figcaption{padding:2px 6px;font-weight:bold}svg{display:block;height:auto;max-height:520px}</style>${zellen}</body>`;
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ??
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
await page.setContent(html);
const bild = `${ARBEIT}/bilder/abdeckung-${slugs.length > 4 ? slugs[0] + "-bis-" + slugs.at(-1) : slugs.join("-")}.png`;
await page.screenshot({ path: bild, fullPage: true });
await browser.close();
console.log(bild);
