import 'server-only';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from '@/lib/auth/server';
import { db, schema } from '@/lib/db';
import { darf, organisationsFilter, type Aktion, type RollenZuweisung, type Ziel } from './matrix';

/** Fehler für fehlende Rechte. Die Meldung nennt keine Interna (S4). */
export class KeinRecht extends Error {
  constructor() {
    super('KEIN_RECHT');
    this.name = 'KeinRecht';
  }
}

export type Angemeldet = {
  benutzerId: string;
  name: string;
  email: string;
  rollen: RollenZuweisung[];
  zweiFaktorErfuellt: boolean;
};

async function ladeRollen(benutzerId: string): Promise<RollenZuweisung[]> {
  const zeilen = await db
    .select({ rolle: schema.rolleZuweisung.rolle, organisation: schema.rolleZuweisung.organisation })
    .from(schema.rolleZuweisung)
    .where(eq(schema.rolleZuweisung.benutzerId, benutzerId));
  return zeilen;
}

async function hatPasskey(benutzerId: string): Promise<boolean> {
  const zeile = await db.select({ id: schema.passkey.id }).from(schema.passkey).where(eq(schema.passkey.userId, benutzerId)).limit(1);
  return zeile.length > 0;
}

/** Aktuelle Sitzung (je Anfrage einmal geladen). null = nicht angemeldet. */
export const ladeAngemeldet = cache(async (): Promise<Angemeldet | null> => {
  const sitzung = await auth.api.getSession({ headers: await headers() });
  if (!sitzung) return null;
  const benutzerId = sitzung.user.id;
  const [rollen, passkeyVorhanden] = await Promise.all([ladeRollen(benutzerId), hatPasskey(benutzerId)]);
  // 2FA-Pflicht (K-06): TOTP aktiviert oder Passkey vorhanden. Better Auth lässt eine Sitzung mit
  // aktiviertem TOTP erst nach dem zweiten Faktor entstehen (Lichtung b).
  const zweiFaktorErfuellt = Boolean(sitzung.user.twoFactorEnabled) || passkeyVorhanden;
  return { benutzerId, name: sitzung.user.name, email: sitzung.user.email, rollen, zweiFaktorErfuellt };
});

/**
 * Für Verwaltungsseiten: verlangt Anmeldung und erfüllten zweiten Faktor, sonst Umleitung.
 * Für Server Actions `verlangeRecht` verwenden (wirft statt umzuleiten).
 */
export async function verlangeSitzung(): Promise<Angemeldet> {
  const a = await ladeAngemeldet();
  if (!a) redirect('/verwaltung/anmelden');
  if (!a.zweiFaktorErfuellt) redirect('/verwaltung/zwei-faktor');
  if (a.rollen.length === 0) redirect('/verwaltung/anmelden?keine-rolle=1');
  return a;
}

/** Für Seiten: Sitzung + Recht; ohne Recht → 403-Seite der Verwaltung. */
export async function verlangeSeitenRecht(aktion: Aktion, ziel?: Ziel): Promise<Angemeldet> {
  const a = await verlangeSitzung();
  if (!darf(a.rollen, aktion, ziel)) redirect('/verwaltung/kein-zugriff');
  return a;
}

/**
 * Für Server Actions und Route Handler: wirft `KeinRecht`, wenn nicht angemeldet, zweiter Faktor fehlt
 * oder die Rolle nicht reicht (S1). Muss die erste Anweisung jeder Verwaltungs-Action sein.
 */
export async function verlangeRecht(aktion: Aktion, ziel?: Ziel): Promise<Angemeldet> {
  const a = await ladeAngemeldet();
  if (!a || !a.zweiFaktorErfuellt || !darf(a.rollen, aktion, ziel)) throw new KeinRecht();
  return a;
}

export { darf, organisationsFilter };
