'use server';

import { and, asc, count, eq, gte, lte, max } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { anzeigeEinstellungAusFormular, ANZEIGE_EINSTELLUNG, EINSTELLUNG_FELDER } from '@/lib/anzeige/einstellung';
import { istReligioes, type FolienInhalt } from '@/lib/anzeige/folien';
import { protokolliere, type AuditAktion } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema, type Transaktion } from '@/lib/db';
import { BUKHARI } from '@/lib/hadith/anzeige';
import { ungueltigeBildIds } from '@/lib/medien/bild';
import type { Aktion } from '@/lib/rechte/matrix';
import { KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import {
  FREIGABE_STATUS,
  gleicherInhalt,
  statusNachSpeichern,
  uebergang,
  verschiebe,
  vierAugenErfuellt,
  type FreigabeStatus,
} from '@/lib/religioes/freigabe';
import { folienDatensatz, folienRoh, folienSchema } from '@/lib/validierung/anzeige';

/**
 * Verwaltung › Anzeige (AUFTRAG 3.10, B-25): Folien anlegen, ändern, sortieren, sichtbar schalten und löschen
 * (`anzeige.bearbeiten`); Vers- und Hadith-Folien zusätzlich religiös freigeben (`religioes.freigeben`, Vier-Augen-
 * Prinzip wie im Modul „Koran & Hadith“, ADR 0030). Einstellung der Anzeige (Iqama, Ruhe, Freitagsmodus; MN-14).
 * Reihenfolge je Action (MUSTER §5): Recht → Eingabe → Speichern mit Audit in derselben Transaktion → Cache-Tag
 * `anzeige`, wenn sich Öffentliches ändert. Audit ohne Inhalte (nur Art, Kennung, Schritt).
 */
export type AnzeigeFehler = 'pruefen' | 'keinRecht' | 'nichtGefunden' | 'vierAugen' | 'uebergang' | 'grundFehlt' | 'eingabe';

export type AnzeigeZustand = {
  fehler?: AnzeigeFehler;
  feldFehler?: Record<string, string>;
  werte?: Record<string, string | string[]>;
  gespeichert?: number;
  freigabe?: FreigabeStatus;
};

const f = schema.anzeigeFolie;
const UUID = z.uuid();
const ZIEL_TYP = 'anzeige_folie';

async function mitRecht(aktion: Aktion, weiter: (a: Angemeldet) => Promise<AnzeigeZustand>): Promise<AnzeigeZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht(aktion);
  } catch (e) {
    if (e instanceof KeinRecht) return { fehler: 'keinRecht' };
    throw e;
  }
  return weiter(a);
}

function feldFehler(fehler: z.ZodError): Record<string, string> {
  const ergebnis: Record<string, string> = {};
  for (const i of fehler.issues) {
    const feld = String(i.path[0] ?? 'formular');
    ergebnis[feld] ??= /^[a-zA-Z]+$/.test(i.message) && i.message.length < 30 ? i.message : 'ungueltig';
  }
  return ergebnis;
}

/** Gibt es, worauf die Folie verweist? Vers(e) im Import, Hadith im Import, Bild in der Mediathek (nicht im Papierkorb). */
async function pruefeVerweis(art: string, inhalt: FolienInhalt, mediumId: string | null): Promise<Record<string, string> | null> {
  if (inhalt.art === 'vers') {
    const v = schema.quranVers;
    const [z] = await db
      .select({ n: count() })
      .from(v)
      .where(and(eq(v.sure, inhalt.sure), gte(v.vers, inhalt.von), lte(v.vers, inhalt.bis)));
    return Number(z?.n ?? 0) === inhalt.bis - inhalt.von + 1 ? null : { stelle: 'versUnbekannt' };
  }
  if (inhalt.art === 'hadith') {
    const [h] = await db
      .select({ nummer: schema.hadith.nummer })
      .from(schema.hadith)
      .where(and(eq(schema.hadith.sammlungId, BUKHARI), eq(schema.hadith.nummer, inhalt.nummer)))
      .limit(1);
    return h ? null : { nummer: 'hadithUnbekannt' };
  }
  if (art === 'bild') return mediumId && !(await ungueltigeBildIds([mediumId])).length ? null : { bildId: 'bildFehlt' };
  return null;
}

/** Eintrag im Freigabe-Verlauf (wie „Koran & Hadith“: Art und Kennung des Inhalts). */
async function verlauf(tx: Transaktion, id: string, status: FreigabeStatus, von: string, kommentar?: string) {
  await tx
    .insert(schema.freigabe)
    .values({ inhaltTyp: ZIEL_TYP, inhaltId: id, art: 'religioes', status, von, kommentar: kommentar || null });
}

