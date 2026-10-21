import 'server-only';
import { and, asc, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import pfadRoh from '../../../../inhalte/lernapp/koran/pfad.json';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { funktionAn } from '@/lib/funktionen';
import type { KoranPfadDatei } from '@/lib/lernapp/inhalt/schema';
import { type BedeutungsSprache, BEDEUTUNGS_SPRACHEN, type KoranWortZeit } from '@/lib/lernapp/koran/typen';
import {
  type KoranBauErgebnis,
  type KoranWortEingabe,
  baueKoranEinheit,
  baueKoranVerzeichnis,
  koranBedeutungHash,
} from '@/lib/lernapp/paket/koran';
import { inBloecken } from './bloecke';
import { ladePruefungen } from './pakete';

/**
 * Koran-Arabisch-Pfad aus `web/inhalte/lernapp/koran/pfad.json` (nur Verweise) und der Datenbank (L6-05, ADR 0040 Nr. 5):
 * Wortformen aus `quran_wort`/`quran_wortform` (gepinnter Tanzil-Text), Bedeutungen aus `quran_wortbedeutung` mit den
 * religiösen Prüfungen aus `lernapp_pruefung` (`inhaltTyp = 'koran_bedeutung'`, `inhaltId` = Kennung der Bedeutung,
 * `inhaltHash` = {@link koranBedeutungHash}; nicht an Stellen mit abweichender Bedeutung in `quran_wortbedeutung_ort`),
 * Wortzeiten nur geprüft und nur aktiver Rezitationen. Gecacht mit den Tags
 * `lernapp`, `lernapp-kurs-koran` (jede Freigabe und jedes Zurückziehen ruft `updateTag(TAG.lernappKurs('koran'))`),
 * `quran` (Bedeutungen bearbeitet), `rezitationen` und `einstellungen` (Schalter). Schalter `lernapp` aus → null.
 */

export const KORAN_PFAD = pfadRoh as unknown as KoranPfadDatei;

/** Quellenangaben im Paket (offline lesbar, ADR 0039 Nr. 9). */
const QUELLEN = [
  'Arabischer Text: Tanzil Project, Quran Text (Uthmani 1.1), tanzil.net, CC BY 3.0 – unverändert',
  'Bedeutungen: verfasst und zweifach geprüft in der Gemeinde, CC BY-SA 4.0',
];

const stelleVon = (w: { sure: number; vers: number; pos: number }) => `${w.sure}:${w.vers}:${w.pos}`;

/** Stellen einer Einheit (Wortformen und Ablenker). */
function stellenVon(einheiten: readonly KoranPfadDatei['einheiten'][number][]): string[] {
  return [
    ...new Set(
      einheiten.flatMap((e) => e.lektionen.flatMap((l) => [...l.wortformen, ...l.aufgaben.flatMap((a) => [a.wortform, ...a.ablenker])])),
    ),
  ];
}

/** Bausteine der Einheiten einer Sprache aus der Datenbank (ohne Cache; Tests und die gecachten Funktionen unten). */
export async function ladeKoranEingaben(
  sprache: BedeutungsSprache,
  nur?: string,
): Promise<{ einheit: KoranPfadDatei['einheiten'][number]; woerter: Map<string, KoranWortEingabe> }[]> {
  const einheiten = KORAN_PFAD.einheiten.filter((e) => !nur || e.schluessel === nur);
  if (!einheiten.length) return [];
  const stellen = stellenVon(einheiten).map((s) => s.split(':').map(Number) as [number, number, number]);

  // Wortformen an den Stellen (Zeilenwerte in Blöcken)
  const woerter = await inBloecken(stellen, (block) =>
    db
      .select({
        sure: schema.quranWort.sure,
        vers: schema.quranWort.vers,
        pos: schema.quranWort.pos,
        text: schema.quranWort.textAr,
        formId: schema.quranWort.formId,
        vorkommen: schema.quranWortform.vorkommen,
      })
      .from(schema.quranWort)
      .innerJoin(schema.quranWortform, eq(schema.quranWortform.id, schema.quranWort.formId))
      .where(
        sql`(${schema.quranWort.sure}, ${schema.quranWort.vers}, ${schema.quranWort.pos}) in (${sql.join(
          block.map(([s, v, p]) => sql`(${s}, ${v}, ${p})`),
          sql`, `,
        )})`,
      ),
  );
  // Abweichende Bedeutung an einer Stelle (`quran_wortbedeutung_ort`, gleich welcher Stand): Dort gilt die Bedeutung der Form
  // nicht – sie fehlt an dieser Stelle („Bedeutung folgt“), bis es für Stellen eigene Lern-App-Freigaben gibt.
  const abweichend = new Set(
    (
      await inBloecken(stellen, (block) =>
        db
          .select({
            sure: schema.quranWortbedeutungOrt.sure,
            vers: schema.quranWortbedeutungOrt.vers,
            pos: schema.quranWortbedeutungOrt.pos,
          })
          .from(schema.quranWortbedeutungOrt)
          .where(
            and(
              eq(schema.quranWortbedeutungOrt.sprache, sprache),
              sql`(${schema.quranWortbedeutungOrt.sure}, ${schema.quranWortbedeutungOrt.vers}, ${schema.quranWortbedeutungOrt.pos}) in (${sql.join(
                block.map(([s, v, p]) => sql`(${s}, ${v}, ${p})`),
                sql`, `,
              )})`,
            ),
          ),
      )
    ).map(stelleVon),
  );
  const formIds = [...new Set(woerter.map((w) => w.formId))];
  const bedeutungen = await inBloecken(formIds, (block) =>
    db
      .select({
        id: schema.quranWortbedeutung.id,
        formId: schema.quranWortbedeutung.formId,
        bedeutung: schema.quranWortbedeutung.bedeutung,
        verfasstVon: schema.quranWortbedeutung.verfasstVon,
      })
      .from(schema.quranWortbedeutung)
      .where(and(eq(schema.quranWortbedeutung.sprache, sprache), inArray(schema.quranWortbedeutung.formId, block))),
  );
  const pruefungen = await ladePruefungen(bedeutungen.map((b) => ({ typ: 'koran_bedeutung' as const, id: b.id })));
  const bedeutungJe = new Map(bedeutungen.map((b) => [b.formId, b]));

  // Wortzeiten: nur geprüft, nur aktive Rezitationen (Standard zuerst), mit Datei der Sure bzw. des Verses
  const zeiten = await inBloecken(stellen, (block) =>
    db
      .select({
        rezitation: schema.quranWortzeit.rezitationId,
        sure: schema.quranWortzeit.sure,
        vers: schema.quranWortzeit.vers,
        pos: schema.quranWortzeit.pos,
        startMs: schema.quranWortzeit.startMs,
        endeMs: schema.quranWortzeit.endeMs,
        standard: schema.quranRezitation.standard,
      })
      .from(schema.quranWortzeit)
      .innerJoin(schema.quranRezitation, eq(schema.quranRezitation.id, schema.quranWortzeit.rezitationId))
      .where(
        and(
          eq(schema.quranRezitation.aktiv, true),
          eq(schema.quranWortzeit.geprueft, true),
          sql`(${schema.quranWortzeit.sure}, ${schema.quranWortzeit.vers}, ${schema.quranWortzeit.pos}) in (${sql.join(
            block.map(([s, v, p]) => sql`(${s}, ${v}, ${p})`),
            sql`, `,
          )})`,
        ),
      )
      .orderBy(desc(schema.quranRezitation.standard), asc(schema.quranWortzeit.rezitationId)),
  );
  const dateien = zeiten.length
    ? await db
        .select({
          rezitation: schema.quranAudio.rezitationId,
          sure: schema.quranAudio.sure,
          vers: schema.quranAudio.vers,
          pfad: schema.quranAudio.pfad,
        })
        .from(schema.quranAudio)
        .where(
          or(
            ...[...new Set(zeiten.map((z) => `${z.rezitation}|${z.sure}`))].map((k) => {
              const [rezitation, sure] = k.split('|');
              return and(eq(schema.quranAudio.rezitationId, rezitation!), eq(schema.quranAudio.sure, Number(sure)));
            }),
          ),
        )
    : [];
  const zeitJe = new Map<string, KoranWortZeit>();
  for (const z of zeiten) {
    const k = stelleVon(z);
    if (zeitJe.has(k)) continue;
    const datei =
      dateien.find((d) => d.rezitation === z.rezitation && d.sure === z.sure && d.vers === z.vers) ??
      dateien.find((d) => d.rezitation === z.rezitation && d.sure === z.sure && d.vers === 0);
    if (datei && z.endeMs > z.startMs)
      zeitJe.set(k, { adresse: datei.pfad, startMs: z.startMs, endeMs: z.endeMs, rezitation: z.rezitation });
  }

  const eingabe = new Map<string, KoranWortEingabe>();
  for (const w of woerter) {
    const b = abweichend.has(stelleVon(w)) ? undefined : bedeutungJe.get(w.formId);
    const zeit = zeitJe.get(stelleVon(w));
    eingabe.set(stelleVon(w), {
      text: w.text,
      vorkommen: w.vorkommen,
      bedeutung: b
        ? {
            text: b.bedeutung,
            freigabe: {
              // Status: gesperrt gibt es nur über Prüfungen (abgelehnt/Änderungsvorschlag); sonst entscheiden die Freigaben
              status: 'veroeffentlicht',
              baustein: {
                inhaltHash: koranBedeutungHash({ formId: w.formId, sprache, bedeutung: b.bedeutung }),
                verfasser: [b.verfasstVon],
                belege: [],
                belegPflicht: false,
              },
              pruefungen: pruefungen.get(`koran_bedeutung:${b.id}`) ?? [],
            },
          }
        : null,
      ...(zeit ? { zeit } : {}),
    });
  }
  return einheiten.map((einheit) => ({ einheit, woerter: eingabe }));
}

/** Alle Einheiten einer Sprache (bzw. eine), gebaut. */
export async function baueKoranPfad(sprache: BedeutungsSprache, nur?: string): Promise<KoranBauErgebnis[]> {
  return (await ladeKoranEingaben(sprache, nur)).map((e) => baueKoranEinheit({ ...e, sprache, quellen: QUELLEN }));
}

const TAGS = () => cacheTag(TAG.lernapp, TAG.lernappKurs('koran'), TAG.quran, TAG.rezitationen, TAG.einstellungen);

/** Verzeichnis einer Sprache als JSON (gecacht); null, wenn die Lern-App aus ist oder keine Datenbank läuft. */
export async function ladeKoranVerzeichnisJson(sprache: BedeutungsSprache): Promise<string | null> {
  'use cache: remote';
  cacheLife('max');
  TAGS();
  if (!(await funktionAn('lernapp')) || !datenbankVerfuegbar()) return null;
  return JSON.stringify(baueKoranVerzeichnis(sprache, await baueKoranPfad(sprache)));
}

/** Einheitenpaket als kanonisches JSON mit Hash (gecacht); null, wenn aus oder unbekannt. */
export async function ladeKoranEinheitJson(sprache: BedeutungsSprache, einheit: string): Promise<{ hash: string; json: string } | null> {
  'use cache: remote';
  cacheLife('max');
  TAGS();
  if (!(await funktionAn('lernapp')) || !datenbankVerfuegbar()) return null;
  const [r] = await baueKoranPfad(sprache, einheit);
  return r ? { hash: r.hash, json: r.json } : null;
}

/** Statische Parameter der Pakete: je Sprache die erste Einheit (Cache Components verlangt einen), sonst ein Platzhalter. */
export async function ladeKoranPaketParameter(): Promise<{ sprache: string; einheit: string; hash: string }[]> {
  'use cache: remote';
  cacheLife('max');
  TAGS();
  const liste: { sprache: string; einheit: string; hash: string }[] = [];
  const erste = KORAN_PFAD.einheiten[0]?.schluessel;
  if (erste && datenbankVerfuegbar() && (await funktionAn('lernapp')))
    for (const sprache of BEDEUTUNGS_SPRACHEN) {
      const [r] = await baueKoranPfad(sprache, erste);
      if (r) liste.push({ sprache, einheit: erste, hash: r.hash });
    }
  return liste.length ? liste : [{ sprache: 'de', einheit: 'koran.grund.e01', hash: '0'.repeat(64) }];
}

export type KoranSichtbarkeit = {
  /** gezeigte Bedeutungen (Wortliste und Optionen) über beide Sprachen */
  sichtbar: number;
  /** Lektionen mit Übungen über beide Sprachen */
  lektionen: number;
  verstoesse: string[];
};

/**
 * Abfrage am Live-Stand (Tor L6, Z-L03; Tor L6 „Integration + Abfrage“): baut alle Pakete beider Sprachen und prüft jede
 * gezeigte Bedeutung gegen die Datenbank, ohne `freigabe.ts` zu fragen – Text gleich der Zeile in `quran_wortbedeutung`,
 * keine Abweichung an der Stelle, mindestens zwei Personen mit Rolle `religioese_pruefung`, deren jüngste religiöse Prüfung
 * zum aktuellen Hash „ok“ ist und die nicht verfasst haben, und niemand mit der Rolle, der zum aktuellen Hash zuletzt anders
 * urteilt. Dazu: Wortformen nur aus `quran_wort`, kein Audio-Feld, Wortzeiten nur geprüft. `pnpm lernapp:koran-sichtbar`.
 */
export async function pruefeKoranSichtbarkeit(): Promise<KoranSichtbarkeit> {
  const verstoesse: string[] = [];
  let sichtbar = 0;
  let lektionen = 0;
  for (const sprache of BEDEUTUNGS_SPRACHEN) {
    const gebaut = await baueKoranPfad(sprache);
    const gezeigt = new Map<string, string>();
    const texte = new Map<string, string>();
    const zeiten = new Map<string, KoranWortZeit>();
    for (const { paket, json } of gebaut) {
      if (/"(audio|stimme|clip|tts)"\s*:/.test(json)) verstoesse.push(`${sprache} ${paket.einheit.schluessel}: Audio-Feld im Paket`);
      for (const w of paket.woerter) {
        if (w.text) texte.set(w.stelle, w.text);
        if (w.bedeutung) gezeigt.set(w.stelle, w.bedeutung);
        if (w.zeit) zeiten.set(w.stelle, w.zeit);
      }
      lektionen += paket.lektionen.length;
      for (const l of paket.lektionen)
        for (const a of l.aufgaben) {
          if (a.typ !== 'koran_wort') {
            verstoesse.push(`${sprache} ${a.schluessel}: Aufgabe ${a.typ} im Koran-Pfad`);
            continue;
          }
          texte.set(a.wort.stelle, a.wort.text);
          for (const o of a.optionen) {
            const stelle = o.kennung.replace(/^koran:/, '');
            if (gezeigt.has(stelle) && gezeigt.get(stelle) !== o.text) verstoesse.push(`${sprache} ${stelle}: Option weicht ab`);
            gezeigt.set(stelle, o.text);
          }
        }
    }
    sichtbar += gezeigt.size;
    const alle = [...new Set([...texte.keys(), ...gezeigt.keys()])].map((s) => s.split(':').map(Number) as [number, number, number]);
    const zeilen = await inBloecken(alle, (block) =>
      db
        .select({
          sure: schema.quranWort.sure,
          vers: schema.quranWort.vers,
          pos: schema.quranWort.pos,
          text: schema.quranWort.textAr,
          formId: schema.quranWort.formId,
        })
        .from(schema.quranWort)
        .where(
          sql`(${schema.quranWort.sure}, ${schema.quranWort.vers}, ${schema.quranWort.pos}) in (${sql.join(
            block.map(([s, v, p]) => sql`(${s}, ${v}, ${p})`),
            sql`, `,
          )})`,
        ),
    );
    const wortAn = new Map(zeilen.map((z) => [stelleVon(z), z]));
    for (const [stelle, text] of texte)
      if (wortAn.get(stelle)?.text !== text) verstoesse.push(`${sprache} ${stelle}: Wortform nicht aus quran_wort`);
    if (zeiten.size) {
      const geprueft = await inBloecken(
        [...zeiten.keys()].map((s) => s.split(':').map(Number) as [number, number, number]),
        (block) =>
          db
            .select({
              sure: schema.quranWortzeit.sure,
              vers: schema.quranWortzeit.vers,
              pos: schema.quranWortzeit.pos,
              rezitation: schema.quranWortzeit.rezitationId,
              startMs: schema.quranWortzeit.startMs,
              endeMs: schema.quranWortzeit.endeMs,
            })
            .from(schema.quranWortzeit)
            .innerJoin(schema.quranRezitation, eq(schema.quranRezitation.id, schema.quranWortzeit.rezitationId))
            .where(
              and(
                eq(schema.quranWortzeit.geprueft, true),
                eq(schema.quranRezitation.aktiv, true),
                sql`(${schema.quranWortzeit.sure}, ${schema.quranWortzeit.vers}, ${schema.quranWortzeit.pos}) in (${sql.join(
                  block.map(([s, v, p]) => sql`(${s}, ${v}, ${p})`),
                  sql`, `,
                )})`,
              ),
            ),
      );
      const echt = new Set(geprueft.map((z) => `${stelleVon(z)}|${z.rezitation}|${z.startMs}|${z.endeMs}`));
      for (const [stelle, z] of zeiten)
        if (!echt.has(`${stelle}|${z.rezitation}|${z.startMs}|${z.endeMs}`))
          verstoesse.push(`${sprache} ${stelle}: Wortzeit ohne geprüfte Rezitation`);
    }
    if (!gezeigt.size) continue;

    const orte = new Set(
      (
        await db
          .select({
            sure: schema.quranWortbedeutungOrt.sure,
            vers: schema.quranWortbedeutungOrt.vers,
            pos: schema.quranWortbedeutungOrt.pos,
          })
          .from(schema.quranWortbedeutungOrt)
          .where(eq(schema.quranWortbedeutungOrt.sprache, sprache))
      ).map(stelleVon),
    );
    const formen = [...new Set([...gezeigt.keys()].flatMap((s) => (wortAn.get(s) ? [wortAn.get(s)!.formId] : [])))];
    const bedeutungen = await inBloecken(formen, (block) =>
      db
        .select({
          id: schema.quranWortbedeutung.id,
          formId: schema.quranWortbedeutung.formId,
          bedeutung: schema.quranWortbedeutung.bedeutung,
          verfasstVon: schema.quranWortbedeutung.verfasstVon,
        })
        .from(schema.quranWortbedeutung)
        .where(and(eq(schema.quranWortbedeutung.sprache, sprache), inArray(schema.quranWortbedeutung.formId, block))),
    );
    const bedeutungJe = new Map(bedeutungen.map((b) => [b.formId, b]));
    // jüngste religiöse Prüfung je Person und Bedeutung, nur Personen mit der Rolle (Administration zählt nie)
    const pruefungen = await inBloecken(
      bedeutungen.map((b) => b.id),
      (block) =>
        db
          .selectDistinctOn([schema.lernappPruefung.inhaltId, schema.lernappPruefung.inhaltHash, schema.lernappPruefung.pruefendeId], {
            inhaltId: schema.lernappPruefung.inhaltId,
            inhaltHash: schema.lernappPruefung.inhaltHash,
            pruefendeId: schema.lernappPruefung.pruefendeId,
            urteil: schema.lernappPruefung.urteil,
          })
          .from(schema.lernappPruefung)
          .innerJoin(
            schema.rolleZuweisung,
            and(
              eq(schema.rolleZuweisung.benutzerId, schema.lernappPruefung.pruefendeId),
              eq(schema.rolleZuweisung.rolle, 'religioese_pruefung'),
            ),
          )
          .where(
            and(
              eq(schema.lernappPruefung.inhaltTyp, 'koran_bedeutung'),
              eq(schema.lernappPruefung.art, 'religioes'),
              inArray(schema.lernappPruefung.inhaltId, block),
            ),
          )
          .orderBy(
            schema.lernappPruefung.inhaltId,
            schema.lernappPruefung.inhaltHash,
            schema.lernappPruefung.pruefendeId,
            desc(schema.lernappPruefung.am),
          ),
    );
    for (const [stelle, text] of gezeigt) {
      const formId = wortAn.get(stelle)?.formId;
      const b = formId === undefined ? undefined : bedeutungJe.get(formId);
      if (!b || b.bedeutung !== text) {
        verstoesse.push(`${sprache} ${stelle}: Bedeutung ohne passende Zeile`);
        continue;
      }
      if (orte.has(stelle)) verstoesse.push(`${sprache} ${stelle}: abweichende Bedeutung an der Stelle`);
      const hash = koranBedeutungHash({ formId: b.formId, sprache, bedeutung: b.bedeutung });
      const zumHash = pruefungen.filter((p) => p.inhaltId === b.id && p.inhaltHash === hash);
      const ok = zumHash.filter((p) => p.urteil === 'ok' && p.pruefendeId !== b.verfasstVon).length;
      if (ok < 2) verstoesse.push(`${sprache} ${stelle}: ${ok} Freigabe(n) zum aktuellen Hash`);
      if (zumHash.some((p) => p.urteil !== 'ok')) verstoesse.push(`${sprache} ${stelle}: Einwand zum aktuellen Hash`);
    }
  }
  return { sichtbar, lektionen, verstoesse };
}
