'use client';

import { CircleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Eingabe der Linkadresse unter der Werkzeugleiste (ADR 0006). Die Prüfung läuft im Editor über `istErlaubterLink`;
 * hier geht nur die Eingabe und der Fehlertext hin und zurück. Enter übernimmt, Escape bricht ab. Beides verhindert
 * das Absenden des umgebenden Formulars.
 */
export function LinkFeld({
  id,
  wert,
  onWert,
  hinweis,
  fehler,
  onUebernehmen,
  onAbbrechen,
}: {
  id: string;
  wert: string;
  onWert: (wert: string) => void;
  hinweis: string;
  fehler: string | null;
  onUebernehmen: () => void;
  onAbbrechen: () => void;
}) {
  const t = useTranslations('verwaltung.editor');
  const feldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    feldRef.current?.focus();
  }, []);

  const beschrieben = [`${id}-hinweis`, fehler ? `${id}-fehler` : null].filter(Boolean).join(' ');

  function taste(ereignis: KeyboardEvent<HTMLInputElement>) {
    if (ereignis.key === 'Enter') {
      ereignis.preventDefault();
      onUebernehmen();
    } else if (ereignis.key === 'Escape') {
      ereignis.preventDefault();
      onAbbrechen();
    }
  }

  return (
    <div className="flex flex-col gap-3 border-b border-linie bg-papier p-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-link`} className="text-16 font-bold">
          {t('linkFeld')}
        </label>
        <p id={`${id}-hinweis`} className="text-16 text-tinte-2">
          {hinweis}
        </p>
        <input
          ref={feldRef}
          id={`${id}-link`}
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          maxLength={2000}
          value={wert}
          placeholder={t('linkPlatzhalter')}
          aria-invalid={fehler ? true : undefined}
          aria-describedby={beschrieben}
          onChange={(ereignis) => onWert(ereignis.target.value)}
          onKeyDown={taste}
          className="min-h-12 w-full min-w-0 rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte placeholder:text-tinte-3 focus-visible:border-2 focus-visible:border-gruen-700 aria-invalid:border-2 aria-invalid:border-fehler"
        />
        {fehler ? (
          <p id={`${id}-fehler`} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
            <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
            <span>{fehler}</span>
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onUebernehmen}>
          {t('linkUebernehmen')}
        </Button>
        <Button type="button" variant="outline" onClick={onAbbrechen}>
          {t('linkAbbrechen')}
        </Button>
      </div>
    </div>
  );
}
