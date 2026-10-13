'use server';

import type { JSONContent } from '@tiptap/core';
import { and, eq, max, ne, type SQL } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { z } from 'zod';
import { protokolliere, type AuditAktion } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema, type Transaktion } from '@/lib/db';
import type { Mehrsprachig, MehrsprachigRich } from '@/lib/db/schema/typen';
import { BUKHARI } from '@/lib/hadith/anzeige';
import { istFreigegeben } from '@/lib/quran/ausgaben';
import type { Aktion } from '@/lib/rechte/matrix';
import { darf, KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import {
  betrifftOeffentlich,
  gleicherInhalt,
  hadithKennung,
  ortKennung,
  statusNachSpeichern,
  uebergang,
  verschiebe,
  vierAugenErfuellt,
  zerlegeKennung,
  type FreigabeStatus,
  type ReligioeseArt,
} from '@/lib/religioes/freigabe';
import {
  ausFormular,
  ausgabeSchema,
  bedeutungSchema,
  feldFehler,
  hadithUebersetzungSchema,
  listenSchema,
  ortSchema,
  ortSchluesselSchema,
  statusSchema,
  tajwidSchema,
  verschiebenSchema,
} from '@/lib/validierung/koran';

/**
 * Verwaltung „Koran & Hadith“ (H-Q03/Q04, ADR 0030): Bedeutungen, Tajwid-Texte und Hadith-Übersetzungen erfassen
 * (`quran.bearbeiten` bzw. `hadith.bearbeiten`), religiös freigeben (`religioes.freigeben`, Vier-Augen-Prinzip),
 * Ausgaben freigeben und als Standard setzen, kuratierte Hadith-Listen pflegen. Jede inhaltliche Änderung setzt
 * einen geprüften Eintrag auf „zur Prüfung“ zurück; öffentlich ist nur „geprüft“. Jeder Statuswechsel steht im
 * Freigabe-Verlauf (`freigabe`) und im Audit (ohne Inhalte). Ändert sich die öffentliche Sicht, erneuern wir die
 * Cache-Tags (`quran`, `tajwid`, `hadith`).
 */
export type KoranFehler =
  | 'pruefen'
  | 'keinRecht'
  | 'nichtGefunden'
  | 'vierAugen'
  | 'uebergang'
  | 'eingabe'
  | 'grundFehlt'
  | 'nichtFreigegeben'
  | 'bestaetigen'
  | 'vorhanden'
  | 'unbekannt';

export type KoranZustand = {
  fehler?: KoranFehler;
  feldFehler?: Record<string, string>;
  werte?: Record<string, unknown>;
  gespeichert?: number;
  status?: FreigabeStatus;
};

async function mitRecht(aktion: Aktion, f: (a: Angemeldet) => Promise<KoranZustand>): Promise<KoranZustand> {
  try {
    return await f(await verlangeRecht(aktion));
  } catch (e) {
    if (e instanceof KeinRecht) return { fehler: 'keinRecht' };
    throw e;
  }
}

const TAG_JE_ART: Record<ReligioeseArt, string> = {
  quran_wortbedeutung: TAG.quran,
  quran_wortbedeutung_ort: TAG.quran,
  tajwid_regel: TAG.tajwid,
  hadith_uebersetzung: TAG.hadith,
};
const RECHT_JE_ART: Record<ReligioeseArt, Aktion> = {
  quran_wortbedeutung: 'quran.bearbeiten',
  quran_wortbedeutung_ort: 'quran.bearbeiten',
  tajwid_regel: 'quran.bearbeiten',
  hadith_uebersetzung: 'hadith.bearbeiten',
};

/** Statuswechsel → Audit-Aktion. */
function auditFuer(neu: FreigabeStatus): AuditAktion {
  return neu === 'geprueft' ? 'religioes.freigegeben' : neu === 'zur_pruefung' ? 'religioes.eingereicht' : 'religioes.zurueckgewiesen';
}

/** Eintrag im Freigabe-Verlauf (wie das Modul „Freigaben“: Art und Kennung des Inhalts). */
async function verlauf(tx: Transaktion, typ: string, kennung: string, status: FreigabeStatus, von: string, kommentar?: string) {
  await tx.insert(schema.freigabe).values({ inhaltTyp: typ, inhaltId: kennung, art: 'religioes', status, von, kommentar: kommentar || null });
}

/**
 * Nach dem Speichern: Statuswechsel im Verlauf und im Audit, Inhaltsänderung im Audit. Liefert den neuen Status.
 */
async function protokolliereSpeichern(
  tx: Transaktion,
  a: Angemeldet,
  art: ReligioeseArt,
  kennung: string,
  alt: FreigabeStatus | null,
  neu: FreigabeStatus,
  geaendert: boolean,
  details: Record<string, string | number>,
) {
  if (geaendert)
    await protokolliere(
      { benutzerId: a.benutzerId, aktion: alt === null ? 'inhalt.angelegt' : 'inhalt.geaendert', zielTyp: art, zielId: kennung, details: { ...details, freigabe: neu } },
      tx,
    );
  if (neu !== alt && !(alt === null && neu === 'entwurf')) {
    await verlauf(tx, art, kennung, neu, a.benutzerId);
    await protokolliere({ benutzerId: a.benutzerId, aktion: auditFuer(neu), zielTyp: art, zielId: kennung, details }, tx);
  }
}

/** Nach jeder Änderung: Seiten der Verwaltung neu laden; öffentliche Caches nur, wenn „geprüft“ betroffen ist. */
function nachher(tag: string, alt: FreigabeStatus | null, neu: FreigabeStatus | null, geaendert = true) {
  if (betrifftOeffentlich(alt, neu, geaendert)) inhaltGeaendert(tag);
  refresh();
}

/** Werte für eine geänderte Zeile: verfasst von der speichernden Person, Prüfvermerk entfällt. */
const neuVerfasst = (a: Angemeldet, freigabe: FreigabeStatus) => ({ freigabe, verfasstVon: a.benutzerId, geprueftVon: null, geprueftAm: null });

// ————————————————————————————————————————— Wortbedeutungen

/** Bedeutung einer Wortform (de/tr) speichern; gilt für alle Vorkommen der Form. */
export async function bedeutungSpeichern(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitRecht('quran.bearbeiten', async (a) => {
    const roh = ausFormular(fd);
    const p = bedeutungSchema.safeParse(roh);
    if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte: roh };
    const e = p.data;
    const wb = schema.quranWortbedeutung;
    const ergebnis = await db.transaction(async (tx) => {
      const [form] = await tx.select({ id: schema.quranWortform.id }).from(schema.quranWortform).where(eq(schema.quranWortform.id, e.formId)).limit(1);
      if (!form) return null;
      const [alt] = await tx.select().from(wb).where(and(eq(wb.formId, e.formId), eq(wb.sprache, e.sprache))).limit(1);
      const inhalt = { bedeutung: e.bedeutung, wurzel: e.wurzel || null, anmerkung: e.anmerkung || null };
      const geaendert = !alt || !gleicherInhalt(inhalt, { bedeutung: alt.bedeutung, wurzel: alt.wurzel, anmerkung: alt.anmerkung });
      const vorher = alt?.freigabe ?? null;
      const neu = statusNachSpeichern(vorher, geaendert, e.einreichen);
      let id = alt?.id;
      if (!alt) {
        [{ id }] = await tx
          .insert(wb)
          .values({ formId: e.formId, sprache: e.sprache, ...inhalt, ...neuVerfasst(a, neu) })
          .returning({ id: wb.id });
      } else if (geaendert) await tx.update(wb).set({ ...inhalt, ...neuVerfasst(a, neu) }).where(eq(wb.id, alt.id));
      else if (neu !== vorher) await tx.update(wb).set({ freigabe: neu }).where(eq(wb.id, alt.id));
      await protokolliereSpeichern(tx, a, 'quran_wortbedeutung', id!, vorher, neu, geaendert, { formId: e.formId, sprache: e.sprache });
      return { vorher, neu, geaendert };
    });
    if (!ergebnis) return { fehler: 'nichtGefunden' };
    nachher(TAG.quran, ergebnis.vorher, ergebnis.neu, ergebnis.geaendert);
    return { gespeichert: Date.now(), status: ergebnis.neu };
  });
}

