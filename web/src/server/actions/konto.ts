'use server';

import { and, eq } from 'drizzle-orm';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { auth } from '@/lib/auth/server';
import { funktionAn } from '@/lib/funktionen';
import { db, schema } from '@/lib/db';
import { pruefeEinsendung } from '@/lib/formulare/verarbeiten';
import { pruefeBenutzername } from '@/lib/konto/benutzername';
import { nimmEinladungAn, uebernimmEinladung } from '@/lib/konto/einladung';
import { KONTO_EINWILLIGUNG_VERSION, textVersion } from '@/lib/konto/einwilligung';
import { PASSWORT_MIN } from '@/lib/konto/passwort-staerke';
import { istKinderAdresse, sichererRuecksprung } from '@/lib/konto/regeln';
import { bestaetigeKonto, legeRegistrierungAn } from '@/lib/konto/registrierung';
import { verlangeKontenAktion, zielNachAnmeldung } from '@/lib/konto/zugang';
import { istUnzustellbar } from '@/lib/mail/adresse';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { ladeKonto } from '@/lib/rechte/gemeinde';
import { basisUrl } from '@/lib/seo/metadaten';
import { clientAdresse } from '@/lib/sicherheit/ip';
import { pruefeRate, type Grenze } from '@/lib/validierung/ratenbegrenzung';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import konto from '../../../messages/bereiche/konto.json';

/**
 * Konto-Einstieg der Website (ADR 0026): Anmeldung (E-Mail, Kinderzugang, zweiter Faktor, Passkey), Registrierung,
 * Bestätigung, Einladung, Passwort vergessen/neu, Abmelden. Öffentlich erreichbar, daher in jeder Action:
 * Funktionsschalter (`konten`), eigene Ratenbegrenzung je IP und Konto (auth.api umgeht die von Better Auth, S3),
 * Zod, keine Details in Fehlern (S4), keine Auskunft, ob es ein Konto gibt. CSRF: Server Actions (Origin-Prüfung von
 * Next.js). Fehler sind Schlüssel im Namensraum `konto`.
 */
export type KontoZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, string>;
  ok?: boolean;
  /** Zähler je Antwort: Formulare mit ALTCHA binden das Widget neu (Lösungen sind einmalig). */
  versuch?: number;
};

const spracheSchema = z.enum(['de', 'tr', 'en']);
const sprachAus = (fd: FormData): Locale => spracheSchema.catch('de').parse(fd.get('sprache'));
const weiterAus = (fd: FormData): string | null => sichererRuecksprung(fd.get('weiter'));

const GRENZE_IP: Grenze = { max: 10, fensterSekunden: 600 };
const GRENZE_KONTO: Grenze = { max: 8, fensterSekunden: 900 };

/** true = zu viele Versuche (je IP und – falls angegeben – je Konto: E-Mail-Adresse oder Benutzername). */
async function begrenzt(schritt: string, konto?: string): Promise<boolean> {
  const ip = clientAdresse(await headers());
  if (!(await pruefeRate(`konto-${schritt}`, ip, GRENZE_IP)).erlaubt) return true;
  if (konto && !(await pruefeRate(`konto-${schritt}-konto`, konto.trim().toLowerCase(), GRENZE_KONTO)).erlaubt) return true;
  return false;
}

function istZuViele(e: unknown): boolean {
  return e instanceof APIError && (e.statusCode === 429 || e.status === 'TOO_MANY_REQUESTS');
}

function benutzerAus(ergebnis: unknown): { id: string; emailVerified?: boolean } | null {
  if (!ergebnis || typeof ergebnis !== 'object' || !('user' in ergebnis)) return null;
  const u = ergebnis.user as { id?: unknown; emailVerified?: unknown };
  return typeof u.id === 'string' ? { id: u.id, emailVerified: u.emailVerified === true } : null;
}

/** Wortlaut der Datenschutz-Einwilligung genau wie angezeigt (Quelle der Textversion). */
function einwilligungsVersion(sprache: Locale): string {
  return textVersion(KONTO_EINWILLIGUNG_VERSION, konto[sprache].konto.einwilligung.text);
}

// ───────────────────────────── Anmeldung ─────────────────────────────

const anmeldeSchema = z.object({ email: z.email().max(254), passwort: z.string().min(1).max(128) });

