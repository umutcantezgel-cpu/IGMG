import 'server-only';
import { and, eq, inArray, isNull, lte, notExists, sql } from 'drizzle-orm';
import { pfadFuer } from '@/i18n/navigation';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { inaktivLoeschDatum, inaktivStufe, inaktivVorfilter } from '@/lib/loeschen/fristen';
import { istUnzustellbar } from '@/lib/mail/adresse';
import { planeKontoMail } from '@/lib/mail/ausgang';
import type { MailSprache } from '@/lib/mail/konto-vorlagen';
import { basisUrl } from '@/lib/seo/metadaten';
import { loescheGemeindeKonto } from './loeschen';

/**
 * Inaktive Gemeinde-Konten (DSFA D-16, Löschkonzept L-14; Frist als Vorschlag bis MN-11): 24 Monate ohne Anmeldung →
 * Löschung, 30 Tage vorher eine Vorwarnung per Mail (Vorlage ohne Inhalte: nur das Löschdatum und ein Link zur
 * Anmeldung). Kinderkonten haben keine Adresse – die Vorwarnung geht an die sorgeberechtigten Eltern; gelöscht wird
 * nur der Zugang, der Lerndatensatz bleibt (wie beim Löschen sonst, `loescheGemeindeKonto`).
 *
 * Nie betroffen: Konten mit Verwaltungsrolle, gesperrte Konten (bis zur Entscheidung, L-13), Gruppenleitungen
 * (Lehrkraft/Aufsicht einer Gruppe, S-02) und Eltern, solange zu ihrem Kind ein Lerndatensatz besteht – deren Konto
 * trägt die Einwilligungen; es läuft mit dem Löschen der Lernenden (D-10) wieder in die Frist.
 */

export type InaktivErgebnis = { gewarnt: number; geloescht: number };

const sprache = (s: string | null | undefined): MailSprache => (s === 'tr' || s === 'en' ? s : 'de');

/** Teil des täglichen Löschlaufs: Vorwarnungen planen, Fälliges löschen. Idempotent (Vorwarnung nur einmal). */
export async function inaktiveKontenLauf(jetzt = new Date()): Promise<InaktivErgebnis> {
  const u = schema.user;
  const p = schema.kontoProfil;
  const zuletzt = sql<Date>`coalesce(${p.letzteAnmeldung}, ${p.erstelltAm})`.mapWith((w: string | Date) => new Date(w));
  const kandidaten = await db
    .select({ id: u.id, email: u.email, istKind: p.istKind, sprache: p.sprache, zuletzt, gewarntAm: p.inaktivGewarntAm })
    .from(p)
    .innerJoin(u, eq(u.id, p.benutzerId))
    .where(
      and(
        isNull(u.gesperrtAm),
        lte(sql`coalesce(${p.letzteAnmeldung}, ${p.erstelltAm})`, inaktivVorfilter(jetzt)),
        notExists(
          db.select({ id: schema.rolleZuweisung.id }).from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, u.id)),
        ),
        notExists(
          db.select({ id: schema.gruppenLeitung.benutzerId }).from(schema.gruppenLeitung).where(eq(schema.gruppenLeitung.benutzerId, u.id)),
        ),
        notExists(db.select({ id: schema.elternKind.elternId }).from(schema.elternKind).where(eq(schema.elternKind.elternId, u.id))),
      ),
    );
  let gewarnt = 0;
  let geloescht = 0;
  for (const k of kandidaten) {
    const stufe = inaktivStufe({ zuletztAktiv: k.zuletzt, gewarntAm: k.gewarntAm }, jetzt);
    if (stufe === 'loeschen') {
      if ((await loescheGemeindeKonto(k.id, { akteurId: null, anlass: 'inaktiv' })).ok) geloescht++;
      continue;
    }
    if (stufe !== 'warnen') continue;
    const loeschAm = inaktivLoeschDatum(k.zuletzt, jetzt);
    const empfaenger = k.istKind || istUnzustellbar(k.email) ? await elternVon(k.id) : [{ email: k.email, sprache: sprache(k.sprache) }];
    await db.transaction(async (tx) => {
      // Vorwarnung nur einmal: Eine parallele Ausführung findet die Spalte schon gesetzt
      const [gesetzt] = await tx
        .update(p)
        .set({ inaktivGewarntAm: jetzt })
        .where(and(eq(p.benutzerId, k.id), k.gewarntAm ? eq(p.inaktivGewarntAm, k.gewarntAm) : isNull(p.inaktivGewarntAm)))
        .returning({ id: p.benutzerId });
      if (!gesetzt) return;
      let mails = 0;
      for (const e of empfaenger)
        if (
          await planeKontoMail(
            {
              an: e.email,
              vorlage: k.istKind ? 'konto-inaktiv-kind' : 'konto-inaktiv',
              sprache: e.sprache,
              daten: {
                gueltigBis: datumOhneWochentag(loeschAm, e.sprache),
                link: `${basisUrl()}${pfadFuer(k.istKind ? '/mein-bereich' : '/anmelden', e.sprache)}`,
              },
            },
            tx,
          )
        )
          mails++;
      await protokolliere(
        { benutzerId: null, aktion: 'konto.inaktiv_gewarnt', zielTyp: 'benutzer', zielId: k.id, details: { kind: k.istKind, mails } },
        tx,
      );
      gewarnt++;
    });
  }
  return { gewarnt, geloescht };
}

/** Sorgeberechtigte Eltern eines Kinderkontos (Adresse und Sprache), nur zustellbare Adressen. */
async function elternVon(kindId: string): Promise<{ email: string; sprache: MailSprache }[]> {
  const lernende = await db.select({ id: schema.lernende.id }).from(schema.lernende).where(eq(schema.lernende.benutzerId, kindId));
  if (!lernende.length) return [];
  const zeilen = await db
    .select({ email: schema.user.email, sprache: schema.kontoProfil.sprache })
    .from(schema.elternKind)
    .innerJoin(schema.user, eq(schema.user.id, schema.elternKind.elternId))
    .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.user.id))
    .where(
      and(
        inArray(
          schema.elternKind.lernendeId,
          lernende.map((l) => l.id),
        ),
        eq(schema.elternKind.sorgeberechtigt, true),
        isNull(schema.user.gesperrtAm),
      ),
    );
  return zeilen.filter((z) => !istUnzustellbar(z.email)).map((z) => ({ email: z.email, sprache: sprache(z.sprache) }));
}