export async function bedeutungEntfernen(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitRecht('quran.bearbeiten', async (a) => {
    const id = z.uuid().safeParse(fd.get('kennung'));
    if (!id.success) return { fehler: 'eingabe' };
    const wb = schema.quranWortbedeutung;
    const alt = await db.transaction(async (tx) => {
      const [z] = await tx.delete(wb).where(eq(wb.id, id.data)).returning({ freigabe: wb.freigabe, formId: wb.formId, sprache: wb.sprache });
      if (z)
        await protokolliere(
          { benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: 'quran_wortbedeutung', zielId: id.data, details: { formId: z.formId, sprache: z.sprache } },
          tx,
        );
      return z;
    });
    if (!alt) return { fehler: 'nichtGefunden' };
    nachher(TAG.quran, alt.freigabe, null);
    return { gespeichert: Date.now() };
  });
}

/** Abweichende Bedeutung an einer Stelle (überschreibt dort die Bedeutung der Form). */
export async function ortSpeichern(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitRecht('quran.bearbeiten', async (a) => {
    const roh = ausFormular(fd);
    const p = ortSchema.safeParse(roh);
    if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte: roh };
    const e = p.data;
    const o = schema.quranWortbedeutungOrt;
    const stelle = and(eq(o.sure, e.sure), eq(o.vers, e.vers), eq(o.pos, e.pos), eq(o.sprache, e.sprache));
    const ergebnis = await db.transaction(async (tx) => {
      const w = schema.quranWort;
      const [wort] = await tx
        .select({ pos: w.pos })
        .from(w)
        .where(and(eq(w.sure, e.sure), eq(w.vers, e.vers), eq(w.pos, e.pos)))
        .limit(1);
      if (!wort) return null;
      const [alt] = await tx.select().from(o).where(stelle).limit(1);
      const geaendert = !alt || alt.bedeutung !== e.bedeutung;
      const vorher = alt?.freigabe ?? null;
      const neu = statusNachSpeichern(vorher, geaendert, e.einreichen);
      if (!alt)
        await tx.insert(o).values({ sure: e.sure, vers: e.vers, pos: e.pos, sprache: e.sprache, bedeutung: e.bedeutung, ...neuVerfasst(a, neu) });
      else if (geaendert) await tx.update(o).set({ bedeutung: e.bedeutung, ...neuVerfasst(a, neu) }).where(stelle);
      else if (neu !== vorher) await tx.update(o).set({ freigabe: neu }).where(stelle);
      await protokolliereSpeichern(tx, a, 'quran_wortbedeutung_ort', ortKennung(e), vorher, neu, geaendert, { sure: e.sure, vers: e.vers, pos: e.pos });
      return { vorher, neu, geaendert };
    });
    if (!ergebnis) return { fehler: 'nichtGefunden' };
    nachher(TAG.quran, ergebnis.vorher, ergebnis.neu, ergebnis.geaendert);
    return { gespeichert: Date.now(), status: ergebnis.neu };
  });
}

