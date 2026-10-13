import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { EinladungFormular } from '@/components/verwaltung/lernen/EinladungFormular';
import { karte } from '@/components/verwaltung/lernen/stil';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { gemeindeEinladen } from '@/server/actions/gemeinde-konten';
import { ladeLernendeFuerEinladung } from '@/server/queries/verwaltung/lernende';

/** Verwaltung › Gemeinde-Konten › Einladen (H-L05): Lehrkraft, Schüler ab 16, Eltern – bestehendes Einladungssystem. */
export default async function GemeindeEinladen() {
  const a = await verlangeSeitenRecht('gemeindekonto.bearbeiten');
  if (!(await funktionAn('konten'))) notFound();
  const lernendeSehen = darf(a.rollen, 'lernende.lesen') && (await funktionAn('lernplattform'));
  const [t, tg, lernende] = await Promise.all([
    getTranslations('verwaltung.gemeindeKonten'),
    getTranslations('verwaltung.shell'),
    lernendeSehen ? ladeLernendeFuerEinladung(berlinerDatum(new Date())) : Promise.resolve([]),
  ]);
  return (
    <>
      <NextLink
        href="/verwaltung/gemeinde-konten"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('einladen.titel')} kennung={tg('gruppe.betrieb')} einleitung={t('einladen.einleitung')} />
      <section aria-label={t('einladen.titel')} className={`${karte} max-w-4xl`}>
        <EinladungFormular aktion={gemeindeEinladen} lernende={lernende} />
      </section>
    </>
  );
}
