import 'server-only';
import { and, asc, eq, inArray, ne } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema, type Transaktion } from '@/lib/db';
import { planeHinweis, SCHUTZROLLEN_EMPFAENGER } from '@/lib/mail/ausgang';
import type { RollenZuweisung } from './matrix';

/**
 * Schutzrollen `leitung` und `kinderschutz` (S-11, ADR 0026; M-2 der Sicherheitsprüfung S1, S2/S3): Über sie erreicht man
 * Chat-Kontext aus Kindergruppen (kinderschutz) bzw. bestätigt man diese Vergabe (leitung). Damit die Administration sie
 * sich nicht über ein Zweitkonto selbst verschafft, gilt das Vier-Augen-Prinzip:
 * - Die Administration beantragt (`rollen_antrag`), eine zweite Person bestätigt – jemand mit wirksamer Rolle `leitung`
 *   oder `kinderschutz`, ohne Administration, weder die beantragende noch die betroffene Person.
 * - Einzige Ausnahme ist der Start: Gibt es noch keine Leitung, wird die erste Leitung sofort wirksam.
 * - Nie zusammen mit `administration` in einem Konto; nie an sich selbst.
 * Jede Vergabe und jeder Antrag geht als Hinweis ohne Namen an alle Konten mit `leitung` oder `kinderschutz`.
 */
export const SCHUTZROLLEN = ['leitung', 'kinderschutz'] as const;
export type Schutzrolle = (typeof SCHUTZROLLEN)[number];

export function istSchutzrolle(rolle: string): rolle is Schutzrolle {
  return (SCHUTZROLLEN as readonly string[]).includes(rolle);
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

/** Gibt es schon eine wirksame Leitung (dann braucht jede neue Schutzrolle eine Bestätigung)? */
async function leitungVorhanden(tx: Pick<Transaktion, 'select'>): Promise<boolean> {
  const [z] = await tx
    .select({ id: schema.rolleZuweisung.id })
    .from(schema.rolleZuweisung)
    .where(eq(schema.rolleZuweisung.rolle, 'leitung'))
    .limit(1);
  return Boolean(z);
}

/**
 * Verwaltungsrollen eines Kontos eintragen (in der Transaktion des Aufrufers): alle übrigen Rollen sofort, Schutzrollen
 * als Antrag – außer der allerersten Leitung. Bestehende Zuweisungen bleiben (onConflictDoNothing).
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
  for (const z of rollen) {
    if (istSchutzrolle(z.rolle)) {
      const vorhanden = await tx
        .select({ id: schema.rolleZuweisung.id })
        .from(schema.rolleZuweisung)
        .where(and(eq(schema.rolleZuweisung.benutzerId, benutzerId), eq(schema.rolleZuweisung.rolle, z.rolle)))
        .limit(1);
      if (vorhanden.length) continue;
      if (z.rolle === 'kinderschutz' || (await leitungVorhanden(tx))) {
        await tx.insert(schema.rollenAntrag).values({ benutzerId, rolle: z.rolle, beantragtVon: vonId }).onConflictDoNothing();
        beantragt.push(z.rolle);
        continue;
      }
      sofort.push(z.rolle);
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
  if (beantragt.length) await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'rollenantrag', pfad: '/verwaltung/gemeinde-im-blick' }, tx);
  if (sofort.length) await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'rolle_vergeben', pfad: '/verwaltung/gemeinde-im-blick' }, tx);
  return beantragt;
}

/** Offene Anträge eines Kontos (Anzeige in „Benutzer und Rollen“). */
export async function antraegeVon(benutzerId: string): Promise<Schutzrolle[]> {
  const zeilen = await db
    .select({ rolle: schema.rollenAntrag.rolle })
    .from(schema.rollenAntrag)
    .where(eq(schema.rollenAntrag.benutzerId, benutzerId));
  return zeilen.map((z) => z.rolle).filter(istSchutzrolle);
}

/** Darf diese Person über Anträge entscheiden (wirksame Leitung oder Kinderschutz, ohne Administration)? */
export function darfAntraegeEntscheiden(rollen: readonly { rolle: string }[]): boolean {
  return (hat(rollen, 'leitung') || hat(rollen, 'kinderschutz')) && !hat(rollen, 'administration');
}

export type RollenAntragZeile = {
  id: string;
  rolle: Schutzrolle;
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
    istSchutzrolle(z.rolle)
      ? [{ ...z, rolle: z.rolle, beantragtVonName: z.beantragtVon ? (namen.get(z.beantragtVon) ?? null) : null }]
      : [],
  );
}

export type EntscheidungsFehler = 'nichtGefunden' | 'keinRecht' | 'administration';

/**
 * Über einen Antrag entscheiden (zweite Person). Bestätigen trägt die Rolle wirksam ein; Ablehnen verwirft den Antrag.
 * Beides im Audit, die Bestätigung zusätzlich als Hinweis an Leitung und Kinderschutz.
 */
export async function entscheideAntrag(
  entscheider: { benutzerId: string; rollen: readonly { rolle: string }[] },
  antragId: string,
  bestaetigen: boolean,
): Promise<EntscheidungsFehler | null> {
  if (!darfAntraegeEntscheiden(entscheider.rollen)) return 'keinRecht';
  return db.transaction(async (tx): Promise<EntscheidungsFehler | null> => {
    const [antrag] = await tx.select().from(schema.rollenAntrag).where(eq(schema.rollenAntrag.id, antragId)).for('update');
    if (!antrag || !istSchutzrolle(antrag.rolle)) return 'nichtGefunden';
    if (antrag.benutzerId === entscheider.benutzerId || antrag.beantragtVon === entscheider.benutzerId) return 'keinRecht';
    if (bestaetigen) {
      // Inzwischen Administration bekommen? Dann nie zusammen (S-11) – der Antrag bleibt, bis jemand ablehnt
      const [admin] = await tx
        .select({ id: schema.rolleZuweisung.id })
        .from(schema.rolleZuweisung)
        .where(and(eq(schema.rolleZuweisung.benutzerId, antrag.benutzerId), eq(schema.rolleZuweisung.rolle, 'administration')))
        .limit(1);
      if (admin) return 'administration';
    }
    await tx.delete(schema.rollenAntrag).where(eq(schema.rollenAntrag.id, antrag.id));
    if (bestaetigen) {
      await tx
        .insert(schema.rolleZuweisung)
        .values({ benutzerId: antrag.benutzerId, rolle: antrag.rolle, erstelltVon: antrag.beantragtVon })
        .onConflictDoNothing();
      await planeHinweis({ an: SCHUTZROLLEN_EMPFAENGER, art: 'rolle_vergeben', pfad: '/verwaltung/gemeinde-im-blick' }, tx);
    }
    await protokolliere(
      {
        benutzerId: entscheider.benutzerId,
        aktion: bestaetigen ? 'benutzer.rolle_bestaetigt' : 'benutzer.rolle_abgelehnt',
        zielTyp: 'benutzer',
        zielId: antrag.benutzerId,
        details: { rolle: antrag.rolle, beantragtVon: antrag.beantragtVon },
      },
      tx,
    );
    return null;
  });
}
