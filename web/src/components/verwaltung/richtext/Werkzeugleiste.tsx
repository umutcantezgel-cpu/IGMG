'use client';

import {
  Bold,
  Ellipsis,
  Heading2,
  Heading3,
  ImageOff,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Undo2,
  Unlink,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Befehle der Werkzeugleiste; der Editor führt sie aus (`RichTextEditorKern`). */
export type WerkzeugAktion =
  | 'absatz'
  | 'ueberschrift2'
  | 'ueberschrift3'
  | 'fett'
  | 'kursiv'
  | 'aufzaehlung'
  | 'nummerierung'
  | 'zitat'
  | 'linkSetzen'
  | 'linkEntfernen'
  | 'bildEinfuegen'
  | 'bildEntfernen'
  | 'rueckgaengig'
  | 'wiederholen';

/** Zustand an der Auswahl: aktive Blöcke und Marken, verfügbare Schritte zurück und vor. */
export type WerkzeugZustand = {
  absatz: boolean;
  ueberschrift2: boolean;
  ueberschrift3: boolean;
  fett: boolean;
  kursiv: boolean;
  aufzaehlung: boolean;
  nummerierung: boolean;
  zitat: boolean;
  link: boolean;
  bild: boolean;
  rueckgaengig: boolean;
  wiederholen: boolean;
};

/**
 * Knöpfe mindestens 48 px hoch und breit (K-11); Umschalter melden `aria-pressed`. Unter 640 px nur das Symbol
 * (Name bleibt für Screenreader, Tooltip über `title`), ab 640 px mit sichtbarer Beschriftung.
 */
const knopf =
  'min-h-12 min-w-12 px-3 text-16 aria-pressed:border-2 aria-pressed:border-gruen-700 aria-pressed:bg-gruen-100 aria-pressed:text-gruen-950 max-sm:size-12 max-sm:shrink-0 max-sm:snap-start max-sm:px-0';

type Eintrag = { aktion: WerkzeugAktion; icon: LucideIcon; aktiv?: boolean; aus?: boolean; selten?: boolean };

function Werkzeug({
  eintrag,
  label,
  onKlick,
  mitText = false,
}: {
  eintrag: Eintrag;
  label: string;
  onKlick: () => void;
  /** Auch auf dem Telefon beschriftet (Feld „Mehr“). */
  mitText?: boolean;
}) {
  const Icon = eintrag.icon;
  return (
    <Button
      type="button"
      variant="outline"
      className={mitText ? 'min-h-12 px-3 text-16 aria-pressed:border-2 aria-pressed:border-gruen-700 aria-pressed:bg-gruen-100' : knopf}
      aria-pressed={eintrag.aktiv}
      disabled={eintrag.aus}
      title={mitText ? undefined : label}
      onClick={onKlick}
    >
      <Icon aria-hidden />
      <span className={mitText ? undefined : 'max-sm:sr-only'}>{label}</span>
    </Button>
  );
}

/**
 * Werkzeugleiste des Editors (ADR 0006): Absatz, Überschriften 2 und 3, Fett, Kursiv, Listen, Zitat, Link, Bild,
 * Rückgängig und Wiederholen. Ohne `zustand` (Editor lädt noch) sind alle Knöpfe deaktiviert.
 * Unter 640 px (SE-2) eine einzige Zeile: häufige Befehle als Symbole, waagrecht wischbar mit Randverlauf, seltene
 * Befehle (Absatz, Zitat, Link entfernen, Bild, Wiederholen) unter „Mehr“ als beschriftete Zeile darunter.
 */
export function Werkzeugleiste({
  zustand,
  bildMoeglich,
  onAktion,
}: {
  zustand: WerkzeugZustand | null;
  bildMoeglich: boolean;
  onAktion: (aktion: WerkzeugAktion) => void;
}) {
  const t = useTranslations('verwaltung.editor');
  const aus = zustand === null;
  const basis = useId();
  const [mehrOffen, setMehrOffen] = useState(false);
  const [randRechts, setRandRechts] = useState(true);
  const leiste = useRef<HTMLDivElement>(null);
  const mehrKnopf = useRef<HTMLButtonElement>(null);

  // Randverlauf rechts nur, solange es dort noch Knöpfe gibt (Hinweis aufs Wischen, X-2/SE-2)
  useEffect(() => {
    const el = leiste.current;
    if (!el) return;
    const pruefe = () => setRandRechts(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    pruefe();
    el.addEventListener('scroll', pruefe, { passive: true });
    const beobachter = new ResizeObserver(pruefe);
    beobachter.observe(el);
    return () => {
      el.removeEventListener('scroll', pruefe);
      beobachter.disconnect();
    };
  }, []);

  const eintraege: Eintrag[] = [
    { aktion: 'absatz', icon: Pilcrow, aktiv: zustand?.absatz, aus, selten: true },
    { aktion: 'ueberschrift2', icon: Heading2, aktiv: zustand?.ueberschrift2, aus },
    { aktion: 'ueberschrift3', icon: Heading3, aktiv: zustand?.ueberschrift3, aus },
    { aktion: 'fett', icon: Bold, aktiv: zustand?.fett, aus },
    { aktion: 'kursiv', icon: Italic, aktiv: zustand?.kursiv, aus },
    { aktion: 'aufzaehlung', icon: List, aktiv: zustand?.aufzaehlung, aus },
    { aktion: 'nummerierung', icon: ListOrdered, aktiv: zustand?.nummerierung, aus },
    { aktion: 'zitat', icon: Quote, aktiv: zustand?.zitat, aus, selten: true },
    { aktion: 'linkSetzen', icon: LinkIcon, aus },
    { aktion: 'linkEntfernen', icon: Unlink, aus: aus || !zustand?.link, selten: true },
    ...(bildMoeglich ? [{ aktion: 'bildEinfuegen', icon: ImagePlus, aus, selten: true } satisfies Eintrag] : []),
    ...(zustand?.bild ? [{ aktion: 'bildEntfernen', icon: ImageOff, aus, selten: true } satisfies Eintrag] : []),
    { aktion: 'rueckgaengig', icon: Undo2, aus: aus || !zustand?.rueckgaengig },
    { aktion: 'wiederholen', icon: Redo2, aus: aus || !zustand?.wiederholen, selten: true },
  ];
  const ausfuehren = (aktion: WerkzeugAktion) => () => onAktion(aktion);

  return (
    <div role="group" aria-label={t('werkzeuge')} className="rounded-t-md border-b border-linie bg-papier">
      <div className="flex items-center gap-1 p-1 sm:min-h-28 sm:items-start sm:p-2">
        <div
          ref={leiste}
          className={cn(
            // Breite 0 + flex-1: die Knopfreihe trägt nichts zur Mindestbreite bei, und `relative` hält die absolut
            // gesetzten sr-only-Namen im wischbaren Bereich (sonst liefe die Seite auf 390 px seitlich über);
            // Innenabstand, damit der Fokusring im wischbaren Bereich nicht abgeschnitten wird
            'relative flex min-w-0 flex-1 gap-1 max-sm:w-0 max-sm:snap-x max-sm:[scrollbar-width:none] max-sm:overflow-x-auto max-sm:p-1 sm:flex-wrap sm:content-start sm:gap-2',
            randRechts && 'max-sm:mask-r-from-85%',
          )}
        >
          {eintraege.map((e) => (
            <span key={e.aktion} className={cn('contents', e.selten && 'max-sm:hidden')}>
              <Werkzeug eintrag={e} label={t(e.aktion)} onKlick={ausfuehren(e.aktion)} />
            </span>
          ))}
        </div>
        <Button
          ref={mehrKnopf}
          type="button"
          variant="outline"
          className="size-12 shrink-0 px-0 aria-expanded:border-2 aria-expanded:border-gruen-700 aria-expanded:bg-gruen-100 sm:hidden"
          aria-expanded={mehrOffen}
          aria-controls={`${basis}-mehr`}
          title={t('mehr')}
          disabled={aus}
          onClick={() => setMehrOffen((o) => !o)}
        >
          {mehrOffen ? <X aria-hidden /> : <Ellipsis aria-hidden />}
          <span className="sr-only">{t('mehr')}</span>
        </Button>
      </div>
      <div
        id={`${basis}-mehr`}
        hidden={!mehrOffen}
        className="flex flex-wrap gap-2 border-t border-linie p-2 sm:hidden"
        onKeyDown={(ev) => {
          if (ev.key === 'Escape') {
            setMehrOffen(false);
            mehrKnopf.current?.focus();
          }
        }}
      >
        {eintraege
          .filter((e) => e.selten)
          .map((e) => (
            <Werkzeug key={e.aktion} eintrag={e} label={t(e.aktion)} onKlick={ausfuehren(e.aktion)} mitText />
          ))}
      </div>
    </div>
  );
}
