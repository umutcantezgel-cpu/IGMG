import 'server-only';
import { and, asc, eq, inArray, ne, sql } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema, type Transaktion } from '@/lib/db';
import { planeBetroffenenHinweis, planeHinweis, SCHUTZROLLEN_EMPFAENGER } from '@/lib/mail/ausgang';
import type { RollenZuweisung } from './matrix';

/**
 * Schutzrollen `leitung` und `kinderschutz` (S-11, ADR 0026; M-2 der Sicherheitsprüfung S1, S2/S3, Nacharbeit N4): Über
 * sie erreicht man Chat-Kontext aus Kindergruppen (kinderschutz) bzw. bestätigt man diese Vergabe (leitung). Damit die
 * Administration sie sich nicht über ein Zweitkonto selbst verschafft, gilt das Vier-Augen-Prinzip:
 * - Die Administration beantragt (`rollen_antrag`), eine zweite Person bestätigt – jemand mit wirksamer Rolle `leitung`
 *   oder `kinderschutz`, ohne Administration, weder die beantragende noch die betroffene Person.
 * - Einzige Ausnahme ist der Start: Solange noch NIE eine Leitung wirksam war, wird die erste Leitung sofort wirksam.
 *   Ein dauerhafter Merker (`einstellung` „schutzrollen_start“) hält fest, dass der Start vorbei ist – auch wenn später
 *   keine Leitung mehr da ist (N4: sonst holte sich die Administration die Ausnahme durch Entziehen zurück).
 * - Auch der ENTZUG von `leitung`, `kinderschutz` und `religioese_pruefung` bei anderen Konten braucht die zweite Person
 *   (Antrag `art = 'entzug'`); bis dahin bleibt die Rolle wirksam. Konten mit diesen Rollen löscht „Benutzer und Rollen“
 *   erst nach dem bestätigten Entzug. Vor dem Start (es gibt niemanden, der bestätigen könnte) wirkt der Entzug sofort.
 * - Nie zusammen mit `administration` in einem Konto; nie an sich selbst.
 * Jede Vergabe, jeder Antrag und jeder Entzug geht als Hinweis ohne Namen an alle Konten mit `leitung` oder
 * `kinderschutz`; beim Entzug erfährt es zusätzlich die betroffene Person.
 */
export const SCHUTZROLLEN = ['leitung', 'kinderschutz'] as const;
export type Schutzrolle = (typeof SCHUTZROLLEN)[number];

/** Rollen, deren Entzug bei anderen Konten eine zweite Person bestätigt (N4). */
export const ENTZUG_GESCHUETZT = ['leitung', 'kinderschutz', 'religioese_pruefung'] as const;
export type EntzugGeschuetzt = (typeof ENTZUG_GESCHUETZT)[number];

export type AntragArt = 'vergabe' | 'entzug';

/** Schlüssel des Merkers in `einstellung`: Der Start der Schutzrollen ist vorbei (eine Leitung war schon wirksam). */
export const START_MERKER = 'schutzrollen_start';

/** Transaktionssperre für Start-Prüfung, Vergabe und Entzug (gleichzeitige „erste Leitungen“ laufen nacheinander). */
const SPERRE = 'igmg:schutzrollen';

export function istSchutzrolle(rolle: string): rolle is Schutzrolle {
  return (SCHUTZROLLEN as readonly string[]).includes(rolle);
}

export function istEntzugGeschuetzt(rolle: string): rolle is EntzugGeschuetzt {
  return (ENTZUG_GESCHUETZT as readonly string[]).includes(rolle);
}

const hat = (rollen: readonly { rolle: string }[], rolle: string) => rollen.some((r) => r.rolle === rolle);

/**
 * Regeln vor jeder Vergabe (rein, ohne Datenbank): Schutzrollen nie zusammen mit `administration` und nie an sich selbst.
 * Rückgabe: Fehlerschlüssel oder null.
 */
