import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { EinstellungFormular } from '@/components/verwaltung/anzeige/EinstellungFormular';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { anzeigeEinstellungWerte, IQAMA_GEBETE } from '@/lib/anzeige/einstellung';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { speichereAnzeigeEinstellung } from '@/server/actions/anzeige';
import { ladeAnzeigeEinstellungVerwaltung } from '@/server/queries/verwaltung/anzeige';

/** Verwaltung › Anzeige › Einstellungen (AUFTRAG 3.10, MN-14): Iqama, Ruhe im Gebetsfenster, Freitagsmodus. */
export default async function AnzeigeEinstellungen() {
  await verlangeSeitenRecht('anzeige.bearbeiten');
  const [t, tg, tz, einstellung] = await Promise.all([
    getTranslations('verwaltung.anzeige'),
    getTranslations('verwaltung.shell'),
    getTranslations('anzeige'),
    ladeAnzeigeEinstellungVerwaltung(),
  ]);
  const gebete = Object.fromEntries(IQAMA_GEBETE.map((g) => [g, tz(`namen.${g}`)]));
  return (
    <>
      <NextLink
        href="/verwaltung/anzeige"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('einstellung.titel')} kennung={tg('gruppe.inhalte')} einleitung={t('einstellung.einleitung')} />
      <EinstellungFormular aktion={speichereAnzeigeEinstellung} startwerte={anzeigeEinstellungWerte(einstellung)} gebete={gebete} />
    </>
  );
}
