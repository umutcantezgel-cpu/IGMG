'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { DatenschutzInhalt } from '@/lib/validierung/seiteninhalte/datenschutz';
import type { Baustein, ImpressumInhalt } from '@/lib/validierung/seiteninhalte/impressum';
import { Abschnitt, AuswahlFeld, Liste, MehrsprachigFeld, TextFeld } from './Felder';
import { optional, type Mehrsprachig } from './hilfen';
import { FormularRahmen, type Aktion } from './Rahmen';

/** Höchstzahl je Rechtsabschnitt und je Aufzählung (Schema: `bausteine` max 40, `punkte` max 40). */
const MAX_BAUSTEINE = 40;

/** Art wechseln: Der Text bleibt erhalten (Absatz ↔ erster Punkt der Liste). */
function wechselArt(baustein: Baustein, art: 'absatz' | 'liste'): Baustein {
  if (art === baustein.art) return baustein;
  if (art === 'absatz') return { art: 'absatz', text: baustein.art === 'liste' ? (baustein.punkte[0] ?? { de: '' }) : baustein.text };
  return { art: 'liste', punkte: baustein.art === 'absatz' ? [baustein.text] : baustein.punkte };
}

/** Rechtsbausteine eines Abschnitts: Absatz oder Liste mit optionaler Überschrift (Muster 4, Schema `baustein`). */
function Bausteine({
  pfad,
  titel,
  eintraege,
  onChange,
}: {
  pfad: string;
  titel: string;
  eintraege: readonly Baustein[];
  onChange: (neu: Baustein[]) => void;
}) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const arten: { wert: 'absatz' | 'liste'; text: string }[] = [
    { wert: 'absatz', text: t('baustein.absatz') },
    { wert: 'liste', text: t('baustein.liste') },
  ];
  return (
    <Liste
      pfad={pfad}
      titel={titel}
      eintraege={eintraege}
      maximal={MAX_BAUSTEINE}
      onChange={onChange}
      neu={(): Baustein => ({ art: 'absatz', text: { de: '' } })}
      renderEintrag={(baustein, index, aendern) => (
        <>
          <AuswahlFeld
            pfad={`${pfad}.${index}.art`}
            label={t('feld.art')}
            wert={baustein.art}
            optionen={arten}
            onChange={(art) => aendern(wechselArt(baustein, art))}
          />
          {baustein.art === 'absatz' ? (
            <MehrsprachigFeld
              pfad={`${pfad}.${index}.text`}
              label={t('feld.text')}
              wert={baustein.text}
              zeilen={6}
              onChange={(text) => aendern({ art: 'absatz', text })}
            />
          ) : (
            <>
              <MehrsprachigFeld
                pfad={`${pfad}.${index}.titel`}
                label={t('feld.titelDerListe')}
                wert={baustein.titel ?? { de: '' }}
                pflicht={false}
                onChange={(titel) => aendern({ art: 'liste', titel: optional(titel), punkte: baustein.punkte })}
              />
              <Liste
                pfad={`${pfad}.${index}.punkte`}
                titel={t('feld.punkte')}
                eintraege={baustein.punkte}
                maximal={MAX_BAUSTEINE}
                onChange={(punkte) => aendern({ art: 'liste', titel: baustein.titel, punkte })}
                neu={(): Mehrsprachig => ({ de: '' })}
                renderEintrag={(punkt, j, aendernPunkt) => (
                  <MehrsprachigFeld
                    pfad={`${pfad}.${index}.punkte.${j}`}
                    label={t('feld.punkt')}
                    wert={punkt}
                    zeilen={2}
                    onChange={aendernPunkt}
                  />
                )}
              />
            </>
          )}
        </>
      )}
    />
  );
}

