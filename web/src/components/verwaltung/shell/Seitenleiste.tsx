'use client';

import {
  CalendarDays,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  Image as Bild,
  Inbox,
  LayoutDashboard,
  Mail,
  Megaphone,
  Menu,
  Newspaper,
  Palette,
  ScrollText,
  Settings,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ModulIcon } from './module';

const ICONS: Record<ModulIcon, typeof Menu> = {
  uebersicht: LayoutDashboard,
  neuigkeiten: Newspaper,
  veranstaltungen: CalendarDays,
  ankuendigungen: Megaphone,
  seiteninhalte: FileText,
  kurse: GraduationCap,
  gebetszeiten: Clock,
  eingaenge: Inbox,
  postfach: Mail,
  tickets: Ticket,
  medien: Bild,
  benutzer: Users,
  audit: ScrollText,
  styleguide: Palette,
  startklar: ClipboardCheck,
  einstellungen: Settings,
};

export type SeitenleistenEintrag = {
  schluessel: string;
  label: string;
  pfad: string;
  icon: ModulIcon;
  zaehler?: number;
  zaehlerLabel?: string;
};

/**
 * Seitenleiste der Verwaltung (design/Dashboard.dc.html Z. 20–26): Kopf „Admin Dashboard“, Navigation mit Zählern.
 * Unter 900 px als aufklappbares Menü (aria-expanded), aktiver Eintrag mit aria-current="page".
 */
export function Seitenleiste({
  eintraege,
  texte,
}: {
  eintraege: SeitenleistenEintrag[];
  texte: { titel: string; untertitel: string; navName: string; oeffnen: string; schliessen: string };
}) {
  const pfad = usePathname();
  const [offen, setOffen] = useState(false);
  const aktiv = (p: string) => (p === '/verwaltung' ? pfad === p : pfad === p || pfad.startsWith(`${p}/`));
  return (
    <aside className="flex w-full flex-col gap-4 self-start rounded-lg border border-linie bg-weiss p-4 min-[900px]:sticky min-[900px]:top-4 min-[900px]:w-70 min-[900px]:shrink-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-20 font-bold">{texte.titel}</span>
          <span className="text-16 text-tinte-2">{texte.untertitel}</span>
        </div>
        <button
          type="button"
          aria-expanded={offen}
          aria-controls="verwaltung-navigation"
          onClick={() => setOffen((o) => !o)}
          className="inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-rand bg-weiss px-4 font-bold hover:bg-gruen-50 min-[900px]:hidden"
        >
          {offen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          <span>{offen ? texte.schliessen : texte.oeffnen}</span>
        </button>
      </div>
      <nav id="verwaltung-navigation" aria-label={texte.navName} className={cn(!offen && 'max-[899px]:hidden')}>
        <ul className="flex flex-col gap-1">
          {eintraege.map((e) => {
            const Icon = ICONS[e.icon];
            const istAktiv = aktiv(e.pfad);
            return (
              <li key={e.schluessel}>
                <NextLink
                  href={e.pfad}
                  aria-current={istAktiv ? 'page' : undefined}
                  onClick={() => setOffen(false)}
                  className={cn(
                    'flex min-h-12 items-center gap-3 rounded-md px-3.5 font-bold no-underline',
                    istAktiv
                      ? 'bg-gruen-700 text-weiss hover:bg-gruen-800 hover:text-weiss'
                      : 'text-tinte hover:bg-gruen-50 hover:text-tinte',
                  )}
                >
                  <Icon aria-hidden className="size-5 shrink-0" />
                  {/* Ein Wort wie „Veranstaltungen“ bleibt in einer Zeile: keine Trennung, Zähler rechts daneben (DP-C1 M1) */}
                  <span className="min-w-0 flex-1 hyphens-none">{e.label}</span>
                  {e.zaehler !== undefined ? (
                    <span
                      className={cn(
                        'inline-flex min-w-7 justify-center rounded-pill px-2 text-16 tabular-nums',
                        istAktiv ? 'bg-weiss text-gruen-800' : 'bg-sand text-tinte-2',
                      )}
                    >
                      <span aria-hidden>{e.zaehler}</span>
                      <span className="sr-only">{e.zaehlerLabel}</span>
                    </span>
                  ) : null}
                </NextLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
