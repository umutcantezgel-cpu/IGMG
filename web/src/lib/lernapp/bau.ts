import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Bau-Kennung der Lern-App (PLAN §3.5, Versionierung der Hülle): Der Service Worker wird mit `?v=<kennung>` angemeldet
 * und nennt seinen Hüllen-Vorrat `igmg-lernapp-schale-v<kennung>`. Ein neuer Bau ändert die Adresse des Workers, der
 * Browser installiert ihn neu, und der alte Hüllen-Vorrat (Seiten und Programmteile des vorigen Baus) wird gelöscht.
 *
 * Quelle (die erste vorhandene):
 * 1. Commit des Vercel-Baus bzw. die Bereitstellung (Systemvariablen, beim Bau gesetzt), sonst `BAU_KENNUNG` (CI, Docker);
 * 2. ohne diese – lokale und Docker-Bauten – ein Hash des Bau-Manifests in `.next/` (Namen der Programmteile mit ihren
 *    Inhalts-Hashes; fehlt es, die `BUILD_ID`): So bekommt auch dort jeder Bau mit geändertem Programm eine neue Hülle,
 *    statt dass `…-schale-vlokal` nur wächst (Gegenprüfung L1);
 * 3. sonst „lokal“ (Tests, Entwicklung).
 * Nur Kleinbuchstaben und Ziffern, höchstens 12 Zeichen (der Worker prüft dasselbe Muster). Nur auf dem Server (Layout,
 * beim Bau vorgerendert); das Lesen ist vom Datei-Tracing ausgenommen (`turbopackIgnore`), sonst nähme der Bau das ganze
 * Projekt in die Server-Ausgabe.
 */
export function bauKennung(env: Readonly<Record<string, string | undefined>> = process.env, ordner = join(process.cwd(), '.next')): string {
  const bereinigt = (roh: string) =>
    roh
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 12);
  const ausUmgebung = bereinigt(env.VERCEL_GIT_COMMIT_SHA || env.VERCEL_DEPLOYMENT_ID || env.BAU_KENNUNG || '');
  if (ausUmgebung) return ausUmgebung;
  for (const datei of ['build-manifest.json', 'app-build-manifest.json', 'BUILD_ID']) {
    try {
      return createHash('sha256')
        .update(readFileSync(/*turbopackIgnore: true*/ join(/*turbopackIgnore: true*/ ordner, datei)))
        .digest('hex')
        .slice(0, 12);
    } catch {
      // nächste Quelle
    }
  }
  return 'lokal';
}
