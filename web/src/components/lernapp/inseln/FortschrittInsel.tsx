'use client';

import { useEffect, useState } from 'react';
import { ABZEICHEN } from '@/lib/lernapp/ereignisse/abzeichen';
import { formatiere, type Ziffern, zahl } from '@/lib/lernapp/format';
import type { Oberflaeche } from '@/lib/lernapp/kurse';
import { EINSTELLUNGEN_SCHLUESSEL, einstellungsSpeicher } from '@/lib/lernapp/oberflaeche/einstellungen';
import { LEERER_FORTSCHRITT, ladeFortschritt, type FortschrittStand } from '@/lib/lernapp/oberflaeche/fortschritt';
import { STAND_GEAENDERT } from '@/lib/lernapp/oberflaeche/geraet';
import type de from '../../../../messages/lernapp/de.json';
import { AbgeschlosseneStufen, type AbgeschlosseneStufenTexte } from '../AbgeschlosseneStufen';
import { Abzeichen, abzeichenText, type AbzeichenTexte } from '../Abzeichen';
import { Serie, type SerieTexte } from '../Serie';

export type FortschrittTexte = {
  fortschritt: (typeof de)['fortschritt'];
  serie: SerieTexte;
  abzeichen: AbzeichenTexte;
  stufen: AbgeschlosseneStufenTexte;
};

/**
 * Insel „Fortschritt“ (PLAN §3.1, ADR 0043): Kennzahlen (Lerntage gesamt, XP, Lektionen, geübte Wörter und Sätze), die Serie
 * als Wochenband und die Abzeichen – alles aus den abgeleiteten Speichern der lokalen Datenbank (`ladeFortschritt`,
 * ADR 0038), ohne Konto voll nutzbar. Der Server rendert den Zustand eines neuen Geräts. Nur für die Person auf diesem
 * Gerät, ohne Vergleich mit anderen; alle Zahlen stehen statisch. Noch offene Abzeichen stehen zugeklappt darunter, mit
 * ihrer Bedingung und ohne Druck; das Gruppenziel erscheint nur, wenn es erreicht ist (Gruppen: L7-02). Darunter die
 * abgeschlossenen Stufen je Sprachkurs (L4-03), sobald es eine gibt.
 */
export function FortschrittInsel({ ui, texte }: { ui: Oberflaeche; texte: FortschrittTexte }) {
  const [stand, setStand] = useState<FortschrittStand>(LEERER_FORTSCHRITT);
  const [ziffern, setZiffern] = useState<Ziffern>('oestlich');

  useEffect(() => {
    let aktiv = true;
    const laden = () =>
      void Promise.all([einstellungsSpeicher(ui).laden(), ladeFortschritt()])
        .then(([e, s]) => {
          if (!aktiv) return;
          setZiffern(e.ziffern);
          setStand(s);
        })
        .catch(() => undefined);
    laden();
    window.addEventListener(STAND_GEAENDERT, laden);
    window.addEventListener(EINSTELLUNGEN_SCHLUESSEL, laden);
    return () => {
      aktiv = false;
      window.removeEventListener(STAND_GEAENDERT, laden);
      window.removeEventListener(EINSTELLUNGEN_SCHLUESSEL, laden);
    };
  }, [ui]);

  const t = texte.fortschritt;
  if (!stand.begonnen) return <p className="text-18 text-tinte-2">{t.leer}</p>;

  const erhalten = new Set(stand.abzeichen.map((a) => a.id));
  const mitText = (art: (typeof ABZEICHEN)[number]) => ({ art, ...abzeichenText(art, texte.abzeichen, ui, ziffern) });
  const da = ABZEICHEN.filter((a) => erhalten.has(a.id)).map(mitText);
  const offen = ABZEICHEN.filter((a) => !erhalten.has(a.id) && a.gruppe !== 'gruppe').map(mitText);
  const kennzahlen = [
    [t.lerntage, stand.lerntage],
    [t.xp, stand.xp],
    [t.lektionen, stand.lektionen],
    [t.karten, stand.karten],
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="fortschritt-bisher" className="flex flex-col gap-3">
        <h2 id="fortschritt-bisher" className="text-24">
          {t.bisher}
        </h2>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {kennzahlen.map(([name, wert]) => (
            <div key={name} className="flex flex-col-reverse gap-1 rounded-md bg-sand p-4">
              <dt className="text-16 text-tinte-2">{name}</dt>
              <dd className="font-display text-display-2 tabular-nums">{zahl(wert, ui, ziffern)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {stand.serie ? (
        <Serie
          laenge={stand.serie.laenge}
          woche={stand.serie.woche}
          heute={stand.serie.heute}
          texte={texte.serie}
          ui={ui}
          ziffern={ziffern}
          wiedereinstieg={stand.serie.wiedereinstieg}
          pausetage={stand.serie.pausetage}
          flaeche="bg-sand"
        />
      ) : null}

      <section aria-labelledby="fortschritt-abzeichen" className="flex flex-col gap-3">
        <h2 id="fortschritt-abzeichen" className="text-24">
          {texte.abzeichen.titel}
        </h2>
        <p className="text-16 text-tinte-2">{texte.abzeichen.hinweis}</p>
        {da.length ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {da.map((a) => (
              <li key={a.art.id}>
                <Abzeichen art={a.art} name={a.name} text={a.text} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-16">{texte.abzeichen.keine}</p>
        )}
        {offen.length ? (
          <details className="rounded-md border border-linie">
            <summary className="flex min-h-11 cursor-pointer items-center px-4 font-bold">
              {formatiere(texte.abzeichen.weitere, { n: offen.length }, ui, ziffern)}
            </summary>
            <div className="flex flex-col gap-4 px-4 pb-4">
              <p className="text-16 text-tinte-2">{texte.abzeichen.weitereText}</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
                {offen.map((a) => (
                  <li key={a.art.id}>
                    <Abzeichen art={a.art} name={a.name} text={a.text} offen />
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ) : null}
      </section>

      <AbgeschlosseneStufen stufen={stand.stufen} texte={texte.stufen} ui={ui} ziffern={ziffern} />
    </div>
  );
}
