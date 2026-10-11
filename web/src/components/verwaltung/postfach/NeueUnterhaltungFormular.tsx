'use client';

import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { PostfachZustand } from '@/server/actions/postfach';
import { eingabe, Feldrahmen, textfeld } from './Felder';

type Aktion = (vorher: PostfachZustand, fd: FormData) => Promise<PostfachZustand>;

/** Mögliche Empfänger: Kennung und Anzeige „Name – Rolle“. */
export type EmpfaengerAuswahl = { id: string; label: string };

/** Beschriftungsschlüssel der Felder für die Fehler-Zusammenfassung. */
const beschriftung: Record<string, string> = { betreff: 'betreff', empfaenger: 'empfaenger', text: 'nachricht' };

/**
 * Neue Unterhaltung: Betreff, Empfänger (Kontrollkästchen mit Name und Rolle; das eigene Konto fehlt) und die erste
 * Nachricht. Ein Schema prüft Formular und Aktion gleich (ADR 0005); Fehler stehen am Feld und in der Zusammenfassung.
 */
export function NeueUnterhaltungFormular({ aktion, empfaenger }: { aktion: Aktion; empfaenger: EmpfaengerAuswahl[] }) {
  const t = useTranslations('verwaltung.postfach');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const basisId = useId();
  const id = (feld: string) => `${basisId}-${feld}`;
  const meldungRef = useRef<HTMLDivElement>(null);
  const fehler = zustand.feldFehler ?? {};
  const f = (feld: string) => (fehler[feld] ? t(`fehler.${fehler[feld]}`) : undefined);
  const werte = zustand.werte ?? {};
  const wert = (feld: string): string => {
    const roh = werte[feld];
    return typeof roh === 'string' ? roh : '';
  };
  const gewaehlt = Array.isArray(werte.empfaenger) ? werte.empfaenger.filter((x): x is string => typeof x === 'string') : [];
  const fehlerListe = Object.keys(fehler);
  const empfaengerId = id('empfaenger');

  useEffect(() => {
    if (zustand.fehler) meldungRef.current?.focus();
  }, [zustand]);

  return (
    <form action={absenden} noValidate className="flex flex-col gap-6">
      <div ref={meldungRef} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${zustand.fehler}`)}</p>
            {fehlerListe.length ? (
              <ul className="mt-2 list-disc pl-5 font-normal">
                {fehlerListe.map((k) => (
                  <li key={k}>
                    <a href={`#${id(k)}`} className="text-fehler underline">
                      {t(beschriftung[k] ?? 'nachricht')}: {t(`fehler.${fehler[k]}`)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Meldung>
        ) : null}
      </div>

      <Feldrahmen
        id={id('betreff')}
        label={t('betreff')}
        pflicht={t('pflicht')}
        hinweis={t('betreffHinweis')}
        fehler={f('betreff')}
        kinder={(aria) => <input {...aria} name="betreff" type="text" defaultValue={wert('betreff')} required className={eingabe} />}
      />

      <fieldset
        id={empfaengerId}
        aria-describedby={[`${empfaengerId}-hinweis`, f('empfaenger') ? `${empfaengerId}-fehler` : null].filter(Boolean).join(' ')}
        className="flex flex-col gap-3"
      >
        <legend className="mb-1 font-bold">
          {t('empfaenger')} <span className="font-normal text-tinte-2">{t('pflicht')}</span>
        </legend>
        <p id={`${empfaengerId}-hinweis`} className="text-16 text-tinte-2">
          {t('empfaengerHinweis')}
        </p>
        {empfaenger.length === 0 ? (
          <Meldung art="info">{t('keineEmpfaenger')}</Meldung>
        ) : (
          <div className="flex flex-col gap-2">
            {empfaenger.map((e) => (
              <label
                key={e.id}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-rand bg-weiss px-3 has-checked:border-gruen-700 has-checked:bg-gruen-50"
              >
                <input
                  type="checkbox"
                  name="empfaenger"
                  value={e.id}
                  defaultChecked={gewaehlt.includes(e.id)}
                  className="size-6 accent-gruen-700"
                />
                <span>{e.label}</span>
              </label>
            ))}
          </div>
        )}
        {f('empfaenger') ? (
          <p id={`${empfaengerId}-fehler`} className="text-16 font-bold text-fehler">
            {f('empfaenger')}
          </p>
        ) : null}
      </fieldset>

      <Feldrahmen
        id={id('text')}
        label={t('nachricht')}
        pflicht={t('pflicht')}
        hinweis={t('nachrichtHinweis')}
        fehler={f('text')}
        kinder={(aria) => <textarea {...aria} name="text" rows={8} defaultValue={wert('text')} required className={textfeld} />}
      />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={laeuft || empfaenger.length === 0}>
          <Send aria-hidden />
          {laeuft ? t('sendet') : t('senden')}
        </Button>
      </div>
    </form>
  );
}
