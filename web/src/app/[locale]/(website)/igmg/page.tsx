import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { FaqAnsicht } from '@/components/website/bloecke/TextBloecke';
import { Quellenzeile } from '@/components/website/dachverband/Quellenzeile';
import { Verweisliste } from '@/components/website/dachverband/Verweisliste';
import { Bedeutung } from '@/components/website/igmg/Bedeutung';
import { Geschichte } from '@/components/website/igmg/Geschichte';
import { IGMGTabs } from '@/components/website/igmg/IGMGTabs';
import { Kontakt } from '@/components/website/igmg/Kontakt';
import { Struktur } from '@/components/website/igmg/Struktur';
import { Ueberblick } from '@/components/website/igmg/Ueberblick';
import { GemeindeJsonLd } from '@/components/website/GemeindeJsonLd';
import { JsonLd } from '@/components/website/JsonLd';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import type { Locale } from '@/i18n/routing';
import { faqSeite } from '@/lib/seo/jsonld';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo.igmg');
  return metadatenFuer({ pfad: '/igmg', titel: t('titel'), beschreibung: t('beschreibung') });
}

/**
 * IGMG Dachverband (design/IGMGInfo.dc.html, Blatt S12; Plan Marktstart P1): Kopf, fünf Themen-Reiter (Überblick,
 * Bedeutung, Geschichte, Struktur, Kontakt) mit Organisationskarten im Reiter Struktur. Alle Reiter sind serverseitig
 * gerendert. Unter den Reitern – immer sichtbar, kein sechster Reiter – stehen „Mehr bei der IGMG“ (Verweise ins
 * IGMG-Netzwerk), die häufigen Fragen (wie der Baustein „Fragen und Antworten“, ohne JavaScript) und die Quellenzeile.
 */
export default async function IGMGSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, tp, td, inhalt] = await Promise.all([
    getTranslations('igmg'),
    getTranslations('kopf'),
    getTranslations('dachverband'),
    ladeSeiteninhalt('igmg'),
  ]);
  const faqTitel = t('faqTitel');
  // FAQPage nur aus den sichtbaren Fragen ohne Platzhalter (Marktstart P7/P8, ADR 0049)
  const faqDaten = faqSeite(inhalt.faq, sprache);
  return (
    <Seitenrahmen bereich="moschee" seite="igmg" sprachZiel="/igmg" pfad={[{ label: tp('igmg') }]}>
      <GemeindeJsonLd />
      {faqDaten ? <JsonLd daten={faqDaten} /> : null}
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-6 px-4 py-abschnitt-klein md:px-8">
        <IGMGTabs
          beschriftung={t('themen')}
          standard="ueberblick"
          reiter={[
            { schluessel: 'ueberblick', label: t('tabUeberblick'), inhalt: <Ueberblick inhalt={inhalt} sprache={sprache} /> },
            { schluessel: 'bedeutung', label: t('tabBedeutung'), inhalt: <Bedeutung inhalt={inhalt} sprache={sprache} /> },
            { schluessel: 'geschichte', label: t('tabGeschichte'), inhalt: <Geschichte inhalt={inhalt} sprache={sprache} /> },
            { schluessel: 'struktur', label: t('tabStruktur'), inhalt: <Struktur inhalt={inhalt} sprache={sprache} /> },
            { schluessel: 'kontakt', label: t('tabKontakt'), inhalt: <Kontakt inhalt={inhalt} /> },
          ]}
        />
      </div>
      <div className="flex flex-col gap-12 pb-abschnitt md:gap-16">
        {inhalt.verweise.length ? (
          <section aria-labelledby="igmg-mehr" className="mx-auto w-full max-w-(--container-inhalt) px-4 md:px-8">
            <div className="flex max-w-seitenkopf flex-col gap-4">
              <h2 id="igmg-mehr" className="text-display-2 text-balance">
                {td('mehrTitel')}
              </h2>
              <Verweisliste eintraege={inhalt.verweise} />
            </div>
          </section>
        ) : null}
        {inhalt.faq.length ? (
          // Überschrift aus den Texten der Seite, in jeder Sprache gleich gesetzt (kein Rückfall-Hinweis lang="de")
          <FaqAnsicht
            b={{ typ: 'faq', id: 'igmgfaq', titel: { de: faqTitel, tr: faqTitel, en: faqTitel }, eintraege: inhalt.faq }}
            sprache={sprache}
          />
        ) : null}
        {inhalt.stand ? (
          <div className="mx-auto w-full max-w-(--container-inhalt) px-4 md:px-8">
            <Quellenzeile quelle={t('quelleSeite')} stand={inhalt.stand} />
          </div>
        ) : null}
      </div>
    </Seitenrahmen>
  );
}
