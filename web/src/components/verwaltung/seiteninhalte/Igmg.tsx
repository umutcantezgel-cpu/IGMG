'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { kennzahlAusText } from '@/lib/dachverband/kennzahl';
import { NETZWERK, NETZWERK_SCHLUESSEL } from '@/lib/dachverband/netzwerk';
import type { IgmgInhalt, IgmgVerweis, Kennzahl, ZahlArt } from '@/lib/validierung/seiteninhalte/igmg';
import type { Verweis } from '@/lib/validierung/url';
import { Abschnitt, AuswahlFeld, Liste, MehrsprachigFeld, SchalterFeld, TextFeld, ZahlFeld } from './Felder';
import { optional, type Mehrsprachig } from './hilfen';
import { FormularRahmen, type Aktion } from './Rahmen';

type Geschichtseintrag = IgmgInhalt['geschichte']['eintraege'][number];
type Fachverein = IgmgInhalt['struktur']['fachvereine'][number];
type Frage = IgmgInhalt['faq'][number];
type Adressen = Verweis['url'];
type Zahlen = IgmgInhalt['zahlen'];
/** Art und Zusatz einer Kennzahl mit Zahl (ohne die Zahl selbst). */
type KennzahlAngaben = Omit<Exclude<Kennzahl, string>, 'wert'>;

/** Arten einer Kennzahl wie im Schema (hier als Liste, damit das Schema nicht ins Browser-Bundle gerät). */
const ZAHL_ARTEN = ['genau', 'ueber', 'rund'] as const satisfies readonly ZahlArt[];

/** Alte Texte („über 700“, „2.500“) werden beim Öffnen zu Zahl und Art; Platzhalter und freie Texte bleiben (Plan P1). */
function mitKennzahlen(w: IgmgInhalt): IgmgInhalt {
  const k = <K extends Kennzahl | null>(x: K): K | Kennzahl => (typeof x === 'string' ? kennzahlAusText(x) : x);
  const z = w.zahlen;
  return {
    ...w,
    zahlen: {
      ...z,
      moscheen: k(z.moscheen),
      zweigstellen: k(z.zweigstellen),
      menschenErreicht: k(z.menschenErreicht),
      regionen: k(z.regionen),
      mitglieder: k(z.mitglieder),
      mitwirkende: k(z.mitwirkende),
      region: z.region ? { ...z.region, zweigstellen: k(z.region.zweigstellen) } : null,
    },
  };
}

