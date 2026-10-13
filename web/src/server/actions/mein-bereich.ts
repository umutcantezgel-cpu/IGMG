'use server';

import { and, eq, ne } from 'drizzle-orm';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { auth } from '@/lib/auth/server';
import { db, schema } from '@/lib/db';
import { PASSWORT_MIN } from '@/lib/konto/passwort-staerke';
import { aktuelleSitzungsId, faktorPflicht, hatZugang, verlangeKontenAktion } from '@/lib/konto/zugang';
import { ladeKonto, verlangeKontoRecht, type Konto } from '@/lib/rechte/gemeinde';
import { KeinRecht } from '@/lib/rechte/pruefe';
import { pruefeRate, type Grenze } from '@/lib/validierung/ratenbegrenzung';
import { exportiereKontodaten } from '@/server/queries/konto';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/**
 * Aktionen in „Mein Bereich › Konto“ (ADR 0026, AUFTRAG 3.5 „Alle“): Profil, Passwort, Zwei-Faktor, Passkeys,
 * Sitzungen, Datenexport (Art. 15/20), Löschantrag (Art. 17). Erste Anweisungen: Funktionsschalter, dann das Konto
 * (`verlangeKontoRecht`, wirft `KeinRecht`). Nur die Einrichtung des zweiten Faktors darf ohne erfüllten Faktor
 * laufen (Pflicht-Einrichtung der Lehrkräfte). Fehler sind Schlüssel im Namensraum `meinBereich`.
 */
export type MeinZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  ok?: boolean;
  gespeichert?: number;
  totp?: { uri: string; geheimnis: string; ersatzcodes: string[] };
};

const spracheSchema = z.enum(['de', 'tr', 'en']);
const sprachAus = (fd: FormData): Locale => spracheSchema.catch('de').parse(fd.get('sprache'));

const GRENZE: Grenze = { max: 10, fensterSekunden: 900 };
async function begrenzt(schritt: string, benutzerId: string): Promise<boolean> {
  return !(await pruefeRate(`mein-${schritt}`, benutzerId, GRENZE)).erlaubt;
}
const istZuViele = (e: unknown) => e instanceof APIError && (e.statusCode === 429 || e.status === 'TOO_MANY_REQUESTS');

/** Konto für Aktionen mit vollem Zugang (Rolle vorhanden, Faktor erfüllt, wo Pflicht). */
async function konto(): Promise<Konto> {
  await verlangeKontenAktion();
  const k = await verlangeKontoRecht();
  if (!hatZugang(k)) throw new KeinRecht();
  return k;
}

/** Passwort des Kontos prüfen (Bestätigung vor heiklen Schritten), ohne Sitzung zu verändern. */
async function passwortRichtig(benutzerId: string, passwort: string): Promise<boolean> {
  const [konto] = await db
    .select({ hash: schema.account.password })
    .from(schema.account)
    .where(and(eq(schema.account.userId, benutzerId), eq(schema.account.providerId, 'credential')))
    .limit(1);
  if (!konto?.hash) return false;
  const kontext = await auth.$context;
  return kontext.password.verify({ hash: konto.hash, password: passwort });
}

// ───────────────────────────── Profil ─────────────────────────────

const profilSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  anzeigename: z.string().trim().min(2).max(40).optional(),
  sprache: spracheSchema,
});

export async function profilSpeichern(_vorher: MeinZustand, daten: FormData): Promise<MeinZustand> {
  const k = await konto();
  const eingabe = profilSchema.safeParse({
    // Kinder ändern Name und Anzeigename nicht selbst (Anzeigename = Vorname + Initial, S-14)
    name: k.istKind ? undefined : (daten.get('name') ?? undefined),
    anzeigename: k.istKind ? undefined : (daten.get('anzeigename') ?? undefined),
    sprache: daten.get('profilSprache'),
  });
  if (!eingabe.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of eingabe.error.issues) feldFehler[String(f.path[0])] = `konto.profil.fehler.${String(f.path[0])}`;
    return { fehler: 'konto.profil.fehler.pruefen', feldFehler };
  }
  const d = eingabe.data;
  await db.transaction(async (tx) => {
    if (d.name) await tx.update(schema.user).set({ name: d.name }).where(eq(schema.user.id, k.benutzerId));
    await tx
      .insert(schema.kontoProfil)
      .values({ benutzerId: k.benutzerId, anzeigename: d.anzeigename ?? k.anzeigename, sprache: d.sprache })
      .onConflictDoUpdate({
        target: schema.kontoProfil.benutzerId,
        set: { sprache: d.sprache, ...(d.anzeigename ? { anzeigename: d.anzeigename } : {}) },
      });
    await protokolliere({ benutzerId: k.benutzerId, aktion: 'konto.profil_geaendert', zielTyp: 'benutzer', zielId: k.benutzerId }, tx);
  });
  return { ok: true, gespeichert: Date.now() };
}

