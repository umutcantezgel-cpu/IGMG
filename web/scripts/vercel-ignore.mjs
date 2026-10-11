// Ignored Build Step auf Vercel (V-01): Exit 0 = Bau überspringen, Exit 1 = bauen.
// Vorschauen von Zwischenständen (Betreff beginnt mit „ZWISCHENSTAND“) werden nicht gebaut; Produktion baut immer.
// Im Zweifel (fehlende Angaben) wird gebaut.
const umgebung = process.env.VERCEL_ENV;
const betreff = process.env.VERCEL_GIT_COMMIT_MESSAGE ?? '';
if (umgebung !== 'production' && betreff.startsWith('ZWISCHENSTAND')) {
  console.log('[ignorieren] Zwischenstand – kein Vorschau-Bau.');
  process.exit(0);
}
console.log(`[ignorieren] Bauen (${umgebung ?? 'unbekannt'}).`);
process.exit(1);
