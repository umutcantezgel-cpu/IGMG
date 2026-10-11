import { getTranslations } from 'next-intl/server';
import { FristenFormular } from '@/components/verwaltung/einstellungen/FristenFormular';
import { EINGANG_ARTEN } from '@/lib/eingaenge/arten';
import { ladeLoeschfristen } from '@/lib/eingaenge/fristen';
import { zaehleFaellige } from '@/lib/eingaenge/loeschlauf';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';

/** Verwaltung › Einstellungen (C16): Löschfristen je Eingangsart (M-050, G-07). */
export default async function Einstellungen() {
  await verlangeSeitenRecht('einstellung.bearbeiten');
  const [t, te, fristen, faellig] = await Promise.all([
    getTranslations('verwaltung.einstellungen'),
    getTranslations('verwaltung.eingaenge'),
    ladeLoeschfristen(),
    zaehleFaellige(),
  ]);
  return (
    <>
      <h1 className="text-display-2">{t('titel')}</h1>
      <section
        aria-labelledby="einstellungen-fristen"
        className="flex max-w-3xl flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6"
      >
        <h2 id="einstellungen-fristen" className="text-24">
          {t('fristenTitel')}
        </h2>
        <p className="text-tinte-2">{t('fristenText')}</p>
        <p className="text-16" role="status">
          {t('faellig', { anzahl: faellig })} {t('lauf')}
        </p>
        <FristenFormular
          arten={EINGANG_ARTEN.map((art) => ({ art, label: te(`art.${art}`) }))}
          startwerte={fristen}
          texte={{ tage: t('tage'), speichern: t('speichern'), gespeichert: t('gespeichert'), fehler: t('fehler') }}
        />
      </section>
    </>
  );
}