export async function ortEntfernen(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitRecht('quran.bearbeiten', async (a) => {
    const p = ortSchluesselSchema.safeParse(ausFormular(fd));
    if (!p.success) return { fehler: 'eingabe' };
    const e = p.data;
    const o = schema.quranWortbedeutungOrt;
    const alt = await db.transaction(async (tx) => {
      const [z] = await tx
        .delete(o)
        .where(and(eq(o.sure, e.sure), eq(o.vers, e.vers), eq(o.pos, e.pos), eq(o.sprache, e.sprache)))
        .returning({ freigabe: o.freigabe });
      if (z)
        await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: 'quran_wortbedeutung_ort', zielId: ortKennung(e) }, tx);
      return z;
    });
    if (!alt) return { fehler: 'nichtGefunden' };
    nachher(TAG.quran, alt.freigabe, null);
    return { gespeichert: Date.now() };
  });
}

// ————————————————————————————————————————— Tajwid

/** Mehrsprachiger Wert aus de/tr; ein vorhandener englischer Text bleibt erhalten. Ohne Deutsch: null. */
function mehrsprachig<T>(de: T | null, tr: T | null, en: T | undefined): { de: T; tr?: T; en?: T } | null {
  if (!de) return null;
  return { de, ...(tr ? { tr } : {}), ...(en ? { en } : {}) };
}

