import { Plus } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { datumKurz, uhrzeitNackt } from '@/lib/i18n/format';
import { cn } from '@/lib/utils';
import type { UnterhaltungZeile } from '@/server/queries/verwaltung/postfach';

/** Zeitpunkt in der Liste, Europe/Berlin: „So., 11. Okt., 08:30“. */
const zeitListe = (d: Date) => `${datumKurz(d, 'de')}, ${uhrzeitNackt(d, 'de')}`;

/**
 * Rahmen des Postfachs (Blatt V09): links die Unterhaltungen (ungelesene fett mit Zähler, aktive Zeile markiert),
 * rechts der Verlauf, der Leerzustand oder das Formular für eine neue Unterhaltung. Ab 900 px nebeneinander, darunter gestapelt.
 */
export async function PostfachRahmen({ liste, aktivId, children }: { liste: UnterhaltungZeile[]; aktivId?: string; children: ReactNode }) {
  const t = await getTranslations('verwaltung.postfach');
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-30 md:text-36">{t('titel')}</h1>
        <p className="text-tinte-2">{t('untertitel')}</p>
      </div>
      <div className="flex min-h-130 flex-col overflow-hidden rounded-lg border border-linie bg-weiss min-[900px]:flex-row">
        <section
          aria-labelledby="postfach-unterhaltungen"
          className="flex min-w-0 flex-col min-[900px]:flex-[1_1_300px] min-[900px]:border-r min-[900px]:border-linie"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linie p-4">
            <h2 id="postfach-unterhaltungen" className="text-24 font-semibold">
              {t('unterhaltungen')}
            </h2>
            <Button asChild variant="outline">
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
                        'flex min-h-12 flex-col gap-1 px-4 py-3.5 text-tinte no-underline hover:bg-gruen-50 hover:text-tinte',
                        aktiv && 'bg-gruen-50',
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
        <div className="flex min-w-0 flex-1 flex-col bg-papier min-[900px]:flex-[2_1_360px]">{children}</div>
      </div>
    </>
  );
}