// ───────────────────────────── Passwort ─────────────────────────────

const passwortSchema = z
  .object({ aktuell: z.string().min(1).max(128), neu: z.string().min(PASSWORT_MIN).max(128), wiederholung: z.string() })
  .refine((d) => d.neu === d.wiederholung, { path: ['wiederholung'] });

/** Passwort ändern; alle anderen Sitzungen enden. */
export async function kontoPasswortAendern(_vorher: MeinZustand, daten: FormData): Promise<MeinZustand> {
  const k = await konto();
  const eingabe = passwortSchema.safeParse({
    aktuell: daten.get('aktuell'),
    neu: daten.get('neu'),
    wiederholung: daten.get('wiederholung'),
  });
  if (!eingabe.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of eingabe.error.issues) {
      const feld = String(f.path[0]);
      feldFehler[feld] =
        feld === 'neu'
          ? 'konto.passwort.fehlerKurz'
          : feld === 'wiederholung'
            ? 'konto.passwort.fehlerGleich'
            : 'konto.passwort.fehlerAktuell';
    }
    return { feldFehler };
  }
  if (await begrenzt('passwort', k.benutzerId)) return { fehler: 'zuViele' };
  try {
    await auth.api.changePassword({
      body: { currentPassword: eingabe.data.aktuell, newPassword: eingabe.data.neu, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch (e) {
    return istZuViele(e) ? { fehler: 'zuViele' } : { feldFehler: { aktuell: 'konto.passwort.fehlerAktuell' } };
  }
  await protokolliere({ benutzerId: k.benutzerId, aktion: 'konto.passwort_geaendert' });
  return { ok: true, gespeichert: Date.now() };
}

// ───────────────────────────── Zwei-Faktor ─────────────────────────────

/** Konto für die Einrichtung des zweiten Faktors: angemeldet, Zugang, kein Kinderkonto – Faktor darf fehlen. */
async function kontoFuerEinrichtung(): Promise<Konto> {
  await verlangeKontenAktion();
  const k = await ladeKonto();
  if (!k || !hatZugang(k) || k.istKind) throw new KeinRecht();
  return k;
}

export async function kontoZweiFaktorStarten(_vorher: MeinZustand, daten: FormData): Promise<MeinZustand> {
  const k = await kontoFuerEinrichtung();
  const p = z.string().min(1).max(128).safeParse(daten.get('passwort'));
  if (!p.success) return { feldFehler: { passwort: 'konto.zweiFaktor.fehlerPasswort' } };
  if (await begrenzt('zwei-faktor', k.benutzerId)) return { fehler: 'zuViele' };
  try {
    const r = await auth.api.enableTwoFactor({ body: { password: p.data, method: 'totp' }, headers: await headers() });
    if (r.method !== 'totp') return { feldFehler: { passwort: 'konto.zweiFaktor.fehlerPasswort' } };
    const geheimnis = new URL(r.totpURI).searchParams.get('secret') ?? '';
    return { totp: { uri: r.totpURI, geheimnis, ersatzcodes: r.backupCodes } };
  } catch (e) {
    return istZuViele(e) ? { fehler: 'zuViele' } : { feldFehler: { passwort: 'konto.zweiFaktor.fehlerPasswort' } };
  }
}

export async function kontoZweiFaktorBestaetigen(vorher: MeinZustand, daten: FormData): Promise<MeinZustand> {
  const k = await kontoFuerEinrichtung();
  const sprache = sprachAus(daten);
  const code = String(daten.get('code') ?? '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(code)) return { ...vorher, feldFehler: { code: 'konto.zweiFaktor.fehlerCode' } };
  if (await begrenzt('zwei-faktor', k.benutzerId)) return { ...vorher, fehler: 'zuViele' };
  try {
    await auth.api.verifyTOTP({ body: { code }, headers: await headers() });
  } catch {
    return { ...vorher, feldFehler: { code: 'konto.zweiFaktor.fehlerCode' } };
  }
  await protokolliere({ benutzerId: k.benutzerId, aktion: 'zwei_faktor.eingerichtet' });
  redirect(pfadFuer({ pathname: '/mein-bereich/konto', query: { faktor: 'eingerichtet' } }, sprache));
}

/** Abschalten nur ohne Pflicht (nicht für Lehrkräfte und Verwaltung) und mit Passwort. */
export async function kontoZweiFaktorAbschalten(_vorher: MeinZustand, daten: FormData): Promise<MeinZustand> {
  const k = await konto();
  if (faktorPflicht(k) || k.istKind) return { fehler: 'konto.zweiFaktor.pflicht' };
  const p = z.string().min(1).max(128).safeParse(daten.get('passwort'));
  if (!p.success) return { feldFehler: { passwort: 'konto.zweiFaktor.fehlerPasswort' } };
  if (await begrenzt('zwei-faktor', k.benutzerId)) return { fehler: 'zuViele' };
  try {
    await auth.api.disableTwoFactor({ body: { password: p.data }, headers: await headers() });
  } catch (e) {
    return istZuViele(e) ? { fehler: 'zuViele' } : { feldFehler: { passwort: 'konto.zweiFaktor.fehlerPasswort' } };
  }
  await protokolliere({ benutzerId: k.benutzerId, aktion: 'konto.zwei_faktor_abgeschaltet', zielTyp: 'benutzer', zielId: k.benutzerId });
  return { ok: true, gespeichert: Date.now() };
}

// ───────────────────────────── Passkeys ─────────────────────────────

/**
 * Passkeys nur für Konten ohne Verwaltungsrolle und ohne Kinderkonto (siehe `passkeyAnmelden`). Registrieren verlangt
 * eine Sitzung mit erfülltem Faktor, wo er Pflicht ist (`verlangeKontoRecht`) – ein bekanntes Passwort allein reicht
 * nicht, um einen eigenen Passkey zu hinterlegen (Befund SP-P3 H1). Better Auth verlangt zudem eine frische Sitzung.
 */
async function kontoFuerPasskey(): Promise<Konto> {
  const k = await konto();
  if (k.istKind || k.verwaltungsRollen.length > 0) throw new KeinRecht();
  return k;
}

export async function passkeyRegistrierOptionen(): Promise<{ optionen?: Record<string, unknown>; fehler?: string }> {
  const k = await kontoFuerPasskey();
  if (await begrenzt('passkey', k.benutzerId)) return { fehler: 'zuViele' };
  try {
    const optionen = await auth.api.generatePasskeyRegistrationOptions({ headers: await headers() });
    return { optionen: optionen as unknown as Record<string, unknown> };
  } catch {
    return { fehler: 'konto.passkeys.fehlerFrisch' };
  }
}

export async function passkeyRegistrieren(antwort: string, name: string): Promise<{ ok?: boolean; fehler?: string }> {
  const k = await kontoFuerPasskey();
  if (await begrenzt('passkey', k.benutzerId)) return { fehler: 'zuViele' };
  const bezeichnung = z.string().trim().min(1).max(60).catch('Passkey').parse(name);
  let response: Record<string, unknown>;
  try {
    response = z.record(z.string(), z.unknown()).parse(JSON.parse(antwort.slice(0, 20_000)));
  } catch {
    return { fehler: 'konto.passkeys.fehler' };
  }
  try {
    await auth.api.verifyPasskeyRegistration({ body: { response, name: bezeichnung } as never, headers: await headers() });
  } catch {
    return { fehler: 'konto.passkeys.fehler' };
  }
  await protokolliere({ benutzerId: k.benutzerId, aktion: 'konto.passkey_angelegt', zielTyp: 'benutzer', zielId: k.benutzerId });
  return { ok: true };
}

export async function passkeyEntfernen(daten: FormData): Promise<void> {
  const k = await konto();
  const id = z.string().min(1).max(100).safeParse(daten.get('id'));
  if (!id.success) return;
  const entfernt = await db
    .delete(schema.passkey)
    .where(and(eq(schema.passkey.id, id.data), eq(schema.passkey.userId, k.benutzerId)))
    .returning({ id: schema.passkey.id });
  if (entfernt.length)
    await protokolliere({ benutzerId: k.benutzerId, aktion: 'konto.passkey_entfernt', zielTyp: 'benutzer', zielId: k.benutzerId });
  redirect(pfadFuer({ pathname: '/mein-bereich/konto', hash: 'passkeys' }, sprachAus(daten)));
}

// ───────────────────────────── Sitzungen ─────────────────────────────

/** Eine andere Sitzung beenden (nie die aktuelle – dafür gibt es „Abmelden“). */
export async function sitzungBeenden(daten: FormData): Promise<void> {
  const k = await konto();
  const id = z.string().min(1).max(100).safeParse(daten.get('id'));
  const aktuell = await aktuelleSitzungsId();
  if (id.success && id.data !== aktuell) {
    const weg = await db
      .delete(schema.session)
      .where(and(eq(schema.session.id, id.data), eq(schema.session.userId, k.benutzerId)))
      .returning({ id: schema.session.id });
    if (weg.length)
      await protokolliere({
        benutzerId: k.benutzerId,
        aktion: 'konto.sitzungen_beendet',
        zielTyp: 'benutzer',
        zielId: k.benutzerId,
        details: { anzahl: 1 },
      });
  }
  redirect(pfadFuer({ pathname: '/mein-bereich/konto', hash: 'sitzungen' }, sprachAus(daten)));
}

export async function andereSitzungenBeenden(daten: FormData): Promise<void> {
  const k = await konto();
  const aktuell = await aktuelleSitzungsId();
  if (aktuell) {
    const weg = await db
      .delete(schema.session)
      .where(and(eq(schema.session.userId, k.benutzerId), ne(schema.session.id, aktuell)))
      .returning({ id: schema.session.id });
    if (weg.length)
      await protokolliere({
        benutzerId: k.benutzerId,
        aktion: 'konto.sitzungen_beendet',
        zielTyp: 'benutzer',
        zielId: k.benutzerId,
        details: { anzahl: weg.length },
      });
  }
  redirect(pfadFuer({ pathname: '/mein-bereich/konto', hash: 'sitzungen' }, sprachAus(daten)));
}

// ───────────────────────────── Datenschutz ─────────────────────────────

/** Datenexport (Art. 15/20 DSGVO) als JSON-Text; der Browser speichert ihn als Datei. Höchstens 5 je Stunde. */
export async function datenExportieren(): Promise<{ datei?: string; fehler?: string }> {
  const k = await konto();
  if (!(await pruefeRate('mein-export', k.benutzerId, { max: 5, fensterSekunden: 3600 })).erlaubt) return { fehler: 'zuViele' };
  const daten = await exportiereKontodaten(k.benutzerId);
  await protokolliere({ benutzerId: k.benutzerId, aktion: 'konto.daten_exportiert', zielTyp: 'benutzer', zielId: k.benutzerId });
  return { datei: JSON.stringify(daten, null, 2) };
}

/** Frist zwischen Antrag und Löschung (Bearbeitung, Widerspruchsmöglichkeit, Aufbewahrungspflichten prüfen). */
const LOESCHFRIST_TAGE = 30;

/**
 * Löschantrag (Art. 17 DSGVO): löscht nicht sofort, sondern legt einen Antrag für die Verwaltung an (Ticket ohne
 * Personendaten, nur Konto-ID) und setzt die Frist im Profil. Bestätigung mit dem Passwort. Kinderkonten löschen die
 * Eltern über die Gemeinde.
 */
export async function loeschAntragStellen(_vorher: MeinZustand, daten: FormData): Promise<MeinZustand> {
  const k = await konto();
  if (k.istKind) return { fehler: 'konto.loeschen.kind' };
  const eingabe = z
    .object({ passwort: z.string().min(1).max(128), bestaetigt: z.literal('ja') })
    .safeParse({ passwort: daten.get('passwort'), bestaetigt: daten.get('bestaetigt') });
  if (!eingabe.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of eingabe.error.issues) feldFehler[String(f.path[0])] = `konto.loeschen.fehler.${String(f.path[0])}`;
    return { feldFehler };
  }
  if (await begrenzt('loeschen', k.benutzerId)) return { fehler: 'zuViele' };
  if (!(await passwortRichtig(k.benutzerId, eingabe.data.passwort))) return { feldFehler: { passwort: 'konto.loeschen.fehler.passwort' } };
  const loeschenAb = new Date(Date.now() + LOESCHFRIST_TAGE * 86_400_000);
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.kontoProfil)
      .values({ benutzerId: k.benutzerId, anzeigename: k.anzeigename, sprache: k.sprache, loeschenAb })
      .onConflictDoUpdate({ target: schema.kontoProfil.benutzerId, set: { loeschenAb } });
    const [t] = await tx
      .insert(schema.ticket)
      .values({
        titel: 'Löschantrag Gemeinde-Konto (Art. 17 DSGVO)',
        beschreibung: `Löschantrag aus „Mein Bereich“. Konto-ID: ${k.benutzerId}. Frist: ${loeschenAb.toISOString().slice(0, 10)}. Vor dem Löschen Aufbewahrungspflichten prüfen.`,
        typ: 'intern',
        kategorie: 'loeschantrag',
        prioritaet: 'hoch',
        erstelltVon: k.benutzerId,
      })
      .returning({ id: schema.ticket.id });
    await protokolliere({ benutzerId: k.benutzerId, aktion: 'konto.loeschantrag', zielTyp: 'ticket', zielId: t.id }, tx);
  });
  return { ok: true, gespeichert: Date.now() };
}