export async function kontoAnmelden(_vorher: KontoZustand, daten: FormData): Promise<KontoZustand> {
  await verlangeKontenAktion();
  const sprache = sprachAus(daten);
  const email = String(daten.get('email') ?? '').trim();
  const eingabe = anmeldeSchema.safeParse({ email, passwort: daten.get('passwort') });
  // Kinderkonten melden sich nur mit Benutzernamen an
  if (!eingabe.success || istKinderAdresse(email)) return { fehler: 'anmelden.fehler', werte: { email } };
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
  const weiter = weiterAus(daten);
  if (ergebnis && typeof ergebnis === 'object' && 'twoFactorRedirect' in ergebnis && ergebnis.twoFactorRedirect) {
    redirect(pfadFuer({ pathname: '/anmelden', query: { schritt: 'zwei-faktor', ...(weiter ? { weiter } : {}) } }, sprache));
  }
  const benutzer = benutzerAus(ergebnis);
  if (!benutzer) return { fehler: 'anmelden.fehler', werte: { email } };
  // Registriert, aber Adresse noch nicht bestätigt: keine Sitzung (das Passwort war richtig – kein Aufzählungsrisiko)
  if (!benutzer.emailVerified) {
    await db.delete(schema.session).where(eq(schema.session.userId, benutzer.id));
    return { fehler: 'anmelden.unbestaetigt', werte: { email } };
  }
  await protokolliere({ benutzerId: benutzer.id, aktion: 'anmeldung.erfolg', details: { zweiFaktor: false, weg: 'gemeinde' } });
  redirect(await zielNachAnmeldung(benutzer.id, sprache, weiter));
}

const kinderSchema = z.object({ benutzername: z.string().min(1).max(64), passwort: z.string().min(1).max(128) });

/** Kinderzugang: Benutzername + Passwort, nur über diese Action (HTTP-Endpunkt gesperrt), Rate je Konto und IP. */
export async function kinderAnmelden(_vorher: KontoZustand, daten: FormData): Promise<KontoZustand> {
  await verlangeKontenAktion();
  const sprache = sprachAus(daten);
  const roh = String(daten.get('benutzername') ?? '');
  const eingabe = kinderSchema.safeParse({ benutzername: roh, passwort: daten.get('passwort') });
  const name = pruefeBenutzername(roh);
  if (!eingabe.success || !name.ok) return { fehler: 'kinder.fehler', werte: { benutzername: roh.trim() } };
  if (await begrenzt('kinder', name.wert)) {
    await protokolliere({ benutzerId: null, aktion: 'anmeldung.fehlgeschlagen', details: { grund: 'ratenbegrenzung', weg: 'kind' } });
    return { fehler: 'anmelden.zuViele', werte: { benutzername: name.wert } };
  }
  let ergebnis: unknown;
  try {
    ergebnis = await auth.api.signInUsername({ body: { username: name.wert, password: eingabe.data.passwort }, headers: await headers() });
  } catch (e) {
    await protokolliere({ benutzerId: null, aktion: 'anmeldung.fehlgeschlagen', details: { weg: 'kind' } });
    return { fehler: istZuViele(e) ? 'anmelden.zuViele' : 'kinder.fehler', werte: { benutzername: name.wert } };
  }
  const benutzer = benutzerAus(ergebnis);
  if (!benutzer) return { fehler: 'kinder.fehler', werte: { benutzername: name.wert } };
  await protokolliere({ benutzerId: benutzer.id, aktion: 'anmeldung.erfolg', details: { zweiFaktor: false, weg: 'kind' } });
  redirect(pfadFuer('/mein-bereich', sprache));
}

const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/) });
const ersatzcodeSchema = z.object({ code: z.string().trim().min(6).max(32) });

/** Zweiter Faktor nach dem Passwortschritt (TOTP oder Ersatzcode). */
export async function kontoZweiFaktorPruefen(_vorher: KontoZustand, daten: FormData): Promise<KontoZustand> {
  await verlangeKontenAktion();
  const sprache = sprachAus(daten);
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
    await protokolliere({ benutzerId: null, aktion: 'anmeldung.fehlgeschlagen', details: { schritt: 'zwei_faktor', weg: 'gemeinde' } });
    return { fehler: istZuViele(e) ? 'anmelden.zuViele' : 'zweiFaktor.fehler', feldFehler: { code: 'zweiFaktor.fehler' } };
  }
  const benutzer = benutzerAus(ergebnis);
  if (!benutzer) return { fehler: 'zweiFaktor.abgelaufen' };
  await protokolliere({
    benutzerId: benutzer.id,
    aktion: 'anmeldung.erfolg',
    details: { zweiFaktor: true, ersatzcode: ersatz, weg: 'gemeinde' },
  });
  redirect(await zielNachAnmeldung(benutzer.id, sprache, weiterAus(daten)));
}

