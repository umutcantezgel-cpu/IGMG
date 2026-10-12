'use client';

import type { JSONContent } from '@tiptap/core';
import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { BildFeld } from '@/components/verwaltung/medienwahl/BildFeld';
import { MedienWahlDialog, type MedienWahlHandle } from '@/components/verwaltung/medienwahl/MedienWahlDialog';
import { RichTextEditor } from '@/components/verwaltung/RichTextEditor';
import { RichText } from '@/components/website/RichText';
import { cn } from '@/lib/utils';
import type { SpeicherZustand } from '@/server/actions/neuigkeiten';
import type { BildWahl } from '@/server/queries/verwaltung/medien';
import type { FormularWerte } from './formularwerte';

type Aktion = (vorher: SpeicherZustand, fd: FormData) => Promise<SpeicherZustand>;
type Fehler = Record<string, string> | undefined;
type Sprache = 'De' | 'Tr' | 'En';
/** Tiptap-Dokumente der drei Sprachen als Startwert der Editoren (`null` = kein Text). */
type Texte = { de: JSONContent | null; tr: JSONContent | null; en: JSONContent | null };

function Abschnitt({ titel, kinder }: { titel: string; kinder: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{titel}</legend>
      <div className="clear-both grid gap-4 md:grid-cols-2">{kinder}</div>
    </fieldset>
  );
}

/** Feldname (ohne Sprachendung) → Beschriftungsschlüssel unter `formular` für die Fehler-Zusammenfassung. */
const FELD_LABEL: Record<string, string> = {
  titel: 'titel',
  kurztext: 'kurztext',
  inhalt: 'inhalt',
  kategorie: 'kategorie',
  organisation: 'organisation',
  status: 'status',
  veroeffentlichtAm: 'veroeffentlichtAm',
  slug: 'slug',
  lesezeit: 'lesezeit',
  schlagwoerter: 'schlagwoerter',
};

const alsText = (w: FormularWerte, k: string) => (typeof w[k] === 'string' ? (w[k] as string) : '');
const istAn = (w: FormularWerte, k: string) => w[k] === true || w[k] === 'on' || w[k] === 'true';

/**
 * Formular „Neuigkeit“ (V03, K-07): Inhalt, Zuordnung, Veröffentlichung, Schlagwörter und Übersetzungen. Der Server
 * prüft mit demselben Schema (`neuigkeitSchema`). Die Texteditoren liegen in verborgenen Feldern als Tiptap-JSON.
 */
