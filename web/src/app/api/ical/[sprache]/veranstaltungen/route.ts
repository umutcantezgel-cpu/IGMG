import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { alsSprache, kalenderAntwort } from '@/server/ical/veranstaltungen';
import { ladeVeranstaltungen } from '@/server/queries/veranstaltungen';

/** Abo-Feed aller veröffentlichten Veranstaltungen (K-09), je Sprache. */
export function generateStaticParams() {
  return routing.locales.map((sprache) => ({ sprache }));
}

export async function GET(_anfrage: Request, ctx: RouteContext<'/api/ical/[sprache]/veranstaltungen'>) {
  const sprache = alsSprache((await ctx.params).sprache);
  if (!sprache) return new Response(null, { status: 404 });
  const t = await getTranslations({ locale: sprache, namespace: 'veranstaltungen' });
  return kalenderAntwort(t('kalenderName'), await ladeVeranstaltungen(), sprache, 'igmg-wetzlar-veranstaltungen');
}
