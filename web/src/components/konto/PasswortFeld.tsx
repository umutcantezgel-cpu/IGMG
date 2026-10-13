'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Feld } from '@/components/verwaltung/Feld';
import { passwortStaerke } from '@/lib/konto/passwort-staerke';

const STUFE_FARBE = ['bg-fehler', 'bg-fehler', 'bg-warnung', 'bg-gruen-700'] as const;

/**
 * Passwortfeld mit Anzeigen/Verbergen (48-px-Knopf, aria-pressed) und – für neue Passwörter – Stärke-Hinweis
 * (drei Balken plus Klartext, `aria-live`). Verbindlich ist nur die Mindestlänge (12 Zeichen).
 */
export function PasswortFeld({
  id,
  name,
  label,
  autoComplete,
  fehler,
  staerke = false,
  hinweis,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: 'current-password' | 'new-password';
  fehler?: string;
  staerke?: boolean;
  hinweis?: string;
}) {
  const t = useTranslations('konto');
  const [sichtbar, setSichtbar] = useState(false);
  const [wert, setWert] = useState('');
  const stufe = passwortStaerke(wert);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Feld
          id={id}
          name={name}
          type={sichtbar ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          maxLength={128}
          label={label}
          hinweis={hinweis}
          fehler={fehler}
          className="pr-14"
          onChange={staerke ? (e) => setWert(e.currentTarget.value) : undefined}
        />
        <button
          type="button"
          onClick={() => setSichtbar((s) => !s)}
          aria-label={sichtbar ? t('felder.passwortVerbergen') : t('felder.passwortAnzeigen')}
          aria-pressed={sichtbar}
          aria-controls={id}
          className="absolute top-7.5 right-0 flex size-12 cursor-pointer items-center justify-center rounded-md text-tinte-2 transition duration-(--dauer-rueckmeldung) hover:text-tinte active:scale-98 motion-reduce:active:scale-100"
        >
          {sichtbar ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
        </button>
      </div>
      {staerke ? (
        <div className="flex flex-col gap-1.5" aria-live="polite">
          <div aria-hidden className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-pill transition-colors duration-(--dauer-wechsel) ${wert && stufe >= s ? STUFE_FARBE[stufe] : 'bg-linie'}`}
              />
            ))}
          </div>
          <p className="text-16 text-tinte-2">
            <span className="sr-only">{t('staerke.label')}: </span>
            {wert ? t(`staerke.stufe${stufe}`) : t('staerke.tipp')}
          </p>
        </div>
      ) : null}
    </div>
  );
}
