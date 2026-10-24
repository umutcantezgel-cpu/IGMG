import 'server-only';
import { and, asc, eq, inArray, isNotNull, isNull, ne, sql } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema, type Transaktion } from '@/lib/db';
import { entschluessele, sha256, zufallsToken } from '@/lib/krypto';
import { beendeLernappDerEltern, folgenNachBezugsende } from '@/lib/lernapp/schreiben/folgen';
import type { LernendeDaten } from '@/lib/lernen/verwaltung';
import { planeHinweis, SCHUTZROLLEN_EMPFAENGER } from '@/lib/mail/ausgang';
import type { MailSprache } from '@/lib/mail/konto-vorlagen';
import { darfAntraegeEntscheiden, type EntscheidungsFehler } from '@/lib/rechte/schutzrollen';
import { planeEinladungsMail } from './gemeinde-einladung';
import { meldeAnElternkonto } from './sicherheitsmail';

/**
 * Vier-Augen-Prinzip für Eltern-Kind-Bezüge (Nacharbeit N4, S2b-4): Wer Bildung oder Administration hat, könnte sich
 * sonst über eine eigene Zweitadresse zum Elternteil eines Kindes machen (Kinderzugang, Elternkanal) oder die echten
 * Eltern still entfernen.
 * - Eltern-Einladung mit Kindbezug an eine Adresse, die NICHT aus der Voranmeldung des Kindes stammt: Die Einladung
 *   wartet; erst wenn eine zweite Person (Leitung oder Kinderschutz, ohne Administration, nicht die einladende und nicht
 *   die eingeladene Person) bestätigt, entsteht der Link und geht die Mail hinaus. Auch beim Annehmen wird das erneut
 *   geprüft (ältere Einladungen ohne Freigabe warten dann ebenfalls).
 * - Eltern-Kind-Bezug beenden: Die Verwaltung beantragt, eine zweite Person bestätigt. Das Elternkonto erfährt vom
 *   Antrag und vom Beenden; Leitung und Kinderschutz bekommen einen Hinweis ohne Namen.
 */

const klein = (email: string) => email.trim().toLowerCase();

/** E-Mail-Adressen der Eltern laut Voranmeldung (aus dem verschlüsselten Lerndatensatz), kleingeschrieben. */
export async function adressenAusVoranmeldung(lernendeId: string, ausfuehrer: Pick<typeof db, 'select'> = db): Promise<Set<string>> {
  const [l] = await ausfuehrer
    .select({ daten: schema.lernende.datenVerschluesselt, schluesselId: schema.lernende.schluesselId })
    .from(schema.lernende)
    .where(eq(schema.lernende.id, lernendeId))
    .limit(1);
  if (!l) return new Set();
  const d = entschluessele<LernendeDaten>(l.daten, l.schluesselId);
  return new Set((d.eltern ?? []).flatMap((e) => (e.email ? [klein(e.email)] : [])));
}

/** Stammt die Adresse aus der Voranmeldung dieses Kindes? */
export async function stammtAusVoranmeldung(lernendeId: string, email: string, ausfuehrer: Pick<typeof db, 'select'> = db) {
  return (await adressenAusVoranmeldung(lernendeId, ausfuehrer)).has(klein(email));
}

/** Darf eine (gültige) Einladung ohne weitere Freigabe einen Eltern-Kind-Bezug stiften? */
export async function elternEinladungVertraut(e: {
  lernendeId: string | null;
  gemeindeRollen: readonly string[];
  email: string;
  freigegebenAm: Date | null;
}): Promise<boolean> {
  if (!e.lernendeId || !e.gemeindeRollen.includes('eltern')) return true;
  if (e.freigegebenAm) return true;
  return stammtAusVoranmeldung(e.lernendeId, e.email);
}

/**
 * Eine schon verschickte Einladung (vor N4) zur Freigabe zurückstellen: Der alte Link gilt nicht mehr; nach der Freigabe
 * kommt eine neue Mail. Hinweis an Leitung und Kinderschutz.
 */
export async function stelleZurFreigabe(einladungId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const z = await tx
      .update(schema.einladung)
      .set({ freigabeNoetig: true })
      .where(and(eq(schema.einladung.id, einladungId), eq(schema.einladung.freigabeNoetig, false), isNull(schema.einladung.freigegebenAm)))
      .returning({ id: schema.einladung.id });
    if (!z.length) return;
    await protokolliere({ benutzerId: null, aktion: 'einladung.freigabe_noetig', zielTyp: 'einladung', zielId: einladungId }, tx);
    await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'elterneinladung', pfad: '/verwaltung/gemeinde-im-blick' }, tx);
  });
}

type Entscheider = { benutzerId: string; email: string; rollen: readonly { rolle: string }[] };

export type ElternEinladungZeile = {
  id: string;
  name: string;
  email: string;
  kind: string;
  beantragtVonName: string | null;
  beantragtAm: Date;
};

export type BezugEndeZeile = {
  lernendeId: string;
  elternId: string;
  name: string;
  email: string;
  kind: string;
  beantragtVonName: string | null;
  beantragtAm: Date;
};

