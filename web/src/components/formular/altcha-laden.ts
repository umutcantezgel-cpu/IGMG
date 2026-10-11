import 'altcha/external';
import 'altcha/altcha.css';

/**
 * CSP-feste ALTCHA-Variante (ADR 0005): `altcha/external` enthält weder Stile noch Worker. Die Stile kommen als
 * eigene CSS-Datei mit diesem nachgeladenen Modul, der Worker von der eigenen Herkunft (`worker-src 'self'`) –
 * das Standardpaket nutzt blob:-Worker, die die öffentliche CSP blockiert. Kopie: `pnpm altcha:kopieren`.
 */
const WORKER = '/altcha/pbkdf2.js';

for (const algorithmus of ['PBKDF2/SHA-256', 'PBKDF2/SHA-384', 'PBKDF2/SHA-512'])
  globalThis.$altcha.algorithms.set(algorithmus, () => new Worker(WORKER));
