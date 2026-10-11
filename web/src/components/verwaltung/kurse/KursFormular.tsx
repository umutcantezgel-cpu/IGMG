'use client';

import { CircleAlert, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { cn } from '@/lib/utils';
import type { FormularWerte } from '@/lib/validierung/kurs';
import type { SpeicherZustand } from '@/server/actions/kurse';

type Aktion = (vorher: SpeicherZustand, fd: FormData) => Promise<SpeicherZustand>;
type Optionen = { hinweis?: string; pflicht?: boolean; platzhalter?: string; typ?: string; max?: number; min?: number; maxWert?: number };

const eingabe =
  'min-h-12 w-full rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte placeholder:text-tinte-3 aria-invalid:border-fehler aria-invalid:border-2 disabled:bg-sand';
const SPRACHEN = ['Tr', 'En'] as const;
/** Felder mit Beschriftung unter `formular` (ohne Sprachendung): nur diese erscheinen in der Fehler-Zusammenfassung. */
const BESCHRIFTET: readonly string[] = [
  'titel',
  'beschreibung',
  'zielgruppe',
  'zeiten',
  'alter',
  'dauer',
  'ort',
  'leitung',
  'kosten',
  'hinweis',
  'inhalte',
  'verfuegbarkeit',
  'plaetze',
  'sortierung',
  'slug',
  'status',
];

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
      {kinder({ id, ...(fehler ? { 'aria-invalid': true as const } : {}), 'aria-describedby': beschreibung })}
      {hinweis ? (
        <p id={`${id}-hinweis`} className="text-16 text-tinte-2">
          {hinweis}
        </p>
      ) : null}
      {fehler ? (
        <p id={`${id}-fehler`} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{fehler}</span>
        </p>
      ) : null}
    </div>
  );
}

function Abschnitt({ titel, kinder }: { titel: string; kinder: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{titel}</legend>
      <div className="clear-both grid gap-4 md:grid-cols-2">{kinder}</div>
    </fieldset>
  );
}

/**
 * Formular „Kurs“ (V06, Muster Veranstaltungen): Angaben, Anmeldung, Reihenfolge und Veröffentlichung, Übersetzungen.
 * Der Server prüft mit demselben Schema (`kursSchema`); Fehler kommen als Schlüssel und werden am Feld angezeigt.
 */
