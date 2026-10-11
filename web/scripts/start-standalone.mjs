// Startet den Produktions-Server aus dem standalone-Build (K-19) – wie im Docker-Image:
// kopiert public/ und .next/static/ neben server.js und startet ihn. Aufruf: pnpm start:standalone
// HOSTNAME muss 0.0.0.0 sein (wie im Docker-Image): Bei abweichendem Hostnamen behandelt Next.js die
// Sprach-Rewrites von next-intl als externe Ziele und es entsteht eine Weiterleitungsschleife.
import { cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const wurzel = join(import.meta.dirname, '..');
const standalone = join(wurzel, '.next', 'standalone');
if (!existsSync(join(standalone, 'server.js'))) {
  console.error('Kein standalone-Build gefunden. Bitte zuerst `pnpm build` ausführen.');
  process.exit(1);
}
cpSync(join(wurzel, 'public'), join(standalone, 'public'), { recursive: true });
cpSync(join(wurzel, '.next', 'static'), join(standalone, '.next', 'static'), { recursive: true });
const args = existsSync(join(wurzel, '.env')) ? [`--env-file=${join(wurzel, '.env')}`] : [];
const kind = spawn(process.execPath, [...args, join(standalone, 'server.js')], {
  stdio: 'inherit',
  env: { ...process.env, HOSTNAME: process.env.HOSTNAME ?? '0.0.0.0' },
});
kind.on('exit', (code) => process.exit(code ?? 0));
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => kind.kill(s));
