'use client';

import { useMemo, useState } from 'react';
import { pruefeZuordnung, vollstaendig, zuordnenReihenfolge } from '@/lib/lernapp/aufgaben/auswertung/zuordnen';
import { richtung, type AufgabenProps } from '../typen';
import { Erklaerung, MitEinschub } from './Erklaerung';
import { Optionsgruppe } from './Optionsgruppe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteZuordnen as bewerte } from '@/lib/lernapp/aufgaben/auswertung/zuordnen';

/**
 * Übungstyp `zuordnen` (Wissenskurs, PLAN §4): je Eintrag eine Radiogruppe mit den Kategorien (Legende = Eintrag mit
 * `lang`), Ziehen nie nötig (WCAG 2.5.7). „Prüfen“ erst, wenn jeder Eintrag eine Kategorie hat. Nach dem Prüfen steht je
 * Eintrag in Worten, ob er stimmt bzw. wohin er gehört – nicht nur als Farbe. Die inhaltliche Frage (`frage`, im Wissenskurs
 * immer gesetzt) steht vor den Einträgen in der Sprache der Inhalte.
 */
export default function Zuordnen({
  aufgabe,
  texte,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
}: AufgabenProps<'zuordnen'>) {
  const t = texte.zuordnen;
  const reihe = useMemo(() => zuordnenReihenfolge(aufgabe), [aufgabe]);
  const kategorien = useMemo(() => aufgabe.kategorien.map((text) => ({ text, sprache: aufgabe.sprache })), [aufgabe]);
  const kategorienReihe = useMemo(() => aufgabe.kategorien.map((_, i) => i), [aufgabe]);
  const [zuordnung, setZuordnung] = useState<(number | undefined)[]>(() => antwort?.zuordnung ?? []);
  const geprueft = auswertung ? pruefeZuordnung(aufgabe, antwort?.zuordnung ?? zuordnung.map((k) => k ?? -1)) : null;

  function waehle(eintrag: number, kategorie: number) {
    const neu = [...zuordnung];
    neu[eintrag] = kategorie;
    setZuordnung(neu);
    setzeAntwort(vollstaendig(aufgabe, neu) ? { typ: 'zuordnen', zuordnung: neu.map((k) => k ?? -1) } : null);
  }

  return (
    <div className="flex flex-col gap-5">
      {aufgabe.frage ? (
        <p lang={aufgabe.sprache} dir={richtung(aufgabe.sprache)} className="rounded-lg bg-sand px-4 py-5 text-20 font-bold">
          {aufgabe.frage}
        </p>
      ) : null}
      <ol className="flex flex-col gap-4">
        {reihe.map((i) => {
          const e = aufgabe.eintraege[i];
          if (!e) return null;
          const ok = geprueft?.[i];
          return (
            <li key={i} className="flex min-w-0 flex-col gap-3 rounded-lg border-2 border-linie bg-weiss p-4">
              <Optionsgruppe
                legende={e.text}
                legendeSprache={aufgabe.sprache}
                tasten={t.tasten}
                optionen={kategorien}
                reihe={kategorienReihe}
                wahl={zuordnung[i] ?? null}
                setzeWahl={(k) => waehle(i, k)}
                gesperrt={gesperrt}
                richtig={auswertung ? e.kategorie : null}
                ui={sprache}
                ziffern={ziffern}
                kopf={
                  <p aria-hidden lang={aufgabe.sprache} dir={richtung(aufgabe.sprache)} className="text-20 font-bold">
                    {e.text}
                  </p>
                }
              />
              {geprueft ? (
                <p className={`text-18 font-bold ${ok ? 'text-gruen-800' : 'text-fehler'}`}>
                  {ok ? (
                    t.passt
                  ) : (
                    <MitEinschub
                      vorlage={t.gehoertZu}
                      name="kategorie"
                      wert={aufgabe.kategorien[e.kategorie] ?? ''}
                      sprache={aufgabe.sprache}
                      ui={sprache}
                      ziffern={ziffern}
                    />
                  )}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
      {auswertung ? (
        <Erklaerung quelle={aufgabe.quelle} strittig={aufgabe.strittig} sprache={aufgabe.sprache} texte={texte.wissen} />
      ) : null}
    </div>
  );
}