// ───────────────────────────── Passkey ─────────────────────────────

/** Schritt 1 der Passkey-Anmeldung: Optionen (Challenge im signierten Cookie). */
export async function passkeyAnmeldeOptionen(): Promise<{ optionen?: Record<string, unknown>; fehler?: string }> {
  await verlangeKontenAktion();
  if (await begrenzt('passkey')) return { fehler: 'anmelden.zuViele' };
  try {
    const optionen = await auth.api.generatePasskeyAuthenticationOptions({ headers: await headers() });
    return { optionen: optionen as unknown as Record<string, unknown> };
  } catch {
    return { fehler: 'passkey.fehler' };
  }
}

/**
 * Schritt 2: Antwort des Authenticators prüfen. Konten mit Verwaltungsrolle melden sich (noch) nicht per Passkey an:
 * Für die Verwaltung zählt ein Passkey nicht als zweiter Faktor (`pruefe.ts`, Befund SP-P3 H1) – die Sitzung wird
 * dann sofort beendet und auf E-Mail + Passwort + Code verwiesen.
 */
export async function passkeyAnmelden(antwort: string, sprache: string, weiterRoh?: string): Promise<{ fehler?: string }> {
  await verlangeKontenAktion();
  const ort = spracheSchema.catch('de').parse(sprache);
  if (await begrenzt('passkey')) return { fehler: 'anmelden.zuViele' };
  let response: Record<string, unknown>;
  try {
    response = z.record(z.string(), z.unknown()).parse(JSON.parse(antwort.slice(0, 20_000)));
  } catch {
    return { fehler: 'passkey.fehler' };
  }
  let ergebnis: unknown;
  try {
    ergebnis = await auth.api.verifyPasskeyAuthentication({ body: { response } as never, headers: await headers() });
  } catch {
    await protokolliere({ benutzerId: null, aktion: 'anmeldung.fehlgeschlagen', details: { weg: 'passkey' } });
    return { fehler: 'passkey.fehler' };
  }
  const benutzer = benutzerAus(ergebnis);
  if (!benutzer) return { fehler: 'passkey.fehler' };
  // Pflicht zum zweiten Faktor (Verwaltung, Lehrkraft, Gruppenleitung): ein Passkey ersetzt ihn nicht (M-3 der Prüfung S1)
  const [[verwaltung], [lehrkraft], [leitung]] = await Promise.all([
    db
      .select({ id: schema.rolleZuweisung.id })
      .from(schema.rolleZuweisung)
      .where(eq(schema.rolleZuweisung.benutzerId, benutzer.id))
      .limit(1),
    db
      .select({ r: schema.gemeindeRolle.rolle })
      .from(schema.gemeindeRolle)
      .where(and(eq(schema.gemeindeRolle.benutzerId, benutzer.id), eq(schema.gemeindeRolle.rolle, 'lehrkraft')))
      .limit(1),
    db
      .select({ g: schema.gruppenLeitung.gruppeId })
      .from(schema.gruppenLeitung)
      .where(eq(schema.gruppenLeitung.benutzerId, benutzer.id))
      .limit(1),
  ]);
  if (verwaltung || lehrkraft || leitung) {
    const token =
      ergebnis && typeof ergebnis === 'object' && 'session' in ergebnis ? (ergebnis.session as { token?: string }).token : undefined;
    if (token) await db.delete(schema.session).where(eq(schema.session.token, token));
    return { fehler: 'passkey.verwaltung' };
  }
  await protokolliere({ benutzerId: benutzer.id, aktion: 'anmeldung.erfolg', details: { zweiFaktor: false, weg: 'passkey' } });
  redirect(await zielNachAnmeldung(benutzer.id, ort, sichererRuecksprung(weiterRoh)));
}

// ───────────────────────────── Registrierung ─────────────────────────────

const registrierSchema = z.object({
  name: z.string().trim().min(2, 'name').max(80, 'name'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, 'email')
    .pipe(z.email('email'))
    .refine((e) => !istUnzustellbar(e), 'email'),
  passwort: z.string().min(PASSWORT_MIN, 'passwort').max(128, 'passwort'),
  einwilligung: z.literal('ja', 'einwilligung'),
});

