import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { AktuelleHutba } from '@/components/website/dachverband/HutbaKarte';
import { textMitSprache } from '@/components/website/Text';
import { datumAnzeige, SPRACH_KENNUNG } from '@/components/website/wissen/datum';
import { WissenInsel } from '@/components/website/wissen/WissenInsel';
import type { WissenTexte } from '@/components/website/wissen/typen';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeWissensInhalt, ladeWissensThemen } from '@/server/queries/wissen';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo.wissen');
  return metadatenFuer({ pfad: '/islamisches-wissen', titel: t('titel'), beschreibung: t('beschreibung') });
}

/**
 * Islamisches Wissen (design/IslamicKnowledge.dc.html, Blatt S14): Themen als Filter, Reiter Artikel, Videos und
 * Experten. Themen kommen aus der Tabelle wissen_thema, Artikel, Videos und Experten aus dem Seiteninhalt „wissen“.
 * Die Seite ist vollständig statisch (K-01, keine Cookies, kein Datum im Render); nur die Insel filtert und
 * wechselt die Reiter im Browser (K-12).
 */
export default async function IslamischesWissenSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('wissen');
  const [themen, inhalt] = await Promise.all([ladeWissensThemen(), ladeWissensInhalt()]);
  // Klartext aus der Datenbank ist deutsch; in tr und en erscheint er mit lang="de" als sichtbarer Rückfall (K-02).
  const deutsch = (text: string) => ({ text, lang: sprache === 'de' ? undefined : 'de' });

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
    <Seitenrahmen bereich="islam" seite="islamisches-wissen" sprachZiel="/islamisches-wissen" pfad={[{ label: t('breadcrumb') }]}>
      <PageHeader kennung={t('eyebrow')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 pt-6 pb-12 md:px-8 md:pt-12 md:pb-24">
        {/* Marktstart P3: Freitagspredigt der IGMG vom {Datum} – nur Titel, Datum und Link, kein Auszug (G-06) */}
        <AktuelleHutba sprache={sprache} />
        <WissenInsel
          sprache={SPRACH_KENNUNG[sprache]}
          texte={texte}
          themen={themen.map((th) => ({ schluessel: th.slug, label: textMitSprache(th.titel, sprache) }))}
          artikel={inhalt.artikel.map((a) => ({
            schluessel: a.schluessel,
            thema: a.thema,
            titel: textMitSprache(a.titel, sprache),
            autor: deutsch(a.autor),
            lesezeit: a.lesezeit,
            datum: a.datum ? datumAnzeige(a.datum, sprache) : '',
            text: a.text ? textMitSprache(a.text, sprache) : null,
          }))}
          videos={inhalt.videos.map((v) => {
            const titel = textMitSprache(v.titel, sprache);
            return {
              schluessel: v.schluessel,
              thema: v.thema,
              titel,
              dauer: v.dauer,
              beschreibung: textMitSprache(v.beschreibung, sprache),
              vorschau: t('videos.vorschau', { titel: titel.text }),
            };
          })}
          experten={inhalt.experten.map((e) => ({
            schluessel: e.schluessel,
            name: deutsch(e.name),
            fachgebiet: textMitSprache(e.fachgebiet, sprache),
            institution: deutsch(e.institution),
            bio: textMitSprache(e.bio, sprache),
            anzahlArtikel: deutsch(e.anzahlArtikel),
          }))}
        />
      </div>
    </Seitenrahmen>
  );
}
