'use server';

import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { legeHatimAn } from '@/lib/hatim/dienst';
import { verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { HATIM_FELDER, hatimDatensatz, hatimSchema } from '@/lib/validierung/hatim';

/**
 * Verwaltung „Hatim“ (AUFTRAG 3.10, B-19). Recht `hatim.bearbeiten` (Redaktion, Administration). Reihenfolge je Action:
 * Recht → Eingabe prüfen → Speichern mit Audit in derselben Transaktion → `inhaltGeaendert(TAG.hatim, TAG.hatimVon(id))`.
 * Fehler sind Schlüssel unter `verwaltung.hatim.fehler`. Personendaten (wer liest welchen Cüz) ändern diese Actions
 * nicht – Übernahmen laufen in „Mein Bereich“.
 */
export type HatimZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, string>;
  gespeichert?: number;
};

const h = schema.hatim;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function roh(fd: FormData): Record<string, string> {
  return Object.fromEntries(HATIM_FELDER.map((f) => [f, String(fd.get(f) ?? '')]));
}

function pruefe(werte: Record<string, string>) {
  const p = hatimSchema.safeParse(werte);
  if (p.success) return { ok: true as const, daten: hatimDatensatz(p.data) };
  const feldFehler: Record<string, string> = {};
  for (const f of p.error.issues) {
    const feld = String(f.path[0] ?? 'formular');
    feldFehler[feld] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 30 ? f.message : 'ungueltig';
  }
  return { ok: false as const, feldFehler };
}

async function recht(): Promise<Angemeldet | null> {
  try {
    return await verlangeRecht('hatim.bearbeiten');
  } catch {
    return null;
  }
}

/** Neue Hatim als Entwurf mit 30 freien Cüz; danach zur Detailseite. */
export async function legeHatimAnAktion(_vorher: HatimZustand, fd: FormData): Promise<HatimZustand> {
  const a = await recht();
  if (!a) return { fehler: 'keinRecht' };
  const werte = roh(fd);
  const p = pruefe(werte);
  if (!p.ok) return { fehler: 'pruefen', feldFehler: p.feldFehler, werte };
  const id = await legeHatimAn(p.daten, a.benutzerId, (tx, neu) =>
    protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.angelegt', zielTyp: 'hatim', zielId: neu }, tx),
  );
  inhaltGeaendert(TAG.hatim);
  redirect(`/verwaltung/hatim/${id}?angelegt=1`);
}

/** Titel, Anlass und Daten ändern (Stand der Cüz bleibt). */
export async function speichereHatim(_vorher: HatimZustand, fd: FormData): Promise<HatimZustand> {
  const a = await recht();
  if (!a) return { fehler: 'keinRecht' };
  const id = String(fd.get('id') ?? '');
  const werte = roh(fd);
  if (!UUID.test(id)) return { fehler: 'nichtGefunden', werte };
  const p = pruefe(werte);
  if (!p.ok) return { fehler: 'pruefen', feldFehler: p.feldFehler, werte };
  const geaendert = await db.transaction(async (tx) => {
    const r = await tx.update(h).set(p.daten).where(eq(h.id, id)).returning({ id: h.id });
    if (!r.length) return false;
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'hatim', zielId: id }, tx);
    return true;
  });
  if (!geaendert) return { fehler: 'nichtGefunden', werte };
  inhaltGeaendert(TAG.hatim, TAG.hatimVon(id));
  return { gespeichert: Date.now() };
}

export type HatimSchritt = 'veroeffentlichen' | 'zurueckziehen' | 'abschliessen' | 'oeffnen' | 'archivieren';

const SCHRITTE: Record<HatimSchritt, Partial<typeof h.$inferInsert>> = {
  veroeffentlichen: { oeffentlich: 'veroeffentlicht' },
  zurueckziehen: { oeffentlich: 'entwurf' },
  abschliessen: { status: 'abgeschlossen' },
  oeffnen: { status: 'offen' },
  archivieren: { status: 'archiviert' },
};

/**
 * Zustand wechseln (Knöpfe der Detailseite): veröffentlichen/zurückziehen (öffentlich sichtbar), abschließen, wieder
 * öffnen, archivieren (aus der öffentlichen Liste, Link bleibt). Wirft ohne Recht (Listenaktion, Muster §5).
 */
export async function setzeHatimZustand(fd: FormData): Promise<void> {
  const a = await verlangeRecht('hatim.bearbeiten');
  const id = String(fd.get('id') ?? '');
  const schritt = String(fd.get('schritt') ?? '') as HatimSchritt;
  if (!UUID.test(id) || !Object.hasOwn(SCHRITTE, schritt)) return;
  await db.transaction(async (tx) => {
    const r = await tx.update(h).set(SCHRITTE[schritt]).where(eq(h.id, id)).returning({ id: h.id });
    if (!r.length) return;
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: schritt === 'veroeffentlichen' ? 'inhalt.veroeffentlicht' : 'inhalt.geaendert',
        zielTyp: 'hatim',
        zielId: id,
        details: { schritt },
      },
      tx,
    );
  });
  inhaltGeaendert(TAG.hatim, TAG.hatimVon(id));
  refresh();
}

/** Entwurf ohne übernommene Cüz endgültig löschen (sonst bleibt nur Archivieren). */
export async function loescheHatim(fd: FormData): Promise<void> {
  const a = await verlangeRecht('hatim.bearbeiten');
  const id = String(fd.get('id') ?? '');
  if (!UUID.test(id)) return;
  const geloescht = await db.transaction(async (tx) => {
    const [belegt] = await tx
      .select({ n: sql<number>`count(*)::int` })
      .from(schema.hatimTeil)
      .where(and(eq(schema.hatimTeil.hatimId, id), isNotNull(schema.hatimTeil.benutzerId)));
    if (belegt.n > 0) return false;
    const r = await tx
      .delete(h)
      .where(and(eq(h.id, id), eq(h.oeffentlich, 'entwurf')))
      .returning({ id: h.id });
    if (!r.length) return false;
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: 'hatim', zielId: id }, tx);
    return true;
  });
  if (!geloescht) return;
  inhaltGeaendert(TAG.hatim, TAG.hatimVon(id));
  redirect('/verwaltung/hatim?geloescht=1');
}
