'use client';

import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import type { TicketZustand } from '@/server/actions/tickets';

type Option = { wert: string; label: string };
type Aktion = (vorher: TicketZustand, fd: FormData) => Promise<TicketZustand>;

/**
 * Status und Priorität eines Tickets ändern (nur Administration, `ticket.bearbeiten`). Der Server prüft Recht und
 * Organisation erneut; jede Änderung steht im Audit-Log mit altem und neuem Wert.
 */
export function StatusFormular({
  aktion,
  id,
  status,
  prioritaet,
  stati,
  prioritaeten,
}: {
  aktion: Aktion;
  id: string;
  status: string;
  prioritaet: string;
  stati: Option[];
  prioritaeten: Option[];
}) {
  const t = useTranslations('verwaltung.tickets');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const meldungRef = useRef<HTMLDivElement>(null);
  const basisId = useId();
  const feldId = (feld: string) => `${basisId}-${feld}`;
  const wert = (feld: string, vorgabe: string) => {
    const v = zustand.werte?.[feld] ?? vorgabe;
    return typeof v === 'string' ? v : vorgabe;
  };

  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldungRef.current?.focus();
  }, [zustand]);

  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <div ref={meldungRef} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${zustand.fehler}`)}</p>
          </Meldung>
        ) : zustand.gespeichert ? (
          <Meldung art="erfolg">{t('gespeichert')}</Meldung>
        ) : null}
      </div>
      <input type="hidden" name="id" value={id} />
      <Rahmen
        id={feldId('status')}
        label={t('aenderung.status')}
        kinder={(aria) => (
          <select {...aria} name="status" defaultValue={wert('status', status)} className={eingabe}>
            {stati.map((s) => (
              <option key={s.wert} value={s.wert}>
                {s.label}
              </option>
            ))}
          </select>
        )}
      />
      <Rahmen
        id={feldId('prioritaet')}
        label={t('aenderung.prioritaet')}
        kinder={(aria) => (
          <select {...aria} name="prioritaet" defaultValue={wert('prioritaet', prioritaet)} className={eingabe}>
            {prioritaeten.map((p) => (
              <option key={p.wert} value={p.wert}>
                {p.label}
              </option>
            ))}
          </select>
        )}
      />
      <Button type="submit" disabled={laeuft} className="self-start">
        <Save aria-hidden />
        {laeuft ? t('aenderung.speichert') : t('aenderung.speichern')}
      </Button>
    </form>
  );
}