/** Formular „Impressum“ (Blatt V05, Blatt S23): Entwurf, der rechtlich geprüft werden muss (G-08, M-079). */
export function ImpressumFormular({ startwerte, nurLesen, aktion }: { startwerte: ImpressumInhalt; nurLesen: boolean; aktion: Aktion }) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const [wert, setWert] = useState(startwerte);
  const verantwortlich = wert.verantwortlich;
  const setzeVerantwortlich = (feld: keyof ImpressumInhalt['verantwortlich'], neu: string) =>
    setWert({ ...wert, verantwortlich: { ...verantwortlich, [feld]: neu } });
  return (
    <FormularRahmen
      bereich="impressum"
      wert={wert}
      aktion={aktion}
      nurLesen={nurLesen}
      hinweis={<Meldung art="info">{t('entwurf')}</Meldung>}
    >
      <Abschnitt id="verantwortlich" titel={t('abschnitt.verantwortlich')}>
        <TextFeld
          pfad="verantwortlich.name"
          label={t('feld.name')}
          wert={verantwortlich.name}
          onChange={(neu) => setzeVerantwortlich('name', neu)}
        />
        <TextFeld
          pfad="verantwortlich.anschrift"
          label={t('feld.anschrift')}
          wert={verantwortlich.anschrift}
          onChange={(neu) => setzeVerantwortlich('anschrift', neu)}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TextFeld
            pfad="verantwortlich.telefon"
            label={t('feld.telefon')}
            wert={verantwortlich.telefon}
            typ="tel"
            onChange={(neu) => setzeVerantwortlich('telefon', neu)}
          />
          <TextFeld
            pfad="verantwortlich.email"
            label={t('feld.email')}
            wert={verantwortlich.email}
            typ="email"
            onChange={(neu) => setzeVerantwortlich('email', neu)}
          />
        </div>
        <TextFeld
          pfad="verantwortlich.vertretung"
          label={t('feld.vertretung')}
          wert={verantwortlich.vertretung}
          onChange={(neu) => setzeVerantwortlich('vertretung', neu)}
        />
        <TextFeld
          pfad="verantwortlich.register"
          label={t('feld.register')}
          wert={verantwortlich.register}
          onChange={(neu) => setzeVerantwortlich('register', neu)}
        />
      </Abschnitt>

      <Abschnitt id="weitere" titel={t('abschnitt.weitere')}>
        <Bausteine
          pfad="weitere"
          titel={t('feld.weitere')}
          eintraege={wert.weitere}
          onChange={(weitere) => setWert({ ...wert, weitere })}
        />
      </Abschnitt>
    </FormularRahmen>
  );
}

/** Abschnitte der Datenschutzerklärung (Blatt S23, Gliederung); die Reihenfolge entspricht dem Schema. */
const DATENSCHUTZ_ABSCHNITTE = ['daten', 'zweck', 'speicherung', 'sicherheit', 'empfaenger', 'browser', 'rechte'] as const;

/** Formular „Datenschutz“ (Blatt V05, Blatt S23): Entwurf nach G-08, Lücken als Platzhalter (G-05). */
export function DatenschutzFormular({
  startwerte,
  nurLesen,
  aktion,
}: {
  startwerte: DatenschutzInhalt;
  nurLesen: boolean;
  aktion: Aktion;
}) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const [wert, setWert] = useState(startwerte);
  return (
    <FormularRahmen
      bereich="datenschutz"
      wert={wert}
      aktion={aktion}
      nurLesen={nurLesen}
      hinweis={<Meldung art="info">{t('entwurf')}</Meldung>}
    >
      <Abschnitt id="beauftragte" titel={t('abschnitt.beauftragte')}>
        <TextFeld
          pfad="datenschutzbeauftragte"
          label={t('feld.datenschutzbeauftragte')}
          hinweis={t('hinweis.datenschutzbeauftragte')}
          wert={wert.datenschutzbeauftragte}
          onChange={(datenschutzbeauftragte) => setWert({ ...wert, datenschutzbeauftragte })}
        />
      </Abschnitt>

      {DATENSCHUTZ_ABSCHNITTE.map((schluessel) => (
        <Abschnitt key={schluessel} id={schluessel} titel={t(`abschnitt.${schluessel}`)}>
          <Bausteine
            pfad={schluessel}
            titel={t('feld.bausteine')}
            eintraege={wert[schluessel]}
            onChange={(neu) => setWert({ ...wert, [schluessel]: neu })}
          />
        </Abschnitt>
      ))}
    </FormularRahmen>
  );
}
