import { CalendarDays, Inbox, Mail, Megaphone, Newspaper, Ticket } from 'lucide-react';
import NextLink from 'next/link';
import { HANDLUNGS_MODULE } from '@/components/verwaltung/shell/module';
import { cn } from '@/lib/utils';
import type { KennzahlModul } from './sichtbarkeit';

const ICONS: Record<KennzahlModul, typeof Ticket> = {
  neuigkeiten: Newspaper,
  veranstaltungen: CalendarDays,
  ankuendigungen: Megaphone,
  eingaenge: Inbox,
  postfach: Mail,
  tickets: Ticket,
};

export type KennzahlKachel = { schluessel: KennzahlModul; pfad: string; label: string; wert: number; hinweis: string };

/**
 * Kennzahl-Kacheln der Übersicht (design/Dashboard.dc.html, Blatt V01): je Modul ein Link zum Modul mit Bezeichnung,
 * Zahl und kurzem Hinweis. Ab 768 px ein Raster aus Kacheln, auf dem Telefon eine Liste mit Trennlinien (eine Karte).
 * Handlungsmodule mit offener Arbeit (Zahl > 0) tragen eine grüne Kante; Zahl 0 steht grau und klein.
 */
export function Kennzahlen({ kacheln, titel }: { kacheln: KennzahlKachel[]; titel: string }) {
  const handlung = (k: KennzahlKachel) => (HANDLUNGS_MODULE as readonly string[]).includes(k.schluessel) && k.wert > 0;
  return (
    <section aria-label={titel}>
      {/* Karten ab 340 px, so viele Spalten wie passen (raster-karten, Kern K-005). */}
      <ul className="grid raster-karten gap-4 max-md:hidden">
        {kacheln.map((k) => {
          const Icon = ICONS[k.schluessel];
          return (
            <li key={k.schluessel}>
              <NextLink
                href={k.pfad}
                className={cn(
                  'flex h-full min-h-12 flex-col items-start gap-2 rounded-lg border border-linie bg-weiss p-5 text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:text-tinte hover:shadow-s2 active:scale-98',
                  handlung(k) && 'border-l-4 border-l-gruen-700',
                )}
              >
                <span className="flex items-center gap-2 font-bold text-tinte-2">
                  <Icon aria-hidden className="size-5 shrink-0" />
                  {k.label}
                </span>
                {k.wert > 0 ? (
                  <strong className="text-48 leading-none font-bold text-tinte tabular-nums">{k.wert}</strong>
                ) : (
                  <strong className="text-30 leading-none font-bold text-tinte-3 tabular-nums">{k.wert}</strong>
                )}
                <span className="text-16 text-tinte-2">{k.hinweis}</span>
              </NextLink>
            </li>
          );
        })}
      </ul>
      <ul className="flex flex-col divide-y divide-linie overflow-hidden rounded-lg border border-linie bg-weiss md:hidden">
        {kacheln.map((k) => {
          const Icon = ICONS[k.schluessel];
          return (
            <li key={k.schluessel}>
              <NextLink
                href={k.pfad}
                className={cn(
                  'flex min-h-14 items-center gap-3 px-4 py-2 text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-tinte active:scale-98',
                  handlung(k) && 'border-l-4 border-l-gruen-700',
                )}
              >
                <Icon aria-hidden className="size-5 shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold">{k.label}</span>
                  <span className="text-16 text-tinte-2">{k.hinweis}</span>
                </span>
                {k.wert > 0 ? (
                  <strong className="text-30 font-bold tabular-nums">{k.wert}</strong>
                ) : (
                  <strong className="text-30 font-bold text-tinte-3 tabular-nums">{k.wert}</strong>
                )}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
