import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { GemeindeJsonLd } from '@/components/website/GemeindeJsonLd';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Stern8 } from '@/components/website/Icons';
import { Text } from '@/components/website/Text';
import { Trenner } from '@/components/website/Zustandsgrafik';
import { Quellenzeile } from '@/components/website/dachverband/Quellenzeile';
import { Aufruf } from '@/components/website/ueber-uns/Aufruf';
import { Bildflaeche } from '@/components/website/ueber-uns/Bildflaeche';
import { Werte } from '@/components/website/ueber-uns/Werte';
import { Zeitleiste } from '@/components/website/ueber-uns/Zeitleiste';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

/**
 * Stand der übernommenen Angaben (Gründungsjahr 1978, Stationen 2008 und 2011, Regionalverband Hessen): Tag der Prüfung
 * der IGMG-Berichte vom 07.04.2008 und 17.10.2011 (E-044). Die Belege stehen im Seed und auf /quellen.
 */
const QUELLEN_STAND = '2026-10-27';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo.ueberUns');
  return metadatenFuer({ pfad: '/ueber-uns', titel: t('titel'), beschreibung: t('beschreibung') });
}

/**
 * Über uns (design/AboutUs.dc.html, Blatt S08): Geschichte, Zeitleiste, Gebet und Gemeinschaft, Werte und Aufruf.
 * Redaktionelle Texte kommen aus dem Seiteninhalt „ueber-uns“, feste Überschriften und Schaltflächen aus messages.
 * Komposition nach der Referenz (O-10): vollbreite Abschnitte im Wechsel Papier/Sand, Kopfblock mit `text-display-2`.
 * Abschnittsköpfe (H-B12): Kennung mit Achtstern über dem Titel; der Weg steht im Breitformat neben seinem Kopf.
 * Marktstart (E-044): Unter der Geschichte ordnet ein fester Satz die Gemeinde in den Dachverband ein (Link auf /igmg),
 * die Quellenzeile nennt Herkunft und Stand der übernommenen Angaben.
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
      <GemeindeJsonLd />
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />

      {/* Geschichte: Lesespalte und Bildfläche nebeneinander, erster Absatz als Einleitung */}
      <section aria-labelledby="ueber-geschichte" className="bg-papier">
        <div className="mx-auto grid max-w-(--container-inhalt) items-start gap-8 px-4 py-abschnitt md:px-8 lg:grid-cols-12 lg:gap-16">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
            <div className="flex max-w-einleitung flex-col gap-3">
              <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
                <Stern8 className="size-4" />
                {t('geschichteKennung')}
              </span>
              <h2 id="ueber-geschichte" className="text-display-2 text-balance">
                {t('geschichteTitel')}
              </h2>
            </div>
            <div className="fliesstext text-pretty">
              {inhalt.geschichte.absaetze.map((a, i) => (
                <Text
                  key={i}
                  feld={a.absatz}
                  sprache={sprache}
                  als="p"
                  className={i === 0 ? 'text-20 leading-einleitung text-tinte' : 'text-18'}
                />
              ))}
              {/* Einordnung in den Dachverband (E-044): fester Text, damit Entität und Region überall gleich lauten */}
              <p className="text-18">
                {t.rich('dachverband', {
                  link: (teil) => (
                    <Link href="/igmg" className="font-bold underline underline-offset-3">
                      {teil}
                    </Link>
                  ),
                })}
              </p>
            </div>
            <Quellenzeile quelle={t('quelle')} stand={QUELLEN_STAND} />
          </div>
          <Bildflaeche beschriftung={t('bildHistorie')} className="aspect-4/3 rounded-lg lg:sticky lg:top-8 lg:col-span-5" />
        </div>
      </section>

      {/* Weg der Gemeinde (B-07): Kopf links und Stationen als Karten am Weg rechts (ab lg zwei Drittel) */}
      <section aria-labelledby="ueber-reise" className="border-y border-linie bg-sand">
        <div className="mx-auto grid max-w-(--container-inhalt) gap-10 px-4 py-abschnitt md:px-8 lg:grid-cols-3 lg:gap-12">
          <div className="flex max-w-einleitung flex-col gap-3 lg:sticky lg:top-8 lg:self-start">
            <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
              <Stern8 className="size-4" />
              {t('reiseKennung')}
            </span>
            <h2 id="ueber-reise" className="text-display-2">
              {t('reiseTitel')}
            </h2>
            <p className="text-20 leading-einleitung text-pretty text-tinte-2">{t('reiseUntertitel')}</p>
          </div>
          <div className="min-w-0 lg:col-span-2">
            <Zeitleiste eintraege={zeitleiste} sprache={sprache} />
          </div>
        </div>
      </section>

      {/* Gebet, Gemeinschaft, Einheit: ruhige Lesefläche, vom Achtstern-Trenner eingeleitet */}
      <section aria-labelledby="ueber-gemeinschaft" className="bg-papier">
        <div className="mx-auto max-w-(--container-seitenkopf) px-4 py-abschnitt md:px-8">
          <div className="mx-auto flex w-full max-w-text flex-col gap-6">
            <Trenner className="mx-auto w-full max-w-60" />
            <h2 id="ueber-gemeinschaft" className="text-display-2 text-balance">
              {t('gemeinschaftTitel')}
            </h2>
            <div className="fliesstext text-pretty">
              {inhalt.gemeinschaft.absaetze.map((a, i) => (
                <Text key={i} feld={a.absatz} sprache={sprache} als="p" className="text-18" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="ueber-werte" className="border-t border-linie bg-sand">
        <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-abschnitt md:px-8">
          <div className="flex max-w-einleitung flex-col gap-3">
            <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
              <Stern8 className="size-4" />
              {t('wertKennung')}
            </span>
            <h2 id="ueber-werte" className="text-display-2">
              {t('wertTitel')}
            </h2>
            <p className="text-20 leading-einleitung text-pretty text-tinte-2">{t('wertUntertitel')}</p>
          </div>
          <Werte eintraege={werte} sprache={sprache} />
        </div>
      </section>

      <div className="bg-papier">
        <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt-klein md:px-8">
          <Aufruf
            titel={aufrufTitel}
            text={t('aufrufText')}
            kontakt={{ text: t('aufrufKontakt'), label: t('linkKontext', { sichtbar: t('aufrufKontakt'), titel: aufrufTitel }) }}
            mehr={{ text: t('aufrufMehr'), label: t('linkKontext', { sichtbar: t('aufrufMehr'), titel: aufrufTitel }) }}
          />
        </div>
      </div>
    </Seitenrahmen>
  );
}
