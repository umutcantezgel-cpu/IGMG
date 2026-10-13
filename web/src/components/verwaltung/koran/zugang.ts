import 'server-only';
import { redirect } from 'next/navigation';
import type { Aktion } from '@/lib/rechte/matrix';
import { darf, verlangeSitzung, type Angemeldet } from '@/lib/rechte/pruefe';

/** Leserechte des Moduls „Koran & Hadith“ (wie in module.ts): wer erfassen oder freigeben darf. */
export const KORAN_RECHTE = ['quran.bearbeiten', 'hadith.bearbeiten', 'religioes.freigeben'] as const satisfies readonly Aktion[];
export const QURAN_RECHTE = ['quran.bearbeiten', 'religioes.freigeben'] as const satisfies readonly Aktion[];
export const HADITH_RECHTE = ['hadith.bearbeiten', 'religioes.freigeben'] as const satisfies readonly Aktion[];

/** Für Seiten des Moduls: Sitzung, zweiter Faktor und eines der Rechte, sonst die Seite „Kein Zugriff“. */
export async function verlangeKoranZugang(rechte: readonly Aktion[] = KORAN_RECHTE): Promise<Angemeldet> {
  const a = await verlangeSitzung();
  if (!rechte.some((r) => darf(a.rollen, r))) redirect('/verwaltung/kein-zugriff');
  return a;
}
