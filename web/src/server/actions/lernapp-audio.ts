'use server';

import { createHash } from 'node:crypto';
import { and, eq, like } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { z } from 'zod';
import { audioFormat } from '@/lib/audio/format';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { type LernappZustand, mitLernappRecht } from '@/lib/lernapp/verwaltung/aktion';
import { AUFNAHME_MAX_BYTES, AUFNAHME_MAX_MS, aufnahmeSchluessel, vertonbar } from '@/lib/lernapp/verwaltung/audio';
import { kursGeaendert } from '@/lib/lernapp/veroeffentlichen';
import { MedienFehler, verarbeiteDatei } from '@/lib/medien/verarbeiten';
import { darf } from '@/lib/rechte/pruefe';
import { speicher } from '@/lib/storage';
import { ladeVertonbarenEintrag } from '@/server/queries/lernapp/audio-studio';

/**
 * Verwaltung › Lern-App › Audio-Studio (L3-06, ADR 0039 Nr. 8, KERN 4.0 §4). Recht `lernapp.audio.bearbeiten` (Bildung,
 * Administration), Schalter `lernapp`; Audit ohne Inhalte.
 *
 * - **Sprecher:** nur mit hinterlegter Vereinbarung (PDF, Medien-Prüfung mit Magic Bytes; neue Datei braucht zusätzlich
 *   `medium.hochladen`), Modul B1 (Training) und B2 (Klonen) getrennt.
 * - **Aufnahme:** wie die Rezitations-Werkstatt (Aufnahme im Browser oder Datei, Format nur über Magic Bytes, Ablage unter
 *   dem Inhalts-Hash), aber klein genug für den direkten Weg über die Action (≤ 5 MB). Nur für vertonbare Einträge: Sprachkurs,
 *   ohne Religionsbezug, nicht gesperrt. Eine neue Aufnahme derselben Person ersetzt die alte. Die Audio-Kette (L3-05)
 *   normiert und bündelt sie (`mensch:<sprecherId>`).
 * - **Stimme je Clip:** Sprachausgabe oder Mensch (`lernapp_audio_wahl`); wirkt sofort auf die Pakete (Kursstand + Tag).
 */

const UUID = z.uuid();

export async function sprecherAnlegen(_vorher: LernappZustand, fd: FormData): Promise<LernappZustand> {
  return mitLernappRecht('lernapp.audio.bearbeiten', async (a) => {
    const name = String(fd.get('name') ?? '').trim();
    const werte = { name };
    if (name.length < 2 || name.length > 120) return { fehler: 'pruefen', feldFehler: { name: 'nameFehlt' }, werte };
    const m = schema.medium;
    const datei = fd.get('datei');
    let mediumId: string;
    if (datei instanceof File && datei.size > 0) {
      if (!darf(a.rollen, 'medium.hochladen')) return { fehler: 'keinRecht', werte };
      let v;
      try {
        v = await verarbeiteDatei(Buffer.from(await datei.arrayBuffer()), datei.name);
      } catch (e) {
        return { fehler: 'pruefen', feldFehler: { datei: e instanceof MedienFehler ? `datei_${e.grund}` : 'datei_defekt' }, werte };
      }
      if (v.typ !== 'application/pdf') return { fehler: 'pruefen', feldFehler: { datei: 'keinPdf' }, werte };
      const [vorhanden] = await db
        .select({ id: m.id, papierkorb: m.imPapierkorbSeit })
        .from(m)
        .where(like(m.schluessel, `${v.hash}/%`))
        .limit(1);
      if (vorhanden?.papierkorb) return { fehler: 'pruefen', feldFehler: { datei: 'datei_imPapierkorb' }, werte };
      if (vorhanden) mediumId = vorhanden.id;
      else {
        await speicher().schreibe(v.schluessel, v.daten, v.typ);
        const [neu] = await db
          .transaction(async (tx) => {
            const zeilen = await tx
              .insert(m)
              .values({
                schluessel: v.schluessel,
                typ: v.typ,
                groesse: v.daten.length,
                alt: { de: 'Vereinbarung zu Aufnahmen für die Lern-App' },
                dateiname: datei.name.slice(0, 200),
                erstelltVon: a.benutzerId,
              })
              .returning({ id: m.id });
            await protokolliere(
              {
                benutzerId: a.benutzerId,
                aktion: 'medium.hochgeladen',
                zielTyp: 'medium',
                zielId: zeilen[0]!.id,
                details: { typ: v.typ, groesse: v.daten.length, zweck: 'vereinbarung_lernapp_sprecher' },
              },
              tx,
            );
            return zeilen;
          })
          .catch(async (e: unknown) => {
            await speicher()
              .loesche(v.schluessel)
              .catch(() => undefined);
            throw e;
          });
        mediumId = neu!.id;
      }
    } else {
      const gewaehlt = UUID.safeParse(fd.get('mediumId'));
      if (!gewaehlt.success) return { fehler: 'pruefen', feldFehler: { datei: 'dateiFehlt' }, werte };
      const [vorhanden] = await db
        .select({ id: m.id, typ: m.typ, papierkorb: m.imPapierkorbSeit })
        .from(m)
        .where(eq(m.id, gewaehlt.data))
        .limit(1);
      if (!vorhanden || vorhanden.papierkorb) return { fehler: 'pruefen', feldFehler: { datei: 'dateiFehlt' }, werte };
      if (vorhanden.typ !== 'application/pdf') return { fehler: 'pruefen', feldFehler: { datei: 'keinPdf' }, werte };
      mediumId = vorhanden.id;
    }
    const b1 = fd.get('b1') === '1';
    const b2 = fd.get('b2') === '1';
    await db.transaction(async (tx) => {
      const [neu] = await tx
        .insert(schema.lernappSprecher)
        .values({ name, vereinbarungMediumId: mediumId, kiSyntheseErlaubt: b1, klonenErlaubt: b2 })
        .returning({ id: schema.lernappSprecher.id });
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'lernapp.sprecher_angelegt',
          zielTyp: 'lernapp_sprecher',
          zielId: neu!.id,
          details: { b1, b2 },
        },
        tx,
      );
    });
    refresh();
    return { gespeichert: Date.now() };
  });
}

