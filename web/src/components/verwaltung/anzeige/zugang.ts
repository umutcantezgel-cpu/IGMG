import 'server-only';
import { redirect } from 'next/navigation';
import { darf, verlangeSitzung, type Angemeldet } from '@/lib/rechte/pruefe';

/**
 * Zugang zum Modul „Anzeige“ (wie in module.ts): Folien pflegt, wer `anzeige.bearbeiten` hat (Redaktion,
 * Administration); Vers- und Hadith-Folien prüft, wer `religioes.freigeben` hat (religiöse Prüfung). Ohne beides:
 * Seite „Kein Zugriff“.
 */
export async function verlangeAnzeigeZugang(): Promise<{ a: Angemeldet; bearbeiten: boolean; pruefen: boolean }> {
  const a = await verlangeSitzung();
  const bearbeiten = darf(a.rollen, 'anzeige.bearbeiten');
  const pruefen = darf(a.rollen, 'religioes.freigeben');
  if (!bearbeiten && !pruefen) redirect('/verwaltung/kein-zugriff');
  return { a, bearbeiten, pruefen };
}
