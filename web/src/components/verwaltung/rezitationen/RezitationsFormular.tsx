'use client';

import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Feld, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { REZITATION_ARTEN, type REZITATION_FELDER } from '@/lib/validierung/rezitation';
import type { RezitationZustand } from '@/server/actions/rezitationen';

type Werte = Record<(typeof REZITATION_FELDER)[number], string>;

/**
 * Angaben einer Rezitation (Anlegen und Bearbeiten, Muster 6): Name (Deutsch Pflicht, Übersetzungen optional),
 * Rezitator, Art, Lizenz; beim Anlegen optional die Kennung. Fehler am Feld, Zusammenfassung mit Fokus.
 */
export function RezitationsFormular({
  aktion,
  startwerte,
  modus,
  id,
  nurLesen = false,
}: {
  aktion: (vorher: RezitationZustand, fd: FormData) => Promise<RezitationZustand>;
  startwerte: Werte;
  modus: 'neu' | 'bearbeiten';
  id?: string;
  nurLesen?: boolean;
}) {
  const t = useTranslations('verwaltung.rezitationen');
  const tv = useTranslations('verwaltung');
  const [z, absenden, laeuft] = useActionState(aktion, {});
  const ref = useRef<HTMLDivElement>(null);
  const basis = useId();
  useEffect(() => {
    if (z.fehler || z.gespeichert) ref.current?.focus();
  }, [z]);
  const wert = (f: keyof Werte) => z.werte?.[f] ?? startwerte[f];
  const fehler = (f: keyof Werte) => (z.feldFehler?.[f] ? t(`fehler.${z.feldFehler[f]}` as never) : undefined);
  const feldId = (f: string) => `${basis}-${f}`;

  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <div ref={ref} tabIndex={-1} className="outline-none empty:hidden">
        {z.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${z.fehler}` as never)}</p>
            {z.feldFehler ? (
              <ul className="mt-1 list-disc ps-5 font-normal">
                {Object.keys(z.feldFehler).map((f) => (
                  <li key={f}>
                    <a href={`#${feldId(f)}`} className="underline underline-offset-4">
                      {t(`formular.${f}` as never)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Meldung>
        ) : z.gespeichert ? (
          <Meldung art="erfolg">{t('formular.gespeichert')}</Meldung>
        ) : null}
      </div>
      <fieldset disabled={nurLesen || laeuft} className="flex min-w-0 flex-col gap-4">
        <Feld
          id={feldId('nameDe')}
          name="nameDe"
          required
          label={t('formular.nameDe')}
          pflicht={tv('pflichtfeld')}
          hinweis={t('formular.nameHinweis')}
          defaultValue={wert('nameDe')}
          fehler={fehler('nameDe')}
        />
        <details className="rounded-md border border-linie px-4 py-2" open={Boolean(startwerte.nameTr || startwerte.nameEn)}>
          <summary className="min-h-11 cursor-pointer content-center font-bold">{t('formular.uebersetzungen')}</summary>
          <div className="flex flex-col gap-4 py-3">
            <Feld
              id={feldId('nameTr')}
              name="nameTr"
              lang="tr"
              label={t('formular.nameTr')}
              defaultValue={wert('nameTr')}
              fehler={fehler('nameTr')}
            />
            <Feld
              id={feldId('nameEn')}
              name="nameEn"
              lang="en"
              label={t('formular.nameEn')}
              defaultValue={wert('nameEn')}
              fehler={fehler('nameEn')}
            />
          </div>
        </details>
        <Feld
          id={feldId('rezitator')}
          name="rezitator"
          required
          label={t('formular.rezitator')}
          pflicht={tv('pflichtfeld')}
          hinweis={t('formular.rezitatorHinweis')}
          defaultValue={wert('rezitator')}
          fehler={fehler('rezitator')}
        />
        <Rahmen
          id={feldId('art')}
          label={t('formular.art')}
          pflicht={tv('pflichtfeld')}
          fehler={fehler('art')}
          kinder={(aria) => (
            <select {...aria} name="art" defaultValue={wert('art')} className={eingabe}>
              {REZITATION_ARTEN.map((a) => (
                <option key={a} value={a}>
                  {t(`art.${a}`)}
                </option>
              ))}
            </select>
          )}
        />
        <Feld
          id={feldId('lizenz')}
          name="lizenz"
          required
          label={t('formular.lizenz')}
          pflicht={tv('pflichtfeld')}
          hinweis={t('formular.lizenzHinweis')}
          defaultValue={wert('lizenz')}
          fehler={fehler('lizenz')}
        />
        {modus === 'neu' ? (
          <Feld
            id={feldId('kennung')}
            name="kennung"
            label={t('formular.kennung')}
            hinweis={t('formular.kennungHinweis')}
            defaultValue={wert('kennung')}
            fehler={fehler('kennung')}
            autoCapitalize="off"
            spellCheck={false}
          />
        ) : null}
      </fieldset>
      {!nurLesen ? (
        <Button type="submit" className="self-start" disabled={laeuft}>
          {laeuft ? t('formular.sendet') : modus === 'neu' ? t('formular.anlegen') : t('formular.speichern')}
        </Button>
      ) : null}
    </form>
  );
}
