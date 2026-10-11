'use client';

import { CircleAlert, Plus, Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { datumLang, zeitspanne } from '@/lib/i18n/format';
import { vorkommen } from '@/lib/termine';
import { useJetzt } from '@/lib/zeit/useJetzt';
import { baueRegel, regelGueltig, WOCHENTAGE, type Wochentag } from '@/lib/termine/regel';
import { zeitpunkt } from '@/lib/validierung/veranstaltung';
import type { FormularWerte } from '@/lib/veranstaltung/formularwerte';
import { cn } from '@/lib/utils';
import type { SpeicherZustand } from '@/server/actions/veranstaltungen';

type Aktion = (vorher: SpeicherZustand, fd: FormData) => Promise<SpeicherZustand>;
type Fehler = Record<string, string> | undefined;

const eingabe =
  'min-h-12 w-full rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte placeholder:text-tinte-3 aria-invalid:border-fehler aria-invalid:border-2 disabled:bg-sand';
const SPRACHEN = ['Tr', 'En'] as const;

/** Rahmen eines Felds: Beschriftung, Hinweis, Fehler am Feld (aria-describedby, aria-invalid – K-07, K-11). */
function Rahmen({
  id,
  label,
  hinweis,
  fehler,
  pflicht,
  kinder,
}: {
  id: string;
  label: ReactNode;
  hinweis?: ReactNode;
  fehler?: string;
  pflicht?: string;
  kinder: (aria: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode;
}) {
  const beschreibung = [hinweis ? `${id}-hinweis` : null, fehler ? `${id}-fehler` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {label}
        {pflicht ? <span className="font-normal text-tinte-2"> {pflicht}</span> : null}
      </label>
      {hinweis ? (
        <p id={`${id}-hinweis`} className="text-16 text-tinte-2">
          {hinweis}
        </p>
      ) : null}
      {kinder({ id, ...(fehler ? { 'aria-invalid': true as const } : {}), 'aria-describedby': beschreibung })}
      {fehler ? (
        <p id={`${id}-fehler`} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{fehler}</span>
        </p>
      ) : null}
    </div>
  );
}

function Abschnitt({ titel, kinder, spalten = true }: { titel: string; kinder: ReactNode; spalten?: boolean }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{titel}</legend>
      <div className={cn('clear-both grid gap-4', spalten && 'md:grid-cols-2')}>{kinder}</div>
    </fieldset>
  );
}

/** Feldname (ohne Sprachendung) → Beschriftungsschlüssel unter `formular` für die Fehler-Zusammenfassung. */
const FELD_LABEL: Record<string, string> = {
  titel: 'titel',
  kurztext: 'kurztext',
  beschreibung: 'beschreibung',
  slug: 'slug',
  kategorie: 'kategorie',
  organisation: 'organisation',
  zielgruppe: 'zielgruppe',
  ort: 'ort',
  datum: 'datum',
  beginnZeit: 'startzeit',
  endeZeit: 'endzeit',
  whArt: 'wiederholung',
  whIntervall: 'intervall',
  whTage: 'wochentage',
  whPosition: 'position',
  whEnde: 'ende',
  whEndeDatum: 'endeDatumFeld',
  whAnzahl: 'anzahl',
  whRoh: 'roh',
  ausnahmen: 'ausnahmen',
  plaetze: 'plaetze',
  kosten: 'kosten',
  programm: 'programm',
  hinweise: 'hinweise',
  schlagwoerter: 'schlagwoerter',
  veranstalterName: 'veranstalterName',
  veranstalterFunktion: 'veranstalterFunktion',
  kontaktName: 'kontaktName',
  kontaktTelefon: 'kontaktTelefon',
  kontaktEmail: 'kontaktEmail',
  status: 'status',
};

const alsText = (w: FormularWerte, k: string) => (typeof w[k] === 'string' ? (w[k] as string) : '');
const alsListe = (w: FormularWerte, k: string) =>
  Array.isArray(w[k]) ? (w[k] as string[]) : typeof w[k] === 'string' && w[k] ? [w[k] as string] : [];
const istAn = (w: FormularWerte, k: string) => w[k] === true || w[k] === 'on' || w[k] === 'true';

/**
 * Formular „Veranstaltung“ (V02, K-09): Inhalt, Termin mit Wiederholung und Ausfällen, Zuordnung, Anmeldung,
 * Programm/Hinweise/Schlagwörter, Veranstalter/Kontakt, Übersetzungen, Status. Server prüft mit demselben Schema.
 */
export function VeranstaltungsFormular({
  aktion,
  startwerte,
  modus,
  kategorien,
  organisationen,
  nurLesen = false,
}: {
  aktion: Aktion;
  startwerte: FormularWerte;
  modus: 'neu' | 'bearbeiten';
  kategorien: { wert: string; label: string }[];
  organisationen: { wert: string; label: string }[];
  nurLesen?: boolean;
}) {
  const t = useTranslations('verwaltung.veranstaltungen');
  const tv = useTranslations('verwaltung');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const w: FormularWerte = (zustand.werte as FormularWerte | undefined) ?? startwerte;
  const fehler: Fehler = zustand.feldFehler;
  const f = (feld: string) => (fehler?.[feld] ? t(`fehler.${fehler[feld]}`) : undefined);
  const meldungRef = useRef<HTMLDivElement>(null);
  const basisId = useId();
  const id = (feld: string) => `${basisId}-${feld}`;

  // Felder der Terminvorschau sind gesteuert (Vorschau live); alle übrigen ungesteuert mit defaultValue.
  const [datum, setDatum] = useState(alsText(startwerte, 'datum'));
  const [beginnZeit, setBeginnZeit] = useState(alsText(startwerte, 'beginnZeit'));
  const [ganztaegig, setGanztaegig] = useState(istAn(startwerte, 'ganztaegig'));
  const [art, setArt] = useState(alsText(startwerte, 'whArt') || 'einmalig');
  const [intervall, setIntervall] = useState(alsText(startwerte, 'whIntervall') || '1');
  const [tage, setTage] = useState<string[]>(alsListe(startwerte, 'whTage'));
  const [position, setPosition] = useState(alsText(startwerte, 'whPosition') || '1');
  const [ende, setEnde] = useState(alsText(startwerte, 'whEnde') || 'nie');
  const [endeDatum, setEndeDatum] = useState(alsText(startwerte, 'whEndeDatum'));
  const [anzahl, setAnzahl] = useState(alsText(startwerte, 'whAnzahl'));
  const [roh, setRoh] = useState(alsText(startwerte, 'whRoh'));
  const [ausnahmen, setAusnahmen] = useState<string[]>(alsListe(startwerte, 'ausnahmen'));
  const [neueAusnahme, setNeueAusnahme] = useState('');
  const [anmeldung, setAnmeldung] = useState(istAn(startwerte, 'anmeldungAktiv'));

  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldungRef.current?.focus();
  }, [zustand]);

  const jetzt = useJetzt();
  const vorschau = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datum) || (!ganztaegig && !/^\d{2}:\d{2}$/.test(beginnZeit))) return null;
    const beginn = zeitpunkt(datum, ganztaegig ? '00:00' : beginnZeit);
    const regel = baueRegel(
      {
        art: art as never,
        intervall: Number(intervall) || 1,
        wochentage: tage as Wochentag[],
        position: Number(position) || 1,
        ende: ende as never,
        endeDatum: endeDatum || undefined,
        anzahl: Number(anzahl) || undefined,
        roh,
      },
      beginn,
    );
    if (!regelGueltig(regel)) return 'ungueltig' as const;
    const ab = new Date(Math.max(jetzt?.getTime() ?? 0, beginn.getTime()) - 86_400_000);
    return vorkommen({ beginn, ende: null, wiederholung: regel, ausnahmen }, ab, new Date(ab.getTime() + 2 * 365 * 86_400_000), 5);
  }, [jetzt, datum, beginnZeit, ganztaegig, art, intervall, tage, position, ende, endeDatum, anzahl, roh, ausnahmen]);

  const pflicht = tv('pflichtfeld');
  const text = (
    feld: string,
    label: string,
    opt: { hinweis?: string; pflicht?: boolean; platzhalter?: string; typ?: string; max?: number } = {},
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
          defaultValue={alsText(w, feld)}
          required={opt.pflicht}
          maxLength={opt.max}
          placeholder={opt.platzhalter}
          className={eingabe}
        />
      )}
    />
  );
  const bereich = (feld: string, label: string, opt: { hinweis?: string; zeilen?: number; platzhalter?: string } = {}) => (
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
            defaultValue={alsText(w, feld)}
            placeholder={opt.platzhalter}
            className={cn(eingabe, 'py-2.5')}
          />
        )}
      />
    </div>
  );
  const auswahl = (
    feld: string,
    label: string,
    optionen: { wert: string; label: string }[],
    opt: { hinweis?: string; wert?: string; setze?: (v: string) => void } = {},
  ) => (
    <Rahmen
      id={id(feld)}
      label={label}
      hinweis={opt.hinweis}
      fehler={f(feld)}
      kinder={(aria) => (
        <select
          {...aria}
          name={feld}
          {...(opt.setze ? { value: opt.wert, onChange: (e) => opt.setze?.(e.target.value) } : { defaultValue: alsText(w, feld) })}
          className={eingabe}
        >
          {optionen.map((o) => (
            <option key={o.wert} value={o.wert}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    />
  );
  const schalter = (feld: string, label: string, opt: { wert?: boolean; setze?: (v: boolean) => void } = {}) => (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 font-bold">
      <input
        type="checkbox"
        name={feld}
        {...(opt.setze ? { checked: opt.wert, onChange: (e) => opt.setze?.(e.target.checked) } : { defaultChecked: istAn(w, feld) })}
        className="size-6 accent-gruen-700"
      />
      {label}
    </label>
  );
  const sprache = (s: 'De' | 'Tr' | 'En') => t(`formular.sprache.${s}`);
  const mitSprache = (feld: string, s: 'Tr' | 'En') => t('formular.feldSprache', { feld: t(`formular.${feld}`), sprache: sprache(s) });

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
                      {FELD_LABEL[k.replace(/(De|Tr|En)$/, '')] ? t(`formular.${FELD_LABEL[k.replace(/(De|Tr|En)$/, '')]}`) : k}
                      {/(Tr|En)$/.test(k) ? ` (${sprache(k.slice(-2) as 'Tr' | 'En')})` : ''}: {t(`fehler.${fehler?.[k]}`)}
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
              {bereich('kurztextDe', t('formular.kurztext'), { hinweis: t('formular.kurztextHinweis'), zeilen: 2 })}
              {bereich('beschreibungDe', t('formular.beschreibung'), {
                hinweis: t('formular.beschreibungHinweis'),
                zeilen: 6,
                platzhalter: t('formular.beschreibungPlatzhalter'),
              })}
              <div className="md:col-span-2">{text('slug', t('formular.slug'), { hinweis: t('formular.slugHinweis'), max: 120 })}</div>
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittTermin')}
          kinder={
            <>
              <Rahmen
                id={id('datum')}
                label={t('formular.datum')}
                hinweis={t('formular.datumHinweis')}
                fehler={f('datum')}
                pflicht={pflicht}
                kinder={(aria) => (
                  <input
                    {...aria}
                    name="datum"
                    type="date"
                    required
                    value={datum}
                    onChange={(e) => setDatum(e.target.value)}
                    className={eingabe}
                  />
                )}
              />
              <div className="flex items-end">
                {schalter('ganztaegig', t('formular.ganztaegig'), { wert: ganztaegig, setze: setGanztaegig })}
              </div>
              {!ganztaegig ? (
                <>
                  <Rahmen
                    id={id('beginnZeit')}
                    label={t('formular.startzeit')}
                    hinweis={t('formular.zeitHinweis')}
                    fehler={f('beginnZeit')}
                    pflicht={pflicht}
                    kinder={(aria) => (
                      <input
                        {...aria}
                        name="beginnZeit"
                        type="time"
                        required
                        value={beginnZeit}
                        onChange={(e) => setBeginnZeit(e.target.value)}
                        className={eingabe}
                      />
                    )}
                  />
                  {text('endeZeit', t('formular.endzeit'), { typ: 'time' })}
                </>
              ) : null}
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittWiederholung')}
          kinder={
            <>
              {auswahl(
                'whArt',
                t('formular.wiederholung'),
                [
                  ['einmalig', 'whEinmalig'],
                  ['taeglich', 'whTaeglich'],
                  ['woechentlich', 'whWoechentlich'],
                  ['monatlich_tag', 'whMonatlichTag'],
                  ['monatlich_wochentag', 'whMonatlichWochentag'],
                  ['jaehrlich', 'whJaehrlich'],
                  ['eigene', 'whEigene'],
                ].map(([wert, k]) => ({ wert, label: t(`formular.${k}`) })),
                { wert: art, setze: setArt },
              )}
              {art !== 'einmalig' && art !== 'eigene' ? (
                <Rahmen
                  id={id('whIntervall')}
                  label={t('formular.intervall')}
                  hinweis={t('formular.intervallHinweis')}
                  fehler={f('whIntervall')}
                  kinder={(aria) => (
                    <input
                      {...aria}
                      name="whIntervall"
                      type="number"
                      min={1}
                      max={12}
                      value={intervall}
                      onChange={(e) => setIntervall(e.target.value)}
                      className={eingabe}
                    />
                  )}
                />
              ) : null}
              {art === 'woechentlich' ? (
                <fieldset className="md:col-span-2">
                  <legend className="mb-1.5 font-bold">{t('formular.wochentage')}</legend>
                  <div className="flex flex-wrap gap-2">
                    {WOCHENTAGE.map((tag) => (
                      <label
                        key={tag}
                        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-rand px-3 has-checked:border-gruen-700 has-checked:bg-gruen-50"
                      >
                        <input
                          type="checkbox"
                          name="whTage"
                          value={tag}
                          checked={tage.includes(tag)}
                          onChange={(e) => setTage((alt) => (e.target.checked ? [...alt, tag] : alt.filter((x) => x !== tag)))}
                          className="size-5 accent-gruen-700"
                        />
                        {t(`wochentag.${tag}`)}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}
              {art === 'monatlich_wochentag'
                ? auswahl(
                    'whPosition',
                    t('formular.position'),
                    [
                      ['1', 'pos1'],
                      ['2', 'pos2'],
                      ['3', 'pos3'],
                      ['4', 'pos4'],
                      ['-1', 'posLetzter'],
                    ].map(([wert, k]) => ({ wert, label: t(`formular.${k}`) })),
                    { wert: position, setze: setPosition },
                  )
                : null}
              {art === 'eigene' ? (
                <div className="md:col-span-2">
                  <Rahmen
                    id={id('whRoh')}
                    label={t('formular.roh')}
                    hinweis={t('formular.rohHinweis')}
                    fehler={f('whRoh')}
                    kinder={(aria) => (
                      <input
                        {...aria}
                        name="whRoh"
                        value={roh}
                        onChange={(e) => setRoh(e.target.value)}
                        className={cn(eingabe, 'font-mono')}
                      />
                    )}
                  />
                </div>
              ) : null}
              {art !== 'einmalig' && art !== 'eigene' ? (
                <>
                  {auswahl(
                    'whEnde',
                    t('formular.ende'),
                    [
                      ['nie', 'endeNie'],
                      ['datum', 'endeDatum'],
                      ['anzahl', 'endeAnzahl'],
                    ].map(([wert, k]) => ({ wert, label: t(`formular.${k}`) })),
                    { wert: ende, setze: setEnde },
                  )}
                  {ende === 'datum' ? (
                    <Rahmen
                      id={id('whEndeDatum')}
                      label={t('formular.endeDatumFeld')}
                      fehler={f('whEndeDatum')}
                      kinder={(aria) => (
                        <input
                          {...aria}
                          name="whEndeDatum"
                          type="date"
                          value={endeDatum}
                          onChange={(e) => setEndeDatum(e.target.value)}
                          className={eingabe}
                        />
                      )}
                    />
                  ) : null}
                  {ende === 'anzahl' ? (
                    <Rahmen
                      id={id('whAnzahl')}
                      label={t('formular.anzahl')}
                      fehler={f('whAnzahl')}
                      kinder={(aria) => (
                        <input
                          {...aria}
                          name="whAnzahl"
                          type="number"
                          min={1}
                          max={500}
                          value={anzahl}
                          onChange={(e) => setAnzahl(e.target.value)}
                          className={eingabe}
                        />
                      )}
                    />
                  ) : null}
                </>
              ) : null}
              {art !== 'einmalig' ? (
                <fieldset className="flex flex-col gap-2 md:col-span-2" aria-describedby={`${id('ausnahmen')}-hinweis`}>
                  <legend className="font-bold">{t('formular.ausnahmen')}</legend>
                  <p id={`${id('ausnahmen')}-hinweis`} className="text-16 text-tinte-2">
                    {t('formular.ausnahmenHinweis')}
                  </p>
                  {ausnahmen.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {ausnahmen.map((d) => (
                        <li key={d} className="inline-flex items-center gap-1 rounded-pill border border-rand bg-sand pl-3">
                          <input type="hidden" name="ausnahmen" value={d} />
                          <span>{datumLang(zeitpunkt(d, '12:00'), 'de')}</span>
                          <button
                            type="button"
                            onClick={() => setAusnahmen((alt) => alt.filter((x) => x !== d))}
                            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-pill hover:bg-gruen-50"
                          >
                            <X aria-hidden className="size-4" />
                            <span className="sr-only">
                              {t('formular.ausnahmeEntfernen', { datum: datumLang(zeitpunkt(d, '12:00'), 'de') })}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-16 text-tinte-2">{t('formular.keineAusnahmen')}</p>
                  )}
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={id('ausnahmeNeu')} className="text-16">
                        {t('formular.ausnahmeNeu')}
                      </label>
                      <input
                        id={id('ausnahmeNeu')}
                        type="date"
                        value={neueAusnahme}
                        onChange={(e) => setNeueAusnahme(e.target.value)}
                        className={cn(eingabe, 'w-auto')}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (/^\d{4}-\d{2}-\d{2}$/.test(neueAusnahme) && !ausnahmen.includes(neueAusnahme))
                          setAusnahmen((alt) => [...alt, neueAusnahme].sort());
                        setNeueAusnahme('');
                      }}
                    >
                      <Plus aria-hidden />
                      {t('formular.ausnahmeHinzufuegen')}
                    </Button>
                  </div>
                  {f('ausnahmen') ? <p className="text-16 font-bold text-fehler">{f('ausnahmen')}</p> : null}
                </fieldset>
              ) : null}
              <section aria-live="polite" className="rounded-md bg-sand p-4 md:col-span-2">
                <h3 className="font-text text-18 font-bold tracking-normal">{t('formular.vorschau')}</h3>
                {vorschau === 'ungueltig' ? (
                  <p className="text-fehler">{t('fehler.regel')}</p>
                ) : vorschau && vorschau.length ? (
                  <ul className="mt-1 list-disc pl-5">
                    {vorschau.map((v) => (
                      <li key={v.beginn.toISOString()}>
                        {datumLang(v.beginn, 'de')}
                        {ganztaegig ? '' : `, ${zeitspanne(v.beginn, null, 'de')}`}
                      </li>
                    ))}
                  </ul>
                ) : vorschau ? (
                  <p className="text-tinte-2">{t('formular.vorschauLeer')}</p>
                ) : null}
              </section>
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittZuordnung')}
          kinder={
            <>
              {auswahl('kategorie', t('formular.kategorie'), kategorien)}
              {auswahl('organisation', t('formular.organisation'), organisationen, {
                hinweis: organisationen.length < 5 ? t('formular.organisationHinweis') : undefined,
              })}
              {text('zielgruppeDe', t('formular.zielgruppe'), { max: 160 })}
              {text('ortDe', t('formular.ort'), { platzhalter: t('formular.ortPlatzhalter'), max: 160 })}
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittAnmeldung')}
          kinder={
            <>
              <div className="md:col-span-2">
                {schalter('anmeldungAktiv', t('formular.anmeldungAktiv'), { wert: anmeldung, setze: setAnmeldung })}
              </div>
              {anmeldung ? text('plaetze', t('formular.plaetze'), { typ: 'number', hinweis: t('formular.plaetzeHinweis') }) : null}
              {auswahl('kosten', t('formular.kosten'), [
                { wert: 'kostenlos', label: t('formular.kostenKostenlos') },
                { wert: 'kostenpflichtig', label: t('formular.kostenKostenpflichtig') },
              ])}
              <div className="md:col-span-2">{schalter('empfohlen', t('formular.empfohlen'))}</div>
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittDetails')}
          kinder={
            <>
              {bereich('programmDe', t('formular.programm'), { hinweis: t('formular.programmHinweis'), zeilen: 5 })}
              {bereich('hinweiseDe', t('formular.hinweise'), { hinweis: t('formular.hinweiseHinweis'), zeilen: 3 })}
              <div className="md:col-span-2">
                {text('schlagwoerterDe', t('formular.schlagwoerter'), { hinweis: t('formular.schlagwoerterHinweis'), max: 400 })}
              </div>
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittVeranstalter')}
          kinder={
            <>
              <div className="md:col-span-2">
                <Meldung art="info">{t('formular.kontaktHinweis')}</Meldung>
              </div>
              {text('veranstalterName', t('formular.veranstalterName'), { max: 120 })}
              {text('veranstalterFunktionDe', t('formular.veranstalterFunktion'), { max: 120 })}
              {text('kontaktName', t('formular.kontaktName'), { max: 120 })}
              {text('kontaktTelefon', t('formular.kontaktTelefon'), { typ: 'tel', max: 60 })}
              {text('kontaktEmail', t('formular.kontaktEmail'), { typ: 'email', max: 254 })}
            </>
          }
        />

        <details className="rounded-lg border border-linie bg-weiss p-5 md:p-6" open={fehlerListe.some((k) => /(Tr|En)$/.test(k))}>
          <summary className="cursor-pointer font-display text-24 font-semibold">{t('formular.abschnittUebersetzungen')}</summary>
          <p className="mt-2 text-16 text-tinte-2">{t('formular.uebersetzungenHinweis')}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {SPRACHEN.map((s) => (
              <fieldset key={s} className="flex flex-col gap-4">
                <legend className="mb-2 font-bold">{sprache(s)}</legend>
                {text(`titel${s}`, mitSprache('titel', s), { max: 160 })}
                {bereich(`kurztext${s}`, mitSprache('kurztext', s), { zeilen: 2 })}
                {bereich(`beschreibung${s}`, mitSprache('beschreibung', s), { zeilen: 5 })}
                {text(`zielgruppe${s}`, mitSprache('zielgruppe', s), { max: 160 })}
                {text(`ort${s}`, mitSprache('ort', s), { max: 160 })}
                {bereich(`programm${s}`, mitSprache('programm', s), { hinweis: t('formular.uebersetzungZeilenHinweis'), zeilen: 4 })}
                {bereich(`hinweise${s}`, mitSprache('hinweise', s), { hinweis: t('formular.uebersetzungZeilenHinweis'), zeilen: 3 })}
                {text(`schlagwoerter${s}`, mitSprache('schlagwoerter', s), { hinweis: t('formular.uebersetzungZeilenHinweis'), max: 400 })}
                {text(`veranstalterFunktion${s}`, mitSprache('veranstalterFunktion', s), { max: 120 })}
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