function auditFuer(neu: FreigabeStatus): AuditAktion {
  return neu === 'geprueft' ? 'religioes.freigegeben' : neu === 'zur_pruefung' ? 'religioes.eingereicht' : 'religioes.zurueckgewiesen';
}

/** Öffentlich sichtbar ist eine Folie mit Status „veröffentlicht“ – religiöse nur mit Freigabe „geprüft“. */
function oeffentlich(z: { art: string; status: string; freigabe: string } | undefined): boolean {
  return Boolean(z && z.status === 'veroeffentlicht' && (!istReligioes(z.art) || z.freigabe === 'geprueft'));
}

/** Neue Folie (Entwurf) am Ende der Reihenfolge; religiöse Folien auf Wunsch gleich „zur Prüfung“. */
export async function legeFolieAn(_vorher: AnzeigeZustand, fd: FormData): Promise<AnzeigeZustand> {
  let neueId: string | null = null;
  const ergebnis = await mitRecht('anzeige.bearbeiten', async (a) => {
    const werte = folienRoh(fd);
    const p = folienSchema.safeParse(werte);
    if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte };
    const d = folienDatensatz(p.data);
    const verweis = await pruefeVerweis(d.art, d.inhalt, d.mediumId);
    if (verweis) return { fehler: 'pruefen', feldFehler: verweis, werte };
    const einreichen = fd.get('einreichen') === '1' && istReligioes(d.art);
    const id = await db.transaction(async (tx) => {
      const [hoechste] = await tx.select({ n: max(f.reihenfolge) }).from(f);
      const [neu] = await tx
        .insert(f)
        .values({
          ...d,
          reihenfolge: (hoechste?.n ?? 0) + 1,
          status: 'entwurf',
          freigabe: einreichen ? 'zur_pruefung' : 'entwurf',
          verfasstVon: a.benutzerId,
          erstelltVon: a.benutzerId,
        })
        .returning({ id: f.id });
      await protokolliere(
        { benutzerId: a.benutzerId, aktion: 'inhalt.angelegt', zielTyp: ZIEL_TYP, zielId: neu.id, details: { art: d.art } },
        tx,
      );
      if (einreichen) {
        await verlauf(tx, neu.id, 'zur_pruefung', a.benutzerId);
        await protokolliere({ benutzerId: a.benutzerId, aktion: 'religioes.eingereicht', zielTyp: ZIEL_TYP, zielId: neu.id }, tx);
      }
      return neu.id;
    });
    neueId = id;
    return { gespeichert: Date.now() };
  });
  if (neueId) redirect(`/verwaltung/anzeige/${neueId}?angelegt=1`);
  return ergebnis;
}

/**
 * Folie ändern. Ändert sich bei einer Vers- oder Hadith-Folie der Verweis (oder die Art), gilt das wie im Modul
 * „Koran & Hadith“: Eine geprüfte Folie geht zurück „zur Prüfung“ und verschwindet bis zur neuen Freigabe von der
 * Anzeige; die speichernde Person gilt als verfassend (Vier-Augen). Der Zeitplan allein berührt die Freigabe nicht.
 */
export async function speichereFolie(_vorher: AnzeigeZustand, fd: FormData): Promise<AnzeigeZustand> {
  return mitRecht('anzeige.bearbeiten', async (a) => {
    const werte = folienRoh(fd);
    const id = UUID.safeParse(fd.get('id'));
    if (!id.success) return { fehler: 'nichtGefunden', werte };
    const p = folienSchema.safeParse(werte);
    if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte };
    const d = folienDatensatz(p.data);
    const verweis = await pruefeVerweis(d.art, d.inhalt, d.mediumId);
    if (verweis) return { fehler: 'pruefen', feldFehler: verweis, werte };
    const einreichen = fd.get('einreichen') === '1';
    const ergebnis = await db.transaction(async (tx) => {
      const [alt] = await tx.select().from(f).where(eq(f.id, id.data)).limit(1);
      if (!alt) return null;
      const religioes = istReligioes(d.art);
      const verweisNeu = alt.art !== d.art || !gleicherInhalt(alt.inhalt, d.inhalt) || alt.mediumId !== d.mediumId;
      const geaendert =
        verweisNeu ||
        alt.von?.getTime() !== d.von?.getTime() ||
        alt.bis?.getTime() !== d.bis?.getTime() ||
        alt.wochentage.join(',') !== d.wochentage.join(',');
      const vorher: FreigabeStatus | null = istReligioes(alt.art) && alt.art === d.art ? alt.freigabe : null;
      const neu: FreigabeStatus = religioes ? statusNachSpeichern(vorher, verweisNeu, einreichen) : 'entwurf';
      const autor = verweisNeu ? { verfasstVon: a.benutzerId, geprueftVon: null, geprueftAm: null } : {};
      await tx
        .update(f)
        .set({ ...d, freigabe: neu, ...autor })
        .where(eq(f.id, alt.id));
      if (geaendert)
        await protokolliere(
          { benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: ZIEL_TYP, zielId: alt.id, details: { art: d.art } },
          tx,
        );
      if (religioes && neu !== alt.freigabe && !(vorher === null && neu === 'entwurf')) {
        await verlauf(tx, alt.id, neu, a.benutzerId);
        await protokolliere({ benutzerId: a.benutzerId, aktion: auditFuer(neu), zielTyp: ZIEL_TYP, zielId: alt.id }, tx);
      }
      return { vorher: oeffentlich(alt), nachher: oeffentlich({ art: d.art, status: alt.status, freigabe: neu }), neu, geaendert };
    });
    if (!ergebnis) return { fehler: 'nichtGefunden', werte };
    if (ergebnis.vorher || ergebnis.nachher) inhaltGeaendert(TAG.anzeige);
    return { gespeichert: Date.now(), freigabe: ergebnis.neu };
  });
}