export function KursFormular({
  aktion,
  startwerte,
  modus,
  verfuegbarkeit,
  nurLesen = false,
}: {
  aktion: Aktion;
  startwerte: FormularWerte;
  modus: 'neu' | 'bearbeiten';
  verfuegbarkeit: { wert: string; label: string }[];
  nurLesen?: boolean;
}) {
  const t = useTranslations('verwaltung.kurse');
  const tv = useTranslations('verwaltung');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const w: FormularWerte = (zustand.werte as FormularWerte | undefined) ?? startwerte;
  const fehler = zustand.feldFehler;
  const f = (feld: string) => (fehler?.[feld] ? t(`fehler.${fehler[feld]}`) : undefined);
  const meldungRef = useRef<HTMLDivElement>(null);
  const basisId = useId();
  const id = (feld: string) => `${basisId}-${feld}`;
  const pflicht = tv('pflichtfeld');

  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldungRef.current?.focus();
  }, [zustand]);

  // Ungesteuerte Felder: React setzt das Formular nach jeder Aktion zurück, daher Startwert aus dem letzten Ergebnis.
  const alsText = (feld: string) => {
    const wert = w[feld];
    return typeof wert === 'string' ? wert : '';
  };
  const istAn = (feld: string) => w[feld] === true || w[feld] === 'on' || w[feld] === 'true';

  const sprache = (s: 'Tr' | 'En') => t(`formular.sprache.${s}`);
  const mitSprache = (feld: string, s: 'Tr' | 'En') => t('formular.feldSprache', { feld: t(`formular.${feld}`), sprache: sprache(s) });
  /** Beschriftung eines Fehlerfelds, z. B. „Beschreibung (Türkisch)“; null für Felder ohne Beschriftung. */
  const beschriftungVon = (schluessel: string): string | null => {
    const basis = schluessel.replace(/(De|Tr|En)$/, '');
    if (!BESCHRIFTET.includes(basis)) return null;
    const zusatz = /(Tr|En)$/.test(schluessel) ? ` (${sprache(schluessel.slice(-2) as 'Tr' | 'En')})` : '';
    return `${t(`formular.${basis}`)}${zusatz}`;
  };
  const fehlerListe = Object.keys(fehler ?? {}).filter((k) => beschriftungVon(k) !== null);

  const text = (feld: string, label: string, opt: Optionen = {}) => (
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
          defaultValue={alsText(feld)}
          required={opt.pflicht}
          maxLength={opt.max}
          min={opt.min}
          max={opt.maxWert}
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
            defaultValue={alsText(feld)}
            placeholder={opt.platzhalter}
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
        <select {...aria} name={feld} defaultValue={alsText(feld)} className={eingabe}>
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
      <input id={id(feld)} type="checkbox" name={feld} defaultChecked={istAn(feld)} className="size-6 accent-gruen-700" />
      {label}
    </label>
  );

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
                      {beschriftungVon(k)}: {t(`fehler.${fehler?.[k]}`)}
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
      <input type="hidden" name="id" value={alsText('id')} />

      <fieldset disabled={nurLesen} className="flex min-w-0 flex-col gap-6">
        <Abschnitt
          titel={t('formular.abschnittInhalt')}
          kinder={
            <>
              <div className="md:col-span-2">
                {text('titelDe', t('formular.titel'), { pflicht: true, platzhalter: t('formular.titelPlatzhalter'), max: 160 })}
              </div>
              {bereich('beschreibungDe', t('formular.beschreibung'), {
                hinweis: t('formular.beschreibungHinweis'),
                platzhalter: t('formular.beschreibungPlatzhalter'),
                zeilen: 4,
              })}
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittAngaben')}
          kinder={
            <>
              {text('zielgruppeDe', t('formular.zielgruppe'), { max: 160 })}
              {text('zeitenDe', t('formular.zeiten'), { hinweis: t('formular.zeitenHinweis'), max: 200 })}
              {text('alterDe', t('formular.alter'), { max: 120 })}
              {text('dauerDe', t('formular.dauer'), { max: 120 })}
              {text('ortDe', t('formular.ort'), { max: 160 })}
              {text('kostenDe', t('formular.kosten'), { max: 160 })}
              <div className="md:col-span-2">
                {text('leitungDe', t('formular.leitung'), {
                  hinweis: t('formular.leitungHinweis'),
                  platzhalter: t('formular.leitungPlatzhalter'),
                  max: 160,
                })}
              </div>
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittHinweis')}
          kinder={
            <>
              {bereich('hinweisDe', t('formular.hinweis'), { hinweis: t('formular.hinweisHinweis'), zeilen: 2 })}
              {bereich('inhalteDe', t('formular.inhalte'), { hinweis: t('formular.inhalteHinweis'), zeilen: 5 })}
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittAnmeldung')}
          kinder={
            <>
              {auswahl('verfuegbarkeit', t('formular.verfuegbarkeit'), verfuegbarkeit, t('formular.verfuegbarkeitHinweis'))}
              {text('plaetze', t('formular.plaetze'), { typ: 'number', hinweis: t('formular.plaetzeHinweis'), min: 1, maxWert: 100_000 })}
              <div className="md:col-span-2">{schalter('empfohlen', t('formular.empfohlen'))}</div>
            </>
          }
        />

        <Abschnitt
          titel={t('formular.abschnittReihenfolge')}
          kinder={
            <>
              {text('sortierung', t('formular.sortierung'), {
                typ: 'number',
                hinweis: t('formular.sortierungHinweis'),
                min: 0,
                maxWert: 9999,
              })}
              {text('slug', t('formular.slug'), { hinweis: t('formular.slugHinweis'), max: 120 })}
              {auswahl(
                'status',
                t('formular.status'),
                [
                  { wert: 'entwurf', label: t('status.entwurf') },
                  { wert: 'veroeffentlicht', label: t('status.veroeffentlicht') },
                ],
                t('formular.statusHinweis'),
              )}
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
                {bereich(`beschreibung${s}`, mitSprache('beschreibung', s), { zeilen: 3 })}
                {text(`zielgruppe${s}`, mitSprache('zielgruppe', s), { max: 160 })}
                {text(`zeiten${s}`, mitSprache('zeiten', s), { max: 200 })}
                {text(`alter${s}`, mitSprache('alter', s), { max: 120 })}
                {text(`dauer${s}`, mitSprache('dauer', s), { max: 120 })}
                {text(`ort${s}`, mitSprache('ort', s), { max: 160 })}
                {text(`leitung${s}`, mitSprache('leitung', s), { max: 160 })}
                {text(`kosten${s}`, mitSprache('kosten', s), { max: 160 })}
                {bereich(`hinweis${s}`, mitSprache('hinweis', s), { zeilen: 2 })}
                {bereich(`inhalte${s}`, mitSprache('inhalte', s), { hinweis: t('formular.inhalteHinweis'), zeilen: 4 })}
              </fieldset>
            ))}
          </div>
        </details>
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
