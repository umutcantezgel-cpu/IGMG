import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { EventCard } from '@/components/website/EventCard';
import { Stern8 } from '@/components/website/Icons';
import { JsonLd } from '@/components/website/JsonLd';
import { NewsCard } from '@/components/website/NewsCard';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Tagesbogen } from '@/components/website/start/Tagesbogen';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { moschee } from '@/lib/seo/jsonld';
import { adresse, metadatenFuer } from '@/lib/seo/metadaten';
import { cn } from '@/lib/utils';
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
  'inline-flex min-h-12 items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) active:scale-98 hover:bg-gruen-50 hover:text-gruen-800';

/**
 * Startseite (design/Home.dc.html, Blatt S01): Hero mit Tagesbogen (großer Moment B-06, ersetzt den Foto-Platzhalter),
 * kommende Veranstaltungen (6 oder 3, volle Reihen), Neuigkeiten (1 + 3).
 */
export default async function Startseite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('start');
  const kommende = (await ladeVeranstaltungen()).filter((v) => !v.vergangen);
  // Volle Reihen im Dreierraster: sechs, sonst drei (bei fünf Terminen bliebe am Desktop eine Lücke)
  const veranstaltungen = kommende.slice(0, kommende.length >= 6 ? 6 : 3);
  const nachrichten = await ladeNachrichten();
  const aufmacher = nachrichten.find((n) => n.empfohlen) ?? nachrichten[0];
  const weitere = nachrichten.filter((n) => n !== aufmacher).slice(0, 3);
  const kontakt = await ladeSeiteninhalt('kontakt');
  return (
    <Seitenrahmen bereich="startseite" seite="startseite" sprachZiel="/">
      <JsonLd daten={moschee({ url: adresse('/', 'de'), kontakt })} />
      <section aria-labelledby="hero-titel" className="border-b border-linie bg-papier">
        <div className="mx-auto grid max-w-(--container-inhalt) items-center gap-8 px-4 py-abschnitt-klein md:px-8 lg:grid-cols-11 lg:gap-x-16 lg:gap-y-5">
          <div className="flex flex-col gap-5 lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:self-end">
            <span className="inline-flex items-center gap-2 self-start text-16 font-bold text-gruen-800">
              <Stern8 className="size-4" />
              {t('willkommen')}
            </span>
            <h1 id="hero-titel" className="text-display-1 text-gruen-800">
              {t('titel')}
            </h1>
          </div>
          <Tagesbogen className="lg:col-span-6 lg:col-start-6 lg:row-span-2 lg:row-start-1" />
          <div className="flex flex-col gap-5 lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-start">
            <p className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">{t('untertitel')}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/mitglied-werden"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98"
              >
                <span>{t('beitreten')}</span>
                <ArrowRight aria-hidden className="size-5" />
              </Link>
              <Link href="/ueber-uns" className={sekundaer}>
                <span>{t('mehrErfahren')}</span>
                <ArrowRight aria-hidden className="size-5" />
              </Link>
            </div>
          </div>
        </div>
        <div aria-hidden className="h-5 achtstern-band" />
      </section>

      <section aria-labelledby="veranstaltungen-titel" className="border-b border-linie bg-sand">
        <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-abschnitt md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="flex max-w-einleitung flex-col gap-3">
              <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
                <Stern8 className="size-4" />
                {t('kommend')}
              </span>
              <h2 id="veranstaltungen-titel" className="text-display-2">
                {t('veranstaltungenTitel')}
              </h2>
              <p className="text-20 leading-einleitung text-pretty text-tinte-2">{t('veranstaltungenText')}</p>
            </div>
            <Link href="/veranstaltungen" className={sekundaer}>
              <span>{t('alleVeranstaltungen')}</span>
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </div>
          {veranstaltungen.length > 0 ? (
            <ul className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {/* Telefon (H-C03): höchstens drei Termine; der Rest über „Alle Veranstaltungen anzeigen“ */}
              {veranstaltungen.map((v, i) => (
                <li
                  key={v.id}
                  className={cn(i === 0 && veranstaltungen.length % 2 === 1 && 'md:max-lg:col-span-2', i >= 3 && 'max-md:hidden')}
                >
                  <EventCard v={v} sprache={sprache} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
              <Zustandsgrafik art="leer" />
              <p className="max-w-text text-20 text-tinte-2">{t('keineVeranstaltungen')}</p>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="neuigkeiten-titel" className="bg-papier">
        <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-abschnitt md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="flex max-w-einleitung flex-col gap-3">
              <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
                <Stern8 className="size-4" />
                {t('neuigkeitenKennung')}
              </span>
              <h2 id="neuigkeiten-titel" className="text-display-2">
                {t('neuigkeitenTitel')}
              </h2>
              <p className="text-20 leading-einleitung text-pretty text-tinte-2">{t('neuigkeitenText')}</p>
            </div>
            <Link href="/nachrichten" className={sekundaer}>
              <span>{t('alleNeuigkeiten')}</span>
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </div>
          {aufmacher ? (
            <div className="grid items-stretch gap-6 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2">
                <NewsCard n={aufmacher} sprache={sprache} variante="gross" bild={aufmacher.bild} />
              </div>
              <ul className="grid min-w-0 gap-4 lg:grid-rows-3">
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