export type FolienSchritt = 'veroeffentlichen' | 'zurueckziehen';

/** Sichtbar schalten bzw. zurückziehen (Knöpfe der Detailseite und der Liste). Wirft ohne Recht (Listenaktion). */
export async function setzeFolienStatus(fd: FormData): Promise<void> {
  const a = await verlangeRecht('anzeige.bearbeiten');
  const id = UUID.safeParse(fd.get('id'));
  const schritt = z.enum(['veroeffentlichen', 'zurueckziehen']).safeParse(fd.get('schritt'));
  if (!id.success || !schritt.success) return;
  const status = schritt.data === 'veroeffentlichen' ? 'veroeffentlicht' : 'entwurf';
  const geaendert = await db.transaction(async (tx) => {
    const [z] = await tx.update(f).set({ status }).where(eq(f.id, id.data)).returning({ art: f.art, freigabe: f.freigabe });
    if (!z) return null;
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: schritt.data === 'veroeffentlichen' ? 'inhalt.veroeffentlicht' : 'inhalt.geaendert',
        zielTyp: ZIEL_TYP,
        zielId: id.data,
        details: { schritt: schritt.data },
      },
      tx,
    );
    return z;
  });
  if (geaendert && oeffentlich({ ...geaendert, status: 'veroeffentlicht' })) inhaltGeaendert(TAG.anzeige);
  refresh();
}

/** Folie eine Stelle nach oben oder unten; die Reihenfolge wird lückenlos neu nummeriert. */
export async function verschiebeFolie(fd: FormData): Promise<void> {
  const a = await verlangeRecht('anzeige.bearbeiten');
  const id = UUID.safeParse(fd.get('id'));
  const richtung = z.enum(['hoch', 'runter']).safeParse(fd.get('richtung'));
  if (!id.success || !richtung.success) return;
  const oeffentlichBetroffen = await db.transaction(async (tx) => {
    const zeilen = await tx
      .select({ id: f.id, art: f.art, status: f.status, freigabe: f.freigabe })
      .from(f)
      .orderBy(asc(f.reihenfolge), asc(f.erstelltAm));
    const alt = zeilen.map((z) => z.id);
    if (!alt.includes(id.data)) return false;
    const neu = verschiebe(alt, id.data, richtung.data);
    for (const [i, kennung] of neu.entries())
      await tx
        .update(f)
        .set({ reihenfolge: i + 1 })
        .where(eq(f.id, kennung));
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'inhalt.geaendert',
        zielTyp: ZIEL_TYP,
        zielId: id.data,
        details: { reihenfolge: richtung.data === 'hoch' ? 'nach_oben' : 'nach_unten' },
      },
      tx,
    );
    return zeilen.some((z) => oeffentlich(z));
  });
  if (oeffentlichBetroffen) inhaltGeaendert(TAG.anzeige);
  refresh();
}

/** Folie endgültig löschen (nach Rückfrage im Dialog); danach zurück zur Liste. */
export async function loescheFolie(fd: FormData): Promise<void> {
  const a = await verlangeRecht('anzeige.bearbeiten');
  const id = UUID.safeParse(fd.get('id'));
  if (!id.success) return;
  const weg = await db.transaction(async (tx) => {
    const [z] = await tx.delete(f).where(eq(f.id, id.data)).returning({ art: f.art, status: f.status, freigabe: f.freigabe });
    if (z)
      await protokolliere(
        { benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: ZIEL_TYP, zielId: id.data, details: { art: z.art } },
        tx,
      );
    return z;
  });
  if (!weg) return;
  if (oeffentlich(weg)) inhaltGeaendert(TAG.anzeige);
  redirect('/verwaltung/anzeige?geloescht=1');
}

