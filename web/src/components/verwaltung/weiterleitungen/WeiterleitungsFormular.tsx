'use client';

import { ArrowRight, Save } from 'lucide-react';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { WeiterleitungZustand } from '@/server/actions/weiterleitungen';

type Aktion = (vorher: WeiterleitungZustand, fd: FormData) => Promise<WeiterleitungZustand>;

/** Formular „Weiterleitung“: alte Adresse → neue Adresse, Art (308/301). Ungesteuerte Felder (MUSTER 6). */
export function WeiterleitungsFormular({
  aktion,
  startwerte,
  modus,
}: {
  aktion: Aktion;
  startwerte: { id: string; von: string; nach: string; code: string };
  modus: 'neu' | 'bearbeiten';
}) {
  const t = useTranslations('verwaltung.weiterleitungen');
  const tv = useTranslations('verwaltung');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const w = (zustand.werte as typeof startwerte | undefined) ?? startwerte;
  const basis = useId();
  const meldung = useRef<HTMLDivElement>(null);
  const f = (feld: string) => (zustand.feldFehler?.[feld] ? t(`fehler.${zustand.feldFehler[feld]}`) : undefined);

  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldung.current?.focus();
  }, [zustand]);

  return (
    <form action={absenden} className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6" noValidate>
      <h2 className="font-display text-24 font-semibold">{modus === 'neu' ? t('neu') : t('bearbeiten')}</h2>
      <div ref={meldung} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">{t(`fehler.${zustand.fehler}`)}</Meldung>
        ) : zustand.gespeichert ? (
          <Meldung art="erfolg">{t('gespeichert')}</Meldung>
        ) : null}
      </div>
      <input type="hidden" name="id" value={w.id} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <Rahmen
            id={`${basis}-von`}
            label={t('von')}
            hinweis={t('vonHinweis')}
            fehler={f('von')}
            pflicht={tv('pflichtfeld')}
            kinder={(aria) => (
              <input
                {...aria}
                name="von"
                type="text"
                defaultValue={w.von}
                maxLength={300}
                placeholder={t('vonPlatzhalter')}
                className={eingabe}
              />
            )}
          />
        </div>
        <ArrowRight aria-hidden className="mt-11 hidden size-6 shrink-0 text-gruen-700 lg:block" />
        <div className="min-w-0 flex-1">
          <Rahmen
            id={`${basis}-nach`}
            label={t('nach')}
            hinweis={t('nachHinweis')}
            fehler={f('nach')}
            pflicht={tv('pflichtfeld')}
            kinder={(aria) => (
              <input
                {...aria}
                name="nach"
                type="text"
                defaultValue={w.nach}
                maxLength={300}
                placeholder={t('nachPlatzhalter')}
                className={eingabe}
              />
            )}
          />
        </div>
      </div>
      <div className="max-w-md">
        <Rahmen
          id={`${basis}-code`}
          label={t('code')}
          hinweis={t('codeHinweis')}
          fehler={f('code')}
          kinder={(aria) => (
            <select {...aria} name="code" defaultValue={w.code} className={eingabe}>
              <option value="308">{t('code308')}</option>
              <option value="301">{t('code301')}</option>
            </select>
          )}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={laeuft}>
          <Save aria-hidden />
          {laeuft ? t('speichert') : t('speichern')}
        </Button>
        {modus === 'bearbeiten' ? (
          <NextLink href="/verwaltung/weiterleitungen" className="inline-flex min-h-12 items-center font-bold underline underline-offset-4">
            {t('abbrechen')}
          </NextLink>
        ) : null}
      </div>
    </form>
  );
}
