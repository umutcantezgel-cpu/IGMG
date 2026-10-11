import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

/** Legt über das Kommandozeilen-Skript eine Einladung an und gibt E-Mail und Token zurück (nur Testdaten, G-04). */
export function erzeugeEinladung(rolle = 'administration', organisation?: string) {
  const email = `testperson.${randomBytes(4).toString('hex')}@example.test`;
  const args = ['-s', 'verwaltung:einladen', '--email', email, '--name', 'Testperson Eins', '--rolle', rolle, '--nur_token'];
  if (organisation) args.push('--organisation', organisation);
  const token = execFileSync('pnpm', args, { cwd: process.cwd(), encoding: 'utf8' }).trim().split('\n').pop() ?? '';
  return { email, token };
}

export const TESTPASSWORT = 'Testpasswort-Eins-2026';
