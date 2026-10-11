import { getTranslations } from 'next-intl/server';
import { Abschnitt } from './Abschnitt';

/** Karten (V14): Standardkarte mit Schatten s1 (s2 beim Darüberfahren) und eine Karte mit Tönung. */
export async function Karten() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <Abschnitt id="karten" titel={t('karten.titel')} einleitung={t('karten.einleitung')}>
      <div className="grid gap-6 md:grid-cols-2">
        <article className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6 shadow-s1 transition-shadow hover:shadow-s2">
          <h3 className="text-24">{t('karten.beispielTitel')}</h3>
          <p className="text-18">{t('karten.beispielText')}</p>
          <p className="text-16 font-bold text-tinte-2">{t('karten.beispielAngabe')}</p>
          <a href="#karten" className="inline-flex min-h-12 items-center self-start font-bold">
            {t('karten.beispielLink')}
          </a>
        </article>
        <article className="flex flex-col gap-3 rounded-lg border border-gruen-700 bg-gruen-50 p-6 shadow-s1">
          <h3 className="text-24 text-gruen-950">{t('karten.toenungTitel')}</h3>
          <p className="text-18">{t('karten.toenungText')}</p>
        </article>
      </div>
    </Abschnitt>
  );
}
