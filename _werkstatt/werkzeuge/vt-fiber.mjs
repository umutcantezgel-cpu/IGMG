// Zeigt die Fiber-Kette oberhalb des Seiteninhalts (Tag 30 = ViewTransition, 31 = Activity, 22 = Offscreen).
import { chromium } from 'playwright';
const basis = process.argv[2] ?? 'http://127.0.0.1:3400';
const pfad = process.argv[3] ?? '/impressum';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const seite = await browser.newPage();
await seite.goto(basis + pfad, { waitUntil: 'networkidle' });
const kette = await seite.evaluate(() => {
  const el = document.querySelector('main > div') ?? document.querySelector('main');
  const k = Object.keys(el).find((x) => x.startsWith('__reactFiber$'));
  let f = el[k]; const aus = [];
  while (f && aus.length < 60) { aus.push(`${f.tag}:${typeof f.type === 'string' ? f.type : f.type?.displayName ?? f.type?.name ?? (typeof f.type === 'symbol' ? f.type.toString() : '')}${f.tag === 30 ? ' props=' + JSON.stringify(Object.keys(f.memoizedProps ?? {})) : ''}${f.tag === 22 || f.tag === 31 ? ' mode=' + (f.memoizedProps?.mode ?? '') : ''}`); f = f.return; }
  return aus;
});
console.log(kette.join('\n'));
await browser.close();
