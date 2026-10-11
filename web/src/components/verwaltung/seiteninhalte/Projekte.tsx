'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PROJEKT_STATI, type ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { Abschnitt, AuswahlFeld, Liste, MehrsprachigFeld, SchalterFeld, TextFeld, ZahlFeld } from './Felder';
import { FormularRahmen, type Aktion } from './Rahmen';

type Meilenstein = ProjekteInhalt['meilensteine'][number];

/** Formular „Projekte mit Spendenangaben“ (Blatt V05, Blatt S10): Hauptprojekt, Spenden, Unterstützen, Meilensteine. */
export function ProjekteFormular({ startwerte, nurLesen, aktion }: { startwerte: ProjekteInhalt; nurLesen: boolean; aktion: Aktion }) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const [wert, setWert] = useState(startwerte);
  const stati = PROJEKT_STATI.map((s) => ({ wert: s, text: t(`status.${s}`) }));
  const projekt = wert.projekt;
  const spende = wert.spende;
  const unterstuetzung = wert.unterstuetzung;
  return (
    <FormularRahmen bereich="projekte" wert={wert} aktion={aktion} nurLesen={nurLesen}>
      <Abschnitt id="projekt" titel={t('abschnitt.projekt')}>
        <MehrsprachigFeld
          pfad="projekt.name"
          label={t('feld.projektname')}
          wert={projekt.name}
          onChange={(name) => setWert({ ...wert, projekt: { ...projekt, name } })}
        />
        <AuswahlFeld
          pfad="projekt.status"
          label={t('feld.status')}
          wert={projekt.status}
          optionen={stati}
          onChange={(status) => setWert({ ...wert, projekt: { ...projekt, status } })}
        />
        <MehrsprachigFeld
          pfad="projekt.ort"
          label={t('feld.ort')}
          wert={projekt.ort}
          pflicht={false}
          onChange={(ort) => setWert({ ...wert, projekt: { ...projekt, ort } })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <ZahlFeld
            pfad="projekt.beginn"
            label={t('feld.beginn')}
            wert={projekt.beginn}
            min={1900}
            max={2100}
            onChange={(beginn) => setWert({ ...wert, projekt: { ...projekt, beginn } })}
          />
          <ZahlFeld
            pfad="projekt.fertigstellung"
            label={t('feld.fertigstellung')}
            wert={projekt.fertigstellung}
            min={1900}
            max={2100}
            onChange={(fertigstellung) => setWert({ ...wert, projekt: { ...projekt, fertigstellung } })}
          />
        </div>
        <MehrsprachigFeld
          pfad="projekt.beschreibung"
          label={t('feld.beschreibung')}
          wert={projekt.beschreibung}
          zeilen={6}
          onChange={(beschreibung) => setWert({ ...wert, projekt: { ...projekt, beschreibung } })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <ZahlFeld
            pfad="projekt.kapazitaet.wert"
            label={t('feld.kapazitaet')}
            wert={projekt.kapazitaet.wert}
            min={0}
            max={1_000_000}
            onChange={(kapWert) => setWert({ ...wert, projekt: { ...projekt, kapazitaet: { ...projekt.kapazitaet, wert: kapWert } } })}
          />
          <MehrsprachigFeld
            pfad="projekt.kapazitaet.einheit"
            label={t('feld.einheit')}
            wert={projekt.kapazitaet.einheit}
            pflicht={false}
            onChange={(einheit) => setWert({ ...wert, projekt: { ...projekt, kapazitaet: { ...projekt.kapazitaet, einheit } } })}
          />
        </div>
        <ZahlFeld
          pfad="projekt.flaecheM2"
          label={t('feld.flaecheM2')}
          wert={projekt.flaecheM2}
          min={0}
          max={1_000_000}
          onChange={(flaecheM2) => setWert({ ...wert, projekt: { ...projekt, flaecheM2 } })}
        />
        <Liste
          pfad="projekt.einrichtungen"
          titel={t('feld.einrichtungen')}
          eintraege={projekt.einrichtungen}
          onChange={(einrichtungen) => setWert({ ...wert, projekt: { ...projekt, einrichtungen } })}
          neu={() => ({ de: '' })}
          renderEintrag={(einrichtung, index, aendern) => (
            <MehrsprachigFeld pfad={`projekt.einrichtungen.${index}`} label={t('feld.einrichtung')} wert={einrichtung} onChange={aendern} />
          )}
        />
        <TextFeld
          pfad="projekt.modell"
          label={t('feld.modell')}
          hinweis={t('hinweis.modell')}
          wert={projekt.modell ?? ''}
          onChange={(modell) => setWert({ ...wert, projekt: { ...projekt, modell: modell.trim() === '' ? null : modell } })}
        />
      </Abschnitt>

      <Abschnitt id="spende" titel={t('abschnitt.spende')}>
        <MehrsprachigFeld
          pfad="spende.titel"
          label={t('feld.titel')}
          wert={spende.titel}
          onChange={(titel) => setWert({ ...wert, spende: { ...spende, titel } })}
        />
        <MehrsprachigFeld
          pfad="spende.text"
          label={t('feld.text')}
          wert={spende.text}
          zeilen={4}
          onChange={(text) => setWert({ ...wert, spende: { ...spende, text } })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <ZahlFeld
            pfad="spende.gesammelt"
            label={t('feld.gesammelt')}
            hinweis={t('hinweis.euro')}
            wert={spende.gesammelt}
            min={0}
            max={1_000_000_000}
            onChange={(gesammelt) => setWert({ ...wert, spende: { ...spende, gesammelt } })}
          />
          <ZahlFeld
            pfad="spende.ziel"
            label={t('feld.ziel')}
            hinweis={t('hinweis.euro')}
            wert={spende.ziel}
            min={1}
            max={1_000_000_000}
            onChange={(ziel) => setWert({ ...wert, spende: { ...spende, ziel } })}
          />
        </div>
        <MehrsprachigFeld
          pfad="spende.bankverbindung"
          label={t('feld.bankverbindung')}
          hinweis={t('hinweis.bankverbindung')}
          wert={spende.bankverbindung}
          pflicht={false}
          onChange={(bankverbindung) => setWert({ ...wert, spende: { ...spende, bankverbindung } })}
        />
      </Abschnitt>

      <Abschnitt id="unterstuetzung" titel={t('abschnitt.unterstuetzung')}>
        <MehrsprachigFeld
          pfad="unterstuetzung.titel"
          label={t('feld.titel')}
          wert={unterstuetzung.titel}
          onChange={(titel) => setWert({ ...wert, unterstuetzung: { ...unterstuetzung, titel } })}
        />
        <MehrsprachigFeld
          pfad="unterstuetzung.text"
          label={t('feld.text')}
          wert={unterstuetzung.text}
          zeilen={4}
          onChange={(text) => setWert({ ...wert, unterstuetzung: { ...unterstuetzung, text } })}
        />
        <MehrsprachigFeld
          pfad="unterstuetzung.dank"
          label={t('feld.dank')}
          wert={unterstuetzung.dank}
          zeilen={3}
          onChange={(dank) => setWert({ ...wert, unterstuetzung: { ...unterstuetzung, dank } })}
        />
      </Abschnitt>

      <Abschnitt id="meilensteine" titel={t('abschnitt.meilensteine')}>
        <Liste
          pfad="meilensteine"
          titel={t('feld.meilensteine')}
          eintraege={wert.meilensteine}
          onChange={(meilensteine) => setWert({ ...wert, meilensteine })}
          neu={(): Meilenstein => ({
            titel: { de: '' },
            beschreibung: { de: '' },
            datum: { de: '' },
            erledigt: false,
          })}
          renderEintrag={(meilenstein, index, aendern) => (
            <>
              <MehrsprachigFeld
                pfad={`meilensteine.${index}.titel`}
                label={t('feld.titel')}
                wert={meilenstein.titel}
                onChange={(titel) => aendern({ ...meilenstein, titel })}
              />
              <MehrsprachigFeld
                pfad={`meilensteine.${index}.beschreibung`}
                label={t('feld.beschreibung')}
                wert={meilenstein.beschreibung}
                zeilen={2}
                onChange={(beschreibung) => aendern({ ...meilenstein, beschreibung })}
              />
              <MehrsprachigFeld
                pfad={`meilensteine.${index}.datum`}
                label={t('feld.datum')}
                wert={meilenstein.datum}
                onChange={(datum) => aendern({ ...meilenstein, datum })}
              />
              <SchalterFeld
                pfad={`meilensteine.${index}.erledigt`}
                label={t('feld.erledigt')}
                wert={meilenstein.erledigt}
                onChange={(erledigt) => aendern({ ...meilenstein, erledigt })}
              />
            </>
          )}
        />
      </Abschnitt>
    </FormularRahmen>
  );
}
