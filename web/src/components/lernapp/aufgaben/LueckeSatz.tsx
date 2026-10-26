import type { ReactNode } from 'react';
import type { LueckeAufgabe } from '@/lib/lernapp/aufgaben/luecke';
import { richtung } from '../typen';

/**
 * Satz einer Lücke (`luecke`): sichtbar mit der Lücke (`luecke`: Anzeige der Wahl bzw. das Feld), für Screenreader mit „…“
 * unter `<id>-satz` (Beschreibung der Radiogruppe bzw. des Felds), darunter die Übersetzung als Hilfe. Gemeinsam für die
 * Wahl unter Optionen (`Luecke.tsx`) und das Feld (`LueckeFeld.tsx`).
 */
export function LueckeSatz({
  aufgabe,
  id,
  luecke,
  hilfe,
}: {
  aufgabe: Pick<LueckeAufgabe, 'vor' | 'nach' | 'sprache' | 'hilfe'>;
  id: string;
  luecke: ReactNode;
  /** Beschriftung der Übersetzung („Bedeutung:“) */
  hilfe: string;
}) {
  const dir = richtung(aufgabe.sprache);
  return (
    <div className="flex flex-col gap-3">
      <p
        lang={aufgabe.sprache}
        dir={dir}
        className={`rounded-lg bg-sand px-4 py-5 ${aufgabe.sprache === 'ar' ? 'font-arabic text-arabisch-2' : 'text-24'}`}
      >
        {aufgabe.vor}
        {luecke}
        {aufgabe.nach}
      </p>
      <p id={`${id}-satz`} lang={aufgabe.sprache} dir={dir} className="sr-only">
        {`${aufgabe.vor} … ${aufgabe.nach}`}
      </p>
      {aufgabe.hilfe ? (
        <p className="text-18 text-tinte-2">
          {hilfe}{' '}
          <bdi lang={aufgabe.hilfe.sprache} dir={richtung(aufgabe.hilfe.sprache)}>
            {aufgabe.hilfe.text}
          </bdi>
        </p>
      ) : null}
    </div>
  );
}
