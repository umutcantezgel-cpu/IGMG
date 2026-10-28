import { and, eq, isNull } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import type { Datenbank } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { einladungsLink, legeEinladungAn } from '@/lib/rechte/einladung-anlegen';

/**
 * Erstbefüllung im Vercel-Bau (E-047, Nachtrag ADR 0019 vom 28.10.2026): Ohne Rechner mit Zugang zur Datenbank gibt es
 * kein `pnpm db:seed` und kein `pnpm verwaltung:einladen` – der Production-Bau übernimmt beides auf Anforderung
 * (Bedingungen: scripts/erstbefuellung-regel.mjs, Aufruf: scripts/erstbefuellung.ts unter einer Postgres-Sperre).
 *
 * - **Seeds:** nur, solange der Merker `erstbefuellung` in `einstellung` fehlt; danach nie wieder – ein stehen gelassenes
 *   `ERSTBEFUELLUNG=1` legt endgültig gelöschte Beispielinhalte nicht neu an. Scheitert ein Seed, bleibt der Merker aus
 *   (der nächste Bau versucht es erneut; die Seeds sind idempotent) und der Bau bricht ab.
 * - **Erstes Verwaltungskonto:** Einladung mit Rolle `administration`, nur solange kein Konto diese Rolle hat. Offene
 *   Einladungen aus früheren Bauläufen werden widerrufen: Ihr Link stand nur im Bauprotokoll; es gilt der neueste.
 *   Gespeichert wird nur der Hash des Tokens (K-06), der Link erscheint nur in der Ausgabe.
 */
export const ERSTBEFUELLUNG_MERKER = 'erstbefuellung';
/** Kennung der Bau-Einladungen in `einladung.erstellt_von`. */
export const VON_BAU = 'bau';
export const EINLADUNG_STUNDEN = 72;

export type ErstbefuellungPlan = { seed: boolean; einladung: { email: string; name: string } | null };
export type SeedLauf = (db: Datenbank) => Promise<{ fehler: string[] }>;

export type ErstbefuellungErgebnis = {
  seed: 'nicht_angefordert' | 'eingespielt' | 'schon_erfolgt';
  einladung:
    { art: 'nicht_angefordert' } | { art: 'konto_vorhanden' } | { art: 'angelegt'; link: string; laeuftAb: Date; widerrufen: number };
};

export async function fuehreErstbefuellungAus(
  db: Datenbank,
  plan: ErstbefuellungPlan,
  optionen: { seeds: SeedLauf; basis: string; jetzt?: Date },
): Promise<ErstbefuellungErgebnis> {
  const jetzt = optionen.jetzt ?? new Date();
  const seed = plan.seed ? await spieleSeedsEin(db, optionen.seeds, jetzt) : 'nicht_angefordert';
  const einladung = plan.einladung
    ? await ladeErstesKontoEin(db, plan.einladung, optionen.basis, jetzt)
    : ({ art: 'nicht_angefordert' } as const);
  return { seed, einladung };
}

async function spieleSeedsEin(db: Datenbank, seeds: SeedLauf, jetzt: Date): Promise<'eingespielt' | 'schon_erfolgt'> {
  const [merker] = await db
    .select({ schluessel: schema.einstellung.schluessel })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, ERSTBEFUELLUNG_MERKER))
    .limit(1);
  if (merker) return 'schon_erfolgt';
  const { fehler } = await seeds(db);
  if (fehler.length) throw new Error(`Seeds mit Fehlern: ${fehler.join(', ')}. Merker nicht gesetzt, der nächste Bau versucht es erneut.`);
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.einstellung)
      .values({ schluessel: ERSTBEFUELLUNG_MERKER, wert: { am: jetzt.toISOString() }, geaendertVon: VON_BAU })
      .onConflictDoNothing({ target: schema.einstellung.schluessel });
    await protokolliere(
      {
        benutzerId: null,
        aktion: 'einstellung.geaendert',
        zielTyp: 'einstellung',
        zielId: ERSTBEFUELLUNG_MERKER,
        details: { quelle: VON_BAU },
      },
      tx,
    );
  });
  return 'eingespielt';
}

async function ladeErstesKontoEin(
  db: Datenbank,
  person: { email: string; name: string },
  basis: string,
  jetzt: Date,
): Promise<ErstbefuellungErgebnis['einladung']> {
  return db.transaction(async (tx) => {
    const [admin] = await tx
      .select({ id: schema.rolleZuweisung.id })
      .from(schema.rolleZuweisung)
      .where(eq(schema.rolleZuweisung.rolle, 'administration'))
      .limit(1);
    if (admin) return { art: 'konto_vorhanden' } as const;
    const alt = await tx
      .update(schema.einladung)
      .set({ widerrufenAm: jetzt })
      .where(and(eq(schema.einladung.erstelltVon, VON_BAU), isNull(schema.einladung.angenommenAm), isNull(schema.einladung.widerrufenAm)))
      .returning({ id: schema.einladung.id });
    for (const { id } of alt)
      await protokolliere(
        { benutzerId: null, aktion: 'einladung.widerrufen', zielTyp: 'einladung', zielId: id, details: { quelle: VON_BAU } },
        tx,
      );
    const neu = await legeEinladungAn(
      tx,
      { ...person, rollen: [{ rolle: 'administration' }], stunden: EINLADUNG_STUNDEN, erstelltVon: VON_BAU },
      jetzt,
    );
    await protokolliere(
      { benutzerId: null, aktion: 'einladung.erstellt', zielTyp: 'einladung', zielId: neu.id, details: { rollen: 1, quelle: VON_BAU } },
      tx,
    );
    return { art: 'angelegt', link: einladungsLink(basis, neu.token, true), laeuftAb: neu.laeuftAb, widerrufen: alt.length } as const;
  });
}
