import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { HatimFormular } from '@/components/verwaltung/hatim/HatimFormular';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { heuteBerlin } from '@/lib/zeit/heute';
import { legeHatimAnAktion } from '@/server/actions/hatim';

/** Verwaltung › Neue Hatim: Entwurf mit 30 freien Cüz; Beginn heute vorbelegt. */
export default async function NeueHatim() {
  await verlangeSeitenRecht('hatim.bearbeiten');
  const [t, tg, heute] = await Promise.all([getTranslations('verwaltung.hatim'), getTranslations('verwaltung.shell'), heuteBerlin()]);
  return (
    <>
      <NextLink
        href="/verwaltung/hatim"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('neuTitel')} kennung={tg('gruppe.inhalte')} />
      <HatimFormular aktion={legeHatimAnAktion} startwerte={{ beginn: heute.datum }} modus="neu" />
    </>
  );
}
