'use client';

import { type RefObject, useEffect, useState } from 'react';
import type { Auswertung } from '@/lib/lernapp/aufgaben/schema';
import { isoliert } from './InhaltText';
import { richtung, type SpielerTexte, type UiSprache } from './typen';

const STERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';

/** Achtstern, der sich von unten füllt (B-18; reduziert: sofort gefüllt). */
function Stern() {
  return (
    <svg aria-hidden viewBox="2.5 2.5 19 19" className="size-8 shrink-0 overflow-visible">
      <path d={STERN} className="fill-weiss stroke-gruen-700" strokeWidth={1.5} strokeLinejoin="round" />
      <path d={STERN} className="stern-fuellt fill-gruen-700" />
    </svg>
  );
}

export type RueckmeldungProps = {
  auswertung: Auswertung | null;
  texte: SpielerTexte['spieler'];
  /** Sprache der angezeigten Lösung (`lang`/`dir`, isoliert in der Zeile) */
  loesungSprache: UiSprache | null;
  /** die Aufgabe kommt am Ende der Lektion noch einmal */
  wirdWiederholt: boolean;
  /** Meldung während der Aufgabe (z. B. Paare), in derselben Live-Region */
  meldung: string;
  onWeiter: () => void;
  weiterRef: RefObject<HTMLButtonElement | null>;
};

const sichtbareHinweise = (a: Auswertung) => a.hinweise.filter((h) => h !== 'leer');
const zeigeLoesung = (a: Auswertung) => Boolean(a.loesung) && (a.urteil !== 'richtig' || sichtbareHinweise(a).length > 0);

/** Text für die Live-Region: Urteil, Hinweise, Lösung, Wiederholung. */
export function ansage(a: Auswertung, texte: SpielerTexte['spieler'], wirdWiederholt: boolean): string {
  return [
    texte[a.urteil],
    ...sichtbareHinweise(a).map((h) => texte.hinweis[h]),
    zeigeLoesung(a) ? `${texte.loesung} ${isoliert(a.loesung ?? '')}` : '',
    wirdWiederholt ? texte.spaeter : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Rückmeldeblatt (B-29): kommt von unten (24 px, Kurve „Eintritt“); bei „richtig“ und „Tippfehler“ füllt sich der
 * Achtstern, bei „noch nicht“ nur Farbe und Text ohne Bewegung (nur Deckkraft). Reduziert: nur Deckkraft. Der Fokus liegt
 * danach auf „Weiter“; das Blatt steht im Fluss am Ende des Spielers und verdeckt keinen Fokus.
 */
function Blatt({
  auswertung,
  texte,
  loesungSprache,
  wirdWiederholt,
  onWeiter,
  weiterRef,
}: Omit<RueckmeldungProps, 'meldung' | 'auswertung'> & { auswertung: Auswertung }) {
  const [da, setDa] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setDa(true));
    return () => cancelAnimationFrame(r);
  }, []);
  const angenommen = auswertung.urteil !== 'falsch';
  const hinweise = sichtbareHinweise(auswertung);
  const farbe = angenommen ? 'border-gruen-700 bg-gruen-50 text-gruen-800' : 'border-fehler bg-fehler-toenung text-fehler';
  const lage = da ? 'translate-y-0 opacity-100' : angenommen ? 'translate-y-6 opacity-0 motion-reduce:translate-y-0' : 'opacity-0';
  return (
    <div
      className={`flex flex-col gap-4 rounded-lg border-2 p-4 transition duration-(--dauer-wechsel) ease-eintritt md:p-6 ${farbe} ${lage}`}
    >
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-3 text-20 font-bold">
          {angenommen ? <Stern /> : null}
          {texte[auswertung.urteil]}
        </p>
        {hinweise.length ? (
          <ul className="flex list-disc flex-col gap-1 ps-6 text-18">
            {hinweise.map((h) => (
              <li key={h}>{texte.hinweis[h]}</li>
            ))}
          </ul>
        ) : null}
        {zeigeLoesung(auswertung) ? (
          <p className="text-18">
            {texte.loesung}{' '}
            <bdi lang={loesungSprache ?? undefined} dir={loesungSprache ? richtung(loesungSprache) : undefined} className="font-bold">
              {auswertung.loesung}
            </bdi>
          </p>
        ) : null}
        {wirdWiederholt ? <p className="text-16">{texte.spaeter}</p> : null}
      </div>
      <button
        ref={weiterRef}
        type="button"
        onClick={onWeiter}
        className="min-h-12 druck self-end rounded-pill bg-gruen-700 px-8 font-bold text-weiss hover:bg-gruen-800"
      >
        {texte.weiter}
      </button>
    </div>
  );
}

/**
 * Rückmeldung mit der einen Live-Region des Spielers (KERN §8): Sie steht immer im DOM und trägt die Ansage nach dem
 * Prüfen bzw. die Meldung während der Aufgabe. Das sichtbare Blatt zeigt dasselbe mit „Weiter“.
 */
export function Rueckmeldung({ auswertung, meldung, ...rest }: RueckmeldungProps) {
  return (
    <div className="sticky bottom-0 flex flex-col gap-3 bg-papier pb-4">
      <p role="status" className="sr-only">
        {auswertung ? ansage(auswertung, rest.texte, rest.wirdWiederholt) : meldung}
      </p>
      {auswertung ? (
        <Blatt key={`${auswertung.urteil}:${auswertung.loesung}:${auswertung.hinweise.join()}`} auswertung={auswertung} {...rest} />
      ) : meldung ? (
        <p aria-hidden className="text-18 text-tinte-2">
          {meldung}
        </p>
      ) : null}
    </div>
  );
}
