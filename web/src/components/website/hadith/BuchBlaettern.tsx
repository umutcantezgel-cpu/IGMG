import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import type { HadithBuchKurz } from '@/server/queries/hadith';

const LINK =
  'flex min-h-16 min-w-0 items-center gap-3 rounded-lg border border-linie bg-weiss px-4 py-3 text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte hover:shadow-s2 druck';

/**
 * Blättern zwischen den Büchern (Muster QuranWeiter): voriges und nächstes Buch mit Nummer und Titel der Quelle.
 * Fehlt eine Seite (Buch 1, letztes Buch), bleibt die Spalte leer. Server-Komponente.
 */
export async function BuchBlaettern({
  vorher,
  naechstes,
  spalte = false,
}: {
  vorher: HadithBuchKurz | null;
  naechstes: HadithBuchKurz | null;
  /** In der Begleitspalte untereinander statt nebeneinander */
  spalte?: boolean;
}) {
  if (!vorher && !naechstes) return null;
  const t = await getTranslations('hadith');
  const ziel = (b: HadithBuchKurz) => ({ pathname: '/hadith/bukhari/[buch]' as const, params: { buch: String(b.nr) } });
  const inhalt = (b: HadithBuchKurz, richtung: string) => (
    <span className="flex min-w-0 flex-col">
      <span className="text-16 text-tinte-2">
        {richtung} · {t('bukhari.buch', { nr: b.nr })}
      </span>
      <span lang="en" className="font-bold break-words">
        {b.titelEn}
      </span>
    </span>
  );
  return (
    <nav aria-label={t('buch.blaettern')} className={spalte ? 'grid gap-3 md:grid-cols-2 lg:grid-cols-1' : 'grid gap-3 md:grid-cols-2'}>
      {vorher ? (
        <Link href={ziel(vorher)} rel="prev" className={LINK}>
          <ArrowLeft aria-hidden className="size-5 shrink-0 text-gruen-700" />
          {inhalt(vorher, t('buch.vorher'))}
        </Link>
      ) : null}
      {naechstes ? (
        <Link href={ziel(naechstes)} rel="next" className={`${LINK} justify-end text-end md:col-start-2 ${spalte ? 'lg:col-start-1' : ''}`}>
          {inhalt(naechstes, t('buch.naechstes'))}
          <ArrowRight aria-hidden className="size-5 shrink-0 text-gruen-700" />
        </Link>
      ) : null}
    </nav>
  );
}
