'use client';

import {
  Bold,
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
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

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

/** Knöpfe mindestens 48 px hoch und breit (K-11), mit sichtbarer Beschriftung; Umschalter melden `aria-pressed`. */
const knopf =
  'min-h-12 min-w-12 px-3 text-16 aria-pressed:border-2 aria-pressed:border-gruen-700 aria-pressed:bg-gruen-100 aria-pressed:text-gruen-950';

function Werkzeug({
  icon: Icon,
  aktiv,
  deaktiviert,
  onKlick,
  children,
}: {
  icon: LucideIcon;
  aktiv?: boolean;
  deaktiviert?: boolean;
  onKlick: () => void;
  children: string;
}) {
  return (
    <Button type="button" variant="outline" className={knopf} aria-pressed={aktiv} disabled={deaktiviert} onClick={onKlick}>
      <Icon aria-hidden />
      {children}
    </Button>
  );
}

/**
 * Werkzeugleiste des Editors (ADR 0006): Absatz, Überschriften 2 und 3, Fett, Kursiv, Listen, Zitat, Link, Bild,
 * Rückgängig und Wiederholen. Ohne `zustand` (Editor lädt noch) sind alle Knöpfe deaktiviert.
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
  const knopfFuer = (aktion: WerkzeugAktion) => () => onAktion(aktion);

  return (
    <div
      role="group"
      aria-label={t('werkzeuge')}
      className="flex min-h-28 flex-wrap content-start gap-2 rounded-t-md border-b border-linie bg-papier p-2"
    >
      <Werkzeug icon={Pilcrow} aktiv={zustand?.absatz} deaktiviert={aus} onKlick={knopfFuer('absatz')}>
        {t('absatz')}
      </Werkzeug>
      <Werkzeug icon={Heading2} aktiv={zustand?.ueberschrift2} deaktiviert={aus} onKlick={knopfFuer('ueberschrift2')}>
        {t('ueberschrift2')}
      </Werkzeug>
      <Werkzeug icon={Heading3} aktiv={zustand?.ueberschrift3} deaktiviert={aus} onKlick={knopfFuer('ueberschrift3')}>
        {t('ueberschrift3')}
      </Werkzeug>
      <Werkzeug icon={Bold} aktiv={zustand?.fett} deaktiviert={aus} onKlick={knopfFuer('fett')}>
        {t('fett')}
      </Werkzeug>
      <Werkzeug icon={Italic} aktiv={zustand?.kursiv} deaktiviert={aus} onKlick={knopfFuer('kursiv')}>
        {t('kursiv')}
      </Werkzeug>
      <Werkzeug icon={List} aktiv={zustand?.aufzaehlung} deaktiviert={aus} onKlick={knopfFuer('aufzaehlung')}>
        {t('aufzaehlung')}
      </Werkzeug>
      <Werkzeug icon={ListOrdered} aktiv={zustand?.nummerierung} deaktiviert={aus} onKlick={knopfFuer('nummerierung')}>
        {t('nummerierung')}
      </Werkzeug>
      <Werkzeug icon={Quote} aktiv={zustand?.zitat} deaktiviert={aus} onKlick={knopfFuer('zitat')}>
        {t('zitat')}
      </Werkzeug>
      <Werkzeug icon={LinkIcon} deaktiviert={aus} onKlick={knopfFuer('linkSetzen')}>
        {t('linkSetzen')}
      </Werkzeug>
      <Werkzeug icon={Unlink} deaktiviert={aus || !zustand?.link} onKlick={knopfFuer('linkEntfernen')}>
        {t('linkEntfernen')}
      </Werkzeug>
      {bildMoeglich ? (
        <Werkzeug icon={ImagePlus} deaktiviert={aus} onKlick={knopfFuer('bildEinfuegen')}>
          {t('bildEinfuegen')}
        </Werkzeug>
      ) : null}
      {zustand?.bild ? (
        <Werkzeug icon={ImageOff} deaktiviert={aus} onKlick={knopfFuer('bildEntfernen')}>
          {t('bildEntfernen')}
        </Werkzeug>
      ) : null}
      <Werkzeug icon={Undo2} deaktiviert={aus || !zustand?.rueckgaengig} onKlick={knopfFuer('rueckgaengig')}>
        {t('rueckgaengig')}
      </Werkzeug>
      <Werkzeug icon={Redo2} deaktiviert={aus || !zustand?.wiederholen} onKlick={knopfFuer('wiederholen')}>
        {t('wiederholen')}
      </Werkzeug>
    </div>
  );
}
