import { and, eq, isNull, sql } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import type { Datenbank } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { einladungsLink, legeEinladungAn } from '@/lib/rechte/einladung-anlegen';

/**
 * Erstbefüllung im Vercel-Bau (E-047, Nachtrag ADR 0019 vom 28.10.2026): Ohne Rechner mit Zugang zur Datenbank gibt es
 * kein `pnpm db:seed` und kein `pnpm verwaltung:einladen` – der Production-Bau übernimmt beides auf Anforderung
 * (Bedingungen: scripts/erstbefuellung-regel.mjs, Aufruf: scripts/erstbefuellung.ts unter einer Postgres-Sperre).
 *
 * - **Seeds:** nur in eine Datenbank ohne Konten und nur, solange der Merker `erstbefuellung` in `einstellung` fehlt;
 *   danach nie wieder. Endgültig löschen kann nur ein Konto: Ohne Konto gibt es nichts, was die Seeds zurückbrächten,
 *   mit Konto (auch nach `pnpm db:seed` von Hand oder einer Wiederherstellung ohne Merker) spielt der Bau nichts ein und
 *   setzt nur den Merker. Scheitert ein Seed, bleibt der Merker aus (der nächste Bau versucht es erneut; die Seeds sind
 *   idempotent) und der Bau bricht ab.
 * - **Erstes Verwaltungskonto:** Zuerst widerruft der Bau offene Einladungen früherer Bauläufe (ihr Link stand nur im
 *   Bauprotokoll; es gilt der neueste), dann prüft er, ob ein Konto die Rolle `administration` hat – erst danach, damit
 *   eine gleichzeitig laufende Annahme entweder schon zählt oder an ihrem Widerruf scheitert (Zeilensperre, Annahme in
 *   `src/server/actions/anmeldung.ts`). Ohne Administration legt er die neue Einladung an. Gespeichert wird nur der Hash
 *   des Tokens (K-06), der Link erscheint nur in der Ausgabe. Eine Transaktionssperre ordnet gleichzeitige Bauläufe auch
 *   hinter dem Pooler nacheinander.
 */
export const ERSTBEFUELLUNG_MERKER = 'erstbefuellung';
/** Kennung der Bau-Einladungen in `einladung.erstellt_von`. */
export const VON_BAU = 'bau';
export const EINLADUNG_STUNDEN = 72;
/** Transaktionssperre der Bau-Einladung (neben 4242019, der Sitzungssperre von scripts/erstbefuellung.ts). */
export const EINLADUNG_SPERRE = 4_242_020;

export type ErstbefuellungPlan = { seed: boolean; einladung: { email: string; name: string } | null };
export type SeedLauf = (db: Datenbank) => Promise<{ fehler: string[] }>;

export type ErstbefuellungErgebnis = {
  seed: 'nicht_angefordert' | 'eingespielt' | 'schon_erfolgt' | 'konten_vorhanden';
  einladung:
    | { art: 'nicht_angefordert' }
    | { art: 'konto_vorhanden'; widerrufen: number }
    | { art: 'angelegt'; link: string; laeuftAb: Date; widerrufen: number };
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

async function spieleSeedsEin(db: Datenbank, seeds: SeedLauf, jetzt: Date): Promise<ErstbefuellungErgebnis['seed']> {
  const [merker] = await db
    .select({ schluessel: schema.einstellung.schluessel })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, ERSTBEFUELLUNG_MERKER))
    .limit(1);
  if (merker) return 'schon_erfolgt';
  const [konto] = await db.select({ id: schema.user.id }).from(schema.user).limit(1);
  if (!konto) {
    const { fehler } = await seeds(db);
    if (fehler.length)
      throw new Error(`Seeds mit Fehlern: ${fehler.join(', ')}. Merker nicht gesetzt, der nächste Bau versucht es erneut.`);
  }
  const ergebnis = konto ? 'konten_vorhanden' : 'eingespielt';
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.einstellung)
      .values({ schluessel: ERSTBEFUELLUNG_MERKER, wert: { am: jetzt.toISOString(), ergebnis }, geaendertVon: VON_BAU })
      .onConflictDoNothing({ target: schema.einstellung.schluessel });
    await protokolliere(
      {
        benutzerId: null,
        aktion: 'einstellung.geaendert',
        zielTyp: 'einstellung',
        zielId: ERSTBEFUELLUNG_MERKER,
        details: { quelle: VON_BAU, ergebnis },
      },
      tx,
    );
  });
  return ergebnis;
}

async function ladeErstesKontoEin(
  db: Datenbank,
  person: { email: string; name: string },
  basis: string,
  jetzt: Date,
): Promise<ErstbefuellungErgebnis['einladung']> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${EINLADUNG_SPERRE}::bigint)`);
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
    const [admin] = await tx
      .select({ id: schema.rolleZuweisung.id })
      .from(schema.rolleZuweisung)
      .where(eq(schema.rolleZuweisung.rolle, 'administration'))
      .limit(1);
    if (admin) return { art: 'konto_vorhanden', widerrufen: alt.length } as const;
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
