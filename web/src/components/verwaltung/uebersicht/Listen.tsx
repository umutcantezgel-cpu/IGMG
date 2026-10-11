import { datumLang, isoZeit, zeitspanne } from '@/lib/i18n/format';
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

/**
 * Kurzlisten der Übersicht (design/Dashboard.dc.html, Blatt V01): „Aktuelle Neuigkeiten“ und „Kommende Veranstaltungen“.
 * Eine Liste erscheint nur mit dem Leserecht ihres Bereichs (`null` = kein Recht). Nur Titel, Datum und Status,
 * keine Personendaten; Einträge sind nicht anklickbar (wie im Design).
 */
export function Listen({
  neuigkeiten,
  kommend,
  texte,
}: {
  neuigkeiten: LetzteNeuigkeit[] | null;
  kommend: KommendeVeranstaltung[] | null;
  texte: ListenTexte;
}) {
  if (neuigkeiten === null && kommend === null) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {neuigkeiten !== null ? (
        <section aria-labelledby="uebersicht-neuigkeiten" className="flex flex-col rounded-lg border border-linie bg-weiss p-5">
          <h2 id="uebersicht-neuigkeiten" className="text-20 font-bold">
            {texte.neuigkeiten}
          </h2>
          {neuigkeiten.length === 0 ? (
            <p className="mt-3 text-tinte-2">{texte.neuigkeitenLeer}</p>
          ) : (
            <ul className="mt-2 flex flex-col">
              {neuigkeiten.map((z) => (
                <li key={z.id} className="flex items-start justify-between gap-3 border-t border-linie py-3">
                  <span className="flex min-w-0 flex-col">
                    <span className="font-bold break-words">{z.titel}</span>
                    <time dateTime={isoZeit(z.datum)} className="text-16 text-tinte-2">
                      {datumLang(z.datum, 'de')}
                    </time>
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap',
                      z.status === 'veroeffentlicht' ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2',
                    )}
                  >
                    {texte.status[z.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
      {kommend !== null ? (
        <section aria-labelledby="uebersicht-veranstaltungen" className="flex flex-col rounded-lg border border-linie bg-weiss p-5">
          <h2 id="uebersicht-veranstaltungen" className="text-20 font-bold">
            {texte.veranstaltungen}
          </h2>
          {kommend.length === 0 ? (
            <p className="mt-3 text-tinte-2">{texte.veranstaltungenLeer}</p>
          ) : (
            <ul className="mt-2 flex flex-col">
              {kommend.map((z) => (
                <li key={z.id} className="flex flex-col gap-1 border-t border-linie py-3">
                  <span className="font-bold break-words">{z.titel}</span>
                  <span className="text-16 text-tinte-2">
                    <time dateTime={isoZeit(z.beginn)}>{datumLang(z.beginn, 'de')}</time>
                    {' · '}
                    {z.ganztaegig ? texte.ganztaegig : zeitspanne(z.beginn, z.ende, 'de')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
