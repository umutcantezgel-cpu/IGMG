import 'server-only';

/**
 * Adresse der anfragenden Person für Ratenbegrenzungen (S3). Genutzt wird der **letzte** Eintrag von
 * X-Forwarded-For: Next.js bzw. der vorgeschaltete Proxy hängt die tatsächliche Gegenstelle an; frühere Einträge
 * kann der Client frei setzen (Befund SP-P3 M3). Ohne Header: „unbekannt“ (gemeinsames Limit).
 * Die Adresse wird nie gespeichert, nur als HMAC (src/lib/validierung/ratenbegrenzung.ts).
 */
export function clientAdresse(h: Headers): string {
  const kette = h.get('x-forwarded-for');
  if (kette) {
    const letzte = kette
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .at(-1);
    if (letzte) return letzte;
  }
  return h.get('x-real-ip')?.trim() || 'unbekannt';
}