/** Kurzform einer Adresse für die Auswahl („www.igmg.org/satzung/“). */
const kurzAdresse = (adresse: string) => adresse.replace(/^https:\/\//, '');

/** Adresse je Sprache aus drei Feldern; leere Übersetzungen entfallen. */
const adressen = (de: string, tr: string, en: string): Adressen => ({ de, ...(tr.trim() ? { tr } : {}), ...(en.trim() ? { en } : {}) });

/**
 * Kennzahl (Plan P1): Zahl, Art („genau“, „über“, „rund“) und optionaler Zusatz. Ein alter Text, der sich nicht als Zahl
 * lesen ließ (Platzhalter „[Zahl fehlt: …]“), bleibt sichtbar, bis eine Zahl eingetragen ist. Ohne Zahl gilt `ohneWert`
 * (leer: die Kachel entfällt). Wird die Zahl nur geleert (Rücktaste vor der neuen Ziffer), merkt sich das Feld Art und
 * Zusatz, zeigt sie weiter und setzt sie mit der nächsten Zahl wieder ein; gespeichert wird ohne Zahl trotzdem `ohneWert`.
 */
export function KennzahlFeld({
  pfad,
  label,
  wert,
  ohneWert,
  onChange,
}: {
  pfad: string;
  label: string;
  wert: Kennzahl | null;
  ohneWert: '' | null;
  onChange: (neu: Kennzahl | null) => void;
}) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const zahl = typeof wert === 'object' && wert !== null ? wert : null;
  const text = typeof wert === 'string' && wert ? wert : null;
  /** Art und Zusatz einer geleerten Zahl (nur in diesem Feld, nicht im gespeicherten Inhalt). */
  const [gemerkt, setGemerkt] = useState<KennzahlAngaben | null>(null);
  const angaben: KennzahlAngaben | null = zahl ?? (text ? null : gemerkt);
  /** Art oder Zusatz geändert: an der Kennzahl, oder bei geleerter Zahl nur gemerkt. */
  const setzeAngaben = (neu: KennzahlAngaben) => (zahl ? onChange({ wert: zahl.wert, ...neu }) : setGemerkt(neu));
  return (
    <fieldset className="flex min-w-0 flex-col gap-3 rounded-md border border-linie p-4">
      <legend className="px-1 font-bold">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <ZahlFeld
          pfad={`${pfad}.wert`}
          label={t('feld.wert')}
          wert={zahl?.wert ?? null}
          min={0}
          hinweis={t('igmg.hinweis.kennzahl')}
          onChange={(n) => {
            if (n !== null) {
              onChange({ wert: n, art: angaben?.art ?? 'genau', ...(angaben?.zusatz ? { zusatz: angaben.zusatz } : {}) });
              return;
            }
            if (angaben) setGemerkt({ art: angaben.art, ...(angaben.zusatz ? { zusatz: angaben.zusatz } : {}) });
            onChange(ohneWert);
          }}
        />
        {angaben ? (
          <AuswahlFeld
            pfad={`${pfad}.art`}
            label={t('feld.art')}
            wert={angaben.art}
            optionen={ZAHL_ARTEN.map((art) => ({ wert: art, text: t(`igmg.zahlArt.${art}`) }))}
            onChange={(art) => setzeAngaben({ ...angaben, art })}
          />
        ) : null}
      </div>
      {angaben ? (
        <MehrsprachigFeld
          pfad={`${pfad}.zusatz`}
          label={t('feld.zusatz')}
          wert={angaben.zusatz ?? { de: '' }}
          pflicht={false}
          onChange={(neu) => {
            const zusatz = optional(neu);
            setzeAngaben(zusatz ? { art: angaben.art, zusatz } : { art: angaben.art });
          }}
        />
      ) : null}
      {text ? (
        <TextFeld
          pfad={pfad}
          label={t('feld.kennzahlText')}
          wert={text}
          hinweis={t('igmg.hinweis.kennzahlText')}
          onChange={(neu) => onChange(neu.trim() ? neu : ohneWert)}
        />
      ) : null}
    </fieldset>
  );
}

/** Adresse je Sprache (https): Deutsch Pflicht, Türkisch und Englisch optional. */
function AdressFelder({ pfad, wert, onChange }: { pfad: string; wert: Adressen; onChange: (neu: Adressen) => void }) {
  const t = useTranslations('verwaltung.seiteninhalte');
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <TextFeld
        pfad={`${pfad}.de`}
        label={t('feld.url')}
        wert={wert.de}
        hinweis={t('igmg.hinweis.url')}
        onChange={(de) => onChange(adressen(de, wert.tr ?? '', wert.en ?? ''))}
      />
      <TextFeld
        pfad={`${pfad}.tr`}
        label={`${t('feld.url')} (${t('sprache.tr')})`}
        wert={wert.tr ?? ''}
        onChange={(tr) => onChange(adressen(wert.de, tr, wert.en ?? ''))}
      />
      <TextFeld
        pfad={`${pfad}.en`}
        label={`${t('feld.url')} (${t('sprache.en')})`}
        wert={wert.en ?? ''}
        onChange={(en) => onChange(adressen(wert.de, wert.tr ?? '', en))}
      />
    </div>
  );
}

