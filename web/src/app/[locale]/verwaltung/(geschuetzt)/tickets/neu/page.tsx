import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { NeuesTicketFormular } from '@/components/verwaltung/tickets/NeuesTicketFormular';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { neuesTicket } from '@/server/actions/tickets';
import { anlageOptionen } from '../formular-optionen';

/** Verwaltung › Neues Ticket (V10): eigene Seite statt Dialog (wie bei den Veranstaltungen). Recht `ticket.anlegen`. */
export default async function NeuesTicketSeite() {
  const a = await verlangeSeitenRecht('ticket.anlegen');
  const [t, optionen] = await Promise.all([getTranslations('verwaltung.tickets'), anlageOptionen(a)]);
  return (
    <>
      <NextLink
        href="/verwaltung/tickets"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <div>
        <h1 className="text-display-2">{t('neu')}</h1>
        <p className="text-tinte-2">{t('neuEinleitung')}</p>
      </div>
      <NeuesTicketFormular
        aktion={neuesTicket}
        organisationen={optionen.organisationen}
        vorgabeOrganisation={optionen.vorgabeOrganisation}
        prioritaeten={optionen.prioritaeten}
      />
    </>
  );
}
