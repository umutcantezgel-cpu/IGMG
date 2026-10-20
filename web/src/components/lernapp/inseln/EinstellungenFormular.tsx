'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { formatiere, intlSprache, type Ziffern } from '@/lib/lernapp/format';
import type { Oberflaeche, Sprache } from '@/lib/lernapp/kurse';
import {
  einstellungsSpeicher,
  STANDARD_EINSTELLUNGEN,
  TAGESZIELE,
  zielAus,
  zielSchluessel,
  type Einstellungen,
} from '@/lib/lernapp/oberflaeche/einstellungen';

export type EinstellungenTexte = {
  ausgang: string;
  ausgangText: string;
  ausgangWieOberflaeche: string;
  tagesziel: string;
  tageszielText: string;
  zielKeins: string;
  zielXp: string;
  zielLektionen: string;
  ziffern: string;
  ziffernText: string;
  ziffernArab: string;
  ziffernLatn: string;
  uebungen: string;
  hoeren: string;
  hoerenText: string;
  sprechen: string;
  sprechenText: string;
  gespeichert: string;
  nichtGespeichert: string;
};

const ZEILE = 'flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-gruen-50';
const FELD = 'size-5 shrink-0 accent-gruen-700';

function Gruppe({ id, titel, text, children }: { id: string; titel: string; text?: string; children: ReactNode }) {
  return (
    <fieldset
      aria-describedby={text ? `${id}-text` : undefined}
      className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-5"
    >
      <legend className="float-start w-full font-display text-24">{titel}</legend>
      {text ? (
        <p id={`${id}-text`} className="text-16 text-tinte-2">
          {text}
        </p>
      ) : null}
      <div className="flex flex-col gap-1">{children}</div>
    </fieldset>
  );
}

/**
 * Einstellungen auf dem Gerät (PLAN §3.1, ADR 0037 Nr. 7, ADR 0043 Nr. 2, KERN 4.0 §7–§8): Ausgangssprache, Tagesziel,
 * Ziffern (nur in der arabischen Oberfläche), Hör- und Sprechübungen. Jede Änderung wird sofort gespeichert (kein
 * Absenden, kein Kontextwechsel – WCAG 3.2.2) und in einer Live-Region bestätigt. Formular ohne JavaScript bleibt
 * lesbar; gespeichert wird nur im Browser (Gerätespeicher, kein Netz).
 */
export function EinstellungenFormular({
  ui,
  texte,
  sprachen,
}: {
  ui: Oberflaeche;
  texte: EinstellungenTexte;
  /** Ausgangssprachen mit Eigennamen (in ihrer Sprache) */
  sprachen: { sprache: Sprache; eigenname: string; dir: 'ltr' | 'rtl' }[];
}) {
  const [e, setE] = useState<Einstellungen>(STANDARD_EINSTELLUNGEN);
  const [meldung, setMeldung] = useState('');
  useEffect(() => {
    void einstellungsSpeicher.laden().then(setE);
  }, []);

  const aendern = (teil: Partial<Einstellungen>) => {
    const neu = { ...e, ...teil };
    setE(neu);
    void einstellungsSpeicher.speichern(neu).then((ok) => setMeldung(ok ? texte.gespeichert : texte.nichtGespeichert));
  };

  const zahlSprache = (z: Ziffern = e.ziffern) => intlSprache(ui, z);
  const zielText = (schluessel: string) => {
    const ziel = zielAus(schluessel);
    if (!ziel || ziel.art === 'keins') return texte.zielKeins;
    return formatiere(ziel.art === 'xp' ? texte.zielXp : texte.zielLektionen, { n: ziel.wert }, zahlSprache());
  };

  return (
    <div className="flex flex-col gap-6">
      <Gruppe id="ausgang" titel={texte.ausgang} text={texte.ausgangText}>
        <label className={ZEILE}>
          <input type="radio" name="ausgang" className={FELD} checked={e.ausgang === null} onChange={() => aendern({ ausgang: null })} />
          {texte.ausgangWieOberflaeche}
        </label>
        {sprachen.map((s) => (
          <label key={s.sprache} className={ZEILE}>
            <input
              type="radio"
              name="ausgang"
              value={s.sprache}
              className={FELD}
              checked={e.ausgang === s.sprache}
              onChange={() => aendern({ ausgang: s.sprache })}
            />
            <span lang={s.sprache} dir={s.dir}>
              {s.eigenname}
            </span>
          </label>
        ))}
      </Gruppe>

      <Gruppe id="tagesziel" titel={texte.tagesziel} text={texte.tageszielText}>
        {TAGESZIELE.map((z) => {
          const schluessel = zielSchluessel(z);
          return (
            <label key={schluessel} className={ZEILE}>
              <input
                type="radio"
                name="tagesziel"
                value={schluessel}
                className={FELD}
                checked={zielSchluessel(e.tagesziel) === schluessel}
                onChange={() => aendern({ tagesziel: z })}
              />
              {zielText(schluessel)}
            </label>
          );
        })}
      </Gruppe>

      {ui === 'ar' ? (
        <Gruppe id="ziffern" titel={texte.ziffern} text={texte.ziffernText}>
          {(['oestlich', 'westlich'] as const).map((z) => (
            <label key={z} className={ZEILE}>
              <input
                type="radio"
                name="ziffern"
                value={z}
                className={FELD}
                checked={e.ziffern === z}
                onChange={() => aendern({ ziffern: z })}
              />
              <span>
                {z === 'oestlich' ? texte.ziffernArab : texte.ziffernLatn}{' '}
                <span className="text-tinte-2 tabular-nums">({new Intl.NumberFormat(zahlSprache(z)).format(123)})</span>
              </span>
            </label>
          ))}
        </Gruppe>
      ) : null}

      <Gruppe id="uebungen" titel={texte.uebungen}>
        {(['hoeren', 'sprechen'] as const).map((art) => (
          <label
            key={art}
            className="grid min-h-11 cursor-pointer raster-symbol items-center gap-x-3 rounded-md px-3 py-2 hover:bg-gruen-50"
          >
            <input
              type="checkbox"
              name={art}
              className={FELD}
              checked={e[art]}
              aria-describedby={`${art}-text`}
              onChange={(ev) => aendern({ [art]: ev.target.checked })}
            />
            <span className="font-bold">{texte[art]}</span>
            <span id={`${art}-text`} className="col-start-2 text-16 text-tinte-2">
              {texte[art === 'hoeren' ? 'hoerenText' : 'sprechenText']}
            </span>
          </label>
        ))}
      </Gruppe>

      <p role="status" className="min-h-6 text-16 font-bold text-gruen-800">
        {meldung}
      </p>
    </div>
  );
}