export function schutzrollenRegel(
  vorher: readonly { rolle: string }[],
  neu: readonly { rolle: string }[],
  selbst: boolean,
): 'kinderschutzAdministration' | 'leitungAdministration' | 'kinderschutzSelbst' | 'leitungSelbst' | null {
  if (hat(neu, 'kinderschutz') && hat(neu, 'administration')) return 'kinderschutzAdministration';
  if (hat(neu, 'leitung') && hat(neu, 'administration')) return 'leitungAdministration';
  if (selbst && hat(neu, 'kinderschutz') && !hat(vorher, 'kinderschutz')) return 'kinderschutzSelbst';
  if (selbst && hat(neu, 'leitung') && !hat(vorher, 'leitung')) return 'leitungSelbst';
  return null;
}

async function sperre(tx: Pick<Transaktion, 'execute'>): Promise<void> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${SPERRE}))`);
}

/**
 * Ist der Start vorbei? Ja, sobald der dauerhafte Merker steht – oder (Bestand ohne Merker) eine Leitung eingetragen ist.
 * Danach braucht jede neue Schutzrolle und jeder Entzug eine zweite Person.
 */
export async function schutzrollenGestartet(tx: Pick<Transaktion, 'select'> = db): Promise<boolean> {
  const [merker] = await tx
    .select({ s: schema.einstellung.schluessel })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, START_MERKER))
    .limit(1);
  if (merker) return true;
  const [z] = await tx
    .select({ id: schema.rolleZuweisung.id })
    .from(schema.rolleZuweisung)
    .where(eq(schema.rolleZuweisung.rolle, 'leitung'))
    .limit(1);
  return Boolean(z);
}

/** Merker setzen (idempotent): Ab jetzt gibt es keine Start-Ausnahme mehr – nie wieder. */
async function markiereStart(
  tx: Pick<Transaktion, 'insert'>,
  quelle: 'start' | 'bestaetigt' | 'bestand',
  vonId: string | null,
): Promise<void> {
  await tx
    .insert(schema.einstellung)
    .values({ schluessel: START_MERKER, wert: { quelle, am: new Date().toISOString() }, geaendertVon: vonId })
    .onConflictDoNothing();
}

/**
 * Wie `schutzrollenGestartet`, schreibt aber den Merker nach, wenn eine Leitung ohne Merker eingetragen ist (Bestand) –
 * damit ein späterer Entzug dieser Leitung die Start-Ausnahme nicht zurückbringt. In der Transaktion unter der Sperre.
 */
async function gestartetMitMerker(tx: Pick<Transaktion, 'select' | 'insert'>, vonId: string | null): Promise<boolean> {
  const gestartet = await schutzrollenGestartet(tx);
  if (gestartet) await markiereStart(tx, 'bestand', vonId);
  return gestartet;
}

/**
 * Verwaltungsrollen eines Kontos eintragen (in der Transaktion des Aufrufers): alle übrigen Rollen sofort, Schutzrollen
 * als Antrag – außer der allerersten Leitung (Start). Bestehende Zuweisungen bleiben (onConflictDoNothing).
 * Rückgabe: die beantragten (noch nicht wirksamen) Schutzrollen.
 */
export async function vergibVerwaltungsrollen(
  tx: Transaktion,
  benutzerId: string,
  rollen: readonly RollenZuweisung[],
  vonId: string | null,
): Promise<Schutzrolle[]> {
  const beantragt: Schutzrolle[] = [];
  const sofort: Schutzrolle[] = [];
  if (rollen.some((z) => istSchutzrolle(z.rolle))) await sperre(tx);
  for (const z of rollen) {
    if (istSchutzrolle(z.rolle)) {
      const vorhanden = await tx
        .select({ id: schema.rolleZuweisung.id })
        .from(schema.rolleZuweisung)
        .where(and(eq(schema.rolleZuweisung.benutzerId, benutzerId), eq(schema.rolleZuweisung.rolle, z.rolle)))
        .limit(1);
      if (vorhanden.length) continue;
      if (z.rolle === 'kinderschutz' || (await gestartetMitMerker(tx, vonId))) {
        await tx
          .insert(schema.rollenAntrag)
          .values({ benutzerId, rolle: z.rolle, art: 'vergabe', beantragtVon: vonId })
          .onConflictDoNothing();
        beantragt.push(z.rolle);
        continue;
      }
      // Start: die allererste Leitung wirkt sofort – und beendet die Ausnahme dauerhaft
      sofort.push(z.rolle);
      await markiereStart(tx, 'start', vonId);
    }
    await tx
      .insert(schema.rolleZuweisung)
      .values({ benutzerId, rolle: z.rolle, organisation: z.organisation ?? null, erstelltVon: vonId })
      .onConflictDoNothing();
  }
  for (const rolle of beantragt)
    await protokolliere(
      { benutzerId: vonId, aktion: 'benutzer.rolle_beantragt', zielTyp: 'benutzer', zielId: benutzerId, details: { rolle } },
      tx,
    );
  for (const rolle of sofort)
    await protokolliere(
      { benutzerId: vonId, aktion: 'benutzer.leitung_start', zielTyp: 'benutzer', zielId: benutzerId, details: { rolle } },
      tx,
    );
  if (beantragt.length) await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'rollenantrag', pfad: '/verwaltung/gemeinde-im-blick' }, tx);
  if (sofort.length) await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'rolle_vergeben', pfad: '/verwaltung/gemeinde-im-blick' }, tx);
  return beantragt;
}

/** Adresse eines Kontos (für den Hinweis an die betroffene Person). */
async function adresse(tx: Pick<Transaktion, 'select'>, benutzerId: string): Promise<string | null> {
  const [u] = await tx.select({ email: schema.user.email }).from(schema.user).where(eq(schema.user.id, benutzerId)).limit(1);
  return u?.email ?? null;
}

export type EntzugErgebnis = {
  /** Entzug beantragt – die Rolle bleibt wirksam, bis eine zweite Person bestätigt. */
  beantragt: EntzugGeschuetzt[];
  /** Sofort entzogen (eigenes Konto oder vor dem Start). */
  entzogen: EntzugGeschuetzt[];
};

/**
 * Geschützte Rollen eines Kontos entziehen (in der Transaktion des Aufrufers, VOR dem Neuschreiben der Zuweisungen):
 * bei anderen Konten nach dem Start nur als Antrag – die Rolle bleibt bis zur Bestätigung wirksam; beim eigenen Konto und
 * vor dem Start sofort. Jeder Antrag und jeder Entzug geht an die betroffene Person und an Leitung und Kinderschutz.
 * Rückgabe: was beantragt und was entzogen ist. Der Aufrufer behält die beantragten Rollen in `rolle_zuweisung`.
 */
export async function entziehVerwaltungsrollen(
  tx: Transaktion,
  benutzerId: string,
  rollen: readonly EntzugGeschuetzt[],
  vonId: string,
): Promise<EntzugErgebnis> {
  const ergebnis: EntzugErgebnis = { beantragt: [], entzogen: [] };
  if (!rollen.length) return ergebnis;
  await sperre(tx);
  const sofort = !(await gestartetMitMerker(tx, vonId)) || benutzerId === vonId;
  const an = await adresse(tx, benutzerId);
  for (const rolle of rollen) {
    if (sofort) {
      ergebnis.entzogen.push(rolle);
      await protokolliere(
        { benutzerId: vonId, aktion: 'benutzer.rolle_entzogen', zielTyp: 'benutzer', zielId: benutzerId, details: { rolle, sofort: true } },
        tx,
      );
      if (an && benutzerId !== vonId) await planeBetroffenenHinweis({ an, art: 'rolle_entzogen', rolle }, tx);
      continue;
    }
    // Schon beantragt? Dann kein zweiter Antrag und keine zweite Mail
    const neu = await tx
      .insert(schema.rollenAntrag)
      .values({ benutzerId, rolle, art: 'entzug', beantragtVon: vonId })
      .onConflictDoNothing()
      .returning({ id: schema.rollenAntrag.id });
    ergebnis.beantragt.push(rolle);
    if (!neu.length) continue;
    await protokolliere(
      { benutzerId: vonId, aktion: 'benutzer.rolle_entzug_beantragt', zielTyp: 'benutzer', zielId: benutzerId, details: { rolle } },
      tx,
    );
    if (an) await planeBetroffenenHinweis({ an, art: 'rollenentzug', rolle }, tx);
  }
  if (ergebnis.entzogen.length)
    await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'rolle_entzogen', pfad: '/verwaltung/gemeinde-im-blick' }, tx);
  if (ergebnis.beantragt.length)
    await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'rollenentzug', pfad: '/verwaltung/gemeinde-im-blick' }, tx);
  return ergebnis;
}

/**
 * Ein Konto mit geschützter Rolle wurde gesperrt (N4): Die Sperre ist der Notweg, wirkt aber wie ein Entzug – daher
 * Hinweis an die betroffene Person und an Leitung und Kinderschutz. In der Transaktion des Aufrufers.
 */
export async function meldeSperreSchutzrolle(tx: Transaktion, benutzerId: string, rollen: readonly { rolle: string }[]): Promise<void> {
  if (!rollen.some((r) => istEntzugGeschuetzt(r.rolle))) return;
  const an = await adresse(tx, benutzerId);
  if (an) await planeBetroffenenHinweis({ an, art: 'gesperrt' }, tx);
  await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'schutzrolle_gesperrt', pfad: `/verwaltung/benutzer/${benutzerId}` }, tx);
}

export type OffenerAntrag = { rolle: EntzugGeschuetzt; art: AntragArt };

/** Offene Anträge eines Kontos (Anzeige in „Benutzer und Rollen“). */
export async function antraegeVon(benutzerId: string): Promise<OffenerAntrag[]> {
  const zeilen = await db
    .select({ rolle: schema.rollenAntrag.rolle, art: schema.rollenAntrag.art })
    .from(schema.rollenAntrag)
    .where(eq(schema.rollenAntrag.benutzerId, benutzerId));
  return zeilen.flatMap((z) => (istEntzugGeschuetzt(z.rolle) ? [{ rolle: z.rolle, art: z.art }] : []));
}

/** Darf diese Person über Anträge entscheiden (wirksame Leitung oder Kinderschutz, ohne Administration)? */
export function darfAntraegeEntscheiden(rollen: readonly { rolle: string }[]): boolean {
  return (hat(rollen, 'leitung') || hat(rollen, 'kinderschutz')) && !hat(rollen, 'administration');
}

export type RollenAntragZeile = {
  id: string;
  rolle: EntzugGeschuetzt;
  art: AntragArt;
  benutzerId: string;
  name: string;
  email: string;
  beantragtVon: string | null;
  beantragtVonName: string | null;
  beantragtAm: Date;
};

/**
 * Offene Anträge, über die diese Person entscheiden darf – nie über sich selbst und nie über eigene Anträge. Leere Liste,
 * wenn sie gar nicht entscheiden darf.
 */
export async function antraegeZurEntscheidung(entscheider: { benutzerId: string; rollen: readonly { rolle: string }[] }) {
  if (!darfAntraegeEntscheiden(entscheider.rollen)) return [];
  const zeilen = await db
    .select({
      id: schema.rollenAntrag.id,
      rolle: schema.rollenAntrag.rolle,
      art: schema.rollenAntrag.art,
      benutzerId: schema.rollenAntrag.benutzerId,
      name: schema.user.name,
      email: schema.user.email,
      beantragtVon: schema.rollenAntrag.beantragtVon,
      beantragtAm: schema.rollenAntrag.beantragtAm,
    })
    .from(schema.rollenAntrag)
    .innerJoin(schema.user, eq(schema.user.id, schema.rollenAntrag.benutzerId))
    .where(ne(schema.rollenAntrag.benutzerId, entscheider.benutzerId))
    .orderBy(asc(schema.rollenAntrag.beantragtAm));
  const eigene = zeilen.filter((z) => z.beantragtVon !== entscheider.benutzerId);
  const von = [...new Set(eigene.map((z) => z.beantragtVon).filter((x): x is string => Boolean(x)))];
  const namen = new Map(
    von.length
      ? (await db.select({ id: schema.user.id, name: schema.user.name }).from(schema.user).where(inArray(schema.user.id, von))).map((z) => [
          z.id,
          z.name,
        ])
      : [],
  );
  return eigene.flatMap((z): RollenAntragZeile[] =>
    istEntzugGeschuetzt(z.rolle)
      ? [{ ...z, rolle: z.rolle, beantragtVonName: z.beantragtVon ? (namen.get(z.beantragtVon) ?? null) : null }]
      : [],
  );
}

export type EntscheidungsFehler = 'nichtGefunden' | 'keinRecht' | 'administration';

/**
 * Über einen Antrag entscheiden (zweite Person). Vergabe bestätigen trägt die Rolle wirksam ein (eine bestätigte Leitung
 * beendet den Start dauerhaft); Entzug bestätigen nimmt sie heraus und meldet es der betroffenen Person. Ablehnen
 * verwirft den Antrag. Alles im Audit, Bestätigungen zusätzlich als Hinweis an Leitung und Kinderschutz.
 */
export async function entscheideAntrag(
  entscheider: { benutzerId: string; rollen: readonly { rolle: string }[] },
  antragId: string,
  bestaetigen: boolean,
): Promise<EntscheidungsFehler | null> {
  if (!darfAntraegeEntscheiden(entscheider.rollen)) return 'keinRecht';
  return db.transaction(async (tx): Promise<EntscheidungsFehler | null> => {
    await sperre(tx);
    // Eine Leitung aus dem Bestand (ohne Merker) beendet den Start, bevor ein Entzug sie herausnimmt
    await gestartetMitMerker(tx, entscheider.benutzerId);
    const [antrag] = await tx.select().from(schema.rollenAntrag).where(eq(schema.rollenAntrag.id, antragId)).for('update');
    if (!antrag || !istEntzugGeschuetzt(antrag.rolle)) return 'nichtGefunden';
    if (antrag.benutzerId === entscheider.benutzerId || antrag.beantragtVon === entscheider.benutzerId) return 'keinRecht';
    const entzug = antrag.art === 'entzug';
    if (bestaetigen && !entzug) {
      // Inzwischen Administration bekommen? Dann nie zusammen (S-11) – der Antrag bleibt, bis jemand ablehnt
      const [admin] = await tx
        .select({ id: schema.rolleZuweisung.id })
        .from(schema.rolleZuweisung)
        .where(and(eq(schema.rolleZuweisung.benutzerId, antrag.benutzerId), eq(schema.rolleZuweisung.rolle, 'administration')))
        .limit(1);
      if (admin) return 'administration';
    }
    await tx.delete(schema.rollenAntrag).where(eq(schema.rollenAntrag.id, antrag.id));
    if (bestaetigen && !entzug) {
      await tx
        .insert(schema.rolleZuweisung)
        .values({ benutzerId: antrag.benutzerId, rolle: antrag.rolle, erstelltVon: antrag.beantragtVon })
        .onConflictDoNothing();
      if (antrag.rolle === 'leitung') await markiereStart(tx, 'bestaetigt', entscheider.benutzerId);
      await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'rolle_vergeben', pfad: '/verwaltung/gemeinde-im-blick' }, tx);
    }
    if (bestaetigen && entzug) {
      await tx
        .delete(schema.rolleZuweisung)
        .where(and(eq(schema.rolleZuweisung.benutzerId, antrag.benutzerId), eq(schema.rolleZuweisung.rolle, antrag.rolle)));
      const an = await adresse(tx, antrag.benutzerId);
      if (an) await planeBetroffenenHinweis({ an, art: 'rolle_entzogen', rolle: antrag.rolle }, tx);
      await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'rolle_entzogen', pfad: '/verwaltung/gemeinde-im-blick' }, tx);
    }
    await protokolliere(
      {
        benutzerId: entscheider.benutzerId,
        aktion: entzug
          ? bestaetigen
            ? 'benutzer.rolle_entzogen'
            : 'benutzer.rolle_entzug_abgelehnt'
          : bestaetigen
            ? 'benutzer.rolle_bestaetigt'
            : 'benutzer.rolle_abgelehnt',
        zielTyp: 'benutzer',
        zielId: antrag.benutzerId,
        details: { rolle: antrag.rolle, beantragtVon: antrag.beantragtVon },
      },
      tx,
    );
    return null;
  });
}
