import type { JSONContent } from '@tiptap/core';
import { ArrowLeft, Bookmark, Calendar, Clock, Languages } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { Bildplatzhalter } from '@/components/website/Bildplatzhalter';
import { MedienBild, SIZES_KOPF } from '@/components/website/MedienBild';
import { JsonLd } from '@/components/website/JsonLd';
import { PageHeader } from '@/components/website/PageHeader';
import { RichText } from '@/components/website/RichText';
import { morphStil } from '@/components/website/morph';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { textMitSprache } from '@/components/website/Text';
import { Trenner } from '@/components/website/Zustandsgrafik';
import { AehnlicheArtikel } from '@/components/website/nachrichten/AehnlicheArtikel';
import { AutorZeile } from '@/components/website/nachrichten/Autor';
import { TeilenKnopf } from '@/components/website/veranstaltungen/TeilenKnopf';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { text } from '@/lib/i18n/inhalt';
import { auszugImRumpf } from '@/lib/inhalt/tiptap';
import { nachricht } from '@/lib/seo/jsonld';
import { adresse, basisUrl, metadatenFuer } from '@/lib/seo/metadaten';
import { ladeAehnlicheNachrichten, ladeNachricht, ladeNachrichtenSlugs, type NachrichtDaten } from '@/server/queries/nachrichten';

export const ensureStatic = 'navigation';

/** Beim Bau alle veröffentlichten Slugs; neue entstehen bei der ersten Anfrage (ensureStatic verlangt ≥ 1 Wert). */
export async function generateStaticParams() {
  const slugs = await ladeNachrichtenSlugs();
  return (slugs.length ? slugs : ['_']).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/nachrichten/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const n = await ladeNachricht(slug);
  if (!n) return {};
  const sprache = locale as Locale;
  const t = await getTranslations('nachrichten');
  return metadatenFuer({
    pfad: { pathname: '/nachrichten/[slug]', params: { slug } },
    eigenesBild: true,
    titel: text(n.titel, sprache),
    // Ohne Kurztext: Untertitel der Übersicht statt der Platzhalter-Beschreibung des Layouts (Muster Islamisches Wissen)
    beschreibung: text(n.kurztext, sprache) || t('untertitel'),
  });
}

/** Rich-Text in der gewählten Sprache; fehlt sie, zeigt die Seite den deutschen Text mit Kennzeichnung (K-02). */
function inhaltFuer(inhalt: NachrichtDaten['inhalt'], sprache: Locale): { doc: JSONContent; rueckfall: boolean } | null {
  if (!inhalt) return null;
  const eigene = sprache === 'de' ? undefined : inhalt[sprache];
  return eigene ? { doc: eigene, rueckfall: false } : { doc: inhalt.de, rueckfall: sprache !== 'de' };
}

/** Nachrichtendetail (design/NewsDetails.dc.html, Blatt S07). URL-Daten nur innerhalb von Suspense lesen (MUSTER 1). */
export default function NachrichtSeite({ params }: PageProps<'/[locale]/nachrichten/[slug]'>) {
  return (
    <Suspense fallback={null}>
      <Nachricht params={params} />
    </Suspense>
  );
}

