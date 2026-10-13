'use server';

import { z } from 'zod';
import { aendereTermin, erfasseAnwesenheit, KeinGruppenRecht, meldeFehlen, setzeFortschritt, trageHifzEin } from '@/lib/lernen/dienst';
import { funktionAn } from '@/lib/funktionen';
import { ladeGruppenKontext, verlangeKontoRecht } from '@/lib/rechte/gemeinde';

/**
 * Server Actions der Lernplattform (AUFTRAG 3.5): Konto zuerst (Lehrkraft mit TOTP über `verlangeKontoRecht`), dann
 * Eingabe prüfen; das Gruppenrecht prüft der Dienst selbst (`KeinGruppenRecht` → { ok: false }).
 */
const uuid = z.string().uuid();
const status = z.enum(['anwesend', 'fehlt', 'entschuldigt', 'verspaetet']);

async function kontext() {
  if (!(await funktionAn('lernplattform'))) throw new KeinGruppenRecht();
  const konto = await verlangeKontoRecht();
  return ladeGruppenKontext(konto.benutzerId);
}

async function sicher<T>(f: () => Promise<T>): Promise<{ ok: true; wert: T } | { ok: false }> {
  try {
    return { ok: true, wert: await f() };
  } catch (e) {
    if (e instanceof KeinGruppenRecht || (e instanceof Error && e.message === 'KEIN_RECHT')) return { ok: false };
    throw e;
  }
}

const anwesenheitEingabe = z.object({
  terminId: uuid,
  eintraege: z.array(z.object({ lernendeId: uuid, status, notiz: z.string().max(500).optional() })).max(100),
});

export async function speichereAnwesenheit(eingabe: z.input<typeof anwesenheitEingabe>) {
  const p = anwesenheitEingabe.safeParse(eingabe);
  if (!p.success) return { ok: false as const };
  return sicher(async () => erfasseAnwesenheit(p.data.terminId, p.data.eintraege, await kontext()));
}

export async function setzeTerminAusfall(terminId: string, ausgefallen: boolean) {
  if (!uuid.safeParse(terminId).success) return { ok: false as const };
  return sicher(async () => aendereTermin(terminId, await kontext(), { ausgefallen }));
}

const fortschrittEingabe = z.object({
  gruppeId: uuid,
  lernendeId: uuid,
  stufeId: uuid,
  status: z.enum(['begonnen', 'sicher', 'abgeschlossen']).nullable(),
});

export async function speichereFortschritt(eingabe: z.input<typeof fortschrittEingabe>) {
  const p = fortschrittEingabe.safeParse(eingabe);
  if (!p.success) return { ok: false as const };
  return sicher(async () => setzeFortschritt(p.data.gruppeId, p.data.lernendeId, p.data.stufeId, p.data.status, await kontext()));
}

const hifzEingabe = z.object({
  gruppeId: uuid,
  lernendeId: uuid,
  sure: z.number().int().min(1).max(114),
  vonVers: z.number().int().min(1).max(286),
  bisVers: z.number().int().min(1).max(286),
  bewertung: z.number().int().min(1).max(5).nullable(),
});

export async function speichereHifz(eingabe: z.input<typeof hifzEingabe>) {
  const p = hifzEingabe.safeParse(eingabe);
  if (!p.success) return { ok: false as const };
  const { gruppeId, ...rest } = p.data;
  return sicher(async () => trageHifzEin(gruppeId, rest, await kontext()));
}

const fehlEingabe = z.object({
  lernendeId: uuid,
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  grund: z.enum(['krank', 'familie', 'schule', 'sonstiges']),
});

export async function meldeKindFehlend(eingabe: z.input<typeof fehlEingabe>) {
  const p = fehlEingabe.safeParse(eingabe);
  if (!p.success) return { ok: false as const };
  return sicher(async () => meldeFehlen(p.data.lernendeId, p.data.datum, p.data.grund, await kontext()));
}
