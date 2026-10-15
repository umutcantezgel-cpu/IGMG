import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import type { ThemaAnzeige } from './typen';

/**
 * Ruhige Leiste unten auf der Themenseite: Links zum vorigen und nächsten Thema der Übersicht (Reihenfolge der Themen).
 * Fehlt eine Seite (erstes oder letztes Thema), bleibt sie leer. Über dem Namen steht klein „Vorheriges/Nächstes Thema“.
 * Server-Komponente.
 */
export async function ThemaWeiter({ vorher, naechster }: { vorher: ThemaAnzeige | null; naechster: ThemaAnzeige | null }) {
  if (!vorher && !naechster) return null;
  const t = await getTranslations('wissenThema');
  const linkKlasse =
    'flex min-h-16 min-w-0 items-center gap-3 rounded-lg border border-linie bg-weiss px-4 py-3 text-18 font-bold text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte hover:shadow-s2 druck';
  return (
    <nav aria-label={t('weitereThemen')} className="grid gap-3 border-t border-linie pt-8 md:grid-cols-2">
      {vorher ? (
        <Link href={{ pathname: '/islamisches-wissen/[thema]', params: { thema: vorher.schluessel } }} rel="prev" className={linkKlasse}>
          <ArrowLeft aria-hidden className="size-5 shrink-0 text-gruen-700" />
          <span className="flex min-w-0 flex-col">
            <span className="text-16 font-normal text-tinte-2">{t('vorher')}</span>
            <span lang={vorher.label.lang} className="break-words">
              {vorher.label.text}
            </span>
          </span>
        </Link>
      ) : null}
      {naechster ? (
        <Link
          href={{ pathname: '/islamisches-wissen/[thema]', params: { thema: naechster.schluessel } }}
          rel="next"
          className={`${linkKlasse} justify-end text-right md:col-start-2`}
        >
          <span className="flex min-w-0 flex-col">
            <span className="text-16 font-normal text-tinte-2">{t('naechster')}</span>
            <span lang={naechster.label.lang} className="break-words">
              {naechster.label.text}
            </span>
          </span>
          <ArrowRight aria-hidden className="size-5 shrink-0 text-gruen-700" />
        </Link>
      ) : null}
    </nav>
  );
}
