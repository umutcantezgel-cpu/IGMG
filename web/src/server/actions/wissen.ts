'use server';

import { and, eq, isNotNull, isNull, max } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { ReihenfolgeZustand } from '@/components/verwaltung/reihenfolge/typen';
import { protokolliere, type AuditAktion } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { schreibeRevision } from '@/lib/cms/revision';
import { db, schema, type Transaktion } from '@/lib/db';
import { KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { gleicherInhalt, statusNachSpeichern, type FreigabeStatus } from '@/lib/religioes/freigabe';
import { richtextSchema } from '@/lib/validierung/richtext';
import { WISSEN_FELDER, wissenDatensatz, wissenKlartext, wissenSchema, type WissenInhaltDaten } from '@/lib/validierung/wissen';
import { wissenCacheBetroffen } from '@/lib/wissen/entwurf';

/**
 * Verwaltung „Islamisches Wissen“ (F-40, Plan §3.7 und §5, ADR 0030; MUSTER 5). Recht `wissen.bearbeiten` (Redaktion,
 * religiöse Prüfung, Administration). Themen anlegen und bearbeiten (Titel, Kurztext, Einführung je Sprache),
 * Reihenfolge, Papierkorb, endgültig löschen, frühere Fassungen. Die Plattform schreibt keine religiösen Inhalte.
 *
 * Religiöse Freigabe: Entwurf → zur Prüfung → geprüft. Freigeben nur in der Warteschlange „Freigaben“ (Rolle
 * `religioese_pruefung`, Vier-Augen-Prinzip: wer zuletzt verfasst hat, gibt nicht selbst frei). Jede inhaltliche
 * Änderung setzt ein geprüftes Thema auf „zur Prüfung“ zurück (`statusNachSpeichern`); öffentlich ist nur, was geprüft
 * UND sichtbar geschaltet ist – mit dem Schalter `website_wissen_vorschau` auch „zur Prüfung“ als gekennzeichneter Entwurf
 * (ADR 0047). Jeder Statuswechsel steht im Freigabe-Verlauf und im Audit (ohne Inhalte); jedes Speichern legt eine Revision
 * an. Ändert sich, was öffentlich ist oder sein kann, verfällt der Cache-Tag `wissen` (`wissenCacheBetroffen`).
 */
export type WissenZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, string>;
  gespeichert?: number;
  freigabe?: FreigabeStatus;
};

const INHALT_TYP = 'wissen_thema';
const t = schema.wissenThema;
const UUID = z.uuid();

type Zeile = typeof t.$inferSelect;

/** Momentaufnahme für die Revision: alle bearbeitbaren Felder und der Stand. */
function momentaufnahme(z: Pick<Zeile, 'slug' | 'titel' | 'kurztext' | 'inhalt' | 'status' | 'freigabe'>) {
  return { slug: z.slug, titel: z.titel, kurztext: z.kurztext, inhalt: z.inhalt, status: z.status, freigabe: z.freigabe };
}

function auditFuer(neu: FreigabeStatus): AuditAktion {
  return neu === 'geprueft' ? 'religioes.freigegeben' : neu === 'zur_pruefung' ? 'religioes.eingereicht' : 'religioes.zurueckgewiesen';
}

/** Statuswechsel im Freigabe-Verlauf (wie „Koran & Hadith“) und im Audit. */
async function verlauf(tx: Transaktion, a: Angemeldet, id: string, neu: FreigabeStatus) {
  await tx.insert(schema.freigabe).values({ inhaltTyp: INHALT_TYP, inhaltId: id, art: 'religioes', status: neu, von: a.benutzerId });
  await protokolliere({ benutzerId: a.benutzerId, aktion: auditFuer(neu), zielTyp: INHALT_TYP, zielId: id }, tx);
}

function feldFehler(issues: readonly z.core.$ZodIssue[]): Record<string, string> {
  const aus: Record<string, string> = {};
  for (const f of issues) {
    const feld = String(f.path[0] ?? 'formular');
    aus[feld] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 30 ? f.message : 'ungueltig';
  }
  return aus;
}

