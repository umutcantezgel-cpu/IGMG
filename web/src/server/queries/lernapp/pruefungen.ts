import 'server-only';
import { db, schema } from '@/lib/db';
import type { Pruefung } from '@/lib/lernapp/freigabe';
import { inBloecken, inListe } from './bloecke';

/**
 * Prüfungen der Lern-App-Bausteine aus `lernapp_pruefung`, ergänzt um die aktuellen Rollen der Prüfenden (`freigabe.ts` zählt
 * nur Personen, die die Rolle heute haben). Gemeinsam für Paketbau (Sprachkurse, Wissenskurs, Koran-Pfad) und Verwaltung.
 */

type InhaltTyp = (typeof schema.lernappInhaltTypEnum.enumValues)[number];

/** Prüfungen je Baustein (`<typ>:<id>`), ergänzt um die aktuellen Rollen der Prüfenden (freigabe.ts); in Blöcken. */
export async function ladePruefungen(ids: readonly { typ: InhaltTyp; id: string }[]): Promise<Map<string, Pruefung[]>> {
  const ergebnis = new Map<string, Pruefung[]>();
  if (!ids.length) return ergebnis;
  const zeilen = await inBloecken(
    ids.map((x) => x.id),
    (block) =>
      db
        .select({
          inhaltTyp: schema.lernappPruefung.inhaltTyp,
          inhaltId: schema.lernappPruefung.inhaltId,
          inhaltHash: schema.lernappPruefung.inhaltHash,
          art: schema.lernappPruefung.art,
          pruefendeId: schema.lernappPruefung.pruefendeId,
          urteil: schema.lernappPruefung.urteil,
          kategorie: schema.lernappPruefung.kategorie,
          belegeGeprueft: schema.lernappPruefung.belegeGeprueft,
          am: schema.lernappPruefung.am,
        })
        .from(schema.lernappPruefung)
        .where(inListe(schema.lernappPruefung.inhaltId, block)),
  );
  if (!zeilen.length) return ergebnis;
  const personen = zeilen.flatMap((z) => (z.pruefendeId ? [z.pruefendeId] : []));
  const rollen = new Map<string, string[]>();
  for (const r of await inBloecken(personen, (block) =>
    db
      .select({ benutzerId: schema.rolleZuweisung.benutzerId, rolle: schema.rolleZuweisung.rolle })
      .from(schema.rolleZuweisung)
      .where(inListe(schema.rolleZuweisung.benutzerId, block)),
  ))
    rollen.set(r.benutzerId, [...(rollen.get(r.benutzerId) ?? []), r.rolle]);
  for (const z of zeilen) {
    const k = `${z.inhaltTyp}:${z.inhaltId}`;
    ergebnis.set(k, [
      ...(ergebnis.get(k) ?? []),
      {
        pruefendeId: z.pruefendeId,
        pruefendeRollen: z.pruefendeId ? (rollen.get(z.pruefendeId) ?? []) : [],
        art: z.art,
        urteil: z.urteil,
        inhaltHash: z.inhaltHash,
        kategorie: z.kategorie,
        belegeGeprueft: z.belegeGeprueft,
        am: z.am,
      },
    ]);
  }
  return ergebnis;
}
