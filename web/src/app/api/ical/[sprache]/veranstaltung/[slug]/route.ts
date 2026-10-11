import { routing } from '@/i18n/routing';
import { text } from '@/lib/i18n/inhalt';
import { alsSprache, kalenderAntwort } from '@/server/ical/veranstaltungen';
import { ladeVeranstaltung, ladeVeranstaltungsSlugs } from '@/server/queries/veranstaltungen';

/** Einzeltermin als .ics zum Speichern („Merken“, K-09). */
export async function generateStaticParams() {
  const slugs = await ladeVeranstaltungsSlugs();
  return routing.locales.flatMap((sprache) => slugs.map((slug) => ({ sprache, slug })));
}

export async function GET(_anfrage: Request, ctx: RouteContext<'/api/ical/[sprache]/veranstaltung/[slug]'>) {
  const { sprache: roh, slug } = await ctx.params;
  const sprache = alsSprache(roh);
  const v = sprache ? await ladeVeranstaltung(slug) : null;
  if (!sprache || !v) return new Response(null, { status: 404 });
  return kalenderAntwort(text(v.titel, sprache), [v], sprache, v.slug, true);
}
