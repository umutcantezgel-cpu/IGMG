import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BEREICH_ORGANISATION, istOrganisation, KENNUNG } from '@/components/verwaltung/seiteninhalte-organisationen/bereiche';
import { OrganisationFormular } from '@/components/verwaltung/seiteninhalte-organisationen/OrganisationFormular';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { speichereOrganisation } from '@/server/actions/seiteninhalte-organisationen';
import { ladeSeiteninhaltFuerVerwaltung } from '@/server/queries/verwaltung/seiteninhalte-organisationen';

/**
 * Verwaltung › Seiteninhalte › Organisation (at, kt, gt, kgt). Unbekannte Adressen liefern 404; fremde
 * Organisationen sieht die Organisationsredaktion nicht (Recht am Ziel, K-06). Die Action erhält die Organisation
 * fest über `bind` und prüft dasselbe Recht noch einmal.
 */
export default async function OrganisationBearbeiten({ params }: PageProps<'/[locale]/verwaltung/seiteninhalte/organisationen/[org]'>) {
  const { org } = await params;
  if (!istOrganisation(org)) notFound();
  await verlangeSeitenRecht('organisationsinhalt.bearbeiten', { organisation: org });
  const [t, stand] = await Promise.all([
    getTranslations('verwaltung.seiteninhalteOrganisationen'),
    ladeSeiteninhaltFuerVerwaltung(BEREICH_ORGANISATION[org]),
  ]);
  const name = t(`orgName.${org}`);
  return (
    <>
      <NextLink
        href="/verwaltung/seiteninhalte/organisationen"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueckOrganisationen')}
      </NextLink>
      <div>
        <p className="font-bold text-tinte-2">{KENNUNG[org]}</p>
        <h1 lang="tr" className="text-30 md:text-36">
          {name}
        </h1>
        <p className="text-tinte-2">{t('organisation.einleitung')}</p>
      </div>
      <OrganisationFormular
        aktion={speichereOrganisation.bind(null, org)}
        startwerte={stand.inhalt}
        name={name}
        beispiel={stand.istBeispiel}
        unlesbar={!stand.lesbar}
      />
    </>
  );
}
