'use client';

import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { PostfachZustand } from '@/server/actions/postfach';
import { Feldrahmen, textfeld } from './Felder';

type Aktion = (vorher: PostfachZustand, fd: FormData) => Promise<PostfachZustand>;

/**
 * Antwort in einer bestehenden Unterhaltung. Fehler am Feld (aria-invalid, aria-describedby) und in der Zusammenfassung,
 * Fokus auf der Rückmeldung nach dem Absenden (K-07, K-11). Nach Erfolg lädt die Aktion die Seite neu.
 */
export function AntwortFormular({ unterhaltungId, aktion }: { unterhaltungId: string; aktion: Aktion }) {
  const t = useTranslations('verwaltung.postfach');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const basisId = useId();
  const textId = `${basisId}-text`;
  const meldungRef = useRef<HTMLDivElement>(null);
  const fehlerText = zustand.feldFehler?.text ? t(`fehler.${zustand.feldFehler.text}`) : undefined;
  const vorher = typeof zustand.werte?.text === 'string' ? zustand.werte.text : '';

  useEffect(() => {
    if (zustand.fehler) meldungRef.current?.focus();
  }, [zustand]);

  return (
    <form action={absenden} noValidate className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4 md:p-5">
      <h3 className="font-text text-20 font-bold tracking-normal">{t('antwortTitel')}</h3>
      <div ref={meldungRef} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${zustand.fehler}`)}</p>
            {fehlerText ? (
              <ul className="mt-2 list-disc pl-5 font-normal">
                <li>
                  <a href={`#${textId}`} className="text-fehler underline">
                    {t('nachricht')}: {fehlerText}
                  </a>
                </li>
              </ul>
            ) : null}
          </Meldung>
        ) : null}
      </div>
      <input type="hidden" name="unterhaltungId" value={unterhaltungId} />
      <Feldrahmen
        id={textId}
        label={t('nachricht')}
        pflicht={t('pflicht')}
        hinweis={t('nachrichtHinweis')}
        fehler={fehlerText}
        kinder={(aria) => <textarea {...aria} name="text" rows={5} defaultValue={vorher} required className={textfeld} />}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={laeuft}>
          <Send aria-hidden />
          {laeuft ? t('sendet') : t('senden')}
        </Button>
      </div>
    </form>
  );
}