/**
 * Registrierung (nur Gemeindemitglieder): Ratenbegrenzung → Honigtopf → ALTCHA → Zod (`pruefeEinsendung`). Danach
 * immer dieselbe Antwort; Konto und Mail entstehen erst nach der Antwort (gleiche Antwortzeit mit und ohne Konto).
 */
export async function registrieren(vorher: KontoZustand, daten: FormData): Promise<KontoZustand> {
  await verlangeKontenAktion();
  const sprache = sprachAus(daten);
  const versuch = (vorher.versuch ?? 0) + 1;
  const p = await pruefeEinsendung({
    kennung: 'registrierung',
    fd: daten,
    schema: registrierSchema,
    grenze: { max: 5, fensterSekunden: 3600 },
  });
  if (!p.ok) {
    if (p.ergebnis.status === 'erfolg') return { ok: true };
    const werte = { name: String(daten.get('name') ?? ''), email: String(daten.get('email') ?? '') };
    if (p.ergebnis.status !== 'fehler') return { fehler: 'registrieren.fehler.allgemein', werte, versuch };
    const fehler =
      p.ergebnis.fehler === 'zuViele'
        ? 'anmelden.zuViele'
        : p.ergebnis.fehler === 'altcha'
          ? 'registrieren.fehler.altcha'
          : 'registrieren.fehler.pruefen';
    const feldFehler = Object.fromEntries(
      Object.keys(p.ergebnis.feldFehler ?? {}).map((f) => [f, `registrieren.fehler.${f in registrierSchema.shape ? f : 'allgemein'}`]),
    );
    return { fehler, feldFehler, werte, versuch };
  }
  const { name, email, passwort } = p.daten;
  const einwilligung = einwilligungsVersion(sprache);
  after(async () => {
    try {
      await legeRegistrierungAn({ name, email, passwort, sprache, einwilligung });
    } catch {
      // Antwort bleibt gleich – Fehler werden nicht nach außen gegeben
    }
    await versendeOffeneMails().catch(() => undefined);
  });
  return { ok: true };
}

/** Bestätigung der Adresse mit dem Link aus der Mail (Klick auf „Bestätigen“, einmal gültig). */
export async function kontoBestaetigen(_vorher: KontoZustand, daten: FormData): Promise<KontoZustand> {
  await verlangeKontenAktion();
  const sprache = sprachAus(daten);
  if (await begrenzt('bestaetigen')) return { fehler: 'anmelden.zuViele' };
  const id = await bestaetigeKonto(String(daten.get('token') ?? ''), String(daten.get('passwort') ?? ''));
  if (id === 'passwort') return { fehler: 'bestaetigen.passwortFalsch' };
  if (!id) return { fehler: 'bestaetigen.ungueltig' };
  redirect(pfadFuer({ pathname: '/anmelden', query: { hinweis: 'bestaetigt' } }, sprache));
}

// ───────────────────────────── Einladung ─────────────────────────────

const einladungSchema = z
  .object({
    token: z.string().min(20).max(100),
    passwort: z.string().min(PASSWORT_MIN).max(128),
    wiederholung: z.string(),
    einwilligung: z.literal('ja'),
  })
  .refine((d) => d.passwort === d.wiederholung, { path: ['wiederholung'] });

/** Einladung annehmen (neues Konto): Passwort setzen, Einwilligung, Rollen aus der Einladung. */
export async function gemeindeEinladungAnnehmen(_vorher: KontoZustand, daten: FormData): Promise<KontoZustand> {
  await verlangeKontenAktion();
  const sprache = sprachAus(daten);
  const eingabe = einladungSchema.safeParse({
    token: daten.get('token'),
    passwort: daten.get('passwort'),
    wiederholung: daten.get('wiederholung'),
    einwilligung: daten.get('einwilligung'),
  });
  if (!eingabe.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of eingabe.error.issues) {
      const feld = String(f.path[0] ?? '');
      if (feld === 'token') return { fehler: 'einladung.ungueltig' };
      if (feld === 'passwort') feldFehler.passwort = 'einladung.fehlerPasswort';
      if (feld === 'wiederholung') feldFehler.wiederholung = 'einladung.fehlerGleich';
      if (feld === 'einwilligung') feldFehler.einwilligung = 'einladung.fehlerEinwilligung';
    }
    return { fehler: 'einladung.fehlerPruefen', feldFehler };
  }
  if (await begrenzt('einladung')) return { fehler: 'anmelden.zuViele' };
  const r = await nimmEinladungAn({
    token: eingabe.data.token,
    passwort: eingabe.data.passwort,
    sprache,
    einwilligung: einwilligungsVersion(sprache),
  });
  if (!r.ok)
    return {
      fehler:
        r.fehler === 'ungueltig' ? 'einladung.ungueltig' : r.fehler === 'vorhanden' ? 'einladung.vorhanden' : 'einladung.fehlerAllgemein',
    };
  redirect(pfadFuer({ pathname: '/anmelden', query: { hinweis: 'eingeladen' } }, sprache));
}

