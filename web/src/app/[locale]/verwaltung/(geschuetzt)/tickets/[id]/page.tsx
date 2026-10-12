import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Meldung } from '@/components/verwaltung/Meldung';
import { KommentarFormular } from '@/components/verwaltung/tickets/KommentarFormular';
import { PILLE, PRIORITAET_TON, STATUS_TON, ticketNummer } from '@/components/verwaltung/tickets/anzeige';
import { StatusFormular } from '@/components/verwaltung/tickets/StatusFormular';
import { datumKurz, uhrzeit } from '@/lib/i18n/format';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { lokaleTeile } from '@/lib/termine';
import { cn } from '@/lib/utils';
import { TICKET_PRIORITAETEN, TICKET_STATUS } from '@/lib/validierung/ticket';
import { aendereTicket, kommentiereTicket } from '@/server/actions/tickets';
import { darfBearbeiten, darfKommentieren, ladeTicketDetail } from '@/server/queries/verwaltung/tickets';

const karte = 'flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6';

const zeitpunkt = (d: Date) => `${datumKurz(d, 'de')} ${lokaleTeile(d).jahr}, ${uhrzeit(d, 'de')}`;

/**
 * Verwaltung › Ticket (V10): Angaben, Verlauf der Kommentare, Kommentar, Status und Priorität. Kontaktangaben der
 * meldenden Person nur mit `ticket.bearbeiten`; jeder Abruf steht im Audit-Log (G-07). Unbekannte oder fremde Tickets
 * sind nicht gefunden, damit nichts über ihr Dasein verrät.
 */
