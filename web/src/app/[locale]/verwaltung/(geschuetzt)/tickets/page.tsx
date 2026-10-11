import { Eye, Plus } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { PILLE, PRIORITAET_TON, STATUS_TON, ticketNummer } from '@/components/verwaltung/tickets/anzeige';
import { TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { datumKurz, uhrzeit } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { lokaleTeile } from '@/lib/termine';
import { cn } from '@/lib/utils';
import { listenFilterSchema, TICKET_PRIORITAETEN, TICKET_STATUS, TICKET_TYPEN } from '@/lib/validierung/ticket';
import { ladeTicketListe } from '@/server/queries/verwaltung/tickets';

const feld = 'min-h-12 rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte';

/**
 * Verwaltung › Tickets (V10): Liste mit Filtern nach Status, Priorität und Typ über Suchparameter (GET-Formular wie im
 * Audit-Log). Keine Kontaktangaben in der Liste (G-07). Die Organisationsredaktion sieht nur Tickets ihrer Organisation
 * oder ohne Organisation (K-06); das setzt die Abfrage durch.
 */
export default async function TicketsVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/tickets'>) {
  const a = await verlangeSeitenRecht('ticket.lesen');
  const filter = listenFilterSchema.parse(await searchParams);
  const [t, zeilen] = await Promise.all([getTranslations('verwaltung.tickets'), ladeTicketListe(filter, a)]);
  const filterAktiv = Boolean(filter.status || filter.prioritaet || filter.typ);
  const darfAnlegen = darf(a.rollen, 'ticket.anlegen');

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-display-2">{t('titel')}</h1>
          <p className="max-w-[70ch] text-pretty text-tinte-2">{t('einleitung')}</p>
        </div>
        {darfAnlegen ? (
          <Button asChild>
            <NextLink href="/verwaltung/tickets/neu">
              <Plus aria-hidden />
              {t('neu')}
            </NextLink>
          </Button>
        ) : null}
      </div>

      <form
        method="get"
        action="/verwaltung/tickets"
        aria-label={t('filter.titel')}
        className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-4"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex min-w-0 flex-col gap-1 text-16 font-bold">
            {t('filter.status')}
            <select name="status" defaultValue={filter.status ?? ''} className={cn(feld, 'w-full')}>
              <option value="">{t('filter.alle')}</option>
              {TICKET_STATUS.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-16 font-bold">
            {t('filter.prioritaet')}
            <select name="prioritaet" defaultValue={filter.prioritaet ?? ''} className={cn(feld, 'w-full')}>
              <option value="">{t('filter.alle')}</option>
              {TICKET_PRIORITAETEN.map((p) => (
                <option key={p} value={p}>
                  {t(`prioritaet.${p}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-16 font-bold">
            {t('filter.typ')}
            <select name="typ" defaultValue={filter.typ ?? ''} className={cn(feld, 'w-full')}>
              <option value="">{t('filter.alle')}</option>
              {TICKET_TYPEN.map((y) => (
                <option key={y} value={y}>
                  {t(`typ.${y}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button type="submit" variant="outline">
            {t('filter.absenden')}
          </Button>
          <Button asChild variant="link" className="min-h-12">
            <NextLink href="/verwaltung/tickets">{t('filter.zuruecksetzen')}</NextLink>
          </Button>
        </div>
      </form>

      {/* Die Zählzeile nur bei Treffern; der Leerzustand steht darunter (DP-C1 N2) */}
      {zeilen.length > 0 ? (
        <p className="text-16 text-tinte-2 tabular-nums" role="status">
          {t('anzahl', { anzahl: zeilen.length })}
        </p>
      ) : null}

      {zeilen.length === 0 ? (
        <p className="rounded-lg border border-linie bg-weiss p-6 text-tinte-2">{filterAktiv ? t('leerMitFilter') : t('leer')}</p>
      ) : (
        <TabellenRahmen beschriftung={t('tabelle')}>
          <table className="w-full min-w-[56rem] border-collapse text-left">
            <caption className="sr-only">{t('tabelle')}</caption>
            <thead className="bg-sand">
              <tr>
                {(['titel', 'typ', 'prioritaet', 'status', 'organisation', 'erstellt', 'aktion'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zeilen.map((z) => {
                const erstellt = `${datumKurz(z.erstelltAm, 'de')} ${lokaleTeile(z.erstelltAm).jahr}, ${uhrzeit(z.erstelltAm, 'de')}`;
                return (
                  <tr key={z.id} className="border-t border-linie align-middle">
                    <th scope="row" className="px-4 py-3 text-left font-bold">
                      <span className="block text-16 font-normal text-tinte-2">{ticketNummer(z.nummer)}</span>
                      {z.titel}
                      {z.kategorie ? <span className="block text-16 font-normal text-tinte-2">{z.kategorie}</span> : null}
                    </th>
                    <td className="px-4 py-3">{t(`typ.${z.typ}`)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(PILLE, PRIORITAET_TON[z.prioritaet])}>{t(`prioritaet.${z.prioritaet}`)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(PILLE, STATUS_TON[z.status])}>{t(`status.${z.status}`)}</span>
                    </td>
                    <td className="px-4 py-3">{z.organisation ? z.organisation.toUpperCase() : t('allgemeinKurz')}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{erstellt}</td>
                    <td className="px-4 py-3">
                      <Button asChild variant="outline" size="icon">
                        <NextLink href={`/verwaltung/tickets/${z.id}`}>
                          <Eye aria-hidden />
                          <span className="sr-only">{t('aktionAnsehen', { titel: z.titel })}</span>
                        </NextLink>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
    </>
  );
}
