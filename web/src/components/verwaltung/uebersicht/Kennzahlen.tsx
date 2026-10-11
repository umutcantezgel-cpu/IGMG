import { CalendarDays, Inbox, Mail, Megaphone, Newspaper, Ticket } from 'lucide-react';
import NextLink from 'next/link';
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
 * Zahl und kurzem Hinweis. Das Raster bricht auf dem Telefon in eine Spalte um.
 */
export function Kennzahlen({ kacheln, titel }: { kacheln: KennzahlKachel[]; titel: string }) {
  return (
    <section aria-label={titel}>
      {/* Karten ab 340 px, so viele Spalten wie passen (raster-karten, Kern K-005): auf dem Telefon eine Spalte. */}
      <ul className="grid raster-karten gap-4">
        {kacheln.map((k) => {
          const Icon = ICONS[k.schluessel];
          return (
            <li key={k.schluessel}>
              <NextLink
                href={k.pfad}
                className="flex h-full min-h-12 flex-col items-start gap-2 rounded-lg border border-linie bg-weiss p-5 text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:text-tinte hover:shadow-s2 active:scale-98"
              >
                <span className="flex items-center gap-2 font-bold text-tinte-2">
                  <Icon aria-hidden className="size-5 shrink-0" />
                  {k.label}
                </span>
                <strong className="text-48 leading-none font-bold tabular-nums">{k.wert}</strong>
                <span className="text-16 text-tinte-2">{k.hinweis}</span>
              </NextLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
