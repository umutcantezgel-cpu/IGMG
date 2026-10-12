'use client';

import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { cn } from '@/lib/utils';
import { PRIORITAETEN } from '@/lib/validierung/ankuendigung';
import type { SpeicherZustand } from '@/server/actions/ankuendigungen';
import type { AnkuendigungWerte } from './werte';

type Aktion = (vorher: SpeicherZustand, fd: FormData) => Promise<SpeicherZustand>;

const SPRACHEN = ['Tr', 'En'] as const;

/** Feldname ohne Sprachendung → Beschriftungsschlüssel unter `formular` (Fehler-Zusammenfassung). */
const FELD_LABEL: Record<string, string> = {
  titel: 'titel',
  inhalt: 'inhalt',
  prioritaet: 'prioritaet',
  organisation: 'organisation',
  sichtbarAbDatum: 'sichtbarAbDatum',
  sichtbarAbZeit: 'sichtbarAbZeit',
  laeuftAbDatum: 'laeuftAbDatum',
  laeuftAbZeit: 'laeuftAbZeit',
  link: 'link',
  status: 'status',
};

function Abschnitt({ titel, kinder }: { titel: string; kinder: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{titel}</legend>
      <div className="clear-both grid gap-4 md:grid-cols-2">{kinder}</div>
    </fieldset>
  );
}

/**
 * Formular „Ankündigung“ (V04, E-033): Titel und Text, Priorität, Organisation, Sichtbarkeit (Beginn und Ende je als
 * Datum und Uhrzeit), optionaler Link, Übersetzungen und Veröffentlichung. Der Server prüft mit demselben Schema.
 */