/** Anlegen (ohne `id`) oder ändern. „einreichen“ gibt das Thema zur religiösen Prüfung. */
export async function speichereWissensThema(_vorher: WissenZustand, fd: FormData): Promise<WissenZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('wissen.bearbeiten');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const werte = Object.fromEntries(WISSEN_FELDER.map((f) => [f, String(fd.get(f) ?? '')]));
  const p = wissenSchema.safeParse(werte);
  if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error.issues), werte };
  const e = p.data;
  const daten = wissenDatensatz(e);
  const status = e.sichtbar ? ('veroeffentlicht' as const) : ('entwurf' as const);

  if (!e.id) {
    const ergebnis = await db.transaction(async (tx) => {
      const [vorhanden] = await tx.select({ id: t.id }).from(t).where(eq(t.slug, e.slug)).limit(1);
      if (vorhanden) return null;
      const [{ hoechste }] = await tx.select({ hoechste: max(t.sortierung) }).from(t);
      const freigabe: FreigabeStatus = e.einreichen ? 'zur_pruefung' : 'entwurf';
      const [neu] = await tx
        .insert(t)
        .values({
          ...daten,
          slug: e.slug,
          // Pflichtspalte ohne Bedeutung auf der Website (wie der Bestand, Seed „wissen“)
          kategorie: 'thema',
          status,
          sortierung: (hoechste ?? 0) + 1,
          freigabe,
          verfasstVon: a.benutzerId,
          erstelltVon: a.benutzerId,
          aktualisiertVon: a.benutzerId,
        })
        .returning();
      await schreibeRevision(tx, { inhaltTyp: INHALT_TYP, inhaltId: neu.id, inhalt: momentaufnahme(neu), erstelltVon: a.benutzerId });
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.angelegt', zielTyp: INHALT_TYP, zielId: neu.id }, tx);
      if (freigabe === 'zur_pruefung') await verlauf(tx, a, neu.id, freigabe);
      return neu.id;
    });
    if (!ergebnis) return { fehler: 'pruefen', feldFehler: { slug: 'slugVergeben' }, werte };
    // Neue Themen sind nie öffentlich (erst nach der Freigabe) – kein Cache betroffen
    redirect(`/verwaltung/wissen/${ergebnis}?angelegt=1`);
  }

  const ergebnis = await db.transaction(async (tx) => {
    const [alt] = await tx
      .select()
      .from(t)
      .where(and(eq(t.id, e.id), isNull(t.imPapierkorbSeit)))
      .limit(1);
    if (!alt) return null;
    const vorher: WissenInhaltDaten = { titel: alt.titel, kurztext: alt.kurztext, inhalt: alt.inhalt };
    const inhaltNeu: WissenInhaltDaten = { titel: daten.titel, kurztext: daten.kurztext, inhalt: daten.inhalt };
    const geaendert = !gleicherInhalt(inhaltNeu, vorher);
    const neu = statusNachSpeichern(alt.freigabe, geaendert, e.einreichen);
    const statusGeaendert = alt.status !== status;
    if (!geaendert && !statusGeaendert && neu === alt.freigabe) return { alt, neu, geaendert, statusGeaendert };
    const werteNeu = {
      ...(geaendert
        ? { ...inhaltNeu, klartext: wissenKlartext(inhaltNeu), verfasstVon: a.benutzerId, geprueftVon: null, geprueftAm: null }
        : {}),
      freigabe: neu,
      status,
      aktualisiertVon: a.benutzerId,
    };
    await tx.update(t).set(werteNeu).where(eq(t.id, alt.id));
    await schreibeRevision(tx, {
      inhaltTyp: INHALT_TYP,
      inhaltId: alt.id,
      inhalt: momentaufnahme({ ...alt, ...inhaltNeu, status, freigabe: neu }),
      erstelltVon: a.benutzerId,
    });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'inhalt.geaendert',
        zielTyp: INHALT_TYP,
        zielId: alt.id,
        details: { inhalt: geaendert, sichtbar: status === 'veroeffentlicht', freigabe: neu },
      },
      tx,
    );
    if (neu !== alt.freigabe) await verlauf(tx, a, alt.id, neu);
    return { alt, neu, geaendert, statusGeaendert };
  });
  if (!ergebnis) return { fehler: 'nichtGefunden', werte };
  const { alt, neu, geaendert, statusGeaendert } = ergebnis;
  // Öffentlich ist, was sichtbar und „geprüft“ ist – mit dem Schalter `website_wissen_vorschau` auch „zur Prüfung“ als
  // gekennzeichneter Entwurf (ADR 0047): betroffen, wenn vorher oder nachher einer dieser Stände galt
  if (wissenCacheBetroffen(alt.freigabe, neu, geaendert, statusGeaendert)) inhaltGeaendert(TAG.wissen);
  refresh();
  return { gespeichert: Date.now(), freigabe: neu };
}

