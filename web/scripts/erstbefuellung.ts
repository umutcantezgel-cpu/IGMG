// Erstbefüllung im Vercel-Bau (E-047, Nachtrag ADR 0019 vom 28.10.2026): spielt die Seeds einmalig ein (ERSTBEFUELLUNG=1,
// Merker in `einstellung`) und lädt das erste Verwaltungskonto ein (ERSTE_VERWALTUNG_EMAIL, ERSTE_VERWALTUNG_NAME). Nur
// im Production-Bau; scripts/vercel-bau.mjs startet das Skript nach der Migration, wenn etwas angefordert ist.
// Bedingungen: scripts/erstbefuellung-regel.mjs; Logik: src/lib/wartung/erstbefuellung.ts. Unter einer Postgres-Sperre
// wie die Migration (zwei Bauläufe gleichzeitig: der zweite wartet und findet den Merker bzw. widerruft die erste
// Einladung). Der Einladungslink erscheint nur in dieser Ausgabe (Bauprotokoll, nur für das Vercel-Team sichtbar).
import pg from 'pg';
import { holeDb } from '@/lib/db';
import { fuehreErstbefuellungAus } from '@/lib/wartung/erstbefuellung';
import { fuehreSeedsAus } from '../drizzle/seeds/alle';
import { einladungsBasis, erstbefuellungImBau } from './erstbefuellung-regel.mjs';

/** Fester Schlüssel der Sperre (neben 4242017 Migration und 4242018 Inhaltsstände). */
const SPERRE = 4_242_019;
const p = (text: string) => console.log(`[erstbefuellung] ${text}`);

async function main() {
  const plan = erstbefuellungImBau(process.env);
  if (plan.fehler.length) throw new Error(plan.fehler.join(' '));
  if (!plan.seed && !plan.einladung) return p('Nichts angefordert.');
  const basis = einladungsBasis(process.env);
  if (plan.einladung && !basis) throw new Error('Weder APP_URL noch VERCEL_PROJECT_PRODUCTION_URL gesetzt – kein Einladungslink möglich.');
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL fehlt.');
  // Wie scripts/migriere-mit-sperre.mjs: Die Sitzungssperre braucht eine direkte Verbindung. Ohne sie bleiben die Seeds
  // idempotent und die Einladung durch ihre Transaktionssperre geschützt; nur zwei gleichzeitige Bauläufe spielen dann ein.
  if (!process.env.DATABASE_URL_UNPOOLED && /-pooler\./.test(new URL(url).hostname))
    console.warn('[erstbefuellung] WARNUNG: Nur eine Pooler-Adresse vorhanden. Für die Sperre DATABASE_URL_UNPOOLED setzen.');
  const pool = new pg.Pool({ connectionString: url, max: 1 });
  const sperre = await pool.connect();
  try {
    await sperre.query('SELECT pg_advisory_lock($1)', [SPERRE]);
    const e = await fuehreErstbefuellungAus(holeDb(), plan, { seeds: fuehreSeedsAus, basis: basis ?? '' });
    if (e.seed === 'eingespielt') p('Seeds eingespielt, Merker gesetzt. ERSTBEFUELLUNG kann jetzt aus den Umgebungsvariablen.');
    if (e.seed === 'schon_erfolgt') p('Seeds schon früher eingespielt (Merker vorhanden) – nichts zu tun.');
    if (e.seed === 'konten_vorhanden')
      p(
        'Die Datenbank hat schon Konten – keine Seeds (sie brächten Gelöschtes zurück), nur den Merker gesetzt. ERSTBEFUELLUNG kann aus den Umgebungsvariablen.',
      );
    if (e.einladung.art === 'konto_vorhanden') {
      if (e.einladung.widerrufen) p(`${e.einladung.widerrufen} offene Bau-Einladung(en) widerrufen.`);
      p('Ein Konto mit Rolle Administration gibt es schon – keine Einladung. ERSTE_VERWALTUNG_* kann aus den Umgebungsvariablen.');
    }
    if (e.einladung.art === 'angelegt') {
      if (e.einladung.widerrufen) p(`${e.einladung.widerrufen} ältere Bau-Einladung(en) widerrufen – es gilt nur der Link unten.`);
      p(`Einladung für das erste Verwaltungskonto (Administration), einmal verwendbar, gültig bis ${e.einladung.laeuftAb.toISOString()}:`);
      p(e.einladung.link);
      p('Link öffnen, Passwort setzen, Zwei-Faktor-App einrichten; danach ERSTE_VERWALTUNG_* aus den Umgebungsvariablen löschen.');
    }
  } finally {
    await sperre.query('SELECT pg_advisory_unlock($1)', [SPERRE]).catch(() => {});
    sperre.release();
    await pool.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(`[erstbefuellung] FEHLER: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  });