async function namen(ids: (string | null)[]): Promise<Map<string, string>> {
  const liste = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  if (!liste.length) return new Map();
  const zeilen = await db.select({ id: schema.user.id, name: schema.user.name }).from(schema.user).where(inArray(schema.user.id, liste));
  return new Map(zeilen.map((z) => [z.id, z.name]));
}

/**
 * Offene Eltern-Vorgänge, über die diese Person entscheiden darf – nie über eigene Anträge, nie über sich selbst. Leer,
 * wenn sie gar nicht entscheiden darf. Vom Kind nur der Anzeigename (Vorname + Initial).
 */
export async function elternAntraegeZurEntscheidung(
  entscheider: Entscheider,
): Promise<{ einladungen: ElternEinladungZeile[]; bezuege: BezugEndeZeile[] }> {
  if (!darfAntraegeEntscheiden(entscheider.rollen)) return { einladungen: [], bezuege: [] };
  const e = schema.einladung;
  const [einladungen, bezuege] = await Promise.all([
    db
      .select({
        id: e.id,
        name: e.name,
        email: e.email,
        kind: schema.lernende.anzeigename,
        erstelltVon: e.erstelltVon,
        erstelltAm: e.erstelltAm,
      })
      .from(e)
      .innerJoin(schema.lernende, eq(schema.lernende.id, e.lernendeId))
      .where(
        and(
          eq(e.freigabeNoetig, true),
          isNull(e.freigegebenAm),
          isNull(e.widerrufenAm),
          isNull(e.angenommenAm),
          sql`(${e.erstelltVon} is null or ${e.erstelltVon} <> ${entscheider.benutzerId})`,
          sql`lower(${e.email}) <> ${klein(entscheider.email)}`,
        ),
      )
      .orderBy(asc(e.erstelltAm)),
    db
      .select({
        lernendeId: schema.elternKind.lernendeId,
        elternId: schema.elternKind.elternId,
        name: schema.user.name,
        email: schema.user.email,
        kind: schema.lernende.anzeigename,
        beantragtVon: schema.elternKind.beendenBeantragtVon,
        beantragtAm: schema.elternKind.beendenBeantragtAm,
      })
      .from(schema.elternKind)
      .innerJoin(schema.user, eq(schema.user.id, schema.elternKind.elternId))
      .innerJoin(schema.lernende, eq(schema.lernende.id, schema.elternKind.lernendeId))
      .where(
        and(
          isNotNull(schema.elternKind.beendenBeantragtAm),
          ne(schema.elternKind.elternId, entscheider.benutzerId),
          sql`(${schema.elternKind.beendenBeantragtVon} is null or ${schema.elternKind.beendenBeantragtVon} <> ${entscheider.benutzerId})`,
        ),
      )
      .orderBy(asc(schema.elternKind.beendenBeantragtAm)),
  ]);
  const n = await namen([...einladungen.map((x) => x.erstelltVon), ...bezuege.map((x) => x.beantragtVon)]);
  return {
    einladungen: einladungen.map((x) => ({
      id: x.id,
      name: x.name,
      email: x.email,
      kind: x.kind,
      beantragtVonName: x.erstelltVon ? (n.get(x.erstelltVon) ?? null) : null,
      beantragtAm: x.erstelltAm,
    })),
    bezuege: bezuege.map((x) => ({
      lernendeId: x.lernendeId,
      elternId: x.elternId,
      name: x.name,
      email: x.email,
      kind: x.kind,
      beantragtVonName: x.beantragtVon ? (n.get(x.beantragtVon) ?? null) : null,
      beantragtAm: x.beantragtAm ?? new Date(0),
    })),
  };
}

const SPRACHEN: readonly MailSprache[] = ['de', 'tr', 'en'];
const TAG = 86_400_000;

/**
 * Über eine wartende Eltern-Einladung entscheiden (zweite Person). Bestätigen: neuer Token, Gültigkeit ab jetzt (so lang
 * wie ursprünglich gewählt), Mail an die eingeladene Adresse. Ablehnen: Einladung widerrufen.
 */
export async function entscheideEinladung(
  entscheider: Entscheider,
  einladungId: string,
  bestaetigen: boolean,
): Promise<EntscheidungsFehler | null> {
  if (!darfAntraegeEntscheiden(entscheider.rollen)) return 'keinRecht';
  return db.transaction(async (tx): Promise<EntscheidungsFehler | null> => {
    const [e] = await tx.select().from(schema.einladung).where(eq(schema.einladung.id, einladungId)).for('update');
    if (!e || !e.freigabeNoetig || e.freigegebenAm || e.widerrufenAm || e.angenommenAm) return 'nichtGefunden';
    if (e.erstelltVon === entscheider.benutzerId || klein(e.email) === klein(entscheider.email)) return 'keinRecht';
    const jetzt = new Date();
    if (bestaetigen) {
      const token = zufallsToken();
      const dauer = Math.min(30 * TAG, Math.max(TAG, e.laeuftAb.getTime() - e.erstelltAm.getTime()));
      const laeuftAb = new Date(jetzt.getTime() + dauer);
      await tx
        .update(schema.einladung)
        .set({ tokenHash: sha256(token), laeuftAb, freigegebenVon: entscheider.benutzerId, freigegebenAm: jetzt })
        .where(eq(schema.einladung.id, e.id));
      const sprache = (SPRACHEN as readonly string[]).includes(e.sprache ?? '') ? (e.sprache as MailSprache) : 'de';
      await planeEinladungsMail(tx, { email: e.email, token, laeuftAb, sprache });
    } else {
      await tx.update(schema.einladung).set({ widerrufenAm: jetzt }).where(eq(schema.einladung.id, e.id));
    }
    await protokolliere(
      {
        benutzerId: entscheider.benutzerId,
        aktion: bestaetigen ? 'einladung.freigegeben' : 'einladung.abgelehnt',
        zielTyp: 'einladung',
        zielId: e.id,
        details: { erstelltVon: e.erstelltVon },
      },
      tx,
    );
    return null;
  });
}

