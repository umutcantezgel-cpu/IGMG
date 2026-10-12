'use client';

import {
  CalendarDays,
  ClipboardCheck,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Image as Bild,
  Inbox,
  LayoutDashboard,
  Mail,
  Megaphone,
  Newspaper,
  Palette,
  ScrollText,
  Settings,
  Ticket,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMenue } from './MenueZustand';
import { HANDLUNGS_MODULE, type ModulGruppe, type ModulIcon } from './module';

const ICONS: Record<ModulIcon, LucideIcon> = {
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

const GRUPPEN: readonly ModulGruppe[] = ['inhalte', 'kommunikation', 'betrieb'];

const EINTRAG =
  'flex min-h-12 items-center gap-3 rounded-md border-l-4 px-3.5 font-bold no-underline transition duration-(--dauer-rueckmeldung) active:scale-98 verwaltung:min-h-11';

export type SeitenleistenEintrag = {
  schluessel: string;
  label: string;
  pfad: string;
  icon: ModulIcon;
  gruppe?: ModulGruppe;
  zaehler?: number;
  zaehlerLabel?: string;
};

/**
 * Seitenleiste der Verwaltung: Übersicht zuerst, dann die Gruppen Inhalte, Kommunikation und Betrieb (H-B05).
 * Unter 900 px ist sie nur sichtbar, wenn der Menüknopf der Kopfzeile sie geöffnet hat (aria-expanded am Knopf).
 * Aktiver Eintrag mit aria-current="page". Zähler nur mit Bedeutung: ab 1 und nie bei 0.
 */
export function Seitenleiste({
  eintraege,
  texte,
}: {
  eintraege: SeitenleistenEintrag[];
  texte: { navName: string; zurWebsite: string; gruppe: Record<ModulGruppe, string> };
}) {
  const pfad = usePathname();
  const { offen, setOffen } = useMenue();
  const navRef = useRef<HTMLDivElement>(null);
  const aktiv = (p: string) => (p === '/verwaltung' ? pfad === p : pfad === p || pfad.startsWith(`${p}/`));
  // Ab 900 px scrollt die Leiste bei kurzen Fenstern. Liegt der aktive Eintrag außerhalb, rückt er ohne Bewegung in die Mitte.
  useEffect(() => {
    const k = navRef.current;
    const a = k?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!k || !a || k.scrollHeight <= k.clientHeight) return;
    const kasten = k.getBoundingClientRect();
    const eintrag = a.getBoundingClientRect();
    if (eintrag.top >= kasten.top && eintrag.bottom <= kasten.bottom) return;
    const oben = eintrag.top - kasten.top + k.scrollTop;
    k.scrollTop = oben - (k.clientHeight - a.offsetHeight) / 2;
  }, [pfad]);
  const schliessen = () => setOffen(false);
  const uebersicht = eintraege.filter((e) => e.gruppe === undefined);
  const gruppen = GRUPPEN.map((g) => ({ gruppe: g, liste: eintraege.filter((e) => e.gruppe === g) })).filter((g) => g.liste.length > 0);
  const letzteGruppe = gruppen.length - 1;

  const zeile = (e: SeitenleistenEintrag) => {
    const Icon = ICONS[e.icon];
    const istAktiv = aktiv(e.pfad);
    const handlung = (HANDLUNGS_MODULE as readonly string[]).includes(e.schluessel);
    const zeigtZaehler = e.zaehler !== undefined && e.zaehler > 0;
    return (
      <li key={e.schluessel}>
        <NextLink
          href={e.pfad}
          aria-current={istAktiv ? 'page' : undefined}
          onClick={schliessen}
          className={cn(
            EINTRAG,
            istAktiv
              ? 'border-gruen-700 bg-gruen-50 text-gruen-800 hover:bg-gruen-100 hover:text-gruen-800'
              : 'border-transparent text-tinte hover:bg-gruen-50 hover:text-tinte',
          )}
        >
          <Icon aria-hidden className="size-5 shrink-0" />
          {/* Ein Wort wie „Veranstaltungen“ bleibt in einer Zeile: keine Trennung, Zähler rechts daneben (DP-C1 M1) */}
          <span className="min-w-0 flex-1 hyphens-none">{e.label}</span>
          {zeigtZaehler ? (
            <span
              className={cn(
                'inline-flex min-w-7 justify-center rounded-pill px-2 text-16 tabular-nums',
                istAktiv ? 'bg-weiss text-gruen-800' : handlung ? 'bg-gruen-700 text-weiss' : 'bg-sand text-tinte-2',
              )}
            >
              <span aria-hidden>{e.zaehler}</span>
              <span className="sr-only">{e.zaehlerLabel}</span>
            </span>
          ) : null}
        </NextLink>
      </li>
    );
  };

  // Letzter Eintrag, nur auf dem Telefon: die Rückkehr zur Website steht im Menü, weil die Kopfzeile dafür zu schmal ist
  const zurWebsite = (
    <li className="verwaltung:hidden">
      <NextLink
        href="/"
        prefetch={false}
        onClick={schliessen}
        className={cn(EINTRAG, 'border-transparent text-tinte hover:bg-gruen-50 hover:text-tinte')}
      >
        <ExternalLink aria-hidden className="size-5 shrink-0" />
        <span className="min-w-0 flex-1 hyphens-none">{texte.zurWebsite}</span>
      </NextLink>
    </li>
  );

  return (
    <aside
      className={cn(
        'flex w-full flex-col self-start verwaltung:sticky verwaltung:top-0 verwaltung:-mt-4 verwaltung:max-h-svh verwaltung:w-70 verwaltung:shrink-0 verwaltung:py-4',
        offen ? 'tritt-auf' : 'max-verwaltung:hidden',
      )}
    >
      <div
        ref={navRef}
        className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-4 verwaltung:min-h-0 verwaltung:overflow-y-auto verwaltung:overscroll-contain"
      >
        {/* Geöffnet tritt die Navigation mit B-03 auf (nur unter 900 px sichtbar); geschlossen bleibt sie ohne Bewegung. */}
        <nav id="verwaltung-navigation" aria-label={texte.navName}>
          <ul className="flex flex-col gap-1 verwaltung:gap-0">
            {uebersicht.map(zeile)}
            {gruppen.length === 0 ? zurWebsite : null}
          </ul>
          {gruppen.map(({ gruppe, liste }, index) => (
            <div key={gruppe} className="mt-3 border-t border-linie pt-3 verwaltung:mt-2 verwaltung:pt-2">
              <span id={`nav-gruppe-${gruppe}`} className="block px-3.5 pb-1 text-16 font-bold text-tinte-2 verwaltung:pb-0">
                {texte.gruppe[gruppe]}
              </span>
              <ul aria-labelledby={`nav-gruppe-${gruppe}`} className="flex flex-col gap-1 verwaltung:gap-0">
                {liste.map(zeile)}
                {index === letzteGruppe ? zurWebsite : null}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
