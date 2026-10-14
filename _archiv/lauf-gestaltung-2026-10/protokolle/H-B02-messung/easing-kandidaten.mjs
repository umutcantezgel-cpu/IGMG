import { createRequire } from 'node:module';
const [x1, y1, x2, y2] = [0.05, 0.7, 0.1, 1];
const bez = (s, a, b) => 3 * (1 - s) * (1 - s) * s * a + 3 * (1 - s) * s * s * b + s * s * s;
const xAt = (s) => bez(s, x1, x2), yAt = (s) => bez(s, y1, y2);
const progress = (t) => { let lo = 0, hi = 1; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (xAt(m) < t) lo = m; else hi = m; } return yAt((lo + hi) / 2); };
const timeAt = (a) => { let lo = 0, hi = 1; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (progress(m) < a) lo = m; else hi = m; } return (lo + hi) / 2; };
const D = 1200, T = 320;
const pts = []; for (let i = 1; i <= 100; i++) pts.push(i / 100);
const t = (a) => timeAt(a) * D;
const pruefe = (name, f) => {
  let minRand = Infinity, maxRand = -Infinity, fruh = 0, spaet = 0;
  for (const a of pts) {
    const d = f(a) - t(a);
    if (d < -10) fruh++;
    if (f(a) + T - t(a) > 600) spaet++;
    minRand = Math.min(minRand, d); maxRand = Math.max(maxRand, d);
  }
  console.log(name.padEnd(28), 'vor Linie (>10ms):', String(fruh).padStart(2), ' zu spaet (>600ms gefuellt):', String(spaet).padStart(2), ' Abstand min/max ms:', minRand.toFixed(0), maxRand.toFixed(0));
};
pruefe('a^3 (aktuell)', (a) => a ** 3 * D);
for (const n of [4, 5, 6, 8]) pruefe(`a^${n}`, (a) => a ** n * D);
pruefe('a^4 * 0.9 + a^8 * 0.1', (a) => (0.9 * a ** 4 + 0.1 * a ** 8) * D);
pruefe('a^3 - a^3... 2a^4-a^5?', (a) => (2 * a ** 4 - a ** 5) * D);
