'use server';

import { and, eq, lt } from 'drizzle-orm';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { auth } from '@/lib/auth/server';
import { db, schema } from '@/lib/db';
import { meldeSicherheitsaenderung } from '@/lib/konto/sicherheitsmail';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { ladeAngemeldet } from '@/lib/rechte/pruefe';
import { basisUrl } from '@/lib/seo/metadaten';
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

/**
 * Unbestätigte Selbstregistrierung ohne jede Rolle? Solche Konten bekommen in der Verwaltung keine Sitzung (H-2 der
 * Sicherheitsprüfung S1): sonst könnte, wer eine fremde Adresse vorbelegt, schon vor der Bestätigung Zwei-Faktor
 * einrichten. Konten aus Einladungen haben Rollen und bleiben unberührt.
 */
async function unbestaetigtOhneRolle(email: string): Promise<boolean> {
  const [u] = await db
    .select({ id: schema.user.id, bestaetigt: schema.user.emailVerified })
    .from(schema.user)
    .where(eq(schema.user.email, email.trim().toLowerCase()))
    .limit(1);
  if (!u || u.bestaetigt) return false;
  const [r] = await db
    .select({ r: schema.rolleZuweisung.rolle })
    .from(schema.rolleZuweisung)
    .where(eq(schema.rolleZuweisung.benutzerId, u.id))
    .limit(1);
  const [g] = await db
    .select({ r: schema.gemeindeRolle.rolle })
    .from(schema.gemeindeRolle)
    .where(eq(schema.gemeindeRolle.benutzerId, u.id))
    .limit(1);
  return !r && !g;
}

export async function anmelden(_vorher: FormularZustand, daten: FormData): Promise<FormularZustand> {
  const eingabe = anmeldeSchema.safeParse({ email: daten.get('email'), passwort: daten.get('passwort') });
  const email = String(daten.get('email') ?? '');
  if (!eingabe.success) return { fehler: 'anmelden.fehler', werte: { email } };
  if (await begrenzt('anmelden', eingabe.data.email)) {
    await protokolliere({ benutzerId: null, aktion: 'anmeldung.fehlgeschlagen', details: { grund: 'ratenbegrenzung' } });
    return { fehler: 'anmelden.zuViele', werte: { email } };
  }
  if (await unbestaetigtOhneRolle(eingabe.data.email)) {
    await protokolliere({ benutzerId: null, aktion: 'anmeldung.fehlgeschlagen', details: { grund: 'unbestaetigt' } });
    return { fehler: 'anmelden.fehler', werte: { email } };
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
  // Passwort richtig, zweiter Faktor noch nicht eingerichtet: Die neue Sitzung steht erst in der Antwort (Cookie),
  // `ladeAngemeldet()` sähe sie in dieser Anfrage nicht – Konto-ID aus der Antwort nehmen (G-07: jede Anmeldung im Audit-Log)
  const benutzerId = ergebnis && typeof ergebnis === 'object' && 'user' in ergebnis ? (ergebnis.user as { id?: unknown }).id : undefined;
  if (typeof benutzerId === 'string') await protokolliere({ benutzerId, aktion: 'anmeldung.erfolg', details: { zweiFaktor: false } });
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
  let ergebnis: unknown;
  try {
    const h = await headers();
    ergebnis = ersatz
      ? await auth.api.verifyBackupCode({ body: { code: eingabe.data.code }, headers: h })
      : await auth.api.verifyTOTP({ body: { code: eingabe.data.code }, headers: h });
  } catch (e) {
    await protokolliere({ benutzerId: null, aktion: 'anmeldung.fehlgeschlagen', details: { schritt: 'zwei_faktor' } });
    return { fehler: istZuViele(e) ? 'anmelden.zuViele' : 'zweiFaktor.fehler', feldFehler: { code: 'zweiFaktor.fehler' } };
  }
  // Wie beim Passwortschritt: Die Sitzung steht erst in der Antwort – Konto-ID aus dem Ergebnis (Tor B/C M7)
  const benutzerId = ergebnis && typeof ergebnis === 'object' && 'user' in ergebnis ? (ergebnis.user as { id?: unknown }).id : undefined;
  if (typeof benutzerId === 'string')
    await protokolliere({ benutzerId, aktion: 'anmeldung.erfolg', details: { zweiFaktor: true, ersatzcode: ersatz } });
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
  const beginn = new Date();
  try {
    await auth.api.verifyTOTP({ body: { code: eingabe.data.code }, headers: await headers() });
  } catch {
    return { ...vorher, feldFehler: { code: 'zweiFaktorEinrichten.fehlerCode' } };
  }
  // Better Auth ersetzt nur diese Sitzung; ältere (ohne Faktor entstandene) enden jetzt (N-1 der Prüfung S1)
  await db.delete(schema.session).where(and(eq(schema.session.userId, angemeldet.benutzerId), lt(schema.session.createdAt, beginn)));
  await protokolliere({ benutzerId: angemeldet.benutzerId, aktion: 'zwei_faktor.eingerichtet' });
  // Sicherheitshinweis an die Kontoadresse (ohne Geheimnisse); Versand nach der Antwort
  const benutzerId = angemeldet.benutzerId;
  after(async () => {
    if (await meldeSicherheitsaenderung(benutzerId, 'zwei_faktor').catch(() => false)) await versendeOffeneMails().catch(() => undefined);
  });
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
      // Gemeinde-Rollen (Mein Bereich, ADR 0026), falls die Einladung welche trägt
      for (const rolle of einladung.gemeindeRollen) {
        await tx
          .insert(schema.gemeindeRolle)
          .values({ benutzerId: r.user.id, rolle, erstelltVon: einladung.erstelltVon })
          .onConflictDoNothing();
      }
      await tx.update(schema.einladung).set({ angenommenAm: new Date() }).where(eq(schema.einladung.id, einladung.id));
      await protokolliere({ benutzerId: r.user.id, aktion: 'einladung.angenommen', zielTyp: 'einladung', zielId: einladung.id }, tx);
    });
  } catch {
    return { fehler: 'einladung.fehlerAllgemein' };
  }
  redirect('/verwaltung/anmelden?eingeladen=1');
}

