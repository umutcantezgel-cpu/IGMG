import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Zustandsgrafik, type Zustand } from '@/components/website/Zustandsgrafik';
import { Link } from '@/i18n/link';
import type { Ziel } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/**
 * Kleine Bausteine der Lernplattform-Seiten in „Mein Bereich“ (Lehrkraft, Eltern, Schüler): Zurück-Link, Leerzustand mit
 * Achtstern-Zustandsgrafik, Pillen und die Klassen der Knöpfe (≥ 48 px, Druck-Rückmeldung B-01, reduziert ohne).
 */
export const KNOPF_PRIMAER =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-gruen-700 px-5 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98 disabled:cursor-wait disabled:opacity-60 motion-reduce:active:scale-100';
export const KNOPF_SEKUNDAER =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98 disabled:opacity-60 motion-reduce:active:scale-100';
export const KNOPF_LEISE =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-rand bg-weiss px-4 font-bold text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:text-gruen-800 active:scale-98 motion-reduce:active:scale-100';
export const FELD = 'min-h-12 w-full rounded-md border-2 border-rand bg-weiss px-3 text-18';

export function ZurueckLink({ ziel, text }: { ziel: Ziel; text: string }) {
  return (
    <Link
      href={ziel}
      prefetch={false}
      className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline-offset-4 hover:underline print:hidden"
    >
      <ArrowLeft aria-hidden className="size-5" />
      {text}
    </Link>
  );
}

/** Ruhiger Leerzustand (K-008): Achtstern-Grafik und Text; ohne Rahmen, wenn er in einem Abschnitt steht. */
export function LeerHinweis({
  titel,
  text,
  art = 'leer',
  rahmen = false,
}: {
  titel?: string;
  text: string;
  art?: Zustand;
  rahmen?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-4', rahmen && 'rounded-lg border border-linie bg-weiss p-5 md:p-7')}>
      <Zustandsgrafik art={art} groesse={56} />
      <div className="flex min-w-0 flex-col gap-1">
        {titel ? <p className="text-20 font-bold">{titel}</p> : null}
        <p className="max-w-text text-pretty text-tinte-2">{text}</p>
      </div>
    </div>
  );
}

const TON = {
  gruen: 'bg-gruen-50 text-gruen-800',
  sand: 'bg-sand text-tinte-2',
  warnung: 'bg-warnung-toenung text-warnung',
  fehler: 'bg-fehler-toenung text-fehler',
  info: 'bg-info-toenung text-info',
} as const;

export function Pille({ ton = 'sand', children, className }: { ton?: keyof typeof TON; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap', TON[ton], className)}
    >
      {children}
    </span>
  );
}

/** Datumsmarke einer Terminzeile: Wochentag klein, Tag groß (Kalenderblatt ohne Bild). */
export function DatumsMarke({ tag, datum, hervor = false }: { tag: string; datum: string; hervor?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-14 shrink-0 flex-col items-center justify-center rounded-md border leading-tight',
        hervor ? 'border-gruen-700 bg-gruen-700 text-weiss' : 'border-linie bg-papier text-tinte',
      )}
    >
      <span className={cn('text-16', hervor ? 'text-gruen-100' : 'text-tinte-2')}>{tag}</span>
      <span className="text-20 font-bold tabular-nums">{datum}</span>
    </span>
  );
}
