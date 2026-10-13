import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { GruppenFormular } from '@/components/verwaltung/lernen/GruppenFormular';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { funktionAn } from '@/lib/funktionen';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { gruppeFormularWerte } from '@/lib/validierung/lernen';
import { speichereGruppe } from '@/server/actions/gruppen';
import { ladeKursAuswahl } from '@/server/queries/verwaltung/gruppen';

/** Verwaltung › Neue Gruppe (H-L01). Leitung, Mitglieder und Termine folgen auf der Seite der Gruppe. */
export default async function NeueGruppe() {
  await verlangeSeitenRecht('gruppe.bearbeiten');
  if (!(await funktionAn('lernplattform'))) notFound();
  const [t, tg, kurse] = await Promise.all([getTranslations('verwaltung.gruppen'), getTranslations('verwaltung.shell'), ladeKursAuswahl()]);
  return (
    <>
      <NextLink
        href="/verwaltung/gruppen"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('neu')} kennung={tg('gruppe.inhalte')} einleitung={t('neuEinleitung')} />
      <GruppenFormular aktion={speichereGruppe} startwerte={gruppeFormularWerte()} kurse={kurse} modus="neu" />
    </>
  );
}
