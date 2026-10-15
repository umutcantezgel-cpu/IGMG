import { CalendarDays, Inbox, Mail, Megaphone, Newspaper, Ticket } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
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
 * Handlungsmodule mit offener Arbeit (Zahl > 0) tragen eine grüne Kante; ohne Wert steht grau „keine“.
 * Zahlen in der Titelschrift (X-6): Die Textschrift Atkinson Hyperlegible Next hat eine durchgestrichene Null ohne
 * Feature `zero` zum Abschalten – groß gesetzt las sie sich wie „Ø“. Die Titelschrift setzt die Null ohne Strich.
 */
export async function Kennzahlen({ kacheln, titel }: { kacheln: KennzahlKachel[]; titel: string }) {
  const t = await getTranslations('verwaltung.uebersicht');
  const handlung = (k: KennzahlKachel) => (HANDLUNGS_MODULE as readonly string[]).includes(k.schluessel) && k.wert > 0;
  return (
    <section aria-label={titel} className="md:overflow-hidden md:rounded-lg md:border md:border-linie md:bg-weiss">
      {/* Ab 768 px zwei Spalten, ab 1240 px (menu) drei: sechs Kacheln als drei Reihen zu zwei bzw. zwei Reihen zu drei.
          Ab 768 px ein gerahmter Block mit 1-px-Linien zwischen den Feldern: die Liste rückt um 1 px nach oben und links,
          damit ihre Linien unter die Rahmenkante fallen (keine Doppellinie). */}
      <ul className="-mt-px -ml-px grid max-md:hidden md:grid-cols-2 menu:grid-cols-3">
        {kacheln.map((k) => {
          const Icon = ICONS[k.schluessel];
          return (
            <li key={k.schluessel} className="border-t border-l border-linie">
              <NextLink
                href={k.pfad}
                className={cn(
                  'flex h-full min-h-12 druck flex-col items-start gap-2 p-5 text-tinte no-underline -outline-offset-4 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-tinte',
                  handlung(k) && 'border-l-4 border-l-gruen-700',
                )}
              >
                <span className="flex items-center gap-2 font-bold text-tinte-2">
                  <Icon aria-hidden className="size-5 shrink-0" />
                  {k.label}
                </span>
                {k.wert > 0 ? (
                  <strong className="font-display text-48 leading-12 font-semibold text-tinte tabular-nums">{k.wert}</strong>
                ) : (
                  <strong className="font-display text-30 leading-12 font-semibold text-tinte-3">{t('keine')}</strong>
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
                  'flex min-h-14 druck items-center gap-3 px-4 py-2 text-tinte no-underline -outline-offset-4 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-tinte',
                  handlung(k) && 'border-l-4 border-l-gruen-700',
                )}
              >
                <Icon aria-hidden className="size-5 shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold">{k.label}</span>
                  <span className="text-16 text-tinte-2">{k.hinweis}</span>
                </span>
                {k.wert > 0 ? (
                  <strong className="font-display text-30 font-semibold tabular-nums">{k.wert}</strong>
                ) : (
                  <strong className="font-display text-20 font-semibold text-tinte-3">{t('keine')}</strong>
                )}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
