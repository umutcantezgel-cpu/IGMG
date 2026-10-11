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
