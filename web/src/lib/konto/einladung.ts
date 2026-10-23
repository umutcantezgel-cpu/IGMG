import 'server-only';
import { and, eq, isNull, ne } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { auth } from '@/lib/auth/server';
import { db, schema, type Transaktion } from '@/lib/db';
import { vergibVerwaltungsrollen } from '@/lib/rechte/schutzrollen';
import type { Locale } from '@/i18n/routing';
import { ladeGueltigeEinladung } from '@/server/queries/einladung';
import { elternEinladungVertraut, stelleZurFreigabe } from './eltern-freigabe';
import { anzeigenameAus } from './regeln';
import { meldeAnSorgeberechtigte } from './sicherheitsmail';

/**
 * Einladungen in Gemeinde-Konten (ADR 0026, AUFTRAG 2.2): Eltern, Lehrkräfte und Schüler ≥ 16 bekommen eine Einladung
 * über das bestehende System (K-06); die Einladung trägt `gemeindeRollen` (und ggf. Verwaltungsrollen).
 *
 * Die Einladung wird zuerst „beansprucht“ (angenommen_am, nur wenn noch offen), dann entsteht das Konto. Scheitert
 * das Anlegen, wird der Anspruch zurückgenommen – so bleibt weder ein verbrauchter Link ohne Konto noch ein Konto ohne
 * Rollen zurück (vgl. E0-K01 Befund 3).
 */
export type Einladung = NonNullable<Awaited<ReturnType<typeof ladeGueltigeEinladung>>>;

async function vergibRollen(tx: Transaktion, e: Einladung, benutzerId: string, vertraut: boolean): Promise<void> {
  // Schutzrollen (leitung, kinderschutz) nur über das Vier-Augen-Prinzip (S2/S3)
  await vergibVerwaltungsrollen(tx, benutzerId, e.rollen, e.erstelltVon);
  for (const rolle of e.gemeindeRollen) {
    await tx.insert(schema.gemeindeRolle).values({ benutzerId, rolle, erstelltVon: e.erstelltVon }).onConflictDoNothing();
  }
  await verknuepfeLernende(tx, e, benutzerId, vertraut);
}

/**
 * Bezug auf Lernende (Aufnahme aus einer Voranmeldung, O-L01): Eltern bekommen den Eltern-Kind-Bezug, Schüler ab 16 ihr
 * Konto am Lerndatensatz – nur, wenn dieser noch keins hat. Bestätigt ist der Eltern-Kind-Bezug nur, wenn die Adresse
 * aus der Voranmeldung stammt oder eine zweite Person die Einladung freigegeben hat (N4) – sonst bleibt er unbestätigt
 * (kein Kinderzugang, kein Kinderpasswort). Die Annahme selbst lässt unbestätigte Eltern-Einladungen gar nicht erst zu.
 */
async function verknuepfeLernende(tx: Transaktion, e: Einladung, benutzerId: string, vertraut: boolean): Promise<void> {
  if (!e.lernendeId) return;
  if (e.gemeindeRollen.includes('eltern')) {
    const neu = await tx
      .insert(schema.elternKind)
      .values({ elternId: benutzerId, lernendeId: e.lernendeId, bestaetigtAm: vertraut ? new Date() : null })
      .onConflictDoNothing()
      .returning({ id: schema.elternKind.elternId });
    // S2/S3: Die schon eingetragenen sorgeberechtigten Eltern erfahren von jedem neuen Elternkonto (ohne Namen)
    if (neu.length) await meldeAnSorgeberechtigte(tx, e.lernendeId, [benutzerId], 'elternbezug');
  }
  if (e.gemeindeRollen.includes('schueler')) {
    // Ein Konto gehört zu höchstens einem Lerndatensatz (eindeutig)
    const [eigen] = await tx
      .select({ id: schema.lernende.id })
      .from(schema.lernende)
      .where(eq(schema.lernende.benutzerId, benutzerId))
      .limit(1);
    if (!eigen)
      await tx
        .update(schema.lernende)
        .set({ benutzerId })
        .where(and(eq(schema.lernende.id, e.lernendeId), isNull(schema.lernende.benutzerId)));
  }
}

