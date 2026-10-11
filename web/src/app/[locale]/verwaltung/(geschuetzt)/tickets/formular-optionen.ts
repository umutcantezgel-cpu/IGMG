import 'server-only';
import { getTranslations } from 'next-intl/server';
import { ORGANISATION_KUERZEL } from '@/lib/rechte/matrix';
import type { Angemeldet } from '@/lib/rechte/pruefe';
import { TICKET_PRIORITAETEN } from '@/lib/validierung/ticket';
import { ticketOrganisationen } from '@/server/queries/verwaltung/tickets';

/**
 * Auswahllisten des Anlagenformulars. Organisationen nur innerhalb der Grenze der Person (K-06); „Allgemein“ (ohne
 * Organisation) steht immer zur Wahl, weil Tickets ohne Organisation zum Bereich der Organisationsredaktion gehören.
 */
export async function anlageOptionen(a: Angemeldet) {
  const [tk, t] = await Promise.all([getTranslations('karten'), getTranslations('verwaltung.tickets')]);
  const filter = ticketOrganisationen(a);
  const orgs = ORGANISATION_KUERZEL.filter((o) => filter === null || filter.includes(o));
  return {
    organisationen: [
      { wert: '', label: t('allgemein') },
      ...orgs.map((o) => ({ wert: o, label: `${tk(`orgName_${o}`)} (${o.toUpperCase()})` })),
    ],
    /** Mit genau einer eigenen Organisation vorausgewählt, sonst „Allgemein“. */
    vorgabeOrganisation: filter !== null && filter.length === 1 ? filter[0] : '',
    prioritaeten: TICKET_PRIORITAETEN.map((p) => ({ wert: p, label: t(`prioritaet.${p}`) })),
  };
}
