import 'server-only';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { FreigabeBaustein, Pruefung } from '@/lib/lernapp/freigabe';
import type { BauErgebnis } from '@/lib/lernapp/paket/bauen';
import { quellenzeile } from '@/lib/lernapp/paket/quellenzeile';
import { baueWissensEinheit, type WissensEinheitEingabe } from '@/lib/lernapp/paket/wissen';
import { inBloecken } from './bloecke';
import { ladePruefungen } from './pruefungen';

/**
 * Wissenskurs aus der Datenbank für den Paketbau (ADR 0040 Nr. 5, KERN 4.0 §2.3, PLAN §6.7 Nr. 7): Einheiten, Lektionen,
 * Aussagen mit Belegen und Quizfragen des Kurses `islam` samt religiösen Prüfungen. Die Freigabelage jedes Bausteins entsteht
 * genau wie in der Prüfoberfläche (`queries/lernapp/religioes.ts`): Lektion und Quizfrage ohne Belege, Aussage mit
 * Belegpflicht und ihren aktuellen Belegen, Verfasser = wer zuletzt geändert hat. Ob etwas ausgeliefert wird, entscheiden
 * allein `freigabe.ts` und `paket/wissen.ts` (`sichtbareWissensLektion`). Ungecacht; die gecachten Wege stehen in `pakete.ts`.
 *
 * Quellenzeile je Aussage aus den Belegen (`paket/quellenzeile.ts`), nie der Wortlaut der Quelle.
 *
 * Abbildung Inhaltsdatei → Datenbank, die dieses Modul liest (Vertrag für den künftigen Wissens-Import; die Vertragsprobe
 * `tests/unit/lernapp/wissen-vertrag.test.ts` spielt sie mit allen echten Dateien `inhalte/lernapp/islam/**` durch):
 * - `lernapp_lektion`: `ziel.de` = `titel` der Lektion, `kinderGeeignet`, Reihenfolge wie in der Datei.
 * - `lernapp_aussage`: `text`, `strittig`, Reihenfolge wie in der Datei; Belege in `lernapp_beleg` (`stelle.kitab` = `kapitel`,
 *   `band`, `seite`, `passage`) mit Werk, Autor und Ausgabe aus `lernapp_quelle`.
 * - `lernapp_aufgabe`: `typ`, `daten` = die Quizfrage der Datei ohne `schluessel`, `typ`, `aussage`, `quelle`, `lizenz` (bei
 *   `zuordnen`/`reihenfolge` also mit der inhaltlichen `anweisung`), `aussageId` = die Aussage mit dem Schlüssel `aussage` in
 *   derselben Einheit.
 */

