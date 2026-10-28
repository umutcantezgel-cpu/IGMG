import { ArrowLeft, ExternalLink } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { Meldung } from '@/components/verwaltung/Meldung';
import { istVerwaltungBereich, type VerwaltungBereich } from '@/components/verwaltung/seiteninhalte/bereiche';
import { SeiteninhaltFormular } from '@/components/verwaltung/seiteninhalte/Formular';
import { pfadFuer } from '@/i18n/navigation';
import type { Pfad } from '@/i18n/routing';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { speichereSeiteninhalt } from '@/server/actions/seiteninhalte';
import { ladeSeiteninhaltFuerVerwaltung } from '@/server/queries/verwaltung/seiteninhalte';

const pille = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';

/** Öffentliche Seite je Bereich (Deutsch; Pfade aus src/i18n/routing.ts). */
const OEFFENTLICH: Record<VerwaltungBereich, Pfad> = {
  'ueber-uns': '/ueber-uns',
  vorstand: '/vorstand',
  projekte: '/projekte',
  igmg: '/igmg',
  impressum: '/impressum',
  datenschutz: '/datenschutz',
  // Aus dem Dachverband: Startseite (dazu /nachrichten, /islamisches-wissen und die Organisationsseiten)
  dachverband: '/',
};

/**
 * Verwaltung › Seiteninhalte › Bereich (V05). Lesen mit `seiteninhalt.lesen`; ohne `seiteninhalt.bearbeiten` nur
 * ansehen. Andere Bereiche (Kontakt, Organisationen) sind hier nicht vorgesehen: nicht gefunden.
 */
export default async function SeiteninhaltBereich({ params }: PageProps<'/[locale]/verwaltung/seiteninhalte/[bereich]'>) {
  const a = await verlangeSeitenRecht('seiteninhalt.lesen');
  const { bereich } = await params;
  if (!istVerwaltungBereich(bereich)) notFound();
  const [t, stand] = await Promise.all([getTranslations('verwaltung.seiteninhalte'), ladeSeiteninhaltFuerVerwaltung(bereich)]);
  const nurLesen = !darf(a.rollen, 'seiteninhalt.bearbeiten');
  const zuletzt = stand.aktualisiertAm ? `${datumLang(stand.aktualisiertAm, 'de')}, ${uhrzeit(stand.aktualisiertAm, 'de')}` : null;
  const tg = await getTranslations('verwaltung.shell');
  return (
    <>
      <NextLink
        href="/verwaltung/seiteninhalte"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueckUebersicht')}
      </NextLink>
      <VerwaltungsKopf
        titel={t(`bereich.${bereich}`)}
        kennung={tg('gruppe.inhalte')}
        aktion={
          <NextLink
            href={pfadFuer(OEFFENTLICH[bereich], 'de')}
            prefetch={false}
            className="inline-flex min-h-12 items-center gap-2 font-bold underline underline-offset-4"
          >
            {t('oeffentlichAnsehen')}
            <ExternalLink aria-hidden className="size-4" />
          </NextLink>
        }
      />
      <p className="flex flex-wrap items-center gap-2 text-16 text-tinte-2">
        <span className={cn(pille, stand.istBeispiel ? 'bg-warnung-toenung text-warnung' : 'bg-gruen-50 text-gruen-800')}>
          {stand.istBeispiel ? t('zustand.beispiel') : t('zustand.gepflegt')}
        </span>
        <span>{zuletzt ? t('zuletzt', { datum: zuletzt }) : t('nochKeinStand')}</span>
      </p>
      {stand.unlesbar ? <Meldung art="info">{t('unlesbar')}</Meldung> : null}
      <SeiteninhaltFormular stand={stand} nurLesen={nurLesen} aktion={speichereSeiteninhalt} />
    </>
  );
}
