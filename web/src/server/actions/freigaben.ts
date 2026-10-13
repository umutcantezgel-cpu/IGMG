'use server';

import { and, desc, eq, isNull } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { darf, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { FREIGABE_TYPEN, type ReligioeserTyp } from '@/server/queries/verwaltung/freigaben';

/**
 * Freigaben entscheiden (ADR 0030, ADR 0032, MUSTER 5). Religiöse Prüfung nur mit `religioes.freigeben` (Rolle
 * `religioese_pruefung`; Administration darf alles außer Chat-Inhalten). Redaktionelle Prüfung einer Seite mit
 * `seite.veroeffentlichen` für deren Organisation. „Freigeben“ einer Seite veröffentlicht sie (der Antrag lautete
 * „bitte prüfen und veröffentlichen“); „Zurückweisen“ braucht einen Kommentar und lässt den Inhalt im Entwurf.
 * Jeder Schritt steht im Verlauf (`freigabe`) und im Audit (ohne Inhalte).
 */
export type FreigabeZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  erledigt?: number;
  entscheidung?: 'freigeben' | 'zurueckweisen';
};

const eingabe = z
  .object({
    inhaltTyp: z.enum(FREIGABE_TYPEN, 'ungueltig'),
    inhaltId: z.string().trim().min(1, 'ungueltig').max(200, 'ungueltig'),
    entscheidung: z.enum(['freigeben', 'zurueckweisen'], 'ungueltig'),
    kommentar: z.string().trim().max(1000, 'zuLang').default(''),
  })
  .superRefine((e, ctx) => {
    if (e.entscheidung === 'zurueckweisen' && !e.kommentar)
      ctx.addIssue({ code: 'custom', path: ['kommentar'], message: 'kommentarPflicht' });
  });

const CACHE: Record<ReligioeserTyp, string> = {
  quran_wortbedeutung: TAG.quran,
  quran_wortbedeutung_ort: TAG.quran,
  tajwid_regel: TAG.tajwid,
  hadith_uebersetzung: TAG.hadith,
  elifbe_lektion: TAG.elifbe,
  besonderer_tag: TAG.kalender,
};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Status in der Tabelle des religiösen Inhalts setzen – nur, solange er „zur_pruefung“ steht. Ergebnis: Zeile gefunden.
 */
async function setzeReligioesenStatus(
  tx: Tx,
  typ: ReligioeserTyp,
  id: string,
  neu: 'geprueft' | 'entwurf',
  benutzerId: string,
): Promise<boolean> {
  const werte = neu === 'geprueft' ? { freigabe: neu, geprueftVon: benutzerId, geprueftAm: new Date() } : { freigabe: neu };
  const uuid = z.uuid().safeParse(id).success;
  const teile = id.split('|');
  switch (typ) {
    case 'quran_wortbedeutung': {
      if (!uuid) return false;
      const t = schema.quranWortbedeutung;
      return (
        (
          await tx
            .update(t)
            .set(werte)
            .where(and(eq(t.id, id), eq(t.freigabe, 'zur_pruefung')))
            .returning({ id: t.id })
        ).length > 0
      );
    }
    case 'quran_wortbedeutung_ort': {
      const [sure, vers, pos, sprache] = teile;
      const zahlen = [sure, vers, pos].map(Number);
      if (teile.length !== 4 || !zahlen.every(Number.isInteger) || !sprache) return false;
      const t = schema.quranWortbedeutungOrt;
      return (
        (
          await tx
            .update(t)
            .set(werte)
            .where(
              and(
                eq(t.sure, zahlen[0]),
                eq(t.vers, zahlen[1]),
                eq(t.pos, zahlen[2]),
                eq(t.sprache, sprache),
                eq(t.freigabe, 'zur_pruefung'),
              ),
            )
            .returning({ s: t.sure })
        ).length > 0
      );
    }
    case 'tajwid_regel': {
      const t = schema.tajwidRegel;
      return (
        (
          await tx
            .update(t)
            .set(werte)
            .where(and(eq(t.schluessel, id), eq(t.freigabe, 'zur_pruefung')))
            .returning({ s: t.schluessel })
        ).length > 0
      );
    }
    case 'hadith_uebersetzung': {
      const [sammlung, nummer, sprache] = teile;
      if (teile.length !== 3) return false;
      const t = schema.hadithUebersetzung;
      return (
        (
          await tx
            .update(t)
            .set(werte)
            .where(and(eq(t.sammlungId, sammlung), eq(t.nummer, nummer), eq(t.sprache, sprache), eq(t.freigabe, 'zur_pruefung')))
            .returning({ n: t.nummer })
        ).length > 0
      );
    }
    case 'elifbe_lektion': {
      if (!uuid) return false;
      const t = schema.elifbeLektion;
      return (
        (
          await tx
            .update(t)
            .set(werte)
            .where(and(eq(t.id, id), eq(t.freigabe, 'zur_pruefung')))
            .returning({ id: t.id })
        ).length > 0
      );
    }
    case 'besonderer_tag': {
      if (!uuid) return false;
      const t = schema.besondererTag;
      return (
        (
          await tx
            .update(t)
            .set(werte)
            .where(and(eq(t.id, id), eq(t.freigabe, 'zur_pruefung')))
            .returning({ id: t.id })
        ).length > 0
      );
    }
  }
}