const vergessenSchema = z.object({ email: z.string().trim().toLowerCase().max(254).pipe(z.email()) });

/**
 * Passwort vergessen (C12, M-092): immer dieselbe Antwort, ob es das Konto gibt oder nicht (keine Kontenaufzählung).
 * Better Auth legt den Link an und ruft `sendResetPassword` (Mail-Ausgang, gesperrte Konten ausgenommen).
 */
export async function passwortVergessen(_vorher: FormularZustand, daten: FormData): Promise<FormularZustand> {
  const eingabe = vergessenSchema.safeParse({ email: daten.get('email') });
  if (!eingabe.success) return { feldFehler: { email: 'passwortVergessen.fehlerEmail' } };
  if (await begrenzt('passwort-vergessen', eingabe.data.email)) return { fehler: 'anmelden.zuViele' };
  // Link erzeugen und Mail planen erst nach der Antwort (Tor B/C N1): Für bekannte Konten schreibt Better Auth einen
  // Eintrag und plant die Mail, für unbekannte nicht – die Antwortzeit verriete sonst, ob es das Konto gibt.
  const email = eingabe.data.email;
  after(async () => {
    try {
      await auth.api.requestPasswordReset({ body: { email, redirectTo: `${basisUrl()}/verwaltung/passwort-neu` } });
    } catch {
      // Antwort bleibt gleich – Fehler werden nicht nach außen gegeben
    }
    await versendeOffeneMails().catch(() => undefined);
  });
  return { ok: true };
}

const neuSchema = z
  .object({ token: z.string().min(10).max(100), passwort: z.string().min(12).max(128), wiederholung: z.string() })
  .refine((d) => d.passwort === d.wiederholung, { path: ['wiederholung'], message: 'passwortNeu.fehlerGleich' });

/** Neues Passwort mit dem Link aus der Mail; alle Sitzungen enden (revokeSessionsOnPasswordReset), 2FA bleibt Pflicht. */
export async function passwortNeuSetzen(_vorher: FormularZustand, daten: FormData): Promise<FormularZustand> {
  const eingabe = neuSchema.safeParse({
    token: daten.get('token'),
    passwort: daten.get('passwort'),
    wiederholung: daten.get('wiederholung'),
  });
  if (!eingabe.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of eingabe.error.issues) {
      const feld = String(f.path[0] ?? '');
      if (feld === 'token') return { fehler: 'passwortNeu.ungueltig' };
      if (feld === 'passwort') feldFehler.passwort = 'passwortNeu.fehlerKurz';
      if (feld === 'wiederholung') feldFehler.wiederholung = 'passwortNeu.fehlerGleich';
    }
    return { feldFehler };
  }
  if (await begrenzt('passwort-neu')) return { fehler: 'anmelden.zuViele' };
  try {
    await auth.api.resetPassword({ body: { newPassword: eingabe.data.passwort, token: eingabe.data.token } });
  } catch {
    return { fehler: 'passwortNeu.ungueltig' };
  }
  redirect('/verwaltung/anmelden?passwort=neu');
}