async function Nachricht({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const sprache = locale as Locale;
  const n = await ladeNachricht(slug);
  if (!n) notFound();
  const [t, tk, tn, ta] = await Promise.all([
    getTranslations('nachricht'),
    getTranslations('karten'),
    getTranslations('nachrichten'),
    getTranslations('allgemein'),
  ]);
  const titel = textMitSprache(n.titel, sprache);
  const kurz = textMitSprache(n.kurztext, sprache);
  const inhaltRoh = inhaltFuer(n.inhalt, sprache);
  // Auszug und Rumpf (H-C02): Steht der Kurztext schon als erster Absatz im Rumpf, erscheint er nur einmal
  const auszug = inhaltRoh ? auszugImRumpf(inhaltRoh.doc, kurz.text) : null;
  const inhalt = inhaltRoh && auszug ? { ...inhaltRoh, doc: auszug.doc } : inhaltRoh;
  const zeigeUntertitel = auszug?.untertitel ?? true;
  // Sichtbare Kennzeichnung, sobald ein Teil der Seite nur auf Deutsch vorliegt (K-02)
  const rueckfall = sprache !== 'de' && (titel.lang === 'de' || (kurz.text !== '' && kurz.lang === 'de') || inhalt?.rueckfall === true);
  const veroeffentlicht = new Date(n.veroeffentlichtAm);
  const aehnliche = await ladeAehnlicheNachrichten(n.kategorie, n.id);
  const autorName = t('autorName');
  const autorFunktion = t('autorFunktion');

  return (
    <Seitenrahmen
      bereich="moschee"
      seite="nachrichten"
      sprachZiel={{ pathname: '/nachrichten/[slug]', params: { slug } }}
      pfad={[{ label: tn('titel'), ziel: '/nachrichten' }, { label: titel.text }]}
    >
      <JsonLd
        daten={nachricht({
          url: adresse({ pathname: '/nachrichten/[slug]', params: { slug } }, sprache),
          headline: titel.text,
          beschreibung: kurz.text,
          datePublished: n.veroeffentlichtAm,
          bild: n.bild ? `${basisUrl()}${n.bild.url}` : null,
          logo: `${basisUrl()}/bilder/logos/logo-igmg-wetzlar.png`,
          sprache: titel.lang ?? sprache,
        })}
      />
      <PageHeader
        // Kopfbild (H-C02): ab lg ein Platzhalter, wenn kein Bild gepflegt ist; die Fläche trägt den Übergangsnamen
        bildAbLg={!n.bild}
        bild={
          // Gegenstück zum Kartenbild (O-13): Titel und Bild morphen von der Karte hierher
          <div style={morphStil(`n-${n.slug}-bild`)}>
            {n.bild ? (
              <MedienBild
                bild={n.bild}
                sprache={sprache}
                vorladen
                sizes={SIZES_KOPF}
                className="h-55 rounded-lg border border-linie md:h-75 lg:aspect-4/3 lg:h-auto"
              />
            ) : (
              <Bildplatzhalter
                beschriftung={tk('fotoBeitrag')}
                className="h-55 rounded-lg border border-linie md:h-75 lg:aspect-4/3 lg:h-auto"
              />
            )}
          </div>
        }
        oben={
          <Link
            href="/nachrichten"
            className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4"
          >
            <ArrowLeft aria-hidden className="size-5" />
            {t('zurueckListe')}
          </Link>
        }
        kennung={tk(`nkat_${n.kategorie}`)}
        titel={titel.text}
        titelLang={titel.lang}
        titelStil={morphStil(`n-${n.slug}-titel`, 'text')}
        untertitel={zeigeUntertitel ? kurz.text || undefined : undefined}
        untertitelLang={kurz.lang}
        kinder={
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-16 text-tinte-2">
              {n.wichtig ? (
                <span className="inline-flex rounded-pill bg-tag-wichtig-bg px-3 py-0.5 font-bold text-tag-wichtig">
                  {tk('nkat_wichtig')}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Calendar aria-hidden className="size-4" />
                <time dateTime={n.veroeffentlichtAm}>
                  {t('datumZeit', { datum: datumLang(veroeffentlicht, sprache), zeit: uhrzeit(veroeffentlicht, sprache) })}
                </time>
              </span>
              {n.lesezeit ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock aria-hidden className="size-4" />
                  {t('lesezeit', { minuten: n.lesezeit })}
                </span>
              ) : null}
              {rueckfall ? (
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-info-toenung px-3 py-0.5 font-bold text-info">
                  <Languages aria-hidden className="size-4" />
                  {ta('nurDeutsch')}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-linie py-4">
              <AutorZeile name={autorName} funktion={autorFunktion} />
              <div className="flex flex-wrap gap-2">
                <TeilenKnopf titel={titel.text} texte={{ teilen: t('teilen'), kopiert: t('teilenKopiert'), fehler: t('teilenFehler') }} />
              </div>
            </div>
          </>
        }
      />

      <div className="@container mx-auto grid max-w-(--container-inhalt) items-start gap-12 px-4 py-abschnitt md:px-8 lg:grid-cols-3">
        <article className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          {inhalt ? (
            <RichText
              doc={inhalt.doc}
              lang={inhalt.rueckfall ? 'de' : undefined}
              className="gap-5 text-pretty"
              bilder={n.textBilder}
              sprache={sprache}
            />
          ) : null}
          {n.schlagwoerter.length ? (
            <section aria-labelledby="nachricht-schlagwoerter" className="flex flex-col gap-3">
              <h2
                id="nachricht-schlagwoerter"
                className="flex items-center gap-2 font-text text-24 leading-tight font-bold tracking-normal"
              >
                <Bookmark aria-hidden className="size-5 text-gruen-700" />
                {t('schlagwoerter')}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {n.schlagwoerter.map((s, i) => {
                  const w = textMitSprache(s, sprache);
                  return (
                    <li
                      key={i}
                      lang={w.lang}
                      className="inline-flex rounded-pill border border-linie bg-sand px-3 py-0.5 text-16 font-bold text-tinte-2"
                    >
                      #{w.text}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
          {aehnliche.length ? <Trenner className="lg:hidden" /> : null}
        </article>
        {aehnliche.length ? (
          <aside className="flex min-w-0 flex-col gap-6">
            <AehnlicheArtikel titel={t('aehnlich')} artikel={aehnliche} sprache={sprache} />
          </aside>
        ) : null}
      </div>
    </Seitenrahmen>
  );
}