/** Einladung mit einem vorhandenen, angemeldeten Konto derselben Adresse übernehmen (nur Rollen hinzufügen). */
export async function gemeindeEinladungUebernehmen(_vorher: KontoZustand, daten: FormData): Promise<KontoZustand> {
  await verlangeKontenAktion();
  const sprache = sprachAus(daten);
  const k = await ladeKonto();
  if (!k) redirect(pfadFuer('/anmelden', sprache));
  if (await begrenzt('einladung', k.email)) return { fehler: 'anmelden.zuViele' };
  const r = await uebernimmEinladung({ token: String(daten.get('token') ?? '').slice(0, 100), benutzerId: k.benutzerId, email: k.email });
  if (!r.ok) return { fehler: r.fehler === 'andereAdresse' ? 'einladung.andereAdresse' : 'einladung.ungueltig' };
  redirect(pfadFuer('/mein-bereich', sprache));
}

// ───────────────────────────── Passwort ─────────────────────────────

const vergessenSchema = z.object({ email: z.string().trim().toLowerCase().max(254).pipe(z.email()) });

/** Passwort vergessen: immer dieselbe Antwort; Link und Mail entstehen erst nach der Antwort (Tor B/C N1). */
export async function kontoPasswortVergessen(_vorher: KontoZustand, daten: FormData): Promise<KontoZustand> {
  await verlangeKontenAktion();
  const sprache = sprachAus(daten);
  const eingabe = vergessenSchema.safeParse({ email: daten.get('email') });
  if (!eingabe.success) return { feldFehler: { email: 'passwortVergessen.fehlerEmail' } };
  if (await begrenzt('passwort-vergessen', eingabe.data.email)) return { fehler: 'anmelden.zuViele' };
  const email = eingabe.data.email;
  const ziel = `${basisUrl()}${pfadFuer('/passwort-neu', sprache)}`;
  after(async () => {
    if (!istUnzustellbar(email)) {
      try {
        await auth.api.requestPasswordReset({ body: { email, redirectTo: ziel } });
      } catch {
        // Antwort bleibt gleich
      }
    }
    await versendeOffeneMails().catch(() => undefined);
  });
  return { ok: true };
}

const neuSchema = z
  .object({ token: z.string().min(10).max(100), passwort: z.string().min(PASSWORT_MIN).max(128), wiederholung: z.string() })
  .refine((d) => d.passwort === d.wiederholung, { path: ['wiederholung'] });

/** Neues Passwort mit dem Link aus der Mail; alle Sitzungen enden (revokeSessionsOnPasswordReset). */
export async function kontoPasswortNeu(_vorher: KontoZustand, daten: FormData): Promise<KontoZustand> {
  await verlangeKontenAktion();
  const sprache = sprachAus(daten);
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
  redirect(pfadFuer({ pathname: '/anmelden', query: { hinweis: 'passwort' } }, sprache));
}

// ───────────────────────────── Abmelden ─────────────────────────────

export async function kontoAbmelden(daten: FormData): Promise<void> {
  // Abmelden geht immer – auch wenn die Funktion `konten` inzwischen aus ist (N-7 der Sicherheitsprüfung S1)
  const sprache = sprachAus(daten);
  const k = await ladeKonto();
  await auth.api.signOut({ headers: await headers() }).catch(() => undefined);
  if (k) await protokolliere({ benutzerId: k.benutzerId, aktion: 'abmeldung' });
  redirect(
    (await funktionAn('konten')) ? pfadFuer({ pathname: '/anmelden', query: { hinweis: 'abgemeldet' } }, sprache) : pfadFuer('/', sprache),
  );
}
