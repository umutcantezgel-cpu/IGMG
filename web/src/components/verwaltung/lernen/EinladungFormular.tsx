'use client';

import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { KontenZustand } from '@/server/actions/gemeinde-konten';

type Aktion = (vorher: KontenZustand, fd: FormData) => Promise<KontenZustand>;
const ARTEN = ['eltern', 'lehrkraft', 'schueler'] as const;
const FELDER = ['art', 'name', 'email', 'lernendeId', 'sprache', 'gueltigTage'] as const;

/**
 * Einladung in ein Gemeinde-Konto (H-L05): Kontoart, Name, E-Mail, optional Bezug auf Lernende (Pflicht für Schüler ab
 * 16), Sprache der Mail und Gültigkeit. Aus der Detailansicht einer Lernenden mit fester Kontoart „Eltern“.
 * Der Link erscheint nur in dieser Antwort (gespeichert ist nur sein Hash).
 */
export function EinladungFormular({
  aktion,
  lernende,
  fest,
}: {
  aktion: Aktion;
  lernende: { id: string; anzeigename: string; ab16: boolean; konto: boolean }[];
  fest?: { art: 'eltern'; lernendeId: string };
}) {
  const t = useTranslations('verwaltung.gemeindeKonten');
  const tv = useTranslations('verwaltung');
  const [z, absenden, laeuft] = useActionState(aktion, {});
  const ref = useRef<HTMLDivElement>(null);
  const basis = useId();
  const id = (f: string) => `${basis}-${f}`;
  const w = (f: string, standard = '') => z.werte?.[f] ?? standard;
  const fehler = (f: string) => (z.feldFehler?.[f] ? t(`fehler.${z.feldFehler[f]}` as never) : undefined);
  const fehlerListe = FELDER.filter((f) => z.feldFehler?.[f]);

  useEffect(() => {
    if (z.fehler || z.ok) ref.current?.focus();
  }, [z]);

  return (
    <form action={absenden} className="flex flex-col gap-5" noValidate key={z.ok ? `ok-${z.link ?? 'vorhanden'}` : 'offen'}>
      <div ref={ref} tabIndex={-1} className="outline-none">
        {z.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${z.fehler}` as never)}</p>
            {fehlerListe.length ? (
              <ul className="mt-2 list-disc pl-5 font-normal">
                {fehlerListe.map((f) => (
                  <li key={f}>
                    <a href={`#${id(f)}`} className="text-fehler underline">
                      {t(`einladen.${f}` as never)}: {fehler(f)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Meldung>
        ) : z.ok && z.vorhanden ? (
          <Meldung art="info">{t('einladen.vorhanden')}</Meldung>
        ) : z.ok ? (
          <Meldung art="erfolg">
            <p>{t('einladen.verschickt')}</p>
            {z.link ? (
              <p className="mt-2 font-normal">
                {t('einladen.linkHinweis')} <code className="rounded-sm bg-weiss px-1.5 py-0.5 text-16 break-all text-tinte">{z.link}</code>
              </p>
            ) : null}
          </Meldung>
        ) : null}
      </div>
      {fest ? (
        <>
          <input type="hidden" name="art" value={fest.art} />
          <input type="hidden" name="lernendeId" value={fest.lernendeId} />
        </>
      ) : (
        <fieldset className="flex flex-col gap-2" aria-describedby={`${id('art')}-hinweis`}>
          <legend id={id('art')} className="mb-1 font-bold">
            {t('einladen.art')} <span className="font-normal text-tinte-2">{tv('pflichtfeld')}</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {ARTEN.map((art) => (
              <label
                key={art}
                className="grid min-h-12 cursor-pointer raster-symbol content-start gap-x-3 rounded-md border border-rand bg-weiss p-3.5 has-checked:border-gruen-700 has-checked:bg-gruen-50"
              >
                <input
                  type="radio"
                  name="art"
                  value={art}
                  defaultChecked={w('art', 'eltern') === art}
                  className="row-span-2 mt-1 size-5 accent-gruen-700"
                />
                <span className="font-bold">{t(`art.${art}`)}</span>
                <span className="text-16 text-tinte-2">{t(`artHinweis.${art}`)}</span>
              </label>
            ))}
          </div>
          <p id={`${id('art')}-hinweis`} className="text-16 text-tinte-2">
            {t('einladen.artHinweis')}
          </p>
        </fieldset>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Rahmen
          id={id('name')}
          label={t('einladen.name')}
          pflicht={tv('pflichtfeld')}
          fehler={fehler('name')}
          kinder={(aria) => (
            <input {...aria} name="name" autoComplete="off" defaultValue={w('name')} maxLength={100} required className={eingabe} />
          )}
        />
        <Rahmen
          id={id('email')}
          label={t('einladen.email')}
          pflicht={tv('pflichtfeld')}
          fehler={fehler('email')}
          kinder={(aria) => (
            <input
              {...aria}
              name="email"
              type="email"
              autoComplete="off"
              defaultValue={w('email')}
              maxLength={254}
              required
              className={eingabe}
            />
          )}
        />
        {fest ? null : (
          <div className="md:col-span-2">
            <Rahmen
              id={id('lernendeId')}
              label={t('einladen.lernendeId')}
              hinweis={t('einladen.lernendeHinweis')}
              fehler={fehler('lernendeId')}
              kinder={(aria) => (
                <select {...aria} name="lernendeId" defaultValue={w('lernendeId')} className={eingabe}>
                  <option value="">{t('einladen.keineLernende')}</option>
                  {lernende.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.anzeigename}
                      {l.ab16 ? ` · ${t('einladen.ab16')}` : ''}
                      {l.konto ? ` · ${t('einladen.hatKonto')}` : ''}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        )}
        <Rahmen
          id={id('sprache')}
          label={t('einladen.sprache')}
          hinweis={t('einladen.spracheHinweis')}
          fehler={fehler('sprache')}
          kinder={(aria) => (
            <select {...aria} name="sprache" defaultValue={w('sprache', 'de')} className={eingabe}>
              <option value="de">{t('sprachen.de')}</option>
              <option value="tr">{t('sprachen.tr')}</option>
              <option value="en">{t('sprachen.en')}</option>
            </select>
          )}
        />
        <Rahmen
          id={id('gueltigTage')}
          label={t('einladen.gueltigTage')}
          hinweis={t('einladen.gueltigHinweis')}
          fehler={fehler('gueltigTage')}
          kinder={(aria) => (
            <input {...aria} name="gueltigTage" type="number" min={1} max={30} defaultValue={w('gueltigTage', '14')} className={eingabe} />
          )}
        />
      </div>
      <Button type="submit" className="self-start" disabled={laeuft}>
        <Send aria-hidden />
        {laeuft ? t('einladen.sendet') : t('einladen.senden')}
      </Button>
    </form>
  );
}
