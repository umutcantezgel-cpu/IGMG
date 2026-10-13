import { connection } from 'next/server';
import { meldeAb } from '@/lib/newsletter/dienst';
import { newsletterZiel } from '@/lib/newsletter/ziel';

/**
 * Abmeldelink aus jeder Newsletter-Mail (AUFTRAG 3.10): löscht die Anmeldung sofort und leitet auf
 * /newsletter#abgemeldet. Ein schon benutzter Link führt ebenfalls dorthin (die Adresse ist ja gelöscht) – die Antwort
 * verrät nicht, ob es die Anmeldung gab. POST für „List-Unsubscribe-Post“ (RFC 8058) wirkt gleich.
 */
async function abmelden(anfrage: Request): Promise<Response> {
  await connection();
  const url = new URL(anfrage.url);
  await meldeAb(url.searchParams.get('token') ?? '');
  return newsletterZiel(url.searchParams.get('sprache'), 'abgemeldet');
}

export async function GET(anfrage: Request) {
  return abmelden(anfrage);
}

export async function POST(anfrage: Request) {
  return abmelden(anfrage);
}
