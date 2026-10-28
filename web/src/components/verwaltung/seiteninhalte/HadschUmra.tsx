'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { NETZWERK, NETZWERK_SCHLUESSEL } from '@/lib/dachverband/netzwerk';
import { youtubeIdAus } from '@/lib/einbettung/youtube';
import type { HadschUmraInhalt, HadschUmraZiel } from '@/lib/validierung/seiteninhalte/hadsch-umra';
import { Abschnitt, AuswahlFeld, Liste, MehrsprachigFeld, SchalterFeld, TextFeld } from './Felder';
import { optional } from './hilfen';
import { FormularRahmen, type Aktion } from './Rahmen';

type Hinweis = HadschUmraInhalt['hinweise'][number];
type Programm = HadschUmraInhalt['programme'][number];
type Abflug = HadschUmraInhalt['abfluege']['eintraege'][number];
type Unterlage = HadschUmraInhalt['unterlagen'][number];
type Video = HadschUmraInhalt['videos'][number];
type Frage = HadschUmraInhalt['faq'][number];
type EigeneAdressen = Exclude<HadschUmraZiel, string>;

/** Auswahlwerte wie im Schema (hier als Listen, damit das Schema nicht ins Browser-Bundle gerät). */
const PROGRAMM_ARTEN = ['hadsch', 'umra', 'kultur'] as const satisfies readonly Programm['art'][];
const ABFLUG_ARTEN = ['hadsch', 'umra'] as const satisfies readonly Abflug['art'][];
const UNTERLAGEN_SPRACHEN = ['de', 'tr', 'de-tr', 'en', 'mehrsprachig'] as const satisfies readonly Unterlage['sprache'][];
const SEITEN_SPRACHEN = ['de', 'tr', 'en'] as const;

/** Höchstzahlen wie im Schema. */
const MAX = { hinweise: 6, programme: 12, abfluege: 24, quellen: 4, unterlagen: 12, videos: 12, faq: 10 } as const;

/** Kurzform einer Adresse für die Auswahl („www.igmgreisen.com/de/hadsch/“). */
const kurzAdresse = (adresse: string) => adresse.replace(/^https:\/\//, '');

/** Leere Eingabe entfällt (optionale Felder). */
const ohneLeer = (wert: string) => wert.trim() || undefined;

/** Eigene Adressen: leere Übersetzungen und eine Hauptsprache Deutsch (Standard) entfallen. */
function eigeneAdressen(de: string, tr: string, en: string, seitenSprache: EigeneAdressen['seitenSprache']): EigeneAdressen {
  return {
    de,
    ...(tr.trim() ? { tr: tr.trim() } : {}),
    ...(en.trim() ? { en: en.trim() } : {}),
    ...(seitenSprache && seitenSprache !== 'de' ? { seitenSprache } : {}),
  };
}

/**
 * Linkziel: Ziel aus dem IGMG-Netzwerk (Adressen je Sprache zentral gepflegt in `netzwerk.ts`, z. B. die Seiten von IGMG
 * Reisen) oder eigene Adressen bei der IGMG bzw. IGMG Reisen; erlaubt sind nur Hosts aus dem Netzwerk.
 */
function ZielFeld({
  pfad,
  label,
  wert,
  onChange,
}: {
  pfad: string;
  label: string;
  wert: HadschUmraZiel;
  onChange: (neu: HadschUmraZiel) => void;
}) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const art = typeof wert === 'string' ? 'netzwerk' : 'eigen';
  return (
    <fieldset className="flex min-w-0 flex-col gap-3 rounded-md border border-linie p-4">
      <legend className="px-1 font-bold">{label}</legend>
      <AuswahlFeld
        pfad={`${pfad}.zielArt`}
        label={t('feld.zielArt')}
        wert={art}
        optionen={[
          { wert: 'netzwerk', text: t('hadschUmra.zielArt.netzwerk') },
          { wert: 'eigen', text: t('hadschUmra.zielArt.eigen') },
        ]}
        onChange={(neu) => {
          if (neu !== art) onChange(neu === 'netzwerk' ? 'reisen' : { de: '' });
        }}
      />
      {typeof wert === 'string' ? (
        <AuswahlFeld
          pfad={pfad}
          label={t('feld.netzwerkZiel')}
          wert={wert}
          optionen={NETZWERK_SCHLUESSEL.map((s) => ({ wert: s, text: `${s} – ${kurzAdresse(NETZWERK[s].url.de)}` }))}
          onChange={onChange}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <TextFeld
              pfad={`${pfad}.de`}
              label={t('feld.url')}
              hinweis={t('hadschUmra.hinweis.url')}
              pflicht
              wert={wert.de}
              onChange={(de) => onChange(eigeneAdressen(de.trim(), wert.tr ?? '', wert.en ?? '', wert.seitenSprache))}
            />
            <TextFeld
              pfad={`${pfad}.tr`}
              label={t('feld.urlTr')}
              wert={wert.tr ?? ''}
              onChange={(tr) => onChange(eigeneAdressen(wert.de, tr, wert.en ?? '', wert.seitenSprache))}
            />
            <TextFeld
              pfad={`${pfad}.en`}
              label={t('feld.urlEn')}
              wert={wert.en ?? ''}
              onChange={(en) => onChange(eigeneAdressen(wert.de, wert.tr ?? '', en, wert.seitenSprache))}
            />
          </div>
          <AuswahlFeld
            pfad={`${pfad}.seitenSprache`}
            label={t('feld.seitenSprache')}
            wert={wert.seitenSprache ?? 'de'}
            optionen={SEITEN_SPRACHEN.map((s) => ({ wert: s, text: t(`sprache.${s}`) }))}
            onChange={(s) => onChange(eigeneAdressen(wert.de, wert.tr ?? '', wert.en ?? '', s))}
          />
        </>
      )}
    </fieldset>
  );
}