/** Name, Kurztext und Erklärung einer Tajwid-Regel (de/tr). Regeln selbst kommen aus dem Import. */
export async function tajwidSpeichern(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitRecht('quran.bearbeiten', async (a) => {
    const roh = ausFormular(fd);
    const p = tajwidSchema.safeParse(roh);
    if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte: roh };
    const e = p.data;
    const fehlt: Record<string, string> = {};
    if (e.kurzTr && !e.kurzDe) fehlt.kurzDe = 'deFehlt';
    if (e.erklaerungTr && !e.erklaerungDe) fehlt.erklaerungDe = 'deFehlt';
    if (Object.keys(fehlt).length) return { fehler: 'pruefen', feldFehler: fehlt, werte: roh };
    const t = schema.tajwidRegel;
    const ergebnis = await db.transaction(async (tx) => {
      const [alt] = await tx.select().from(t).where(eq(t.schluessel, e.schluessel)).limit(1);
      if (!alt) return null;
      const name = mehrsprachig(e.nameDe, e.nameTr || null, alt.name.en) as Mehrsprachig;
      const kurz = mehrsprachig(e.kurzDe || null, e.kurzTr || null, alt.kurz?.en);
      const erklaerung = mehrsprachig<JSONContent>(e.erklaerungDe, e.erklaerungTr, alt.erklaerung?.en) as MehrsprachigRich | null;
      const geaendert = !gleicherInhalt({ name, kurz, erklaerung }, { name: alt.name, kurz: alt.kurz, erklaerung: alt.erklaerung });
      const neu = statusNachSpeichern(alt.freigabe, geaendert, e.einreichen);
      if (geaendert) await tx.update(t).set({ name, kurz, erklaerung, ...neuVerfasst(a, neu) }).where(eq(t.schluessel, e.schluessel));
      else if (neu !== alt.freigabe) await tx.update(t).set({ freigabe: neu }).where(eq(t.schluessel, e.schluessel));
      await protokolliereSpeichern(tx, a, 'tajwid_regel', e.schluessel, alt.freigabe, neu, geaendert, { schluessel: e.schluessel });
      return { vorher: alt.freigabe, neu, geaendert };
    });
    if (!ergebnis) return { fehler: 'nichtGefunden' };
    nachher(TAG.tajwid, ergebnis.vorher, ergebnis.neu, ergebnis.geaendert);
    return { gespeichert: Date.now(), status: ergebnis.neu };
  });
}

// ————————————————————————————————————————— Hadith-Übersetzungen