/** Eigener Verweis: Titel, kurze Beschreibung (optional) und Adresse je Sprache. */
function VerweisFelder({ pfad, wert, onChange }: { pfad: string; wert: Verweis; onChange: (neu: Verweis) => void }) {
  const t = useTranslations('verwaltung.seiteninhalte');
  return (
    <>
      <MehrsprachigFeld
        pfad={`${pfad}.titel`}
        label={t('feld.titel')}
        wert={wert.titel}
        onChange={(titel) => onChange({ ...wert, titel })}
      />
      <MehrsprachigFeld
        pfad={`${pfad}.beschreibung`}
        label={t('feld.beschreibung')}
        wert={wert.beschreibung ?? { de: '' }}
        pflicht={false}
        onChange={(neu) => {
          const beschreibung = optional(neu);
          onChange({ titel: wert.titel, url: wert.url, ...(beschreibung ? { beschreibung } : {}) });
        }}
      />
      <AdressFelder pfad={`${pfad}.url`} wert={wert.url} onChange={(url) => onChange({ ...wert, url })} />
    </>
  );
}

const leererVerweis = (): Verweis => ({ titel: { de: '' }, url: { de: '' } });

/**
 * Verweis zum Dachverband: Ziel aus dem IGMG-Netzwerk (Titel, Beschreibung und Adressen je Sprache werden zentral gepflegt,
 * `src/lib/dachverband/netzwerk.ts`) oder eigener Verweis.
 */
function VerweisEintragFeld({ pfad, wert, onChange }: { pfad: string; wert: IgmgVerweis; onChange: (neu: IgmgVerweis) => void }) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const art = typeof wert === 'string' ? 'netzwerk' : 'eigen';
  return (
    <>
      <AuswahlFeld
        pfad={`${pfad}.verweisArt`}
        label={t('feld.verweisArt')}
        wert={art}
        optionen={[
          { wert: 'netzwerk', text: t('igmg.verweisArt.netzwerk') },
          { wert: 'eigen', text: t('igmg.verweisArt.eigen') },
        ]}
        onChange={(neu) => {
          if (neu !== art) onChange(neu === 'netzwerk' ? 'igmg' : leererVerweis());
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
        <VerweisFelder pfad={pfad} wert={wert} onChange={onChange} />
      )}
    </>
  );
}

