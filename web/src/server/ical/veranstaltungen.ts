import 'server-only';
import { getTranslations } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { text } from '@/lib/i18n/inhalt';
import { basisUrl } from '@/lib/seo/metadaten';
import { erzeugeKalender, type IcalTermin } from '@/lib/termine/ical';
import type { VeranstaltungsDaten } from '@/server/queries/veranstaltungen';

/** Prüft die Sprache aus dem Pfad; unbekannt → null (404). */
export function alsSprache(wert: string): Locale | null {
  return (routing.locales as readonly string[]).includes(wert) ? (wert as Locale) : null;
}

/**
 * Wandelt Veranstaltungen in iCal-Termine (K-09): wiederkehrende mit erstem Beginn + RRULE + EXDATE,
 * Dauer aus dem nächsten Vorkommen. Beispielinhalte tragen den sichtbaren Vermerk im Titel (G-05).
 */
async function alsTermine(liste: readonly VeranstaltungsDaten[], sprache: Locale): Promise<IcalTermin[]> {
  const t = await getTranslations({ locale: sprache, namespace: 'allgemein' });
  const basis = basisUrl();
  return liste.map((v) => {
    const beginn = new Date(v.regel ? v.ersterBeginn : v.beginn);
    const dauer = v.ende ? new Date(v.ende).getTime() - new Date(v.beginn).getTime() : null;
    const titel = text(v.titel, sprache);
    return {
      uid: `veranstaltung-${v.id}`,
      titel: v.istBeispiel ? `[${t('beispielinhalt')}] ${titel}` : titel,
      beschreibung: text(v.kurztext, sprache) || undefined,
      ort: text(v.ort, sprache) || undefined,
      url: `${basis}${getPathname({ href: { pathname: '/veranstaltungen/[slug]', params: { slug: v.slug } }, locale: sprache })}`,
      beginn,
      ende: dauer !== null ? new Date(beginn.getTime() + dauer) : null,
      ganztaegig: v.ganztaegig,
      wiederholung: v.regel,
      ausnahmen: v.ausnahmen,
      aktualisiertAm: new Date(v.aktualisiertAm),
    };
  });
}

function domain(): string {
  return new URL(basisUrl()).hostname;
}

export async function kalenderAntwort(
  name: string,
  liste: readonly VeranstaltungsDaten[],
  sprache: Locale,
  dateiname: string,
  herunterladen = false,
): Promise<Response> {
  const inhalt = erzeugeKalender(name, await alsTermine(liste, sprache), domain());
  return new Response(inhalt, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `${herunterladen ? 'attachment' : 'inline'}; filename="${dateiname}.ics"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
