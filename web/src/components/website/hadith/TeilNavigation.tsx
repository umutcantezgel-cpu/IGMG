import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { buchTeilZiel, teilBereich } from '@/lib/hadith/anzeige';

const LINK =
  'flex min-h-12 min-w-0 flex-col justify-center rounded-md border border-linie bg-weiss px-3 py-2 text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte';
const AKTUELL = 'flex min-h-12 min-w-0 flex-col justify-center rounded-md border border-gruen-700 bg-gruen-50 px-3 py-2 text-tinte';

/**
 * Teile eines langen Buchs (je bis zu 100 Hadithe): ein Link je Teil mit dem Bereich der Positionen, der aktuelle Teil
 * mit `aria-current`. Nur bei mehr als einem Teil. Server-Komponente, ohne JavaScript im Browser.
 */
export async function TeilNavigation({ buchNr, teil, teile, anzahl }: { buchNr: number; teil: number; teile: number; anzahl: number }) {
  if (teile < 2) return null;
  const t = await getTranslations('hadith.buch');
  return (
    <nav aria-label={t('teile')} className="flex flex-col gap-3">
      <h2 className="font-text text-18 leading-snug font-bold tracking-normal">{t('teile')}</h2>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
        {Array.from({ length: teile }, (_, i) => {
          const n = i + 1;
          const bereich = teilBereich(n, anzahl);
          const inhalt = (
            <>
              <span className="font-bold">{t('teil', { teil: n })}</span>
              <span className="text-16 text-tinte-2 tabular-nums">{t('teilBereich', bereich)}</span>
            </>
          );
          return (
            <li key={n} className="flex">
              {n === teil ? (
                <span aria-current="page" className={`${AKTUELL} w-full`}>
                  {inhalt}
                </span>
              ) : (
                <Link href={buchTeilZiel(buchNr, n)} className={`${LINK} w-full`}>
                  {inhalt}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