/** Formular „IGMG“ (Blatt V05, Blatt S12; Plan Marktstart P1): Überblick, Zahlen, Leitbild, Bedeutung, Geschichte, Struktur, Zentralkontakt, Verweise, Fragen. */
export function IgmgFormular({ startwerte, nurLesen, aktion }: { startwerte: IgmgInhalt; nurLesen: boolean; aktion: Aktion }) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const [wert, setWert] = useState(() => mitKennzahlen(startwerte));
  const zahlen = wert.zahlen;
  const setZahlen = (teil: Partial<Zahlen>) => setWert({ ...wert, zahlen: { ...zahlen, ...teil } });
  const region = zahlen.region;
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
        <p className="text-16 text-tinte-2">{t('igmg.hinweis.zahlen')}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <KennzahlFeld
            pfad="zahlen.moscheen"
            label={t('feld.moscheen')}
            wert={zahlen.moscheen}
            ohneWert=""
            onChange={(k) => setZahlen({ moscheen: k ?? '' })}
          />
          <KennzahlFeld
            pfad="zahlen.zweigstellen"
            label={t('feld.zweigstellen')}
            wert={zahlen.zweigstellen}
            ohneWert=""
            onChange={(k) => setZahlen({ zweigstellen: k ?? '' })}
          />
          <KennzahlFeld
            pfad="zahlen.regionen"
            label={t('feld.regionen')}
            wert={zahlen.regionen}
            ohneWert={null}
            onChange={(regionen) => setZahlen({ regionen })}
          />
          <KennzahlFeld
            pfad="zahlen.mitglieder"
            label={t('feld.mitglieder')}
            wert={zahlen.mitglieder}
            ohneWert={null}
            onChange={(mitglieder) => setZahlen({ mitglieder })}
          />
          <KennzahlFeld
            pfad="zahlen.mitwirkende"
            label={t('feld.mitwirkende')}
            wert={zahlen.mitwirkende}
            ohneWert={null}
            onChange={(mitwirkende) => setZahlen({ mitwirkende })}
          />
          <KennzahlFeld
            pfad="zahlen.menschenErreicht"
            label={t('feld.menschenErreicht')}
            wert={zahlen.menschenErreicht}
            ohneWert=""
            onChange={(k) => setZahlen({ menschenErreicht: k ?? '' })}
          />
        </div>
        <fieldset className="flex flex-col gap-3 rounded-md border border-linie p-4">
          <legend className="px-1 font-bold">{t('feld.region')}</legend>
          <TextFeld
            pfad="zahlen.region.name"
            label={t('feld.name')}
            wert={region?.name ?? ''}
            hinweis={t('igmg.hinweis.region')}
            onChange={(name) => {
              const zweigstellen = region?.zweigstellen ?? '';
              setZahlen({ region: name.trim() || zweigstellen !== '' ? { name, zweigstellen } : null });
            }}
          />
          <KennzahlFeld
            pfad="zahlen.region.zweigstellen"
            label={t('feld.zweigstellen')}
            wert={region ? region.zweigstellen : null}
            ohneWert=""
            onChange={(k) => {
              const name = region?.name ?? '';
              const zweigstellen = k ?? '';
              setZahlen({ region: name.trim() || zweigstellen !== '' ? { name, zweigstellen } : null });
            }}
          />
        </fieldset>
        <TextFeld
          pfad="zahlen.stand"
          label={t('feld.stand')}
          wert={zahlen.stand}
          hinweis={t('igmg.hinweis.zahlenStand')}
          onChange={(stand) => setZahlen({ stand: stand.trim() })}
        />
        <SchalterFeld
          pfad="zahlen.quelleAngeben"
          label={t('igmg.quelleAngeben')}
          wert={zahlen.quelle !== null}
          onChange={(an) => setZahlen({ quelle: an ? (zahlen.quelle ?? leererVerweis()) : null })}
        />
        {zahlen.quelle ? <VerweisFelder pfad="zahlen.quelle" wert={zahlen.quelle} onChange={(quelle) => setZahlen({ quelle })} /> : null}
      </Abschnitt>

      <Abschnitt id="leitbild" titel={t('abschnitt.leitbild')}>
        <Liste
          pfad="leitbild.punkte"
          titel={t('feld.punkte')}
          eintraege={wert.leitbild.punkte}
          maximal={8}
          onChange={(punkte) => setWert({ ...wert, leitbild: { ...wert.leitbild, punkte } })}
          neu={(): Mehrsprachig => ({ de: '' })}
          renderEintrag={(punkt, index, aendern) => (
            <MehrsprachigFeld pfad={`leitbild.punkte.${index}`} label={t('feld.punkt')} wert={punkt} zeilen={2} onChange={aendern} />
          )}
        />
        <SchalterFeld
          pfad="leitbild.quelleAngeben"
          label={t('igmg.quelleAngeben')}
          wert={wert.leitbild.quelle !== null}
          onChange={(an) =>
            setWert({ ...wert, leitbild: { ...wert.leitbild, quelle: an ? (wert.leitbild.quelle ?? 'grundsaetze') : null } })
          }
        />
        {wert.leitbild.quelle !== null ? (
          <VerweisEintragFeld
            pfad="leitbild.quelle"
            wert={wert.leitbild.quelle}
            onChange={(quelle) => setWert({ ...wert, leitbild: { ...wert.leitbild, quelle } })}
          />
        ) : null}
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
        <MehrsprachigFeld
          pfad="struktur.gremien"
          label={t('feld.gremien')}
          wert={wert.struktur.gremien}
          zeilen={5}
          pflicht={false}
          onChange={(gremien) => setWert({ ...wert, struktur: { ...wert.struktur, gremien } })}
        />
        <Liste
          pfad="struktur.fachvereine"
          titel={t('feld.fachvereine')}
          eintraege={wert.struktur.fachvereine}
          maximal={16}
          onChange={(fachvereine) => setWert({ ...wert, struktur: { ...wert.struktur, fachvereine } })}
          neu={(): Fachverein => ({ name: '', bereich: { de: '' }, url: null })}
          renderEintrag={(verein, index, aendern) => (
            <>
              <TextFeld
                pfad={`struktur.fachvereine.${index}.name`}
                label={t('feld.name')}
                wert={verein.name}
                pflicht
                onChange={(name) => aendern({ ...verein, name })}
              />
              <MehrsprachigFeld
                pfad={`struktur.fachvereine.${index}.bereich`}
                label={t('feld.bereich')}
                wert={verein.bereich}
                onChange={(bereich) => aendern({ ...verein, bereich })}
              />
              <AdressFelder
                pfad={`struktur.fachvereine.${index}.url`}
                wert={verein.url ?? { de: '' }}
                onChange={(url) => aendern({ ...verein, url: url.de.trim() || url.tr || url.en ? url : null })}
              />
            </>
          )}
        />
      </Abschnitt>

      <Abschnitt id="igmg-kontakt" titel={t('abschnitt.kontakt')}>
        <div className="grid gap-4 md:grid-cols-2">
          <TextFeld
            pfad="kontakt.adresse"
            label={t('feld.adresse')}
            wert={wert.kontakt.adresse}
            zeilen={2}
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
            hinweis={t('igmg.hinweis.website')}
            onChange={(website) => setWert({ ...wert, kontakt: { ...wert.kontakt, website } })}
          />
          <TextFeld
            pfad="kontakt.register"
            label={t('feld.register')}
            wert={wert.kontakt.register}
            onChange={(register) => setWert({ ...wert, kontakt: { ...wert.kontakt, register } })}
          />
        </div>
      </Abschnitt>

      <Abschnitt id="verweise" titel={t('abschnitt.verweise')}>
        <p className="text-16 text-tinte-2">{t('igmg.hinweis.verweise')}</p>
        <Liste
          pfad="verweise"
          titel={t('feld.verweise')}
          titelVerborgen
          eintraege={wert.verweise}
          maximal={16}
          onChange={(verweise) => setWert({ ...wert, verweise })}
          neu={(): IgmgVerweis => 'igmg'}
          renderEintrag={(eintrag, index, aendern) => <VerweisEintragFeld pfad={`verweise.${index}`} wert={eintrag} onChange={aendern} />}
        />
      </Abschnitt>

      <Abschnitt id="faq" titel={t('abschnitt.faq')}>
        <p className="text-16 text-tinte-2">{t('igmg.hinweis.faq')}</p>
        <Liste
          pfad="faq"
          titel={t('feld.faq')}
          titelVerborgen
          eintraege={wert.faq}
          maximal={8}
          onChange={(faq) => setWert({ ...wert, faq })}
          neu={(): Frage => ({ frage: { de: '' }, antwort: { de: '' } })}
          renderEintrag={(eintrag, index, aendern) => (
            <>
              <MehrsprachigFeld
                pfad={`faq.${index}.frage`}
                label={t('feld.frage')}
                wert={eintrag.frage}
                onChange={(frage) => aendern({ ...eintrag, frage })}
              />
              <MehrsprachigFeld
                pfad={`faq.${index}.antwort`}
                label={t('feld.antwort')}
                wert={eintrag.antwort}
                zeilen={5}
                onChange={(antwort) => aendern({ ...eintrag, antwort })}
              />
            </>
          )}
        />
      </Abschnitt>

      <Abschnitt id="igmg-stand" titel={t('abschnitt.stand')}>
        <TextFeld
          pfad="stand"
          label={t('feld.stand')}
          wert={wert.stand}
          hinweis={t('igmg.hinweis.stand')}
          onChange={(stand) => setWert({ ...wert, stand: stand.trim() })}
        />
      </Abschnitt>
    </FormularRahmen>
  );
}
