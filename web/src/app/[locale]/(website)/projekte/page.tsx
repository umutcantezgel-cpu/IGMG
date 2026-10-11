import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Bauprojekt } from '@/components/website/projekte/Bauprojekt';
import { Meilensteine } from '@/components/website/projekte/Meilensteine';
import { Spenden } from '@/components/website/projekte/Spenden';
import { Spezifikationen } from '@/components/website/projekte/Spezifikationen';
import { Unterstuetzen } from '@/components/website/projekte/Unterstuetzen';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('projekte');
  return metadatenFuer({ pfad: '/projekte', titel: t('kopf.titel'), beschreibung: t('kopf.untertitel') });
}

/**
 * Projekte (design/Projects.dc.html, Blatt S10): Bauprojekt mit 3D-Platzhalter, Spenden und Spezifikationen,
 * Unterstützen und Meilensteine. Redaktionelle Inhalte kommen aus dem Seiteninhalt „projekte“, feste Überschriften
 * und Schaltflächen aus messages/bereiche/projekte.json. Keine Formulare, keine Anfragen an Dritte (K-14).
 */
export default async function ProjekteSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('projekte');
  const inhalt = await ladeSeiteninhalt('projekte');
  return (
    <Seitenrahmen bereich="moschee" seite="projekte" sprachZiel="/projekte" pfad={[{ label: t('kopf.eyebrow') }]}>
      <PageHeader kennung={t('kopf.eyebrow')} titel={t('kopf.titel')} untertitel={t('kopf.untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 pt-8 pb-12 md:gap-16 md:px-8 md:pt-16 md:pb-24">
        <Bauprojekt inhalt={inhalt} sprache={sprache} />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-6">
          <Spenden inhalt={inhalt} sprache={sprache} />
          <Spezifikationen inhalt={inhalt} sprache={sprache} />
        </div>
        <Unterstuetzen inhalt={inhalt} sprache={sprache} />
        <Meilensteine inhalt={inhalt} sprache={sprache} />
      </div>
    </Seitenrahmen>
  );
}
