/**
 * Bau-Kennung der Lern-App (PLAN §3.5, Versionierung der Hülle): Der Service Worker wird mit `?v=<kennung>` angemeldet
 * und nennt seinen Hüllen-Vorrat `igmg-lernapp-schale-v<kennung>`. Ein neuer Bau ändert die Adresse des Workers, der
 * Browser installiert ihn neu, und der alte Hüllen-Vorrat (Seiten und Programmteile des vorigen Baus) wird gelöscht.
 * Quelle ist die Commit-Kennung des Vercel-Baus (Systemvariable, beim Bau gesetzt), sonst die Bereitstellung, lokal
 * „lokal“. Nur Kleinbuchstaben und Ziffern, höchstens 12 Zeichen (der Worker prüft dasselbe Muster).
 */
export function bauKennung(env: Readonly<Record<string, string | undefined>> = process.env): string {
  const roh = env.VERCEL_GIT_COMMIT_SHA || env.VERCEL_DEPLOYMENT_ID || '';
  return (
    roh
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 12) || 'lokal'
  );
}
