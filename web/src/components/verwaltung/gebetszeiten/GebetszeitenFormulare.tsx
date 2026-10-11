'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { GEBETE, type Gebet } from '@/lib/gebetszeiten/typen';
import type { GebetszeitenEinstellung } from '@/lib/validierung/einstellungen';
import {
  pruefeImport,
  speichereBerechnung,
  speichereQuelle,
  uebernehmeImport,
  type GebetszeitenZustand,
} from '@/server/actions/gebetszeiten';

const feld = 'min-h-12 rounded-md border border-rand bg-weiss px-3 text-18';
const METHODEN = [
  'Turkey',
  'MuslimWorldLeague',
  'Egyptian',
  'Karachi',
  'UmmAlQura',
  'Dubai',
  'MoonsightingCommittee',
  'NorthAmerica',
  'Kuwait',
  'Qatar',
  'Singapore',
  'Tehran',
] as const;

function useFokus(z: GebetszeitenZustand) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (z.fehler || z.ok || z.importFehler || z.pruefung || z.uebernommen || z.vorschau)
      ref.current?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus();
  }, [z]);
  return ref;
}

/** Aktive Quelle und Bestätigung (C07, G-06). */
export function QuelleFormular({ start, darf }: { start: Pick<GebetszeitenEinstellung, 'aktiveQuelle' | 'bestaetigt'>; darf: boolean }) {
  const t = useTranslations('verwaltung.gebetszeiten');
  const [z, absenden, laeuft] = useActionState<GebetszeitenZustand, FormData>(speichereQuelle, {});
  const ref = useFokus(z);
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <div ref={ref}>
        {z.ok ? (
          <Meldung art="erfolg" fokus>
            {t('quelle.gespeichert')}
          </Meldung>
        ) : z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : null}
      </div>
      <fieldset className="flex flex-col gap-2" disabled={!darf}>
        <legend className="font-bold">{t('quelle.legende')}</legend>
        {(['import', 'berechnung'] as const).map((q) => (
          <label key={q} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-md border border-linie px-3 py-2">
            <input
              type="radio"
              name="aktiveQuelle"
              value={q}
              defaultChecked={start.aktiveQuelle === q}
              className="mt-1 size-5 accent-gruen-700"
            />
            <span className="flex flex-col font-bold">
              {t(`quelle.${q}`)}
              <span className="text-16 font-normal text-tinte-2">{t(`quelle.${q}Text`)}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="bestaetigt"
          value="ja"
          defaultChecked={start.bestaetigt}
          disabled={!darf}
          aria-describedby="quelle-bestaetigt-hinweis"
          className="mt-1 size-5 accent-gruen-700"
        />
        <span className="font-bold">{t('quelle.bestaetigt')}</span>
      </label>
      <p id="quelle-bestaetigt-hinweis" className="text-16 text-tinte-2">
        {t('quelle.bestaetigtHinweis')}
      </p>
      {darf ? (
        <Button type="submit" className="self-start" disabled={laeuft}>
          {t('quelle.speichern')}
        </Button>
      ) : null}
    </form>
  );
}

/** Berechnungseinstellungen mit Vorschau der nächsten 7 Tage (C07, ADR 0008). */
export function BerechnungFormular({ start, darf }: { start: GebetszeitenEinstellung; darf: boolean }) {
  const t = useTranslations('verwaltung.gebetszeiten');
  const [z, absenden, laeuft] = useActionState<GebetszeitenZustand, FormData>(speichereBerechnung, {});
  const ref = useFokus(z);
  const fehler = (f: string) => (z.feldFehler?.[f] ? t('fehler.ungueltig') : undefined);
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <div ref={ref}>
        {z.ok ? (
          <Meldung art="erfolg" fokus>
            {t('berechnung.gespeichert')}
          </Meldung>
        ) : z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : null}
      </div>
      <fieldset disabled={!darf} className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 font-bold">
          {t('berechnung.methode')}
          <select name="methode" defaultValue={start.methode} className={feld}>
            {METHODEN.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 font-bold">
          {t('berechnung.madhab')}
          <select name="madhab" defaultValue={start.madhab} className={feld}>
            <option value="shafi">{t('berechnung.madhabShafi')}</option>
            <option value="hanafi">{t('berechnung.madhabHanafi')}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 font-bold">
          {t('berechnung.hoheBreite')}
          <select name="hoheBreite" defaultValue={start.hoheBreite} className={feld}>
            <option value="seventhofthenight">{t('berechnung.hoheBreiteSiebtel')}</option>
            <option value="middleofthenight">{t('berechnung.hoheBreiteMitte')}</option>
            <option value="twilightangle">{t('berechnung.hoheBreiteWinkel')}</option>
          </select>
        </label>
      </fieldset>
      <fieldset disabled={!darf} className="flex flex-col gap-2" aria-describedby="berechnung-anpassungen-hinweis">
        <legend className="font-bold">{t('berechnung.anpassungen')}</legend>
        <p id="berechnung-anpassungen-hinweis" className="text-16 text-tinte-2">
          {t('berechnung.anpassungenHinweis')}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {GEBETE.map((g) => (
            <label key={g} className="flex flex-col gap-1 text-16 font-bold">
              {t(`gebet.${g}`)}
              <input
                type="number"
                name={`anpassung-${g}`}
                min={-30}
                max={30}
                step={1}
                defaultValue={start.anpassungen[g] ?? 0}
                aria-invalid={fehler(`anpassung-${g}`) ? true : undefined}
                className={`${feld} w-24`}
              />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={!darf} className="grid gap-4 sm:grid-cols-2" aria-describedby="berechnung-ort-hinweis">
        <legend className="sr-only">{t('berechnung.ortHinweis')}</legend>
        {(['breite', 'laenge'] as const).map((f) => (
          <label key={f} className="flex flex-col gap-1 font-bold">
            {t(`berechnung.${f}`)}
            <input
              name={f}
              inputMode="decimal"
              defaultValue={String(start[f])}
              aria-invalid={fehler(f) ? true : undefined}
              aria-describedby="berechnung-ort-hinweis"
              className={feld}
            />
          </label>
        ))}
        <p id="berechnung-ort-hinweis" className="text-16 text-tinte-2 sm:col-span-2">
          {t('berechnung.ortHinweis')}
        </p>
      </fieldset>
      {darf ? (
        <div className="flex flex-wrap gap-3">
          <Button type="submit" name="richtung" value="vorschau" variant="outline" disabled={laeuft}>
            {t('berechnung.vorschau')}
          </Button>
          <Button type="submit" name="richtung" value="speichern" disabled={laeuft}>
            {t('berechnung.speichern')}
          </Button>
        </div>
      ) : null}
      {z.vorschau ? <ZeitenTabelle titel={t('berechnung.vorschauTitel')} tage={z.vorschau} /> : null}
    </form>
  );
}

function ZeitenTabelle({ titel, tage }: { titel: string; tage: ({ datum: string } & Record<Gebet, string>)[] }) {
  const t = useTranslations('verwaltung.gebetszeiten');
  return (
    <div className="relative overflow-x-auto rounded-lg border border-linie" tabIndex={-1}>
      <table className="w-full min-w-[40rem] border-collapse text-left tabular-nums">
        <caption className="px-4 py-2 text-left font-bold">{titel}</caption>
        <thead className="bg-sand">
          <tr>
            <th scope="col" className="px-3 py-2 text-16">
              {t('berechnung.datum')}
            </th>
            {GEBETE.map((g) => (
              <th key={g} scope="col" className="px-3 py-2 text-16">
                {t(`gebet.${g}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tage.map((d) => (
            <tr key={d.datum} className="border-t border-linie">
              <th scope="row" className="px-3 py-2 font-bold whitespace-nowrap">
                {d.datum.split('-').reverse().join('.')}
              </th>
              {GEBETE.map((g) => (
                <td key={g} className="px-3 py-2">
                  {d[g]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Tabellen-Import in zwei Schritten: prüfen (Fehler je Zeile oder Vorschau) → übernehmen (Server prüft erneut). */
export function ImportFormular() {
  const t = useTranslations('verwaltung.gebetszeiten');
  const [pruefung, pruefen, prueft] = useActionState<GebetszeitenZustand, FormData>(pruefeImport, {});
  const [uebernahme, uebernehmen, uebernimmt] = useActionState<GebetszeitenZustand, FormData>(uebernehmeImport, {});
  const ref = useFokus(pruefung);
  const ref2 = useFokus(uebernahme);
  const p = pruefung.pruefung;
  const datum = (d: string) => d.split('-').reverse().join('.');
  if (uebernahme.uebernommen) {
    return (
      <div ref={ref2}>
        <Meldung art="erfolg" fokus>
          {t('import.uebernommen', { anzahl: uebernahme.uebernommen })}
        </Meldung>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <form action={pruefen} className="flex flex-col gap-3" noValidate>
        <label className="flex flex-col gap-1 font-bold">
          {t('import.datei')}
          <input
            type="file"
            name="datei"
            accept=".csv,.json,text/csv,application/json"
            required
            className="text-18"
            aria-describedby="import-hinweis"
          />
        </label>
        <p id="import-hinweis" className="text-16 text-tinte-2">
          {t('import.text')}
        </p>
        <Button type="submit" variant="outline" className="self-start" disabled={prueft}>
          {t('import.pruefen')}
        </Button>
      </form>
      <div ref={ref}>
        {pruefung.fehler ? (
          <Meldung art="fehler" fokus>
            {t('import.fehlerDatei')}
          </Meldung>
        ) : null}
        {pruefung.importFehler ? (
          <Meldung art="fehler" fokus>
            <span className="flex flex-col gap-1">
              <strong>{t('import.fehlerTitel')}</strong>
              <ul className="list-disc pl-5">
                {pruefung.importFehler.map((f) => (
                  <li key={`${f.zeile}-${f.fehler}`}>
                    {t('import.fehlerZeile', { zeile: f.zeile, fehler: t(`import.fehlerArt.${f.fehler}`) })}
                  </li>
                ))}
              </ul>
            </span>
          </Meldung>
        ) : null}
        {p ? (
          <div className="flex flex-col gap-3">
            <Meldung art="info" fokus>
              {t('import.pruefungOk', { anzahl: p.anzahl, von: datum(p.von), bis: datum(p.bis) })}
            </Meldung>
            <ZeitenTabelle titel={p.dateiname} tage={p.erste} />
          </div>
        ) : null}
      </div>
      {p ? (
        <form action={uebernehmen} className="flex flex-col gap-3">
          <input type="hidden" name="tage" value={p.tage} />
          <input type="hidden" name="dateiname" value={p.dateiname} />
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" name="alsQuelle" value="ja" defaultChecked className="mt-1 size-5 accent-gruen-700" />
            <span>{t('import.alsQuelle')}</span>
          </label>
          {uebernahme.importFehler ? <Meldung art="fehler">{t('import.fehlerTitel')}</Meldung> : null}
          <Button type="submit" className="self-start" disabled={uebernimmt}>
            {t('import.uebernehmen')}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