/** Aufnahme eines vertonbaren Eintrags übernehmen (Datei aus der Aufnahme im Browser oder vom Gerät). */
export async function aufnahmeSpeichern(_vorher: LernappZustand, fd: FormData): Promise<LernappZustand> {
  return mitLernappRecht('lernapp.audio.bearbeiten', async (a) => {
    const eintrag = await ladeVertonbarenEintrag(String(fd.get('eintrag') ?? ''));
    if (!eintrag) return { fehler: 'nichtGefunden' };
    // KERN 4.0 §4: nie für Religionsbezug, Wissen oder Koran-Arabisch
    if (!vertonbar({ kurs: eintrag.kurs, religionsbezug: eintrag.religionsbezug, status: eintrag.status }))
      return { fehler: 'nichtVertonbar' };
    const sprecherId = UUID.safeParse(fd.get('sprecher'));
    if (!sprecherId.success) return { fehler: 'pruefen', feldFehler: { sprecher: 'sprecherFehlt' } };
    const [sprecher] = await db
      .select({ id: schema.lernappSprecher.id, papierkorb: schema.medium.imPapierkorbSeit })
      .from(schema.lernappSprecher)
      .innerJoin(schema.medium, eq(schema.medium.id, schema.lernappSprecher.vereinbarungMediumId))
      .where(eq(schema.lernappSprecher.id, sprecherId.data))
      .limit(1);
    if (!sprecher || sprecher.papierkorb) return { fehler: 'pruefen', feldFehler: { sprecher: 'ohneVereinbarung' } };
    const datei = fd.get('datei');
    if (!(datei instanceof File) || datei.size === 0) return { fehler: 'audio_leer' };
    if (datei.size > AUFNAHME_MAX_BYTES) return { fehler: 'audio_zuGross' };
    const roh = Buffer.from(await datei.arrayBuffer());
    const format = audioFormat(roh.subarray(0, 16));
    if (!format) return { fehler: 'audio_format' };
    const dauer = z.coerce.number().int().positive().max(AUFNAHME_MAX_MS).safeParse(fd.get('dauerMs'));
    const sha256 = createHash('sha256').update(roh).digest('hex');
    const pfad = aufnahmeSchluessel(eintrag.kurs, eintrag.textHash, sha256, format);
    const t = schema.lernappAufnahme;
    const [vorher] = await db
      .select({ id: t.id, pfad: t.pfad })
      .from(t)
      .where(and(eq(t.sprache, eintrag.kurs), eq(t.textHash, eintrag.textHash), eq(t.sprecherId, sprecherId.data)))
      .limit(1);
    if (vorher?.pfad === pfad) return { gespeichert: Date.now(), hinweis: 'unveraendert' };
    if (!(await speicher().existiert(pfad))) await speicher().schreibe(pfad, roh, format.mime);
    try {
      await db.transaction(async (tx) => {
        const werte = {
          sprache: eintrag.kurs,
          textHash: eintrag.textHash,
          schluessel: eintrag.schluessel,
          sprecherId: sprecherId.data,
          pfad,
          mime: format.mime,
          bytes: roh.length,
          sha256,
          dauerMs: dauer.success ? dauer.data : null,
          status: 'neu' as const,
          erstelltVon: a.benutzerId,
          erstelltAm: new Date(),
        };
        const [neu] = await tx
          .insert(t)
          .values(werte)
          .onConflictDoUpdate({ target: [t.sprache, t.textHash, t.sprecherId], set: werte })
          .returning({ id: t.id });
        await protokolliere(
          {
            benutzerId: a.benutzerId,
            aktion: 'lernapp.aufnahme_gespeichert',
            zielTyp: 'lernapp_aufnahme',
            zielId: neu!.id,
            details: { sprache: eintrag.kurs, typ: format.mime, groesse: roh.length, ersetzt: Boolean(vorher) },
          },
          tx,
        );
      });
    } catch (e) {
      if (!vorher || vorher.pfad !== pfad)
        await speicher()
          .loesche(pfad)
          .catch(() => undefined);
      throw e;
    }
    if (vorher && vorher.pfad !== pfad)
      await speicher()
        .loesche(vorher.pfad)
        .catch(() => undefined);
    refresh();
    return { gespeichert: Date.now(), hinweis: vorher ? 'ersetzt' : 'neu' };
  });
}

