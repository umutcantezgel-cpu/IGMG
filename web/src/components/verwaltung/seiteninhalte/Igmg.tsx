'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { IgmgInhalt } from '@/lib/validierung/seiteninhalte/igmg';
import { Abschnitt, Liste, MehrsprachigFeld, TextFeld } from './Felder';
import type { Mehrsprachig } from './hilfen';
import { FormularRahmen, type Aktion } from './Rahmen';

type Geschichtseintrag = IgmgInhalt['geschichte']['eintraege'][number];

/** Formular „IGMG“ (Blatt V05, Blatt S12): Überblick, Zahlen, Bedeutung, Geschichte, Struktur und Zentralkontakt. */
export function IgmgFormular({ startwerte, nurLesen, aktion }: { startwerte: IgmgInhalt; nurLesen: boolean; aktion: Aktion }) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const [wert, setWert] = useState(startwerte);
  return (
    <FormularRahmen bereich="igmg" wert={wert} aktion={aktion} nurLesen={nurLesen}>
      <Abschnitt id="ueberblick" titel={t('abschnitt.ueberblick')}>
        <MehrsprachigFeld
          pfad="ueberblick.text"
          label={t('feld.text')}
          wert={wert.ueberblick.text}
          zeilen={5}
          onChange={(text) => setWert({ ...wert, ueberblick: { ...wert.ueberblick, text } })}
        />
        <MehrsprachigFeld
          pfad="ueberblick.auftrag"
          label={t('feld.auftrag')}
          wert={wert.ueberblick.auftrag}
          zeilen={4}
          onChange={(auftrag) => setWert({ ...wert, ueberblick: { ...wert.ueberblick, auftrag } })}
        />
      </Abschnitt>

      <Abschnitt id="zahlen" titel={t('abschnitt.zahlen')}>
        <div className="grid gap-4 md:grid-cols-3">
          <TextFeld
            pfad="zahlen.moscheen"
            label={t('feld.moscheen')}
            wert={wert.zahlen.moscheen}
            onChange={(moscheen) => setWert({ ...wert, zahlen: { ...wert.zahlen, moscheen } })}
          />
          <TextFeld
            pfad="zahlen.zweigstellen"
            label={t('feld.zweigstellen')}
            wert={wert.zahlen.zweigstellen}
            onChange={(zweigstellen) => setWert({ ...wert, zahlen: { ...wert.zahlen, zweigstellen } })}
          />
          <TextFeld
            pfad="zahlen.menschenErreicht"
            label={t('feld.menschenErreicht')}
            wert={wert.zahlen.menschenErreicht}
            onChange={(menschenErreicht) => setWert({ ...wert, zahlen: { ...wert.zahlen, menschenErreicht } })}
          />
        </div>
      </Abschnitt>

      <Abschnitt id="bedeutung" titel={t('abschnitt.bedeutung')}>
        <Liste
          pfad="bedeutung.absaetze"
          titel={t('feld.absaetze')}
          eintraege={wert.bedeutung.absaetze}
          maximal={6}
          onChange={(absaetze) => setWert({ ...wert, bedeutung: { absaetze } })}
          neu={(): Mehrsprachig => ({ de: '' })}
          renderEintrag={(absatz, index, aendern) => (
            <MehrsprachigFeld pfad={`bedeutung.absaetze.${index}`} label={t('feld.absatz')} wert={absatz} zeilen={5} onChange={aendern} />
          )}
        />
      </Abschnitt>

      <Abschnitt id="igmg-geschichte" titel={t('abschnitt.igmgGeschichte')}>
        <Liste
          pfad="geschichte.eintraege"
          titel={t('feld.eintraege')}
          eintraege={wert.geschichte.eintraege}
          maximal={12}
          onChange={(eintraege) => setWert({ ...wert, geschichte: { eintraege } })}
          neu={(): Geschichtseintrag => ({ label: { de: '' }, text: { de: '' } })}
          renderEintrag={(eintrag, index, aendern) => (
            <>
              <MehrsprachigFeld
                pfad={`geschichte.eintraege.${index}.label`}
                label={t('feld.label')}
                wert={eintrag.label}
                onChange={(label) => aendern({ ...eintrag, label })}
              />
              <MehrsprachigFeld
                pfad={`geschichte.eintraege.${index}.text`}
                label={t('feld.text')}
                wert={eintrag.text}
                zeilen={4}
                onChange={(text) => aendern({ ...eintrag, text })}
              />
            </>
          )}
        />
      </Abschnitt>

      <Abschnitt id="struktur" titel={t('abschnitt.struktur')}>
        <MehrsprachigFeld
          pfad="struktur.praesidium"
          label={t('feld.praesidium')}
          wert={wert.struktur.praesidium}
          zeilen={4}
          onChange={(praesidium) => setWert({ ...wert, struktur: { ...wert.struktur, praesidium } })}
        />
        <MehrsprachigFeld
          pfad="struktur.ausschuss"
          label={t('feld.ausschuss')}
          wert={wert.struktur.ausschuss}
          zeilen={4}
          onChange={(ausschuss) => setWert({ ...wert, struktur: { ...wert.struktur, ausschuss } })}
        />
      </Abschnitt>

      <Abschnitt id="igmg-kontakt" titel={t('abschnitt.kontakt')}>
        <div className="grid gap-4 md:grid-cols-2">
          <TextFeld
            pfad="kontakt.adresse"
            label={t('feld.adresse')}
            wert={wert.kontakt.adresse}
            onChange={(adresse) => setWert({ ...wert, kontakt: { ...wert.kontakt, adresse } })}
          />
          <TextFeld
            pfad="kontakt.telefon"
            label={t('feld.telefon')}
            wert={wert.kontakt.telefon}
            typ="tel"
            onChange={(telefon) => setWert({ ...wert, kontakt: { ...wert.kontakt, telefon } })}
          />
          <TextFeld
            pfad="kontakt.email"
            label={t('feld.email')}
            wert={wert.kontakt.email}
            typ="email"
            onChange={(email) => setWert({ ...wert, kontakt: { ...wert.kontakt, email } })}
          />
          <TextFeld
            pfad="kontakt.website"
            label={t('feld.website')}
            wert={wert.kontakt.website}
            onChange={(website) => setWert({ ...wert, kontakt: { ...wert.kontakt, website } })}
          />
        </div>
      </Abschnitt>
    </FormularRahmen>
  );
}
