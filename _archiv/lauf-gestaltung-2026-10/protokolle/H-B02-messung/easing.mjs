// cubic-bezier(x1,y1,x2,y2) progress at time fraction t (x) -> y
const [x1, y1, x2, y2] = [0.05, 0.7, 0.1, 1];
const bez = (s, a, b) => 3 * (1 - s) * (1 - s) * s * a + 3 * (1 - s) * s * s * b + s * s * s;
const xAt = (s) => bez(s, x1, x2);
const yAt = (s) => bez(s, y1, y2);
// invert x(s)=t by bisection
const progress = (t) => { let lo = 0, hi = 1; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (xAt(m) < t) lo = m; else hi = m; } return yAt((lo + hi) / 2); };
// time fraction at which progress reaches a (inverse of progress)
const timeAt = (a) => { let lo = 0, hi = 1; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (progress(m) < a) lo = m; else hi = m; } return (lo + hi) / 2; };
const D = 1200, T = 320;
console.log('a    line_passes_ms  fill_starts_ms  margin_ms(fill-line)  fill_done_ms  done_minus_pass');
let worstNeg = Infinity, worstLate = -Infinity;
for (const a of [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]) {
  const tp = timeAt(a) * D;
  const fs = a ** 3 * D;
  const done = fs + T;
  worstNeg = Math.min(worstNeg, fs - tp);
  worstLate = Math.max(worstLate, done - tp);
  console.log(a.toFixed(1).padEnd(4), tp.toFixed(0).padStart(14), fs.toFixed(0).padStart(14), (fs - tp).toFixed(0).padStart(20), done.toFixed(0).padStart(12), (done - tp).toFixed(0).padStart(14));
}
console.log('min margin (fill start - line pass), must be >= 0:', worstNeg.toFixed(0), 'ms');
console.log('max (fill done - line pass), spec <= 600 ms:', worstLate.toFixed(0), 'ms');
