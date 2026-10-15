import { ArrowRight } from 'lucide-react';
import { Bild } from '../Bild';
import { Stern8 } from '@/components/website/Icons';
import { Link } from '@/i18n/link';
import { cn } from '@/lib/utils';
import { type Kuerzel, SLUG, STIL } from './stil';

/**
 * Karte einer Organisation im Abschnitt „Organisationen“ (Vorlage design/OrgCard.dc.html, Blatt C08):
 * Akzentband, Logo, Name als Link (ganze Karte klickbar), Kurzkennung und Beschreibung.
 * `aktuell` (H-E05): die Karte der Organisation, deren Seite offen ist. Sie ist nicht klickbar: Name als Text, ohne
 * Pfeil und ohne Überfahren, dafür die Pille „Diese Seite“ mit Achtstern.
 */
export function OrgKarte({
  kuerzel,
  name,
  kurz,
  beschreibung,
  aktuell = false,
  aktuellText,
}: {
  kuerzel: Kuerzel;
  name: string;
  kurz: string;
  beschreibung: string;
  aktuell?: boolean;
  aktuellText?: string;
}) {
  const s = STIL[kuerzel];
  return (
    <article
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-lg border border-linie bg-weiss shadow-s1',
        !aktuell && 'transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:shadow-s2',
      )}
    >
      <div aria-hidden className={cn('h-1.5', s.band)} />
      <div className={cn('flex flex-1 flex-col gap-3 p-6', s.tint)}>
        <span className={cn('flex self-start rounded-lg border-2 bg-weiss p-1.5', s.akzent)}>
          <Bild src={s.logo} alt="" width={40} height={40} className="size-10" />
        </span>
        <h3 className="text-24 leading-tight">
          {aktuell ? (
            name
          ) : (
            <Link
              href={{ pathname: '/organisationen/[organisation]', params: { organisation: SLUG[kuerzel] } }}
              className={cn(
                "text-tinte underline decoration-2 underline-offset-4 after:absolute after:inset-0 after:rounded-lg after:content-[''] hover:text-gruen-800",
                s.deko,
              )}
            >
              {name}
            </Link>
          )}
        </h3>
        <span className={cn('text-16 font-bold', s.ink)}>{kurz}</span>
        <p className="text-16 text-tinte-2">{beschreibung}</p>
        {aktuell ? (
          <span className="mt-auto inline-flex items-center gap-1.5 self-start rounded-pill border border-gruen-700 bg-weiss px-3 py-px text-16 leading-normal font-bold text-gruen-800">
            <Stern8 aria-hidden className="size-4" />
            {aktuellText}
          </span>
        ) : (
          <ArrowRight aria-hidden className={cn('mt-auto size-5', s.ink)} />
        )}
      </div>
    </article>
  );
}
