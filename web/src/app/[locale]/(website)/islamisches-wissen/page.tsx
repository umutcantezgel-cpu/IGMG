import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { AktuelleHutba } from '@/components/website/dachverband/HutbaKarte';
import { Verweisliste } from '@/components/website/dachverband/Verweisliste';
import { textMitSprache } from '@/components/website/Text';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { datumAnzeige, SPRACH_KENNUNG } from '@/components/website/wissen/datum';
import { EntwurfMarke } from '@/components/website/wissen/EntwurfMarke';
import { VideoLink } from '@/components/website/wissen/VideoLink';
import { WissenErklaerung } from '@/components/website/wissen/WissenErklaerung';
import { WissenInsel } from '@/components/website/wissen/WissenInsel';
import type { WissenTexte } from '@/components/website/wissen/typen';
import type { Locale } from '@/i18n/routing';
import { youtubeLink } from '@/lib/einbettung/youtube';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeWissensInhalt, ladeWissensThemen } from '@/server/queries/wissen';

export const ensureStatic = 'navigation';

/** „Mehr beim Dachverband“ (Marktstart P7): Ziele aus dem IGMG-Netzwerk in dieser Reihenfolge. */
const WISSEN_DACHVERBAND = ['freitagspredigt', 'islamSchnellErklaert', 'derIslam', 'qalam', 'umreYoldasim', 'reisen'] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo.wissen');
  return metadatenFuer({ pfad: '/islamisches-wissen', titel: t('titel'), beschreibung: t('beschreibung') });
}

/**
 * Islamisches Wissen (design/IslamicKnowledge.dc.html, Blatt S14): Themen als Filter, Reiter Artikel, Videos und
 * Experten. Themen kommen aus der Tabelle wissen_thema, Artikel, Videos und Experten aus dem Seiteninhalt „wissen“.
 * Die Seite ist vollständig statisch (K-01, keine Cookies, kein Datum im Render); nur die Insel filtert und
 * wechselt die Reiter im Browser (K-12). Marktstart P7: neben der Freitagspredigt die Erklärung zum Freitagsgebet, unter der
 * Insel „Mehr beim Dachverband“ (Server-Komponenten, nur Links). Videos mit YouTube-ID erscheinen nur als Link.
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
        {/* Marktstart P7: daneben die Erklärung zum Freitagsgebet (fehlt sie, nimmt die Karte die ganze Breite) */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <AktuelleHutba sprache={sprache} className="lg:flex-1" />
          <WissenErklaerung slug="friday-prayer" className="lg:flex-1" />
        </div>
        <WissenInsel
          sprache={SPRACH_KENNUNG[sprache]}
          texte={texte}
          themen={themen.map((th) => ({
            schluessel: th.slug,
            label: textMitSprache(th.titel, sprache),
            // Noch nicht religiös geprüft (Schalter `website_wissen_vorschau`, ADR 0047): Marke „Entwurf“
            marke: th.entwurf ? t('entwurf.marke') : undefined,
          }))}
          entwurfMarke={<EntwurfMarke text={t('entwurf.marke')} />}
          leerGrafik={<Zustandsgrafik art="leer" />}
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
              // Nur ein Link zu YouTube, keine Einbettung (K-12: die Seite liegt an der JS-Grenze; K-14: kein Abruf beim Laden)
              ...(v.youtubeId ? { link: <VideoLink href={youtubeLink(v.youtubeId)} text={t('videos.youtube')} titel={titel.text} /> } : {}),
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
        {/* Marktstart P7: weiterführende Angebote der IGMG – Server-Komponente unter der Insel, nur Links (K-12, K-14) */}
        <section aria-labelledby="wissen-dachverband" data-wissen="dachverband" className="flex max-w-seitenkopf flex-col gap-4 pt-4">
          <h2 id="wissen-dachverband" className="text-display-2 text-balance">
            {t('dachverband.titel')}
          </h2>
          <p className="max-w-text text-18 text-pretty text-tinte-2">{t('dachverband.text')}</p>
          <Verweisliste eintraege={WISSEN_DACHVERBAND} />
        </section>
      </div>
    </Seitenrahmen>
  );
}
