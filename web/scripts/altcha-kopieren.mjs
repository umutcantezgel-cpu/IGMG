// Kopiert den PBKDF2-Worker von ALTCHA nach public/altcha/ (ADR 0005, CSP worker-src 'self'):
// Das Standardpaket startet seine Worker aus blob:-Adressen, die die öffentliche CSP verbietet; `altcha/external`
// lädt sie stattdessen von der eigenen Herkunft. Nach jedem Update von altcha ausführen: pnpm altcha:kopieren
// (tests/unit/altcha-worker.test.ts schlägt fehl, solange die Kopie veraltet ist).
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const wurzel = join(import.meta.dirname, '..');
const paket = join(wurzel, 'node_modules', 'altcha');
const ziel = join(wurzel, 'public', 'altcha');
mkdirSync(ziel, { recursive: true });
copyFileSync(join(paket, 'dist', 'workers', 'pbkdf2.js'), join(ziel, 'pbkdf2.js'));
copyFileSync(join(paket, 'LICENSE.txt'), join(ziel, 'LICENSE.txt'));
const { version } = JSON.parse(readFileSync(join(paket, 'package.json'), 'utf8'));
console.log(`ALTCHA ${version}: Worker pbkdf2.js und Lizenz nach public/altcha/ kopiert`);
