import 'server-only';
import { and, eq, isNull } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { auth } from '@/lib/auth/server';
import { db, schema, type Transaktion } from '@/lib/db';
import type { Locale } from '@/i18n/routing';
import { ladeGueltigeEinladung } from '@/server/queries/einladung';
import { anzeigenameAus } from './regeln';

/**
 * Einladungen in Gemeinde-Konten (ADR 0026, AUFTRAG 2.2): Eltern, Lehrkräfte und Schüler ≥ 16 bekommen eine Einladung
 * über das bestehende System (K-06); die Einladung trägt `gemeindeRollen` (und ggf. Verwaltungsrollen).
 *
 * Die Einladung wird zuerst „beansprucht“ (angenommen_am, nur wenn noch offen), dann entsteht das Konto. Scheitert
 * das Anlegen, wird der Anspruch zurückgenommen – so bleibt weder ein verbrauchter Link ohne Konto noch ein Konto ohne
 * Rollen zurück (vgl. E0-K01 Befund 3).
 */
export type Einladung = NonNullable<Awaited<ReturnType<typeof ladeGueltigeEinladung>>>;

async function vergibRollen(tx: Transaktion, e: Einladung, benutzerId: string): Promise<void> {
  for (const z of e.rollen) {
    await tx
      .insert(schema.rolleZuweisung)
      .values({ benutzerId, rolle: z.rolle, organisation: z.organisation ?? null, erstelltVon: e.erstelltVon })
      .onConflictDoNothing();
  }
  for (const rolle of e.gemeindeRollen) {
    await tx.insert(schema.gemeindeRolle).values({ benutzerId, rolle, erstelltVon: e.erstelltVon }).onConflictDoNothing();
  }
}

async function beanspruche(id: string): Promise<boolean> {
  const [z] = await db
    .update(schema.einladung)
    .set({ angenommenAm: new Date() })
    .where(and(eq(schema.einladung.id, id), isNull(schema.einladung.angenommenAm), isNull(schema.einladung.widerrufenAm)))
    .returning({ id: schema.einladung.id });
  return Boolean(z);
}

async function gibFrei(id: string): Promise<void> {
  await db.update(schema.einladung).set({ angenommenAm: null }).where(eq(schema.einladung.id, id));
}

/** Gibt es zur Adresse schon ein Konto? (Nur für die Einladungsseite: der Link selbst ist der Nachweis.) */
export async function kontoZurAdresse(email: string): Promise<boolean> {
  const [u] = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email.trim().toLowerCase())).limit(1);
  return Boolean(u);
}

/** Neues Konto aus der Einladung. Rückgabe: Konto-ID oder ein Fehlerschlüssel. */
export async function nimmEinladungAn(o: {
  token: string;
  passwort: string;
  sprache: Locale;
  einwilligung: string;
}): Promise<{ ok: true; benutzerId: string } | { ok: false; fehler: 'ungueltig' | 'vorhanden' | 'allgemein' }> {
  const e = await ladeGueltigeEinladung(o.token);
  if (!e) return { ok: false, fehler: 'ungueltig' };
  if (await kontoZurAdresse(e.email)) return { ok: false, fehler: 'vorhanden' };
  if (!(await beanspruche(e.id))) return { ok: false, fehler: 'ungueltig' };
  let benutzerId: string;
  try {
    const r = await auth.api.signUpEmail({ body: { email: e.email, password: o.passwort, name: e.name } });
    benutzerId = r.user.id;
  } catch {
    await gibFrei(e.id);
    return { ok: false, fehler: 'allgemein' };
  }
  try {
    await db.transaction(async (tx) => {
      // Die Adresse ist durch den Link aus der Einladungsmail nachgewiesen
      await tx.update(schema.user).set({ emailVerified: true }).where(eq(schema.user.id, benutzerId));
      await vergibRollen(tx, e, benutzerId);
      await tx
        .insert(schema.kontoProfil)
        .values({ benutzerId, anzeigename: anzeigenameAus(e.name), sprache: o.sprache })
        .onConflictDoNothing();
      await tx
        .insert(schema.kontoEinwilligung)
        .values({ benutzerId, art: 'konto', textVersion: o.einwilligung, sprache: o.sprache, erteiltVon: benutzerId });
      await protokolliere({ benutzerId, aktion: 'einladung.angenommen', zielTyp: 'einladung', zielId: e.id }, tx);
    });
  } catch {
    await db.delete(schema.user).where(eq(schema.user.id, benutzerId));
    await gibFrei(e.id);
    return { ok: false, fehler: 'allgemein' };
  }
  return { ok: true, benutzerId };
}

/**
 * Einladung für ein vorhandenes, angemeldetes Konto derselben Adresse übernehmen (z. B. Gemeindemitglied wird als
 * Elternteil eingeladen): nur Rollen hinzufügen, nichts am Konto ändern.
 */
export async function uebernimmEinladung(o: {
  token: string;
  benutzerId: string;
  email: string;
}): Promise<{ ok: true } | { ok: false; fehler: 'ungueltig' | 'andereAdresse' }> {
  const e = await ladeGueltigeEinladung(o.token);
  if (!e) return { ok: false, fehler: 'ungueltig' };
  if (e.email.trim().toLowerCase() !== o.email.trim().toLowerCase()) return { ok: false, fehler: 'andereAdresse' };
  if (!(await beanspruche(e.id))) return { ok: false, fehler: 'ungueltig' };
  await db.transaction(async (tx) => {
    await vergibRollen(tx, e, o.benutzerId);
    await protokolliere({ benutzerId: o.benutzerId, aktion: 'einladung.angenommen', zielTyp: 'einladung', zielId: e.id }, tx);
  });
  return { ok: true };
}
