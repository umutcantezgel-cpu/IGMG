'use server';

import { refresh } from 'next/cache';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { bearbeiteMeldung, entferneAlsKinderschutz, meldungsKontext, pausiereAlsKinderschutz, setzeNotfallpause } from '@/lib/chat/dienst';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';

/**
 * Verwaltung › Meldungen & Kinderschutz (S-08, S-09, S-11, S-17). Nur Rolle `kinderschutz` bzw. `chat.notfallpause` –
 * Chat-Inhalte nie über „Administration darf alles“ (ADR 0026, NIE_PER_ADMINISTRATION). Jede Handlung mit Grund;
 * der Dienst schreibt sie ins unveränderliche Moderationsprotokoll (S-10).
 */
export type KinderschutzZustand = { fehler?: 'grundFehlt' | 'keinRecht' | 'nichtGefunden' | 'eingabe'; gespeichert?: boolean };

const grund = z.string().trim().min(3).max(300);
const uuid = z.string().uuid();

async function mitRecht<T>(
  aktion: Parameters<typeof verlangeRecht>[0],
  f: (benutzerId: string) => Promise<T>,
): Promise<T | KinderschutzZustand> {
  try {
    const a = await verlangeRecht(aktion);
    return await f(a.benutzerId);
  } catch (e) {
    if (e instanceof KeinRecht) return { fehler: 'keinRecht' };
    throw e;
  }
}

function ergebnis(fehler: string | null): KinderschutzZustand {
  if (fehler === 'grundFehlt' || fehler === 'keinRecht' || fehler === 'nichtGefunden') return { fehler };
  refresh();
  return { gespeichert: true };
}

export async function notfallpauseSetzen(_: KinderschutzZustand, fd: FormData): Promise<KinderschutzZustand> {
  const g = grund.safeParse(fd.get('grund'));
  if (!g.success) return { fehler: 'grundFehlt' };
  const an = fd.get('an') === '1';
  return mitRecht('chat.notfallpause', async (benutzerId) => {
    const fehler = await setzeNotfallpause(benutzerId, an, g.data);
    if (!fehler) await protokolliere({ benutzerId, aktion: an ? 'chat.notfallpause' : 'chat.notfallpause_aufgehoben' });
    return ergebnis(fehler);
  });
}

export async function meldungStatusSetzen(_: KinderschutzZustand, fd: FormData): Promise<KinderschutzZustand> {
  const id = uuid.safeParse(fd.get('id'));
  const status = z.enum(['in_bearbeitung', 'erledigt']).safeParse(fd.get('status'));
  if (!id.success || !status.success) return { fehler: 'eingabe' };
  const g = grund.safeParse(fd.get('grund'));
  if (!g.success) return { fehler: 'grundFehlt' };
  return mitRecht('meldung.chat.bearbeiten', async (benutzerId) => {
    const fehler = await bearbeiteMeldung(id.data, benutzerId, status.data, g.data);
    if (!fehler) await protokolliere({ benutzerId, aktion: 'chat.meldung_bearbeitet', zielTyp: 'chat_meldung', zielId: id.data });
    return ergebnis(fehler);
  });
}

export async function kanalPauseSetzen(_: KinderschutzZustand, fd: FormData): Promise<KinderschutzZustand> {
  const kanal = uuid.safeParse(fd.get('kanalId'));
  if (!kanal.success) return { fehler: 'eingabe' };
  const g = grund.safeParse(fd.get('grund'));
  if (!g.success) return { fehler: 'grundFehlt' };
  const pause = fd.get('pause') === '1';
  return mitRecht('meldung.chat.bearbeiten', async (benutzerId) =>
    ergebnis(await pausiereAlsKinderschutz(benutzerId, kanal.data, pause, g.data)),
  );
}

export async function nachrichtEntfernen(_: KinderschutzZustand, fd: FormData): Promise<KinderschutzZustand> {
  const id = z.coerce.number().int().positive().safeParse(fd.get('nachrichtId'));
  if (!id.success) return { fehler: 'eingabe' };
  const g = grund.safeParse(fd.get('grund'));
  if (!g.success) return { fehler: 'grundFehlt' };
  return mitRecht('meldung.chat.bearbeiten', async (benutzerId) => ergebnis(await entferneAlsKinderschutz(benutzerId, id.data, g.data)));
}

export type KontextErgebnis =
  | {
      ok: true;
      grund: string;
      freitext: string | null;
      kontext: { id: number; name: string; text: string; zeit: string; gemeldet: boolean }[];
    }
  | KinderschutzZustand;

/** S-11: Kontext einer Meldung auf ausdrücklichen Klick – jede Einsicht steht im Moderationsprotokoll. */
export async function meldungsKontextLaden(meldungId: string): Promise<KontextErgebnis> {
  const id = uuid.safeParse(meldungId);
  if (!id.success) return { fehler: 'eingabe' };
  return mitRecht('meldung.chat.lesen', async (benutzerId) => {
    const k = await meldungsKontext(id.data, benutzerId);
    return k ? { ok: true as const, ...k } : { fehler: 'nichtGefunden' as const };
  });
}
