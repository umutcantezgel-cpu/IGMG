import { and, eq } from 'drizzle-orm';
import { PROJEKTE_BEISPIEL, PROJEKTE_QUELLE } from '../../../drizzle/seeds/bereiche/projekte';
import { ZEITLEISTE_EROEFFNUNG, ZEITLEISTE_ZUKUNFT_DE } from '../../../drizzle/seeds/bereiche/ueber-uns';
import { protokolliere } from '@/lib/audit';
import type { Datenbank, Transaktion } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { schema as projekteSchema, type ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { schema as ueberUnsSchema, type UeberUnsInhalt } from '@/lib/validierung/seiteninhalte/ueber-uns';

/**
 * Inhaltsstand 2026 (AUFTRAG 3.9, Bericht E0-K05): Die neue Fatih-Moschee ist fertiggestellt. Bestehende Datenbanken
 * tragen noch den Beispielstand „in Planung“ bzw. die Zeitleisten-Station „Zukunft“. Diese Migration bringt **nur
 * Beispielinhalte** (`ist_beispiel = true`) auf den Stand der Seeds; was die Redaktion gespeichert hat
 * (`ist_beispiel = false`), bleibt unberührt. Idempotent: Ein zweiter Lauf ändert nichts und protokolliert nichts.
 * Jede Änderung schreibt einen Audit-Eintrag (ohne Personendaten). Aufruf: `pnpm inhalte:2026`.
 */
export const MIGRATION = 'inhalte-2026';

export type Ausgang = 'aktualisiert' | 'unveraendert' | 'redaktionell' | 'fehlt';
export type Ergebnis = { projekte: Ausgang; ueberUns: Ausgang };

/** JSON mit sortierten Schlüsseln: jsonb ordnet Schlüssel um, der Vergleich darf davon nicht abhängen. */
export function stabil(wert: unknown): string {
  if (Array.isArray(wert)) return `[${wert.map(stabil).join(',')}]`;
  if (wert && typeof wert === 'object')
    return `{${Object.keys(wert)
      .filter((k) => (wert as Record<string, unknown>)[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stabil((wert as Record<string, unknown>)[k])}`)
      .join(',')}}`;
  return JSON.stringify(wert);
}

/** Zielstand „projekte“; null, wenn der gespeicherte Inhalt ihn schon hat. */
export function projekteNeu(alt: unknown): ProjekteInhalt | null {
  const neu = projekteSchema.parse(PROJEKTE_BEISPIEL);
  return stabil(alt) === stabil(neu) ? null : neu;
}

/** Trägt die Zeitleiste schon die Station „Eröffnung der neuen Fatih-Moschee“ (Seed-Stand, Titel auf Deutsch)? */
function hatEroeffnung(zeitleiste: UeberUnsInhalt['zeitleiste']): boolean {
  const titel = ZEITLEISTE_EROEFFNUNG.titel.de.replace(/^\[[^\]]*\]\s*–\s*/, '');
  return zeitleiste.some((e) => e.titel.de.includes(titel));
}

/**
 * Zeitleiste mit der Station „Eröffnung der neuen Fatih-Moschee“ statt „Zukunft“. Endet der Beispielstand ohne
 * „Zukunft“ und ohne Eröffnung (z. B. bei 2019, H-B09: so stand er im Bild), wird die Eröffnung als letzte Station
 * angehängt (Reihenfolge nach der bisher letzten). null, wenn nichts zu tun ist (Eröffnung vorhanden, Zeitleiste leer
 * oder Inhalt ungültig). Alle übrigen Stationen bleiben unverändert.
 */
export function ueberUnsNeu(alt: unknown): UeberUnsInhalt | null {
  const gelesen = ueberUnsSchema.safeParse(alt);
  if (!gelesen.success) return null;
  const liste = gelesen.data.zeitleiste;
  const index = liste.findIndex((e) => e.kennzeichnung.de.trim() === ZEITLEISTE_ZUKUNFT_DE);
  if (index >= 0) {
    const zeitleiste = liste.map((e, i) => (i === index ? { ...ZEITLEISTE_EROEFFNUNG, reihenfolge: e.reihenfolge } : e));
    return ueberUnsSchema.parse({ ...gelesen.data, zeitleiste });
  }
  if (liste.length === 0 || hatEroeffnung(liste)) return null;
  const reihenfolge = Math.min(999, Math.max(...liste.map((e) => e.reihenfolge)) + 1);
  return ueberUnsSchema.parse({ ...gelesen.data, zeitleiste: [...liste, { ...ZEITLEISTE_EROEFFNUNG, reihenfolge }] });
}

async function zeile(tx: Transaktion, bereich: string) {
  const [z] = await tx
    .select({ inhalt: schema.seiteninhalt.inhalt, istBeispiel: schema.seiteninhalt.istBeispiel })
    .from(schema.seiteninhalt)
    .where(eq(schema.seiteninhalt.bereich, bereich))
    .limit(1);
  return z ?? null;
}

async function schreibe(tx: Transaktion, bereich: string, inhalt: unknown, quelle?: string): Promise<Ausgang> {
  const r = await tx
    .update(schema.seiteninhalt)
    // Nur solange es Beispielinhalt ist (gleichzeitiges Speichern in der Verwaltung gewinnt)
    .set({ inhalt, ...(quelle ? { quelle } : {}), aktualisiertVon: null })
    .where(and(eq(schema.seiteninhalt.bereich, bereich), eq(schema.seiteninhalt.istBeispiel, true)))
    .returning({ bereich: schema.seiteninhalt.bereich });
  if (!r.length) return 'redaktionell';
  await protokolliere(
    { benutzerId: null, aktion: 'inhalt.geaendert', zielTyp: 'seiteninhalt', zielId: bereich, details: { migration: MIGRATION } },
    tx,
  );
  return 'aktualisiert';
}

/** Führt die Migration in einer Transaktion aus und meldet je Bereich, was geschehen ist. */
export async function wendeStand2026An(db: Datenbank): Promise<Ergebnis> {
  return db.transaction(async (tx) => {
    const ergebnis: Ergebnis = { projekte: 'fehlt', ueberUns: 'fehlt' };
    const projekte = await zeile(tx, 'projekte');
    if (projekte) {
      const neu = projekte.istBeispiel ? projekteNeu(projekte.inhalt) : null;
      ergebnis.projekte = !projekte.istBeispiel
        ? 'redaktionell'
        : neu
          ? await schreibe(tx, 'projekte', neu, PROJEKTE_QUELLE)
          : 'unveraendert';
    }
    const ueberUns = await zeile(tx, 'ueber-uns');
    if (ueberUns) {
      const neu = ueberUns.istBeispiel ? ueberUnsNeu(ueberUns.inhalt) : null;
      ergebnis.ueberUns = !ueberUns.istBeispiel ? 'redaktionell' : neu ? await schreibe(tx, 'ueber-uns', neu) : 'unveraendert';
    }
    return ergebnis;
  });
}
