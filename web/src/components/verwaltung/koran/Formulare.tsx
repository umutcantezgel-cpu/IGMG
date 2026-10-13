'use client';

import type { JSONContent } from '@tiptap/core';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { RichTextEditor } from '@/components/verwaltung/RichTextEditor';
import { SpeicherKnoepfe, TextBereich, TextFeld, useKoranFormular, type KoranAktion } from './FormularBausteine';

/**
 * Bearbeitungsformulare des Moduls „Koran & Hadith“ (ADR 0030). Die Felder nehmen Texte von Menschen auf
 * (Imam, Hoca); der Server prüft Recht, Form und setzt den Freigabestand (jede Änderung → „zur Prüfung“).
 */

/** Bedeutung einer Wortform in einer Sprache (gilt für alle Vorkommen). */
export function BedeutungFormular({
  aktion,
  formId,
  sprache,
  start,
  einreichen,
  nurLesen = false,
}: {
  aktion: KoranAktion;
  formId: number;
  sprache: 'de' | 'tr';
  start: { bedeutung: string; wurzel: string; anmerkung: string };
  einreichen: boolean;
  nurLesen?: boolean;
}) {
  const { t, absenden, laeuft, wert, fehler, id, rueckmeldung, pflicht } = useKoranFormular(aktion, start);
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      {rueckmeldung}
      <input type="hidden" name="formId" value={formId} />
      <input type="hidden" name="sprache" value={sprache} />
      <fieldset disabled={nurLesen} className="flex min-w-0 flex-col gap-4">
        <TextFeld
          id={id('bedeutung')}
          name="bedeutung"
          label={t('woerter.bedeutung')}
          hinweis={t('woerter.bedeutungHinweis')}
          wert={wert('bedeutung')}
          fehler={fehler('bedeutung')}
          pflicht={pflicht}
          max={300}
          lang={sprache}
        />
        <TextFeld
          id={id('wurzel')}
          name="wurzel"
          label={t('woerter.wurzel')}
          hinweis={t('woerter.wurzelHinweis')}
          wert={wert('wurzel')}
          fehler={fehler('wurzel')}
          max={60}
          lang="ar"
          dir="rtl"
        />
        <TextBereich
          id={id('anmerkung')}
          name="anmerkung"
          label={t('woerter.anmerkung')}
          hinweis={t('woerter.anmerkungHinweis')}
          wert={wert('anmerkung')}
          fehler={fehler('anmerkung')}
          zeilen={2}
          max={600}
        />
        {nurLesen ? null : <SpeicherKnoepfe laeuft={laeuft} einreichen={einreichen} />}
      </fieldset>
    </form>
  );
}

