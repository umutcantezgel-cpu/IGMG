// B-06-Folge im Browser (Scratchpad, nur lesen): Linie gegen Punktfüllung und Stern über die Zeit
import { starteBrowser, neuerKontext, basisAdresse } from '/home/user/IGMG/_werkstatt/werkzeuge/hilfen.mjs';
const basis = basisAdresse('http://localhost:3200');
const [breite, zeit, sprache, reduziert] = [Number(process.argv[2] ?? 1440), process.argv[3] ?? 'abend', process.argv[4] ?? 'de', process.argv[5] === 'reduziert'];
const ZEITEN = { tag: '2026-10-12T10:30:00+02:00', abend: '2026-10-12T21:00:00+02:00' };
const PFAD = { de: '/', tr: '/tr', en: '/en' };
const browser = await starteBrowser();
try {
  const kontext = await neuerKontext(browser, { viewport: { width: breite, height: 900 }, deviceScaleFactor: 1, reducedMotion: reduziert ? 'reduce' : 'no-preference' });
  const seite = await kontext.newPage();
  await seite.addInitScript(() => {
    window.__proben = null;
    const beginn = () => {
      const t0 = performance.now();
      const proben = [];
      window.__proben = proben;
      const fig = () => [...document.querySelectorAll('figure')].find((f) => f.querySelector('svg[role="img"]'));
      const lauf = () => {
        const f = fig();
        const now = performance.now() - t0;
        const rect = f?.querySelector('rect.bogen-enthuellt, clipPath rect');
        const punkte = f ? [...f.querySelectorAll('span.size-3.rounded-pill')].map((p) => ({
          x: parseFloat(p.style.left) * 640 / 100,
          bg: getComputedStyle(p).backgroundColor,
        })) : [];
        const stern = f?.querySelector('span.size-9');
        const sc = rect ? getComputedStyle(rect).scale : null;
        const bisX = rect ? parseFloat(rect.getAttribute('width')) : null;
        proben.push({ t: Math.round(now), scale: sc, bisX, punkte, stern: stern ? getComputedStyle(stern).opacity : null });
        if (now < 2600) requestAnimationFrame(lauf);
      };
      requestAnimationFrame(lauf);
    };
    const mo = new MutationObserver(() => {
      if (!window.__proben && document.querySelector('figure svg[role="img"]') && document.querySelector('rect.bogen-enthuellt, span.size-3.rounded-pill.bogen-punkt-erreicht')) {
        mo.disconnect(); beginn();
      }
    });
    document.addEventListener('DOMContentLoaded', () => mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true }));
  });
  await seite.clock.setFixedTime(new Date(ZEITEN[zeit]));
  await seite.goto(basis + PFAD[sprache], { waitUntil: 'load', timeout: 60000 });
  await seite.waitForTimeout(3500);
  const proben = await seite.evaluate(() => window.__proben ?? []);
  // Auswertung: je Punkt Zeit des Durchgangs der Linie und Zeit der Füllung
  const weiss = 'rgb(255, 255, 255)';
  const reach = (p, bisX, scale) => bisX !== null && scale !== null && parseFloat(scale) * bisX >= p.x - 0.5;
  if (proben.length === 0) { console.log('keine Proben'); process.exit(0); }
  const t0Probe = proben.find((q) => q.bisX !== null);
  const punkteN = t0Probe ? t0Probe.punkte.length : 0;
  const zeilen = [];
  for (let i = 0; i < punkteN; i++) {
    const x = t0Probe.punkte[i].x;
    let tDurch = null, tFuell = null, tFuellFertig = null, fruh = false;
    for (const q of proben) {
      if (q.bisX === null) continue;
      const p = q.punkte[i];
      const erreicht = reach(p, q.bisX, q.scale);
      const gefuellt = p.bg !== weiss;
      if (tDurch === null && erreicht) tDurch = q.t;
      if (tFuell === null && gefuellt) tFuell = q.t;
      if (gefuellt && !erreicht) fruh = true;
    }
    zeilen.push({ punkt: i, x: Math.round(x), durchgang: tDurch, fuellBeginn: tFuell, abstand: tFuell !== null && tDurch !== null ? tFuell - tDurch : null, zuFruehGefuellt: fruh });
  }
  const sterne = proben.filter((q) => q.stern !== null).map((q) => q.stern);
  const sternErstes = proben.find((q) => q.stern !== null && parseFloat(q.stern) > 0.02);
  const letzte = proben[proben.length - 1];
  console.log(JSON.stringify({ breite, zeit, sprache, reduziert, proben: proben.length, punkte: zeilen, sternErstesSichtbar: sternErstes ? sternErstes.t : null, sternLetzte: sterne[sterne.length - 1], letztesScale: letzte.scale, bisX: letzte.bisX }, null, 1));
} finally { await browser.close(); }
