import { revalidateTag } from 'next/cache';
import { START_TAGS, TAG } from '@/lib/cache/tags';
import { KURSE } from '@/lib/lernapp/kurse';
import { wartungErlaubt } from '@/lib/wartung/zugang';

/** Tags, die `?tag=` gezielt verfallen lassen darf: alle Start-Tags und je Lern-App-Kurs sein eigener Tag. */
const GEZIELT_ERLAUBT: ReadonlySet<string> = new Set<string>([...START_TAGS, ...KURSE.map(TAG.lernappKurs)]);

/**
 * Lässt alle Inhalts-Tags sofort verfallen (ADR 0017): Nach dem Start eines Images, das gegen die
 * Bau-Datenbank vorgerendert wurde, rendert die erste Anfrage je Seite aus der echten Datenbank neu.
 * Aufruf: beim Start durch `src/instrumentation.ts`, sonst manuell (BETRIEB.md).
 *
 * Gezielt (`?tag=<tag>`, mehrfach möglich): nur diese Tags, z. B. `lernapp-kurs-koran` nach einer Änderung direkt in der
 * Datenbank. Die anderen Caches bleiben warm – ein Verfallen von `lernapp` baut alle Kursverzeichnisse kalt neu (je
 * Richtung ≈ 10 s Rechenzeit). Unbekannte Tags → 400, nichts verfällt.
 */
export async function POST(anfrage: Request) {
  if (!wartungErlaubt(anfrage)) return new Response(null, { status: 401 });
  const gezielt = new URL(anfrage.url).searchParams.getAll('tag');
  if (gezielt.some((tag) => !GEZIELT_ERLAUBT.has(tag)))
    return Response.json({ fehler: 'unbekannter_tag' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  const tags = gezielt.length ? [...new Set(gezielt)] : START_TAGS;
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ erneuert: tags.length }, { headers: { 'Cache-Control': 'no-store' } });
}
