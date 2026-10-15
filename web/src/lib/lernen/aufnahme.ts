import 'server-only';
import { and, eq } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { entschluessele, verschluessele } from '@/lib/krypto';
import { erstelleGemeindeEinladung } from '@/lib/konto/gemeinde-einladung';
import type { MailSprache } from '@/lib/mail/konto-vorlagen';
import { lernendeAusVoranmeldung } from './verwaltung';

/**
 * Aufnahme aus einer Voranmeldung (O-L01, AUFTRAG 3.5): legt die Lernende an (Personendaten verschlüsselt, im Klartext
 * nur Vorname + Initial und der Tag des 16. Geburtstags), ordnet sie optional einer Gruppe zu und lädt die Eltern mit
 * Bezug auf die Lernende ein (beim Annehmen entsteht `eltern_kind`). Verknüpft über `lernende.eingang_id` (eindeutig);
 * `eingang.bezug_id` bleibt der gewünschte Kurs der Voranmeldung (F-44) und wird hier nicht überschrieben.
 *
 * Idempotent: Ein zweiter Aufruf (Doppelklick, zwei Personen gleichzeitig) findet die vorhandene Lernende und legt
 * weder eine zweite Lernende noch weitere Einladungen an – die Eindeutigkeit von `lernende.eingang_id` sichert das
 * auch bei gleichzeitigen Transaktionen ab.
 *
 * KEINE Server Action: Die Action (`src/server/actions/lernende.ts`) prüft vorher Recht, Funktionsschalter und
 * Sichtbarkeit des Eingangs.
 */
export type AufnahmeErgebnis =
  | { ok: true; status: 'angelegt' | 'vorhanden'; lernendeId: string; einladungen: number }
  | { ok: false; fehler: 'nichtGefunden' | 'keineVoranmeldung' | 'datenFehlen' | 'gruppeUnbekannt' };

export type AufnahmeOptionen = {
  eingangId: string;
  akteurId: string;
  gruppeId: string | null;
  /** Welche Elternteile (1, 2) eine Einladung bekommen; leer = keine (z. B. Funktion „konten“ aus). */
  eltern: readonly (1 | 2)[];
  gueltigTage?: number;
};

const SPRACHEN: readonly MailSprache[] = ['de', 'tr', 'en'];

async function vorhandeneLernende(eingangId: string): Promise<string | null> {
  const [l] = await db.select({ id: schema.lernende.id }).from(schema.lernende).where(eq(schema.lernende.eingangId, eingangId)).limit(1);
  return l?.id ?? null;
}

export async function nimmVoranmeldungAuf(o: AufnahmeOptionen): Promise<AufnahmeErgebnis> {
  const [e] = await db
    .select({
      id: schema.eingang.id,
      art: schema.eingang.art,
      status: schema.eingang.status,
      sprache: schema.eingang.sprache,
      daten: schema.eingang.datenVerschluesselt,
      schluesselId: schema.eingang.schluesselId,
    })
    .from(schema.eingang)
    .where(eq(schema.eingang.id, o.eingangId));
  if (!e) return { ok: false, fehler: 'nichtGefunden' };
  if (e.art !== 'voranmeldung') return { ok: false, fehler: 'keineVoranmeldung' };
  const schon = await vorhandeneLernende(e.id);
  if (schon) return { ok: true, status: 'vorhanden', lernendeId: schon, einladungen: 0 };

  const aus = lernendeAusVoranmeldung(entschluessele<Record<string, unknown>>(e.daten, e.schluesselId));
  if (!aus) return { ok: false, fehler: 'datenFehlen' };
  if (o.gruppeId) {
    const [g] = await db
      .select({ id: schema.gruppe.id })
      .from(schema.gruppe)
      .where(and(eq(schema.gruppe.id, o.gruppeId), eq(schema.gruppe.status, 'aktiv')));
    if (!g) return { ok: false, fehler: 'gruppeUnbekannt' };
  }
  const sprache: MailSprache = (SPRACHEN as readonly string[]).includes(e.sprache) ? (e.sprache as MailSprache) : 'de';
  const paket = verschluessele(aus.daten);

  return db.transaction(async (tx): Promise<AufnahmeErgebnis> => {
    const [neu] = await tx
      .insert(schema.lernende)
      .values({
        datenVerschluesselt: paket.daten,
        schluesselId: paket.schluesselId,
        anzeigename: aus.anzeigename,
        sechzehnAm: aus.sechzehnAm,
        eingangId: e.id,
        aufgenommenVon: o.akteurId,
      })
      .onConflictDoNothing({ target: schema.lernende.eingangId })
      .returning({ id: schema.lernende.id });
    if (!neu) {
      // Gleichzeitige Aufnahme: die andere Transaktion war schneller
      const [l] = await tx.select({ id: schema.lernende.id }).from(schema.lernende).where(eq(schema.lernende.eingangId, e.id));
      return { ok: true, status: 'vorhanden', lernendeId: l.id, einladungen: 0 };
    }
    await tx
      .update(schema.eingang)
      .set({ status: e.status === 'neu' ? 'in_bearbeitung' : e.status, bearbeitetVon: o.akteurId })
      .where(eq(schema.eingang.id, e.id));
    if (e.status === 'neu')
      await protokolliere(
        {
          benutzerId: o.akteurId,
          aktion: 'eingang.status',
          zielTyp: 'eingang',
          zielId: e.id,
          details: { art: 'voranmeldung', von: 'neu', nach: 'in_bearbeitung' },
        },
        tx,
      );
    if (o.gruppeId)
      await tx
        .insert(schema.gruppenMitglied)
        .values({ gruppeId: o.gruppeId, lernendeId: neu.id, seit: berlinerDatum(new Date()) })
        .onConflictDoNothing();
    let einladungen = 0;
    for (const nr of o.eltern) {
      const kontakt = aus.daten.eltern?.[nr - 1];
      if (!kontakt?.email) continue;
      const r = await erstelleGemeindeEinladung(tx, {
        name: kontakt.name,
        email: kontakt.email,
        art: 'eltern',
        lernendeId: neu.id,
        gueltigTage: o.gueltigTage ?? 14,
        sprache,
        erstelltVon: o.akteurId,
      });
      if (r.neu) einladungen++;
    }
    await protokolliere(
      {
        benutzerId: o.akteurId,
        aktion: 'lernende.aufgenommen',
        zielTyp: 'lernende',
        zielId: neu.id,
        details: { eingang: e.id, gruppe: o.gruppeId !== null, einladungen },
      },
      tx,
    );
    return { ok: true, status: 'angelegt', lernendeId: neu.id, einladungen };
  });
}