/** Übersetzung eines importierten Hadith (je Sprache) mit Übersetzer, Quelle und Lizenz. */
export async function hadithUebersetzungSpeichern(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitRecht('hadith.bearbeiten', async (a) => {
    const roh = ausFormular(fd);
    const p = hadithUebersetzungSchema.safeParse(roh);
    if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte: roh };
    const e = p.data;
    const u = schema.hadithUebersetzung;
    const schluessel = and(eq(u.sammlungId, BUKHARI), eq(u.nummer, e.nummer), eq(u.sprache, e.sprache));
    const ergebnis = await db.transaction(async (tx) => {
      const [hadith] = await tx
        .select({ nummer: schema.hadith.nummer })
        .from(schema.hadith)
        .where(and(eq(schema.hadith.sammlungId, BUKHARI), eq(schema.hadith.nummer, e.nummer)))
        .limit(1);
      if (!hadith) return null;
      const [alt] = await tx.select().from(u).where(schluessel).limit(1);
      const inhalt = { text: e.text, uebersetzer: e.uebersetzer, quelle: e.quelle, lizenz: e.lizenz };
      const geaendert = !alt || !gleicherInhalt(inhalt, { text: alt.text, uebersetzer: alt.uebersetzer, quelle: alt.quelle, lizenz: alt.lizenz });
      const vorher = alt?.freigabe ?? null;
      const neu = statusNachSpeichern(vorher, geaendert, e.einreichen);
      if (!alt) await tx.insert(u).values({ sammlungId: BUKHARI, nummer: e.nummer, sprache: e.sprache, ...inhalt, ...neuVerfasst(a, neu) });
      else if (geaendert) await tx.update(u).set({ ...inhalt, ...neuVerfasst(a, neu) }).where(schluessel);
      else if (neu !== vorher) await tx.update(u).set({ freigabe: neu }).where(schluessel);
      const kennung = hadithKennung({ sammlungId: BUKHARI, nummer: e.nummer, sprache: e.sprache });
      await protokolliereSpeichern(tx, a, 'hadith_uebersetzung', kennung, vorher, neu, geaendert, { nummer: e.nummer, sprache: e.sprache });
      return { vorher, neu, geaendert };
    });
    if (!ergebnis) return { fehler: 'pruefen', feldFehler: { nummer: 'unbekannt' }, werte: roh };
    nachher(TAG.hadith, ergebnis.vorher, ergebnis.neu, ergebnis.geaendert);
    return { gespeichert: Date.now(), status: ergebnis.neu };
  });
}

export async function hadithUebersetzungEntfernen(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitRecht('hadith.bearbeiten', async (a) => {
    const teile = zerlegeKennung(String(fd.get('kennung') ?? ''), 3);
    if (!teile || teile[0] !== BUKHARI) return { fehler: 'eingabe' };
    const [, nummer, sprache] = teile;
    const u = schema.hadithUebersetzung;
    const alt = await db.transaction(async (tx) => {
      const [z] = await tx
        .delete(u)
        .where(and(eq(u.sammlungId, BUKHARI), eq(u.nummer, nummer), eq(u.sprache, sprache)))
        .returning({ freigabe: u.freigabe });
      if (z) await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: 'hadith_uebersetzung', zielId: teile.join('|') }, tx);
      return z;
    });
    if (!alt) return { fehler: 'nichtGefunden' };
    nachher(TAG.hadith, alt.freigabe, null);
    return { gespeichert: Date.now() };
  });
}

// ————————————————————————————————————————— Freigabe-Ablauf

type Stand = { freigabe: FreigabeStatus; verfasstVon: string | null };

/** Zeile eines religiösen Inhalts über Art und Kennung finden; ungültige Kennung → null. */
function bedingung(art: ReligioeseArt, kennung: string): SQL | null {
  switch (art) {
    case 'quran_wortbedeutung':
      return z.uuid().safeParse(kennung).success ? eq(schema.quranWortbedeutung.id, kennung) : null;
    case 'quran_wortbedeutung_ort': {
      const t = zerlegeKennung(kennung, 4);
      const p = t && ortSchluesselSchema.safeParse({ sure: t[0], vers: t[1], pos: t[2], sprache: t[3] });
      if (!p?.success) return null;
      const o = schema.quranWortbedeutungOrt;
      return and(eq(o.sure, p.data.sure), eq(o.vers, p.data.vers), eq(o.pos, p.data.pos), eq(o.sprache, p.data.sprache))!;
    }
    case 'tajwid_regel':
      return /^[a-z0-9_]{2,40}$/.test(kennung) ? eq(schema.tajwidRegel.schluessel, kennung) : null;
    case 'hadith_uebersetzung': {
      const t = zerlegeKennung(kennung, 3);
      if (!t) return null;
      const u = schema.hadithUebersetzung;
      return and(eq(u.sammlungId, t[0]), eq(u.nummer, t[1]), eq(u.sprache, t[2]))!;
    }
  }
}

