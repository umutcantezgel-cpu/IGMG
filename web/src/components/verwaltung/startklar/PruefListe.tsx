'use client';

import { useActionState, useEffect, useRef } from 'react';
import { ChevronDown, CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { LadeStern } from '@/components/website/Zustandsgrafik';
import { cn } from '@/lib/utils';
import { setzeKonzepthinweis, type KonzepthinweisZustand } from '@/server/actions/startklar';
import { type PruefStatus, STATUS_STIL } from '@/components/verwaltung/startklar/status';

export type { PruefStatus } from '@/components/verwaltung/startklar/status';

/**
 * Liste der Startklar-Prüfungen je Bereich (Cockpit, AUFTRAG V-11). Offene Punkte zuerst (Fehler, Warnung, von Hand,
 * Hinweis), erledigte im Aufklapper „Erledigt (n)“ am Ende der Karte. Je Bereich eine Karte mit Trennlinien (H-C08).
 * Texte und Zeilen kommen vom Server als Props (MUSTER §4).
 * Der Konzept-Hinweis wird hier geschaltet: Die Rückmeldung steht oberhalb der Gruppen, weil die Zeile nach dem
 * Speichern in „Erledigt“ wandern kann und dann nicht mehr sichtbar wäre.
 */
export type PruefZeile = {
  id: string;
  status: PruefStatus;
  statusText: string;
  titel: string;
  meldung: string;
  ort?: string;
  aufwand?: string;
  /** Nur beim Konzept-Hinweis: welchen Schalter die Zeile anbietet. */
  schalter?: 'einschalten' | 'ausschalten';
};

export type PruefGruppe = {
  schluessel: string;
  titel: string;
  beschreibung: string;
  offen: PruefZeile[];
  erledigt: PruefZeile[];
  erledigtText: string;
};

export type PruefTexte = {
  offenLeer: string;
  wo: string;
  aufwand: string;
  konzept: {
    einschalten: string;
    ausschalten: string;
    laeuft: string;
    eingeschaltet: string;
    ausgeschaltet: string;
    fehler: string;
    keinRecht: string;
  };
};

export function PruefListe({ gruppen, texte }: { gruppen: PruefGruppe[]; texte: PruefTexte }) {
  const [zustand, absenden, laeuft] = useActionState<KonzepthinweisZustand, FormData>(setzeKonzepthinweis, {});
  const rueckmeldung = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (zustand.gespeichert || zustand.fehler) rueckmeldung.current?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus();
  }, [zustand]);

  return (
    <div className="flex flex-col gap-8">
      <div ref={rueckmeldung} className="empty:hidden">
        {zustand.gespeichert ? (
          <Meldung art="erfolg" fokus>
            {zustand.wert ? texte.konzept.eingeschaltet : texte.konzept.ausgeschaltet}
          </Meldung>
        ) : null}
        {zustand.fehler ? (
          <Meldung art="fehler" fokus>
            {zustand.fehler === 'keinRecht' ? texte.konzept.keinRecht : texte.konzept.fehler}
          </Meldung>
        ) : null}
      </div>
      {gruppen.map((g) => (
        <section key={g.schluessel} aria-labelledby={`startklar-${g.schluessel}`} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={`startklar-${g.schluessel}`} className="text-24">
              {g.titel}
            </h2>
            <p className="text-tinte-2">{g.beschreibung}</p>
          </div>
          <div className="rounded-lg border border-linie bg-weiss">
            {g.offen.length === 0 ? (
              <p className="flex items-start gap-2 p-4 text-tinte-2 md:px-5">
                <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-gruen-700" />
                {texte.offenLeer}
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-linie">
                {g.offen.map((z) => (
                  <Zeile key={z.id} z={z} texte={texte} absenden={absenden} laeuft={laeuft} />
                ))}
              </ul>
            )}
            {g.erledigt.length > 0 ? (
              <details className="group border-t border-linie">
                <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 py-3 font-bold md:px-5">
                  <ChevronDown aria-hidden className="size-5 shrink-0 text-tinte-2 group-open:rotate-180" />
                  {g.erledigtText}
                </summary>
                <ul className="tritt-auf flex flex-col divide-y divide-linie border-t border-linie">
                  {g.erledigt.map((z) => (
                    <Zeile key={z.id} z={z} texte={texte} absenden={absenden} laeuft={laeuft} />
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}

function Zeile({ z, texte, absenden, laeuft }: { z: PruefZeile; texte: PruefTexte; absenden: (fd: FormData) => void; laeuft: boolean }) {
  const { Icon, klasse } = STATUS_STIL[z.status];
  return (
    <li className="flex flex-col gap-3 p-4 md:p-5">
      <div className="flex flex-col items-start gap-2 md:flex-row md:flex-wrap md:items-center">
        <h3 className="font-text text-20 font-bold tracking-normal">{z.titel}</h3>
        <span className={cn('inline-flex items-center gap-1.5 rounded-pill border px-3 py-0.5 text-16 font-bold', klasse)}>
          <Icon aria-hidden className="size-4 shrink-0" />
          {z.statusText}
        </span>
      </div>
      <p>{z.meldung}</p>
      {z.ort || z.aufwand ? (
        <dl className="grid raster-symbol gap-x-3 gap-y-1 text-16 text-tinte-2 md:flex md:flex-row md:flex-wrap md:gap-x-6">
          {z.ort ? (
            <div className="contents md:flex md:flex-wrap md:gap-x-1.5">
              <dt className="font-bold">{texte.wo}</dt>
              <dd>{z.ort}</dd>
            </div>
          ) : null}
          {z.aufwand ? (
            <div className="contents md:flex md:flex-wrap md:gap-x-1.5">
              <dt className="font-bold">{texte.aufwand}</dt>
              <dd>{z.aufwand}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      {z.schalter ? (
        <form action={absenden} noValidate>
          <input type="hidden" name="konzepthinweis" value={z.schalter === 'einschalten' ? 'true' : 'false'} />
          <Button type="submit" variant="secondary" disabled={laeuft}>
            {laeuft ? <LadeStern /> : null}
            {laeuft ? texte.konzept.laeuft : z.schalter === 'einschalten' ? texte.konzept.einschalten : texte.konzept.ausschalten}
          </Button>
        </form>
      ) : null}
    </li>
  );
}
