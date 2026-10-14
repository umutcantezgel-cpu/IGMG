import { Calendar, Clock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { KUERZEL_TON } from '@/components/verwaltung/organisationTon';
import { KENNUNG } from '@/components/verwaltung/seiteninhalte-organisationen/bereiche';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { datumLang, isoZeit, zeitspanne } from '@/lib/i18n/format';
import { ORGANISATION_KUERZEL, type OrganisationKuerzel } from '@/lib/rechte/matrix';
import { cn } from '@/lib/utils';
import type { KommendeVeranstaltung, LetzteNeuigkeit } from '@/server/queries/verwaltung/uebersicht';

export type ListenTexte = {
  neuigkeiten: string;
  neuigkeitenLeer: string;
  veranstaltungen: string;
  veranstaltungenLeer: string;
  ganztaegig: string;
  status: Record<LetzteNeuigkeit['status'], string>;
};

/** Kommende Veranstaltung mit Organisations-Kürzel je Termin (DP-C1 H2). */
type KommendEintrag = KommendeVeranstaltung;

/**
 * Leerzustand einer Kurzliste (REFERENZ §2): Zustandsgrafik „leer“ und ein Satz. Dekorativ; der Satz trägt die Bedeutung.
 * Die Karte ist die Liste selbst, deshalb hier kein zweiter Rahmen. Ein Schritt weiter (Link) fehlt noch: siehe Bericht.
 */
function Leerzustand({ text }: { text: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
      <Zustandsgrafik art="leer" />
      <p className="text-tinte-2">{text}</p>
    </div>
  );
}

/** Kürzel-Plakette einer Organisation: sichtbar das Kürzel, Klartext als Tooltip und für Screenreader (VU-1). */
function Kuerzel({ org, name }: { org: OrganisationKuerzel; name: string }) {
  return (
    <span title={name} className={cn('shrink-0 rounded-pill px-3 py-0.5 text-16 font-bold', KUERZEL_TON[org])}>
      <span aria-hidden>{KENNUNG[org]}</span>
      <span className="sr-only">{name}</span>
    </span>
  );
}

/**
 * Kurzlisten der Übersicht (design/Dashboard.dc.html, Blatt V01): „Aktuelle Neuigkeiten“ und „Kommende Veranstaltungen“.
 * Eine Liste erscheint nur mit dem Leserecht ihres Bereichs (`null` = kein Recht). Nur Titel, Datum und Status,
 * keine Personendaten; Einträge sind nicht anklickbar (wie im Design). Unter den Veranstaltungen erklärt eine Legende
 * die vorkommenden Organisations-Kürzel (VU-1), die sonst nur über die Farbe unterschieden würden.
 */
export async function Listen({
  neuigkeiten,
  kommend,
  texte,
}: {
  neuigkeiten: LetzteNeuigkeit[] | null;
  kommend: KommendEintrag[] | null;
  texte: ListenTexte;
}) {
  if (neuigkeiten === null && kommend === null) return null;
  const to = await getTranslations('verwaltung.uebersicht');
  const orgName = (org: OrganisationKuerzel) => to(`organisation.${org}`);
  const vorkommend = ORGANISATION_KUERZEL.filter((org) => kommend?.some((z) => z.organisation === org));
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {neuigkeiten !== null ? (
        <section aria-labelledby="uebersicht-neuigkeiten" className="flex flex-col rounded-lg border border-linie bg-weiss p-5">
          <h2 id="uebersicht-neuigkeiten" className="text-24">
            {texte.neuigkeiten}
          </h2>
          {neuigkeiten.length === 0 ? (
            <Leerzustand text={texte.neuigkeitenLeer} />
          ) : (
            <ul className="mt-2 flex flex-col">
              {neuigkeiten.map((z) => (
                <li key={z.id} className="flex flex-col gap-1 border-t border-linie py-3">
                  <span className="font-bold break-words">{z.titel}</span>
                  <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <time dateTime={isoZeit(z.datum)} className="text-16 text-tinte-2">
                      {datumLang(z.datum, 'de')}
                    </time>
                    <span
                      className={cn(
                        'shrink-0 rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap',
                        z.status === 'veroeffentlicht' ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2',
                      )}
                    >
                      {texte.status[z.status]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
      {kommend !== null ? (
        <section aria-labelledby="uebersicht-veranstaltungen" className="flex flex-col rounded-lg border border-linie bg-weiss p-5">
          <h2 id="uebersicht-veranstaltungen" className="text-24">
            {texte.veranstaltungen}
          </h2>
          {kommend.length === 0 ? (
            <Leerzustand text={texte.veranstaltungenLeer} />
          ) : (
            <ul className="mt-2 flex flex-col">
              {kommend.map((z) => (
                <li key={z.id} className="flex items-start justify-between gap-3 border-t border-linie py-3">
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-bold break-words">{z.titel}</span>
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-16 text-tinte-2 tabular-nums">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar aria-hidden className="size-4 shrink-0" />
                        <time dateTime={isoZeit(z.beginn)}>{datumLang(z.beginn, 'de')}</time>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock aria-hidden className="size-4 shrink-0" />
                        <span className="whitespace-nowrap">{z.ganztaegig ? texte.ganztaegig : zeitspanne(z.beginn, z.ende, 'de')}</span>
                      </span>
                    </span>
                  </span>
                  {z.organisation ? <Kuerzel org={z.organisation} name={orgName(z.organisation)} /> : null}
                </li>
              ))}
            </ul>
          )}
          {vorkommend.length ? (
            <div className="mt-auto flex flex-col gap-2 border-t border-linie pt-3">
              <p className="text-16 font-bold text-tinte-2">{to('kuerzelLegende')}</p>
              <dl className="flex flex-wrap gap-x-5 gap-y-2 text-16 text-tinte-2">
                {vorkommend.map((org) => (
                  <div key={org} className="flex items-center gap-2">
                    <dt className={cn('rounded-pill px-2.5 py-0.5 font-bold', KUERZEL_TON[org])}>{KENNUNG[org]}</dt>
                    <dd>{orgName(org)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
