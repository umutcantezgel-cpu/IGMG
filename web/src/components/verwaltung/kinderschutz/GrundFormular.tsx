'use client';

import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { KinderschutzZustand } from '@/server/actions/kinderschutz';

type Aktion = (vorher: KinderschutzZustand, fd: FormData) => Promise<KinderschutzZustand>;

/**
 * Kinderschutz-Handlung mit Pflichtgrund (S-09): versteckte Felder, Grund (3–300 Zeichen), optional eine Auswahl, ein
 * Knopf. Der Server prüft Recht und Grund erneut und schreibt ins Moderationsprotokoll. Meldung mit Fokus (K-11).
 */
export function GrundFormular({
  aktion,
  felder,
  knopf,
  gefahr = false,
  auswahl,
}: {
  aktion: Aktion;
  felder: Record<string, string>;
  knopf: string;
  gefahr?: boolean;
  auswahl?: { name: string; label: string; optionen: { wert: string; label: string }[] };
}) {
  const t = useTranslations('verwaltung.kinderschutz');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const meldungRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldungRef.current?.focus();
  }, [zustand]);

  return (
    <form action={absenden} className="flex flex-col gap-3" noValidate>
      <div ref={meldungRef} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${zustand.fehler}`)}</p>
          </Meldung>
        ) : zustand.gespeichert ? (
          <Meldung art="erfolg">{t('gespeichert')}</Meldung>
        ) : null}
      </div>
      {Object.entries(felder).map(([name, wert]) => (
        <input key={name} type="hidden" name={name} value={wert} />
      ))}
      {auswahl ? (
        <Rahmen
          id={`${id}-auswahl`}
          label={auswahl.label}
          kinder={(aria) => (
            <select {...aria} name={auswahl.name} defaultValue={auswahl.optionen[0]?.wert} className={eingabe}>
              {auswahl.optionen.map((o) => (
                <option key={o.wert} value={o.wert}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        />
      ) : null}
      <Rahmen
        id={`${id}-grund`}
        label={t('grund')}
        hinweis={t('grundHinweis')}
        fehler={zustand.fehler === 'grundFehlt' ? t('fehler.grundFehlt') : undefined}
        kinder={(aria) => <textarea {...aria} name="grund" required minLength={3} maxLength={300} rows={2} className={`${eingabe} py-2`} />}
      />
      <Button type="submit" variant={gefahr ? 'destructive' : 'default'} disabled={laeuft} className="self-start">
        {laeuft ? t('laeuft') : knopf}
      </Button>
    </form>
  );
}
