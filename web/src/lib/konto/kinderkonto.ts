import 'server-only';
import { randomBytes } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { auth } from '@/lib/auth/server';
import { db, schema } from '@/lib/db';
import { pruefeBenutzername, type BenutzernameFehler } from './benutzername';
import { PASSWORT_MIN } from './passwort-staerke';
import { synthetischeAdresse } from './regeln';

/**
 * Kinderkonten ohne E-Mail (ADR 0026, AUFTRAG 2.2): Anmeldung mit Benutzername und Passwort, synthetische Adresse
 * `k-<zufall>@konto.invalid` (der Mail-Ausgang weist `.invalid` hart ab). Sitzung höchstens 12 h (`sitzung.ts`).
 *
 * KEINE Server Action: Aufrufer (Eltern-Bereich, Verwaltung) prüfen vorher selbst, dass `elternBenutzerId` die
 * angemeldete Person ist (`verlangeKontoRecht(['eltern'])`) bzw. die Verwaltung das Recht hat. Hier wird zusätzlich
 * geprüft: Eltern-Kind-Bezug vorhanden, gültige (nicht widerrufene) Einwilligung „kinderkonto“ dieses Elternteils
 * (S-03), Lernende ohne eigenes Konto, Benutzername gültig und frei.
 */
export type KinderkontoFehler =
  BenutzernameFehler | 'vergeben' | 'passwort' | 'keinElternteil' | 'keineEinwilligung' | 'bereitsKonto' | 'unbekannt';

/** Ist der Benutzername frei? Nur serverseitig (kein offener Endpunkt, keine Aufzählung über HTTP). */
export async function benutzernameFrei(benutzername: string): Promise<boolean> {
  const p = pruefeBenutzername(benutzername);
  if (!p.ok) return false;
  const [vorhanden] = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.username, p.wert)).limit(1);
  return !vorhanden;
}

export async function legeKinderkontoAn(o: {
  benutzername: string;
  passwort: string;
  elternBenutzerId: string;
  lernendeId: string;
  sprache?: 'de' | 'tr' | 'en';
}): Promise<{ ok: true; benutzerId: string; benutzername: string } | { ok: false; fehler: KinderkontoFehler }> {
  const p = pruefeBenutzername(o.benutzername);
  if (!p.ok) return { ok: false, fehler: p.fehler };
  if (o.passwort.length < PASSWORT_MIN || o.passwort.length > 128) return { ok: false, fehler: 'passwort' };

  const [bezug] = await db
    .select({ anzeigename: schema.lernende.anzeigename, benutzerId: schema.lernende.benutzerId })
    .from(schema.elternKind)
    .innerJoin(schema.lernende, eq(schema.lernende.id, schema.elternKind.lernendeId))
    .where(and(eq(schema.elternKind.elternId, o.elternBenutzerId), eq(schema.elternKind.lernendeId, o.lernendeId)))
    .limit(1);
  if (!bezug) return { ok: false, fehler: 'keinElternteil' };
  if (bezug.benutzerId) return { ok: false, fehler: 'bereitsKonto' };

  const [einwilligung] = await db
    .select({ id: schema.kontoEinwilligung.id })
    .from(schema.kontoEinwilligung)
    .where(
      and(
        eq(schema.kontoEinwilligung.lernendeId, o.lernendeId),
        eq(schema.kontoEinwilligung.art, 'kinderkonto'),
        eq(schema.kontoEinwilligung.erteiltVon, o.elternBenutzerId),
        isNull(schema.kontoEinwilligung.widerrufenAm),
      ),
    )
    .limit(1);
  if (!einwilligung) return { ok: false, fehler: 'keineEinwilligung' };

  if (!(await benutzernameFrei(p.wert))) return { ok: false, fehler: 'vergeben' };

  let benutzerId: string;
  try {
    // Serverseitig ohne Request: der Registrierungs-Riegel (Hook) greift nur bei HTTP-Aufrufen
    const r = await auth.api.signUpEmail({
      body: {
        email: synthetischeAdresse(randomBytes(12).toString('hex')),
        password: o.passwort,
        name: bezug.anzeigename,
        username: p.wert,
      },
    });
    benutzerId = r.user.id;
  } catch {
    // Wettlauf um denselben Namen oder Better-Auth-Prüfung: nichts verraten außer „vergeben“
    return { ok: false, fehler: (await benutzernameFrei(p.wert)) ? 'unbekannt' : 'vergeben' };
  }
  try {
    await db.transaction(async (tx) => {
      const [gebunden] = await tx
        .update(schema.lernende)
        .set({ benutzerId })
        .where(and(eq(schema.lernende.id, o.lernendeId), isNull(schema.lernende.benutzerId)))
        .returning({ id: schema.lernende.id });
      if (!gebunden) throw new Error('BEREITS_KONTO');
      await tx.insert(schema.kontoProfil).values({ benutzerId, anzeigename: bezug.anzeigename, istKind: true, sprache: o.sprache ?? 'de' });
      await tx.insert(schema.gemeindeRolle).values({ benutzerId, rolle: 'schueler', erstelltVon: o.elternBenutzerId });
      await protokolliere(
        { benutzerId: o.elternBenutzerId, aktion: 'konto.kinderkonto_angelegt', zielTyp: 'benutzer', zielId: benutzerId },
        tx,
      );
    });
  } catch (e) {
    // Kein halbes Konto zurücklassen (vgl. E0-K01 Befund 3)
    await db.delete(schema.user).where(eq(schema.user.id, benutzerId));
    return { ok: false, fehler: e instanceof Error && e.message === 'BEREITS_KONTO' ? 'bereitsKonto' : 'unbekannt' };
  }
  return { ok: true, benutzerId, benutzername: p.wert };
}
