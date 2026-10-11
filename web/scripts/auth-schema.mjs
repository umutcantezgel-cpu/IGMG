// Erzeugt src/lib/db/schema/auth.ts mit der Better-Auth-CLI und stellt alle Zeitstempel auf
// `timestamp with time zone` um (K-05: Zeitstempel in UTC, unabhängig von der Server-Zeitzone).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const wurzel = join(import.meta.dirname, '..');
const ziel = join(wurzel, 'src/lib/db/schema/auth.ts');
execFileSync(
  'pnpm',
  ['exec', 'better-auth', 'generate', '--config', 'scripts/auth-schema.config.ts', '--output', 'src/lib/db/schema/auth.ts', '--yes'],
  { cwd: wurzel, stdio: 'inherit' },
);
let s = readFileSync(ziel, 'utf8');
s = s.replace(/timestamp\("([a-z_]+)"\)/g, 'timestamp("$1", { withTimezone: true })');
s = `// Erzeugt mit \`pnpm auth:schema\` (Better-Auth-CLI + Zeitzonen-Nachbearbeitung). Nicht von Hand ändern.\n${s}`;
writeFileSync(ziel, s);
console.log('auth.ts aktualisiert');