export function NeuigkeitsFormular({
  aktion,
  startwerte,
  texte,
  modus,
  kategorien,
  organisationen,
  bilder,
  nurLesen = false,
}: {
  aktion: Aktion;
  startwerte: FormularWerte;
  texte: Texte;
  modus: 'neu' | 'bearbeiten';
  kategorien: { wert: string; label: string }[];
  organisationen: { wert: string; label: string }[];
  bilder: BildWahl[];
  nurLesen?: boolean;
}) {
  const t = useTranslations('verwaltung.neuigkeiten');
  const tv = useTranslations('verwaltung');
  const tm = useTranslations('verwaltung.medienwahl');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const w: FormularWerte = (zustand.werte as FormularWerte | undefined) ?? startwerte;
  const fehler: Fehler = zustand.feldFehler;
  const f = (feld: string) => (fehler?.[feld] ? t(`fehler.${fehler[feld]}`) : undefined);
  const meldungRef = useRef<HTMLDivElement>(null);
  const basisId = useId();
  const id = (feld: string) => `${basisId}-${feld}`;
  // Eine Mediathek-Auswahl für „Bild einfügen“ in allen drei Texteditoren
  const medienWahl = useRef<MedienWahlHandle>(null);
  const bildAuswahl = useCallback(() => medienWahl.current?.waehle() ?? Promise.resolve(null), []);

  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldungRef.current?.focus();
  }, [zustand]);

  const pflicht = tv('pflichtfeld');
  const mitSprache = (feld: string, s: 'Tr' | 'En') =>
    t('formular.feldSprache', { feld: t(`formular.${feld}`), sprache: t(`formular.sprache.${s}`) });

  const text = (feld: string, label: string, opt: { hinweis?: string; pflicht?: boolean; platzhalter?: string; max?: number } = {}) => (
    <Rahmen
      id={id(feld)}
      label={label}
      hinweis={opt.hinweis}
      fehler={f(feld)}
      pflicht={opt.pflicht ? pflicht : undefined}
      kinder={(aria) => (
        <input
          {...aria}
          name={feld}
          type="text"
          defaultValue={alsText(w, feld)}
          required={opt.pflicht}
          maxLength={opt.max}
          placeholder={opt.platzhalter}
          className={eingabe}
        />
      )}
    />
  );

  const bereich = (feld: string, label: string, opt: { hinweis?: string; zeilen?: number; max?: number } = {}) => (
    <div className="md:col-span-2">
      <Rahmen
        id={id(feld)}
        label={label}
        hinweis={opt.hinweis}
        fehler={f(feld)}
        kinder={(aria) => (
          <textarea
            {...aria}
            name={feld}
            rows={opt.zeilen ?? 4}
            maxLength={opt.max}
            defaultValue={alsText(w, feld)}
            className={cn(eingabe, 'py-2.5')}
          />
        )}
      />
    </div>
  );

  const auswahl = (feld: string, label: string, optionen: { wert: string; label: string }[], hinweis?: string) => (
    <Rahmen
      id={id(feld)}
      label={label}
      hinweis={hinweis}
      fehler={f(feld)}
      kinder={(aria) => (
        <select {...aria} name={feld} defaultValue={alsText(w, feld)} className={eingabe}>
          {optionen.map((o) => (
            <option key={o.wert} value={o.wert}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    />
  );

  const schalter = (feld: string, label: string) => (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 font-bold">
      <input type="checkbox" name={feld} defaultChecked={istAn(w, feld)} className="size-6 accent-gruen-700" />
      {label}
    </label>
  );

  /** Texteditor (Tiptap, ADR 0006). Im Papierkorb und ohne Bearbeitungsrecht zeigt die Seite nur den gespeicherten Text. */
  const editor = (feld: 'inhaltDe' | 'inhaltTr' | 'inhaltEn', label: string, startwert: JSONContent | null, hinweis?: string) => (
    <div id={id(feld)} tabIndex={-1} className="flex min-w-0 flex-col gap-1.5 outline-none md:col-span-2">
      {nurLesen ? (
        <>
          <p className="font-bold">{label}</p>
          <div className="rounded-md border border-linie bg-sand p-4">
            {startwert ? <RichText doc={startwert} /> : <p className="text-tinte-2">{t('formular.keinInhalt')}</p>}
          </div>
        </>
      ) : (
        <RichTextEditor name={feld} startwert={startwert} label={label} hinweis={hinweis} fehler={f(feld)} bildAuswahl={bildAuswahl} />
      )}
    </div>
  );

  // Fehler-Zusammenfassung: „Titel“ bzw. „Titel (Englisch)“ mit Sprung zum Feld
  const zusammenfassung = (k: string) => {
    const basis = k.replace(/(De|Tr|En)$/, '');
    const sprache = k.slice(basis.length) as Sprache | '';
    const name = basis === 'bildId' ? tm('feldTitel') : FELD_LABEL[basis] ? t(`formular.${FELD_LABEL[basis]}`) : k;
    return sprache && sprache !== 'De' ? `${name} (${t(`formular.sprache.${sprache}`)})` : name;
  };
  const fehlerListe = Object.keys(fehler ?? {});

  return (
    <form action={absenden} className="flex flex-col gap-6" noValidate>
      <div ref={meldungRef} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${zustand.fehler}`)}</p>
            {fehlerListe.length ? (
              <ul className="mt-2 list-disc pl-5 font-normal">
                {fehlerListe.map((k) => (
                  <li key={k}>
                    <a href={`#${id(k)}`} className="text-fehler underline">
                      {zusammenfassung(k)}: {t(`fehler.${fehler?.[k]}`)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Meldung>
        ) : zustand.gespeichert ? (
          <Meldung art="erfolg">{t('gespeichert')}</Meldung>
        ) : null}
      </div>
      <input type="hidden" name="id" value={alsText(w, 'id')} />

      <fieldset disabled={nurLesen} className="flex min-w-0 flex-col gap-6">
        <Abschnitt
          titel={t('formular.abschnittInhalt')}
          kinder={
            <>
              <div className="md:col-span-2">
                {text('titelDe', t('formular.titel'), { pflicht: true, platzhalter: t('formular.titelPlatzhalter'), max: 160 })}
              </div>
              {bereich('kurztextDe', t('formular.kurztext'), { hinweis: t('formular.kurztextHinweis'), zeilen: 2, max: 400 })}
              {nurLesen ? null : (
                <div className="md:col-span-2">
                  <BildFeld id={id('bildId')} bilder={bilder} startwert={alsText(w, 'bildId')} fehler={f('bildId')} />
                </div>
              )}
              {editor('inhaltDe', t('formular.inhalt'), texte.de, t('formular.inhaltHinweis'))}
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittZuordnung')}
          kinder={
            <>
              {auswahl('kategorie', t('formular.kategorie'), kategorien)}
              {auswahl('organisation', t('formular.organisation'), organisationen, t('formular.organisationHinweis'))}
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittVeroeffentlichung')}
          kinder={
            <>
              {auswahl('status', t('formular.status'), [
                { wert: 'entwurf', label: t('status.entwurf') },
                { wert: 'veroeffentlicht', label: t('status.veroeffentlicht') },
              ])}
              <Rahmen
                id={id('veroeffentlichtAm')}
                label={t('formular.veroeffentlichtAm')}
                hinweis={t('formular.veroeffentlichtAmHinweis')}
                fehler={f('veroeffentlichtAm')}
                kinder={(aria) => (
                  <input
                    {...aria}
                    name="veroeffentlichtAm"
                    type="datetime-local"
                    defaultValue={alsText(w, 'veroeffentlichtAm')}
                    className={eingabe}
                  />
                )}
              />
              {text('slug', t('formular.slug'), { hinweis: t('formular.slugHinweis'), max: 120 })}
              <Rahmen
                id={id('lesezeit')}
                label={t('formular.lesezeit')}
                hinweis={t('formular.lesezeitHinweis')}
                fehler={f('lesezeit')}
                kinder={(aria) => (
                  <input
                    {...aria}
                    name="lesezeit"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={600}
                    defaultValue={alsText(w, 'lesezeit')}
                    className={eingabe}
                  />
                )}
              />
              <div className="flex flex-col gap-2 md:col-span-2">
                {schalter('empfohlen', t('formular.empfohlen'))}
                {schalter('wichtig', t('formular.wichtig'))}
              </div>
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittSchlagwoerter')}
          kinder={
            <div className="md:col-span-2">
              {text('schlagwoerterDe', t('formular.schlagwoerter'), { hinweis: t('formular.schlagwoerterHinweis'), max: 400 })}
            </div>
          }
        />

        <details className="rounded-lg border border-linie bg-weiss p-5 md:p-6" open={fehlerListe.some((k) => /(Tr|En)$/.test(k))}>
          <summary className="cursor-pointer font-display text-24 font-semibold">{t('formular.abschnittUebersetzungen')}</summary>
          <p className="mt-2 text-16 text-tinte-2">{t('formular.uebersetzungenHinweis')}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <fieldset className="flex flex-col gap-4">
              <legend className="mb-2 font-bold">{t('formular.sprache.Tr')}</legend>
              {text('titelTr', mitSprache('titel', 'Tr'), { max: 160 })}
              {bereich('kurztextTr', mitSprache('kurztext', 'Tr'), { zeilen: 2, max: 400 })}
              {editor('inhaltTr', mitSprache('inhalt', 'Tr'), texte.tr)}
              {text('schlagwoerterTr', mitSprache('schlagwoerter', 'Tr'), {
                hinweis: t('formular.uebersetzungZeilenHinweis'),
                max: 400,
              })}
            </fieldset>
            <fieldset className="flex flex-col gap-4">
              <legend className="mb-2 font-bold">{t('formular.sprache.En')}</legend>
              {text('titelEn', mitSprache('titel', 'En'), { max: 160 })}
              {bereich('kurztextEn', mitSprache('kurztext', 'En'), { zeilen: 2, max: 400 })}
              {editor('inhaltEn', mitSprache('inhalt', 'En'), texte.en)}
              {text('schlagwoerterEn', mitSprache('schlagwoerter', 'En'), {
                hinweis: t('formular.uebersetzungZeilenHinweis'),
                max: 400,
              })}
            </fieldset>
          </div>
        </details>
      </fieldset>

      {!nurLesen ? <MedienWahlDialog ref={medienWahl} bilder={bilder} /> : null}
      {!nurLesen ? (
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={laeuft}>
            <Save aria-hidden />
            {laeuft ? t('formular.speichert') : modus === 'neu' ? t('formular.erstellen') : t('formular.speichern')}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