/** Rohaufnahme verwerfen (Datei löschen, Eintrag „verworfen“); gebündelte Clips nimmt die Audio-Kette heraus. */
export async function aufnahmeVerwerfen(_vorher: LernappZustand, fd: FormData): Promise<LernappZustand> {
  return mitLernappRecht('lernapp.audio.bearbeiten', async (a) => {
    const id = UUID.safeParse(fd.get('id'));
    if (!id.success) return { fehler: 'nichtGefunden' };
    const t = schema.lernappAufnahme;
    const [z] = await db.select({ id: t.id, pfad: t.pfad, status: t.status, sprache: t.sprache }).from(t).where(eq(t.id, id.data)).limit(1);
    if (!z) return { fehler: 'nichtGefunden' };
    if (z.status === 'verworfen') return { gespeichert: Date.now() };
    await db.transaction(async (tx) => {
      await tx.update(t).set({ status: 'verworfen' }).where(eq(t.id, z.id));
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'lernapp.aufnahme_verworfen',
          zielTyp: 'lernapp_aufnahme',
          zielId: z.id,
          details: { sprache: z.sprache },
        },
        tx,
      );
    });
    await speicher()
      .loesche(z.pfad)
      .catch(() => undefined);
    refresh();
    return { gespeichert: Date.now() };
  });
}

const Wahl = z.enum(['sprachausgabe', 'mensch']);

/** Stimme je Clip wählen: Sprachausgabe oder menschliche Aufnahme (wirkt sofort auf die Pakete). */
export async function stimmeWaehlen(_vorher: LernappZustand, fd: FormData): Promise<LernappZustand> {
  return mitLernappRecht('lernapp.audio.bearbeiten', async (a) => {
    const eintrag = await ladeVertonbarenEintrag(String(fd.get('eintrag') ?? ''));
    if (!eintrag) return { fehler: 'nichtGefunden' };
    if (!vertonbar({ kurs: eintrag.kurs, religionsbezug: eintrag.religionsbezug, status: eintrag.status }))
      return { fehler: 'nichtVertonbar' };
    const wahl = Wahl.safeParse(fd.get('wahl'));
    if (!wahl.success) return { fehler: 'pruefen' };
    const w = schema.lernappAudioWahl;
    await db.transaction(async (tx) => {
      await tx
        .insert(w)
        .values({ sprache: eintrag.kurs, textHash: eintrag.textHash, wahl: wahl.data, geaendertVon: a.benutzerId })
        .onConflictDoUpdate({
          target: [w.sprache, w.textHash],
          set: { wahl: wahl.data, geaendertVon: a.benutzerId, geaendertAm: new Date() },
        });
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'lernapp.stimme_gewaehlt',
          zielTyp: 'lernapp_audio',
          zielId: `${eintrag.kurs}:${eintrag.textHash.slice(0, 16)}`,
          details: { wahl: wahl.data },
        },
        tx,
      );
    });
    await kursGeaendert([eintrag.kurs]);
    refresh();
    return { gespeichert: Date.now() };
  });
}