const freigabeSchema = z
  .object({
    id: z.uuid('eingabe'),
    ziel: z.enum(FREIGABE_STATUS, 'eingabe'),
    grund: z.string().trim().max(300, 'zuLang').default(''),
  })
  .superRefine((e, ctx) => {
    if (e.ziel === 'entwurf' && e.grund.length < 3) ctx.addIssue({ code: 'custom', path: ['grund'], message: 'grundFehlt' });
  });

/**
 * Religiöse Freigabe einer Vers- oder Hadith-Folie: einreichen (`anzeige.bearbeiten`), freigeben (nur
 * `religioes.freigeben` und nicht die Person, die zuletzt verfasst hat), zurückweisen bzw. Freigabe aufheben
 * (`religioes.freigeben`, mit Grund). Jeder Schritt steht im Freigabe-Verlauf und im Audit.
 */
export async function folienFreigabe(_vorher: AnzeigeZustand, fd: FormData): Promise<AnzeigeZustand> {
  const p = freigabeSchema.safeParse({ id: fd.get('id'), ziel: fd.get('ziel'), grund: fd.get('grund') ?? '' });
  if (!p.success) {
    const ff = feldFehler(p.error);
    return ff.grund ? { fehler: 'grundFehlt', feldFehler: ff } : { fehler: 'eingabe' };
  }
  const e = p.data;
  return mitRecht(e.ziel === 'zur_pruefung' ? 'anzeige.bearbeiten' : 'religioes.freigeben', async (a) => {
    const ergebnis = await db.transaction(async (tx): Promise<AnzeigeZustand | { vorher: boolean; nachher: boolean }> => {
      const [alt] = await tx.select().from(f).where(eq(f.id, e.id)).limit(1);
      if (!alt) return { fehler: 'nichtGefunden' };
      if (!istReligioes(alt.art)) return { fehler: 'uebergang' };
      const schritt = uebergang(alt.freigabe, e.ziel);
      if (!schritt) return { fehler: 'uebergang' };
      if (schritt === 'freigeben' && !vierAugenErfuellt(alt.verfasstVon, a.benutzerId)) return { fehler: 'vierAugen' };
      const freigeben = schritt === 'freigeben';
      await tx
        .update(f)
        .set({ freigabe: e.ziel, geprueftVon: freigeben ? a.benutzerId : null, geprueftAm: freigeben ? new Date() : null })
        .where(eq(f.id, alt.id));
      await verlauf(tx, alt.id, e.ziel, a.benutzerId, e.grund);
      await protokolliere({ benutzerId: a.benutzerId, aktion: auditFuer(e.ziel), zielTyp: ZIEL_TYP, zielId: alt.id }, tx);
      return { vorher: oeffentlich(alt), nachher: oeffentlich({ ...alt, freigabe: e.ziel }) };
    });
    if (!('vorher' in ergebnis)) return ergebnis;
    if (ergebnis.vorher || ergebnis.nachher) inhaltGeaendert(TAG.anzeige);
    refresh();
    return { gespeichert: Date.now(), freigabe: e.ziel };
  });
}

/** Einstellung der Anzeige: Iqama je Gebet (leer = ausgeblendet, MN-14), Ruhe, Freitagsmodus, Foliendauer. */
export async function speichereAnzeigeEinstellung(_vorher: AnzeigeZustand, fd: FormData): Promise<AnzeigeZustand> {
  return mitRecht('anzeige.bearbeiten', async (a) => {
    const roh = Object.fromEntries(EINSTELLUNG_FELDER.map((k) => [k, String(fd.get(k) ?? '')]));
    const ergebnis = anzeigeEinstellungAusFormular(roh);
    if (!ergebnis.ok) return { fehler: 'pruefen', feldFehler: ergebnis.feldFehler, werte: roh };
    await db.transaction(async (tx) => {
      await tx
        .insert(schema.einstellung)
        .values({ schluessel: ANZEIGE_EINSTELLUNG, wert: ergebnis.wert, geaendertVon: a.benutzerId })
        .onConflictDoUpdate({
          target: schema.einstellung.schluessel,
          set: { wert: ergebnis.wert, geaendertAm: new Date(), geaendertVon: a.benutzerId },
        });
      await protokolliere(
        { benutzerId: a.benutzerId, aktion: 'einstellung.geaendert', zielTyp: 'einstellung', zielId: ANZEIGE_EINSTELLUNG },
        tx,
      );
    });
    inhaltGeaendert(TAG.anzeige);
    return { gespeichert: Date.now() };
  });
}
