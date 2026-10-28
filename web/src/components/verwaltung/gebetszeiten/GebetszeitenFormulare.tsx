'use client';

import { ExternalLink } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { GEBETE, type Gebet } from '@/lib/gebetszeiten/typen';
import type { GebetszeitenEinstellung } from '@/lib/validierung/einstellungen';
import {
  gebeAbgleichFrei,
  gleicheJetztAb,
  pruefeImport,
  schlageNaeherungVor,
  speichereAbgleich,
  speichereBerechnung,
  speichereQuelle,
  uebernehmeImport,
  uebernehmeKonflikte,
  uebernehmeNaeherung,
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
    if (z.fehler || z.ok || z.importFehler || z.pruefung || z.uebernommen || z.vorschau || z.abgleich || z.vorschlag)
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
        {(['igmg', 'import', 'berechnung'] as const).map((q) => (
          <label key={q} className="flex min-h-12 min-w-0 cursor-pointer items-start gap-3 rounded-md border border-linie px-3 py-2">
            <input
              type="radio"
              name="aktiveQuelle"
              value={q}
              defaultChecked={start.aktiveQuelle === q}
              className="mt-1 size-5 accent-gruen-700"
            />
            <span className="flex min-w-0 flex-col font-bold">
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
      <fieldset disabled={!darf} className="flex flex-col gap-2">
        <legend className="font-bold">{t('berechnung.rueckfall')}</legend>
        {(['naeherung', 'methode'] as const).map((r) => (
          <label key={r} className="flex min-h-12 min-w-0 cursor-pointer items-start gap-3 rounded-md border border-linie px-3 py-2">
            <input
              type="radio"
              name="rueckfall"
              value={r}
              defaultChecked={start.rueckfall === r}
              className="mt-1 size-5 accent-gruen-700"
            />
            <span className="flex min-w-0 flex-col font-bold">
              {t(r === 'naeherung' ? 'berechnung.rueckfallNaeherung' : 'berechnung.rueckfallMethode')}
              <span className="text-16 font-normal text-tinte-2">
                {t(r === 'naeherung' ? 'berechnung.rueckfallNaeherungText' : 'berechnung.rueckfallMethodeText')}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <fieldset disabled={!darf} className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 font-bold">
          {t('berechnung.methode')}
          <select name="methode" defaultValue={start.methode} className={feld}>
            {METHODEN.map((m) => (
              <option key={m} value={m}>
                {t(`berechnung.methoden.${m}`)}
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
  const ts = useTranslations('verwaltung.shell');
  // Scrollbarer Rahmen wie TabellenRahmen (Muster 7): per Tastatur erreichbar, benannt, Hinweis unter 768 px
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-16 text-tinte-2 md:hidden">{ts('wischen')}</p>
      <div role="region" aria-label={titel} tabIndex={0} className="relative overflow-x-auto rounded-lg border border-linie">
        <table className="w-full min-w-160 border-collapse text-left tabular-nums">
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
    </div>
  );
}

/**
 * Tabellen-Import in zwei Schritten: prüfen (Fehler je Zeile oder Vorschau) → übernehmen (Server prüft erneut).
 * `art="einfuegen"` (ADR 0048): Textfeld für eine aus dem IGMG-Gebetskalender kopierte Tabelle, mit Schrittanleitung und
 * Direktlink; die Tage werden als IGMG-Zeiten gespeichert.
 */
export function ImportFormular({ art = 'datei', kalenderUrl }: { art?: 'datei' | 'einfuegen'; kalenderUrl?: string }) {
  const t = useTranslations('verwaltung.gebetszeiten');
  const [pruefung, pruefen, prueft] = useActionState<GebetszeitenZustand, FormData>(pruefeImport, {});
  const [uebernahme, uebernehmen, uebernimmt] = useActionState<GebetszeitenZustand, FormData>(uebernehmeImport, {});
  const ref = useFokus(pruefung);
  const ref2 = useFokus(uebernahme);
  const p = pruefung.pruefung;
  const datum = (d: string) => d.split('-').reverse().join('.');
  const id = art === 'einfuegen' ? 'einfuegen' : 'import';
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
      {art === 'einfuegen' ? (
        <form action={pruefen} className="flex flex-col gap-3" noValidate>
          <p className="text-tinte-2">{t('import.einfuegen.text')}</p>
          <ol className="flex list-decimal flex-col gap-1 pl-6">
            {(['schritt1', 'schritt2', 'schritt3', 'schritt4'] as const).map((s) => (
              <li key={s}>{t(`import.einfuegen.${s}`)}</li>
            ))}
          </ol>
          {kalenderUrl ? (
            <a
              href={kalenderUrl}
              target="_blank"
              rel="noopener noreferrer"
              hrefLang="de"
              aria-label={`${t('import.einfuegen.link')}: ${t('import.einfuegen.linkKontext')}`}
              className="inline-flex min-h-12 items-center gap-2 self-start font-bold"
            >
              {t('import.einfuegen.link')}
              <ExternalLink aria-hidden className="size-4 shrink-0" />
            </a>
          ) : null}
          <label className="flex min-w-0 flex-col gap-1 font-bold">
            {t('import.einfuegen.feld')}
            <textarea
              name="tabelle"
              rows={8}
              required
              spellCheck={false}
              aria-describedby={`${id}-hinweis`}
              className="w-full min-w-0 rounded-md border border-rand bg-weiss px-3 py-2 font-mono text-16"
            />
          </label>
          <p id={`${id}-hinweis`} className="text-16 text-tinte-2">
            {t('import.einfuegen.feldHinweis')}
          </p>
          <Button type="submit" variant="outline" className="self-start" disabled={prueft}>
            {t('import.einfuegen.pruefen')}
          </Button>
        </form>
      ) : (
        <form action={pruefen} className="flex flex-col gap-3" noValidate>
          <label className="flex min-w-0 flex-col gap-1 font-bold">
            {t('import.datei')}
            <input
              type="file"
              name="datei"
              accept=".csv,.json,text/csv,application/json"
              required
              className="w-full max-w-full min-w-0 text-18"
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
      )}
      <div ref={ref}>
        {pruefung.fehler ? (
          <Meldung art="fehler" fokus>
            {t(art === 'einfuegen' ? 'import.fehlerTabelle' : 'import.fehlerDatei')}
          </Meldung>
        ) : null}
        {pruefung.importFehler ? (
          <Meldung art="fehler" fokus>
            <span className="flex flex-col gap-1">
              <strong>{t('import.fehlerTitel')}</strong>
              <ul className="list-disc pl-5">
                {pruefung.importFehler.map((f) => (
                  <li key={`${f.zeile}-${f.fehler}`}>
                    {f.zeile > 0
                      ? t('import.fehlerZeile', { zeile: f.zeile, fehler: t(`import.fehlerArt.${f.fehler}`) })
                      : t(`import.fehlerArt.${f.fehler}`)}
                  </li>
                ))}
              </ul>
            </span>
          </Meldung>
        ) : null}
        {p ? (
          <div className="flex flex-col gap-3">
            <Meldung art="info" fokus>
              {t(p.herkunft === 'igmg' ? 'import.tabelleOk' : 'import.pruefungOk', {
                anzahl: p.anzahl,
                von: datum(p.von),
                bis: datum(p.bis),
              })}
            </Meldung>
            {p.herkunft === 'igmg' ? (
              <p className="text-16 text-tinte-2">
                {t('import.herkunftIgmg')}
                {p.ort ? ` · ${t('import.herkunftOrt', { ort: p.ort })}` : null}
              </p>
            ) : null}
            <ZeitenTabelle titel={p.dateiname} tage={p.erste} />
          </div>
        ) : null}
      </div>
      {p ? (
        <form action={uebernehmen} className="flex flex-col gap-3">
          <input type="hidden" name="tage" value={p.tage} />
          <input type="hidden" name="dateiname" value={p.dateiname} />
          <input type="hidden" name="herkunft" value={p.herkunft} />
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" name="alsQuelle" value="ja" defaultChecked className="mt-1 size-5 accent-gruen-700" />
            <span>{t(p.herkunft === 'igmg' ? 'import.alsQuelleIgmg' : 'import.alsQuelle')}</span>
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

/** Einstellungen des IGMG-Abgleichs (ADR 0048): an/aus, Stadt im IGMG-Kalender, Tage voraus, Freigabe. */
export function AbgleichFormular({ start, darf }: { start: GebetszeitenEinstellung['abgleich']; darf: boolean }) {
  const t = useTranslations('verwaltung.gebetszeiten');
  const [z, absenden, laeuft] = useActionState<GebetszeitenZustand, FormData>(speichereAbgleich, {});
  const ref = useFokus(z);
  const fehler = (f: string) => (z.feldFehler?.[f] ? true : undefined);
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <div ref={ref}>
        {z.ok ? (
          <Meldung art="erfolg" fokus>
            {t('abgleich.gespeichert')}
          </Meldung>
        ) : z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : null}
      </div>
      <fieldset disabled={!darf} className="flex flex-col gap-4">
        <legend className="font-bold">{t('abgleich.einstellungen')}</legend>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="aktiv" value="ja" defaultChecked={start.aktiv} className="mt-1 size-5 accent-gruen-700" />
          <span className="font-bold">{t('abgleich.aktiv')}</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 font-bold">
            {t('abgleich.stadtId')}
            <input
              name="stadtId"
              inputMode="numeric"
              defaultValue={start.stadtId}
              aria-invalid={fehler('stadtId')}
              aria-describedby="abgleich-stadt-hinweis"
              className={feld}
            />
          </label>
          <label className="flex flex-col gap-1 font-bold">
            {t('abgleich.stadtName')}
            <input name="stadtName" defaultValue={start.stadtName} aria-invalid={fehler('stadtName')} className={feld} />
          </label>
          <label className="flex flex-col gap-1 font-bold">
            {t('abgleich.tageVoraus')}
            <input
              type="number"
              name="tageVoraus"
              min={14}
              max={400}
              defaultValue={start.tageVoraus}
              aria-invalid={fehler('tageVoraus')}
              className={feld}
            />
          </label>
        </div>
        <p id="abgleich-stadt-hinweis" className="text-16 text-tinte-2">
          {t('abgleich.stadtIdHinweis')}
        </p>
        <fieldset className="flex flex-col gap-2">
          <legend className="font-bold">{t('abgleich.freigabe')}</legend>
          {(['automatisch', 'pruefen'] as const).map((f) => (
            <label key={f} className="flex min-h-12 cursor-pointer items-center gap-3">
              <input type="radio" name="freigabe" value={f} defaultChecked={start.freigabe === f} className="size-5 accent-gruen-700" />
              <span>{t(f === 'automatisch' ? 'abgleich.freigabeAutomatisch' : 'abgleich.freigabePruefen')}</span>
            </label>
          ))}
        </fieldset>
      </fieldset>
      {darf ? (
        <Button type="submit" className="self-start" disabled={laeuft}>
          {t('abgleich.speichern')}
        </Button>
      ) : null}
    </form>
  );
}

/** „Jetzt abgleichen“ mit Ergebnis (Zähler) als Live-Rückmeldung. */
export function JetztAbgleichen() {
  const t = useTranslations('verwaltung.gebetszeiten');
  const [z, absenden, laeuft] = useActionState<GebetszeitenZustand, FormData>(gleicheJetztAb, {});
  const ref = useFokus(z);
  const e = z.abgleich;
  return (
    <form action={absenden} className="flex flex-col gap-3">
      <Button type="submit" variant="outline" className="self-start" disabled={laeuft}>
        {t('abgleich.jetzt')}
      </Button>
      <div ref={ref}>
        {z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : e ? (
          <Meldung art={e.status === 'fehler' ? 'fehler' : 'info'} fokus>
            {t('abgleich.ergebnis', {
              status: t(`abgleich.status.${e.status}`),
              geprueft: e.tageGeprueft,
              neu: e.tageNeu,
              geaendert: e.tageGeaendert,
              konflikte: e.konflikte,
            })}
            {e.fehlerCode ? ` ${t(`abgleich.fehlerCode.${e.fehlerCode}` as never)}` : null}
          </Meldung>
        ) : null}
      </div>
    </form>
  );
}

/** Auffällige Lieferung freigeben (Status „auffällig“ oder Freigabe „prüfen“). */
export function AbgleichFreigeben({ laufId }: { laufId: string }) {
  const t = useTranslations('verwaltung.gebetszeiten');
  const [z, absenden, laeuft] = useActionState<GebetszeitenZustand, FormData>(gebeAbgleichFrei, {});
  const ref = useFokus(z);
  return (
    <form action={absenden} className="flex flex-col gap-3">
      <input type="hidden" name="lauf" value={laufId} />
      <div ref={ref}>
        {z.uebernommen !== undefined ? (
          <Meldung art="erfolg" fokus>
            {t('abgleich.freigegeben', { anzahl: z.uebernommen })}
          </Meldung>
        ) : z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : null}
      </div>
      {z.uebernommen === undefined ? (
        <Button type="submit" className="self-start" disabled={laeuft}>
          {t('abgleich.freigeben')}
        </Button>
      ) : null}
    </form>
  );
}

/** Konflikte mit dem Import der Gemeinde auflösen: IGMG-Werte für diese Tage übernehmen. */
export function KonflikteUebernehmen() {
  const t = useTranslations('verwaltung.gebetszeiten');
  const [z, absenden, laeuft] = useActionState<GebetszeitenZustand, FormData>(uebernehmeKonflikte, {});
  const ref = useFokus(z);
  return (
    <form action={absenden} className="flex flex-col gap-3">
      <div ref={ref}>
        {z.uebernommen !== undefined ? (
          <Meldung art="erfolg" fokus>
            {t('abgleich.konflikteUebernommen', { anzahl: z.uebernommen })}
          </Meldung>
        ) : null}
      </div>
      {z.uebernommen === undefined ? (
        <Button type="submit" variant="outline" className="self-start" disabled={laeuft}>
          {t('abgleich.konflikteUebernehmen')}
        </Button>
      ) : null}
    </form>
  );
}

/**
 * Näherung kalibrieren (ADR 0048): Vorschlag aus den IGMG-Tagen der Datenbank mit Güte je Gebet und 7-Tage-Vorschau, dann
 * „Vorschlag übernehmen“ (Server prüft den Vorschlag erneut).
 */
export function NaeherungVorschlag() {
  const t = useTranslations('verwaltung.gebetszeiten');
  const [z, vorschlagen, rechnet] = useActionState<GebetszeitenZustand, FormData>(schlageNaeherungVor, {});
  const [u, uebernehmen, speichert] = useActionState<GebetszeitenZustand, FormData>(uebernehmeNaeherung, {});
  const ref = useFokus(z);
  const ref2 = useFokus(u);
  const v = z.vorschlag;
  if (u.ok) {
    return (
      <div ref={ref2}>
        <Meldung art="erfolg" fokus>
          {t('naeherung.uebernommen')}
        </Meldung>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <form action={vorschlagen}>
        <Button type="submit" variant="outline" disabled={rechnet}>
          {t('naeherung.vorschlagen')}
        </Button>
      </form>
      <div ref={ref}>
        {z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : null}
        {v ? (
          <div className="flex flex-col gap-3">
            <Meldung art="info" fokus>
              {t('naeherung.vorschlagTitel', { tage: v.tage })}
            </Meldung>
            {v.warnungen.length ? (
              <ul className="list-disc pl-5 text-16 text-tinte-2">
                {v.warnungen.map((w) => (
                  <li key={w}>{t(`naeherung.warnung.${w}`)}</li>
                ))}
              </ul>
            ) : null}
            <div
              role="region"
              aria-label={t('naeherung.vorschlagTitel', { tage: v.tage })}
              tabIndex={0}
              className="relative overflow-x-auto"
            >
              <table className="w-full min-w-120 border-collapse text-left tabular-nums">
                <thead className="bg-sand">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-16">
                      {t('naeherung.gueteSpalte')}
                    </th>
                    <th scope="col" className="px-3 py-2 text-16">
                      {t('naeherung.exakt')}
                    </th>
                    <th scope="col" className="px-3 py-2 text-16">
                      {t('naeherung.max')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {GEBETE.map((g) => (
                    <tr key={g} className="border-t border-linie">
                      <th scope="row" className="px-3 py-2 font-bold">
                        {t(`gebet.${g}`)}
                      </th>
                      <td className="px-3 py-2">
                        {v.guete[g].exakt} / {v.guete[g].tage}
                      </td>
                      <td className="px-3 py-2">{t('abgleich.minuten', { anzahl: v.guete[g].maxFehlerMin })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {z.vorschau ? <ZeitenTabelle titel={t('naeherung.vorschauTitel')} tage={z.vorschau} /> : null}
          </div>
        ) : null}
      </div>
      {v ? (
        <form action={uebernehmen} className="flex flex-col gap-3">
          <input type="hidden" name="naeherung" value={v.naeherung} />
          {u.fehler ? <Meldung art="fehler">{t(`fehler.${u.fehler}` as never)}</Meldung> : null}
          <Button type="submit" className="self-start" disabled={speichert}>
            {t('naeherung.uebernehmen')}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