async function leseStand(tx: Transaktion, art: ReligioeseArt, wo: SQL): Promise<Stand | null> {
  const tabelle = {
    quran_wortbedeutung: schema.quranWortbedeutung,
    quran_wortbedeutung_ort: schema.quranWortbedeutungOrt,
    tajwid_regel: schema.tajwidRegel,
    hadith_uebersetzung: schema.hadithUebersetzung,
  }[art] as typeof schema.tajwidRegel;
  const [z] = await tx.select({ freigabe: tabelle.freigabe, verfasstVon: tabelle.verfasstVon }).from(tabelle).where(wo).limit(1);
  return z ?? null;
}

async function setzeStand(tx: Transaktion, art: ReligioeseArt, wo: SQL, werte: { freigabe: FreigabeStatus; geprueftVon: string | null; geprueftAm: Date | null }) {
  switch (art) {
    case 'quran_wortbedeutung':
      await tx.update(schema.quranWortbedeutung).set(werte).where(wo);
      return;
    case 'quran_wortbedeutung_ort':
      await tx.update(schema.quranWortbedeutungOrt).set(werte).where(wo);
      return;
    case 'tajwid_regel':
      await tx.update(schema.tajwidRegel).set(werte).where(wo);
      return;
    case 'hadith_uebersetzung':
      await tx.update(schema.hadithUebersetzung).set(werte).where(wo);
      return;
  }
}

/**
 * Statuswechsel ohne inhaltliche Änderung: einreichen (Recht zum Bearbeiten), freigeben (nur `religioes.freigeben`
 * und nicht die Person, die zuletzt verfasst hat), zurückweisen bzw. Freigabe aufheben (`religioes.freigeben`, Grund).
 */
export async function statusSetzen(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  const p = statusSchema.safeParse(ausFormular(fd));
  if (!p.success) {
    const ff = feldFehler(p.error);
    return ff.grund ? { fehler: 'grundFehlt', feldFehler: ff } : { fehler: 'eingabe' };
  }
  const e = p.data;
  const recht: Aktion = e.ziel === 'zur_pruefung' ? RECHT_JE_ART[e.art] : 'religioes.freigeben';
  return mitRecht(recht, async (a) => {
    const wo = bedingung(e.art, e.kennung);
    if (!wo) return { fehler: 'eingabe' };
    const ergebnis = await db.transaction(async (tx): Promise<KoranZustand | { vorher: FreigabeStatus }> => {
      const stand = await leseStand(tx, e.art, wo);
      if (!stand) return { fehler: 'nichtGefunden' };
      const schritt = uebergang(stand.freigabe, e.ziel);
      if (!schritt) return { fehler: 'uebergang' };
      if (schritt === 'freigeben' && !vierAugenErfuellt(stand.verfasstVon, a.benutzerId)) return { fehler: 'vierAugen' };
      const freigeben = schritt === 'freigeben';
      await setzeStand(tx, e.art, wo, { freigabe: e.ziel, geprueftVon: freigeben ? a.benutzerId : null, geprueftAm: freigeben ? new Date() : null });
      await verlauf(tx, e.art, e.kennung, e.ziel, a.benutzerId, e.grund);
      await protokolliere({ benutzerId: a.benutzerId, aktion: auditFuer(e.ziel), zielTyp: e.art, zielId: e.kennung }, tx);
      return { vorher: stand.freigabe };
    });
    if (!('vorher' in ergebnis)) return ergebnis;
    nachher(TAG_JE_ART[e.art], ergebnis.vorher, e.ziel);
    return { gespeichert: Date.now(), status: e.ziel };
  });
}

// ————————————————————————————————————————— Ausgaben

/**
 * Ausgabe freigeben und aktivieren: gilt für die unverändert importierte Ausgabe als Ganzes (Version und SHA-256 im
 * Verlauf). Ändert ein späterer Import die Datei, setzt der Import die Freigabe zurück (scripts/inhalte-import.ts).
 */
