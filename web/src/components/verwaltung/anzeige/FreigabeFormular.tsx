'use client';

import { BadgeCheck, Send, Undo2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { FreigabeStatus } from '@/lib/religioes/freigabe';
import type { AnzeigeZustand } from '@/server/actions/anzeige';

type Aktion = (vorher: AnzeigeZustand, fd: FormData) => Promise<AnzeigeZustand>;

/**
 * Freigabe einer Vers- oder Hadith-Folie (ADR 0030): nur die Schritte, die zum Stand und zu den Rechten passen.
 * Einreichen (Redaktion), freigeben (religiöse Prüfung, nicht die verfassende Person), zurückweisen bzw. Freigabe
 * aufheben (mit Grund). Die Server Action prüft alles erneut.
 */
export function FreigabeFormular({
  aktion,
  id,
  freigabe,
  darfEinreichen,
  darfPruefen,
  eigen,
}: {
  aktion: Aktion;
  id: string;
  freigabe: FreigabeStatus;
  darfEinreichen: boolean;
  darfPruefen: boolean;
  eigen: boolean;
}) {
  const t = useTranslations('verwaltung.anzeige');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const basis = useId();
  const meldung = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldung.current?.focus();
  }, [zustand]);
  const einreichen = darfEinreichen && freigabe === 'entwurf';
  const freigeben = darfPruefen && freigabe === 'zur_pruefung' && !eigen;
  const zurueck = darfPruefen && freigabe !== 'entwurf';
  if (!einreichen && !freigeben && !zurueck && !zustand.fehler && !zustand.gespeichert)
    return eigen && darfPruefen && freigabe === 'zur_pruefung' ? (
      <p className="text-16 font-bold text-tinte-2">{t('detail.eigen')}</p>
    ) : null;
  const grundFehler = zustand.feldFehler?.grund ? t(`fehler.${zustand.feldFehler.grund}`) : undefined;

  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <div ref={meldung} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">{t(`fehler.${zustand.fehler}`)}</Meldung>
        ) : zustand.gespeichert && zustand.freigabe ? (
          <Meldung art="erfolg">{t('gespeichertStatus', { status: t(`freigabe.${zustand.freigabe}`) })}</Meldung>
        ) : null}
      </div>
      <input type="hidden" name="id" value={id} />
      {eigen && darfPruefen && freigabe === 'zur_pruefung' ? <p className="text-16 font-bold text-tinte-2">{t('detail.eigen')}</p> : null}
      {zurueck ? (
        <Rahmen
          id={`${basis}-grund`}
          label={t('detail.grund')}
          hinweis={t('detail.grundHinweis')}
          fehler={grundFehler}
          kinder={(aria) => <textarea {...aria} name="grund" rows={2} maxLength={300} className={`${eingabe} py-3 leading-normal`} />}
        />
      ) : null}
      <div className="flex flex-wrap gap-3">
        {einreichen ? (
          <Button type="submit" name="ziel" value="zur_pruefung" disabled={laeuft}>
            <Send aria-hidden />
            {t('detail.einreichen')}
          </Button>
        ) : null}
        {freigeben ? (
          <Button type="submit" name="ziel" value="geprueft" disabled={laeuft}>
            <BadgeCheck aria-hidden />
            {t('detail.freigeben')}
          </Button>
        ) : null}
        {zurueck ? (
          <Button type="submit" name="ziel" value="entwurf" variant="outline" disabled={laeuft}>
            <Undo2 aria-hidden />
            {freigabe === 'geprueft' ? t('detail.aufheben') : t('detail.zurueckweisen')}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