/**
 * Reihenfolge der Themen (Feld `ordnung`: JSON-Liste aller Themen-IDs außerhalb des Papierkorbs). Keine inhaltliche
 * Änderung. Cache und Audit nur, wenn sich eine Stelle wirklich geändert hat.
 */
export async function speichereWissensReihenfolge(_vorher: ReihenfolgeZustand, fd: FormData): Promise<ReihenfolgeZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('wissen.bearbeiten');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const roh = fd.get('ordnung');
  let liste: unknown;
  try {
    liste = typeof roh === 'string' && roh.length <= 40_000 ? JSON.parse(roh) : null;
  } catch {
    liste = null;
  }
  const p = z.array(z.uuid()).max(500).safeParse(liste);
  if (!p.success || new Set(p.data).size !== p.data.length) return { fehler: 'pruefen' };
  const ids = p.data;
  const anzahl = await db.transaction(async (tx) => {
    const vorhanden = await tx.select({ id: t.id, sortierung: t.sortierung }).from(t).where(isNull(t.imPapierkorbSeit));
    // Nur eine vollständige Liste gilt (sonst hat sich der Bestand inzwischen geändert)
    if (vorhanden.length !== ids.length || !vorhanden.every((z) => ids.includes(z.id))) return null;
    const alt = new Map(vorhanden.map((z) => [z.id, z.sortierung]));
    let geaendert = 0;
    for (const [i, id] of ids.entries()) {
      if (alt.get(id) === i + 1) continue;
      await tx
        .update(t)
        .set({ sortierung: i + 1, aktualisiertVon: a.benutzerId })
        .where(eq(t.id, id));
      geaendert++;
    }
    if (geaendert)
      await protokolliere(
        { benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: INHALT_TYP, details: { reihenfolge: true, anzahl: geaendert } },
        tx,
      );
    return geaendert;
  });
  if (anzahl === null) return { fehler: 'veraltet' };
  if (anzahl) {
    inhaltGeaendert(TAG.wissen);
    refresh();
  }
  return { gespeichert: Date.now() };
}

/** Thema per ID aus dem Formular (Feld `id`), mit Recht. */
async function mitThema(fd: FormData): Promise<{ a: Angemeldet; zeile: Zeile } | null> {
  const a = await verlangeRecht('wissen.bearbeiten');
  const p = UUID.safeParse(fd.get('id'));
  if (!p.success) return null;
  const [zeile] = await db.select().from(t).where(eq(t.id, p.data)).limit(1);
  return zeile ? { a, zeile } : null;
}

/** In den Papierkorb (30 Tage, K-05): sofort nicht mehr öffentlich. */
export async function wissensThemaInPapierkorb(fd: FormData): Promise<void> {
  const r = await mitThema(fd);
  if (!r) return;
  await db.transaction(async (tx) => {
    const geaendert = await tx
      .update(t)
      .set({ imPapierkorbSeit: new Date(), aktualisiertVon: r.a.benutzerId })
      .where(and(eq(t.id, r.zeile.id), isNull(t.imPapierkorbSeit)))
      .returning({ id: t.id });
    if (geaendert.length)
      await protokolliere({ benutzerId: r.a.benutzerId, aktion: 'inhalt.papierkorb', zielTyp: INHALT_TYP, zielId: r.zeile.id }, tx);
  });
  inhaltGeaendert(TAG.wissen);
  refresh();
}

/** Aus dem Papierkorb zurück (ans Ende der Reihenfolge); Freigabe und Sichtbarkeit bleiben wie vorher. */
export async function wissensThemaWiederherstellen(fd: FormData): Promise<void> {
  const r = await mitThema(fd);
  if (!r) return;
  await db.transaction(async (tx) => {
    const [{ hoechste }] = await tx
      .select({ hoechste: max(t.sortierung) })
      .from(t)
      .where(isNull(t.imPapierkorbSeit));
    const geaendert = await tx
      .update(t)
      .set({ imPapierkorbSeit: null, sortierung: (hoechste ?? 0) + 1, aktualisiertVon: r.a.benutzerId })
      .where(and(eq(t.id, r.zeile.id), isNotNull(t.imPapierkorbSeit)))
      .returning({ id: t.id });
    if (geaendert.length)
      await protokolliere({ benutzerId: r.a.benutzerId, aktion: 'inhalt.wiederhergestellt', zielTyp: INHALT_TYP, zielId: r.zeile.id }, tx);
  });
  inhaltGeaendert(TAG.wissen);
  refresh();
}

