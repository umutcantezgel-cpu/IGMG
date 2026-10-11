import { getTranslations } from 'next-intl/server';
import { ORGANISATION_KUERZEL, ORGANISATIONEN, routing, type OrganisationSlug } from '@/i18n/routing';
import { alsSprache, kalenderAntwort } from '@/server/ical/veranstaltungen';
import { ladeVeranstaltungen } from '@/server/queries/veranstaltungen';

/** Abo-Feed je Organisation (K-09): AT, KT, GT, KGT. */
export function generateStaticParams() {
  return routing.locales.flatMap((sprache) => ORGANISATIONEN.map((organisation) => ({ sprache, organisation })));
}

export async function GET(_anfrage: Request, ctx: RouteContext<'/api/ical/[sprache]/organisation/[organisation]'>) {
  const { sprache: roh, organisation } = await ctx.params;
  const sprache = alsSprache(roh);
  if (!sprache || !(ORGANISATIONEN as readonly string[]).includes(organisation)) return new Response(null, { status: 404 });
  const kuerzel = ORGANISATION_KUERZEL[organisation as OrganisationSlug];
  const tk = await getTranslations({ locale: sprache, namespace: 'karten' });
  const t = await getTranslations({ locale: sprache, namespace: 'veranstaltungen' });
  const liste = (await ladeVeranstaltungen()).filter((v) => v.organisation === kuerzel);
  return kalenderAntwort(t('kalenderOrg', { organisation: tk(`org_${kuerzel}`) }), liste, sprache, `igmg-wetzlar-${organisation}`);
}