export async function ausgabeFreigeben(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitRecht('religioes.freigeben', async (a) => {
    const p = ausgabeSchema.safeParse(ausFormular(fd));
    if (!p.success) return { fehler: 'eingabe' };
    if (fd.get('bestaetigt') !== 'on') return { fehler: 'bestaetigen', feldFehler: { bestaetigt: 'bestaetigen' } };
    const t = schema.quranAusgabe;
    const ok = await db.transaction(async (tx) => {
      const [alt] = await tx.select().from(t).where(eq(t.id, p.data.id)).limit(1);
      if (!alt) return false;
      await tx.update(t).set({ aktiv: true, freigegebenVon: a.benutzerId, freigegebenAm: new Date() }).where(eq(t.id, alt.id));
      await verlauf(tx, 'quran_ausgabe', alt.id, 'geprueft', a.benutzerId, `Version ${alt.version} · SHA-256 ${alt.sha256}`);
      await protokolliere(
        { benutzerId: a.benutzerId, aktion: 'religioes.freigegeben', zielTyp: 'quran_ausgabe', zielId: alt.id, details: { version: alt.version, sha256: alt.sha256 } },
        tx,
      );
      return true;
    });
    if (!ok) return { fehler: 'nichtGefunden' };
    inhaltGeaendert(TAG.quran);
    refresh();
    return { gespeichert: Date.now() };
  });
}

/** Ausgabe ausschalten: nicht mehr öffentlich, Freigabe und Standard entfallen (neue Freigabe nötig). */
export async function ausgabeDeaktivieren(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitRecht('religioes.freigeben', async (a) => {
    const p = ausgabeSchema.safeParse(ausFormular(fd));
    if (!p.success) return { fehler: 'eingabe' };
    const t = schema.quranAusgabe;
    const ok = await db.transaction(async (tx) => {
      const [z] = await tx
        .update(t)
        .set({ aktiv: false, standard: false, freigegebenVon: null, freigegebenAm: null })
        .where(eq(t.id, p.data.id))
        .returning({ id: t.id });
      if (!z) return false;
      await verlauf(tx, 'quran_ausgabe', z.id, 'entwurf', a.benutzerId);
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'religioes.zurueckgewiesen', zielTyp: 'quran_ausgabe', zielId: z.id }, tx);
      return true;
    });
    if (!ok) return { fehler: 'nichtGefunden' };
    inhaltGeaendert(TAG.quran);
    refresh();
    return { gespeichert: Date.now() };
  });
}

/** Standardausgabe je Sprache (nur eine freigegebene Ausgabe; die übrigen dieser Sprache verlieren den Standard). */
export async function ausgabeStandard(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitRecht('religioes.freigeben', async (a) => {
    const p = ausgabeSchema.safeParse(ausFormular(fd));
    if (!p.success) return { fehler: 'eingabe' };
    const t = schema.quranAusgabe;
    const fehler = await db.transaction(async (tx): Promise<KoranFehler | null> => {
      const [alt] = await tx.select().from(t).where(eq(t.id, p.data.id)).limit(1);
      if (!alt) return 'nichtGefunden';
      if (!istFreigegeben(alt)) return 'nichtFreigegeben';
      await tx.update(t).set({ standard: false }).where(and(eq(t.sprache, alt.sprache), ne(t.id, alt.id)));
      await tx.update(t).set({ standard: true }).where(eq(t.id, alt.id));
      await protokolliere(
        { benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'quran_ausgabe', zielId: alt.id, details: { standard: true, sprache: alt.sprache } },
        tx,
      );
      return null;
    });
    if (fehler) return { fehler };
    inhaltGeaendert(TAG.quran);
    refresh();
    return { gespeichert: Date.now() };
  });
}

// ————————————————————————————————————————— Hadith-Listen

/**
 * Kuratierte Listen („auswahl“, „des-tages“) wirken sofort öffentlich und haben keine eigene Freigabespalte. Deshalb
 * ändert sie nur, wer Hadithe bearbeiten **und** religiös freigeben darf; jeder Schritt steht im Freigabe-Verlauf.
 */
async function mitListenRecht(f: (a: Angemeldet) => Promise<KoranZustand>): Promise<KoranZustand> {
  return mitRecht('hadith.bearbeiten', async (a) => (darf(a.rollen, 'religioes.freigeben') ? f(a) : { fehler: 'keinRecht' }));
}

