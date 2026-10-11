import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';

export type SurenKachel = { nr: number; name: string; arabisch: boolean; verseAnzahl: number | null };

/**
 * Surenliste der Übersicht als Raster (K-005 `raster-kacheln`). Jede Karte ist ein einziger Link: Nummer, Name und –
 * nur mit importierter Quelle – die Verszahl. Hover und Fokus nach REFERENZ §2, aktiv `active:scale-98`.
 * Server-Komponente.
 */
export async function SurenKacheln({ liste }: { liste: SurenKachel[] }) {
  const t = await getTranslations('quranSeite');
  return (
    <ul className="grid raster-kacheln gap-3 md:gap-4">
      {liste.map((e) => (
        <li key={e.nr}>
          <Link
            href={{ pathname: '/quran/[sure]', params: { sure: String(e.nr) } }}
            className="group flex h-full min-h-16 items-center gap-4 rounded-lg border border-linie bg-weiss p-4 text-tinte no-underline shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:text-tinte hover:shadow-s2 active:scale-98"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-sand text-16 font-bold text-tinte-2 transition duration-(--dauer-rueckmeldung) group-hover:bg-gruen-700 group-hover:text-weiss">
              {e.nr}
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span lang={e.arabisch ? 'ar' : undefined} className="leading-snug font-bold break-words">
                {e.name}
              </span>
              {e.verseAnzahl !== null ? (
                <span className="text-16 text-tinte-2">{t('versAnzahl', { anzahl: String(e.verseAnzahl) })}</span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
