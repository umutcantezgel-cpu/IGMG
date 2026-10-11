'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SYMBOLE, type UeberUnsInhalt } from '@/lib/validierung/seiteninhalte/ueber-uns';
import { Abschnitt, AuswahlFeld, Liste, MehrsprachigFeld, TextFeld } from './Felder';
import { nummeriert, optional, type Mehrsprachig } from './hilfen';
import { FormularRahmen, type Aktion } from './Rahmen';

type Absatz = { absatz: Mehrsprachig };
type Zeiteintrag = UeberUnsInhalt['zeitleiste'][number];
type Wertpunkt = UeberUnsInhalt['werte'][number];

/** Absätze mit Überschrift (Geschichte, Gemeinschaft). Die Reihenfolge ist die Reihenfolge der Liste. */
function AbsaetzeListe({
  pfad,
  titel,
  eintraege,
  onChange,
}: {
  pfad: string;
  titel: string;
  eintraege: readonly Absatz[];
  onChange: (neu: Absatz[]) => void;
}) {
  const t = useTranslations('verwaltung.seiteninhalte');
  return (
    <Liste
      pfad={pfad}
      titel={titel}
      eintraege={eintraege}
      onChange={onChange}
      neu={(): Absatz => ({ absatz: { de: '' } })}
      renderEintrag={(eintrag, index, aendern) => (
        <MehrsprachigFeld
          pfad={`${pfad}.${index}.absatz`}
          label={t('feld.absatz')}
          wert={eintrag.absatz}
          zeilen={5}
          onChange={(absatz) => aendern({ absatz })}
        />
      )}
    />
  );
}

/** Formular „Über uns“ (Blatt V05, Blatt S08): Geschichte, Zeitleiste „Unsere Reise“, Gemeinschaft und Werte. */
export function UeberUnsFormular({ startwerte, nurLesen, aktion }: { startwerte: UeberUnsInhalt; nurLesen: boolean; aktion: Aktion }) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const [wert, setWert] = useState(startwerte);
  const symbole = SYMBOLE.map((s) => ({ wert: s, text: t(`symbol.${s}`) }));
  return (
    <FormularRahmen bereich="ueber-uns" wert={wert} aktion={aktion} nurLesen={nurLesen}>
      <Abschnitt id="geschichte" titel={t('abschnitt.geschichte')}>
        <AbsaetzeListe
          pfad="geschichte.absaetze"
          titel={t('feld.absaetze')}
          eintraege={wert.geschichte.absaetze}
          onChange={(absaetze) => setWert({ ...wert, geschichte: { absaetze } })}
        />
      </Abschnitt>

      <Abschnitt id="zeitleiste" titel={t('abschnitt.zeitleiste')}>
        <Liste
          pfad="zeitleiste"
          titel={t('feld.eintraege')}
          eintraege={wert.zeitleiste}
          onChange={(zeitleiste) => setWert({ ...wert, zeitleiste: nummeriert(zeitleiste) })}
          neu={(): Zeiteintrag => ({
            kennzeichnung: { de: '' },
            titel: { de: '' },
            bildbeschreibung: { de: '' },
            reihenfolge: 0,
            symbol: 'standort',
          })}
          renderEintrag={(eintrag, index, aendern) => (
            <>
              <MehrsprachigFeld
                pfad={`zeitleiste.${index}.kennzeichnung`}
                label={t('feld.kennzeichnung')}
                wert={eintrag.kennzeichnung}
                onChange={(kennzeichnung) => aendern({ ...eintrag, kennzeichnung })}
              />
              <MehrsprachigFeld
                pfad={`zeitleiste.${index}.titel`}
                label={t('feld.titel')}
                wert={eintrag.titel}
                onChange={(titel) => aendern({ ...eintrag, titel })}
              />
              <MehrsprachigFeld
                pfad={`zeitleiste.${index}.ort`}
                label={t('feld.ort')}
                wert={eintrag.ort ?? { de: '' }}
                pflicht={false}
                onChange={(ort) => aendern({ ...eintrag, ort: optional(ort) })}
              />
              <TextFeld
                pfad={`zeitleiste.${index}.bild`}
                label={t('feld.bild')}
                hinweis={t('hinweis.bild')}
                wert={eintrag.bild ?? ''}
                onChange={(bild) => aendern({ ...eintrag, bild: bild.trim() === '' ? undefined : bild })}
              />
              <MehrsprachigFeld
                pfad={`zeitleiste.${index}.bildbeschreibung`}
                label={t('feld.bildbeschreibung')}
                wert={eintrag.bildbeschreibung}
                onChange={(bildbeschreibung) => aendern({ ...eintrag, bildbeschreibung })}
              />
              <AuswahlFeld
                pfad={`zeitleiste.${index}.symbol`}
                label={t('feld.symbol')}
                wert={eintrag.symbol}
                optionen={symbole}
                onChange={(symbol) => aendern({ ...eintrag, symbol })}
              />
            </>
          )}
        />
      </Abschnitt>

      <Abschnitt id="gemeinschaft" titel={t('abschnitt.gemeinschaft')}>
        <AbsaetzeListe
          pfad="gemeinschaft.absaetze"
          titel={t('feld.absaetze')}
          eintraege={wert.gemeinschaft.absaetze}
          onChange={(absaetze) => setWert({ ...wert, gemeinschaft: { absaetze } })}
        />
      </Abschnitt>

      <Abschnitt id="werte" titel={t('abschnitt.werte')}>
        <Liste
          pfad="werte"
          titel={t('feld.werte')}
          eintraege={wert.werte}
          onChange={(werte) => setWert({ ...wert, werte: nummeriert(werte) })}
          neu={(): Wertpunkt => ({ titel: { de: '' }, beschreibung: { de: '' }, reihenfolge: 0, symbol: 'herz' })}
          renderEintrag={(eintrag, index, aendern) => (
            <>
              <MehrsprachigFeld
                pfad={`werte.${index}.titel`}
                label={t('feld.titel')}
                wert={eintrag.titel}
                onChange={(titel) => aendern({ ...eintrag, titel })}
              />
              <MehrsprachigFeld
                pfad={`werte.${index}.beschreibung`}
                label={t('feld.beschreibung')}
                wert={eintrag.beschreibung}
                zeilen={3}
                onChange={(beschreibung) => aendern({ ...eintrag, beschreibung })}
              />
              <AuswahlFeld
                pfad={`werte.${index}.symbol`}
                label={t('feld.symbol')}
                wert={eintrag.symbol}
                optionen={symbole}
                onChange={(symbol) => aendern({ ...eintrag, symbol })}
              />
            </>
          )}
        />
      </Abschnitt>
    </FormularRahmen>
  );
}