/**
 * Beenden eines Eltern-Kind-Bezugs beantragen (Verwaltung, in eigener Transaktion). Mail an das Elternkonto, Hinweis an
 * Leitung und Kinderschutz. Rückgabe: 'beantragt', 'schon' (lief schon) oder 'nichtGefunden'.
 */
export async function beantrageBezugEnde(
  akteurId: string,
  lernendeId: string,
  elternId: string,
): Promise<'beantragt' | 'schon' | 'nichtGefunden'> {
  return db.transaction(async (tx) => {
    const ziel = and(eq(schema.elternKind.lernendeId, lernendeId), eq(schema.elternKind.elternId, elternId));
    const z = await tx
      .update(schema.elternKind)
      .set({ beendenBeantragtVon: akteurId, beendenBeantragtAm: new Date() })
      .where(and(ziel, isNull(schema.elternKind.beendenBeantragtAm)))
      .returning({ id: schema.elternKind.elternId });
    if (!z.length) {
      const [da] = await tx.select({ id: schema.elternKind.elternId }).from(schema.elternKind).where(ziel).limit(1);
      return da ? 'schon' : 'nichtGefunden';
    }
    await protokolliere(
      {
        benutzerId: akteurId,
        aktion: 'lernende.elternbezug_beenden_beantragt',
        zielTyp: 'lernende',
        zielId: lernendeId,
        details: { konto: elternId },
      },
      tx,
    );
    await meldeAnElternkonto(tx, elternId, 'beenden');
    await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'elternbezug_beenden', pfad: '/verwaltung/gemeinde-im-blick' }, tx);
    return 'beantragt';
  });
}

/**
 * Über das Beenden eines Eltern-Kind-Bezugs entscheiden (zweite Person; nie das Elternkonto selbst, nie wer beantragt
 * hat). Bestätigen löscht den Bezug und meldet es dem Elternkonto; Ablehnen nimmt den Antrag zurück. Mit dem Bezug endet
 * die Einwilligung `lernapp` dieses Elternteils für das Kind; danach gehen Schreibabgaben und Lernstand des Kindes, die
 * nur sie deckte (SL2-Rest, `lernapp/schreiben/folgen.ts`).
 */
export async function entscheideBezugEnde(
  entscheider: Entscheider,
  lernendeId: string,
  elternId: string,
  bestaetigen: boolean,
): Promise<EntscheidungsFehler | null> {
  if (!darfAntraegeEntscheiden(entscheider.rollen)) return 'keinRecht';
  let lernapp: string[] = [];
  const ergebnis = await db.transaction(async (tx: Transaktion): Promise<EntscheidungsFehler | null> => {
    const ziel = and(eq(schema.elternKind.lernendeId, lernendeId), eq(schema.elternKind.elternId, elternId));
    const [b] = await tx.select().from(schema.elternKind).where(ziel).for('update');
    if (!b || !b.beendenBeantragtAm) return 'nichtGefunden';
    if (b.elternId === entscheider.benutzerId || b.beendenBeantragtVon === entscheider.benutzerId) return 'keinRecht';
    if (bestaetigen) {
      await tx.delete(schema.elternKind).where(ziel);
      lernapp = await beendeLernappDerEltern(tx, elternId, lernendeId);
      await meldeAnElternkonto(tx, elternId, 'beendet');
      await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'elternbezug_beendet', pfad: '/verwaltung/gemeinde-im-blick' }, tx);
    } else {
      await tx.update(schema.elternKind).set({ beendenBeantragtVon: null, beendenBeantragtAm: null }).where(ziel);
    }
    await protokolliere(
      {
        benutzerId: entscheider.benutzerId,
        aktion: bestaetigen ? 'lernende.elternbezug_beendet' : 'lernende.elternbezug_beenden_abgelehnt',
        zielTyp: 'lernende',
        zielId: lernendeId,
        details: { konto: elternId, beantragtVon: b.beendenBeantragtVon },
      },
      tx,
    );
    return null;
  });
  // Folgen erst nach dem Speichern: Dann zählt die beendete Einwilligung schon nicht mehr
  if (lernapp.length) await folgenNachBezugsende(lernapp, entscheider.benutzerId);
  return ergebnis;
}
