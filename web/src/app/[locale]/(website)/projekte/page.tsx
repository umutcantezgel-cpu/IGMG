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
 * Projekte (design/Projects.dc.html, Blatt S10): Bauprojekt mit 3D-Platzhalter, Meilensteine, Spenden und
 * Spezifikationen, Unterstützen. Redaktionelle Inhalte kommen aus dem Seiteninhalt „projekte“, feste Überschriften
 * und Schaltflächen aus messages/bereiche/projekte.json. Keine Formulare, keine Anfragen an Dritte (K-14).
 */
export default async function ProjekteSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('projekte');
  const inhalt = await ladeSeiteninhalt('projekte');
  return (
    <Seitenrahmen bereich="moschee" seite="projekte" sprachZiel="/projekte" pfad={[{ label: t('kopf.eyebrow') }]}>
      <PageHeader kennung={t('kopf.eyebrow')} titel={t('kopf.titel')} untertitel={t('kopf.untertitel')} />
      {/* Erzählfolge (O-11): das Vorhaben → der Stand (Meilensteinlinie, B-08) → was es braucht → Aufruf */}
      <section aria-label={t('kopf.titel')} className="bg-papier">
        <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt md:px-8">
          <Bauprojekt inhalt={inhalt} sprache={sprache} />
        </div>
      </section>
      <div className="border-y border-linie bg-sand">
        <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt md:px-8">
          <Meilensteine inhalt={inhalt} sprache={sprache} />
        </div>
      </div>
      <div className="bg-papier">
        <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-abschnitt-klein px-4 py-abschnitt md:px-8">
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            <Spenden inhalt={inhalt} sprache={sprache} />
            <Spezifikationen inhalt={inhalt} sprache={sprache} />
          </div>
          <Unterstuetzen inhalt={inhalt} sprache={sprache} />
        </div>
      </div>
    </Seitenrahmen>
  );
}
