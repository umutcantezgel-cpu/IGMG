'use client';

import { Copy, Eye, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { VorschauZustand } from '@/server/actions/seiten';

type Aktion = (vorher: VorschauZustand, fd: FormData) => Promise<VorschauZustand>;

const zeit = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });

/**
 * Signierte Vorschau (ADR 0032): erzeugt einen Link, der 24 Stunden gilt und die Seite im gespeicherten Stand zeigt –
 * auch ohne Anmeldung (z. B. für den Vorstand). Kopieren über die Zwischenablage, Ansage über eine Live-Region.
 */
export function VorschauKnopf({ aktion, id }: { aktion: Aktion; id: string }) {
  const t = useTranslations('verwaltung.seiten.vorschau');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const [kopiert, setKopiert] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const url = zustand.url && typeof window !== 'undefined' ? new URL(zustand.url, window.location.origin).toString() : zustand.url;

  useEffect(() => {
    if (zustand.url) linkRef.current?.focus();
    setKopiert(false);
  }, [zustand]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4 md:p-5">
      <form action={absenden} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="secondary" disabled={laeuft}>
          <Eye aria-hidden />
          {t('knopf')}
        </Button>
        <p className="max-w-einleitung text-16 text-tinte-2">{t('hinweis')}</p>
      </form>
      <div role="status" className="flex flex-col gap-2">
        {zustand.fehler ? <p className="font-bold text-fehler">{t(`fehler.${zustand.fehler}`)}</p> : null}
        {zustand.url && url ? (
          <>
            <p className="text-16">{t('erzeugt', { zeit: zeit.format(new Date(zustand.gueltigBis ?? Date.now())) })}</p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                ref={linkRef}
                href={zustand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 font-bold underline underline-offset-4"
              >
                {t('oeffnen')}
                <ExternalLink aria-hidden className="size-4" />
              </a>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(url);
                    setKopiert(true);
                  } catch {
                    setKopiert(false);
                  }
                }}
              >
                <Copy aria-hidden />
                {kopiert ? t('kopiert') : t('kopieren')}
              </Button>
            </div>
            <code className="block rounded-md bg-sand px-3 py-2 text-16 break-all">{url}</code>
          </>
        ) : null}
      </div>
    </div>
  );
}