export async function entscheideFreigabe(_vorher: FreigabeZustand, fd: FormData): Promise<FreigabeZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('freigabe.lesen');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const p = eingabe.safeParse({
    inhaltTyp: fd.get('inhaltTyp'),
    inhaltId: fd.get('inhaltId'),
    entscheidung: fd.get('entscheidung'),
    kommentar: fd.get('kommentar') ?? '',
  });
  if (!p.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of p.error.issues) feldFehler[String(f.path[0] ?? 'formular')] ??= /^[a-zA-Z]+$/.test(f.message) ? f.message : 'ungueltig';
    return { fehler: 'pruefen', feldFehler };
  }
  const e = p.data;
  const freigeben = e.entscheidung === 'freigeben';
  const kommentar = e.kommentar || null;

  if (e.inhaltTyp === 'seite') {
    const f = schema.freigabe;
    const s = schema.seite;
    if (!z.uuid().safeParse(e.inhaltId).success) return { fehler: 'nichtMehrOffen' };
    const [seite] = await db
      .select({ id: s.id, organisation: s.organisation, status: s.status })
      .from(s)
      .where(and(eq(s.id, e.inhaltId), isNull(s.imPapierkorbSeit)))
      .limit(1);
    const [letzter] = await db
      .select({ art: f.art, status: f.status })
      .from(f)
      .where(and(eq(f.inhaltTyp, 'seite'), eq(f.inhaltId, e.inhaltId)))
      .orderBy(desc(f.am), desc(f.id))
      .limit(1);
    if (!seite || letzter?.status !== 'zur_pruefung') return { fehler: 'nichtMehrOffen' };
    const recht =
      letzter.art === 'religioes'
        ? darf(a.rollen, 'religioes.freigeben')
        : darf(a.rollen, 'seite.veroeffentlichen', { organisation: seite.organisation });
    if (!recht) return { fehler: letzter.art === 'religioes' ? 'nurReligioesePruefung' : 'keinRecht' };
    await db.transaction(async (tx) => {
      await tx.insert(f).values({
        inhaltTyp: 'seite',
        inhaltId: seite.id,
        art: letzter.art,
        status: freigeben ? 'geprueft' : 'entwurf',
        von: a.benutzerId,
        kommentar,
      });
      if (freigeben) {
        await tx.update(s).set({ status: 'veroeffentlicht', aktualisiertVon: a.benutzerId }).where(eq(s.id, seite.id));
        await protokolliere(
          { benutzerId: a.benutzerId, aktion: 'freigabe.erteilt', zielTyp: 'seite', zielId: seite.id, details: { art: letzter.art } },
          tx,
        );
        if (seite.status !== 'veroeffentlicht')
          await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.veroeffentlicht', zielTyp: 'seite', zielId: seite.id }, tx);
      } else
        await protokolliere(
          {
            benutzerId: a.benutzerId,
            aktion: 'freigabe.zurueckgewiesen',
            zielTyp: 'seite',
            zielId: seite.id,
            details: { art: letzter.art },
          },
          tx,
        );
    });
    inhaltGeaendert(TAG.seiten, TAG.seite(seite.id));
    redirect(`/verwaltung/freigaben?erledigt=${e.entscheidung}`);
  }

  // Religiöse Inhalte mit eigener Freigabespalte
  if (!darf(a.rollen, 'religioes.freigeben')) return { fehler: 'nurReligioesePruefung' };
  const typ = e.inhaltTyp;
  const gefunden = await db.transaction(async (tx) => {
    const ok = await setzeReligioesenStatus(tx, typ, e.inhaltId, freigeben ? 'geprueft' : 'entwurf', a.benutzerId);
    if (!ok) return false;
    await tx.insert(schema.freigabe).values({
      inhaltTyp: typ,
      inhaltId: e.inhaltId,
      art: 'religioes',
      status: freigeben ? 'geprueft' : 'entwurf',
      von: a.benutzerId,
      kommentar,
    });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: freigeben ? 'freigabe.erteilt' : 'freigabe.zurueckgewiesen',
        zielTyp: typ,
        zielId: e.inhaltId,
        details: { art: 'religioes' },
      },
      tx,
    );
    return true;
  });
  if (!gefunden) return { fehler: 'nichtMehrOffen' };
  inhaltGeaendert(CACHE[typ]);
  // Zurück zur Warteschlange mit Rückmeldung (der Inhalt steht dort nicht mehr)
  redirect(`/verwaltung/freigaben?erledigt=${e.entscheidung}`);
}
