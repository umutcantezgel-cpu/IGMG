'use client';

import { CircleCheck, Undo2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { cn } from '@/lib/utils';
import type { FreigabeZustand } from '@/server/actions/freigaben';

type Aktion = (vorher: FreigabeZustand, fd: FormData) => Promise<FreigabeZustand>;

/**
 * Entscheidung zu einem Inhalt in der Freigabe-Warteschlange (ADR 0030): Kommentar und zwei große Knöpfe. Beim
 * Zurückweisen ist der Kommentar Pflicht (prüft die Action). Nach der Entscheidung steht die Rückmeldung an derselben
 * Stelle und bekommt den Fokus.
 */
export function FreigabeEntscheidung({
  aktion,
  inhaltTyp,
  inhaltId,
  titel,
}: {
  aktion: Aktion;
  inhaltTyp: string;
  inhaltId: string;
  titel: string;
}) {
  const t = useTranslations('verwaltung.freigaben');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const id = useId();
  const meldung = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (zustand.fehler || zustand.erledigt) meldung.current?.focus();
  }, [zustand]);

  if (zustand.erledigt && zustand.entscheidung)
    return (
      <div ref={meldung} tabIndex={-1} className="outline-none">
        <Meldung art="erfolg">{t(`erledigt.${zustand.entscheidung}`)}</Meldung>
      </div>
    );

  const kommentarFehler = zustand.feldFehler?.kommentar ? t(`fehler.${zustand.feldFehler.kommentar}`) : undefined;
  return (
    <form action={absenden} className="flex flex-col gap-3">
      <div ref={meldung} tabIndex={-1} className="outline-none">
        {zustand.fehler && zustand.fehler !== 'pruefen' ? <Meldung art="fehler">{t(`fehler.${zustand.fehler}`)}</Meldung> : null}
      </div>
      <input type="hidden" name="inhaltTyp" value={inhaltTyp} />
      <input type="hidden" name="inhaltId" value={inhaltId} />
      <Rahmen
        id={`${id}-kommentar`}
        label={t('kommentar')}
        hinweis={t('kommentarHinweis')}
        fehler={kommentarFehler}
        kinder={(aria) => <textarea {...aria} name="kommentar" rows={2} maxLength={1000} className={cn(eingabe, 'py-2.5')} />}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="entscheidung" value="freigeben" disabled={laeuft} aria-label={t('freigebenName', { titel })}>
          <CircleCheck aria-hidden />
          {t('freigeben')}
        </Button>
        <Button
          type="submit"
          name="entscheidung"
          value="zurueckweisen"
          variant="outline"
          disabled={laeuft}
          aria-label={t('zurueckweisenName', { titel })}
        >
          <Undo2 aria-hidden />
          {t('zurueckweisen')}
        </Button>
      </div>
    </form>
  );
}
