import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { editorOptionen, NEUE_SEITE } from '@/components/verwaltung/seiten/optionen';
import { SeitenFormular } from '@/components/verwaltung/seiten/SeitenFormular';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { neuerBlock } from '@/lib/validierung/bloecke';
import { organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { speichereSeite } from '@/server/actions/seiten';

/** Verwaltung › Neue Seite (ADR 0032): beginnt mit einem leeren Text-Baustein. */
export default async function NeueSeite() {
  const a = await verlangeSeitenRecht('seite.lesen');
  const filter = organisationsFilter(a.rollen, 'seite.bearbeiten');
  if (filter !== null && filter.length === 0) redirect('/verwaltung/kein-zugriff');
  const [t, tg, optionen] = await Promise.all([
    getTranslations('verwaltung.seiten'),
    getTranslations('verwaltung.shell'),
    editorOptionen(a, undefined),
  ]);
  const startwerte = { ...NEUE_SEITE, organisation: optionen.organisationen[0]?.wert ?? '' };
  return (
    <>
      <NextLink
        href="/verwaltung/seiten"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('neu')} kennung={tg('gruppe.inhalte')} einleitung={t('neuEinleitung')} />
      <SeitenFormular aktion={speichereSeite} startwerte={startwerte} startBloecke={[neuerBlock('text')]} modus="neu" optionen={optionen} />
    </>
  );
}