export function AnkuendigungsFormular({
  aktion,
  startwerte,
  modus,
  organisationen,
  nurLesen = false,
}: {
  aktion: Aktion;
  startwerte: AnkuendigungWerte;
  modus: 'neu' | 'bearbeiten';
  organisationen: { wert: string; label: string }[];
  nurLesen?: boolean;
}) {
  const t = useTranslations('verwaltung.ankuendigungen');
  const tv = useTranslations('verwaltung');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const w: AnkuendigungWerte = (zustand.werte as AnkuendigungWerte | undefined) ?? startwerte;
  const fehler = zustand.feldFehler;
  const f = (feld: string) => (fehler?.[feld] ? t(`fehler.${fehler[feld]}`) : undefined);
  const meldungRef = useRef<HTMLDivElement>(null);
  const basisId = useId();
  const id = (feld: string) => `${basisId}-${feld}`;
  const pflicht = tv('pflichtfeld');
  const fehlerListe = Object.keys(fehler ?? {});

  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldungRef.current?.focus();
  }, [zustand]);

  /** Name eines Felds für die Fehler-Zusammenfassung; bei Übersetzungen mit Sprache. */
  const bezeichnung = (feld: string) => {
    const basis = feld.replace(/(De|Tr|En)$/, '');
    const name = FELD_LABEL[basis] ? t(`formular.${FELD_LABEL[basis]}`) : feld;
    return /(Tr|En)$/.test(feld) ? t('formular.feldSprache', { feld: name, sprache: t(`formular.sprache.${feld.slice(-2)}`) }) : name;
  };

  const feldText = (
    feld: string,
    label: string,
    opt: { hinweis?: string; pflicht?: boolean; platzhalter?: string; max?: number; typ?: string } = {},
  ) => (
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
          type={opt.typ ?? 'text'}
          defaultValue={w[feld] ?? ''}
          required={opt.pflicht}
          maxLength={opt.max}
          placeholder={opt.platzhalter}
          className={eingabe}
        />
      )}
    />
  );

  const feldBereich = (feld: string, label: string, opt: { hinweis?: string; pflicht?: boolean; zeilen?: number; max?: number } = {}) => (
    <div className="md:col-span-2">
      <Rahmen
        id={id(feld)}
        label={label}
        hinweis={opt.hinweis}
        fehler={f(feld)}
        pflicht={opt.pflicht ? pflicht : undefined}
        kinder={(aria) => (
          <textarea
            {...aria}
            name={feld}
            rows={opt.zeilen ?? 4}
            defaultValue={w[feld] ?? ''}
            required={opt.pflicht}
            maxLength={opt.max}
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
        <select {...aria} name={feld} defaultValue={w[feld] ?? ''} className={eingabe}>
          {optionen.map((o) => (
            <option key={o.wert} value={o.wert}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    />
  );

  const mitSprache = (feld: string, s: 'Tr' | 'En') =>
    t('formular.feldSprache', { feld: t(`formular.${feld}`), sprache: t(`formular.sprache.${s}`) });

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
                      {bezeichnung(k)}: {t(`fehler.${fehler?.[k]}`)}
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
      <input type="hidden" name="id" value={w.id ?? ''} />

      <fieldset disabled={nurLesen} className="flex min-w-0 flex-col gap-6">
        <Abschnitt
          titel={t('formular.abschnittInhalt')}
          kinder={
            <>
              <div className="md:col-span-2">
                {feldText('titelDe', t('formular.titel'), { pflicht: true, hinweis: t('formular.titelHinweis'), max: 120 })}
              </div>
              {feldBereich('inhaltDe', t('formular.inhalt'), { pflicht: true, hinweis: t('formular.inhaltHinweis'), zeilen: 4, max: 500 })}
              <div className="md:col-span-2">
                {feldText('link', t('formular.link'), {
                  hinweis: t('formular.linkHinweis'),
                  platzhalter: t('formular.linkPlatzhalter'),
                  max: 500,
                })}
              </div>
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittAnzeige')}
          kinder={
            <>
              {auswahl(
                'prioritaet',
                t('formular.prioritaet'),
                PRIORITAETEN.map((p) => ({ wert: p, label: t(`prioritaet.${p}`) })),
                t('formular.prioritaetHinweis'),
              )}
              {auswahl(
                'organisation',
                t('formular.organisation'),
                organisationen,
                organisationen.length < 5 ? t('formular.organisationHinweis') : undefined,
              )}
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittZeitraum')}
          kinder={
            <>
              {feldText('sichtbarAbDatum', t('formular.sichtbarAbDatum'), { typ: 'date', hinweis: t('formular.sichtbarAbHinweis') })}
              {feldText('sichtbarAbZeit', t('formular.sichtbarAbZeit'), { typ: 'time' })}
              {feldText('laeuftAbDatum', t('formular.laeuftAbDatum'), { typ: 'date', hinweis: t('formular.laeuftAbHinweis') })}
              {feldText('laeuftAbZeit', t('formular.laeuftAbZeit'), { typ: 'time' })}
            </>
          }
        />

        <details className="rounded-lg border border-linie bg-weiss p-5 md:p-6" open={fehlerListe.some((k) => /(Tr|En)$/.test(k))}>
          <summary className="cursor-pointer font-display text-24 font-semibold">{t('formular.abschnittUebersetzungen')}</summary>
          <p className="mt-2 text-16 text-tinte-2">{t('formular.uebersetzungenHinweis')}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {SPRACHEN.map((s) => (
              <fieldset key={s} className="flex flex-col gap-4">
                <legend className="mb-2 font-bold">{t(`formular.sprache.${s}`)}</legend>
                {feldText(`titel${s}`, mitSprache('titel', s), { max: 120 })}
                {feldBereich(`inhalt${s}`, mitSprache('inhalt', s), { zeilen: 4, max: 500 })}
              </fieldset>
            ))}
          </div>
        </details>

        <Abschnitt
          titel={t('formular.abschnittVeroeffentlichung')}
          kinder={auswahl('status', t('formular.status'), [
            { wert: 'entwurf', label: t('status.entwurf') },
            { wert: 'veroeffentlicht', label: t('status.veroeffentlicht') },
          ])}
        />
      </fieldset>

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
