import { ArrowRight } from 'lucide-react';
import { Bild } from './Bild';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import type { OrganisationSlug } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { LOGOS } from './navigation';

/** Kürzel der vier Organisationen (design/OrgCard.dc.html, Varianten at | kt | gt | kgt). */
export type OrgKuerzel = 'at' | 'kt' | 'gt' | 'kgt';

/** Je Organisation: Slug (ORGANISATIONEN, src/i18n/routing.ts), Logo und Tokenklassen aus den Organisationsfarben. */
const ORG: Record<
  OrgKuerzel,
  { slug: OrganisationSlug; logo: string; band: string; rahmen: string; tint: string; ink: string; hover: string; linie: string }
> = {
  at: {
    slug: 'ana-teskilati',
    logo: LOGOS.at,
    band: 'bg-org-at',
    rahmen: 'border-org-at',
    tint: 'bg-org-at-toenung',
    ink: 'text-org-at-text',
    hover: 'hover:text-org-at-text',
    linie: 'decoration-org-at',
  },
  kt: {
    slug: 'kadin-teskilati',
    logo: LOGOS.kt,
    band: 'bg-org-kt',
    rahmen: 'border-org-kt',
    tint: 'bg-org-kt-toenung',
    ink: 'text-org-kt-text',
    hover: 'hover:text-org-kt-text',
    linie: 'decoration-org-kt',
  },
  gt: {
    slug: 'genclik-teskilati',
    logo: LOGOS.gt,
    band: 'bg-org-gt',
    rahmen: 'border-org-gt',
    tint: 'bg-org-gt-toenung',
    ink: 'text-org-gt-text',
    hover: 'hover:text-org-gt-text',
    linie: 'decoration-org-gt',
  },
  kgt: {
    slug: 'kadin-genclik-teskilati',
    logo: LOGOS.kgt,
    band: 'bg-org-kgt',
    rahmen: 'border-org-kgt',
    tint: 'bg-org-kgt-toenung',
    ink: 'text-org-kgt-text',
    hover: 'hover:text-org-kgt-text',
    linie: 'decoration-org-kgt',
  },
};

/**
 * OrgCard (design/OrgCard.dc.html, Blatt C08): Karte einer Organisation mit Akzentband, Logo, Name als Link,
 * Kurzbezeichnung, Beschreibung und Pfeil. Die ganze Karte führt zur Organisationsseite (::after wie EventCard).
 * Namen und Kurzbezeichnungen aus messages (karten.orgName_*, karten.org_*); die Beschreibung hat einen Standardtext.
 */
export async function OrgCard({ org, desc }: { org: OrgKuerzel; desc?: string }) {
  const [t, tk] = await Promise.all([getTranslations('karten'), getTranslations('orgKarte')]);
  const stil = ORG[org];
  const name = t(`orgName_${org}`);
  const beschreibung = desc?.trim() ? desc : tk('beschreibungStandard');
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-lg border border-linie bg-weiss text-18 leading-normal shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:shadow-s2 motion-reduce:transition-none">
      <div aria-hidden className={cn('h-1.5', stil.band)} />
      <div className={cn('flex flex-1 flex-col gap-3 p-6', stil.tint)}>
        <span className={cn('flex self-start rounded-lg border-2 bg-weiss p-1.5', stil.rahmen)}>
          <Bild src={stil.logo} alt="" width={40} height={40} className="size-10" />
        </span>
        <h3 className="text-24 leading-tight text-balance break-words">
          <Link
            href={{ pathname: '/organisationen/[organisation]', params: { organisation: stil.slug } }}
            lang="tr"
            aria-label={tk('linkKontext', { sichtbar: name, titel: beschreibung })}
            className={cn(
              'text-tinte underline underline-offset-5 after:absolute after:inset-0 after:rounded-lg after:content-[""]',
              stil.linie,
              stil.hover,
            )}
          >
            {name}
          </Link>
        </h3>
        <span className={cn('text-16 font-bold', stil.ink)}>{t(`org_${org}`)}</span>
        <p className="text-16 text-tinte-2">{beschreibung}</p>
        <span aria-hidden className={cn('mt-auto flex', stil.ink)}>
          <ArrowRight aria-hidden className="size-5" />
        </span>
      </div>
    </article>
  );
}
