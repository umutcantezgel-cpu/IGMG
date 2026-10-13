import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { RezitationsFormular } from '@/components/verwaltung/rezitationen/RezitationsFormular';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { NEUE_REZITATION } from '@/lib/validierung/rezitation';
import { rezitationAnlegen } from '@/server/actions/rezitationen';

/** Verwaltung › Neue Rezitation (O-Q02): Angaben anlegen; Vereinbarung, Freigabe und Aufnahmen folgen auf der Detailseite. */
export default async function NeueRezitation() {
  await verlangeSeitenRecht('rezitation.bearbeiten');
  const [t, tg] = await Promise.all([getTranslations('verwaltung.rezitationen'), getTranslations('verwaltung.shell')]);
  return (
    <div className="flex flex-col gap-8">
      <NextLink
        href="/verwaltung/rezitationen"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('neu')} kennung={tg('gruppe.inhalte')} einleitung={t('neuEinleitung')} />
      <div className="max-w-text rounded-lg border border-linie bg-weiss p-4 shadow-s1 md:p-6">
        <RezitationsFormular aktion={rezitationAnlegen} startwerte={NEUE_REZITATION} modus="neu" />
      </div>
    </div>
  );
}
