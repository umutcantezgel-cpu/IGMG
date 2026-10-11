'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { VorstandInhalt } from '@/lib/validierung/seiteninhalte/vorstand';
import { Abschnitt, Liste, MehrsprachigFeld, SchalterFeld, TextFeld } from './Felder';
import type { Mehrsprachig } from './hilfen';
import { FormularRahmen, type Aktion } from './Rahmen';

type Mitglied = VorstandInhalt['vorstand'][number];
type Amtszeit = VorstandInhalt['vorsitzende'][number];

/** Vorschlag für ein neues Mitglied: kein Name wird erfunden (G-04); der Platzhalter bleibt, bis die Gemeinde ihn ersetzt. */
const neuesMitglied = (): Mitglied => ({
  name: '[Name – Funktion]',
  funktion: { de: '[Funktion]' },
  seit: '',
  aufgaben: [],
  email: '',
  telefon: '[Telefonnummer]',
});

const neueAmtszeit = (): Amtszeit => ({ name: '[Name – Funktion]', von: '[Jahr]', bis: '', aktuell: false, erfolge: [] });

/** Formular „Vorstand“ (Blatt V05, Blatt S09): Führung, aktueller Vorstand und die Chronik „Unsere Vorsitzenden“. */
export function VorstandFormular({ startwerte, nurLesen, aktion }: { startwerte: VorstandInhalt; nurLesen: boolean; aktion: Aktion }) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const [wert, setWert] = useState(startwerte);
  return (
    <FormularRahmen bereich="vorstand" wert={wert} aktion={aktion} nurLesen={nurLesen}>
      <Abschnitt id="fuehrung" titel={t('abschnitt.fuehrung')}>
        <TextFeld
          pfad="fuehrungSeit"
          label={t('feld.fuehrungSeit')}
          hinweis={t('hinweis.fuehrungSeit')}
          wert={wert.fuehrungSeit}
          onChange={(fuehrungSeit) => setWert({ ...wert, fuehrungSeit })}
          pflicht
        />
      </Abschnitt>

      <Abschnitt id="vorstand" titel={t('abschnitt.vorstand')}>
        <Liste
          pfad="vorstand"
          titel={t('feld.vorstand')}
          titelVerborgen
          eintraege={wert.vorstand}
          onChange={(vorstand) => setWert({ ...wert, vorstand })}
          neu={neuesMitglied}
          renderEintrag={(mitglied, index, aendern) => (
            <>
              <TextFeld
                pfad={`vorstand.${index}.name`}
                label={t('feld.name')}
                hinweis={t('hinweis.name')}
                wert={mitglied.name}
                onChange={(name) => aendern({ ...mitglied, name })}
                pflicht
              />
              <MehrsprachigFeld
                pfad={`vorstand.${index}.funktion`}
                label={t('feld.funktion')}
                wert={mitglied.funktion}
                onChange={(funktion) => aendern({ ...mitglied, funktion })}
              />
              <TextFeld
                pfad={`vorstand.${index}.seit`}
                label={t('feld.seit')}
                wert={mitglied.seit}
                onChange={(seit) => aendern({ ...mitglied, seit })}
              />
              <Liste
                pfad={`vorstand.${index}.aufgaben`}
                titel={t('feld.aufgaben')}
                eintraege={mitglied.aufgaben}
                onChange={(aufgaben) => aendern({ ...mitglied, aufgaben })}
                neu={(): Mehrsprachig => ({ de: '' })}
                renderEintrag={(aufgabe, j, aendernAufgabe) => (
                  <MehrsprachigFeld
                    pfad={`vorstand.${index}.aufgaben.${j}`}
                    label={t('feld.aufgabe')}
                    wert={aufgabe}
                    onChange={aendernAufgabe}
                  />
                )}
              />
              <TextFeld
                pfad={`vorstand.${index}.email`}
                label={t('feld.email')}
                wert={mitglied.email}
                typ="email"
                onChange={(email) => aendern({ ...mitglied, email })}
              />
              <TextFeld
                pfad={`vorstand.${index}.telefon`}
                label={t('feld.telefon')}
                hinweis={t('hinweis.telefon')}
                wert={mitglied.telefon}
                typ="tel"
                onChange={(telefon) => aendern({ ...mitglied, telefon })}
              />
            </>
          )}
        />
      </Abschnitt>

      <Abschnitt id="vorsitz" titel={t('abschnitt.vorsitzende')}>
        <Liste
          pfad="vorsitzende"
          titel={t('feld.vorsitzende')}
          eintraege={wert.vorsitzende}
          onChange={(vorsitzende) => setWert({ ...wert, vorsitzende })}
          neu={neueAmtszeit}
          renderEintrag={(amtszeit, index, aendern) => (
            <>
              <TextFeld
                pfad={`vorsitzende.${index}.name`}
                label={t('feld.name')}
                hinweis={t('hinweis.name')}
                wert={amtszeit.name}
                onChange={(name) => aendern({ ...amtszeit, name })}
                pflicht
              />
              <TextFeld
                pfad={`vorsitzende.${index}.von`}
                label={t('feld.von')}
                wert={amtszeit.von}
                onChange={(von) => aendern({ ...amtszeit, von })}
                pflicht
              />
              <TextFeld
                pfad={`vorsitzende.${index}.bis`}
                label={t('feld.bis')}
                wert={amtszeit.bis}
                onChange={(bis) => aendern({ ...amtszeit, bis })}
              />
              <SchalterFeld
                pfad={`vorsitzende.${index}.aktuell`}
                label={t('feld.aktuell')}
                wert={amtszeit.aktuell}
                onChange={(aktuell) => aendern({ ...amtszeit, aktuell })}
              />
              <Liste
                pfad={`vorsitzende.${index}.erfolge`}
                titel={t('feld.erfolge')}
                eintraege={amtszeit.erfolge}
                onChange={(erfolge) => aendern({ ...amtszeit, erfolge })}
                neu={(): Mehrsprachig => ({ de: '' })}
                renderEintrag={(erfolg, j, aendernErfolg) => (
                  <MehrsprachigFeld
                    pfad={`vorsitzende.${index}.erfolge.${j}`}
                    label={t('feld.erfolg')}
                    wert={erfolg}
                    onChange={aendernErfolg}
                  />
                )}
              />
            </>
          )}
        />
      </Abschnitt>
    </FormularRahmen>
  );
}