async function listeProtokollieren(tx: Transaktion, a: Angemeldet, liste: string, nummer: string, aenderung: string) {
  await verlauf(tx, 'hadith_auswahl', liste, 'geprueft', a.benutzerId, `${aenderung} ${nummer}`);
  await protokolliere(
    { benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'hadith_auswahl', zielId: liste, details: { nummer, aenderung } },
    tx,
  );
}

export async function listeHinzufuegen(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitListenRecht(async (a) => {
    const roh = ausFormular(fd);
    const p = listenSchema.safeParse(roh);
    if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte: roh };
    const { liste, nummer } = p.data;
    const h = schema.hadithAuswahl;
    const fehler = await db.transaction(async (tx): Promise<KoranZustand | null> => {
      const [hadith] = await tx
        .select({ nummer: schema.hadith.nummer })
        .from(schema.hadith)
        .where(and(eq(schema.hadith.sammlungId, BUKHARI), eq(schema.hadith.nummer, nummer)))
        .limit(1);
      if (!hadith) return { fehler: 'pruefen', feldFehler: { nummer: 'unbekannt' }, werte: roh };
      const [schon] = await tx
        .select({ nummer: h.nummer })
        .from(h)
        .where(and(eq(h.liste, liste), eq(h.sammlungId, BUKHARI), eq(h.nummer, nummer)))
        .limit(1);
      if (schon) return { fehler: 'pruefen', feldFehler: { nummer: 'vorhanden' }, werte: roh };
      const [hoechste] = await tx
        .select({ n: max(h.reihenfolge) })
        .from(h)
        .where(and(eq(h.liste, liste), eq(h.sammlungId, BUKHARI)));
      await tx.insert(h).values({ liste, sammlungId: BUKHARI, nummer, reihenfolge: (hoechste?.n ?? 0) + 1 });
      await listeProtokollieren(tx, a, liste, nummer, 'hinzugefuegt');
      return null;
    });
    if (fehler) return fehler;
    inhaltGeaendert(TAG.hadith);
    refresh();
    return { gespeichert: Date.now() };
  });
}

export async function listeEntfernen(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitListenRecht(async (a) => {
    const p = listenSchema.safeParse(ausFormular(fd));
    if (!p.success) return { fehler: 'eingabe' };
    const { liste, nummer } = p.data;
    const h = schema.hadithAuswahl;
    const ok = await db.transaction(async (tx) => {
      const [z] = await tx
        .delete(h)
        .where(and(eq(h.liste, liste), eq(h.sammlungId, BUKHARI), eq(h.nummer, nummer)))
        .returning({ nummer: h.nummer });
      if (z) await listeProtokollieren(tx, a, liste, nummer, 'entfernt');
      return Boolean(z);
    });
    if (!ok) return { fehler: 'nichtGefunden' };
    inhaltGeaendert(TAG.hadith);
    refresh();
    return { gespeichert: Date.now() };
  });
}

export async function listeVerschieben(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitListenRecht(async (a) => {
    const p = verschiebenSchema.safeParse(ausFormular(fd));
    if (!p.success) return { fehler: 'eingabe' };
    const { liste, nummer, richtung } = p.data;
    const h = schema.hadithAuswahl;
    const ok = await db.transaction(async (tx) => {
      const zeilen = await tx
        .select({ nummer: h.nummer })
        .from(h)
        .where(and(eq(h.liste, liste), eq(h.sammlungId, BUKHARI)))
        .orderBy(h.reihenfolge, h.nummer);
      const alt = zeilen.map((z) => z.nummer);
      if (!alt.includes(nummer)) return false;
      const neu = verschiebe(alt, nummer, richtung);
      for (const [i, n] of neu.entries())
        await tx
          .update(h)
          .set({ reihenfolge: i + 1 })
          .where(and(eq(h.liste, liste), eq(h.sammlungId, BUKHARI), eq(h.nummer, n)));
      await listeProtokollieren(tx, a, liste, nummer, richtung === 'hoch' ? 'nach_oben' : 'nach_unten');
      return true;
    });
    if (!ok) return { fehler: 'nichtGefunden' };
    inhaltGeaendert(TAG.hadith);
    refresh();
    return { gespeichert: Date.now() };
  });
}
