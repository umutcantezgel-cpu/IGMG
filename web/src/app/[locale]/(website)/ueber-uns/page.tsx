import { Clock, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Text } from '@/components/website/Text';
import { Aufruf } from '@/components/website/ueber-uns/Aufruf';
import { Bildflaeche } from '@/components/website/ueber-uns/Bildflaeche';
import { Werte } from '@/components/website/ueber-uns/Werte';
import { Zeitleiste } from '@/components/website/ueber-uns/Zeitleiste';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ueberUns');
  return metadatenFuer({ pfad: '/ueber-uns', titel: t('titel'), beschreibung: t('untertitel') });
}

/**
 * Über uns (design/AboutUs.dc.html, Blatt S08): Geschichte, Zeitleiste, Gebet und Gemeinschaft, Werte und Aufruf.
 * Redaktionelle Texte kommen aus dem Seiteninhalt „ueber-uns“, feste Überschriften und Schaltflächen aus messages.
 */
export default async function UeberUnsSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('ueberUns');
  const tp = await getTranslations('kopf');
  const inhalt = await ladeSeiteninhalt('ueber-uns');
  const zeitleiste = [...inhalt.zeitleiste].sort((a, b) => a.reihenfolge - b.reihenfolge);
  const werte = [...inhalt.werte].sort((a, b) => a.reihenfolge - b.reihenfolge);
  const aufrufTitel = t('aufrufTitel');
  return (
    <Seitenrahmen bereich="moschee" seite="ueber-uns" sprachZiel="/ueber-uns" pfad={[{ label: tp('ueberUns') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-12 px-4 pt-8 pb-12 md:gap-20 md:px-8 md:pt-16 md:pb-24">
        <section aria-labelledby="ueber-geschichte" className="flex flex-wrap items-start gap-8">
          <div className="flex min-w-0 flex-[3_1_520px] flex-col gap-4">
            <h2 id="ueber-geschichte" className="flex items-center gap-3 text-30 md:text-36">
              <Clock aria-hidden className="size-7 shrink-0 text-gruen-700" />
              {t('geschichteTitel')}
            </h2>
            <div className="flex max-w-(--container-text) flex-col gap-4 text-pretty">
              {inhalt.geschichte.absaetze.map((a, i) => (
                <Text key={i} feld={a.absatz} sprache={sprache} als="p" className="text-18" />
              ))}
            </div>
          </div>
          <Bildflaeche beschriftung={t('bildHistorie')} className="h-60 flex-[2_1_320px] rounded-lg md:h-95" />
        </section>

        <section aria-labelledby="ueber-reise" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 id="ueber-reise" className="text-30 md:text-36">
              {t('reiseTitel')}
            </h2>
            <p className="text-20 text-tinte-2">{t('reiseUntertitel')}</p>
          </div>
          <Zeitleiste eintraege={zeitleiste} sprache={sprache} />
        </section>

        <section aria-labelledby="ueber-gemeinschaft" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-6 md:p-12">
          <h2 id="ueber-gemeinschaft" className="flex items-center gap-3 text-30 md:text-36">
            <Users aria-hidden className="size-7 shrink-0 text-gruen-700" />
            {t('gemeinschaftTitel')}
          </h2>
          <div className="flex max-w-(--container-text) flex-col gap-4 text-pretty">
            {inhalt.gemeinschaft.absaetze.map((a, i) => (
              <Text key={i} feld={a.absatz} sprache={sprache} als="p" className="text-18" />
            ))}
          </div>
        </section>

        <section aria-labelledby="ueber-werte" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 id="ueber-werte" className="text-30 md:text-36">
              {t('wertTitel')}
            </h2>
            <p className="text-20 text-tinte-2">{t('wertUntertitel')}</p>
          </div>
          <Werte eintraege={werte} sprache={sprache} />
        </section>

        <Aufruf
          titel={aufrufTitel}
          text={t('aufrufText')}
          kontakt={{ text: t('aufrufKontakt'), label: t('linkKontext', { sichtbar: t('aufrufKontakt'), titel: aufrufTitel }) }}
          mehr={{ text: t('aufrufMehr'), label: t('linkKontext', { sichtbar: t('aufrufMehr'), titel: aufrufTitel }) }}
        />
      </div>
    </Seitenrahmen>
  );
}
