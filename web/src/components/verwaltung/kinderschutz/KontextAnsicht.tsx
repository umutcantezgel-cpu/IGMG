'use client';

import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { type KontextErgebnis, meldungsKontextLaden, nachrichtEntfernen } from '@/server/actions/kinderschutz';
import { GrundFormular } from './GrundFormular';

const zeitFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Berlin' });

/**
 * S-11: Der Kontext einer Meldung (gemeldete Nachricht ±10) erscheint erst nach ausdrücklichem Klick – nie beim
 * Laden der Seite oder durch Vorabruf. Jede Einsicht steht im Moderationsprotokoll. Nachrichten lassen sich mit Grund
 * entfernen (S-09); der Text bleibt danach nur in diesem gesicherten Kontext der Meldung.
 */
export function KontextAnsicht({ meldungId, darfBearbeiten }: { meldungId: string; darfBearbeiten: boolean }) {
  const t = useTranslations('verwaltung.kinderschutz');
  const [ergebnis, setErgebnis] = useState<KontextErgebnis | null>(null);
  const [laeuft, starte] = useTransition();
  const listeRef = useRef<HTMLDivElement>(null);

  function laden() {
    starte(async () => {
      const e = await meldungsKontextLaden(meldungId);
      setErgebnis(e);
      requestAnimationFrame(() => listeRef.current?.focus());
    });
  }

  if (!ergebnis || !('ok' in ergebnis))
    return (
      <div className="flex flex-col gap-3">
        {ergebnis && 'fehler' in ergebnis && ergebnis.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${ergebnis.fehler}`)}</p>
          </Meldung>
        ) : null}
        <p className="text-16 text-tinte-2">{t('kontext.hinweis')}</p>
        <Button type="button" variant="outline" onClick={laden} disabled={laeuft} className="self-start">
          <Eye aria-hidden />
          {laeuft ? t('laeuft') : t('kontext.anzeigen')}
        </Button>
      </div>
    );

  return (
    <div ref={listeRef} tabIndex={-1} className="flex flex-col gap-4 outline-none">
      {ergebnis.freitext ? (
        <div className="rounded-md border border-linie bg-sand p-4">
          <p className="text-16 font-bold">{t('kontext.freitext')}</p>
          <p className="wrap-anywhere">{ergebnis.freitext}</p>
        </div>
      ) : null}
      <ol aria-label={t('kontext.liste')} className="flex flex-col gap-2">
        {ergebnis.kontext.map((n) => (
          <li
            key={n.id}
            className={n.gemeldet ? 'rounded-md border-2 border-fehler bg-weiss p-4' : 'rounded-md border border-linie bg-weiss p-4'}
          >
            <p className="flex flex-wrap gap-x-3 text-16 text-tinte-2">
              <span className="font-bold text-tinte">{n.name || t('kontext.unbekannt')}</span>
              <span className="tabular-nums">{zeitFormat.format(new Date(n.zeit))}</span>
              {n.gemeldet ? <span className="font-bold text-fehler">{t('kontext.gemeldet')}</span> : null}
            </p>
            <p className="wrap-anywhere whitespace-pre-line">{n.text}</p>
            {darfBearbeiten ? (
              <details className="mt-2">
                <summary className="min-h-12 cursor-pointer content-center font-bold text-gruen-800">{t('aktion.entfernen')}</summary>
                <GrundFormular
                  aktion={nachrichtEntfernen}
                  felder={{ nachrichtId: String(n.id) }}
                  knopf={t('aktion.entfernenKnopf')}
                  gefahr
                />
              </details>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