/** Formular „Hadsch & Umra“ (Plan Marktstart P4): Einleitung, Fristen, Programme, Abflüge, Anmeldung, Unterlagen, Videos, Fragen. */
export function HadschUmraFormular({ startwerte, nurLesen, aktion }: { startwerte: HadschUmraInhalt; nurLesen: boolean; aktion: Aktion }) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const [wert, setWert] = useState(startwerte);
  const abfluege = wert.abfluege;
  const setAbfluege = (teil: Partial<HadschUmraInhalt['abfluege']>) => setWert({ ...wert, abfluege: { ...abfluege, ...teil } });
  const person = wert.ansprechperson;
  return (
    <FormularRahmen
      bereich="hadsch-umra"
      wert={wert}
      aktion={aktion}
      nurLesen={nurLesen}
      hinweis={<p className="max-w-text text-16 text-tinte-2">{t('hadschUmra.einleitung')}</p>}
    >
      <Abschnitt id="einleitung" titel={t('abschnitt.einleitung')}>
        <MehrsprachigFeld
          pfad="einleitung"
          label={t('feld.einleitung')}
          hinweis={t('hadschUmra.hinweis.einleitung')}
          wert={wert.einleitung}
          zeilen={5}
          onChange={(einleitung) => setWert({ ...wert, einleitung })}
        />
      </Abschnitt>

      <Abschnitt id="hinweise" titel={t('abschnitt.hinweise')}>
        <p className="text-16 text-tinte-2">{t('hadschUmra.hinweis.hinweise')}</p>
        <Liste
          pfad="hinweise"
          titel={t('feld.hinweise')}
          titelVerborgen
          eintraege={wert.hinweise}
          maximal={MAX.hinweise}
          onChange={(hinweise) => setWert({ ...wert, hinweise })}
          neu={(): Hinweis => ({ text: { de: '' }, bis: '' })}
          renderEintrag={(h, i, aendern) => (
            <>
              <MehrsprachigFeld
                pfad={`hinweise.${i}.text`}
                label={t('feld.text')}
                wert={h.text}
                zeilen={2}
                onChange={(text) => aendern({ ...h, text })}
              />
              <TextFeld
                pfad={`hinweise.${i}.bis`}
                label={t('feld.anzeigenBis')}
                hinweis={t('hadschUmra.hinweis.datum')}
                pflicht
                wert={h.bis}
                onChange={(bis) => aendern({ ...h, bis: bis.trim() })}
              />
              <SchalterFeld
                pfad={`hinweise.${i}.mitLink`}
                label={t('feld.mitLink')}
                wert={h.link !== undefined}
                onChange={(an) => aendern(an ? { ...h, link: 'reisenHadsch' } : { text: h.text, bis: h.bis })}
              />
              {h.link !== undefined ? (
                <ZielFeld pfad={`hinweise.${i}.link`} label={t('feld.link')} wert={h.link} onChange={(link) => aendern({ ...h, link })} />
              ) : null}
            </>
          )}
        />
      </Abschnitt>

      <Abschnitt id="programme" titel={t('abschnitt.programme')}>
        <p className="text-16 text-tinte-2">{t('hadschUmra.hinweis.programme')}</p>
        <Liste
          pfad="programme"
          titel={t('feld.programme')}
          titelVerborgen
          eintraege={wert.programme}
          maximal={MAX.programme}
          onChange={(programme) => setWert({ ...wert, programme })}
          neu={(): Programm => ({ art: 'umra', titel: { de: '' }, link: 'reisenUmra' })}
          renderEintrag={(p, i, aendern) => (
            <>
              <AuswahlFeld
                pfad={`programme.${i}.art`}
                label={t('feld.art')}
                wert={p.art}
                optionen={PROGRAMM_ARTEN.map((a) => ({ wert: a, text: t(`hadschUmra.art.${a}`) }))}
                onChange={(art) => aendern({ ...p, art })}
              />
              <MehrsprachigFeld
                pfad={`programme.${i}.titel`}
                label={t('feld.titel')}
                wert={p.titel}
                onChange={(titel) => aendern({ ...p, titel })}
              />
              <MehrsprachigFeld
                pfad={`programme.${i}.text`}
                label={t('feld.text')}
                pflicht={false}
                zeilen={3}
                wert={p.text ?? { de: '' }}
                onChange={(neu) => aendern({ ...p, text: optional(neu) })}
              />
              <ZielFeld pfad={`programme.${i}.link`} label={t('feld.link')} wert={p.link} onChange={(link) => aendern({ ...p, link })} />
            </>
          )}
        />
      </Abschnitt>

      <Abschnitt id="abfluege" titel={t('abschnitt.abfluege')}>
        <p className="text-16 text-tinte-2">{t('hadschUmra.hinweis.abfluege')}</p>
        <TextFeld
          pfad="abfluege.stand"
          label={t('feld.stand')}
          hinweis={t('hadschUmra.hinweis.datum')}
          wert={abfluege.stand ?? ''}
          onChange={(stand) => setAbfluege({ stand: ohneLeer(stand) })}
        />
        <Liste
          pfad="abfluege.quellen"
          titel={t('feld.quellen')}
          eintraege={abfluege.quellen}
          maximal={MAX.quellen}
          onChange={(quellen) => setAbfluege({ quellen })}
          neu={(): HadschUmraZiel => 'reisenUmra'}
          renderEintrag={(q, i, aendern) => (
            <ZielFeld pfad={`abfluege.quellen.${i}`} label={t('feld.quelle')} wert={q} onChange={aendern} />
          )}
        />
        <Liste
          pfad="abfluege.eintraege"
          titel={t('feld.abfluege')}
          eintraege={abfluege.eintraege}
          maximal={MAX.abfluege}
          onChange={(eintraege) => setAbfluege({ eintraege })}
          neu={(): Abflug => ({ art: 'umra', gruppe: { de: '' }, abflughafen: 'FRA', hin: '', rueck: '' })}
          renderEintrag={(a, i, aendern) => (
            <>
              <AuswahlFeld
                pfad={`abfluege.eintraege.${i}.art`}
                label={t('feld.art')}
                wert={a.art}
                optionen={ABFLUG_ARTEN.map((art) => ({ wert: art, text: t(`hadschUmra.art.${art}`) }))}
                onChange={(art) => aendern({ ...a, art })}
              />
              <MehrsprachigFeld
                pfad={`abfluege.eintraege.${i}.gruppe`}
                label={t('feld.gruppe')}
                hinweis={t('hadschUmra.hinweis.gruppe')}
                wert={a.gruppe}
                onChange={(gruppe) => aendern({ ...a, gruppe })}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <TextFeld
                  pfad={`abfluege.eintraege.${i}.abflughafen`}
                  label={t('feld.abflughafen')}
                  hinweis={t('hadschUmra.hinweis.flughafen')}
                  wert={a.abflughafen ?? ''}
                  onChange={(code) => aendern({ ...a, abflughafen: ohneLeer(code.toUpperCase()) })}
                />
                <TextFeld
                  pfad={`abfluege.eintraege.${i}.zielflughafen`}
                  label={t('feld.zielflughafen')}
                  wert={a.zielflughafen ?? ''}
                  onChange={(code) => aendern({ ...a, zielflughafen: ohneLeer(code.toUpperCase()) })}
                />
                <TextFeld
                  pfad={`abfluege.eintraege.${i}.hin`}
                  label={t('feld.hin')}
                  hinweis={t('hadschUmra.hinweis.datum')}
                  pflicht
                  wert={a.hin}
                  onChange={(hin) => aendern({ ...a, hin: hin.trim() })}
                />
                <TextFeld
                  pfad={`abfluege.eintraege.${i}.rueck`}
                  label={t('feld.rueck')}
                  hinweis={t('hadschUmra.hinweis.datum')}
                  pflicht
                  wert={a.rueck}
                  onChange={(rueck) => aendern({ ...a, rueck: rueck.trim() })}
                />
              </div>
            </>
          )}
        />
      </Abschnitt>

      <Abschnitt id="anmeldung" titel={t('abschnitt.anmeldung')}>
        <MehrsprachigFeld
          pfad="anmeldung.text"
          label={t('feld.text')}
          hinweis={t('hadschUmra.hinweis.anmeldung')}
          wert={wert.anmeldung.text}
          zeilen={5}
          onChange={(text) => setWert({ ...wert, anmeldung: { ...wert.anmeldung, text } })}
        />
        <SchalterFeld
          pfad="anmeldung.mitStelle"
          label={t('feld.mitStelle')}
          wert={wert.anmeldung.stelle !== undefined}
          onChange={(an) =>
            setWert({ ...wert, anmeldung: an ? { ...wert.anmeldung, stelle: 'reisenZweigstellen' } : { text: wert.anmeldung.text } })
          }
        />
        {wert.anmeldung.stelle !== undefined ? (
          <ZielFeld
            pfad="anmeldung.stelle"
            label={t('feld.stelle')}
            wert={wert.anmeldung.stelle}
            onChange={(stelle) => setWert({ ...wert, anmeldung: { ...wert.anmeldung, stelle } })}
          />
        ) : null}
      </Abschnitt>

      <Abschnitt id="ansprechperson" titel={t('abschnitt.ansprechperson')}>
        <p className="text-16 text-tinte-2">{t('hadschUmra.hinweis.ansprechperson')}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <TextFeld
            pfad="ansprechperson.name"
            label={t('feld.name')}
            pflicht
            wert={person.name}
            onChange={(name) => setWert({ ...wert, ansprechperson: { ...person, name } })}
          />
          <TextFeld
            pfad="ansprechperson.telefon"
            label={t('feld.telefon')}
            typ="tel"
            pflicht
            wert={person.telefon}
            onChange={(telefon) => setWert({ ...wert, ansprechperson: { ...person, telefon } })}
          />
        </div>
        <MehrsprachigFeld
          pfad="ansprechperson.sprechzeit"
          label={t('feld.sprechzeit')}
          pflicht={false}
          wert={person.sprechzeit ?? { de: '' }}
          onChange={(neu) => {
            const sprechzeit = optional(neu);
            setWert({ ...wert, ansprechperson: { name: person.name, telefon: person.telefon, ...(sprechzeit ? { sprechzeit } : {}) } });
          }}
        />
      </Abschnitt>

      <Abschnitt id="unterlagen" titel={t('abschnitt.unterlagen')}>
        <p className="text-16 text-tinte-2">{t('hadschUmra.hinweis.unterlagen')}</p>
        <Liste
          pfad="unterlagen"
          titel={t('feld.unterlagen')}
          titelVerborgen
          eintraege={wert.unterlagen}
          maximal={MAX.unterlagen}
          onChange={(unterlagen) => setWert({ ...wert, unterlagen })}
          neu={(): Unterlage => ({ titel: { de: '' }, url: 'reisenDokumente', sprache: 'de' })}
          renderEintrag={(u, i, aendern) => (
            <>
              <MehrsprachigFeld
                pfad={`unterlagen.${i}.titel`}
                label={t('feld.titel')}
                wert={u.titel}
                onChange={(titel) => aendern({ ...u, titel })}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <AuswahlFeld
                  pfad={`unterlagen.${i}.sprache`}
                  label={t('feld.unterlagenSprache')}
                  wert={u.sprache}
                  optionen={UNTERLAGEN_SPRACHEN.map((s) => ({ wert: s, text: t(`hadschUmra.unterlagenSprache.${s}`) }))}
                  onChange={(sprache) => aendern({ ...u, sprache })}
                />
                <TextFeld
                  pfad={`unterlagen.${i}.jahr`}
                  label={t('feld.jahr')}
                  hinweis={t('hadschUmra.hinweis.jahr')}
                  wert={u.jahr ?? ''}
                  onChange={(jahr) => aendern({ ...u, jahr: ohneLeer(jahr) })}
                />
              </div>
              <ZielFeld pfad={`unterlagen.${i}.url`} label={t('feld.link')} wert={u.url} onChange={(url) => aendern({ ...u, url })} />
            </>
          )}
        />
      </Abschnitt>

      <Abschnitt id="videos" titel={t('abschnitt.videos')}>
        <p className="text-16 text-tinte-2">{t('hadschUmra.hinweis.videos')}</p>
        <Liste
          pfad="videos"
          titel={t('feld.videos')}
          titelVerborgen
          eintraege={wert.videos}
          maximal={MAX.videos}
          onChange={(videos) => setWert({ ...wert, videos })}
          neu={(): Video => ({ youtubeId: '', titel: { de: '' } })}
          renderEintrag={(v, i, aendern) => (
            <>
              <TextFeld
                pfad={`videos.${i}.youtubeId`}
                label={t('feld.youtubeId')}
                hinweis={t('hadschUmra.hinweis.youtubeId')}
                pflicht
                wert={v.youtubeId}
                // Eine eingefügte Adresse (youtu.be, watch?v=, /embed/, /shorts/) wird sofort zur ID; der Server prüft erneut
                onChange={(roh) => aendern({ ...v, youtubeId: youtubeIdAus(roh) ?? roh.trim() })}
              />
              <MehrsprachigFeld
                pfad={`videos.${i}.titel`}
                label={t('feld.titel')}
                wert={v.titel}
                onChange={(titel) => aendern({ ...v, titel })}
              />
              <TextFeld
                pfad={`videos.${i}.jahr`}
                label={t('feld.jahr')}
                hinweis={t('hadschUmra.hinweis.jahr')}
                wert={v.jahr ?? ''}
                onChange={(jahr) => aendern({ ...v, jahr: ohneLeer(jahr) })}
              />
            </>
          )}
        />
      </Abschnitt>

      <Abschnitt id="faq" titel={t('abschnitt.faq')}>
        <p className="text-16 text-tinte-2">{t('hadschUmra.hinweis.faq')}</p>
        <Liste
          pfad="faq"
          titel={t('feld.faq')}
          titelVerborgen
          eintraege={wert.faq}
          maximal={MAX.faq}
          onChange={(faq) => setWert({ ...wert, faq })}
          neu={(): Frage => ({ frage: { de: '' }, antwort: { de: '' } })}
          renderEintrag={(f, i, aendern) => (
            <>
              <MehrsprachigFeld
                pfad={`faq.${i}.frage`}
                label={t('feld.frage')}
                wert={f.frage}
                onChange={(frage) => aendern({ ...f, frage })}
              />
              <MehrsprachigFeld
                pfad={`faq.${i}.antwort`}
                label={t('feld.antwort')}
                wert={f.antwort}
                zeilen={5}
                onChange={(antwort) => aendern({ ...f, antwort })}
              />
            </>
          )}
        />
      </Abschnitt>

      <Abschnitt id="hadsch-umra-stand" titel={t('abschnitt.stand')}>
        <TextFeld
          pfad="stand"
          label={t('feld.stand')}
          hinweis={t('hadschUmra.hinweis.stand')}
          wert={wert.stand}
          onChange={(stand) => setWert({ ...wert, stand: stand.trim() })}
        />
      </Abschnitt>
    </FormularRahmen>
  );
}
