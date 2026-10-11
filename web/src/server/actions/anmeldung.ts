'use server';

import { eq } from 'drizzle-orm';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { auth } from '@/lib/auth/server';
import { db, schema } from '@/lib/db';
import { ladeAngemeldet } from '@/lib/rechte/pruefe';
import { clientAdresse } from '@/lib/sicherheit/ip';
import { pruefeRate, type Grenze } from '@/lib/validierung/ratenbegrenzung';
import { ladeGueltigeEinladung } from '@/server/queries/einladung';

/**
 * Anmeldung, Zwei-Faktor und Einladung (F09, ADR 0003). Öffentlich erreichbar, daher:
 * keine Details in Fehlermeldungen (S4), eigene Ratenbegrenzung je IP und Konto (`begrenzt`, S3), Zod (S2).
 * Better-Auth-Endpunkte für Anmeldung und Zwei-Faktor sind über HTTP gesperrt (src/lib/auth/optionen.ts).
 * Fehlermeldungen sind Schlüssel im Namensraum `verwaltung` (K-02).
 */
export type FormularZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, string>;
  totp?: { uri: string; geheimnis: string; ersatzcodes: string[] };
  ok?: boolean;
};

const anmeldeSchema = z.object({
  email: z.email().max(254),
  passwort: z.string().min(1).max(128),
});

/**
 * Ratenbegrenzung der öffentlichen Anmeldeschritte (S3, Befund SP-P3 H2): je IP und – bei der Anmeldung –
 * zusätzlich je Konto (E-Mail), damit verteilte Versuche gegen ein Konto ebenfalls gebremst werden.
 */
const GRENZE_IP: Grenze = { max: 10, fensterSekunden: 600 };
const GRENZE_KONTO: Grenze = { max: 8, fensterSekunden: 900 };

async function begrenzt(schritt: string, konto?: string): Promise<boolean> {
  const ip = clientAdresse(await headers());
  const je = await pruefeRate(`verwaltung-${schritt}`, ip, GRENZE_IP);
  if (!je.erlaubt) return true;
  if (konto) {
    const k = await pruefeRate(`verwaltung-${schritt}-konto`, konto.trim().toLowerCase(), GRENZE_KONTO);
    if (!k.erlaubt) return true;
  }
  return false;
}

function istZuViele(e: unknown): boolean {
  return e instanceof APIError && (e.statusCode === 429 || e.status === 'TOO_MANY_REQUESTS');
}

export async function anmelden(_vorher: FormularZustand, daten: FormData): Promise<FormularZustand> {
  const eingabe = anmeldeSchema.safeParse({ email: daten.get('email'), passwort: daten.get('passwort') });
  const email = String(daten.get('email') ?? '');
  if (!eingabe.success) return { fehler: 'anmelden.fehler', werte: { email } };
  if (await begrenzt('anmelden', eingabe.data.email)) {
    await protokolliere({ benutzerId: null, aktion: 'anmeldung.fehlgeschlagen', details: { grund: 'ratenbegrenzung' } });
    return { fehler: 'anmelden.zuViele', werte: { email } };
  }
  let ergebnis: unknown;
  try {
    ergebnis = await auth.api.signInEmail({
      body: { email: eingabe.data.email, password: eingabe.data.passwort },
      headers: await headers(),
    });
  } catch (e) {
    await protokolliere({ benutzerId: null, aktion: 'anmeldung.fehlgeschlagen' });
    return { fehler: istZuViele(e) ? 'anmelden.zuViele' : 'anmelden.fehler', werte: { email } };
  }
  if (ergebnis && typeof ergebnis === 'object' && 'twoFactorRedirect' in ergebnis && ergebnis.twoFactorRedirect) {
    redirect('/verwaltung/anmelden/zwei-faktor');
  }
  const angemeldet = await ladeAngemeldet();
  if (angemeldet) await protokolliere({ benutzerId: angemeldet.benutzerId, aktion: 'anmeldung.erfolg', details: { zweiFaktor: false } });
  // Kein zweiter Faktor eingerichtet → Einrichtung ist Pflicht (K-06)
  redirect('/verwaltung/zwei-faktor');
}

const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/) });
const ersatzcodeSchema = z.object({ code: z.string().trim().min(6).max(32) });

export async function zweiFaktorPruefen(_vorher: FormularZustand, daten: FormData): Promise<FormularZustand> {
  const ersatz = daten.get('art') === 'ersatzcode';
  const roh = String(daten.get('code') ?? '').replace(/\s+/g, '');
  const eingabe = ersatz ? ersatzcodeSchema.safeParse({ code: roh }) : codeSchema.safeParse({ code: roh });
  if (!eingabe.success) return { feldFehler: { code: 'zweiFaktor.fehler' } };
  if (await begrenzt('zwei-faktor')) return { fehler: 'anmelden.zuViele', feldFehler: { code: 'zweiFaktor.fehler' } };
  try {
    const h = await headers();
    if (ersatz) await auth.api.verifyBackupCode({ body: { code: eingabe.data.code }, headers: h });
    else await auth.api.verifyTOTP({ body: { code: eingabe.data.code }, headers: h });
  } catch (e) {
    await protokolliere({ benutzerId: null, aktion: 'anmeldung.fehlgeschlagen', details: { schritt: 'zwei_faktor' } });
    return { fehler: istZuViele(e) ? 'anmelden.zuViele' : 'zweiFaktor.fehler', feldFehler: { code: 'zweiFaktor.fehler' } };
  }
  const angemeldet = await ladeAngemeldet();
  if (angemeldet)
    await protokolliere({
      benutzerId: angemeldet.benutzerId,
      aktion: 'anmeldung.erfolg',
      details: { zweiFaktor: true, ersatzcode: ersatz },
    });
  redirect('/verwaltung');
}

