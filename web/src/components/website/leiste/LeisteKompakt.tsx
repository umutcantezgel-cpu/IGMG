'use client';

import { ArrowRight, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import { berlinerDatum, naechstesGebet, restzeit } from '@/lib/gebetszeiten/naechstes';
import type { GebetszeitTag } from '@/lib/gebetszeiten/typen';
import { klassen } from '@/lib/klassen';
import { useJetzt } from '@/lib/zeit/useJetzt';
import type { LeisteTexte } from './LeisteLive';

/**
 * Kompakte PrayerTimesBar für Leseseiten (Sichtabnahme S-1, `/quran/[sure]`): eine Zeile „Nächstes Gebet · Name Zeit“
 * und der Weg zu allen Gebetszeiten – so steht der erste Vers auf dem Telefon im ersten Bild. Gleiche Rechnung wie
 * `LeisteLive` (Browser, zwischengespeicherte Zeiten, K-08), feste Höhe von 48 px (kein Sprung nach dem Einhängen,
 * K-12): Die Zeile bricht nie um, Hinweis und Link stehen rechts fest. Ohne Bewegung.
 */
export function LeisteKompakt({
  tage,
  referenz,
  alleHref,
  texte,
}: {
  tage: GebetszeitTag[];
  referenz: string;
  alleHref: string;
  texte: LeisteTexte;
}) {
  const jetzt = useJetzt();
  const datum = jetzt ? berlinerDatum(jetzt) : referenz;
  const index = Math.max(
    0,
    tage.findIndex((t) => t.datum === datum),
  );
  const heute = tage[index];
  const morgen = tage[index + 1] ?? null;
  if (!heute) return null;

  const naechstes = jetzt
    ? naechstesGebet({ datum: heute.datum, zeiten: heute }, morgen ? { datum: morgen.datum, zeiten: morgen } : null, jetzt, true)
    : null;
  const zeit = (z: string) => (texte.uhrSuffix ? `${z} Uhr` : z);
  const wert = naechstes ? `${texte.namen[naechstes.gebet]} ${zeit((naechstes.morgen ? morgen : heute)?.[naechstes.gebet] ?? '')}` : '';
  const rest = naechstes ? restzeit(naechstes.restMs) : null;
  const restText = rest ? `${rest.stunden ? `${rest.stunden}${texte.dauer.std} ` : ''}${rest.minuten}${texte.dauer.min}` : '';
  const restZeile = naechstes ? (naechstes.morgen ? texte.verbleibtMorgen : texte.verbleibt).replace('{zeit}', restText) : '';
  return (
    <aside aria-label={texte.label} className="bg-gruen-950 text-weiss">
      <div className="mx-auto flex min-h-12 max-w-(--container-inhalt) items-center gap-3 ps-4 pe-1 md:gap-4 md:px-8">
        <p className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-16 whitespace-nowrap sm:gap-2">
          <Clock aria-hidden className="size-4 shrink-0 text-gruen-100 max-sm:hidden" />
          <span className="text-gruen-100">{texte.naechstes}</span>
          <span aria-hidden className="text-gruen-100">
            ·
          </span>
          <span className={klassen('font-bold tabular-nums', !naechstes && 'invisible')}>{wert || '–'}</span>
          {restZeile ? <span className="min-w-0 truncate text-gruen-100 tabular-nums max-lg:hidden">· {restZeile}</span> : null}
        </p>
        {texte.hinweis ? (
          <span
            title={texte.hinweis}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-warnung-toenung p-1 text-16 font-bold text-warnung sm:px-2.5 sm:py-0.5"
          >
            <Info aria-hidden className="size-4" />
            <span className="max-sm:sr-only">{texte.hinweis}</span>
          </span>
        ) : null}
        <Link
          href={alleHref}
          aria-label={texte.alle}
          className="inline-flex min-h-12 min-w-12 shrink-0 druck items-center justify-center gap-2 rounded-md font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss md:px-3"
        >
          <span aria-hidden className="max-md:hidden">
            {texte.alle}
          </span>
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      </div>
    </aside>
  );
}
