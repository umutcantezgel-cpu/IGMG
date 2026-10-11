import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { RichText } from '@/components/website/RichText';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { textMitSprache } from '@/components/website/Text';
import { datumAnzeige, SPRACH_KENNUNG } from '@/components/website/wissen/datum';
import { ThemaInsel } from '@/components/website/wissen/ThemaInsel';
import { ThemaKopf } from '@/components/website/wissen/ThemaKopf';
import { ThemaNavigation } from '@/components/website/wissen/ThemaNavigation';
import type { WissenTexte } from '@/components/website/wissen/typen';
import type { Locale } from '@/i18n/routing';
import { text } from '@/lib/i18n/inhalt';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeWissensInhalt, ladeWissensSlugs, ladeWissensThema, ladeWissensThemen } from '@/server/queries/wissen';

export const ensureStatic = 'navigation';

/** Beim Bau alle sichtbaren Themen (dieselbe Auswahl wie ladeWissensThema); mindestens ein Wert, sonst Platzhalter „_“. */
export async function generateStaticParams() {
  const schluessel = await ladeWissensSlugs();
  return (schluessel.length ? schluessel : ['_']).map((thema) => ({ thema }));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/islamisches-wissen/[thema]'>): Promise<Metadata> {
  const { locale, thema: schluessel } = await params;
  const thema = await ladeWissensThema(schluessel);
  if (!thema) return {};
  const sprache = locale as Locale;
  const t = await getTranslations('wissen');
  return metadatenFuer({
    pfad: { pathname: '/islamisches-wissen/[thema]', params: { thema: thema.slug } },
    titel: text(thema.titel, sprache),
    beschreibung: text(thema.kurztext, sprache) || t('untertitel'),
  });
}

/**
 * Themenseite Islamisches Wissen (Blatt S14, Route /islamisches-wissen/[thema]): Der Filter der Übersicht steht hier
 * in der Adresse. Themen, Artikel und Videos kommen aus der Wissens-Query (A11); Experten gelten für alle Themen.
 * URL-Daten nur innerhalb von Suspense lesen (MUSTER 1).
 */
export default function IslamischesWissenThemaSeite({ params }: PageProps<'/[locale]/islamisches-wissen/[thema]'>) {
  return (
    <Suspense fallback={null}>
      <Thema params={params} />
    </Suspense>
  );
}

