'use client';

import {
  Bold,
  ChevronDown,
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
import { useId, useRef, useState, type KeyboardEvent } from 'react';
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
  'min-h-12 min-w-12 px-3 text-16 aria-pressed:border-2 aria-pressed:border-gruen-700 aria-pressed:bg-gruen-100 aria-pressed:text-gruen-950 max-sm:size-12 max-sm:px-0';

/** Beschriftete Knöpfe in den Feldern unter der Zeile (Telefon). */
const knopfMitText =
  'min-h-12 px-3 text-16 aria-pressed:border-2 aria-pressed:border-gruen-700 aria-pressed:bg-gruen-100 aria-pressed:text-gruen-950';

/** Offener Knopf (Absatzart, „…“) wie ein gedrückter Umschalter. */
const knopfOffen = 'aria-expanded:border-2 aria-expanded:border-gruen-700 aria-expanded:bg-gruen-100 aria-expanded:text-gruen-950';

/**
 * Platz eines Befehls unter 640 px (SE-4): in der festen Zeile, in der Zeile nur bei genug Breite (sonst unter „…“),
 * in der Auswahl „Absatzart“ oder unter „…“. Ab 640 px stehen alle Befehle beschriftet in der Leiste.
 */
type Telefon = 'zeile' | 'breit' | 'art' | 'mehr';

type Eintrag = { aktion: WerkzeugAktion; icon: LucideIcon; aktiv?: boolean; aus?: boolean; telefon: Telefon };

/**
 * Breite der Leiste, ab der auch „Kursiv“ in die Zeile passt: Absatzart (64 px) + 5 × 48 px + 5 × 4 px Abstand + 8 px
 * Rand = 332 px. Im Baustein des Seiten-Editors stehen bei 390 px nur 296 px zur Verfügung.
 */
const IN_ZEILE: Record<Telefon, string> = {
  zeile: 'contents',
  breit: 'contents max-sm:hidden max-sm:@min-[21rem]:contents',
  art: 'contents max-sm:hidden',
  mehr: 'contents max-sm:hidden',
};

function Werkzeug({
  eintrag,
  label,
  onKlick,
  mitText = false,
}: {
  eintrag: Eintrag;
  label: string;
  onKlick: () => void;
  /** Auch auf dem Telefon beschriftet (Felder „Absatzart“ und „…“). */
  mitText?: boolean;
}) {
  const Icon = eintrag.icon;
  return (
    <Button
      type="button"
      variant="outline"
      className={mitText ? knopfMitText : knopf}
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

/** Absatzart an der Auswahl (für die Kurzanzeige auf dem Telefon). */
type Art = 'absatz' | 'ueberschrift2' | 'ueberschrift3' | 'zitat' | 'liste';

function artAus(zustand: WerkzeugZustand | null): Art {
  if (zustand?.ueberschrift2) return 'ueberschrift2';
  if (zustand?.ueberschrift3) return 'ueberschrift3';
  if (zustand?.zitat) return 'zitat';
  if (zustand?.aufzaehlung || zustand?.nummerierung) return 'liste';
  return 'absatz';
}

/**
 * Werkzeugleiste des Editors (ADR 0006): Absatz, Überschriften 2 und 3, Fett, Kursiv, Listen, Zitat, Link, Bild,
 * Rückgängig und Wiederholen. Ohne `zustand` (Editor lädt noch) sind alle Knöpfe deaktiviert.
 * Unter 640 px (SE-4) eine feste Zeile ohne Wischen: „Absatzart“ zeigt die Art an der Auswahl als Kurzwort und
 * öffnet darunter die Wahl Text/Überschrift 2/Überschrift 3; dann Fett, (Kursiv, wenn Platz ist), Aufzählung, Link
 * und „…“ mit allen übrigen Befehlen als beschriftete Zeile darunter. Es ist immer nur eines der beiden Felder offen.
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
  const [offen, setOffen] = useState<'art' | 'mehr' | null>(null);
  const artKnopf = useRef<HTMLButtonElement>(null);
  const mehrKnopf = useRef<HTMLButtonElement>(null);

  const eintraege: Eintrag[] = [
    { aktion: 'absatz', icon: Pilcrow, aktiv: zustand?.absatz, aus, telefon: 'art' },
    { aktion: 'ueberschrift2', icon: Heading2, aktiv: zustand?.ueberschrift2, aus, telefon: 'art' },
    { aktion: 'ueberschrift3', icon: Heading3, aktiv: zustand?.ueberschrift3, aus, telefon: 'art' },
    { aktion: 'fett', icon: Bold, aktiv: zustand?.fett, aus, telefon: 'zeile' },
    { aktion: 'kursiv', icon: Italic, aktiv: zustand?.kursiv, aus, telefon: 'breit' },
    { aktion: 'aufzaehlung', icon: List, aktiv: zustand?.aufzaehlung, aus, telefon: 'zeile' },
    { aktion: 'nummerierung', icon: ListOrdered, aktiv: zustand?.nummerierung, aus, telefon: 'mehr' },
    { aktion: 'zitat', icon: Quote, aktiv: zustand?.zitat, aus, telefon: 'mehr' },
    { aktion: 'linkSetzen', icon: LinkIcon, aus, telefon: 'zeile' },
    { aktion: 'linkEntfernen', icon: Unlink, aus: aus || !zustand?.link, telefon: 'mehr' },
    ...(bildMoeglich ? [{ aktion: 'bildEinfuegen', icon: ImagePlus, aus, telefon: 'mehr' } satisfies Eintrag] : []),
    ...(zustand?.bild ? [{ aktion: 'bildEntfernen', icon: ImageOff, aus, telefon: 'mehr' } satisfies Eintrag] : []),
    { aktion: 'rueckgaengig', icon: Undo2, aus: aus || !zustand?.rueckgaengig, telefon: 'mehr' },
    { aktion: 'wiederholen', icon: Redo2, aus: aus || !zustand?.wiederholen, telefon: 'mehr' },
  ];
  const ausfuehren = (aktion: WerkzeugAktion) => () => onAktion(aktion);
  const art = artAus(zustand);
  const umschalten = (feld: 'art' | 'mehr') => setOffen((o) => (o === feld ? null : feld));
  /** Escape schließt das offene Feld und gibt den Fokus an seinen Knopf zurück. */
  const schliessenMitEscape = (ev: KeyboardEvent) => {
    if (ev.key !== 'Escape') return;
    (offen === 'art' ? artKnopf : mehrKnopf).current?.focus();
    setOffen(null);
  };

  return (
    <div role="group" aria-label={t('werkzeuge')} className="@container rounded-t-md border-b border-linie bg-papier">
      <div className="flex flex-wrap items-center gap-1 p-1 sm:min-h-28 sm:content-start sm:items-start sm:gap-2 sm:p-2">
        <Button
          ref={artKnopf}
          type="button"
          variant="outline"
          className={cn(
            'min-h-12 min-w-12 flex-1 flex-col gap-0 px-1.5 text-16 sm:hidden @min-[18rem]:flex-row @min-[18rem]:gap-0.5',
            knopfOffen,
          )}
          aria-expanded={offen === 'art'}
          aria-controls={`${basis}-art`}
          title={t('absatzartName', { kurz: t(`kurz.${art}`), art: t(`art.${art}`) })}
          disabled={aus}
          onClick={() => umschalten('art')}
        >
          <span aria-hidden>{t(`kurz.${art}`)}</span>
          <ChevronDown aria-hidden className="size-4" />
          <span className="sr-only">{t('absatzartName', { kurz: t(`kurz.${art}`), art: t(`art.${art}`) })}</span>
        </Button>
        {eintraege.map((e) => (
          <span key={e.aktion} className={IN_ZEILE[e.telefon]}>
            <Werkzeug eintrag={e} label={t(e.aktion)} onKlick={ausfuehren(e.aktion)} />
          </span>
        ))}
        <Button
          ref={mehrKnopf}
          type="button"
          variant="outline"
          className={cn('size-12 px-0 sm:hidden', knopfOffen)}
          aria-expanded={offen === 'mehr'}
          aria-controls={`${basis}-mehr`}
          title={t('mehr')}
          disabled={aus}
          onClick={() => umschalten('mehr')}
        >
          {offen === 'mehr' ? <X aria-hidden /> : <Ellipsis aria-hidden />}
          <span className="sr-only">{t('mehr')}</span>
        </Button>
      </div>
      <div
        id={`${basis}-art`}
        hidden={offen !== 'art'}
        role="group"
        aria-label={t('absatzartWahl')}
        className="flex flex-wrap gap-2 border-t border-linie p-2 sm:hidden"
        onKeyDown={schliessenMitEscape}
      >
        {eintraege
          .filter((e) => e.telefon === 'art')
          .map((e) => (
            <Werkzeug
              key={e.aktion}
              eintrag={e}
              label={t(e.aktion)}
              mitText
              onKlick={() => {
                // Die gewählte Art bleibt (Überschriften schalten sonst zurück auf Text); der Editor bekommt den Fokus
                if (!e.aktiv) onAktion(e.aktion);
                else artKnopf.current?.focus();
                setOffen(null);
              }}
            />
          ))}
      </div>
      <div
        id={`${basis}-mehr`}
        hidden={offen !== 'mehr'}
        className="flex flex-wrap gap-2 border-t border-linie p-2 sm:hidden"
        onKeyDown={schliessenMitEscape}
      >
        {eintraege
          .filter((e) => e.telefon === 'mehr' || e.telefon === 'breit')
          .map((e) => (
            <span key={e.aktion} className={e.telefon === 'breit' ? 'contents @min-[21rem]:hidden' : 'contents'}>
              <Werkzeug eintrag={e} label={t(e.aktion)} onKlick={ausfuehren(e.aktion)} mitText />
            </span>
          ))}
      </div>
    </div>
  );
}
