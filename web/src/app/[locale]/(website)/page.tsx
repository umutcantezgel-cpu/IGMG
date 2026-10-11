import { ArrowRight, Calendar, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Bildplatzhalter } from '@/components/website/Bildplatzhalter';
import { EventCard } from '@/components/website/EventCard';
import { JsonLd } from '@/components/website/JsonLd';
import { NewsCard } from '@/components/website/NewsCard';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { moschee } from '@/lib/seo/jsonld';
import { adresse, metadatenFuer } from '@/lib/seo/metadaten';
import { ladeNachrichten } from '@/server/queries/nachrichten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';
import { ladeVeranstaltungen } from '@/server/queries/veranstaltungen';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const [t, tm] = await Promise.all([getTranslations('start'), getTranslations('meta')]);
  const meta = await metadatenFuer({ pfad: '/', titel: null, beschreibung: t('metaBeschreibung') });
  // Ohne eigenen Titel setzt die Startseite den Namen selbst: openGraph ersetzt das Layout-Objekt vollständig (Next.js)
  return { ...meta, openGraph: { ...meta.openGraph, title: tm('titel') } };
}

const sekundaer =
  'inline-flex min-h-12 items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-[22px] font-bold text-gruen-800 no-underline transition-colors hover:bg-gruen-50 hover:text-gruen-800';

/** Startseite (design/Home.dc.html, Blatt S01): Hero, kommende Veranstaltungen (6), Neuigkeiten (1 + 3). */
export default async function Startseite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('start');
  const veranstaltungen = (await ladeVeranstaltungen()).filter((v) => !v.vergangen).slice(0, 6);
  const nachrichten = await ladeNachrichten();
  const aufmacher = nachrichten.find((n) => n.empfohlen) ?? nachrichten[0];
  const weitere = nachrichten.filter((n) => n !== aufmacher).slice(0, 3);
  const kontakt = await ladeSeiteninhalt('kontakt');
  return (
    <Seitenrahmen bereich="startseite" seite="startseite" sprachZiel="/">
      <JsonLd daten={moschee({ url: adresse('/', 'de'), kontakt })} />
      <section aria-labelledby="hero-titel" className="border-b border-linie bg-papier">
        <div className="mx-auto grid max-w-(--container-inhalt) grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-8 px-4 py-10 md:gap-16 md:px-8 md:py-[72px]">
          <div className="flex flex-col gap-5">
            <span className="inline-flex items-center gap-2 self-start rounded-pill bg-gruen-50 px-3.5 py-1 text-16 font-bold text-gruen-800">
              <Users aria-hidden className="size-4" />
              {t('willkommen')}
            </span>
            <h1 id="hero-titel" className="text-36 leading-[1.15] text-gruen-800 md:text-48">
              {t('titel')}
            </h1>
            <p className="max-w-[56ch] text-20 leading-[1.55] text-pretty text-tinte-2">{t('untertitel')}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/mitglied-werden"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition-colors hover:bg-gruen-800 hover:text-weiss"
              >
                <span>{t('beitreten')}</span>
                <ArrowRight aria-hidden className="size-5" />
              </Link>
              <Link href="/ueber-uns" className={sekundaer}>
                <Users aria-hidden className="size-5" />
                <span>{t('mehrErfahren')}</span>
              </Link>
            </div>
          </div>
          <Bildplatzhalter beschriftung={t('fotoMoschee')} className="h-[clamp(220px,24vw,320px)] rounded-lg border border-linie" />
        </div>
      </section>

      <section aria-labelledby="veranstaltungen-titel" className="border-b border-linie bg-sand">
        <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-12 md:px-8 md:py-[88px]">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="flex max-w-[760px] flex-col gap-3">
              <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
                <Calendar aria-hidden className="size-4" />
                {t('kommend')}
              </span>
              <h2 id="veranstaltungen-titel" className="text-30 leading-tight md:text-36">
                {t('veranstaltungenTitel')}
              </h2>
              <p className="text-20 leading-[1.55] text-pretty text-tinte-2">{t('veranstaltungenText')}</p>
            </div>
            <Link href="/veranstaltungen" className={sekundaer}>
              <span>{t('alleVeranstaltungen')}</span>
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </div>
          {veranstaltungen.length > 0 ? (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-6">
              {veranstaltungen.map((v) => (
                <li key={v.id}>
                  <EventCard v={v} sprache={sprache} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-20 text-tinte-2">{t('keineVeranstaltungen')}</p>
          )}
        </div>
      </section>

      <section aria-labelledby="neuigkeiten-titel" className="bg-papier">
        <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-12 md:px-8 md:py-[88px]">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="flex max-w-[760px] flex-col gap-3">
              <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
                <span aria-hidden className="size-2 rounded-pill bg-gruen-700" />
                {t('neuigkeitenKennung')}
              </span>
              <h2 id="neuigkeiten-titel" className="text-30 leading-tight md:text-36">
                {t('neuigkeitenTitel')}
              </h2>
              <p className="text-20 leading-[1.55] text-pretty text-tinte-2">{t('neuigkeitenText')}</p>
            </div>
            <Link href="/nachrichten" className={sekundaer}>
              <span>{t('alleNeuigkeiten')}</span>
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </div>
          {aufmacher ? (
            <div className="flex flex-wrap items-stretch gap-6">
              <div className="min-w-0 flex-[2_1_560px]">
                <NewsCard n={aufmacher} sprache={sprache} variante="gross" bild={aufmacher.bild} />
              </div>
              <ul className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
                {weitere.map((n) => (
                  <li key={n.id}>
                    <NewsCard n={n} sprache={sprache} variante="kompakt" bild={n.bild} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </Seitenrahmen>
  );
}