export async function zweiFaktorStarten(_vorher: FormularZustand, daten: FormData): Promise<FormularZustand> {
  const angemeldet = await ladeAngemeldet();
  if (!angemeldet) redirect('/verwaltung/anmelden');
  const p = z.object({ passwort: z.string().min(1).max(128) }).safeParse({ passwort: daten.get('passwort') });
  if (!p.success) return { feldFehler: { passwort: 'zweiFaktorEinrichten.fehlerPasswort' } };
  const passwort = p.data.passwort;
  if (await begrenzt('zwei-faktor-einrichten', angemeldet.email))
    return { fehler: 'anmelden.zuViele', feldFehler: { passwort: 'zweiFaktorEinrichten.fehlerPasswort' } };
  try {
    const r = await auth.api.enableTwoFactor({ body: { password: passwort, method: 'totp' }, headers: await headers() });
    if (r.method !== 'totp') return { feldFehler: { passwort: 'zweiFaktorEinrichten.fehlerPasswort' } };
    const geheimnis = new URL(r.totpURI).searchParams.get('secret') ?? '';
    return { totp: { uri: r.totpURI, geheimnis, ersatzcodes: r.backupCodes } };
  } catch (e) {
    return { fehler: istZuViele(e) ? 'anmelden.zuViele' : undefined, feldFehler: { passwort: 'zweiFaktorEinrichten.fehlerPasswort' } };
  }
}

export async function zweiFaktorBestaetigen(vorher: FormularZustand, daten: FormData): Promise<FormularZustand> {
  const angemeldet = await ladeAngemeldet();
  if (!angemeldet) redirect('/verwaltung/anmelden');
  const eingabe = codeSchema.safeParse({ code: String(daten.get('code') ?? '').replace(/\s+/g, '') });
  if (!eingabe.success) return { ...vorher, feldFehler: { code: 'zweiFaktorEinrichten.fehlerCode' } };
  if (await begrenzt('zwei-faktor-einrichten', angemeldet.email)) return { ...vorher, fehler: 'anmelden.zuViele' };
  try {
    await auth.api.verifyTOTP({ body: { code: eingabe.data.code }, headers: await headers() });
  } catch {
    return { ...vorher, feldFehler: { code: 'zweiFaktorEinrichten.fehlerCode' } };
  }
  await protokolliere({ benutzerId: angemeldet.benutzerId, aktion: 'zwei_faktor.eingerichtet' });
  redirect('/verwaltung');
}

export async function abmelden(): Promise<void> {
  const angemeldet = await ladeAngemeldet();
  await auth.api.signOut({ headers: await headers() });
  if (angemeldet) await protokolliere({ benutzerId: angemeldet.benutzerId, aktion: 'abmeldung' });
  redirect('/verwaltung/anmelden?abgemeldet=1');
}

const einladungSchema = z
  .object({
    token: z.string().min(20).max(100),
    passwort: z.string().min(12).max(128),
    wiederholung: z.string(),
  })
  .refine((d) => d.passwort === d.wiederholung, { path: ['wiederholung'], message: 'einladung.fehlerPasswortGleich' });

export async function einladungAnnehmen(_vorher: FormularZustand, daten: FormData): Promise<FormularZustand> {
  const eingabe = einladungSchema.safeParse({
    token: daten.get('token'),
    passwort: daten.get('passwort'),
    wiederholung: daten.get('wiederholung'),
  });
  if (!eingabe.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of eingabe.error.issues) {
      const feld = String(f.path[0] ?? '');
      if (feld === 'passwort') feldFehler.passwort = 'einladung.fehlerPasswortKurz';
      if (feld === 'wiederholung') feldFehler.wiederholung = 'einladung.fehlerPasswortGleich';
      if (feld === 'token') return { fehler: 'einladung.ungueltig' };
    }
    return { feldFehler };
  }
  if (await begrenzt('einladung')) return { fehler: 'anmelden.zuViele' };
  const einladung = await ladeGueltigeEinladung(eingabe.data.token);
  if (!einladung) return { fehler: 'einladung.ungueltig' };
  try {
    // Serverseitiger Aufruf ohne Request: der Registrierungs-Riegel (Hook) greift nur bei HTTP-Aufrufen.
    const r = await auth.api.signUpEmail({ body: { email: einladung.email, password: eingabe.data.passwort, name: einladung.name } });
    await db.transaction(async (tx) => {
      await tx.update(schema.user).set({ emailVerified: true }).where(eq(schema.user.id, r.user.id));
      for (const z of einladung.rollen) {
        await tx
          .insert(schema.rolleZuweisung)
          .values({ benutzerId: r.user.id, rolle: z.rolle, organisation: z.organisation ?? null, erstelltVon: einladung.erstelltVon });
      }
      await tx.update(schema.einladung).set({ angenommenAm: new Date() }).where(eq(schema.einladung.id, einladung.id));
      await protokolliere({ benutzerId: r.user.id, aktion: 'einladung.angenommen', zielTyp: 'einladung', zielId: einladung.id }, tx);
    });
  } catch {
    return { fehler: 'einladung.fehlerAllgemein' };
  }
  redirect('/verwaltung/anmelden?eingeladen=1');
}
