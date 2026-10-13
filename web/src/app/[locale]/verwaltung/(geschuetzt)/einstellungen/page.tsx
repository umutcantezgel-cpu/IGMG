import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { FristenFormular } from '@/components/verwaltung/einstellungen/FristenFormular';
import { SpendenFormular } from '@/components/verwaltung/einstellungen/SpendenFormular';
import { EINGANG_ARTEN } from '@/lib/eingaenge/arten';
import { ladeLoeschfristen } from '@/lib/eingaenge/fristen';
import { zaehleFaellige } from '@/lib/eingaenge/loeschlauf';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { spendenAnsicht } from '@/lib/spenden/ansicht';
import { spendenFormularWerte } from '@/lib/validierung/spenden';
import { ladeEinstellung } from '@/server/queries/einstellungen';

/** Verwaltung › Einstellungen (C16): Löschfristen je Eingangsart (M-050, G-07); Spenden (MN-13, Kür A). */
export default async function Einstellungen() {
  await verlangeSeitenRecht('einstellung.bearbeiten');
  const [t, te, fristen, faellig, ts, spenden] = await Promise.all([
    getTranslations('verwaltung.einstellungen'),
    getTranslations('verwaltung.eingaenge'),
    ladeLoeschfristen(),
    zaehleFaellige(),
    getTranslations('verwaltung.spenden'),
    ladeEinstellung('spenden'),
  ]);
  const tg = await getTranslations('verwaltung.shell');
  return (
    <>
      <VerwaltungsKopf titel={t('titel')} kennung={tg('gruppe.betrieb')} />
      <section
        aria-labelledby="einstellungen-fristen"
        className="flex max-w-einleitung flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6"
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
      <section
        aria-labelledby="einstellungen-spenden"
        className="flex max-w-einleitung flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6"
      >
        <h2 id="einstellungen-spenden" className="text-24">
          {ts('titel')}
        </h2>
        <p className="text-tinte-2">{ts('text')}</p>
        <p className="text-16 font-bold" role="status">
          {spendenAnsicht(spenden, '-') ? ts('stand.gueltig') : ts('stand.leer')}
        </p>
        <SpendenFormular startwerte={spendenFormularWerte(spenden)} />
      </section>
    </>
  );
}
