'use server';

import { and, asc, eq, max } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema, type Transaktion } from '@/lib/db';
import { darf, KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { leseVersStelle, VERS_LISTEN } from '@/lib/religioes/des-tages';
import { verschiebe } from '@/lib/religioes/freigabe';
import type { KoranZustand } from './koran';

/**
 * „Vers des Tages“ (AUFTRAG 3.10, Kür K-A) im Modul „Koran & Hadith“: kuratierte Liste von Verweisen auf importierte
 * Verse – hinzufügen, sortieren, entfernen. Wie die Hadith-Listen wirkt die Liste sofort öffentlich (Startseite) und
 * hat keine eigene Freigabespalte: Ändern darf nur, wer Verse bearbeiten **und** religiös freigeben darf; jeder Schritt
 * steht im Freigabe-Verlauf und im Audit (ohne Inhalte). Nie eigener religiöser Text – nur Sure und Vers.
 */
const ZIEL_TYP = 'quran_vers_auswahl';
const a = schema.quranVersAuswahl;

const listenSchema = z.object({ liste: z.enum(VERS_LISTEN, 'eingabe'), stelle: z.string().trim().max(10, 'stelle') });
const verschiebenSchema = listenSchema.extend({ richtung: z.enum(['hoch', 'runter'], 'eingabe') });

async function mitListenRecht(f: (a: Angemeldet) => Promise<KoranZustand>): Promise<KoranZustand> {
  try {
    const angemeldet = await verlangeRecht('quran.bearbeiten');
    return darf(angemeldet.rollen, 'religioes.freigeben') ? f(angemeldet) : { fehler: 'keinRecht' };
  } catch (e) {
    if (e instanceof KeinRecht) return { fehler: 'keinRecht' };
    throw e;
  }
}

async function protokolliereListe(tx: Transaktion, wer: Angemeldet, liste: string, stelle: string, aenderung: string) {
  await tx
    .insert(schema.freigabe)
    .values({
      inhaltTyp: ZIEL_TYP,
      inhaltId: liste,
      art: 'religioes',
      status: 'geprueft',
      von: wer.benutzerId,
      kommentar: `${aenderung} ${stelle}`,
    });
  await protokolliere(
    { benutzerId: wer.benutzerId, aktion: 'inhalt.geaendert', zielTyp: ZIEL_TYP, zielId: liste, details: { stelle, aenderung } },
    tx,
  );
}

function roh(fd: FormData): Record<string, string> {
  return { liste: String(fd.get('liste') ?? ''), stelle: String(fd.get('stelle') ?? ''), richtung: String(fd.get('richtung') ?? '') };
}

/** Vers (Sure:Vers) an das Ende der Liste; nur Verse, die der Import kennt, und jeder höchstens einmal. */
export async function versHinzufuegen(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitListenRecht(async (wer) => {
    const werte = roh(fd);
    const p = listenSchema.safeParse(werte);
    if (!p.success) return { fehler: 'eingabe' };
    const s = leseVersStelle(p.data.stelle);
    if (!s) return { fehler: 'pruefen', feldFehler: { stelle: 'stelle' }, werte };
    const stelle = `${s.sure}:${s.vers}`;
    const fehler = await db.transaction(async (tx): Promise<KoranZustand | null> => {
      const [vers] = await tx
        .select({ vers: schema.quranVers.vers })
        .from(schema.quranVers)
        .where(and(eq(schema.quranVers.sure, s.sure), eq(schema.quranVers.vers, s.vers)))
        .limit(1);
      if (!vers) return { fehler: 'pruefen', feldFehler: { stelle: 'versUnbekannt' }, werte };
      const [schon] = await tx
        .select({ sure: a.sure })
        .from(a)
        .where(and(eq(a.liste, p.data.liste), eq(a.sure, s.sure), eq(a.vers, s.vers)))
        .limit(1);
      if (schon) return { fehler: 'pruefen', feldFehler: { stelle: 'versVorhanden' }, werte };
      const [hoechste] = await tx
        .select({ n: max(a.reihenfolge) })
        .from(a)
        .where(eq(a.liste, p.data.liste));
      await tx
        .insert(a)
        .values({ liste: p.data.liste, sure: s.sure, vers: s.vers, reihenfolge: (hoechste?.n ?? 0) + 1, erstelltVon: wer.benutzerId });
      await protokolliereListe(tx, wer, p.data.liste, stelle, 'hinzugefuegt');
      return null;
    });
    if (fehler) return fehler;
    inhaltGeaendert(TAG.quran);
    refresh();
    return { gespeichert: Date.now() };
  });
}

export async function versEntfernen(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitListenRecht(async (wer) => {
    const p = listenSchema.safeParse(roh(fd));
    const s = p.success ? leseVersStelle(p.data.stelle) : null;
    if (!p.success || !s) return { fehler: 'eingabe' };
    const ok = await db.transaction(async (tx) => {
      const [z] = await tx
        .delete(a)
        .where(and(eq(a.liste, p.data.liste), eq(a.sure, s.sure), eq(a.vers, s.vers)))
        .returning({ sure: a.sure });
      if (z) await protokolliereListe(tx, wer, p.data.liste, `${s.sure}:${s.vers}`, 'entfernt');
      return Boolean(z);
    });
    if (!ok) return { fehler: 'nichtGefunden' };
    inhaltGeaendert(TAG.quran);
    refresh();
    return { gespeichert: Date.now() };
  });
}

export async function versVerschieben(_: KoranZustand, fd: FormData): Promise<KoranZustand> {
  return mitListenRecht(async (wer) => {
    const p = verschiebenSchema.safeParse(roh(fd));
    const s = p.success ? leseVersStelle(p.data.stelle) : null;
    if (!p.success || !s) return { fehler: 'eingabe' };
    const stelle = `${s.sure}:${s.vers}`;
    const ok = await db.transaction(async (tx) => {
      const zeilen = await tx
        .select({ sure: a.sure, vers: a.vers })
        .from(a)
        .where(eq(a.liste, p.data.liste))
        .orderBy(asc(a.reihenfolge), asc(a.sure), asc(a.vers));
      const alt = zeilen.map((z) => `${z.sure}:${z.vers}`);
      if (!alt.includes(stelle)) return false;
      for (const [i, k] of verschiebe(alt, stelle, p.data.richtung).entries()) {
        const [sure, vers] = k.split(':').map(Number);
        await tx
          .update(a)
          .set({ reihenfolge: i + 1 })
          .where(and(eq(a.liste, p.data.liste), eq(a.sure, sure), eq(a.vers, vers)));
      }
      await protokolliereListe(tx, wer, p.data.liste, stelle, p.data.richtung === 'hoch' ? 'nach_oben' : 'nach_unten');
      return true;
    });
    if (!ok) return { fehler: 'nichtGefunden' };
    inhaltGeaendert(TAG.quran);
    refresh();
    return { gespeichert: Date.now() };
  });
}
