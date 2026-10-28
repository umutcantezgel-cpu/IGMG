import { createHash, randomBytes } from 'node:crypto';
import type { Transaktion } from '@/lib/db';
import { einladung, type EinladungGemeindeRolle, type EinladungRolle } from '@/lib/db/schema/rechte';

/**
 * Einladung ohne Mail anlegen (Kommandozeile `pnpm verwaltung:einladen` und Erstbefüllung im Bau, E-047): Der Link entsteht
 * nur hier und wird nur ausgegeben; gespeichert wird nur der SHA-256-Hash des Tokens (K-06). Ohne `server-only`, damit das
 * Skript `scripts/einladen.ts` das Modul auch ohne `--conditions=react-server` laden kann.
 */
export type NeueEinladung = {
  email: string;
  name: string;
  rollen: EinladungRolle[];
  gemeindeRollen?: EinladungGemeindeRolle[];
  stunden: number;
  erstelltVon: string;
};

export async function legeEinladungAn(
  db: Pick<Transaktion, 'insert'>,
  e: NeueEinladung,
  jetzt = new Date(),
): Promise<{ id: string; token: string; laeuftAb: Date }> {
  const token = randomBytes(32).toString('base64url');
  const laeuftAb = new Date(jetzt.getTime() + e.stunden * 3_600_000);
  const [zeile] = await db
    .insert(einladung)
    .values({
      email: e.email,
      name: e.name,
      rollen: e.rollen,
      gemeindeRollen: e.gemeindeRollen ?? [],
      tokenHash: createHash('sha256').update(token, 'utf8').digest('hex'),
      laeuftAb,
      erstelltVon: e.erstelltVon,
    })
    .returning({ id: einladung.id });
  return { id: zeile.id, token, laeuftAb };
}

/** Link der Einladung: mit Verwaltungsrolle in die Verwaltung, sonst auf die Einladungsseite der Website (ADR 0026). */
export function einladungsLink(basis: string, token: string, verwaltung: boolean): string {
  return `${basis.replace(/\/+$/, '')}${verwaltung ? '/verwaltung/einladung/' : '/einladung/'}${token}`;
}
