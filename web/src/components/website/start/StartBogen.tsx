'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { FastenbogenLive, type FastenbogenTexte } from '@/components/website/ramadan/FastenbogenLive';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import type { GebetszeitTag } from '@/lib/gebetszeiten/typen';
import { klassen } from '@/lib/klassen';
import { useJetzt } from '@/lib/zeit/useJetzt';
import { bogenArt } from './bogenwahl';
import { TagesbogenLive, type TagesbogenTexte } from './TagesbogenLive';

/** Texte des Fastenbogens auf der Startseite; die Datumszeilen teilt er mit dem Tagesbogen (`tageszeilen`). */
export type StartFastenTexte = {
  bogen: Omit<FastenbogenTexte, 'datum'>;
  vorschauTitel: string;
  vorschauHinweis: string;
  zeigen: string;
  zurueck: string;
  ramadan: string;
};

const TEXTLINK = 'inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline-offset-4 hover:underline';

/**
 * Bogen der Startseite (Vorführpfad Station 1): sonst der Tagesbogen (B-06), im Ramadan der Fastenbogen (B-20). Die
 * Seite ist statisch: Der Server liefert die Ramadan-Tage des Fensters (`ramadanImFenster`), der Browser wählt nach dem
 * heutigen Datum (`bogenArt`). Vor der Hydrierung gilt der Referenztag des Servers – so stimmen HTML und erster Render
 * überein; nur am ersten bzw. letzten Ramadan-Tag kann der Bogen nach dem Laden einmal wechseln, wenn die Seite älter ist.
 * Schalter `ramadan_vorschau` (Vorführung, in der Produktion aus): Ein Knopf unter dem Tagesbogen zeigt den Fastenbogen
 * mit den Zeiten von heute, als Vorschau gekennzeichnet; derselbe Knopf führt zurück (der Fokus bleibt auf ihm).
 * Ohne `fasten` (kein Ramadan im Fenster, Schalter aus) ist es genau der Tagesbogen wie bisher.
 */
export function StartBogen({
  tage,
  referenz,
  alleHref,
  ramadanHref,
  texte,
  fasten,
  ramadan,
  vorschau,
  className,
}: {
  tage: GebetszeitTag[];
  referenz: string;
  alleHref: string;
  ramadanHref: string;
  texte: TagesbogenTexte;
  fasten?: StartFastenTexte;
  ramadan: string[];
  vorschau: boolean;
  className?: string;
}) {
  const jetzt = useJetzt();
  const [gewaehlt, setGewaehlt] = useState(false);
  const heute = jetzt ? berlinerDatum(jetzt) : referenz;
  const art = fasten ? bogenArt({ heute, ramadan, vorschau, gewaehlt }) : 'tag';
  const mitKnopf = Boolean(fasten) && vorschau && art !== 'fasten';

  const bogen =
    art === 'tag' || !fasten ? (
      <TagesbogenLive className={mitKnopf ? undefined : className} tage={tage} referenz={referenz} alleHref={alleHref} texte={texte} />
    ) : (
      <FastenbogenLive
        key={art}
        tage={(art === 'fasten' ? tage.filter((t) => ramadan.includes(t.datum)) : tage).map(({ datum, imsak, aksam }) => ({
          datum,
          imsak,
          aksam,
        }))}
        referenz={heute}
        texte={{ ...fasten.bogen, titel: art === 'fasten' ? fasten.bogen.titel : fasten.vorschauTitel, datum: texte.tageszeilen ?? {} }}
        className={mitKnopf ? undefined : className}
      >
        {art === 'fasten-vorschau' ? <p className="text-16 text-tinte-2">{fasten.vorschauHinweis}</p> : null}
        <Link href={ramadanHref} className={TEXTLINK}>
          <span>{fasten.ramadan}</span>
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      </FastenbogenLive>
    );

  if (!mitKnopf || !fasten) return bogen;
  return (
    <div className={klassen('flex min-w-0 flex-col gap-2', className)}>
      {bogen}
      <button
        type="button"
        onClick={() => setGewaehlt((g) => !g)}
        className="inline-flex min-h-12 items-center gap-2 self-start rounded-md px-2 text-16 font-bold text-gruen-700 underline underline-offset-4 transition-colors duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98"
      >
        {gewaehlt ? fasten.zurueck : fasten.zeigen}
      </button>
    </div>
  );
}
