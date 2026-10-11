import 'server-only';
import { gleich } from '@/lib/krypto';

/**
 * Zugang zu Wartungsrouten (Cache-Erneuerung, Löschfristen): `Authorization: Bearer <WARTUNG_TOKEN>`.
 * Ohne gesetztes Token (mind. 32 Zeichen) ist jede Wartungsroute gesperrt. Vergleich in konstanter Zeit.
 */
export function wartungErlaubt(anfrage: Request): boolean {
  const token = process.env.WARTUNG_TOKEN ?? '';
  if (token.length < 32) return false;
  return gleich(anfrage.headers.get('authorization') ?? '', `Bearer ${token}`);
}

/**
 * Zugang für Vercel Cron Jobs: Vercel schickt `GET` mit `Authorization: Bearer <CRON_SECRET>`.
 * Dieselben Regeln wie bei `wartungErlaubt`: CRON_SECRET mind. 32 Zeichen, sonst gesperrt; Vergleich in konstanter Zeit.
 * Das WARTUNG_TOKEN öffnet diesen Weg nicht, und das CRON_SECRET öffnet nicht die POST-Wege.
 */
export function cronErlaubt(anfrage: Request): boolean {
  const geheimnis = process.env.CRON_SECRET ?? '';
  if (geheimnis.length < 32) return false;
  return gleich(anfrage.headers.get('authorization') ?? '', `Bearer ${geheimnis}`);
}
