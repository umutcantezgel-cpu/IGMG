'use client';

import { type KeyboardEvent, useId, useMemo, useState } from 'react';
import { allesGefunden, PAARE_START, type PaareZustand, rechteReihenfolge, waehlePaar } from '@/lib/lernapp/aufgaben/paare';
import { formatiere } from '@/lib/lernapp/format';
import { InhaltText, isoliert } from '../InhaltText';
import { naechsterIndex } from '../tastatur';
import type { AufgabenProps } from '../typen';

type Seite = 'links' | 'rechts';

/** Häkchen zeichnet sich (B-32 wie B-23, `linie-zeichnet`; reduziert sofort). */
function Haekchen() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-6 shrink-0">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" pathLength={1} className="linie-zeichnet" />
    </svg>
  );
}

/**
 * Übungstyp `paare` (PLAN §4): zwei Listen mit Schaltern (`aria-pressed`); erst einen Eintrag wählen (Tippen oder Enter),
 * dann sein Gegenstück. Kein Ziehen (WCAG 2.5.7). Gefundene Paare werden gedämpft und bekommen ein Häkchen; sie bleiben
 * fokussierbar (`aria-disabled`), damit der Fokus nicht verloren geht. Jede Wahl und jeder Versuch wird in der einen
 * Live-Region des Spielers gemeldet; sind alle Paare gefunden, prüft der Spieler sofort.
 */
export default function Paare({ aufgabe, texte, sprache, ziffern, gesperrt, gibAb, melde }: AufgabenProps<'paare'>) {
  const id = useId();
  const [z, setZ] = useState<PaareZustand>(PAARE_START);
  const rechts = useMemo(() => rechteReihenfolge(aufgabe), [aufgabe]);
  const links = useMemo(() => aufgabe.paare.map((_, i) => i), [aufgabe]);
  const t = texte.paare;
  const inhalt = (seite: Seite, i: number) => aufgabe.paare[i]?.[seite] ?? { text: '', sprache: 'de' as const };
  const f = (vorlage: string, werte: Record<string, string>) => formatiere(vorlage, werte, sprache, ziffern);

  function waehle(seite: Seite, i: number) {
    if (gesperrt) return;
    const neu = waehlePaar(z, seite, i);
    if (neu === z) return;
    setZ(neu);
    if (neu.versuche.length > z.versuche.length) {
      const [l, r] = neu.versuche.at(-1) as readonly [number, number];
      const werte = { links: isoliert(inhalt('links', l).text), rechts: isoliert(inhalt('rechts', r).text) };
      if (neu.fehler) melde(f(t.keinPaar, werte));
      else if (allesGefunden(neu, aufgabe.paare.length)) gibAb({ typ: 'paare', versuche: neu.versuche });
      else melde(f(t.gefunden, werte));
    } else if (neu.gewaehlt) {
      melde(f(t.gewaehlt, { text: isoliert(inhalt(neu.gewaehlt.seite, neu.gewaehlt.index).text) }));
    } else melde('');
  }

  function taste(e: KeyboardEvent<HTMLButtonElement>, liste: number[], pos: number) {
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    const n = naechsterIndex(pos, e.key, liste.length);
    if (n === null) return;
    e.preventDefault();
    const ziel = e.currentTarget.closest('ul')?.querySelectorAll('button')[n];
    ziel?.focus();
  }

  function spalte(seite: Seite, liste: number[]) {
    return (
      <ul aria-labelledby={`${id}-${seite}`} aria-describedby={`${id}-tasten`} className="flex flex-col gap-3">
        {liste.map((i, pos) => {
          const gefunden = z.gefunden.includes(i);
          const gewaehlt = z.gewaehlt?.seite === seite && z.gewaehlt.index === i;
          const fehler = z.fehler !== null && z.fehler[seite === 'links' ? 0 : 1] === i;
          const zustand = gefunden
            ? 'border-linie bg-sand text-tinte-2 opacity-60'
            : fehler
              ? 'border-fehler bg-fehler-toenung text-fehler'
              : gewaehlt
                ? 'border-gruen-700 bg-gruen-50 text-gruen-800'
                : 'border-rand bg-weiss hover:border-gruen-700';
          const partner = gefunden ? inhalt(seite === 'links' ? 'rechts' : 'links', i).text : '';
          return (
            <li key={i}>
              <button
                type="button"
                aria-pressed={gewaehlt}
                aria-disabled={gefunden || gesperrt}
                onClick={() => waehle(seite, i)}
                onKeyDown={(e) => taste(e, liste, pos)}
                className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border-2 px-4 py-2 text-start text-20 transition-colors duration-(--dauer-rueckmeldung) ${zustand}`}
              >
                <InhaltText inhalt={inhalt(seite, i)} />
                {gefunden ? (
                  <>
                    <Haekchen />
                    <span className="sr-only">
                      {f(
                        t.gefunden,
                        seite === 'links'
                          ? { links: inhalt('links', i).text, rechts: partner }
                          : { links: partner, rechts: inhalt('rechts', i).text },
                      )}
                    </span>
                  </>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p id={`${id}-tasten`} className="sr-only">
        {t.tasten}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <h3 id={`${id}-links`} className="text-16 font-bold text-tinte-2">
            {t.links}
          </h3>
          {spalte('links', links)}
        </div>
        <div className="flex flex-col gap-2">
          <h3 id={`${id}-rechts`} className="text-16 font-bold text-tinte-2">
            {t.rechts}
          </h3>
          {spalte('rechts', rechts)}
        </div>
      </div>
    </div>
  );
}
