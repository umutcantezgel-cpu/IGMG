'use client';

import { useActionState, useEffect, useRef } from 'react';
import { CircleAlert, CircleCheck, Hand, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { LadeStern } from '@/components/website/Zustandsgrafik';
import { cn } from '@/lib/utils';
import { setzeKonzepthinweis, type KonzepthinweisZustand } from '@/server/actions/startklar';

/**
 * Liste der Startklar-Prüfungen je Bereich (Cockpit, AUFTRAG V-11). Offene Punkte zuerst (Fehler, Warnung, von Hand,
 * Hinweis), erledigte hinter „Erledigt (n)“. Texte und Zeilen kommen vom Server als Props (MUSTER §4).
 * Der Konzept-Hinweis wird hier geschaltet: Die Rückmeldung steht oberhalb der Gruppen, weil die Zeile nach dem
 * Speichern in „Erledigt“ wandern kann und dann nicht mehr sichtbar wäre.
 */
export type PruefStatus = 'fehler' | 'warnung' | 'manuell' | 'hinweis' | 'ok';

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

const STATUS_STIL: Record<PruefStatus, { Icon: LucideIcon; klasse: string }> = {
  fehler: { Icon: CircleAlert, klasse: 'border-fehler bg-fehler-toenung text-fehler' },
  warnung: { Icon: TriangleAlert, klasse: 'border-warnung bg-warnung-toenung text-warnung' },
  manuell: { Icon: Hand, klasse: 'border-info bg-info-toenung text-info' },
  hinweis: { Icon: Info, klasse: 'border-info bg-info-toenung text-info' },
  ok: { Icon: CircleCheck, klasse: 'border-gruen-700 bg-gruen-50 text-gruen-800' },
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
            <h2 id={`startklar-${g.schluessel}`} className="text-24 font-bold">
              {g.titel}
            </h2>
            <p className="text-tinte-2">{g.beschreibung}</p>
          </div>
          {g.offen.length === 0 ? <p className="text-tinte-2">{texte.offenLeer}</p> : null}
          {g.offen.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {g.offen.map((z) => (
                <Zeile key={z.id} z={z} texte={texte} absenden={absenden} laeuft={laeuft} />
              ))}
            </ul>
          ) : null}
          {g.erledigt.length > 0 ? (
            <details className="rounded-lg border border-linie bg-weiss">
              <summary className="min-h-12 cursor-pointer px-4 py-3 font-bold">{g.erledigtText}</summary>
              <ul className="flex flex-col gap-3 p-4 pt-0">
                {g.erledigt.map((z) => (
                  <Zeile key={z.id} z={z} texte={texte} absenden={absenden} laeuft={laeuft} />
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function Zeile({ z, texte, absenden, laeuft }: { z: PruefZeile; texte: PruefTexte; absenden: (fd: FormData) => void; laeuft: boolean }) {
  const { Icon, klasse } = STATUS_STIL[z.status];
  return (
    <li className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-20 font-bold">{z.titel}</h3>
        <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-16 font-bold', klasse)}>
          <Icon aria-hidden className="size-4 shrink-0" />
          {z.statusText}
        </span>
      </div>
      <p>{z.meldung}</p>
      {z.ort || z.aufwand ? (
        <dl className="flex flex-col gap-1 text-16 text-tinte-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
          {z.ort ? (
            <div className="flex flex-wrap gap-x-1.5">
              <dt className="font-bold">{texte.wo}</dt>
              <dd>{z.ort}</dd>
            </div>
          ) : null}
          {z.aufwand ? (
            <div className="flex flex-wrap gap-x-1.5">
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
