// Inhaltsmigration „Marktstart IGMG“ (Welle 3, E-044, Nachtrag ADR 0019): bringt Beispielinhalte (ist_beispiel = true) der
// Bereiche igmg, ueber-uns, vorstand, der vier Organisationen, dachverband und hadsch-umra auf den Stand der Seeds und legt
// fehlende Bereiche an; ergänzt die Videos von IGMG Reisen im Seiteninhalt „wissen“ und KI-Entwürfe, die diese Datenbank nie
// bekommen hat (ADR 0047, Merker in `einstellung`: endgültig Gelöschtes kommt nicht zurück). Redaktionell gespeicherte
// Inhalte bleiben unberührt. Idempotent, mit Audit-Eintrag je Änderung, eine Transaktion unter der Sperre der Inhaltsstände.
// Logik und Tests: src/lib/inhalt/stand-marktstart.ts, src/lib/inhalt/seed-stand.ts, tests/unit/inhalte-marktstart.test.ts,
// tests/integration/inhalte-marktstart.test.ts.
// Aufruf: pnpm inhalte:marktstart (DATABASE_URL oder PGlite), nach pnpm inhalte:2026. Danach Cache erneuern (Tag
// seiteninhalt, BETRIEB.md); im Vercel-Bau mit Datenbank läuft es vor `next build` (scripts/vercel-bau.mjs).
import { holeDb } from '@/lib/db';
import { wendeStandMarktstartAn } from '@/lib/inhalt/stand-marktstart';

const TEXT = {
  eingefuegt: 'angelegt (Seed-Stand, Audit-Eintrag geschrieben)',
  aktualisiert: 'auf Stand Marktstart gebracht (Audit-Eintrag geschrieben)',
  unveraendert: 'bereits auf Stand Marktstart',
  redaktionell: 'redaktionell gepflegt – nicht verändert',
  fehlt: 'nicht vorhanden – nichts zu tun',
} as const;

wendeStandMarktstartAn(holeDb())
  .then((ergebnis) => {
    for (const [bereich, ausgang] of Object.entries(ergebnis.bereiche)) console.log(`[inhalte-marktstart] ${bereich}: ${TEXT[ausgang]}`);
    console.log(`[inhalte-marktstart] wissen (Videos IGMG Reisen): ${TEXT[ergebnis.wissenVideos]}`);
    console.log(
      `[inhalte-marktstart] Wissens-Entwürfe: ${ergebnis.wissenEntwuerfe.length ? `${ergebnis.wissenEntwuerfe.length} angelegt (${ergebnis.wissenEntwuerfe.join(', ')})` : 'keiner neu (vorhanden oder schon einmal angelegt)'}`,
    );
    process.exit(0);
  })
  .catch((e) => {
    console.error('[inhalte-marktstart] Fehler:', e instanceof Error ? e.message : e);
    process.exit(1);
  });
