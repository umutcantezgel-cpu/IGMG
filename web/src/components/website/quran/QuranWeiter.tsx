import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';

/**
 * Blättern am Ende der Surenseite (Muster ThemaWeiter): Links zur vorigen und nächsten Sure der Liste. Fehlt eine
 * Seite (erste oder letzte Sure), bleibt sie leer; fehlen beide, entfällt die Leiste. Server-Komponente.
 */
export async function QuranWeiter({ vorher, naechste }: { vorher: number | null; naechste: number | null }) {
  if (vorher === null && naechste === null) return null;
  const t = await getTranslations('quranSeite');
  const linkKlasse =
    'flex min-h-16 min-w-0 items-center gap-3 rounded-lg border border-linie bg-weiss px-4 py-3 text-18 font-bold text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte hover:shadow-s2 active:scale-98';
  return (
    <nav aria-label={t('blaettern')} className="grid gap-3 border-t border-linie pt-8 md:grid-cols-2">
      {vorher !== null ? (
        <Link href={{ pathname: '/quran/[sure]', params: { sure: String(vorher) } }} rel="prev" className={linkKlasse}>
          <ArrowLeft aria-hidden className="size-5 shrink-0 text-gruen-700" />
          <span>{t('navVorher')}</span>
        </Link>
      ) : null}
      {naechste !== null ? (
        <Link
          href={{ pathname: '/quran/[sure]', params: { sure: String(naechste) } }}
          rel="next"
          className={`${linkKlasse} justify-end text-end md:col-start-2`}
        >
          <span>{t('navNaechste')}</span>
          <ArrowRight aria-hidden className="size-5 shrink-0 text-gruen-700" />
        </Link>
      ) : null}
    </nav>
  );
}