/** Hat das Konto die Verwaltungsrolle `administration`? */
export async function hatAdministration(benutzerId: string): Promise<boolean> {
  const [z] = await db
    .select({ id: schema.rolleZuweisung.id })
    .from(schema.rolleZuweisung)
    .where(and(eq(schema.rolleZuweisung.benutzerId, benutzerId), eq(schema.rolleZuweisung.rolle, 'administration')))
    .limit(1);
  return Boolean(z);
}

/**
 * Hat das Konto Zugang zu Gruppen, Chats oder Kinderdaten – eine Kontoart außer `gemeinde` (Eltern, Lehrkraft, Schüler)
 * oder eine Gruppenleitung? Dann bekommt es keine Administration (S-L2 N-1, Gegenrichtung zu NIE_PER_ADMINISTRATION):
 * Sonst läse ein Konto mit Administration Schreibabgaben, Gruppen- und Elternkanal seiner Gruppen.
 */
export async function hatGruppenzugang(benutzerId: string): Promise<boolean> {
  const [[rolle], [leitung]] = await Promise.all([
    db
      .select({ id: schema.gemeindeRolle.benutzerId })
      .from(schema.gemeindeRolle)
      .where(and(eq(schema.gemeindeRolle.benutzerId, benutzerId), ne(schema.gemeindeRolle.rolle, 'gemeinde')))
      .limit(1),
    db
      .select({ id: schema.gruppenLeitung.benutzerId })
      .from(schema.gruppenLeitung)
      .where(eq(schema.gruppenLeitung.benutzerId, benutzerId))
      .limit(1),
  ]);
  return Boolean(rolle ?? leitung);
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
}): Promise<{ ok: true; benutzerId: string } | { ok: false; fehler: 'ungueltig' | 'vorhanden' | 'allgemein' | 'freigabe' }> {
  const e = await ladeGueltigeEinladung(o.token);
  if (!e) return { ok: false, fehler: 'ungueltig' };
  // N4: Eltern-Einladung mit Kindbezug an eine Adresse außerhalb der Voranmeldung ohne Freigabe (ältere Einladungen) →
  // erst die zweite Person; danach kommt eine neue Mail
  const vertraut = await elternEinladungVertraut(e);
  if (!vertraut) {
    await stelleZurFreigabe(e.id);
    return { ok: false, fehler: 'freigabe' };
  }
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
      await vergibRollen(tx, e, benutzerId, vertraut);
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
}): Promise<{ ok: true } | { ok: false; fehler: 'ungueltig' | 'andereAdresse' | 'administration' | 'freigabe' }> {
  const e = await ladeGueltigeEinladung(o.token);
  if (!e) return { ok: false, fehler: 'ungueltig' };
  if (e.email.trim().toLowerCase() !== o.email.trim().toLowerCase()) return { ok: false, fehler: 'andereAdresse' };
  // NIE_PER_ADMINISTRATION (S2/S3): Ein Konto mit der Rolle Administration wird nicht Elternteil, Lehrkraft oder Schüler –
  // sonst läse die Administration über die Gemeinde-Rolle Chats und Kinderdaten
  if (e.gemeindeRollen.some((r) => r !== 'gemeinde') && (await hatAdministration(o.benutzerId)))
    return { ok: false, fehler: 'administration' };
  // Gegenrichtung (S-L2 N-1): Ein Konto mit Kontoart mit Gruppenzugang oder Gruppenleitung wird nicht Administration
  if (e.rollen.some((r) => r.rolle === 'administration') && (await hatGruppenzugang(o.benutzerId)))
    return { ok: false, fehler: 'administration' };
  const vertraut = await elternEinladungVertraut(e);
  if (!vertraut) {
    await stelleZurFreigabe(e.id);
    return { ok: false, fehler: 'freigabe' };
  }
  if (!(await beanspruche(e.id))) return { ok: false, fehler: 'ungueltig' };
  await db.transaction(async (tx) => {
    await vergibRollen(tx, e, o.benutzerId, vertraut);
    await protokolliere({ benutzerId: o.benutzerId, aktion: 'einladung.angenommen', zielTyp: 'einladung', zielId: e.id }, tx);
  });
  return { ok: true };
}