async function Thema({ params }: { params: Promise<{ locale: string; thema: string }> }) {
  const { locale, thema: schluessel } = await params;
  const sprache = locale as Locale;
  const thema = await ladeWissensThema(schluessel);
  if (!thema) notFound();
  const [t, tw, tk, themen, inhalt] = await Promise.all([
    getTranslations('wissen'),
    getTranslations('wissenThema'),
    getTranslations('kopf'),
    ladeWissensThemen(),
    ladeWissensInhalt(),
  ]);

  // Klartext aus der Datenbank ist deutsch; in tr und en erscheint er mit lang="de" als sichtbarer Rückfall (K-02).
  const deutsch = (wert: string) => ({ text: wert, lang: sprache === 'de' ? undefined : 'de' });
  const titel = textMitSprache(thema.titel, sprache);
  const untertitel = thema.kurztext ? textMitSprache(thema.kurztext, sprache) : null;
  const aktuell = { schluessel: thema.slug, label: titel };
  const themenAnzeige = themen.map((th) => ({ schluessel: th.slug, label: textMitSprache(th.titel, sprache) }));

  const artikel = inhalt.artikel
    .filter((a) => a.thema === thema.slug)
    .map((a) => ({
      schluessel: a.schluessel,
      thema: a.thema,
      titel: textMitSprache(a.titel, sprache),
      autor: deutsch(a.autor),
      lesezeit: a.lesezeit,
      datum: a.datum ? datumAnzeige(a.datum, sprache) : '',
      text: a.text ? textMitSprache(a.text, sprache) : null,
    }));
  const videos = inhalt.videos
    .filter((v) => v.thema === thema.slug)
    .map((v) => {
      const videoTitel = textMitSprache(v.titel, sprache);
      return {
        schluessel: v.schluessel,
        thema: v.thema,
        titel: videoTitel,
        dauer: v.dauer,
        beschreibung: textMitSprache(v.beschreibung, sprache),
        vorschau: t('videos.vorschau', { titel: videoTitel.text }),
      };
    });
  const experten = inhalt.experten.map((e) => ({
    schluessel: e.schluessel,
    name: deutsch(e.name),
    fachgebiet: textMitSprache(e.fachgebiet, sprache),
    institution: deutsch(e.institution),
    bio: textMitSprache(e.bio, sprache),
    anzahlArtikel: deutsch(e.anzahlArtikel),
  }));

  // Einführung zum Thema nur, wenn sie gepflegt ist (wissen_thema.inhalt); sonst im Design nicht vorhanden.
  const einfuehrungSprache: Locale = sprache !== 'de' && thema.inhalt?.[sprache] ? sprache : 'de';
  const einfuehrung = thema.inhalt?.[einfuehrungSprache];

  const texte: WissenTexte = {
    suchLabel: t('suche.label'),
    suchPlatzhalter: t('suche.platzhalter'),
    themenTitel: t('themen.titel'),
    gefiltertNach: t('filter.gefiltert'),
    filterEntfernen: t('filter.entfernen'),
    reiterGruppe: t('reiter.gruppe'),
    reiterArtikel: t('reiter.artikel'),
    reiterVideos: t('reiter.videos'),
    reiterExperten: t('reiter.experten'),
    artikelTitel: t('artikel.titel'),
    artikelLeer: t('artikel.leer'),
    weiterlesen: t('artikel.weiter'),
    artikelBeispiel: t('artikel.beispiel'),
    videosLeer: t('videos.leer'),
    videoAnsehen: t('videos.ansehen'),
    videoHinweis: t('videos.hinweis'),
    videoPlatzhalter: t('videos.platzhalter'),
    expertenTitel: t('experten.titel'),
    expertenBadge: t('experten.badge'),
    mehrErfahren: t('experten.mehr'),
    zahlArtikel: t('zahl.artikel'),
    dialogAehnlich: t('dialog.aehnlich'),
    dialogKeine: t('dialog.keine'),
    dialogBeschreibung: t('dialog.beschreibung'),
    dialogUeber: t('dialog.ueber'),
    dialogArtikelAnzeigen: t('dialog.artikelAnzeigen'),
    schliessen: t('dialog.schliessen'),
  };

  return (
    <Seitenrahmen
      bereich="islam"
      seite="islamisches-wissen"
      sprachZiel={{ pathname: '/islamisches-wissen/[thema]', params: { thema: thema.slug } }}
      pfad={[{ label: tk('wissen'), ziel: '/islamisches-wissen' }, { label: titel.text }]}
    >
      <ThemaKopf kennung={t('eyebrow')} titel={titel} untertitel={untertitel} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 pt-6 pb-12 md:px-8 md:pt-12 md:pb-24">
        {einfuehrung ? (
          <section aria-labelledby="thema-einfuehrung" className="flex max-w-(--container-text) flex-col gap-4">
            <h2 id="thema-einfuehrung" className="text-30">
              {tw('einfuehrung')}
            </h2>
            <RichText doc={einfuehrung} lang={einfuehrungSprache !== sprache ? 'de' : undefined} className="text-pretty" />
          </section>
        ) : null}
        <ThemaInsel
          sprache={SPRACH_KENNUNG[sprache]}
          texte={texte}
          thema={titel}
          artikel={artikel}
          videos={videos}
          experten={experten}
          themen={
            <ThemaNavigation
              titel={texte.themenTitel}
              gefiltertNach={texte.gefiltertNach}
              filterEntfernen={texte.filterEntfernen}
              themen={themenAnzeige}
              aktuell={aktuell}
            />
          }
        />
      </div>
    </Seitenrahmen>
  );
}
