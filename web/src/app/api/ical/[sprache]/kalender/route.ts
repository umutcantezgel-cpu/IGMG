import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { text } from '@/lib/i18n/inhalt';
import { klartext } from '@/lib/inhalt/tiptap';
import { besondereTageIcal } from '@/lib/kalender/ical';
import { folgemonate, tageImMonat } from '@/lib/kalender/raster';
import { adresse, basisUrl } from '@/lib/seo/metadaten';
import { heuteBerlin } from '@/lib/zeit/heute';
import { alsSprache } from '@/server/ical/veranstaltungen';
import { ladeBesondereTage } from '@/server/queries/kalender';

/**
 * Abo-Feed der besonderen Tage (AUFTRAG 3.10) je Sprache, statisch erzeugt wie der Veranstaltungsfeed (K-09):
 * 24 Monate ab dem laufenden. Vorläufige (berechnete) Tage tragen den Hinweis in Titel und Beschreibung.
 */
export function generateStaticParams() {
  return routing.locales.map((sprache) => ({ sprache }));
}

export async function GET(_anfrage: Request, ctx: RouteContext<'/api/ical/[sprache]/kalender'>) {
  const sprache = alsSprache((await ctx.params).sprache);
  if (!sprache) return new Response(null, { status: 404 });
  const [t, heute] = await Promise.all([getTranslations({ locale: sprache, namespace: 'kalender' }), heuteBerlin()]);
  const monate = folgemonate(heute.datum.slice(0, 7), 24);
  const bis = `${monate.at(-1)}-${String(tageImMonat(monate.at(-1)!)).padStart(2, '0')}`;
  const tage = await ladeBesondereTage(`${monate[0]}-01`, bis);
  const url = adresse('/kalender', sprache);
  const inhalt = besondereTageIcal(
    t('kalenderName'),
    tage.map((b) => ({
      uid: b.id,
      datum: b.datum,
      tage: b.tage,
      titel: b.schluessel ? t(`tage.${b.schluessel}`) : text(b.titel, sprache),
      beschreibung: b.beschreibung ? klartext(b.beschreibung[sprache] ?? b.beschreibung.de) || undefined : undefined,
      vorlaeufig: b.vorlaeufig,
      url,
    })),
    new URL(basisUrl()).hostname,
    { vorlaeufigTitel: t('vorlaeufig'), vorlaeufigBeschreibung: t('vorlaeufigLang') },
  );
  return new Response(inhalt, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="igmg-wetzlar-besondere-tage.ics"',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
