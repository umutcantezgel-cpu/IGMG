'use client';

import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { eingabe, Rahmen } from '@/components/verwaltung/tickets/Felder';
import { cn } from '@/lib/utils';
import type { TicketZustand } from '@/server/actions/tickets';

type Aktion = (vorher: TicketZustand, fd: FormData) => Promise<TicketZustand>;

/**
 * Kommentar im Verlauf eines Tickets. „Intern“ ist vorbelegt: Der Standard ist der Schutz der Angaben (G-07), wer den
 * Kommentar nicht intern machen will, nimmt das Häkchen bewusst weg.
 */
export function KommentarFormular({ aktion, id }: { aktion: Aktion; id: string }) {
  const t = useTranslations('verwaltung.tickets');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const meldungRef = useRef<HTMLDivElement>(null);
  const basisId = useId();
  const feldId = (feld: string) => `${basisId}-${feld}`;
  const roh = zustand.werte;
  const text = typeof roh?.text === 'string' ? roh.text : '';
  const intern = roh ? roh.intern === 'on' : true;
  const textFehler = zustand.feldFehler?.text;

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
          <Meldung art="erfolg">{t('kommentiert')}</Meldung>
        ) : null}
      </div>
      <input type="hidden" name="id" value={id} />
      <Rahmen
        id={feldId('text')}
        label={t('kommentar.text')}
        pflicht={t('formular.pflichtfeld')}
        fehler={textFehler ? t(`fehler.${textFehler}`) : undefined}
        kinder={(aria) => (
          <textarea {...aria} name="text" rows={4} required maxLength={2000} defaultValue={text} className={cn(eingabe, 'py-2.5')} />
        )}
      />
      <label className="flex min-h-12 cursor-pointer items-center gap-3 font-bold">
        <input type="checkbox" name="intern" defaultChecked={intern} className="size-6 accent-gruen-700" />
        {t('kommentar.intern')}
      </label>
      <p className="text-16 text-tinte-2">{t('kommentar.internHinweis')}</p>
      <Button type="submit" disabled={laeuft} className="self-start">
        <Save aria-hidden />
        {laeuft ? t('kommentar.speichert') : t('kommentar.speichern')}
      </Button>
    </form>
  );
}
