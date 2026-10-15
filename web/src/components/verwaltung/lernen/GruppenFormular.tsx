'use client';

import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { cn } from '@/lib/utils';
import type { GruppenZustand } from '@/server/actions/gruppen';

type Aktion = (vorher: GruppenZustand, fd: FormData) => Promise<GruppenZustand>;
export type GruppenStartwerte = Record<string, string | string[]>;

const KURSARTEN = ['elifbe', 'kuran', 'tecvid', 'ilmihal', 'hifz'] as const;
/** Montag zuerst; Werte wie `Date.getUTCDay` (0 = Sonntag). */
const WOCHE = ['1', '2', '3', '4', '5', '6', '0'] as const;
const FELDER = [
  'nameDe',
  'nameTr',
  'kursId',
  'kursart',
  'schuljahr',
  'status',
  'wochentage',
  'uhrzeitVon',
  'uhrzeitBis',
  'beginn',
  'ende',
  'ort',
  'chatModus',
  'chatMindestalter',
  'chatVon',
  'chatBis',
] as const;

function Abschnitt({ titel, hinweis, kinder }: { titel: string; hinweis?: string; kinder: ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <legend className="float-left mb-1 w-full font-display text-24 font-semibold">{titel}</legend>
      {hinweis ? <p className="clear-both max-w-text text-16 text-tinte-2">{hinweis}</p> : null}
      <div className="clear-both grid gap-4 md:grid-cols-2">{kinder}</div>
    </fieldset>
  );
}

/**
 * Formular „Gruppe“ (H-L01): Angaben, Zeiten und Ort, Gruppenchat (S-02, S-04, S-06). Ein Schema für Client und Server
 * (`gruppeSchema`); Fehler kommen als Schlüssel und stehen am Feld und in der Zusammenfassung oben.
 */
