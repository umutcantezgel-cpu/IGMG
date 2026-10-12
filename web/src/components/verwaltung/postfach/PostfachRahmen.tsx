import { Plus } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { Button } from '@/components/ui/button';
import { datumKurz, uhrzeitNackt } from '@/lib/i18n/format';
import { cn } from '@/lib/utils';
import type { UnterhaltungZeile } from '@/server/queries/verwaltung/postfach';

/** Zeitpunkt in der Liste, Europe/Berlin: „So., 11. Okt., 08:30“. */
const zeitListe = (d: Date) => `${datumKurz(d, 'de')}, ${uhrzeitNackt(d, 'de')}`;

/**
 * Rahmen des Postfachs (Blatt V09): links die Unterhaltungen (ungelesene fett mit Zähler, aktive Zeile markiert),
 * rechts der Verlauf, der Leerzustand oder das Formular für eine neue Unterhaltung. Ab 900 px nebeneinander, darunter gestapelt.
 * `startseite` (nur die Nachrichten-Startseite): ohne Unterhaltungen eine Karte mit dem Weg zur ersten Unterhaltung statt des Rahmens.
 */
export async function PostfachRahmen({
  liste,
  aktivId,
  startseite,
  children,
}: {
  liste: UnterhaltungZeile[];
  aktivId?: string;
  startseite?: boolean;
  children: ReactNode;
}) {
  const [t, tk] = await Promise.all([getTranslations('verwaltung.postfach'), getTranslations('verwaltung.shell')]);
  return (
    <>
      <VerwaltungsKopf titel={t('titel')} kennung={tk('gruppe.kommunikation')} einleitung={t('untertitel')} />
      {startseite && liste.length === 0 ? (
        <ListenLeer
          text={t('leerListe')}
          aktion={
            <Button asChild>
              <NextLink href="/verwaltung/postfach/neu">
                <Plus aria-hidden />
                {t('neu')}
              </NextLink>
            </Button>
          }
        />
      ) : (
        /* Ab 900 px zwei Spalten im Raster 2 : 3 (fünf Spalten). Das liegt annähernd bei der bisherigen Flex-Aufteilung (Basis 300 px / 360 px, Wachstum 1 : 2). */
        <div className="flex flex-col overflow-hidden rounded-lg border border-linie bg-weiss verwaltung:grid verwaltung:min-h-130 verwaltung:grid-cols-5">
          <section
            aria-labelledby="postfach-unterhaltungen"
            className="flex min-w-0 flex-col verwaltung:col-span-2 verwaltung:border-r verwaltung:border-linie"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linie p-4">
              <h2 id="postfach-unterhaltungen" className="text-24">
                {t('unterhaltungen')}
              </h2>
              <Button asChild>
                <NextLink href="/verwaltung/postfach/neu">
                  <Plus aria-hidden />
                  {t('neu')}
                </NextLink>
              </Button>
            </div>
            {liste.length === 0 ? (
              <p className="p-4 text-tinte-2">{t('leerListe')}</p>
            ) : (
              <ul className="flex flex-col">
                {liste.map((z) => {
                  const aktiv = z.id === aktivId;
                  return (
                    <li key={z.id} className="border-b border-linie">
                      <NextLink
                        href={`/verwaltung/postfach/${z.id}`}
                        aria-current={aktiv ? 'page' : undefined}
                        className={cn(
                          'flex min-h-12 flex-col gap-1 border-l-4 px-4 py-3.5 text-tinte no-underline -outline-offset-4 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-tinte active:scale-98',
                          aktiv ? 'border-gruen-700 bg-gruen-50' : 'border-transparent',
                        )}
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <span className={cn('min-w-0 truncate', z.ungelesen > 0 ? 'font-bold' : 'font-normal')}>{z.betreff}</span>
                          <time dateTime={z.letzteNachrichtAm.toISOString()} className="shrink-0 text-16 text-tinte-2">
                            {zeitListe(z.letzteNachrichtAm)}
                          </time>
                        </span>
                        <span className="truncate text-16 text-tinte-2">
                          {z.mit.length ? t('mit', { namen: z.mit.join(', ') }) : t('ohneTeilnehmende')}
                        </span>
                        {z.vorschau ? <span className="truncate text-16 text-tinte-2">{z.vorschau}</span> : null}
                        {z.ungelesen > 0 ? (
                          <span className="inline-flex self-start rounded-pill bg-gruen-700 px-2.5 py-0.5 text-16 font-bold text-weiss">
                            {t('ungelesen', { anzahl: z.ungelesen })}
                          </span>
                        ) : null}
                      </NextLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <div className="flex min-w-0 flex-1 flex-col bg-papier verwaltung:col-span-3">{children}</div>
        </div>
      )}
    </>
  );
}
