'use server';

import { and, desc, eq, isNull, ne, or, type SQL } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { darf, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { vierAugenErfuellt } from '@/lib/religioes/freigabe';
import { gueltigeBloecke, religioeseVerweise } from '@/lib/validierung/bloecke';
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
  wissen_thema: TAG.wissen,
};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Tabellen religiöser Inhalte mit eigener Freigabespalte (`freigabeSpalten`: freigabe, verfasstVon, geprüft …). */
type FreigabeTabelle =
  | typeof schema.quranWortbedeutung
  | typeof schema.quranWortbedeutungOrt
  | typeof schema.tajwidRegel
  | typeof schema.hadithUebersetzung
  | typeof schema.elifbeLektion
  | typeof schema.besondererTag
  | typeof schema.wissenThema;

/** Zeile eines religiösen Inhalts aus Typ und Kennung (uuid bzw. `a|b|c`); null bei ungültiger Kennung. */
function zielZeile(typ: ReligioeserTyp, id: string): { t: FreigabeTabelle; wo: SQL } | null {
  const uuid = z.uuid().safeParse(id).success;
  const teile = id.split('|');
  switch (typ) {
    case 'quran_wortbedeutung':
      return uuid ? { t: schema.quranWortbedeutung, wo: eq(schema.quranWortbedeutung.id, id) } : null;
    case 'quran_wortbedeutung_ort': {
      const [sure, vers, pos, sprache] = teile;
      const zahlen = [sure, vers, pos].map(Number);
      if (teile.length !== 4 || !zahlen.every(Number.isInteger) || !sprache) return null;
      const t = schema.quranWortbedeutungOrt;
      return { t, wo: and(eq(t.sure, zahlen[0]), eq(t.vers, zahlen[1]), eq(t.pos, zahlen[2]), eq(t.sprache, sprache))! };
    }
    case 'tajwid_regel':
      return { t: schema.tajwidRegel, wo: eq(schema.tajwidRegel.schluessel, id) };
    case 'hadith_uebersetzung': {
      const [sammlung, nummer, sprache] = teile;
      if (teile.length !== 3) return null;
      const t = schema.hadithUebersetzung;
      return { t, wo: and(eq(t.sammlungId, sammlung), eq(t.nummer, nummer), eq(t.sprache, sprache))! };
    }
    case 'elifbe_lektion':
      return uuid ? { t: schema.elifbeLektion, wo: eq(schema.elifbeLektion.id, id) } : null;
    case 'besonderer_tag':
      return uuid ? { t: schema.besondererTag, wo: eq(schema.besondererTag.id, id) } : null;
    case 'wissen_thema':
      // Im Papierkorb nicht entscheidbar (steht auch nicht in der Warteschlange) – erst nach dem Wiederherstellen
      return uuid ? { t: schema.wissenThema, wo: and(eq(schema.wissenThema.id, id), isNull(schema.wissenThema.imPapierkorbSeit))! } : null;
  }
}

/**
 * Status in der Tabelle des religiösen Inhalts setzen – nur, solange er „zur_pruefung“ steht. Freigeben nur im
 * Vier-Augen-Prinzip (ADR 0030, MN-24; S2/S3): Wer den Inhalt zuletzt verfasst oder geändert hat, gibt ihn nicht selbst
 * frei – dieselbe Regel wie in „Koran & Hadith“ (`statusSetzen`) und der Anzeige (`folienFreigabe`).
 */
async function setzeReligioesenStatus(
  tx: Tx,
  typ: ReligioeserTyp,
  id: string,
  neu: 'geprueft' | 'entwurf',
  benutzerId: string,
): Promise<'ok' | 'nichtGefunden' | 'vierAugen'> {
  const ziel = zielZeile(typ, id);
  if (!ziel) return 'nichtGefunden';
  const { t, wo } = ziel;
  const offen = and(wo, eq(t.freigabe, 'zur_pruefung'));
  const [stand] = await tx.select({ verfasstVon: t.verfasstVon }).from(t).where(offen).limit(1);
  if (!stand) return 'nichtGefunden';
  if (neu === 'geprueft' && !vierAugenErfuellt(stand.verfasstVon, benutzerId)) return 'vierAugen';
  const werte = neu === 'geprueft' ? { freigabe: neu, geprueftVon: benutzerId, geprueftAm: new Date() } : { freigabe: neu };
  // Dieselbe Bedingung im UPDATE: Hat sich der Inhalt seitdem geändert (neue verfassende Person), greift sie erneut
  const bedingung = neu === 'geprueft' ? and(offen, or(isNull(t.verfasstVon), ne(t.verfasstVon, benutzerId))) : offen;
  const geaendert = await tx
    .update(t as typeof schema.quranWortbedeutung)
    .set(werte)
    .where(bedingung)
    .returning({ freigabe: t.freigabe });
  return geaendert.length ? 'ok' : 'nichtGefunden';
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
      .select({ id: s.id, organisation: s.organisation, status: s.status, bloecke: s.bloecke })
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
    // S2/S3: Ein Redaktionsantrag deckt keine Verse oder Hadithe. Hat der aktuelle Stand (noch nicht veröffentlichte)
    // religiöse Verweise, wird der Antrag zur religiösen Prüfung statt veröffentlicht.
    if (
      freigeben &&
      letzter.art === 'redaktion' &&
      seite.status !== 'veroeffentlicht' &&
      religioeseVerweise(gueltigeBloecke(seite.bloecke)).length
    ) {
      await db.transaction(async (tx) => {
        await tx
          .insert(f)
          .values({ inhaltTyp: 'seite', inhaltId: seite.id, art: 'religioes', status: 'zur_pruefung', von: a.benutzerId, kommentar });
        await protokolliere(
          { benutzerId: a.benutzerId, aktion: 'inhalt.zur_pruefung', zielTyp: 'seite', zielId: seite.id, details: { art: 'religioes' } },
          tx,
        );
      });
      return { fehler: 'religioesePruefungNoetig' };
    }
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
  const ergebnis = await db.transaction(async (tx) => {
    const r = await setzeReligioesenStatus(tx, typ, e.inhaltId, freigeben ? 'geprueft' : 'entwurf', a.benutzerId);
    if (r !== 'ok') return r;
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
    return 'ok' as const;
  });
  if (ergebnis === 'vierAugen') return { fehler: 'vierAugen' };
  if (ergebnis !== 'ok') return { fehler: 'nichtMehrOffen' };
  inhaltGeaendert(CACHE[typ]);
  // Zurück zur Warteschlange mit Rückmeldung (der Inhalt steht dort nicht mehr)
  redirect(`/verwaltung/freigaben?erledigt=${e.entscheidung}`);
}
