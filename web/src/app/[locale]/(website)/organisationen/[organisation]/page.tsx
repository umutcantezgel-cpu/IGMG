import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { OrganizationPage } from '@/components/website/organisation/OrganizationPage';
import { KENNUNG } from '@/components/website/organisation/stil';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { ORGANISATION_KUERZEL, ORGANISATIONEN, type OrganisationSlug } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeNachrichten } from '@/server/queries/nachrichten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';
import { ladeVeranstaltungen } from '@/server/queries/veranstaltungen';

export const ensureStatic = 'navigation';

/** Beim Bau alle vier Organisationen (K-03, ORGANISATIONEN); andere Adressen liefern 404. */
export function generateStaticParams() {
  return ORGANISATIONEN.map((organisation) => ({ organisation }));
}

function istOrganisation(wert: string): wert is OrganisationSlug {
  return (ORGANISATIONEN as readonly string[]).includes(wert);
}

export async function generateMetadata({ params }: PageProps<'/[locale]/organisationen/[organisation]'>): Promise<Metadata> {
  const { organisation } = await params;
  if (!istOrganisation(organisation)) return {};
  const kuerzel = ORGANISATION_KUERZEL[organisation];
  const [tk, t] = await Promise.all([getTranslations('karten'), getTranslations('organisation')]);
  return metadatenFuer({
    pfad: { pathname: '/organisationen/[organisation]', params: { organisation } },
    titel: tk(`orgName_${kuerzel}`),
    beschreibung: t(`${KENNUNG[kuerzel]}.subtitle`),
  });
}

/**
 * Organisationsseite (design/OrganizationPage.dc.html, Blätter S15–S18): Rahmen und Brotkrumen, der Inhalt je
 * Organisation aus dem Seiteninhalt, Termine und Nachrichten aus der Datenbank (die Komponente filtert nach Organisation).
 */
export default function OrganisationSeite({ params }: PageProps<'/[locale]/organisationen/[organisation]'>) {
  return (
    <Suspense fallback={null}>
      <Organisation params={params} />
    </Suspense>
  );
}

async function Organisation({ params }: { params: Promise<{ locale: string; organisation: string }> }) {
  const { organisation } = await params;
  if (!istOrganisation(organisation)) notFound();
  const kuerzel = ORGANISATION_KUERZEL[organisation];
  const bereich = `organisation-${organisation}` as const;
  const [tp, tk, inhalt, veranstaltungen, nachrichten] = await Promise.all([
    getTranslations('kopf'),
    getTranslations('karten'),
    ladeSeiteninhalt(bereich),
    ladeVeranstaltungen(),
    ladeNachrichten(),
  ]);
  return (
    <Seitenrahmen
      bereich="organisationen"
      seite={organisation}
      sprachZiel={{ pathname: '/organisationen/[organisation]', params: { organisation } }}
      pfad={[{ label: tp('organisationen') }, { label: tk(`orgName_${kuerzel}`) }]}
    >
      <OrganizationPage org={kuerzel} inhalt={inhalt} veranstaltungen={veranstaltungen} nachrichten={nachrichten} />
    </Seitenrahmen>
  );
}