/** Endgültig löschen – nur aus dem Papierkorb (mit Rückfrage in der Oberfläche), samt Revisionen und Freigabe-Verlauf. */
export async function wissensThemaEndgueltigLoeschen(fd: FormData): Promise<void> {
  const r = await mitThema(fd);
  if (!r) return;
  if (!r.zeile.imPapierkorbSeit) throw new KeinRecht();
  await db.transaction(async (tx) => {
    await tx.delete(t).where(and(eq(t.id, r.zeile.id), isNotNull(t.imPapierkorbSeit)));
    await tx.delete(schema.revision).where(and(eq(schema.revision.inhaltTyp, INHALT_TYP), eq(schema.revision.inhaltId, r.zeile.id)));
    await tx.delete(schema.freigabe).where(and(eq(schema.freigabe.inhaltTyp, INHALT_TYP), eq(schema.freigabe.inhaltId, r.zeile.id)));
    await protokolliere({ benutzerId: r.a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: INHALT_TYP, zielId: r.zeile.id }, tx);
  });
  refresh();
}

const fassung = z.object({
  titel: z.object({ de: z.string().min(1), tr: z.string().optional(), en: z.string().optional() }),
  kurztext: z.object({ de: z.string(), tr: z.string().optional(), en: z.string().optional() }).nullable().default(null),
  inhalt: z.object({ de: richtextSchema, tr: richtextSchema.optional(), en: richtextSchema.optional() }).nullable().default(null),
});

/**
 * Frühere Fassung zurückholen: Titel, Kurztext und Einführung kehren zurück (Adresse und Sichtbarkeit bleiben). Das ist
 * eine inhaltliche Änderung: Ein geprüftes Thema geht zurück in die Prüfung, die zurückholende Person gilt als verfassend.
 */
export async function wissensRevisionWiederherstellen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('wissen.bearbeiten');
  const p = UUID.safeParse(fd.get('revisionId'));
  if (!p.success) return;
  const [rev] = await db.select().from(schema.revision).where(eq(schema.revision.id, p.data)).limit(1);
  if (!rev || rev.inhaltTyp !== INHALT_TYP) throw new KeinRecht();
  const inhalt = fassung.safeParse(rev.inhalt);
  if (!inhalt.success) return;
  const ergebnis = await db.transaction(async (tx) => {
    const [alt] = await tx
      .select()
      .from(t)
      .where(and(eq(t.id, rev.inhaltId), isNull(t.imPapierkorbSeit)))
      .limit(1);
    if (!alt) return null;
    const neuInhalt: WissenInhaltDaten = {
      titel: inhalt.data.titel,
      kurztext: inhalt.data.kurztext,
      inhalt: inhalt.data.inhalt as WissenInhaltDaten['inhalt'],
    };
    const geaendert = !gleicherInhalt(neuInhalt, { titel: alt.titel, kurztext: alt.kurztext, inhalt: alt.inhalt });
    if (!geaendert) return { alt, neu: alt.freigabe, geaendert };
    const neu = statusNachSpeichern(alt.freigabe, true, false);
    await tx
      .update(t)
      .set({
        ...neuInhalt,
        klartext: wissenKlartext(neuInhalt),
        freigabe: neu,
        verfasstVon: a.benutzerId,
        geprueftVon: null,
        geprueftAm: null,
        aktualisiertVon: a.benutzerId,
      })
      .where(eq(t.id, alt.id));
    await schreibeRevision(tx, {
      inhaltTyp: INHALT_TYP,
      inhaltId: alt.id,
      inhalt: momentaufnahme({ ...alt, ...neuInhalt, freigabe: neu }),
      erstelltVon: a.benutzerId,
      kommentar: 'wiederhergestellt',
    });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'inhalt.revision_wiederhergestellt',
        zielTyp: INHALT_TYP,
        zielId: alt.id,
        details: { revision: rev.id },
      },
      tx,
    );
    if (neu !== alt.freigabe) await verlauf(tx, a, alt.id, neu);
    return { alt, neu, geaendert };
  });
  if (!ergebnis) return;
  if (wissenCacheBetroffen(ergebnis.alt.freigabe, ergebnis.neu, ergebnis.geaendert, false)) inhaltGeaendert(TAG.wissen);
  redirect(`/verwaltung/wissen/${ergebnis.alt.id}?wiederhergestellt=1`);
}