/** Abweichende Bedeutung an einer gewählten Stelle (Sure|Vers|Wort) und Sprache. */
export function OrtFormular({
  aktion,
  stellen,
  sprachen,
}: {
  aktion: KoranAktion;
  stellen: { wert: string; label: string }[];
  sprachen: { wert: string; label: string }[];
}) {
  const { t, absenden, laeuft, wert, fehler, id, rueckmeldung, pflicht } = useKoranFormular(aktion);
  // Die Stelle kommt als eine Auswahl; der Server erwartet Sure, Vers und Wort getrennt
  const senden = (fd: FormData) => {
    const [sure = '', vers = '', pos = ''] = String(fd.get('stelle') ?? '').split('|');
    fd.set('sure', sure);
    fd.set('vers', vers);
    fd.set('pos', pos);
    absenden(fd);
  };
  const auswahl = (name: string, label: string, optionen: { wert: string; label: string }[]) => (
    <Rahmen
      id={id(name)}
      label={label}
      kinder={(aria) => (
        <select {...aria} name={name} defaultValue={wert(name) || optionen[0]?.wert} className={eingabe}>
          {optionen.map((o) => (
            <option key={o.wert} value={o.wert}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    />
  );
  return (
    <form action={senden} className="flex flex-col gap-4" noValidate>
      {rueckmeldung}
      <div className="grid gap-4 md:grid-cols-2">
        {auswahl('stelle', t('woerter.ortStelle'), stellen)}
        {auswahl('sprache', t('woerter.ortSprache'), sprachen)}
      </div>
      <TextFeld
        id={id('bedeutung')}
        name="bedeutung"
        label={t('woerter.bedeutung')}
        wert={wert('bedeutung')}
        fehler={fehler('bedeutung')}
        pflicht={pflicht}
        max={300}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="secondary" disabled={laeuft}>
          {laeuft ? t('laeuft') : t('woerter.ortSpeichern')}
        </Button>
        <Button type="submit" name="einreichen" value="1" disabled={laeuft}>
          {t('aktion.speichernEinreichen')}
        </Button>
      </div>
    </form>
  );
}

/** Name, Kurztext und Erklärung einer Tajwid-Regel (de/tr). */
export function TajwidFormular({
  aktion,
  schluessel,
  start,
  erklaerung,
  einreichen,
}: {
  aktion: KoranAktion;
  schluessel: string;
  start: { nameDe: string; nameTr: string; kurzDe: string; kurzTr: string };
  erklaerung: { de: JSONContent | null; tr: JSONContent | null };
  einreichen: boolean;
}) {
  const { t, absenden, laeuft, wert, fehler, id, rueckmeldung, pflicht } = useKoranFormular(aktion, start);
  const abschnitt = 'flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6';
  const legende = 'float-left mb-2 w-full font-display text-24 font-semibold';
  return (
    <form action={absenden} className="flex flex-col gap-6" noValidate>
      {rueckmeldung}
      <input type="hidden" name="schluessel" value={schluessel} />
      <fieldset className={abschnitt}>
        <legend className={legende}>{t('tajwid.abschnittName')}</legend>
        <div className="clear-both grid gap-4 md:grid-cols-2">
          <TextFeld
            id={id('nameDe')}
            name="nameDe"
            label={t('tajwid.nameDe')}
            wert={wert('nameDe')}
            fehler={fehler('nameDe')}
            pflicht={pflicht}
            max={80}
            lang="de"
          />
          <TextFeld
            id={id('nameTr')}
            name="nameTr"
            label={t('tajwid.nameTr')}
            wert={wert('nameTr')}
            fehler={fehler('nameTr')}
            max={80}
            lang="tr"
          />
        </div>
      </fieldset>
      <fieldset className={abschnitt}>
        <legend className={legende}>{t('tajwid.abschnittKurz')}</legend>
        <div className="clear-both grid gap-4 md:grid-cols-2">
          <TextBereich
            id={id('kurzDe')}
            name="kurzDe"
            label={t('tajwid.kurzDe')}
            hinweis={t('tajwid.kurzHinweis')}
            wert={wert('kurzDe')}
            fehler={fehler('kurzDe')}
            max={300}
            lang="de"
          />
          <TextBereich
            id={id('kurzTr')}
            name="kurzTr"
            label={t('tajwid.kurzTr')}
            hinweis={t('tajwid.kurzHinweis')}
            wert={wert('kurzTr')}
            fehler={fehler('kurzTr')}
            max={300}
            lang="tr"
          />
        </div>
      </fieldset>
      <fieldset className={abschnitt}>
        <legend className={legende}>{t('tajwid.abschnittErklaerung')}</legend>
        <div className="clear-both flex flex-col gap-6">
          <RichTextEditor name="erklaerungDe" startwert={erklaerung.de} label={t('tajwid.erklaerungDe')} fehler={fehler('erklaerungDe')} />
          <RichTextEditor name="erklaerungTr" startwert={erklaerung.tr} label={t('tajwid.erklaerungTr')} fehler={fehler('erklaerungTr')} />
        </div>
      </fieldset>
      <SpeicherKnoepfe laeuft={laeuft} einreichen={einreichen} />
    </form>
  );
}

/** Übersetzung eines Hadith in einer Sprache, mit Herkunft (Übersetzer, Quelle, Lizenz). */
export function HadithFormular({
  aktion,
  nummer,
  sprache,
  start,
  einreichen,
}: {
  aktion: KoranAktion;
  nummer: string;
  sprache: string;
  start: { text: string; uebersetzer: string; quelle: string; lizenz: string };
  einreichen: boolean;
}) {
  const { t, absenden, laeuft, wert, fehler, id, rueckmeldung, pflicht } = useKoranFormular(aktion, start);
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      {rueckmeldung}
      <input type="hidden" name="nummer" value={nummer} />
      <input type="hidden" name="sprache" value={sprache} />
      <TextBereich
        id={id('text')}
        name="text"
        label={t('hadith.text')}
        wert={wert('text')}
        fehler={fehler('text')}
        pflicht={pflicht}
        zeilen={8}
        lang={sprache}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <TextFeld
          id={id('uebersetzer')}
          name="uebersetzer"
          label={t('hadith.uebersetzer')}
          hinweis={t('hadith.uebersetzerHinweis')}
          wert={wert('uebersetzer')}
          fehler={fehler('uebersetzer')}
          pflicht={pflicht}
          max={200}
        />
        <TextFeld
          id={id('quelle')}
          name="quelle"
          label={t('hadith.quelle')}
          hinweis={t('hadith.quelleHinweis')}
          wert={wert('quelle')}
          fehler={fehler('quelle')}
          pflicht={pflicht}
          max={300}
        />
        <TextFeld
          id={id('lizenz')}
          name="lizenz"
          label={t('hadith.lizenz')}
          hinweis={t('hadith.lizenzHinweis')}
          wert={wert('lizenz')}
          fehler={fehler('lizenz')}
          pflicht={pflicht}
          max={300}
        />
      </div>
      <SpeicherKnoepfe laeuft={laeuft} einreichen={einreichen} />
    </form>
  );
}