export default async function TicketDetail({ params, searchParams }: PageProps<'/[locale]/verwaltung/tickets/[id]'>) {
  const a = await verlangeSeitenRecht('ticket.lesen');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const d = await ladeTicketDetail(id, a);
  if (!d) notFound();
  const t = await getTranslations('verwaltung.tickets');
  const aendern = darfBearbeiten(a, d.organisation);
  const kommentieren = darfKommentieren(a, d.organisation);
  const melder = d.melder;
  const organisation = d.organisation ? d.organisation.toUpperCase() : t('allgemeinKurz');
  const stati = TICKET_STATUS.map((s) => ({ wert: s, label: t(`status.${s}`) }));
  const prioritaeten = TICKET_PRIORITAETEN.map((p) => ({ wert: p, label: t(`prioritaet.${p}`) }));

  return (
    <>
      <NextLink
        href="/verwaltung/tickets"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>

      <div className="flex flex-col gap-3">
        <p className="text-16 text-tinte-2">
          {ticketNummer(d.nummer)} · {t(`typ.${d.typ}`)} · {organisation}
        </p>
        <h1 className="text-30 break-words md:text-36">{d.titel}</h1>
        <div className="flex flex-wrap gap-2">
          <span className={cn(PILLE, PRIORITAET_TON[d.prioritaet])}>{t(`prioritaet.${d.prioritaet}`)}</span>
          <span className={cn(PILLE, STATUS_TON[d.status])}>{t(`status.${d.status}`)}</span>
        </div>
      </div>

      {sp.angelegt === '1' ? <Meldung art="erfolg">{t('angelegt')}</Meldung> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="ticket-beschreibung" className={karte}>
            <h2 id="ticket-beschreibung" className="text-24">
              {t('detail.beschreibung')}
            </h2>
            {d.beschreibung ? (
              <p className="break-words whitespace-pre-line">{d.beschreibung}</p>
            ) : (
              <p className="text-tinte-2">
                {t(melder.art === 'keiner' ? 'detail.keineBeschreibung' : 'detail.beschreibungVerschluesselt')}
              </p>
            )}
          </section>

          <section aria-labelledby="ticket-melder" className={karte}>
            <h2 id="ticket-melder" className="text-24">
              {t('melder.titel')}
            </h2>
            {melder.art === 'keiner' ? <p className="text-tinte-2">{t('melder.keiner')}</p> : null}
            {melder.art === 'verborgen' ? <p className="text-tinte-2">{t('melder.verborgen')}</p> : null}
            {melder.art === 'unlesbar' ? <Meldung art="fehler">{t('melder.unlesbar')}</Meldung> : null}
            {melder.art === 'lesbar' ? (
              <>
                {melder.daten.betreff !== undefined || melder.daten.nachricht !== undefined ? (
                  <div className="flex flex-col gap-2 border-b border-linie pb-4">
                    <h3 className="font-text text-20 font-bold tracking-normal">{melder.daten.betreff || t('keinWert')}</h3>
                    <p className="break-words whitespace-pre-line">{melder.daten.nachricht || t('keinWert')}</p>
                  </div>
                ) : null}
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
                  <div className="contents">
                    <dt className="font-bold">{t('melder.vorname')}</dt>
                    <dd className="break-words">{melder.daten.vorname || t('keinWert')}</dd>
                  </div>
                  <div className="contents">
                    <dt className="font-bold">{t('melder.nachname')}</dt>
                    <dd className="break-words">{melder.daten.nachname || t('keinWert')}</dd>
                  </div>
                  <div className="contents">
                    <dt className="font-bold">{t('melder.telefon')}</dt>
                    <dd className="break-words">{melder.daten.telefon || t('keinWert')}</dd>
                  </div>
                  <div className="contents">
                    <dt className="font-bold">{t('melder.email')}</dt>
                    <dd className="break-words">{melder.daten.email || t('keinWert')}</dd>
                  </div>
                  <div className="contents">
                    <dt className="font-bold">{t('melder.rueckmeldung')}</dt>
                    <dd>
                      {melder.daten.rueckmeldung === undefined
                        ? t('keinWert')
                        : melder.daten.rueckmeldung
                          ? t('melder.rueckmeldungJa')
                          : t('melder.rueckmeldungNein')}
                    </dd>
                  </div>
                  <div className="contents">
                    <dt className="font-bold">{t('melder.rueckmeldeArt')}</dt>
                    <dd>{melder.daten.rueckmeldeArt ? t(`melder.artWerte.${melder.daten.rueckmeldeArt}`) : t('keinWert')}</dd>
                  </div>
                </dl>
                <p className="text-16 text-tinte-2">{t('melder.protokoll')}</p>
              </>
            ) : null}
          </section>

          <section aria-labelledby="ticket-verlauf" className={karte}>
            <h2 id="ticket-verlauf" className="text-24">
              {t('verlauf.titel')}
            </h2>
            {d.kommentare.length ? (
              <ol className="flex flex-col gap-3">
                {d.kommentare.map((k) => (
                  <li key={k.id} className="flex flex-col gap-1 border-b border-linie pb-3 last:border-0">
                    <span className="flex flex-wrap items-center gap-2 text-16 text-tinte-2">
                      <span className="font-bold text-tinte">{k.autorName ?? t('verlauf.unbekannt')}</span>
                      <time dateTime={k.erstelltAm.toISOString()}>{zeitpunkt(k.erstelltAm)}</time>
                      <span className={cn(PILLE, k.intern ? 'bg-sand text-tinte' : 'bg-info-toenung text-info')}>
                        {k.intern ? t('verlauf.intern') : t('verlauf.nichtIntern')}
                      </span>
                    </span>
                    <p className="break-words whitespace-pre-line">{k.text}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-tinte-2">{t('verlauf.leer')}</p>
            )}
            {kommentieren ? (
              <div className="flex flex-col gap-3 border-t border-linie pt-4">
                <h3 className="font-text text-20 font-bold tracking-normal">{t('kommentar.titel')}</h3>
                <KommentarFormular aktion={kommentiereTicket} id={d.id} />
              </div>
            ) : null}
          </section>
        </div>

        <div className="flex flex-col gap-6">
          {aendern ? (
            <section aria-labelledby="ticket-aenderung" className={karte}>
              <h2 id="ticket-aenderung" className="text-24">
                {t('aenderung.titel')}
              </h2>
              <StatusFormular
                aktion={aendereTicket}
                id={d.id}
                status={d.status}
                prioritaet={d.prioritaet}
                stati={stati}
                prioritaeten={prioritaeten}
              />
            </section>
          ) : (
            <Meldung art="info">{t('nurAdministration')}</Meldung>
          )}

          <section aria-labelledby="ticket-angaben" className={karte}>
            <h2 id="ticket-angaben" className="text-24">
              {t('detail.angaben')}
            </h2>
            <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] lg:grid-cols-1">
              <div className="contents">
                <dt className="font-bold">{t('detail.nummer')}</dt>
                <dd>{ticketNummer(d.nummer)}</dd>
              </div>
              <div className="contents">
                <dt className="font-bold">{t('detail.typ')}</dt>
                <dd>{t(`typ.${d.typ}`)}</dd>
              </div>
              <div className="contents">
                <dt className="font-bold">{t('detail.organisation')}</dt>
                <dd>{organisation}</dd>
              </div>
              <div className="contents">
                <dt className="font-bold">{t('detail.kategorie')}</dt>
                <dd className="break-words">{d.kategorie ?? t('detail.keineKategorie')}</dd>
              </div>
              <div className="contents">
                <dt className="font-bold">{t('detail.ersteller')}</dt>
                <dd className="break-words">{d.erstellerName ?? t('unbekannt')}</dd>
              </div>
              <div className="contents">
                <dt className="font-bold">{t('detail.zugewiesen')}</dt>
                <dd className="break-words">{d.zugewiesenName ?? t('nichtZugewiesen')}</dd>
              </div>
              <div className="contents">
                <dt className="font-bold">{t('detail.erstellt')}</dt>
                <dd>{zeitpunkt(d.erstelltAm)}</dd>
              </div>
              <div className="contents">
                <dt className="font-bold">{t('detail.aktualisiert')}</dt>
                <dd>{zeitpunkt(d.aktualisiertAm)}</dd>
              </div>
              {d.geschlossenAm ? (
                <div className="contents">
                  <dt className="font-bold">{t('detail.geschlossen')}</dt>
                  <dd>{zeitpunkt(d.geschlossenAm)}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
