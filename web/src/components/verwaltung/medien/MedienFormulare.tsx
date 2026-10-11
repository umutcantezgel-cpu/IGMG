'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Feld } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { aendern, hochladen, type MedienZustand } from '@/server/actions/medien';

type Start = { altDe: string; altTr: string; altEn: string; bildrechte: string };

function useFokus(z: MedienZustand) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (z.fehler || z.ok) ref.current?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus();
  }, [z]);
  return ref;
}

function TextFelder({ z, start, tv }: { z: MedienZustand; start: Start; tv: string }) {
  const t = useTranslations('verwaltung.medien');
  const fehler = (f: string) => (z.feldFehler?.[f] ? t(`fehler.${z.feldFehler[f]}` as never) : undefined);
  const wert = (f: keyof Start) => z.werte?.[f] ?? start[f];
  return (
    <>
      <Feld
        id="medium-alt-de"
        name="altDe"
        required
        label={t('hochladen.altDe')}
        pflicht={tv}
        hinweis={t('hochladen.altHinweis')}
        defaultValue={wert('altDe')}
        fehler={fehler('altDe')}
      />
      <details className="rounded-md border border-linie px-4 py-2" open={Boolean(start.altTr || start.altEn)}>
        <summary className="min-h-11 cursor-pointer content-center font-bold">{t('hochladen.uebersetzungen')}</summary>
        <div className="flex flex-col gap-4 py-3">
          <Feld
            id="medium-alt-tr"
            name="altTr"
            lang="tr"
            label={t('hochladen.altTr')}
            defaultValue={wert('altTr')}
            fehler={fehler('altTr')}
          />
          <Feld
            id="medium-alt-en"
            name="altEn"
            lang="en"
            label={t('hochladen.altEn')}
            defaultValue={wert('altEn')}
            fehler={fehler('altEn')}
          />
        </div>
      </details>
      <Feld
        id="medium-bildrechte"
        name="bildrechte"
        label={t('hochladen.bildrechte')}
        hinweis={t('hochladen.bildrechteHinweis')}
        defaultValue={wert('bildrechte')}
        fehler={fehler('bildrechte')}
      />
    </>
  );
}

/** Hochladen (C11, ADR 0007): Datei, Alt-Text (Pflicht), Bildrechte; nach Erfolg zur Detailseite. */
export function HochladenFormular() {
  const t = useTranslations('verwaltung.medien');
  const tv = useTranslations('verwaltung');
  // Erfolg leitet die Action selbst zur Detailseite weiter (kein router.push im Effekt, siehe hochladen())
  const [z, absenden, laeuft] = useActionState<MedienZustand, FormData>(hochladen, {});
  const ref = useFokus(z);
  const dateiFehler = z.feldFehler?.datei ? t(`fehler.${z.feldFehler.datei}` as never) : undefined;
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <div ref={ref}>
        {z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="medium-datei" className="font-bold">
          {t('hochladen.datei')} <span className="font-normal text-tinte-2">{tv('pflichtfeld')}</span>
        </label>
        <p id="medium-datei-hinweis" className="text-16 text-tinte-2">
          {t('hochladen.dateiHinweis')}
        </p>
        <input
          id="medium-datei"
          type="file"
          name="datei"
          required
          accept="image/jpeg,image/png,image/webp,image/avif,application/pdf"
          aria-invalid={dateiFehler ? true : undefined}
          aria-describedby={['medium-datei-hinweis', dateiFehler ? 'medium-datei-fehler' : ''].filter(Boolean).join(' ')}
          className="text-18"
        />
        {dateiFehler ? (
          <p id="medium-datei-fehler" className="text-16 font-bold text-fehler">
            {dateiFehler}
          </p>
        ) : null}
      </div>
      <TextFelder z={z} start={{ altDe: '', altTr: '', altEn: '', bildrechte: '' }} tv={tv('pflichtfeld')} />
      <Button type="submit" className="self-start" disabled={laeuft}>
        {laeuft ? t('hochladen.sendet') : t('hochladen.senden')}
      </Button>
    </form>
  );
}

/** Alt-Text und Bildrechte ändern (C11). */
export function MediumTextFormular({ id, start, darf }: { id: string; start: Start; darf: boolean }) {
  const t = useTranslations('verwaltung.medien');
  const tv = useTranslations('verwaltung');
  const [z, absenden, laeuft] = useActionState<MedienZustand, FormData>(aendern, {});
  const ref = useFokus(z);
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="id" value={id} />
      <div ref={ref}>
        {z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : z.ok ? (
          <Meldung art="erfolg" fokus>
            {t('detail.gespeichert')}
          </Meldung>
        ) : null}
      </div>
      <fieldset disabled={!darf} className="flex flex-col gap-4">
        <TextFelder z={z} start={start} tv={tv('pflichtfeld')} />
      </fieldset>
      {darf ? (
        <Button type="submit" className="self-start" disabled={laeuft}>
          {t('detail.speichern')}
        </Button>
      ) : null}
    </form>
  );
}