export function GruppenFormular({
  aktion,
  startwerte,
  kurse,
  modus,
  nurLesen = false,
}: {
  aktion: Aktion;
  startwerte: GruppenStartwerte;
  kurse: { id: string; titel: string }[];
  modus: 'neu' | 'bearbeiten';
  nurLesen?: boolean;
}) {
  const t = useTranslations('verwaltung.gruppen');
  const tl = useTranslations('verwaltung.lernen');
  const tv = useTranslations('verwaltung');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const w = (zustand.werte as GruppenStartwerte | undefined) ?? startwerte;
  const meldungRef = useRef<HTMLDivElement>(null);
  const basis = useId();
  const id = (feld: string) => `${basis}-${feld}`;
  const fehler = (feld: string) => (zustand.feldFehler?.[feld] ? t(`fehler.${zustand.feldFehler[feld]}` as never) : undefined);
  const text = (feld: string) => {
    const v = w[feld];
    return typeof v === 'string' ? v : '';
  };
  const liste = (feld: string) => {
    const v = w[feld];
    return Array.isArray(v) ? v : [];
  };
  const fehlerListe = FELDER.filter((f) => zustand.feldFehler?.[f]);

  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldungRef.current?.focus();
  }, [zustand]);

  const feld = (
    name: string,
    opt: { typ?: string; pflicht?: boolean; max?: number; min?: string; maxWert?: string; hinweis?: string } = {},
  ) => (
    <Rahmen
      id={id(name)}
      label={t(`formular.${name}` as never)}
      hinweis={opt.hinweis}
      fehler={fehler(name)}
      pflicht={opt.pflicht ? tv('pflichtfeld') : undefined}
      kinder={(aria) => (
        <input
          {...aria}
          name={name}
          type={opt.typ ?? 'text'}
          defaultValue={text(name)}
          required={opt.pflicht}
          maxLength={opt.max}
          min={opt.min}
          max={opt.maxWert}
          className={eingabe}
        />
      )}
    />
  );
  const auswahl = (name: string, optionen: { wert: string; label: string }[], hinweis?: string) => (
    <Rahmen
      id={id(name)}
      label={t(`formular.${name}` as never)}
      hinweis={hinweis}
      fehler={fehler(name)}
      kinder={(aria) => (
        // key: React setzt das Formular nach jeder Aktion auf die Startwerte zurück, übernimmt bei <select> aber keinen
        // geänderten defaultValue – ohne Neuaufbau stünde nach einem Fehler wieder der alte Wert (z. B. „Chat aus“, P4)
        <select key={text(name)} {...aria} name={name} defaultValue={text(name)} className={eingabe}>
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
    <form action={absenden} className="flex flex-col gap-6" noValidate>
      <div ref={meldungRef} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${zustand.fehler}` as never)}</p>
            {fehlerListe.length ? (
              <ul className="mt-2 list-disc pl-5 font-normal">
                {fehlerListe.map((f) => (
                  <li key={f}>
                    <a href={`#${id(f)}`} className="text-fehler underline">
                      {t(`formular.${f}` as never)}: {fehler(f)}
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
      <input type="hidden" name="id" value={text('id')} />
      <fieldset disabled={nurLesen} className="flex min-w-0 flex-col gap-6">
        <Abschnitt
          titel={t('formular.abschnittGruppe')}
          kinder={
            <>
              {feld('nameDe', { pflicht: true, max: 120 })}
              {feld('nameTr', { max: 120, hinweis: t('formular.nameTrHinweis') })}
              {auswahl('kursId', [{ wert: '', label: t('formular.keinKurs') }, ...kurse.map((k) => ({ wert: k.id, label: k.titel }))])}
              {auswahl(
                'kursart',
                [{ wert: '', label: t('formular.keineKursart') }, ...KURSARTEN.map((k) => ({ wert: k, label: tl(`kursart.${k}`) }))],
                t('formular.kursartHinweis'),
              )}
              {feld('schuljahr', { max: 20, hinweis: t('formular.schuljahrHinweis') })}
              {auswahl('status', [
                { wert: 'aktiv', label: t('status.aktiv') },
                { wert: 'archiviert', label: t('status.archiviert') },
              ])}
            </>
          }
        />
        <Abschnitt
          titel={t('formular.abschnittZeiten')}
          hinweis={t('formular.zeitenHinweis')}
          kinder={
            <>
              <fieldset className="md:col-span-2" aria-describedby={fehler('wochentage') ? `${id('wochentage')}-fehler` : undefined}>
                <legend id={id('wochentage')} className="mb-2 font-bold">
                  {t('formular.wochentage')}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {WOCHE.map((tag) => (
                    <label
                      key={tag}
                      className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border border-rand bg-weiss px-3.5 font-bold has-checked:border-gruen-700 has-checked:bg-gruen-50"
                    >
                      <input
                        type="checkbox"
                        name="wochentage"
                        value={tag}
                        defaultChecked={liste('wochentage').includes(tag)}
                        className="size-5 accent-gruen-700"
                      />
                      <span aria-hidden>{tl(`wochentagKurz.${tag}` as never)}</span>
                      <span className="sr-only">{tl(`wochentag.${tag}` as never)}</span>
                    </label>
                  ))}
                </div>
                {fehler('wochentage') ? (
                  <p id={`${id('wochentage')}-fehler`} className="mt-1.5 text-16 font-bold text-fehler">
                    {fehler('wochentage')}
                  </p>
                ) : null}
              </fieldset>
              {feld('uhrzeitVon', { typ: 'time' })}
              {feld('uhrzeitBis', { typ: 'time' })}
              {feld('beginn', { typ: 'date' })}
              {feld('ende', { typ: 'date', hinweis: t('formular.endeHinweis') })}
              <div className="md:col-span-2">{feld('ort', { max: 120, hinweis: t('formular.ortHinweis') })}</div>
            </>
          }
        />
        <Abschnitt
          titel={t('formular.abschnittChat')}
          hinweis={t('formular.chatHinweis')}
          kinder={
            <>
              {auswahl('chatModus', [
                { wert: 'aus', label: t('chatModus.aus') },
                { wert: 'nur_lehrkraft', label: t('chatModus.nur_lehrkraft') },
                { wert: 'offen', label: t('chatModus.offen') },
              ])}
              {feld('chatMindestalter', { typ: 'number', min: '10', maxWert: '18', hinweis: t('formular.chatMindestalterHinweis') })}
              {feld('chatVon', { typ: 'time', min: '08:00', maxWert: '20:00' })}
              {feld('chatBis', { typ: 'time', min: '08:00', maxWert: '20:00', hinweis: t('formular.chatZeitenHinweis') })}
            </>
          }
        />
      </fieldset>
      {nurLesen ? null : (
        <Button type="submit" className={cn('self-start')} disabled={laeuft}>
          <Save aria-hidden />
          {laeuft ? t('speichertGerade') : modus === 'neu' ? t('anlegen') : t('speichern')}
        </Button>
      )}
    </form>
  );
}
