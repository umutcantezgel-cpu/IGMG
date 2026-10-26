import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/** Angelegte Test-Rezitation (Ausgabe von `rezitation-anlegen.ts --json`). */
export type TestRezitation = {
  id: string;
  sure: number;
  verse: number;
  versMs: number;
  tonMs: number;
  name: { de: string; tr: string; en: string };
  rezitator: string;
  lizenz: string;
  audio: string;
  mime: string;
};

const SKRIPT = 'tests/e2e/hilfen/rezitation-anlegen.ts';

function tsx(argumente: string[]): string {
  const ausgabe = execFileSync(
    'pnpm',
    ['-s', 'exec', 'tsx', '--conditions=react-server', '--env-file-if-exists=.env', SKRIPT, ...argumente, '--json'],
    { cwd: process.cwd(), encoding: 'utf8' },
  );
  return ausgabe.trim().split('\n').pop() ?? '{}';
}

/**
 * Legt eine aktive Rezitation mit synthetischem Testton an (nach Vorbild `einladung.ts`: Kommandozeilen-Skript gegen die
 * Datenbank des Servers). Gegen einen Entwicklungsserver mit PGlite vorher anlegen und mit E2E_TESTREZITATION=<datei>
 * übergeben – dann legt die Hilfe nichts an und räumt nichts weg (`vorhanden: true`).
 */
export function legeTestRezitationAn(sure = 108): TestRezitation & { vorhanden: boolean } {
  if (process.env.E2E_TESTREZITATION) {
    return { ...(JSON.parse(readFileSync(process.env.E2E_TESTREZITATION, 'utf8')) as TestRezitation), vorhanden: true };
  }
  return { ...(JSON.parse(tsx(['--sure', String(sure)])) as TestRezitation), vorhanden: false };
}

/** Entfernt die Test-Rezitation samt Dateien, Zeiten und Vereinbarung (nur selbst angelegte). */
export function entferneTestRezitation(r: { id: string; vorhanden: boolean }): void {
  if (!r.vorhanden) tsx(['--entfernen', r.id]);
}

/**
 * Inhalts-Caches verfallen lassen (wie global-setup.ts), damit vorgerenderte Seiten die neue bzw. entfernte Rezitation
 * zeigen. Ohne WARTUNG_TOKEN (z. B. Entwicklungsserver ohne Token) wird nichts erneuert.
 *
 * `tags` (z. B. `[TAG.lernappKurs('koran')]`): nur diese Tags verfallen lassen. Mitten im parallelen Lauf ist das der Weg:
 * Alle Tags verfallen zu lassen baut die Kursverzeichnisse aller Richtungen kalt neu (je ≈ 10 s Rechenzeit, der Server
 * antwortet währenddessen kaum), und Tests im anderen Worker überschreiten ihre Wartezeiten (N5, Stufe C).
 */
export async function erneuereCaches(basis: string, tags: readonly string[] = []): Promise<void> {
  const token = process.env.WARTUNG_TOKEN;
  if (!token) return;
  const adresse = new URL('/api/wartung/cache-erneuern', basis);
  for (const tag of tags) adresse.searchParams.append('tag', tag);
  const antwort = await fetch(adresse, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
  });
  if (!antwort.ok) throw new Error(`Cache-Erneuerung abgelehnt: HTTP ${antwort.status} (WARTUNG_TOKEN prüfen)`);
}