/** Bausteine der Einheiten des Wissenskurses (bzw. einer). Leer, wenn der Kurs nicht aktiv ist. */
export async function ladeWissensEingaben(einheit?: string): Promise<WissensEinheitEingabe[]> {
  const [kurs] = await db.select({ aktiv: schema.lernappKurs.aktiv }).from(schema.lernappKurs).where(eq(schema.lernappKurs.id, 'islam'));
  if (!kurs?.aktiv) return [];
  const einheiten = await db
    .select({
      id: schema.lernappEinheit.id,
      schluessel: schema.lernappEinheit.schluessel,
      stufe: schema.lernappAbschnitt.stufe,
      reihenfolge: schema.lernappEinheit.reihenfolge,
      thema: schema.lernappEinheit.thema,
      symbol: schema.lernappEinheit.symbol,
      status: schema.lernappEinheit.status,
    })
    .from(schema.lernappEinheit)
    .innerJoin(schema.lernappAbschnitt, eq(schema.lernappAbschnitt.id, schema.lernappEinheit.abschnittId))
    .where(and(eq(schema.lernappAbschnitt.kursId, 'islam'), einheit ? eq(schema.lernappEinheit.schluessel, einheit) : undefined))
    .orderBy(asc(schema.lernappAbschnitt.reihenfolge), asc(schema.lernappEinheit.reihenfolge), asc(schema.lernappEinheit.schluessel));
  if (!einheiten.length) return [];

  const nachReihe = <T extends { reihenfolge: number; schluessel: string }>(liste: T[]) =>
    liste.sort((a, b) => a.reihenfolge - b.reihenfolge || (a.schluessel < b.schluessel ? -1 : a.schluessel > b.schluessel ? 1 : 0));
  const lektionen = nachReihe(
    await inBloecken(
      einheiten.map((e) => e.id),
      (block) => db.select().from(schema.lernappLektion).where(inArray(schema.lernappLektion.einheitId, block)),
    ),
  );
  const lektionIds = lektionen.map((l) => l.id);
  const [aussagen, aufgaben] = await Promise.all([
    inBloecken(lektionIds, (block) => db.select().from(schema.lernappAussage).where(inArray(schema.lernappAussage.lektionId, block))),
    inBloecken(lektionIds, (block) => db.select().from(schema.lernappAufgabe).where(inArray(schema.lernappAufgabe.lektionId, block))),
  ]);
  nachReihe(aussagen);
  nachReihe(aufgaben);
  const belege = await inBloecken(
    aussagen.map((a) => a.id),
    (block) =>
      db
        .select({
          id: schema.lernappBeleg.id,
          aussageId: schema.lernappBeleg.aussageId,
          inhaltHash: schema.lernappBeleg.inhaltHash,
          passage: schema.lernappBeleg.passage,
          stelle: schema.lernappBeleg.stelle,
          werk: schema.lernappQuelle.werk,
          autor: schema.lernappQuelle.autor,
          ausgabe: schema.lernappQuelle.ausgabe,
        })
        .from(schema.lernappBeleg)
        .innerJoin(schema.lernappQuelle, eq(schema.lernappQuelle.id, schema.lernappBeleg.quelleId))
        .where(inArray(schema.lernappBeleg.aussageId, block)),
  );
  // Reihenfolge wie die Prüfoberfläche (`belegeZu`): nach Passage, dann Kennung
  belege.sort((a, b) => (a.passage < b.passage ? -1 : a.passage > b.passage ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const pruefungen = await ladePruefungen([
    ...lektionen.map((x) => ({ typ: 'lektion' as const, id: x.id })),
    ...aussagen.map((x) => ({ typ: 'aussage' as const, id: x.id })),
    ...aufgaben.map((x) => ({ typ: 'aufgabe' as const, id: x.id })),
  ]);
  const p = (typ: 'lektion' | 'aussage' | 'aufgabe', id: string): Pruefung[] => pruefungen.get(`${typ}:${id}`) ?? [];
  const belegeJe = new Map<string, typeof belege>();
  for (const b of belege) if (b.aussageId) belegeJe.set(b.aussageId, [...(belegeJe.get(b.aussageId) ?? []), b]);

  // Freigabelage wie in `queries/lernapp/religioes.ts` (ladeLektionen, ladeAussagen, ladeAufgaben)
  const ohneBelege = (
    x: { status: FreigabeBaustein['status']; inhaltHash: string; verfasstVon: string | null },
    typ: 'lektion' | 'aufgabe',
    id: string,
  ) =>
    ({
      status: x.status,
      baustein: { inhaltHash: x.inhaltHash, verfasser: [x.verfasstVon], belege: [], belegPflicht: false, art: typ },
      pruefungen: p(typ, id),
    }) satisfies FreigabeBaustein;

  const aussageRoh = new Map(
    aussagen.map((a) => {
      const eigene = belegeJe.get(a.id) ?? [];
      return [
        a.id,
        {
          schluessel: a.schluessel,
          text: a.text,
          quelle: quellenzeile(eigene),
          strittig: a.strittig,
          freigabe: {
            status: a.status,
            baustein: {
              inhaltHash: a.inhaltHash,
              verfasser: [a.verfasstVon],
              belege: eigene.map((b) => ({ id: b.id, inhaltHash: b.inhaltHash })),
              belegPflicht: true,
              art: 'aussage',
            },
            pruefungen: p('aussage', a.id),
          } satisfies FreigabeBaustein,
        },
      ] as const;
    }),
  );

  // Einheit jeder Aussage: Eine Quizfrage zählt nur mit einer Aussage derselben Einheit. Sonst nennte das Verzeichnis (alle
  // Einheiten geladen) einen Hash, den die Einheitenroute (nur ihre Einheit geladen) nie liefert.
  const einheitDerLektion = new Map(lektionen.map((l) => [l.id, l.einheitId]));
  const einheitDerAussage = new Map(aussagen.map((a) => [a.id, einheitDerLektion.get(a.lektionId)]));

  return einheiten.map((e) => ({
    einheit: { schluessel: e.schluessel, stufe: e.stufe, reihenfolge: e.reihenfolge, thema: e.thema, symbol: e.symbol, status: e.status },
    lektionen: lektionen
      .filter((l) => l.einheitId === e.id)
      .map((l) => ({
        schluessel: l.schluessel,
        art: l.art,
        titel: l.ziel.de ?? null,
        kinderGeeignet: l.kinderGeeignet,
        freigabe: ohneBelege(l, 'lektion', l.id),
        aussagen: aussagen.filter((a) => a.lektionId === l.id).map((a) => aussageRoh.get(a.id)!),
        aufgaben: aufgaben
          .filter((a) => a.lektionId === l.id)
          .map((a) => ({
            schluessel: a.schluessel,
            typ: a.typ,
            daten: a.daten,
            // Aussage aus einer Lektion derselben Einheit; eine fehlende oder aus einer anderen Einheit → nie sichtbar
            aussage: (a.aussageId && einheitDerAussage.get(a.aussageId) === e.id && aussageRoh.get(a.aussageId)) || null,
            freigabe: ohneBelege(a, 'aufgabe', a.id),
          })),
      })),
  }));
}

/** Alle ausgelieferten Einheiten des Wissenskurses (bzw. eine), gebaut. */
export async function baueWissenskurs(einheit?: string): Promise<BauErgebnis[]> {
  return (await ladeWissensEingaben(einheit)).flatMap((e) => {
    const r = baueWissensEinheit(e);
    return r ? [r] : [];
  });
}
