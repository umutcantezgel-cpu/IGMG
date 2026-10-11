import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Bedeutung } from '@/components/website/igmg/Bedeutung';
import { Geschichte } from '@/components/website/igmg/Geschichte';
import { IGMGTabs } from '@/components/website/igmg/IGMGTabs';
import { Kontakt } from '@/components/website/igmg/Kontakt';
import { Struktur } from '@/components/website/igmg/Struktur';
import { Ueberblick } from '@/components/website/igmg/Ueberblick';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('igmg');
  return metadatenFuer({ pfad: '/igmg', titel: t('titel'), beschreibung: t('untertitel') });
}

/**
 * IGMG Dachverband (design/IGMGInfo.dc.html, Blatt S12): Kopf, fünf Themen-Reiter (Überblick, Bedeutung, Geschichte,
 * Struktur, Kontakt) mit Organisationskarten im Reiter Struktur. Alle Reiter sind serverseitig gerendert.
 */
export default async function IGMGSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, tp, inhalt] = await Promise.all([getTranslations('igmg'), getTranslations('kopf'), ladeSeiteninhalt('igmg')]);
  return (
    <Seitenrahmen bereich="moschee" seite="igmg" sprachZiel="/igmg" pfad={[{ label: tp('igmg') }]}>
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
    </Seitenrahmen>
  );
}
