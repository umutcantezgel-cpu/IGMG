import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { Button } from '@/components/ui/button';
import { KENNUNG } from '@/components/verwaltung/seiteninhalte-organisationen/bereiche';
import { ORGANISATION_KUERZEL } from '@/lib/rechte/matrix';
import { organisationsFilter, verlangeSitzung } from '@/lib/rechte/pruefe';

/**
 * Verwaltung › Seiteninhalte › Organisationen (C05). Es gibt kein Leserecht ohne Ziel für Organisationen; die
 * Übersicht zeigt deshalb nur die Organisationen, für die die Person zuständig ist (organisationsFilter; null = alle).
 */
export default async function OrganisationenUebersicht() {
  const a = await verlangeSitzung();
  const filter = organisationsFilter(a.rollen, 'organisationsinhalt.bearbeiten');
  if (filter !== null && filter.length === 0) redirect('/verwaltung/kein-zugriff');
  const t = await getTranslations('verwaltung.seiteninhalteOrganisationen');
  const sichtbar = ORGANISATION_KUERZEL.filter((k) => filter === null || filter.includes(k));
  const tg = await getTranslations('verwaltung.shell');
  return (
    <>
      <NextLink
        href="/verwaltung/seiteninhalte"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueckSeiteninhalte')}
      </NextLink>
      <VerwaltungsKopf titel={t('uebersicht.titel')} kennung={tg('gruppe.inhalte')} einleitung={t('uebersicht.einleitung')} />
      <ul className="grid gap-4 md:grid-cols-2">
        {sichtbar.map((k) => (
          <li key={k} className="flex flex-col items-start gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-pill bg-gruen-50 px-3 py-0.5 text-16 font-bold text-gruen-800">
                {KENNUNG[k]}
              </span>
              <span lang="tr" className="font-display text-24 font-semibold">
                {t(`orgName.${k}`)}
              </span>
            </div>
            <Button asChild variant="outline">
              <NextLink
                href={`/verwaltung/seiteninhalte/organisationen/${k}`}
                aria-label={`${t('uebersicht.bearbeiten')}: ${t(`orgName.${k}`)}`}
              >
                {t('uebersicht.bearbeiten')}
              </NextLink>
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
